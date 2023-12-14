import { DIRECTION } from "../../common/direction.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/grid-utils.js";
import { exhaustiveGuard } from "../../utils/guard.js";
/**
 * @typedef CharacterIdleFrameConfig
 * @type {object}
 * @property {number} LEFT
 * @property {number} RIGHT
 * @property {number} UP
 * @property {number} DOWN
 * @property {number} NONE
 */
/**
 * @typedef CharacterConfig
 * @type {object}
 * @property {Phaser.Scene} scene Phaser 3 scene the battle menu will be added to
 * @property {string} assetKey the name of the assset key that should be used for this character
 * @property {import("../../types/typedef").Coordinate} [origin={x:0, y:0}]
 * @property {import("../../types/typedef").Coordinate} position the starting position of the character
 * @property {import("../../common/direction.js").Direction} direction the direction of the character is currently facing
 * @property {()=>void} [spriteGridMovementFinishedCallback] an optional callback that will be called
 * @property {CharacterIdleFrameConfig} idleFrameConfig
 */

export class Character {
  /**
   * @type {Phaser.Scene}
   */
  _scene;
  /**
   * @type {Phaser.GameObjects.Sprite}
   */
  _phaserGameObject;
  /**
   *@protected @type {import("../../common/direction.js").Direction}
   */
  _direction;
  /**
   *@protected @type {boolean} ismoving is used to check
   * whether the character is still moving and if the character
   * is moving, no user input can be registered until the animation
   * completes
   */
  _isMoving;
  /**
   *@protected @type {import("../../types/typedef").Coordinate} tracking where the player
   * is moving to. For example, if i want to press the right key,
   * will check the right position
   */
  _targetPosition;
  /**
   *@protected @type {import("../../types/typedef").Coordinate} used for checking if
   * player moving is interrupted. used to know where they were
   * previously targetting
   */
  _previousTargetPosition;
  /**
   *@protected @type {() => void | undefined}
   */
  _spriteGridMovementFinishedCallback;
  /**
   *@protected @type {CharacterIdleFrameConfig}
   */
  _idleFrameConfig;
  /**
   *@protected @type {import("../../types/typedef").Coordinate}
   */
  _origin;
  /**
   *
   * @param {CharacterConfig} config
   */
  constructor(config) {
    this._scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._idleFrameConfig = config.idleFrameConfig;
    this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
    this._phaserGameObject = this._scene.add
      .sprite(
        config.position.x,
        config.position.y,
        config.assetKey,
        this._getIdleFrame()
      )
      .setOrigin(this._origin.x, this._origin.y);
    this._spriteGridMovementFinishedCallback =
      config.spriteGridMovementFinishedCallback;
  }

  /**
   * @type {Phaser.GameObjects.Sprite}
   */
  get sprite() {
    return this._phaserGameObject;
  }
  /**
   * @type {boolean}
   */
  get isMoving() {
    return this._isMoving;
  }
  /**
   * @type {import("../../common/direction.js").Direction}
   */
  get direction() {
    return this._direction;
  }

  /**
   *
   * @param {import("../../common/direction").Direction} direction
   */
  moveCharacter(direction) {
    // if the character is moving, just return early
    if (this._isMoving) return;
    this._moveSprite(direction);
  }

  /**
   *
   * @param {import("../../common/direction").Direction} direction
   */
  _moveSprite(direction) {
    this._direction = direction;
    // if the block is blocking in the direction we are facing, return
    if (this._isBlockingTile()) return;
    // set the moving to true if not blocking
    this._isMoving = true;
    this.#handleSpriteMovement();
  }

  _isBlockingTile() {
    if (this._direction === DIRECTION.NONE) return;

    // TODO: add in collision logic
    return false;
  }

  /**
   *
   * @param {DOMHighResTimeStamp} time time is when the last frame render was completed, used this
   * to track such that we can move it every x seconds instead of every frame
   * @returns {void}
   */
  update(time) {
    if (this._isMoving) {
      return;
    }
    console.log();
    // middle frame in the currentanim from the json file is always the idle frame
    const idleFrame =
      this._phaserGameObject.anims.currentAnim?.frames[1].frame.name;
    this._phaserGameObject.anims.stop();
    if (!idleFrame) return;
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this._phaserGameObject.setFrame(idleFrame);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(this._direction);
    }
  }

  _getIdleFrame() {
    return this._idleFrameConfig[this._direction];
  }

  #handleSpriteMovement() {
    if (this._direction === DIRECTION.NONE) return;

    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      this._targetPosition,
      this._direction
    );
    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = updatedPosition.x;
    this._targetPosition.y = updatedPosition.y;

    this._scene.add.tween({
      delay: 0,
      duration: 800,
      // y property is the target here
      y: {
        from: this._phaserGameObject.y,
        start: this._phaserGameObject.y,
        to: this._targetPosition.y,
      },
      x: {
        from: this._phaserGameObject.x,
        start: this._phaserGameObject.x,
        to: this._targetPosition.x,
      },
      //affects the phaser game object
      targets: this._phaserGameObject,
      onComplete: () => {
        this._isMoving = false;
        this._previousTargetPosition = { ...this._targetPosition };
        if (this._spriteGridMovementFinishedCallback) {
          this._spriteGridMovementFinishedCallback();
        }
      },
    });
  }
}
