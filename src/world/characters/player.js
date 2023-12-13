import { CHARACTER_ASSET_KEYS } from "../../assets/asset-key.js";
import { DIRECTION } from "../../common/direction.js";
import { exhaustiveGuard } from "../../utils/guard.js";
import { Character } from "./character.js";

/**
 * @typedef {Omit<import('./character').CharacterConfig, 'assetKey' | 'assetFrame'>} PlayerConfig
 */

export class Player extends Character {
  /**
   *
   * @param {PlayerConfig} config
   */
  constructor(config) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.PLAYER,
      assetFrame: 7,
    });
  }

  /**
   *
   * @param {import("../../common/direction").Direction} direction
   */
  moveCharacter(direction) {
    super.moveCharacter(direction);

    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        // isplaying checks if the animation is playing (set to true for sprite)
        // check if currentanim is playing, if a different direction key
        // is pressed, we will play a new animation. if the same key is pressed,
        // we dont play a new animation
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !==
            `PLAYER_${this.direction}`
        ) {
          this._phaserGameObject.play(`PLAYER_${this._direction}`);
        }
        break;
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(this._direction)
    }
  }
}
