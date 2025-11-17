import { GAME_SIZE, PHYSICS, RENDER, SCALE } from "../core/constants.js"; 

/**
 * Define y devuelve el objeto de configuración con el que instanciaremos el motor de phaser.
 * 
 * Esta función centraliza toda la configuración del juego (tamaño, físicas, 
 * renderizado, escenas, etc.), utilizando las constantes definidas en core/constants.js
 * 
 * Recibiendo como parámetris un obeto que puede inc
 */

export function buildConfig({scenes = []} = {}) 
{
    return {
        type: Phaser.AUTO,
        width: GAME_SIZE.WIDTH,
        height: GAME_SIZE.HEIGHT,
        scene: scenes,
        render: { pixelArt: RENDER.PIXEL_ART },
        physics: {
            default: PHYSICS.type,
            arcade: {
                gravity: { y: PHYSICS.GRAVITY },
                debug: PHYSICS.DEBUG
            },
        },
        scale: {
            mode: Phaser.Scale[SCALE.MODE],
            autoCenter: Phaser.Scale[SCALE.AUTO_CENTER]
        }
    }
}