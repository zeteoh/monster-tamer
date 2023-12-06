import Phaser from "../../../lib/phaser.js";
import {
  MONSTER_ASSET_KEYS,
  UI_ASSET_KEYS,
} from "../../../assets/asset-key.js";
import { DIRECTION } from "../../../common/direction.js";
import { exhaustiveGuard } from "../../../utils/guard.js";
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS,
} from "./battle-menu-options.js";
import { BATTLE_UI_TEXT_STYLE } from "./battle-menu-config.js";
import { BattleMonster } from "../../monsters/battle-monster.js";
import { animateText } from "../../../utils/text-utils.js";
import { SKIP_BATTLE_ANIMATIONS } from "../../../config.js";

const BATTLE_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const ATTACK_MENU_CURSOR_POS = Object.freeze({
  x: 42,
  y: 38,
});

const PLAYER_INPUT_CURSOR_POS = Object.freeze({
  y: 488,
});

export class BattleMenu {
  /**
   *@type {Phaser.Scene} doing this gives the scene the Phaser.scene functions with vscode intellisense
   */
  #scene;
  /**
   *@type {Phaser.GameObjects.Container}
   */
  #mainBattleMenuPhaserContainerGameObject;
  /**
   *@type {Phaser.GameObjects.Container}
   */
  #moveSelectionSubBattleMenuPhaserContainerGameObject;
  /**
   *@type {Phaser.GameObjects.Text}
   */
  #battleTextGameObjectLine1;
  /**
   *@type {Phaser.GameObjects.Text}
   */
  #battleTextGameObjectLine2;
  /**
   *@type {Phaser.GameObjects.Image}
   */
  #mainBattleMenuCursorPhaserImageGameObject;
  /**
   * @type {import("./battle-menu-options.js").BattleMenuOptions}
   */
  #selectedBattleMenuOption;
  /**
   *@type {Phaser.GameObjects.Image}
   */
  #attackBattleMenuCursorPhaserImageGameObject;
  /**
   * @type {import("./battle-menu-options.js").AttackMoveOptions}
   */
  #selectedAttackMenuOption;
  /**
   * @type {import("./battle-menu-options.js").ActiveBattleMenu}
   */
  #activeBattleMenu;
  /**
   *@type {string[]}
   */
  #queuedInfoPanelMessages;
  /**
   *@type {() => void | undefined}
   */
  #queuedInfoPanelCallback;
  /**
   *@type {boolean}
   */
  #waitingForPlayerInput;
  /**
   *@type {number | undefined}
   */
  #selectedAttackIndex;
  /**
   *@type {BattleMonster}
   */
  #activePlayerMonster;
  /**
   *@type {Phaser.GameObjects.Image}
   */
  #userInputCursorePhaserImageGameObject;
  /**
   *@type {Phaser.Tweens.Tween}
   */
  #userInputCursorPhaserTween;
  /**
   *@type {boolean}
   */
  #queuedMessagesSkipAnimation;
  /**
   *@type {boolean}
   */
  #queuedMessageAnimationPlaying;
  /**
   *
   * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to
   * @param {BattleMonster} activePlayerMonster
   */
  constructor(scene, activePlayerMonster) {
    this.#scene = scene;
    this.#activePlayerMonster = activePlayerMonster;
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
    this.#queuedInfoPanelCallback = undefined;
    this.#queuedInfoPanelMessages = [];
    this.#waitingForPlayerInput = false;
    this.#selectedAttackIndex = undefined;
    this.#queuedMessagesSkipAnimation = false;
    this.#queuedMessageAnimationPlaying = false;
    this.#createMainInfoPane();
    this.#createMainBattleMenu();
    this.#createMonsterAttackSubMenu();
    this.#createPlayerInputCursor();
  }
  /**
   *@type {number | undefined}
   */
  get selectedAttack() {
    if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT)
      return this.#selectedAttackIndex;
    return undefined;
  }

  //decreasing transparency to 0
  showMainBattleMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#battleTextGameObjectLine1.setText("what should");
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1);
    this.#battleTextGameObjectLine1.setAlpha(1);
    this.#battleTextGameObjectLine2.setAlpha(1);

    this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
    this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
      BATTLE_MENU_CURSOR_POS.x,
      BATTLE_MENU_CURSOR_POS.y
    );
    this.#selectedAttackIndex = undefined;
  }

  //increasing transparency to max to hide
  hideMainBattleMenu() {
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0);
    this.#battleTextGameObjectLine1.setAlpha(0);
    this.#battleTextGameObjectLine2.setAlpha(0);
  }

  showMonsterAtackSubMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
  }

  hideMonsterAtackSubMenu() {
    this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
  }

  playInputCursorAnimation() {
    this.#userInputCursorePhaserImageGameObject.setPosition(
      this.#battleTextGameObjectLine1.displayWidth +
        this.#userInputCursorePhaserImageGameObject.displayWidth * 2.7,
      this.#userInputCursorePhaserImageGameObject.y
    );
    this.#userInputCursorePhaserImageGameObject.setAlpha(1);
    this.#userInputCursorPhaserTween.restart();
  }

  hideInputCursor() {
    this.#userInputCursorePhaserImageGameObject.setAlpha(0);
    this.#userInputCursorPhaserTween.pause();
  }

  /**
   *
   * @param {import('../../../common/direction.js').Direction|'OK'|'CANCEL'} input
   */
  handlePlayerInput(input) {
    if (this.#queuedMessageAnimationPlaying && input == "OK") return;

    if (this.#waitingForPlayerInput && (input === "CANCEL" || input === "OK")) {
      this.#updateInfoPaneWithMessage();
      return;
    }
    console.log(input);
    if (input == "CANCEL") {
      this.#switchToMainBattleMenu();
      return;
    }
    if (input == "OK") {
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this.#handlePlayerChooseMainBattleOption();
        return;
      }
      if (this.#activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
        this.#handlePlayerChooseAttack();
        return;
      }
      return;
    }

    this.#updateSElectedBattleMenuOptionFromInput(input);
    this.#moveMainBattleMenuCursor();
    this.#updateSelectedMoveMenuOptionFromInput(input);
    this.#moveMoveSelectBattleMenuCursor();
  }

  /**
   *
   * @param {string} message
   * @param {()=>void} [callback]
   * @param {boolean} [skipAnimation=false]
   */
  updateInfoPaneMessageNoInputRequired(
    message,
    callback,
    skipAnimation = false
  ) {
    this.#battleTextGameObjectLine1.setText("").setAlpha(1);

    if (skipAnimation) {
      this.#battleTextGameObjectLine1.setText(message);
      this.#waitingForPlayerInput = false;
      if (callback) {
        callback();
      }
      return;
    }
    // TODO: animate message

    animateText(this.#scene, this.#battleTextGameObjectLine1, message, {
      delay: 50,
      callback: () => {
        this.#waitingForPlayerInput = false;
        if (callback) {
          callback();
        }
      },
    });
  }

  /**
   *
   * @param {string[]} messages
   * @param {()=>void} [callback]
   * @param {boolean} [skipAnimation=false]
   */
  updateInfoPaneMessagesAndWaitForInput(
    messages,
    callback,
    skipAnimation = false
  ) {
    this.#queuedInfoPanelMessages = messages;
    this.#queuedInfoPanelCallback = callback;
    this.#queuedMessagesSkipAnimation = skipAnimation;
    this.#updateInfoPaneWithMessage();
  }

  #updateInfoPaneWithMessage() {
    this.#waitingForPlayerInput = false;
    this.#battleTextGameObjectLine1.setText("").setAlpha(1);
    this.hideInputCursor();

    //check if all messages have been displayed from the queue and call the callback
    if (this.#queuedInfoPanelMessages.length === 0) {
      if (this.#queuedInfoPanelCallback) {
        this.#queuedInfoPanelCallback();
        this.#queuedInfoPanelCallback = undefined;
        return;
      }
    }

    //get first message from the queue and animate message
    //note .shift() will grab the first array element and remove it
    const messageToDisplay = this.#queuedInfoPanelMessages.shift();
    if (this.#queuedMessagesSkipAnimation) {
      this.#queuedMessageAnimationPlaying = false;
      this.#battleTextGameObjectLine1.setText(messageToDisplay);
      this.#waitingForPlayerInput = true;
      this.playInputCursorAnimation();
      // if (this.#queuedInfoPanelCallback) {
      //   this.#queuedInfoPanelCallback();
      //   this.#queuedInfoPanelCallback = undefined;
      // }
      return;
    }
    this.#queuedMessageAnimationPlaying = true;
    animateText(
      this.#scene,
      this.#battleTextGameObjectLine1,
      messageToDisplay,
      {
        delay: 50,
        callback: () => {
          this.playInputCursorAnimation();
          this.#waitingForPlayerInput = true;
          this.#queuedMessageAnimationPlaying = false;
        },
      }
    );
  }

  #createMainBattleMenu() {
    this.#battleTextGameObjectLine1 = this.#scene.add.text(
      20,
      468,
      "what should ",
      BATTLE_UI_TEXT_STYLE
    );
    this.#battleTextGameObjectLine2 = this.#scene.add.text(
      20,
      512,
      `${this.#activePlayerMonster.name} do next?`,
      BATTLE_UI_TEXT_STYLE
    );

    this.#mainBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(
        BATTLE_MENU_CURSOR_POS.x,
        BATTLE_MENU_CURSOR_POS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);
    console.log(this.#mainBattleMenuCursorPhaserImageGameObject);
    this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(
      520,
      448,
      [
        this.#createMainInfoSubPane(),
        this.#scene.add.text(
          50,
          22,
          BATTLE_MENU_OPTIONS.FIGHT,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          240,
          22,
          BATTLE_MENU_OPTIONS.SWITCH,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          50,
          70,
          BATTLE_MENU_OPTIONS.ITEM,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#scene.add.text(
          240,
          70,
          BATTLE_MENU_OPTIONS.FLEE,
          BATTLE_UI_TEXT_STYLE
        ),
        this.#mainBattleMenuCursorPhaserImageGameObject,
      ]
    );

    this.hideMainBattleMenu();
  }

  #createMonsterAttackSubMenu() {
    this.#attackBattleMenuCursorPhaserImageGameObject = this.#scene.add
      .image(
        ATTACK_MENU_CURSOR_POS.x,
        ATTACK_MENU_CURSOR_POS.y,
        UI_ASSET_KEYS.CURSOR,
        0
      )
      .setOrigin(0.5)
      .setScale(2.5);

    /**
     * @type {string[]}
     */
    const attackNames = [];
    for (let i = 0; i < 4; i++) {
      attackNames.push(this.#activePlayerMonster.attacks[i]?.name || "-");
    }

    this.#moveSelectionSubBattleMenuPhaserContainerGameObject =
      this.#scene.add.container(0, 448, [
        this.#scene.add.text(55, 22, attackNames[0], BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 22, attackNames[1], BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(55, 70, attackNames[2], BATTLE_UI_TEXT_STYLE),
        this.#scene.add.text(240, 70, attackNames[3], BATTLE_UI_TEXT_STYLE),
        this.#attackBattleMenuCursorPhaserImageGameObject,
      ]);
    this.hideMonsterAtackSubMenu();
  }

  #createMainInfoPane() {
    const padding = 4;
    const rectHeight = 124;
    //last argument is alpha (transparency value)
    this.#scene.add
      .rectangle(
        padding,
        this.#scene.scale.height - rectHeight - padding,
        this.#scene.scale.width - padding * 2,
        rectHeight,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0xe4434a, 1);
  }

  #createMainInfoSubPane() {
    const rectWidth = 500;
    const rectHeight = 124;
    //last argument is alpha (transparency value)
    return this.#scene.add
      .rectangle(0, 0, rectWidth, rectHeight, 0xede4f3, 1)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);
  }
  /**
   *
   * @param {import('../../../common/direction.js').Direction} direction
   */
  #updateSElectedBattleMenuOptionFromInput(direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) return;

    //FIGHT
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    //SWITCH
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.DOWN:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    //ITEM
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }

    //FLEE
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
          return;
        case DIRECTION.UP:
          this.#selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #moveMainBattleMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) return;

    switch (this.#selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          BATTLE_MENU_CURSOR_POS.x,
          BATTLE_MENU_CURSOR_POS.y
        );
        return;
      case BATTLE_MENU_OPTIONS.SWITCH:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          BATTLE_MENU_CURSOR_POS.y
        );
        return;
      case BATTLE_MENU_OPTIONS.ITEM:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(
          BATTLE_MENU_CURSOR_POS.x,
          86
        );
        return;
      case BATTLE_MENU_OPTIONS.FLEE:
        this.#mainBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        /**
         *with the type never such that for example
         if the FLEE is being parsed in, it will
         have an error in intellisense because we
         should always cover FLEE
         */
        exhaustiveGuard(this.#selectedBattleMenuOption);
    }
  }
  /**
   *
   * @param {import('../../../common/direction.js').Direction} direction
   */
  #updateSelectedMoveMenuOptionFromInput(direction) {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT)
      return;

    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.DOWN:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.UP:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.RIGHT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
          return;
        case DIRECTION.UP:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
          return;
        case DIRECTION.LEFT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    if (this.#selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.LEFT:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
          return;
        case DIRECTION.UP:
          this.#selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
          return;
        case DIRECTION.RIGHT:
        case DIRECTION.DOWN:
        case DIRECTION.NONE:
          return;
        default:
          exhaustiveGuard(direction);
      }
      return;
    }
    exhaustiveGuard(this.#selectedAttackMenuOption);
  }

  #moveMoveSelectBattleMenuCursor() {
    if (this.#activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT)
      return;
    switch (this.#selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MENU_CURSOR_POS.x,
          ATTACK_MENU_CURSOR_POS.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          228,
          ATTACK_MENU_CURSOR_POS.y
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(
          ATTACK_MENU_CURSOR_POS.x,
          86
        );
        return;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this.#attackBattleMenuCursorPhaserImageGameObject.setPosition(228, 86);
        return;
      default:
        exhaustiveGuard(this.#selectedAttackMenuOption);
    }
  }

  #switchToMainBattleMenu() {
    // hide the cursor wehn switching to main battle menu
    this.#waitingForPlayerInput = false;
    this.hideInputCursor();
    this.hideMonsterAtackSubMenu();
    this.showMainBattleMenu();
  }

  #handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu();
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
      this.hideMainBattleMenu();
      this.showMonsterAtackSubMenu();
      return;
    }
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
      this.updateInfoPaneMessagesAndWaitForInput(
        ["Your bag is empty..."],
        () => {
          this.#switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;

      this.updateInfoPaneMessagesAndWaitForInput(
        ["You have no other monsters in your party..."],
        () => {
          this.#switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }
    if (this.#selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
      this.#activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
      this.updateInfoPaneMessagesAndWaitForInput(
        ["You fail to run away..."],
        () => {
          this.#switchToMainBattleMenu();
        },
        SKIP_BATTLE_ANIMATIONS
      );
      return;
    }

    exhaustiveGuard(this.#selectedBattleMenuOption);
  }

  #handlePlayerChooseAttack() {
    let selectedMoveIndex = 0;
    switch (this.#selectedAttackMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        selectedMoveIndex = 0;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedMoveIndex = 1;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedMoveIndex = 2;
        break;
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedMoveIndex = 3;
        break;
      default:
        exhaustiveGuard(this.#selectedAttackMenuOption);
    }

    this.#selectedAttackIndex = selectedMoveIndex;
  }

  #createPlayerInputCursor() {
    this.#userInputCursorePhaserImageGameObject = this.#scene.add.image(
      0,
      0,
      UI_ASSET_KEYS.CURSOR
    );
    this.#userInputCursorePhaserImageGameObject
      .setAngle(90)
      .setScale(2.5, 1.25);
    this.#userInputCursorePhaserImageGameObject.setAlpha(0);

    this.#userInputCursorPhaserTween = this.#scene.add.tween({
      delay: 0,
      duration: 500,
      //play at a repeat unless we manually stop it
      repeat: -1,
      y: {
        from: PLAYER_INPUT_CURSOR_POS.y,
        start: PLAYER_INPUT_CURSOR_POS.y,
        to: PLAYER_INPUT_CURSOR_POS.y + 6,
      },
      targets: this.#userInputCursorePhaserImageGameObject,
    });
    // pause it when the game object is hidden
    this.#userInputCursorPhaserTween.pause();
  }
}
