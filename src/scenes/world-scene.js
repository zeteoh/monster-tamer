import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { WORLD_ASSET_KEYS } from "../assets/asset-key.js";
import { Player } from "../world/characters/player.js";
import { Controls } from "../utils/controls.js";
import { DIRECTION } from "../common/direction.js";
import { TILED_COLLISION_LAYER_ALPHA, TILE_SIZE } from "../config.js";

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

    // will create a tilemap instance and basically a tilemap is just
    // a container for all tilemap data. It doesnt create any object
    // in the scene. Add utility method for working with tilemap that is parsed in
    // can do collission layers with this tilemap
    // can add spritesheets in the tilesets to make world scene
    const map = this.make.tilemap({
      key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
    });
    // provide name of the tileset that is needed to match the tileset that is used in level.json file
    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEYS.WORLD_COLLISION)
    if (!collisionTiles) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision tileset using data from tiled`
      );
      return
    }
    // the tag Collision below is the name of the map in the level.json file
    // basically matches the name in the json file
    const collisionLayer = map.createLayer("Collision", collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision layer using data from tiled`
      );
      return
    }
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2)
    // 0,0 for top left hand corner
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
    this.#player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      collisionLayer: collisionLayer,
    });
    // camera should move to follow player
    this.cameras.main.startFollow(this.#player.sprite);

    // add in foreground, giving the game an extra depth
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

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
