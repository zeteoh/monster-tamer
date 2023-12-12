import { DIRECTION } from "../../common/direction.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/grid-utils.js";
/**
 * @typedef CharacterConfig
 * @type {object}
 * @property {Phaser.Scene} scene
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {import("../../types/typedef").Coordinate} position
 * @property {import("../../common/direction.js").Direction} direction
 * @property {()=>void} [spriteGridMovementFinishedCallback]
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
   * @type {import("../../common/direction.js").Direction}
   */
  _direction;
  /**
   * @type {boolean} ismoving is used to check
   * whether the character is still moving and if the character
   * is moving, no user input can be registered until the animation
   * completes
   */
  _isMoving;
  /**
   * @type {import("../../types/typedef").Coordinate} tracking where the player
   * is moving to. For example, if i want to press the right key,
   * will check the right position
   */
  _targetPosition;
  /**
   * @type {import("../../types/typedef").Coordinate} used for checking if
   * player moving is interrupted. used to know where they were
   * previously targetting
   */
  _previousTargetPosition;
  /**
   * @type {() => void | undefined}
   */
  _spriteGridMovementFinishedCallback;
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
    this._phaserGameObject = this._scene.add
      .sprite(
        config.position.x,
        config.position.y,
        config.assetKey,
        config.assetFrame || 0
      )
      .setOrigin(0);
    this._spriteGridMovementFinishedCallback =
      config.spriteGridMovementFinishedCallback;
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
    // switch (direction) {
    //   case DIRECTION.DOWN:
    //     this._phaserGameObject.y += TILE_SIZE;
    //     break;
    //   case DIRECTION.UP:
    //     this._phaserGameObject.y -= TILE_SIZE;
    //     break;
    //   case DIRECTION.LEFT:
    //     this._phaserGameObject.x -= TILE_SIZE;
    //     break;
    //   case DIRECTION.RIGHT:
    //     this._phaserGameObject.x += TILE_SIZE;
    //     break;
    //   case DIRECTION.NONE:
    //     break;
    //   default:
    //     exhaustiveGuard(direction);
    // }
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
        this._isMoving = false
        this._previousTargetPosition = {...this._targetPosition}
        if(this._spriteGridMovementFinishedCallback){
          this._spriteGridMovementFinishedCallback()
        }
      },
    });
  }
}
