import { BasePlatform } from './BasePlatform.js';

/**
 * OneWayPlatform - Platform you can jump through from below
 * 
 * Platform that only blocks movement from above (hero can jump through from below).
 */
export class OneWayPlatform extends BasePlatform {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 'ONE_WAY');
    
    // TODO: Set up one-way collision (only block from top)
    // TODO: Configure collision faces
  }

  /**
   * Check if hero should collide with platform
   */
  shouldCollide(hero) {
    // TODO: Return true only if hero is above platform and falling
    // TODO: Allow hero to pass through from below
    return false;
  }
}
