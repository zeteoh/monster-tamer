import { BATTLE_BACKGROUND_ASSET_KEYS } from "../assets/asset-key.js";
import Phaser from "../lib/phaser.js";
export class Background {
  /**
   *@type {Phaser.Scene} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #scene;
  /**
   *@type {Phaser.GameObjects.Image}
   */
  #backgroundGameObject;
  /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to
   */
  constructor(scene) {
    this.#scene = scene;
    this.#backgroundGameObject = this.#scene.add
      .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setOrigin(0)
      .setAlpha(0);
  }

  showForest() {
    this.#backgroundGameObject
      .setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setAlpha(1);
  }
}
