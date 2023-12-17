import Phaser from "../lib/phaser.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE } from "../config.js";

/**
 * @typedef GlobalState
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {number} player.position.x
 * @property {number} player.position.y
 * @property {import("../common/direction.js").Direction} player.direction
 */

/**
 * @type {GlobalState}
 */
const initialState = {
    player: {
        position: {
            x: 6 * TILE_SIZE,
            y: 21 * TILE_SIZE
        },
        direction: DIRECTION.DOWN
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    PLAYER_POSITION: 'PLAYER_POSITION',
    PLAYER_DIRECTION: 'PLAYER_DIRECTION'
})

class DataManager extends Phaser.Events.EventEmitter {
  /**
   * @type {Phaser.Data.DataManager}
   */
  #store;
  constructor() {
    super();
    /**
     * to call Phaser.Data.DataManager, we must extend the
     * Phaser.Events.EventEmitter class. This is because
     * events are emitted when data is set or updated in the
     * data manager instance and we can listen to it to check
     */
    this.#store = new Phaser.Data.DataManager(this);
    this.#updateDataManager(initialState)
  }

  /**
   * @type {Phaser.Data.DataManager}
   */
  get store() {
    return this.#store;
  }

  /**
   * 
   * @param {GlobalState} data 
   * @returns {void}
   */
  #updateDataManager(data){
    // can pass in an object of key value pairs
    this.#store.set({
        [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION] : data.player.position,
        [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION] : data.player.direction
    })
  }
}

/**
 * instantiate dataManager here so that it acts as a singleton 
 * class
 */
export const dataManager = new DataManager()