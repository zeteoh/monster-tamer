import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { WORLD_ASSET_KEYS } from "../assets/asset-key.js";
import { Player } from "../world/characters/player.js";
import { Controls } from "../utils/controls.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE } from "../config.js";

/**
 * @type {import("../types/typedef.js").Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
  x: 6 * TILE_SIZE,
  y: 21 * TILE_SIZE,
});

export class WorldScene extends Phaser.Scene {
  /**
   * @type {Player}
   */
  #player;
  /**
   * @type {Controls}
   */
  #controls;
  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
      //adding active: true can tell the phaser manager to start the scene without being called from the main.js
    });
  }

  create() {
    console.log(`[${WorldScene.name}:preload] invoked`);
    const x = 6 * TILE_SIZE;
    const y = 22 * TILE_SIZE;
    // set boundaries so that it wont go out of the map, allows us
    // to provide the top left coordinate of the bounding box
    // 3rd and 4th parameter is the width and height of the bounding box
    this.cameras.main.setBounds(0, 0, 1280, 2176);
    this.cameras.main.setZoom(0.8);
    this.cameras.main.centerOn(x, y);

    // 0,0 for top left hand corner
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
    this.#player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
    });
    // camera should move to follow player
    this.cameras.main.startFollow(this.#player.sprite);
    this.#controls = new Controls(this);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time) {
    /**
     * check to see if the button is being held down, if it is,
     * move the character
     */
    const selectedDirection = this.#controls.getDirectionKeyJustPressed();
    if (selectedDirection !== DIRECTION.NONE) {
      this.#player.moveCharacter(selectedDirection);
    }
    this.#player.update(time);
  }
}
