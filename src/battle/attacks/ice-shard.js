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
}
