import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { WORLD_ASSET_KEYS } from "../assets/asset-key.js";
import { Player } from "../world/characters/player.js";
import { Controls } from "../utils/controls.js";
import { DIRECTION } from "../common/direction.js";
import { TILED_COLLISION_LAYER_ALPHA, TILE_SIZE } from "../config.js";
import { DATA_MANAGER_STORE_KEYS, dataManager } from "../utils/data-manager.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../utils/grid-utils.js";
import { CANNOT_READ_SIGN_TEXT, SAMPLE_TEXT } from "../utils/text-utils.js";
import { DialogUi } from "../world/dialog-ui.js";
import { NPC } from "../world/characters/npc.js";

/**
 * @typedef TiledObjectProperty
 * @type {object}
 * @property {string} name
 * @property {string} type
 * @property {any} value
 */

const TILED_SIGN_PROPERTY = Object.freeze({
  MESSAGE: "MESSAGE",
});

const CUSTOM_TILED_TYPES = Object.freeze({
  NPC: "npc",
  NPC_PATH: "npc_path",
});

const TILED_NPC_PROPERTY = Object.freeze({
  IS_SPAWN_POINT: "is_spawn_point",
  MOVEMENT_PATTERN: "movement_pattern",
  MESSAGES: "messages",
  FRAME: "frame",
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
  /**
   * @type {Phaser.Tilemaps.TilemapLayer}
   */
  #encounterLayer;
  /**
   * @type {boolean}
   */
  #wildMonsterEncountered;
  /**
   * @type {Phaser.Tilemaps.ObjectLayer}
   */
  #signLayer;
  /**
   * @type {DialogUi}
   */
  #dialogUi;
  /**
   * @type {NPC[]}
   */
  #npcs;
  /**
   * @type {NPC | undefined}
   */
  #npcPlayerIsInteractingWith;
  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
      //adding active: true can tell the phaser manager to start the scene without being called from the main.js
    });
  }

  init() {
    console.log(`[${WorldScene.name}:init] invoked`);
    this.#wildMonsterEncountered = false;
    this.#npcPlayerIsInteractingWith = undefined;
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
    const collisionTiles = map.addTilesetImage(
      "collision",
      WORLD_ASSET_KEYS.WORLD_COLLISION
    );
    if (!collisionTiles) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision tileset using data from tiled`
      );
      return;
    }
    // the tag Collision below is the name of the map in the level.json file
    // basically matches the name in the json file
    const collisionLayer = map.createLayer("Collision", collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating collision layer using data from tiled`
      );
      return;
    }
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);

    // create interactive layer
    this.#signLayer = map.getObjectLayer("Sign");
    if (!this.#signLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating sign layer using data from tiled`
      );
      return;
    }

    // provide name of the tileset that is needed to match the tileset that is used in level.json file
    const encounterTiles = map.addTilesetImage(
      "encounter",
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE
    );
    if (!encounterTiles) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating encounter tileset using data from tiled`
      );
      return;
    }

    // the tag Encounter below is the name of the map in the level.json file
    // basically matches the name in the json file
    this.#encounterLayer = map.createLayer("Encounter", encounterTiles, 0, 0);
    if (!this.#encounterLayer) {
      console.log(
        `[${WorldScene.name}:create] encountered error while creating encounter layer using data from tiled`
      );
      return;
    }
    this.#encounterLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);
    // 0,0 for top left hand corner
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

    //create npcs
    this.#createNPCs(map);

    this.#player = new Player({
      scene: this,
      position: dataManager.store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION),
      direction: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
      ),
      collisionLayer: collisionLayer,
      //callback invoked to character class such that it will be called when character
      // class finish moving
      spriteGridMovementFinishedCallback: () => {
        this.#handlePlayerMovementUpdate();
      },
      otherCharacterToCheckCollisionsWith: this.#npcs,
    });
    // camera should move to follow player
    this.cameras.main.startFollow(this.#player.sprite);

    // update our collisions with npcs
    this.#npcs.forEach((npc) =>
      npc.addCharacterToCheckCollisionsWith(this.#player)
    );
    // add in foreground, giving the game an extra depth
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0).setOrigin(0);

    this.#controls = new Controls(this);

    //create dialog ui
    this.#dialogUi = new DialogUi(this, 1280);

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update(time) {
    if (this.#wildMonsterEncountered) {
      this.#player.update(time);
      return;
    }
    /**
     * check to see if the button is being held down, if it is,
     * move the character
     */
    const selectedDirection = this.#controls.getDirectionKeyPressedDown();
    if (selectedDirection !== DIRECTION.NONE && !this.#isPlayerInputLocked()) {
      this.#player.moveCharacter(selectedDirection);
    }

    if (this.#controls.wasSpaceKeyPressed() && !this.#player.isMoving) {
      this.#playerHandleInteraction();
    }

    this.#player.update(time);

    this.#npcs.forEach((npc) => {
      npc.update(time);
    });
  }

  #playerHandleInteraction() {
    if (this.#dialogUi.isAnimationPlaying) {
      return;
    }
    if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.hideDialogModal();
      if (this.#npcPlayerIsInteractingWith) {
        this.#npcPlayerIsInteractingWith.isTalkingToPlayer = false;
        this.#npcPlayerIsInteractingWith = undefined;
      }
      return;
    }
    if (this.#dialogUi.isVisible && !this.#dialogUi.moreMessagesToShow) {
      this.#dialogUi.showNextMessage();
      return;
    }
    console.log("start of interaction check");

    const { x, y } = this.#player.sprite;
    const targetPosition = getTargetPositionFromGameObjectPositionAndDirection(
      {
        x,
        y,
      },
      this.#player.direction
    );
    const nearbySign = this.#signLayer.objects.find((object) => {
      if (!object.x || !object.y) return;

      return (
        // the y value will align with the bottom of the tiled object which is added to the scene
        // our y value is set to the bottom of the sprite, when we subtract by tile size, we basically push the y to the top to get the correct y value
        object.x === targetPosition.x &&
        object.y - TILE_SIZE === targetPosition.y
      );
    });

    if (nearbySign) {
      /**
       * @type {TiledObjectProperty[]}
       */
      const props = nearbySign.properties;
      /**
       * @type {string}
       */
      const msg = props.find(
        (prop) => prop.name === TILED_SIGN_PROPERTY.MESSAGE
      )?.value;

      const usePlaceHolderText = this.#player.direction !== DIRECTION.UP;
      let textToShow = CANNOT_READ_SIGN_TEXT;
      if (!usePlaceHolderText) textToShow = msg || SAMPLE_TEXT;
      this.#dialogUi.showDialogModal([textToShow]);
      return;
    }

    const nearbyNpc = this.#npcs.find((npc) => {
      return (
        // check if the player target position has an npc, if there is let player talk to npc
        npc.sprite.x === targetPosition.x && npc.sprite.y === targetPosition.y
      );
    });

    if (nearbyNpc) {
      nearbyNpc.facePlayer(this.#player.direction);
      nearbyNpc.isTalkingToPlayer = true;
      this.#npcPlayerIsInteractingWith = nearbyNpc;
      this.#dialogUi.showDialogModal(nearbyNpc.messages);
    }
  }

  /**
   * check for the position player agains the encounter layer and see if a tile exist
   * This logic is similar to collision logic before we move our player
   * This method is used to check for player position AFTER player moves
   */
  #handlePlayerMovementUpdate() {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this.#player.sprite.x,
      y: this.#player.sprite.y,
    });
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this.#player.direction
    );
    // check if it exist, if not then return
    if (!this.#encounterLayer) return;

    /**
     * NOTE: passing in true to getTileAtWorldXY will always return an object
     * even if no object is found.
     * If index is not -1, means that encounter zone exist and player is on
     * encounter zone
     */
    const isInEncounterZone =
      this.#encounterLayer.getTileAtWorldXY(
        this.#player.sprite.x,
        this.#player.sprite.y,
        true
      ).index !== -1;
    // if we enter an area that is not an encounter zone, just return it
    if (!isInEncounterZone) return;

    console.log(
      `[${WorldScene.name}:handlePlayerMovementUpdate] player is in an encounter zone`
    );
    // add logic to check if player encounters a monster
    this.#wildMonsterEncountered = Math.random() < 0.9;
    if (this.#wildMonsterEncountered) {
      console.log(
        `[${WorldScene.name}:handlePlayerMovementUpdate] player encountered a wild monster`
      );
      this.cameras.main.fadeOut(2000);
      /**
       * The event listener will run once the fade out animation completes,
       * basically the line of code above. The code below will wait for the
       * code above to complete to avoid timing issues
       */
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        }
      );
    }
  }

  #isPlayerInputLocked() {
    return this.#dialogUi.isVisible;
  }
  /**
   *
   * @param {Phaser.Tilemaps.Tilemap} map
   * @returns {void}
   */
  #createNPCs(map) {
    this.#npcs = [];

    // because each layer we have like NPC1, NPC2, so if we filter by including
    // substring of NPC, we will get all the layers with npc
    const npcLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes("NPC"));
    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);
      // return single tile object that is of type npc
      console.log(layer.objects);
      const npcObject = layer.objects.find((obj) => {
        // type is the custom class we added to object
        return obj.type === CUSTOM_TILED_TYPES.NPC;
      });
      if (!npcObject || npcObject.x === undefined || npcObject.y === undefined)
        return;

      // get path objecs for this npc
      const pathObject = layer.objects.filter((objects) => objects.type === CUSTOM_TILED_TYPES.NPC_PATH)
      const npcPath = {
        0: {x: npcObject.x, y: npcObject.y - TILE_SIZE}
      }
      pathObject.forEach(obj => {
        // if there is no pathg, return early so we dont add it to the path
        if(obj.x === undefined || obj.y === undefined) return

        npcPath[parseInt(obj.name,10)] = {x: obj.x, y: obj.y - TILE_SIZE}
      })


      // Checkin for frame
      const npcFrame =
        npcObject.properties.find(
          (property) => property.name === TILED_NPC_PROPERTY.FRAME
        )?.value || "0";

      // Checkin for messages
      const npcMessagesString =
        npcObject.properties.find(
          (property) => property.name === TILED_NPC_PROPERTY.MESSAGES
        )?.value || "";

      // in the tiled, we separated the messages setence with :: delimiter
      const npcMessages = npcMessagesString.split("::");

      const npcMovement =
      npcObject.properties.find(
        (property) => property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
      )?.value || "IDLE";

      const npc = new NPC({
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame, 10),
        messages: npcMessages,
        npcPath,
        movementPattern: npcMovement
      });
      this.#npcs.push(npc);
    });
  }
}
