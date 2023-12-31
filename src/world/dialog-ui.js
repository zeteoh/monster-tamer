import Phaser from "../lib/phaser.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { CANNOT_READ_SIGN_TEXT } from "../utils/text-utils.js";
import { UI_ASSET_KEYS } from "../assets/asset-key.js";

/**
 * @type{Phaser.Types.GameObjects.Text.TextStyle}
 */
const UI_TEXT_STYLE = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: "black",
  fontSize: "32px",
  wordWrap: { width: 0 },
});

export class DialogUi {
  /**
   * @type {Phaser.Scene}
   */
  #scene;
  /**
   * @type {number}
   */
  #padding;
  /**
   * @type {number}
   */
  #width;
  /**
   * @type {number}
   */
  #height;
  /**
   * @type {Phaser.GameObjects.Container}
   */
  #container;
  /**
   * @type {boolean}
   */
  #isVisible;
  /**
   *@type {Phaser.GameObjects.Image}
   */
  #userInputCursor;
  /**
   *@type {Phaser.Tweens.Tween}
   */
  #userInputCursorTween;
  /**
   *@type {Phaser.GameObjects.Text}
   */
  #uiText;
  /**
   * @type {boolean}
   */
  #textAnimationPlaying;
  /**
   * @type {string[]}
   */
  #messagesToShow;
  constructor(scene, width) {
    this.#scene = scene;
    this.#padding = 90;
    this.#width = width - this.#padding * 2;
    this.#height = 124;
    this.#textAnimationPlaying = false;
    this.#messagesToShow = [];

    const panel = this.#scene.add
      .rectangle(0, 0, this.#width, this.#height, 0xede4f3, 0.9)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);
    this.#container = this.#scene.add.container(0, 0, [panel]);
    this.#uiText = this.#scene.add.text(18, 12, CANNOT_READ_SIGN_TEXT, {
      ...UI_TEXT_STYLE,
      // the below will let us overwrite it with our new calculated width for it to be dynamic
      ...{ wordWrap: { width: this.#width - 18 } },
    });
    this.#container.add(this.#uiText);
    this.#createPlayerInputCursor();
    this.hideDialogModal();
  }

  /**
   * @type {boolean}
   */
  get isVisible() {
    return this.#isVisible;
  }

  /**
   * updating position of our container so that it will be updated dynamically depending on where the camera is pointing at
   */
  showDialogModal() {
    const { x, bottom } = this.#scene.cameras.main.worldView;
    const startX = x + this.#padding;
    // bumps the container up by subtracting the height
    const startY = bottom - this.#height - this.#padding / 4;

    this.#container.setPosition(startX, startY);
    this.#userInputCursorTween.restart();
    this.#container.setAlpha(1);

    this.#isVisible = true;
  }

  hideDialogModal() {
    this.#container.setAlpha(0);
    this.#userInputCursorTween.pause();
    this.#isVisible = false;
  }

  #createPlayerInputCursor() {
    const y = this.#height - 24;
    this.#userInputCursor = this.#scene.add.image(
      this.#width - 16,
      y,
      UI_ASSET_KEYS.CURSOR
    );
    this.#userInputCursor.setAngle(90).setScale(4.5, 2);
    this.#userInputCursorTween = this.#scene.add.tween({
      delay: 0,
      duration: 500,
      //play at a repeat unless we manually stop it
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      targets: this.#userInputCursor,
    });
    // pause it when the game object is hidden
    this.#userInputCursorTween.pause();
    this.#container.add(this.#userInputCursor);
  }
}
