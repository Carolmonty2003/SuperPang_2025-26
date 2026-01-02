import { BasePlatform } from './BasePlatform.js';

/**
 * MovingPlatform - Platform that moves in a pattern
 * 
 * Platform that moves horizontally, vertically, or in custom patterns.
 */
export class MovingPlatform extends BasePlatform {
  constructor(scene, x, y, texture, movePattern = 'HORIZONTAL') {
    super(scene, x, y, texture, 'MOVING');
    
    this.movePattern = movePattern;
    this.moveSpeed = 100;
    this.moveDistance = 200;
    this.startX = x;
    this.startY = y;
    
    // TODO: Set immovable = true (moving but not pushable)
    // TODO: Initialize movement pattern
    // TODO: Set up tween for movement
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // TODO: Update movement based on pattern
    // TODO: Reverse direction at bounds
  }
}
