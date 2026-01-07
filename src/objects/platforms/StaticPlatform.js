import { BasePlatform } from './BasePlatform.js';

/**
 * StaticPlatform - Standard immovable platform
 * 
 * Basic platform that doesn't move or break.
 */
export class StaticPlatform extends BasePlatform {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture, 'STATIC');
    
    // TODO: Set immovable = true
    // TODO: Configure collision
  }
}
