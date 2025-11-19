/**
 * Constantes globales del juego.
 * No dependen de Phaser ni de instancias específicas.
 * Son valores inmutables que describen el "mundo" del juego.
 */

export const GAME_SIZE = {
  WIDTH: 1536,
  HEIGHT: 928, // 832 de juego + 96 de UI negra abajo
};

export const PHYSICS = {
  GRAVITY: 1000,
  DEBUG: true,
  type: "arcade",
};

export const HERO = {
  SPEED: 200,
  JUMP_FORCE: -450,
  MAX_LIVES: 7,
};

export const ENEMY = {
  SPEED: 120,
};

export const RENDER = {
  PIXEL_ART: true,
};

export const SCALE = {
  MODE: "FIT",
  AUTO_CENTER: "CENTER_BOTH",
};
