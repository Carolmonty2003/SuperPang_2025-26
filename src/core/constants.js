/**
 * Constantes globales del juego.
 * No dependen de Phaser ni de instancias específicas.
 * Son valores inmutables que describen el "mundo" del juego.
 * src/core/constants.js
 */

export const GAME_SIZE = {
    WIDTH: 1536,    
    HEIGHT: 950
};

export const PHYSICS = {
    TYPE: 'arcade',
    GRAVITY: 1000,
    DEBUG: true // Ponlo en false para producción
};

export const HERO = {
    SPEED: 250,
    JUMP_FORCE: -450, // En Pang no se suele saltar mucho, pero por si acaso.
    MAX_LIVES: 3,
    LADDER_SPEED: 150
};

export const WEAPON = {
    HARPOON_SPEED: 800, // Velocidad de subida del arpón
    BULLET_SPEED: 600,
    BULLET_LIFESPAN: 1000
};

export const BALLS = {
    BALL_BOUNCE: 1, // Rebote perfecto 
    BALL_GRAVITY: 400, // Gravedad específica para bolas (flotan más)
    SPEED_X: 150
};

export const RENDER = {
    PIXEL_ART: true
};

export const SCALE = {
    MODE: 'FIT',
    AUTO_CENTER: 'CENTER_BOTH'
};

// Constantes para enemigos (añade/ajusta campos según uses en BaseEnemy)
export const ENEMY = {
    DEFAULT_SPEED: 100,
    DEFAULT_GRAVITY: 300,
    DEFAULT_BOUNCE: 1,
    BALL: {
        MIN_SIZE: 1,
        MAX_SIZE: 4
    }
};
