import { BasePlatform } from './BasePlatform.js';

/**
 * BreakablePlatform - Platform that breaks after being hit
 * 
 * Platform that can be destroyed after X hits or after standing on it.
 */
export class BreakablePlatform extends BasePlatform {
  constructor(scene, x, y, texture, hitsToBreak = 1) {
    super(scene, x, y, texture, 'BREAKABLE');
    
    this.hitsToBreak = hitsToBreak;
    this.currentHits = 0;
    this.isBreaking = false;
    
    // TODO: Set up break animation
    // TODO: Configure collision
  }

  onHit(object) {
    super.onHit(object);
    
    this.currentHits++;
    
    // TODO: Shake/crack visual effect
    
    if (this.currentHits >= this.hitsToBreak) {
      this.break();
    }
  }

  break() {
    if (this.isBreaking) return;
    
    this.isBreaking = true;
    
    // TODO: Play break animation
    // TODO: Disable collision
    // TODO: Destroy platform after animation
  }
}
