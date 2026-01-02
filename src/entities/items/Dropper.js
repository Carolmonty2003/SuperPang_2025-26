/**
 * Dropper Class
 * 
 * Central item drop manager for the game.
 * Spawns collectible items at specified positions with configurable drop rates.
 * 
 * Features:
 * - Weighted loot tables with configurable probabilities
 * - Maximum items on screen limit
 * - Forced/guaranteed drops for debugging
 * - Spawns items with initial velocity and physics
 * - Automatic cleanup of expired items
 * 
 * Usage:
 * ```javascript
 * const dropper = new Dropper(scene);
 * dropper.dropFrom(enemy, enemy.x, enemy.y); // Drop random item from enemy
 * dropper.dropFrom(enemy, x, y, { itemType: 'SCORE_BONUS' }); // Force specific item
 * ```
 */

import { ScoreBonus, SCORE_VARIANT } from './drops/ScoreBonus.js';
import { PowerUpLife } from './drops/PowerUpLife.js';
import { PowerUpShield } from './drops/PowerUpShield.js';
import { PowerUpSpeed } from './drops/PowerUpSpeed.js';
import { PowerUpWeapon } from './drops/PowerUpWeapon.js';

// Default loot table with weighted probabilities
export const DEFAULT_LOOT_TABLE = [
  { type: 'SCORE_BONUS', weight: 40, variant: 'SMALL' },    // 40% - Small fruit (100 pts)
  { type: 'SCORE_BONUS', weight: 25, variant: 'MEDIUM' },   // 25% - Medium fruit (250 pts)
  { type: 'SCORE_BONUS', weight: 15, variant: 'LARGE' },    // 15% - Large fruit (500 pts)
  { type: 'SCORE_BONUS', weight: 5, variant: 'SPECIAL' },   // 5% - Special fruit (1000 pts)
  { type: 'POWER_UP_SPEED', weight: 8 },                    // 8% - Speed boost
  { type: 'POWER_UP_WEAPON', weight: 5 },                   // 5% - Weapon upgrade
  { type: 'POWER_UP_SHIELD', weight: 3 },                   // 3% - Shield
  { type: 'POWER_UP_LIFE', weight: 2 }                      // 2% - Extra life (rare)
  // Total: 103 weight units
];

export const DROPPER_CONFIG = {
  MAX_ITEMS_ON_SCREEN: 8, // Maximum active items at once
  DROP_CHANCE: 0.4, // 40% chance to drop something (0.0 - 1.0)
  INITIAL_VELOCITY_X_RANGE: [-100, 100], // Random horizontal velocity range
  INITIAL_VELOCITY_Y: -150, // Initial upward velocity (negative = up)
};

export class Dropper {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {object} [config] - Configuration options
   * @param {Array} [config.lootTable] - Custom loot table
   * @param {number} [config.maxItems] - Max items on screen
   * @param {number} [config.dropChance] - Base drop chance (0.0-1.0)
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    
    // Configuration
    this.lootTable = config.lootTable || DEFAULT_LOOT_TABLE;
    this.maxItems = config.maxItems !== undefined ? config.maxItems : DROPPER_CONFIG.MAX_ITEMS_ON_SCREEN;
    this.dropChance = config.dropChance !== undefined ? config.dropChance : DROPPER_CONFIG.DROP_CHANCE;
    
    // Active items tracking
    this.activeItems = [];
    
    // Calculate total weight for probability distribution
    this.totalWeight = this.lootTable.reduce((sum, entry) => sum + entry.weight, 0);
    
