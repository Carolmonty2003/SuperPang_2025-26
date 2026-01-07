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
        POWER_UP_WEAPON: 7000,
        WEAPON_TEMP_DOUBLE: 7000,
        WEAPON_TEMP_MACHINE: 7000,
        WEAPON_TEMP_FIXED: 7000,
        BOMB: 9000,
        TIME_FREEZE: 8000,
        TIME_SLOW: 8000
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
        SHIELD: 30000,      // 30 seconds shield duration
        SHIELD_INVULN_AFTER_BREAK: 1000, // 1 second invuln after shield breaks
        WEAPON_TEMP: 15000, // 15 seconds temporary weapon
        TIME_FREEZE: 10000, // 10 seconds time freeze
        TIME_SLOW: 12000    // 12 seconds slow motion
    },
    
    // Power-up multipliers
    MULTIPLIER: {
        SLOW_MOTION: 0.4 // 40% speed (60% slower)
    }
};

