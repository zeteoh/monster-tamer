import Phaser from './lib/phaser.js'
import { BattleScene } from './scenes/battle-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';
import { WorldScene } from './scenes/world-scene.js';
//allows you to create a game instance
const game = new Phaser.Game({
    /**
     * @type-Phaser.AUTO,
     * setting the type to phaser.auto checks if webgl is supported, if it is, different
     * methods and function supports will be displayed, if not, it will display
     * the relevant 2D function support
     * type: Phaser.CANVAS switches the engine to CANVAS
     */
    type: Phaser.CANVAS,
    /**
     * @pixelArt - true,
     * TLDR: setting it to false makes it look nice and crisp, by default its false
     */
    pixelArt: false,
     /**
     * @scale
     * lets u scale out ur canvas space without having to calculate the width and height
     */
    scale: {
        parent:'game-container',
        width: 1024,
        height: 576,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    /**
     * @backgroundColor - #00000,
     * default background color of black
     */
});

//creates a scene
game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene)
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene)
game.scene.start(SCENE_KEYS.PRELOAD_SCENE)
// game.scene.start(SCENE_KEYS.PRELOAD_SCENE);