    console.log(`Dropper initialized: ${this.lootTable.length} item types, ${this.totalWeight} total weight`);
  }

  /**
   * Drop an item from an entity (e.g., destroyed enemy)
   * @param {object} entity - The entity dropping the item (for context)
   * @param {number} x - Drop X position
   * @param {number} y - Drop Y position
   * @param {object} [options] - Drop options
   * @param {string} [options.itemType] - Force specific item type (bypasses RNG)
   * @param {string} [options.variant] - Variant for the item (e.g., score bonus size)
   * @param {boolean} [options.guaranteed=false] - Guarantee a drop (ignore drop chance)
   * @param {number} [options.velocityX] - Override horizontal velocity
   * @param {number} [options.velocityY] - Override vertical velocity
   * @returns {BaseItem|null} - The dropped item or null if nothing dropped
   */
  dropFrom(entity, x, y, options = {}) {
    // Check if we should drop anything
    if (!options.guaranteed && Math.random() > this.dropChance) {
      return null; // No drop this time
    }
    
    // Check max items limit
    if (this.activeItems.length >= this.maxItems) {
      console.log('Drop cancelled: max items on screen');
      return null;
    }
    
    // Determine what item to drop
    let itemType = options.itemType;
    let variant = options.variant;
    
    if (!itemType) {
      // Select random item from loot table
      const selection = this.selectRandomItem();
      itemType = selection.type;
      variant = selection.variant;
    }
    
    // Create the item
    const item = this.createItem(itemType, x, y, variant);
    
    if (item) {
      // Set initial velocity
      const velX = options.velocityX !== undefined 
        ? options.velocityX 
        : Phaser.Math.Between(
            DROPPER_CONFIG.INITIAL_VELOCITY_X_RANGE[0],
            DROPPER_CONFIG.INITIAL_VELOCITY_X_RANGE[1]
          );
      const velY = options.velocityY !== undefined 
        ? options.velocityY 
        : DROPPER_CONFIG.INITIAL_VELOCITY_Y;
      
      item.body.setVelocity(velX, velY);
      
      // Track active item
      this.activeItems.push(item);
      
      // Remove from tracking when destroyed
      item.once('destroy', () => {
        const index = this.activeItems.indexOf(item);
        if (index > -1) {
          this.activeItems.splice(index, 1);
        }
      });
      
      console.log(`Dropped ${itemType}${variant ? ` (${variant})` : ''} at (${x}, ${y})`);
    }
    
    return item;
  }

  /**
   * Select a random item from the loot table based on weights
   * @returns {object} - Selected loot entry { type, weight, variant }
   */
  selectRandomItem() {
    const roll = Math.random() * this.totalWeight;
    let cumulative = 0;
    
    for (const entry of this.lootTable) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        return entry;
      }
    }
    
    // Fallback (shouldn't happen)
    return this.lootTable[0];
  }

  /**
   * Create an item instance based on type
   * @param {string} itemType - Type of item to create
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} [variant] - Item variant
   * @returns {BaseItem|null} - Created item or null
   */
  createItem(itemType, x, y, variant) {
    switch (itemType) {
      case 'SCORE_BONUS':
        return new ScoreBonus(this.scene, x, y, variant || 'MEDIUM');
      
      case 'POWER_UP_LIFE':
        return new PowerUpLife(this.scene, x, y);
      
      case 'POWER_UP_SHIELD':
        return new PowerUpShield(this.scene, x, y);
      
      case 'POWER_UP_SPEED':
        return new PowerUpSpeed(this.scene, x, y);
      
      case 'POWER_UP_WEAPON':
        return new PowerUpWeapon(this.scene, x, y);
      
      default:
        console.warn(`Unknown item type: ${itemType}`);
        return null;
    }
  }

  /**
   * Drop a specific item at a position (for debugging/testing)
   * @param {string} itemType - Type of item
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} [variant] - Item variant
   * @returns {BaseItem|null} - Created item or null
   */
  dropSpecific(itemType, x, y, variant) {
    return this.dropFrom(null, x, y, {
      itemType: itemType,
      variant: variant,
      guaranteed: true
    });
  }

  /**
   * Check item pickups with the hero
   * Call this in the scene's update() method
   * @param {Hero} hero - The hero to check collisions with
   */
  update(hero) {
    // Check each active item for pickup
    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const item = this.activeItems[i];
      
      if (item && item.active) {
        item.checkPickup(hero);
      }
    }
  }

  /**
   * Clear all active items (for level transitions, etc.)
   */
  clearAll() {
    this.activeItems.forEach(item => {
      if (item && item.active) {
        item.destroy();
      }
    });
    this.activeItems = [];
  }

  /**
   * Get current number of active items
   * @returns {number}
   */
  getActiveItemCount() {
    return this.activeItems.length;
  }

  /**
   * Set custom loot table
   * @param {Array} lootTable - New loot table
   */
  setLootTable(lootTable) {
    this.lootTable = lootTable;
    this.totalWeight = this.lootTable.reduce((sum, entry) => sum + entry.weight, 0);
    console.log(`Loot table updated: ${this.totalWeight} total weight`);
  }
}
