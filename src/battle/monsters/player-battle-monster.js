import { BattleMonster } from "./battle-monster.js";
/**
 * @type {import("../../types/typedef").Coordinate}
 */
const PLAYER_POSITION = Object.freeze({
  x: 256,
  y: 316,
});
export class PlayerBattleMonster extends BattleMonster {
  /**
   * @type {Phaser.GameObjects.Text}
   */
  #healthBarTextGameObject;
  /**
   *
   * @param {import("../../types/typedef").BattleMonsterConfig} config
   */
  constructor(config) {
    super(config, PLAYER_POSITION);
    this._phaserGameObject.setFlipX(true);
    this._phaserHealthBarGameContainer.setPosition(556, 318);
    this.#addHealthBarComponents();
  }

  #setHealthBarText() {
    this.#healthBarTextGameObject.setText(
      `${this._currentHealth}/${this._maxHealth}`
    );
  }

  #addHealthBarComponents() {
    this.#healthBarTextGameObject = this._scene.add
      .text(
        443,
        80,
        "",
        {
          color: "#7E3D3F",
          fontSize: "16px",
        }
        //added set origin 1,0 so that it will always align with the health bar
      )
      .setOrigin(1, 0);

    this.#setHealthBarText();

    this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);
  }

  /**
   *
   * @param {number} damage
   * @param {()=> void} [callback]
   */
  takeDamage(damage, callback) {
    // update current monster health and animate health bar
    super.takeDamage(damage, callback);
    this.#setHealthBarText();
  }

  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playMonsterAppearAnimation(callback) {
    const startXPos = -30;
    const endXPos = PLAYER_POSITION.x;
    this._phaserGameObject.setPosition(startXPos, PLAYER_POSITION.y);
    this._phaserGameObject.setAlpha(1);

    if(this._skipBattleAnimations){
      this._phaserGameObject.setX(endXPos)
      callback()
      return
    }
    
    this._scene.tweens.add({
      delay: 0,
      duration: 800,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }
  /**
   * methods that expect child class to override
   * @param {()=>void} callback
   * @returns {void}
   */
  playMonsterHealthBarAppearAnimation(callback) {
    const startXPos = 800;
    const endXPos = this._phaserHealthBarGameContainer.x;
    this._phaserHealthBarGameContainer.setPosition(
      startXPos,
      this._phaserHealthBarGameContainer.y
    );
    this._phaserHealthBarGameContainer.setAlpha(1);

    if(this._skipBattleAnimations){
      this._phaserHealthBarGameContainer.setX(endXPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 800,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos,
      },
      targets: this._phaserHealthBarGameContainer,
      onComplete: () => {
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
    const startYPos = this._phaserGameObject.y;
    const endYPos = startYPos + 400;

    if(this._skipBattleAnimations){
      this._phaserGameObject.setY(endYPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 2000,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        callback();
      },
    });
  }
}
