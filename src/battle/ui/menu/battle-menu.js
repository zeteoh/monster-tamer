import Phaser from "../../../lib/phaser.js";
import { MONSTER_ASSET_KEYS } from "../../../assets/asset-key.js";

const BATTLE_MENU_OPTIONS = Object.freeze({
  FIGHT: "FIGHT",
  SWITCH: "SWTICH",
  ITEM: "ITEM",
  FLEE: "FLEE",
});

const battleUiTextStyle = {
  color: "black",
  fontSize: "30px",
};

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
   * 
   * @param {Phaser.Scene} scene the Phaser 3 scene the battle menu will be added to
   */
  constructor(scene) {
    this.#scene = scene;

    this.#createMainInfoPane();
    this.#createMainBattleMenu();
    this.#createMonsterAttackSubMenu();
  }

  //decreasing transparency to 0
  showMainBattleMenu() {
    this.#battleTextGameObjectLine1.setText("what should");
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(1);
    this.#battleTextGameObjectLine1.setAlpha(1);
    this.#battleTextGameObjectLine2.setAlpha(1);
  }

  //increasing transparency to max to hide
  hideMainBattleMenu() {
    this.#mainBattleMenuPhaserContainerGameObject.setAlpha(0);
    this.#battleTextGameObjectLine1.setAlpha(0);
    this.#battleTextGameObjectLine2.setAlpha(0);
  }

  showMonsterAtackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
  }

  hideMonsterAtackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
  }

  /**
   * 
   * @param {import('../../../common/direction.js').Direction|'OK'|'CANCEL'} input 
   */
  handlePlayerInput(input){
    console.log(input);
    if(input == 'CANCEL'){
      this.hideMonsterAtackSubMenu();
      this.showMainBattleMenu()
      return
    }
    if(input == 'OK'){
      this.hideMainBattleMenu();
      this.showMonsterAtackSubMenu()
      return
    }
  }

  #createMainBattleMenu() {
    this.#battleTextGameObjectLine1 = this.#scene.add.text(
      20,
      468,
      "what should ",
      battleUiTextStyle
    );
    //TODO: update to use monster data that is passed into this class instance
    this.#battleTextGameObjectLine2 = this.#scene.add.text(
      20,
      512,
      `${MONSTER_ASSET_KEYS.IGUANIGNITE} do next`,
      battleUiTextStyle
    );

    this.#mainBattleMenuPhaserContainerGameObject = this.#scene.add.container(
      520,
      448,
      [
        this.#createMainInfoSubPane(),
        this.#scene.add.text(
          50,
          22,
          BATTLE_MENU_OPTIONS.FIGHT,
          battleUiTextStyle
        ),
        this.#scene.add.text(
          240,
          22,
          BATTLE_MENU_OPTIONS.SWITCH,
          battleUiTextStyle
        ),
        this.#scene.add.text(
          50,
          70,
          BATTLE_MENU_OPTIONS.ITEM,
          battleUiTextStyle
        ),
        this.#scene.add.text(
          240,
          70,
          BATTLE_MENU_OPTIONS.FLEE,
          battleUiTextStyle
        ),
      ]
    );

    this.hideMainBattleMenu();
  }

  #createMonsterAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserContainerGameObject =
      this.#scene.add.container(0, 448, [
        this.#scene.add.text(55, 22, "slash", battleUiTextStyle),
        this.#scene.add.text(240, 22, "growl", battleUiTextStyle),
        this.#scene.add.text(55, 70, "-", battleUiTextStyle),
        this.#scene.add.text(240, 70, "-", battleUiTextStyle),
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
}
