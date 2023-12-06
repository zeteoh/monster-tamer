import {
  BATTLE_ASSET_KEYS,
  BATTLE_BACKGROUND_ASSET_KEYS,
  DATA_ASSET_KEYS,
  HEALTH_BAR_ASSET_KEYS,
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
} from "../assets/asset-key.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import * as WebFontLoader from "../lib/webfontloader.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";

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
  }

  create() {
    //look for the background image in the preloader cache by referencing the key
    this.textures.get("background");
    /**
     * this.add references phaser 3 scene game factory
     * image game object is for displaying static scene which is perfect for background
     * @argumentOne - x position of the image where positive x value means object moves to the right
     * @argumentTwo - y position of the image where a positive y value signifies position downwards
     * @setOrigin - setting 0 means that the object is placed in the middle. TLDR, it holds the middle point of the image
     */
    // this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
    console.log(`[${PreloadScene.name}:create] invoked`);

    //web font loader
    WebFontLoader.default.load({
      custom: {
        families: [KENNEY_FUTURE_NARROW_FONT_NAME],
      },
      // will be invoked when families are loaded
      active: () => {
        console.log("font ready");
        //tells phaser to load the battle scene right after it loads the preload scene
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
      },
    });
  }
}
