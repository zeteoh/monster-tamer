import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS } from "../assets/asset-key.js";
import { Background } from "../battle/background.js";
import { EnemyBattleMonster } from "../battle/monsters/enemy-battle-monsters.js";
import { PlayerBattleMonster } from "../battle/monsters/player-battle-monster.js";
import { HealthBar } from "../battle/ui/health-bar.js";
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
  #cursorKeys;
  /**
   * @type {EnemyBattleMonster}
   */
  #activeEnemyMonster;
  /**
   * @type {PlayerBattleMonster}
   */
  #activePlayerMonster;
  /**
   * @type {number}
   */
  #activePlayerAttackIndex;
  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE,
      //adding active: true can tell the phaser manager to start the scene without being called from the main.js
    });
  }

  init() {
    this.#activePlayerAttackIndex = -1;
  }

  create() {
    const background = new Background(this);
    background.showForest();
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
    console.log(`[${BattleScene.name}:create] invoked`);
    this.#activeEnemyMonster = new EnemyBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.CARNODUSK,
        assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
        assetFrame: 0,
        maxHp: 25,
        currentHp: 25,
        baseAttack: 5,
        attackIds: [1],
        currentLevel: 5,
      },
    });
    this.#activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        maxHp: 25,
        currentHp: 25,
        baseAttack: 5,
        attackIds: [2],
        currentLevel: 5,
      },
    });
    /**
     * using a container, we can move all assets in the container together and package them in a container
     */
    //render out the enemy health bar

    // render outy main info and sub info panes
    this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
    this.#battleMenu.showMainBattleMenu();

    //creates up down left right and shift keys automatically
    this.#cursorKeys = this.input.keyboard.createCursorKeys();

    // this.#activeEnemyMonster.takeDamage(20, () => {
    //   this.#activePlayerMonster.takeDamage(15);
    // });
    console.log(this.#activeEnemyMonster.isFainted);
  }

  update() {
    //will only return true one time when the space key is pressed and wont register true when held
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursorKeys.space
    );
    console.log(this.#cursorKeys.space.isDown);
    if (wasSpaceKeyPressed) {
      this.#battleMenu.handlePlayerInput("OK");

      //check if the player selectd an attack, and update display text
      if (this.#battleMenu.selectedAttack === undefined) return;
      console.log(this.#battleMenu.selectedAttack);
      console.log(
        `Player selected the following move: ${this.#battleMenu.selectedAttack}`
      );
      this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;
      // safe guard for checking if player selected '-' attack moves
      if (!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex])
        return;

      this.#battleMenu.hideMonsterAtackSubMenu();
      this.#handleBattleSequence();
      // this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
      //   ["Your monster attacks the enemy"],
      //   () => {
      //     this.#battleMenu.showMainBattleMenu();
      //   }
      // );

      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
      this.#battleMenu.handlePlayerInput("CANCEL");
      return;
    }

    /**
     * @type {import('../common/direction.js').Direction}
     */
    let selectedDirection = DIRECTION.NONE;
    if (this.#cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.#cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.#cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.#cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this.#battleMenu.handlePlayerInput(selectedDirection);
    }
  }

  #handleBattleSequence() {
    // general battle flow
    // show attack used, brief pause
    // then play attack animation, brief pause
    // then play damage animation, brief pause
    // then play health bar animation, brief pause
    // then repeat the steps above for the other monster

    this.#playerAttack();
  }

  #playerAttack() {
    this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
      [
        `${this.#activePlayerMonster.name} used ${
          this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name
        }`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, () => {
            this.#enemyAttack();
          });
        });
      }
    );
  }

  #enemyAttack() {
    if(this.#activeEnemyMonster.isFainted){
      this.#postBattleSequenceCheck();
      return
    }
    this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
      [
        `for ${this.#activeEnemyMonster.name} used ${
          this.#activeEnemyMonster.attacks[0].name
        }`,
      ],
      () => {
        this.time.delayedCall(500, () => {
          this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, () => {
            this.#postBattleSequenceCheck();
          });
        });
      }
    );
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
        [
          `Wild ${this.#activeEnemyMonster.name} fainted`,
          "You have gained some experience",
        ],
        () => {
          this.#transitiontoNextScene()
        }
      );
      return
    }

    if (this.#activePlayerMonster.isFainted) {
      this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
        [
          ` ${this.#activePlayerMonster.name} fainted`,
          "You have no more monsters, escaping to safety...",
        ],
        () => {
          this.#transitiontoNextScene()
        }
      );
      return
    }
    this.#battleMenu.showMainBattleMenu();
  }

  #transitiontoNextScene() {
    // 0,0,0 fades to black
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      //this.scene.start shuts down the current scene and starts a scene that we provide
      () => this.scene.start(SCENE_KEYS.BATTLE_SCENE)
    );
  }
}
