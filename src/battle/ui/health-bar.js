import { HEALTH_BAR_ASSET_KEYS } from "../../assets/asset-key.js";
import Phaser from "../../lib/phaser.js";

export class HealthBar {
  /**
   *@type {Phaser.Scene} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #scene;
  /**
   *@type {Phaser.GameObjects.Container} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #healthBarContainer;
  /**
   *@type {number}
   */
  #fullWidth;
  /**
   *@type {number}
   */
  #scaleY;
  /**
   *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #leftCap;
  /**
   *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #middle;
  /**
   *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #rightCap;
  /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.#scene = scene;
    this.#fullWidth = 360;
    this.#scaleY = 0.7;
    this.#healthBarContainer = this.#scene.add.container(x, y, []);
    this.#createHealthBar(x, y);
    this.#setMeterPecentage(1)
  }

  get container() {
    return this.#healthBarContainer;
  }

  /**
   *
   * @param {number} x the x position to place the healthbar contianer
   * @param {number} y the y position to place the healthbar contianer
   * @returns {void}
   */
  #createHealthBar(x, y) {
    this.#leftCap = this.#scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);
    this.#middle = this.#scene.add
      .image(this.#leftCap.x + this.#leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);
    //stretches the health bar
    this.#middle.displayWidth = 360;
    this.#rightCap = this.#scene.add
      .image(this.#middle.x + this.#middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap]);
  }

  #setMeterPecentage(percent = 1) {
    const width = this.#fullWidth * percent;

    this.#middle.displayWidth = width;
    this.#rightCap.x = this.#middle.x + this.#middle.displayWidth
  }
}
