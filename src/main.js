//cargamos el Intellisense
/// <reference path="./type/phaser.d.ts"/>

//importamos la configuración del juego
import { buildConfig } from "./core/config.js";
//importamos los menus
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { SelectModeScene } from './scenes/SelectModeScene.js';
import { OptionsMenu } from './scenes/OptionsMenu.js';
import { PauseMenu } from './scenes/PauseMenu.js';
//import { Hud } from './scenes/Hud.js';

//importamos las escenas
import  {Level1} from './scenes/Level1.js';
import Level_01 from "./scenes/Level_01.js";

//import { level2 } from "./scenes/level2.js";
//import { Hud } from "./scenes/hud.js";

const game = new Phaser.Game(buildConfig({
    scenes: [
        //Boot, // si hay una escena de carga
        MainMenuScene,
        SelectModeScene,
        OptionsMenu,
        PauseMenu,
        Level1,
        Level_01,
        /*, level2, Hud*/
    ]
}));