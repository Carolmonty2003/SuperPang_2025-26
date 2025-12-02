import { GAME_SIZE, PHYSICS, RENDER, SCALE } from "../core/constants.js";

/**
 * Define y devuelve el objeto de configuración con el que instanciaremos el motor de phaser.
 *
 * Esta función centraliza toda la configuración del juego (tamaño, físicas,
 * renderizado, escenas, etc.), utilizando las constantes definidas en core/constants.js
 */

export function buildConfig({ scenes = [] } = {}) 
{
    return {
        type: Phaser.AUTO,
        width: GAME_SIZE.WIDTH,
        height: GAME_SIZE.HEIGHT,
        scale: {
            // Usar NONE hace que el canvas tenga exactamente WIDTHxHEIGHT (no escalado automático)
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: GAME_SIZE.WIDTH,
            height: GAME_SIZE.HEIGHT
        },
        pixelArt: RENDER.PIXEL_ART,
        physics: {
            default: PHYSICS.TYPE,
            arcade: {
                gravity: { y: PHYSICS.GRAVITY },
                debug: PHYSICS.DEBUG
            }
        },
        scene: scenes
    };
}