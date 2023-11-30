import Phaser from './lib/phaser.js'
import { PreloadScene } from './scenes/preload-scene.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';
//allows you to create a game instance
const game = new Phaser.Game({
    parent:'game-container',
});

//creates a scene
game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
// game.scene.start(SCENE_KEYS.PRELOAD_SCENE);