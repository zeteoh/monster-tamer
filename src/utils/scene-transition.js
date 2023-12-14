/**
 *
 * @param {Phaser.Scene} scene
 * @param {object} [options]
 * @param {()=>void} [options.callback]
 * @param {boolean} [options.skipSceneTransition=false]
 *
 */
export function createSceneTransition(scene, options) {
    const skipSceneTransition = options?.skipSceneTransition || false;
    if(skipSceneTransition){
        if (options?.callback){
            options.callback()
        }
        return
    }

    const {width, height} = scene.scale;
    /**
     * first two parameters are positions
     */
    const rectShape = new Phaser.Geom.Rectangle(0, height/2, width, 0)
    //setdepth sets the depth of kind of like the z element. setting 1 makes our rect visible
    const g = scene.add.graphics().fillRectShape(rectShape).setDepth(-1)
    // we need to set depth to -1 since mask will only render elements below the current screen
    // as in mask will only work on a lower priority element
    // note: mask is just another game object
    const mask = g.createGeometryMask()
    scene.cameras.main.setMask(mask)

    scene.tweens.add({
        onUpdate: () => {
            // without calling clear, it will fill the rect shape
            // on top of the previous rect instead 
            // clear will clear the previous frame drawing and then
            // redraw with new dimensions and positions
            g.clear().fillRectShape(rectShape)
        },
        delay: 400,
        duration: 800,
        //height starts in the middle with 0,0
        height: {
            ease:  Phaser.Math.Easing.Expo.InOut,
            from: 0,
            start: 0,
            to: height,
        },
        // the 0 means the top of the canvas so the animation moves upwards
        y: {
            ease:  Phaser.Math.Easing.Expo.InOut,
            from: height /2 ,
            start: height /2,
            to: 0,
        },
        targets: rectShape,
        onComplete: () => {
            mask.destroy(),
            scene.cameras.main.clearMask()
            if (options?.callback){
                options.callback()
            }
        }
    })
}
