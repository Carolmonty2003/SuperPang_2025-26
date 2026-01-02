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
    BALL_BOUNCE: 1.0, // Rebote perfecto (100% de energía conservada)
    BALL_GRAVITY: 600, // Gravedad específica para bolas
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

// Constantes para el sistema de items y drops
export const ITEMS = {
    // Drop configuration
    DROP_CHANCE: 0.4, // 40% base drop chance
    MAX_ITEMS_ON_SCREEN: 8,
    
    // Item time-to-live (TTL) in milliseconds
    TTL: {
        SCORE_BONUS: 8000,
        POWER_UP_LIFE: 10000,
        POWER_UP_SHIELD: 8000,
        POWER_UP_SPEED: 9000,
        POWER_UP_WEAPON: 7000
    },
    
    // Score bonus values
    SCORE: {
        SMALL: 100,
        MEDIUM: 250,
        LARGE: 500,
        SPECIAL: 1000
    },
    
    // Power-up durations
    DURATION: {
        SHIELD: 5000,      // 5 seconds invulnerability
        SPEED_BOOST: 8000  // 8 seconds speed boost
    },
    
    // Power-up multipliers
    MULTIPLIER: {
        SPEED: 1.5 // 50% speed increase
    }
};

