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
   *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
   #leftShadowCap;
   /**
    *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
    */
   #middleShadow;
   /**
    *@type {Phaser.GameObjects.Image} doing this gives the scene the Phaser.scene functions with vscode intellisense
    */
   #rightShadowCap;
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
    this.#createHealthBarShadowImages(x,y)
    this.#createHealthBar(x, y);
    this.#setMeterPecentage(1)
    // this.setMeterPercentageAnimated(0.5, {duration: 4000})
  }

  get container() {
    return this.#healthBarContainer;
  }
  /**
   *
   * @param {number} x the x position to place the healthbar game object
   * @param {number} y the y position to place the healthbar game object
   * @returns {void}
   */
  #createHealthBarShadowImages(x,y){
    this.#leftShadowCap = this.#scene.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);
    this.#middleShadow = this.#scene.add
      .image(this.#leftShadowCap.x + this.#leftShadowCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);
    //stretches the health bar
    this.#middleShadow.displayWidth = this.#fullWidth
    this.#rightShadowCap = this.#scene.add
      .image(this.#middleShadow.x + this.#middleShadow.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftShadowCap, this.#middleShadow, this.#rightShadowCap]);
  }

  /**
   *
   * @param {number} x the x position to place the healthbar game object
   * @param {number} y the y position to place the healthbar game object
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
    this.#rightCap = this.#scene.add
      .image(this.#middle.x + this.#middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, this.#scaleY);

    this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap]);
  }

  /**
   * 
   * @param {number} [percent=1] a number between 0 and 1 that is used for setting
   * how filled the healthbar is 
   */
  #setMeterPecentage(percent = 1) {
    const width = this.#fullWidth * percent;

    this.#middle.displayWidth = width;
    this.#rightCap.x = this.#middle.x + this.#middle.displayWidth
  }

  /**
   * 
   * @param {number} [percent=1] a number between 0 and 1 that is used for setting
   * how filled the healthbar is 
   * @param {Object} [options] 
   * @param {number} [options.duration=1000] 
   * @param {()=>void} [options.callback] 
   */
  setMeterPercentageAnimated(percent, options){
    const width = this.#fullWidth * percent;
    /**
     * tween is a Phaser way to manipulate property on game objects
     * what is cool is allowing to use easing functions to manipulate
     * values over a set period of time. An example of easing functions is simply
     * an example of an exponential chart where it starts
     * slow and can rack up quickly
     * 
     * How tween works is apply easing functions to the property.
     * In this code example, referencing the target is the game
     * object that we want to update, and we will provide one
     * or more properties we want to update which is displaywidth
     * over a duration
     */
    this.#scene.tweens.add({
      targets: this.#middle,
      displayWidth: width,
      duration: options?.duration || 1000,
      ease: Phaser.Math.Easing.Sine.Out,
      /**
       * onupdate provides a callback whenever there is a tick to update
       * Because rightcap is dependent on middle value, we must add it
       * into the onUpdate call function
       */
      onUpdate: () => {
        this.#rightCap.x = this.#middle.x + this.#middle.displayWidth
        const isVisible = this.#middle.displayWidth > 0;
        this.#leftCap.visible = isVisible
        this.#middle.visible = isVisible
        this.#rightCap.visible = isVisible

      },
      //provide a callback when the tween is completed
      onComplete: options?.callback,
    })
  }
}
