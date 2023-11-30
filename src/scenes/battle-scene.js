import { BATTLE_BACKGROUND_ASSET_KEYS, MONSTER_ASSET_KEYS } from "../assets/asset-key.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";

export class BattleScene extends Phaser.Scene {
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
    console.log(`[${BattleScene.name}:create] invoked`)
    this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0)
    this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true)

  }
}
