import Phaser from "../lib/phaser.js";
import {
  ATTACK_ASSET_KEYS,
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from "../assets/asset-key.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { WebFontFileLoader } from "../assets/web-font-file-loader.js";
import { DataUtils } from "../utils/data-utils.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
      //adding active: true can tell the phaser manager to start the scene without being called from the main.js
      active: true,
    });
  }
  preload() {
    console.log(`[${PreloadScene.name}:preload] invoked`);
    let basePath;

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      basePath = "../assets/images";
    } else {
      basePath = "/monster-tamer/assets/images";
    }

    const monsterTamerAssetPath = `${basePath}/monster-tamer`;
    const kenneysAssetPath = `${basePath}/kenneys-assets`;
    const pimenAssetPath = `${basePath}/pimen`;
    const axulArtAssetPath = `${basePath}/axulart`;
    const pbGamesAssetPath = `${basePath}/parabellum-games`;

    //preload lifecycle and make it avalailable in cache but cannot be displayed yet
    //battle grounds
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `${monsterTamerAssetPath}/battle-backgrounds/forest-background.png`
    );
    //battle assets
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
    );
    //health bar assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
    );
    this.load.image(
      BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND,
      `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
    );
    //health bar assets
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
    );
    this.load.image(
      HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW,
      `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`
    );
    //monster assets
    this.load.image(
      MONSTER_ASSET_KEYS.CARNODUSK,
      `${monsterTamerAssetPath}/monsters/carnodusk.png`
    );
    this.load.image(
      MONSTER_ASSET_KEYS.IGUANIGNITE,
      `${monsterTamerAssetPath}/monsters/iguanignite.png`
    );
    //ui assets
    this.load.image(
      UI_ASSET_KEYS.CURSOR,
      `${monsterTamerAssetPath}/ui/cursor.png`
    );
    //loading json data
    this.load.json(DATA_ASSET_KEYS.ATTACKS, "assets/data/attacks.json");
    this.load.json(DATA_ASSET_KEYS.ANIMATIONS, "assets/data/animations.json");

    //load custom fonts
    this.load.addFile(
      new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME])
    );

    //load attack asset
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD,
      `${pimenAssetPath}/ice-attack/active.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    //load attack asset
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.ICE_SHARD_START,
      `${pimenAssetPath}/ice-attack/start.png`,
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    //load attack asset
    this.load.spritesheet(
      ATTACK_ASSET_KEYS.SLASH,
      `${pimenAssetPath}/slash.png`,
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );

    //load world assets
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      `${monsterTamerAssetPath}/map/level_background.png`
    );
    this.load.tilemapTiledJSON(
      WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
      `assets/data/level.json`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_COLLISION,
      `${monsterTamerAssetPath}/map/collision.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_FOREGROUND,
      `${monsterTamerAssetPath}/map/level_foreground.png`
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_ENCOUNTER_ZONE,
      `${monsterTamerAssetPath}/map/encounter.png`
    );

    // load character images
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.PLAYER,
      `${axulArtAssetPath}/character/custom.png`,
      {
        frameWidth: 64,
        frameHeight: 88,
      }
    );
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC,
      `${pbGamesAssetPath}/characters.png`,
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
  }

  create() {
    //look for the background image in the preloader cache by referencing the key
    this.textures.get("background");
    this.#createAnimations();
    /**
     * this.add references phaser 3 scene game factory
     * image game object is for displaying static scene which is perfect for background
     * @argumentOne - x position of the image where positive x value means object moves to the right
     * @argumentTwo - y position of the image where a positive y value signifies position downwards
     * @setOrigin - setting 0 means that the object is placed in the middle. TLDR, it holds the middle point of the image
     */
    // this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
    console.log(`[${PreloadScene.name}:create] invoked`);
    this.scene.start(SCENE_KEYS.WORLD_SCENE);
  }

  #createAnimations() {
    const animations = DataUtils.getAnimations(this);
    animations.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, {
            frames: animation.frames,
          })
        : this.anims.generateFrameNumbers(animation.assetKey);
      // create animations
      /**
       * anims create a new animation and stores in the cache so that we can play it later when we reference the sprite object
       */
      this.anims.create({
        key: animation.key,
        /**
         * generateFrameNumber creates frames that are needed for the animation. for example, 0-5 is generated since there
         * are only 5 frames in the sprite sheet asset
         */
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
        yoyo: animation.yoyo,
      });
    });
  }
}
