import { CHARACTER_ASSET_KEYS } from "../../assets/asset-key.js";
import { DIRECTION } from "../../common/direction.js";
import { exhaustiveGuard } from "../../utils/guard.js";
import { Character } from "./character.js";

/**
 * @typedef NPCConfigProps
 * @type {object}
 * @property {number} frame
 * @property {string[]} messages
 */

/**
 * @typedef {Omit<import('./character').CharacterConfig, 'assetKey' | 'idleFrameConfig'> & NPCConfigProps} NpcConfig
 */

export class NPC extends Character {
  /**
   * @type {string[]}
   */
  #messages;
  /**
   * @type {boolean}
   */
  #talkingToPlayer;
  /**
   *
   * @param {NpcConfig} config
   */
  constructor(config) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.NPC,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });
    this._phaserGameObject.setScale(4);
    this.#messages = config.messages;
    this.#talkingToPlayer = false;
  }

  /**
   *
   * @returns {string[]}
   */
  get messages() {
    return [...this.#messages];
  }

  /**
   *
   * @returns {boolean}
   */
  get isTalkingToPlayer() {
    return this.#talkingToPlayer;
  }

  /**
   * @param {boolean} val
   */
  set isTalkingToPlayer(val) {
    this.#talkingToPlayer = val;
  }

  /**
   *
   * @param {import("../../common/direction.js").Direction} playerDirection
   * @returns {void}
   */
  facePlayer(playerDirection) {
    switch (playerDirection) {
      case DIRECTION.DOWN:
        this._phaserGameObject
          .setFrame(this._idleFrameConfig.UP)
          .setFlipX(false);
        break;
      case DIRECTION.LEFT:
        this._phaserGameObject
          .setFrame(this._idleFrameConfig.RIGHT)
          .setFlipX(false);
        break;
      case DIRECTION.RIGHT:
        this._phaserGameObject
          .setFrame(this._idleFrameConfig.LEFT)
          .setFlipX(true);
        break;
      case DIRECTION.UP:
        this._phaserGameObject
          .setFrame(this._idleFrameConfig.DOWN)
          .setFlipX(false);
        break;
      case DIRECTION.NONE:
        break;
      default:
        exhaustiveGuard(playerDirection);
    }
  }
}
