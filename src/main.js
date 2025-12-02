//cargamos el Intellisense
/// <reference path="./type/phaser.d.ts"/>

//importamos la configuración del juego
import { buildConfig } from "./core/config.js";
//importamos los menus
import MainMenuScene from "./menus/MainMenuScene.js";
import SelectModeScene from "./menus/SelectModeScene.js";
//importamos las escenas
import  Level1 from './scenes/Level1.js';
//import { level2 } from "./scenes/level2.js";
//import { Hud } from "./scenes/hud.js";

const game = new Phaser.Game
(
    buildConfig({
        scenes: [
            //Boot, // si hay una escena de carga
            MainMenuScene,
            SelectModeScene,
            Level1,
            /*, level2, Hud*/
        ],
    })
);