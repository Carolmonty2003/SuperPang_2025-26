/**
 * Crocodile Enemy Constants
 * 
 * Configuration values for crocodile enemies in Super Pang.
 */

// Crocodile score (points awarded when launched and explodes)
export const CROCODILE_SCORE = 200;

// Crocodile patrol speed (horizontal velocity)
export const CROCODILE_SPEED = 80; // Slower than hero

// Crocodile behavior timers
export const CROCODILE_TIMERS = {
  MIN_PATROL_TIME: 10000,    // 10 seconds minimum patrol at lowest level
  LADDER_CHECK_COOLDOWN: 1000, // 1 second between ladder checks
  STUN_DURATION: 999999      // Infinite until player collision
};

// Crocodile physics
export const CROCODILE_PHYSICS = {
  DESCEND_SPEED: 100,        // Speed going down ladders
  LAUNCH_VELOCITY_X: 300,    // Horizontal launch speed when hit by player
  LAUNCH_VELOCITY_Y: -200,   // Upward launch speed when hit by player
  EDGE_CHECK_DISTANCE: 16    // Distance to check for platform edges
};

// Crocodile colors/tints (for variety)
export const CROCODILE_COLORS = {
  GREEN: 0x00ff00,
  DARK_GREEN: 0x008800,
  BLUE_GREEN: 0x00cc88,
  YELLOW_GREEN: 0x88cc00,
  BROWN: 0x8B4513
};

// Crocodile spawn positions (recommended Y levels)
export const CROCODILE_SPAWN_LEVELS = {
  TOP: 100,
  MID_HIGH: 250,
  MID: 400,
  MID_LOW: 550,
  BOTTOM: 700
};
