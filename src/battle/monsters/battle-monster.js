import { BATTLE_ASSET_KEYS } from "../../assets/asset-key.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../../assets/font-keys.js";
import { DataUtils } from "../../utils/data-utils.js";
import { HealthBar } from "../ui/health-bar.js";
import Phaser from '../../lib/phaser.js'
export class BattleMonster {
  /**
   * @protected @type {Phaser.Scene}
   */
  _scene;
  /**
   * @protected @type {import("../../types/typedef.js").Monster}
   */
  _monsterDetails;
  /**
   * @protected @type {HealthBar}
   */
  _healthBar;
  /**
   * @protected @type {Phaser.GameObjects.Image}
   */
  _phaserGameObject;
  /**
   * @protected @type {number}
   */
  _currentHealth;
  /**
   * @protected @type {number}
   */
  _maxHealth;
  /**
   * @protected @type {import("../../types/typedef.js").Attack[]}
   */
  _monsterAttacks;
  /**
   * @protected @type {Phaser.GameObjects.Container}
   */
  _phaserHealthBarGameContainer;
  /**
   * @protected @type {boolean}
   */
  _skipBattleAnimations;
  /**
   *
   * @param {import("../../types/typedef.js").BattleMonsterConfig} config
   * @param {import("../../types/typedef.js").Coordinate} position
   */
  constructor(config, position) {
    this._scene = config.scene;
    this._monsterDetails = config.monsterDetails;
    this._currentHealth = this._monsterDetails.currentHp;
    this._maxHealth = this._monsterDetails.maxHp;
    this._monsterAttacks = [];
    this._skipBattleAnimations = config.skipBattleAnimations || false;

    this._phaserGameObject = this._scene.add
      .image(
        position.x,
        position.y,
        this._monsterDetails.assetKey,
        this._monsterDetails.assetFrame || 0
      )
      .setAlpha(0);
    this.#createHealthBarComponent(config.scaleHealthBarBackgroundImageByY);
    this._monsterDetails.attackIds.forEach((attackId) => {
      const monsterAttack = DataUtils.getMonsterAttack(this._scene, attackId);
      if (monsterAttack !== undefined) {
        this._monsterAttacks.push(monsterAttack);
      }
    });
  }
  /**
   * @type {boolean}
   */
  get isFainted() {
    return this._currentHealth <= 0;
  }

  /**
   * @type {string}
   */
  get name() {
    return this._monsterDetails.name;
  }

  /**
   * @type {import("../../types/typedef.js").Attack[]}
   */
  get attacks() {
    return [...this._monsterAttacks];
  }

  /**
   * @type {number}
   */
  get baseAttack() {
    return this._monsterDetails.baseAttack;
  }
  /**
   * @type {number}
   */
  get level() {
    return this._monsterDetails.currentLevel;
  }

  /**
   *
   * @param {number} damage
   * @param {()=> void} [callback]
   */
  takeDamage(damage, callback) {
    // update current monster health and animate health bar
    this._currentHealth -= damage;
    if (this._currentHealth < 0) this._currentHealth = 0;

    this._healthBar.setMeterPercentageAnimated(
      this._currentHealth / this._maxHealth,
      {
        callback,
      }
    );
  }
  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playMonsterAppearAnimation(callback) {
    throw new Error("playMonsterAnimation is not implemented");
  }
  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playMonsterHealthBarAppearAnimation(callback) {
    throw new Error("playMonsterHealthBarAppearAnimation is not implemented");
  }
  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playTakeDamageAnimation(callback) {
    if(this._skipBattleAnimations){
      this._phaserGameObject.setAlpha(1)
      callback()
      return
    }
    this._scene.tweens.add({
      delay: 0,
      duration: 150,
      targets: this._phaserGameObject,
      alpha: {
        from: 1,
        start: 1,
        to: 0,
      },
      repeat: 10,
      onComplete: () => {
        this._phaserGameObject.setAlpha(1);
        callback();
      },
    });
  }
  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playDeathAnimation(callback) {
    throw new Error("playDeathAnimation is not implemented");
  }

  #createHealthBarComponent(scaleHealthBarBackgroundImageByY) {
    this._healthBar = new HealthBar(this._scene, 34, 34);
    const monsterNameGameText = this._scene.add.text(30, 20, this.name, {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: "#7E3D3F",
      fontSize: "32px",
    });

    const healthBarBackgroundImage = this._scene.add
      .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
      .setOrigin(0)
      .setScale(1, scaleHealthBarBackgroundImageByY);

    const monsterHealthBarLeveltext = this._scene.add.text(
      monsterNameGameText.width + 35,
      23,
      `L${this.level}`,
      {
        fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
        color: "#ED474B",
        fontSize: "28px",
      }
    );
    const monsterHpText = this._scene.add.text(30, 55, "HP", {
      fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
      color: "#FF6505",
      fontSize: "24px",
      fontStyle: "italic",
    });
    this._phaserHealthBarGameContainer = this._scene.add
      .container(0, 0, [
        healthBarBackgroundImage,
        monsterNameGameText,
        this._healthBar.container,
        monsterHealthBarLeveltext,
        monsterHpText,
      ])
      .setAlpha(0);
  }
}
