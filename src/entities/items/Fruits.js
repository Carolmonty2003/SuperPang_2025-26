import { BaseItem } from './BaseItem.js';
import { EVENTS } from '../../core/events.js';

/**
 * Fruits - Collectible Score Items
 * 
 * Fruit-style collectibles that grant score points when picked up.
 * Supports different variants with different score values.
 * 
 * NOTE: Sprites not yet implemented - using placeholder bonus spritesheet
 */

// Fruit variants configuration
export const FRUIT_VARIANT = {
  SMALL: { points: 100, name: 'Cherry' },      // Small fruit
  MEDIUM: { points: 250, name: 'Apple' },      // Medium fruit
  LARGE: { points: 500, name: 'Melon' },       // Large fruit
  SPECIAL: { points: 1000, name: 'Golden' }    // Special golden fruit
};

export class Fruits extends BaseItem {
  /**
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string|number} [variant='MEDIUM'] - Variant key or custom points value
   */
  constructor(scene, x, y, variant = 'MEDIUM') {
    // Determine points based on variant
    let points, name;
    
    if (typeof variant === 'string' && FRUIT_VARIANT[variant]) {
      points = FRUIT_VARIANT[variant].points;
      name = FRUIT_VARIANT[variant].name;
    } else if (typeof variant === 'number') {
      // Custom score value
      points = variant;
      name = 'Fruit';
    } else {
      points = 250;
      name = 'Apple';
    }
    
    super(scene, x, y, 'bonus', {
      itemType: 'FRUITS',
      ttl: 8000, // 8 seconds before despawn
      gravity: 500,
      bounce: 0.6
    });
    
    this.points = points;
    this.fruitName = name;
    
    // TODO: Set proper frame when fruit sprites are added
    // For now, using a placeholder from bonus spritesheet
    // this.setFrame(fruitFrameIndex);
  }

  /**
   * Apply score bonus to hero
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    // Add score using events system
    if (this.scene && this.scene.game && this.scene.game.events) {
      this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, this.points);
    }
    
    // Show floating score text
    this.showFloatingScore();
    
    // Optional: play collection sound
    // this.scene.sound.play('item_fruit_pickup', { volume: 0.3 });
  }

  /**
   * Display floating score text above the item
   */
  showFloatingScore() {
    const scoreText = this.scene.add.text(
      this.x,
      this.y - 20,
      `+${this.points}`,
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    scoreText.setDepth(100);
    
    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 60,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => scoreText.destroy()
    });
  }
}
