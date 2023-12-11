import { CHARACTER_ASSET_KEYS } from "../../assets/asset-key.js";
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
}
