//cargamos el Intellisense
/// <reference path="./type/phaser.d.ts"/>

//importamos la configuración del juego
import { buildConfig } from "./core/config.js";

import { IntroScene } from './scenes/IntroScene.js';
//importamos los menus
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { SelectModeScene } from './scenes/SelectModeScene.js';
import { OptionsMenu } from './scenes/OptionsMenu.js';
import { PauseMenu } from './scenes/PauseMenu.js';
//import { Hud } from './scenes/Hud.js';

//importamos las escenas
import  {Level1} from './scenes/Level1.js';
import {PanicLevel} from "./scenes/PanicLevel.js";

//import { level2 } from "./scenes/level2.js";
//import { Hud } from "./scenes/hud.js";

const game = new Phaser.Game(buildConfig({
    scenes: [
        //Boot, // si hay una escena de carga
        IntroScene,
        MainMenuScene,
        SelectModeScene,
        OptionsMenu,
        PauseMenu,
        Level1,
        PanicLevel,
        /*, level2, Hud*/
    ]
}));