import Phaser from "../../lib/phaser.js";
import { ATTACK_ASSET_KEYS } from "../../assets/asset-key.js";
import { Attack } from "./attack.js";

export class IceShard extends Attack {
  /**
   * @protected @type {Phaser.GameObjects.Sprite}
   */
  _attackGameObject;
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
    this._scene.anims.create({
      key: ATTACK_ASSET_KEYS.ICE_SHARD,
      /**
       * generateFrameNumber creates frames that are needed for the animation. for example, 0-5 is generated since there
       * are only 5 frames in the sprite sheet asset
       */
      frames: this._scene.anims.generateFrameNumbers(
        ATTACK_ASSET_KEYS.ICE_SHARD
      ),
      frameRate: 8,
      repeat: 0,
      delay: 0,
    });
    this._scene.anims.create({
      key: ATTACK_ASSET_KEYS.ICE_SHARD_START,
      /**
       * generateFrameNumber creates frames that are needed for the animation. for example, 0-5 is generated since there
       * are only 5 frames in the sprite sheet asset
       */
      frames: this._scene.anims.generateFrameNumbers(
        ATTACK_ASSET_KEYS.ICE_SHARD_START
      ),
      frameRate: 8,
      repeat: 0,
      delay: 0,
    });
    // create game objects
    /**
     * sprite sheet we can state which texture we can use from the sprite sheet, if we dont specify it will be 0 ( we specified 5)
     */
    this._attackGameObject = this._scene.add
      .sprite(
        this._position.x,
        this._position.y,
        ATTACK_ASSET_KEYS.ICE_SHARD,
        5
      )
      .setOrigin(0.5)
      .setScale(4)
      .setAlpha(0);
  }

  /**
   *
   * @param {()=> void} [callback]
   * @returns {void}
   */
  playAnimation(callback) {
    // want to return if the animation is playing as we only want to play it when there are no animations
    if(this._isAnimationPlaying) return

    this._isAnimationPlaying = true
    this._attackGameObject.setAlpha(1)

    this._attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD_START)
    /**
     * code below checks if the ice shard start animation has completed and when it does, it will call a callback
     */
    this._attackGameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD_START, () => {
        this._attackGameObject.play(ATTACK_ASSET_KEYS.ICE_SHARD)
    })
    this._attackGameObject.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ATTACK_ASSET_KEYS.ICE_SHARD, () => {
        this._isAnimationPlaying = false
        // setFrame(0) resets the frame to the initial index 
        this._attackGameObject.setAlpha(0).setFrame(0)

        if(callback) callback()
    })
  }
}
