import { DATA_ASSET_KEYS } from "../assets/asset-key.js";

export class DataUtils {
  /**
   * 
   * @param {Phaser.Scene} scene phaser 3 scene to get cached json file from
   * @param {number} attackId the id of the attack to retrieve from the attack.json file 
   * @returns {import("../types/typedef").Attack | undefined}
   */
  static getMonsterAttack(scene, attackId) {
    /**
     * @type {import("../types/typedef").Attack[]}
     */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ATTACKS);
    return data.find((attack) => attack.id === attackId)
  }

  /**
   * Utility function for retrieving the animation objects from the animations.json data file.
   * @param {Phaser.Scene} scene the Phaser 3 scene to get cached JSON file from 
   * @returns {import("../types/typedef").Animation[]}
   */
  static getAnimations(scene){
    /**
     * @type {import("../types/typedef").Animation[]}
     */
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data
  }
}
