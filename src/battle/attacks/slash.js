import Phaser from "../../lib/phaser.js";
import { ATTACK_ASSET_KEYS } from "../../assets/asset-key.js";
import { Attack } from "./attack.js";

export class Slash extends Attack {
  /**
   * the attack gameobject is a container that holds three sprites,
   * specifically, the 3 frames of slash attack, namely
   * attackobject1, attackobject2, attackobject3
   */
  /**
   * @protected @type {Phaser.GameObjects.Container}
   */
  _attackGameObject;
  /**
   * @protected @type {Phaser.GameObjects.Sprite}
   */
  _attackGameObject1;
  /**
   * @protected @type {Phaser.GameObjects.Sprite}
   */
  _attackGameObject2;
  /**
   * @protected @type {Phaser.GameObjects.Sprite}
   */
  _attackGameObject3;

  /**
   *
   * @param {Phaser.Scene} scene
   * @param {import("../../types/typedef").Coordinate} position
   */
  constructor(scene, position) {
    super(scene, position);

    // create animations
    /**
     * anims create a new animation and stores in the cache so that we can play it later when we reference the sprite object
     */
    // create game sprite slash attacks
    /**
     * first frame of slash attack game object, the first two position
     * values are 0 because its relative to the container and not the
     * absolute position
     */
    this._attackGameObject1 = this._scene.add
      .sprite(0, 0, ATTACK_ASSET_KEYS.SLASH, 0)
      .setOrigin(0.5)
      .setScale(4);
    this._attackGameObject2 = this._scene.add
      .sprite(30, 0, ATTACK_ASSET_KEYS.SLASH, 0)
      .setOrigin(0.5)
      .setScale(4);
    this._attackGameObject3 = this._scene.add
      .sprite(-30, 0, ATTACK_ASSET_KEYS.SLASH, 0)
      .setOrigin(0.5)
      .setScale(4);

    this._attackGameObject = this._scene.add
      .container(this._position.x, this._position.y, [
        this._attackGameObject1,
        this._attackGameObject2,
        this._attackGameObject3,
      ])
      .setAlpha(0);
  }

  /**
   *
   * @param {()=> void} [callback]
   * @returns {void}
   */
  playAnimation(callback) {
    // want to return if the animation is playing as we only want to play it when there are no animations
    if (this._isAnimationPlaying) return;

    this._isAnimationPlaying = true;
    this._attackGameObject.setAlpha(1);

    this._attackGameObject1.play(ATTACK_ASSET_KEYS.SLASH);
    this._attackGameObject2.play(ATTACK_ASSET_KEYS.SLASH);
    this._attackGameObject3.play(ATTACK_ASSET_KEYS.SLASH);

    this._attackGameObject1.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.SLASH,
      () => {
        this._isAnimationPlaying = false;
        this._attackGameObject.setAlpha(0);
        this._attackGameObject1.setFrame(0);
        this._attackGameObject2.setFrame(0);
        this._attackGameObject3.setFrame(0);

        if (callback) {
            callback();
        }
      }
    );
  }
}
