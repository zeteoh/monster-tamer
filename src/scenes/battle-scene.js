import { MONSTER_ASSET_KEYS } from "../assets/asset-key.js";
import {
  ATTACK_TARGET,
  AttackManager,
} from "../battle/attacks/attack-manager.js";
import { Background } from "../battle/background.js";
import { EnemyBattleMonster } from "../battle/monsters/enemy-battle-monsters.js";
import { PlayerBattleMonster } from "../battle/monsters/player-battle-monster.js";
import { BattleMenu } from "../battle/ui/menu/battle-menu.js";
import { DIRECTION } from "../common/direction.js";
import { SKIP_BATTLE_ANIMATIONS } from "../config.js";
import Phaser from "../lib/phaser.js";
import { StateMachine } from "../utils/state-machine.js";
import { SCENE_KEYS } from "./scene-keys.js";

const BATTLE_STATES = Object.freeze({
  // before attack
  INTRO: "INTRO",
  // show character animation onto screen, healthbar etc
  PRE_BATTLE_INFO: "PRE_BATTLE_INFO",
  // bring out player monster
  BRING_OUT_MONSTER: "BRING_OUT_MONSTER",
  PLAYER_INPUT: "PLAYER_INPUT",
  ENEMY_INPUT: "ENEMY_INPUT",
  BATTLE: "BATTLE",
  POST_ATTACK_CHECK_STATE: "POST_ATTACK_CHECK_STATE",
  FINISHED: "FINISHED",
  FLEE_ATTEMPT: "FLEE_ATTEMPT",
});

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
  /**
   * @type {StateMachine}
   */
  #battleStateMachine;
  /**
   * @type {AttackManager}
   */
  #attackManager;
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
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
    });
    this.#activePlayerMonster = new PlayerBattleMonster({
      scene: this,
      monsterDetails: {
        name: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
        assetFrame: 0,
        maxHp: 25,
        currentHp: 25,
        baseAttack: 15,
        attackIds: [2],
        currentLevel: 5,
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS,
    });
    /**
     * using a container, we can move all assets in the container together and package them in a container
     */
    //render out the enemy health bar

    // render outy main info and sub info panes
    this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
    this.#createBattleStateMachine();
    this.#attackManager = new AttackManager(this, SKIP_BATTLE_ANIMATIONS);
    //creates up down left right and shift keys automatically
    this.#cursorKeys = this.input.keyboard.createCursorKeys();
    // this.#activeEnemyMonster.takeDamage(20, () => {
    //   this.#activePlayerMonster.takeDamage(15);
    // });
    console.log(this.#activeEnemyMonster.isFainted);
  }

  update() {
    //added here for constant updates
    this.#battleStateMachine.update();
    //will only return true one time when the space key is pressed and wont register true when held
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursorKeys.space
    );
    // limit input based on the current battle state we are in
    // if we are not in the right battle state, return early and do not
    // process any input
    if (
      wasSpaceKeyPressed &&
      (this.#battleStateMachine.currentStateName ===
        BATTLE_STATES.PRE_BATTLE_INFO ||
        this.#battleStateMachine.currentStateName ===
          BATTLE_STATES.POST_ATTACK_CHECK_STATE ||
        this.#battleStateMachine.currentStateName ===
          BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this.#battleMenu.handlePlayerInput("OK");
      return;
    }
    console.log(this.#cursorKeys.space.isDown);

    // return early if we are not in player input
    if (
      this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT
    )
      return;

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
      this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
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

  #playerAttack() {
    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `${this.#activePlayerMonster.name} used ${
        this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]
              .animationName,
            ATTACK_TARGET.ENEMY,
            () => {
              this.#activeEnemyMonster.playTakeDamageAnimation(() => {
                this.#activeEnemyMonster.takeDamage(
                  this.#activePlayerMonster.baseAttack,
                  () => {
                    this.#enemyAttack();
                  }
                );
              });
            }
          );
        });
      },
      SKIP_BATTLE_ANIMATIONS
    );
  }

  #enemyAttack() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK_STATE);
      return;
    }
    this.#battleMenu.updateInfoPaneMessageNoInputRequired(
      `for ${this.#activeEnemyMonster.name} used ${
        this.#activeEnemyMonster.attacks[0].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this.#attackManager.playAttackAnimation(
            this.#activeEnemyMonster.attacks[0]
              .animationName,
            ATTACK_TARGET.PLAYER,
            () => {
              this.#activePlayerMonster.playTakeDamageAnimation(() => {
                this.#activePlayerMonster.takeDamage(
                  this.#activeEnemyMonster.baseAttack,
                  () => {
                    this.#battleStateMachine.setState(
                      BATTLE_STATES.POST_ATTACK_CHECK_STATE
                    );
                  }
                );
              });
            }
          );
        });
      },
      SKIP_BATTLE_ANIMATIONS
    );
  }

  #postBattleSequenceCheck() {
    if (this.#activeEnemyMonster.isFainted) {
      this.#activeEnemyMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `Wild ${this.#activeEnemyMonster.name} fainted`,
            "You have gained some experience",
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });
      return;
    }

    if (this.#activePlayerMonster.isFainted) {
      this.#activePlayerMonster.playDeathAnimation(() => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            ` ${this.#activePlayerMonster.name} fainted`,
            "You have no more monsters, escaping to safety...",
          ],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      });
      return;
    }
    this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
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

  #createBattleStateMachine() {
    this.#battleStateMachine = new StateMachine("battle", this);
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        //wait for any scene setup and transitions to complete
        this.time.delayedCall(1200, () => {
          this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
        });
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // wait for enemy monster to appear on the screen and
        // notify the player about the wild monster
        this.#activeEnemyMonster.playMonsterAppearAnimation(() => {
          this.#activeEnemyMonster.playMonsterHealthBarAppearAnimation(
            () => undefined
          );
          this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`wild ${this.#activeEnemyMonster.name} appeared!`],
            () => {
              // wait for text animation to complete and move to
              // next state
              this.#battleStateMachine.setState(
                BATTLE_STATES.BRING_OUT_MONSTER
              );
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_MONSTER,
      onEnter: () => {
        // wait for player monster to appear on the screen and
        // notify the player about the monster
        this.#activePlayerMonster.playMonsterAppearAnimation(() => {
          this.#activePlayerMonster.playMonsterHealthBarAppearAnimation(
            () => undefined
          );
          this.#battleMenu.updateInfoPaneMessageNoInputRequired(
            `go ${this.#activePlayerMonster.name}!`,
            () => {
              this.time.delayedCall(500, () => {
                this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
              });
            },
            SKIP_BATTLE_ANIMATIONS
          );
        });
      },
    });

    this.#battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this.#battleMenu.showMainBattleMenu();
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.ENEMY_INPUT,
      onEnter: () => {
        // pick a random move for the enemy monster,
        // and in the future, implement some time of AI behaviour
        // TODO: add a feature in the future update
        this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other monster

        this.#playerAttack();
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK_STATE,
      onEnter: () => {
        this.#postBattleSequenceCheck();
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this.#transitiontoNextScene();
      },
    });
    this.#battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [`You got away safely!`],
          () => {
            this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
          },
          SKIP_BATTLE_ANIMATIONS
        );
      },
    });
    // start the state machine
    this.#battleStateMachine.setState(BATTLE_STATES.INTRO);
  }
}
