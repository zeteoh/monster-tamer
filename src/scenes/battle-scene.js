import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
} from "../assets/asset-key.js";
import { BattleMenu } from "../battle/ui/menu/battle-menu.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";

export class BattleScene extends Phaser.Scene {
  /**
   * @type {BattleMenu}
   */
  #battleMenu;
  /**
   * @type {Phaser.Types.Input.Keyboard.CursorKeys}
   */
  #cursorKeys
  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
      //adding active: true can tell the phaser manager to start the scene without being called from the main.js
    });
  }

  create() {
    /**
     * @IMPORTANT phaser will render the image in the order it is placed, so always rendere the background image first
     * alternatively, can set depth value so that we can change the z value between images, somewhat like the z value in css
     */
    //look for the background image in the preloader cache by referencing the key
    this.textures.get("background");
    /**
     * this.add references phaser 3 scene game factory
     * image game object is for displaying static scene which is perfect for background
     * @argumentOne - x position of the image where positive x value means object moves to the right
     * @argumentTwo - y position of the image where a positive y value signifies position downwards
     * @setOrigin - setting 0 means that the object is placed in the middle. TLDR, it holds the middle point of the image
     */
    this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
    console.log(`[${BattleScene.name}:create] invoked`);
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
    this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);

    /**
     * using a container, we can move all assets in the container together and package them in a container
     */
    //render out the player health bar
    const playerMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      {
        color: "#7E3D3F",
        fontSize: "32px",
      }
    );
    this.add.container(556, 318, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0),
      playerMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(playerMonsterName.width + 35, 23, "L5", {
        color: "#ED474B",
        fontSize: "28px",
      }),
      this.add.text(30, 55, "HP", {
        color: "#FF6505",
        fontSize: "24px",
        fontStyle: "italic",
      }),
      this.add
        .text(
          443,
          80,
          "25/25",
          {
            color: "#7E3D3F",
            fontSize: "16px",
          }
          //added set origin 1,0 so that it will always align with the health bar
        )
        .setOrigin(1, 0),
    ]);

    //render out the enemy health bar
    const enemyMonsterName = this.add.text(
      30,
      20,
      MONSTER_ASSET_KEYS.CARNODUSK,
      {
        color: "#7E3D3F",
        fontSize: "32px",
      }
    );
    this.add.container(0, 0, [
      this.add
        .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
        .setOrigin(0)
        .setScale(1, 0.8),
      enemyMonsterName,
      this.#createHealthBar(34, 34),
      this.add.text(enemyMonsterName.width + 35, 23, "L5", {
        color: "#ED474B",
        fontSize: "28px",
      }),
      this.add.text(30, 55, "HP", {
        color: "#FF6505",
        fontSize: "24px",
        fontStyle: "italic",
      }),
    ]);
    // render outy main info and sub info panes
    this.#battleMenu = new BattleMenu(this)
    this.#battleMenu.showMainBattleMenu()

    //creates up down left right and shift keys automatically
    this.#cursorKeys = this.input.keyboard.createCursorKeys()
  }

  update(){
    //will only return true one time when the space key is pressed and wont register true when held
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space)
    console.log(this.#cursorKeys.space.isDown)
    if(wasSpaceKeyPressed){
      this.#battleMenu.handlePlayerInput('OK')

      //check if the player selectd an attack, and update display text
      if(this.#battleMenu.selectedAttack === undefined) return
      console.log(this.#battleMenu.selectedAttack)
      console.log(`Player selected the following move: ${this.#battleMenu.selectedAttack}`)
      this.#battleMenu.hideMonsterAtackSubMenu()
      this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(['Your monster attacks the enemy'], ()=>{
        this.#battleMenu.showMainBattleMenu()
      })

      return
    }

    if(Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)){
      this.#battleMenu.handlePlayerInput('CANCEL')
      return
    }

    /**
     * @type {import('../common/direction.js').Direction}
     */
    let selectedDirection = DIRECTION.NONE;
    if(this.#cursorKeys.left.isDown){
      selectedDirection = DIRECTION.LEFT
    }else if(this.#cursorKeys.right.isDown){
      selectedDirection = DIRECTION.RIGHT
    }else if(this.#cursorKeys.up.isDown){
      selectedDirection = DIRECTION.UP
    }else if(this.#cursorKeys.down.isDown){
      selectedDirection = DIRECTION.DOWN
    }

    if(selectedDirection !== DIRECTION.NONE){
      this.#battleMenu.handlePlayerInput(selectedDirection)
    }
  }

  /**
   * 
   * @param {number} x the x position to place the healthbar contianer 
   * @param {number} y the y position to place the healthbar contianer
   * @returns {Phaser.GameObjects.Container} 
   */
  #createHealthBar(x, y) {
    const scaleY = 0.7;
    const leftCap = this.add
      .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);
    const middle = this.add
      .image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);
    //stretches the health bar
    middle.displayWidth = 360;
    const rightCap = this.add
      .image(middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
      .setOrigin(0, 0.5)
      .setScale(1, scaleY);

    return this.add.container(x, y, [leftCap, middle, rightCap]);
  }

}
