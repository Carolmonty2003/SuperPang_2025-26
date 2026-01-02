import { BaseItem } from './BaseItem.js';

/**
 * ScoreBonus - Collectible Score Item
 * 
 * Fruit-style collectible that grants score points when picked up.
 * Supports different variants with different score values:
 * - SMALL: 100 points (cherry)
 * - MEDIUM: 250 points (apple)
 * - LARGE: 500 points (melon)
 * - SPECIAL: 1000 points (golden fruit)
 */

// Score bonus variants configuration
export const SCORE_VARIANT = {
  SMALL: { points: 100, texture: 'item_fruit_small' },
  MEDIUM: { points: 250, texture: 'item_fruit_medium' },
  LARGE: { points: 500, texture: 'item_fruit_large' },
  SPECIAL: { points: 1000, texture: 'item_fruit_special' }
};

export class ScoreBonus extends BaseItem {
  /**
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string|number} [variant='MEDIUM'] - Variant key or custom points value
   */
  constructor(scene, x, y, variant = 'MEDIUM') {
    // Determine points and texture based on variant
    let points, texture;
    
    if (typeof variant === 'string' && SCORE_VARIANT[variant]) {
      points = SCORE_VARIANT[variant].points;
      texture = SCORE_VARIANT[variant].texture;
    } else if (typeof variant === 'number') {
      // Custom score value
      points = variant;
      texture = 'item_fruit_medium'; // Default texture
    } else {
      points = 250;
      texture = 'item_fruit_medium';
    }
    
    super(scene, x, y, texture, {
      itemType: 'SCORE_BONUS',
      ttl: 8000, // 8 seconds before despawn
      gravity: 500,
      bounce: 0.6
    });
    
    this.points = points;
    
    // Add rotation effect for visual appeal
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  /**
   * Apply score bonus to hero
   * @param {Hero} hero - The hero picking up this item
   */
  onPickup(hero) {
    // Add score to hero/game
    if (typeof hero.addScore === 'function') {
      hero.addScore(this.points);
    } else {
      // Fallback: emit event if hero doesn't have addScore method
      this.scene.game.events.emit('game:score_change', this.points);
    }
    
    // Show floating score text
    this.showFloatingScore();
    
    // Optional: play collection sound
    // this.scene.sound.play('item_score_pickup', { volume: 0.3 });
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
    
    // Animate text floating up and fading out
    this.scene.tweens.add({
      targets: scoreText,
      y: scoreText.y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        scoreText.destroy();
      }
    });
  }
}
