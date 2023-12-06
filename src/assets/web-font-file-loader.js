import * as WebFontLoader from "../lib/webfontloader.js";

export class WebFontFileLoader extends Phaser.Loader.File {
  /**
   * @type {string[]}
   */
  #fontNames;
  /**
   *
   * @param {Phaser.Loader.LoaderPlugin} loader
   * @param {string[]} fontName
   */
  constructor(loader, fontName) {
    super(loader, {
      //type of file to be loaded
      type: "webfont",
      key: fontName.toString(),
    });
    this.#fontNames = fontName;
  }

  load() {
    //web font loader
    WebFontLoader.default.load({
      custom: {
        families: this.#fontNames,
      },
      // will be invoked when families are loaded
      active: () => {
        this.loader.nextFile(this, true);
      },
      inactive: () => {
        console.error(
          `failed to load custon fonts ${JSON.stringify(this.#fontNames)}`
        );
        // tells phaser to continue to load even though font cannot be found
        // will load the default font instead
        this.loader.nextFile(this, false);
      },
    });
  }
}
