/**
 * MINIMAL INTEGRATION EXAMPLE
 * 
 * This file shows the minimal code needed to integrate the items system
 * into your Level_01 scene.
 */

// ============================================================
// STEP 1: Import the Dropper in your level scene
// ============================================================

import { Dropper } from '../entities/items/Dropper.js';

export class Level_01 extends Phaser.Scene {
    
    // ============================================================
    // STEP 2: Initialize the dropper in create()
    // ============================================================
    
    create() {
        // ... your existing code (platforms, hero, enemies, etc.) ...
        
        // Initialize the item dropper
        this.dropper = new Dropper(this);
        
        // Optional: customize drop settings
        // this.dropper = new Dropper(this, {
        //     dropChance: 0.5,    // 50% drop chance
        //     maxItems: 10        // max 10 items on screen
        // });
    }
    
    // ============================================================
    // STEP 3: Update the dropper in update()
    // ============================================================
    
    update(time, delta) {
        // ... your existing update code ...
        
        // Check for item pickups with the hero
        if (this.hero && this.dropper) {
            this.dropper.update(this.hero);
        }
    }
}

// ============================================================
// STEP 4: Call dropFrom() when enemies are destroyed
// ============================================================

// In your ball/enemy classes (e.g., BaseBall.js, BigBall.js, etc.):

export class BigBall extends BaseBall {
    
    destroy(fromScene) {
        // Drop an item when this ball is destroyed
        if (this.scene.dropper) {
            this.scene.dropper.dropFrom(this, this.x, this.y);
        }
        
        // ... your existing destroy logic ...
        super.destroy(fromScene);
    }
}

// ============================================================
// STEP 5 (OPTIONAL): Force drops for testing
// ============================================================

// In your scene, create a test key to spawn items:
create() {
    // ... existing code ...
    
    // Debug key to test item drops
    this.input.keyboard.on('keydown-T', () => {
        if (this.hero) {
            // Drop a weapon powerup at hero's position
            this.dropper.dropSpecific('POWER_UP_WEAPON', this.hero.x, this.hero.y - 50);
        }
    });
    
    this.input.keyboard.on('keydown-Y', () => {
        if (this.hero) {
            // Drop a life powerup
            this.dropper.dropSpecific('POWER_UP_LIFE', this.hero.x, this.hero.y - 50);
        }
    });
}

// ============================================================
// THAT'S IT! The system is now fully integrated.
// ============================================================

/**
 * WHAT HAPPENS NOW:
 * 
 * 1. When enemies die, they have a 40% chance to drop an item
 * 2. Items spawn with physics (fall, bounce)
 * 3. Items auto-despawn after their TTL (8-10 seconds)
 * 4. Hero picks up items by touching them
 * 5. Each item applies its unique effect:
 *    - Score bonuses add points
 *    - Life adds +1 life
 *    - Shield grants invulnerability
 *    - Speed boosts movement
 *    - Weapon upgrades the weapon level
 * 
 * All visual feedback (floating text, tints, animations) is automatic!
 */

// ============================================================
// OPTIONAL: Load item textures
// ============================================================

// In your scene's preload():
preload() {
    // Option 1: Load actual sprites
    this.load.image('item_fruit_small', 'assets/sprites/items/cherry.png');
    this.load.image('item_fruit_medium', 'assets/sprites/items/apple.png');
    this.load.image('item_fruit_large', 'assets/sprites/items/melon.png');
    this.load.image('item_fruit_special', 'assets/sprites/items/golden_fruit.png');
    this.load.image('item_life', 'assets/sprites/items/heart.png');
    this.load.image('item_shield', 'assets/sprites/items/shield.png');
    this.load.image('item_speed', 'assets/sprites/items/lightning.png');
    this.load.image('item_weapon', 'assets/sprites/items/weapon.png');
    
    // Option 2: Create simple colored rectangles as placeholders
}

// In your scene's create() (for placeholder textures):
create() {
    const graphics = this.add.graphics();
    
    // Score bonuses (fruits)
    graphics.fillStyle(0xFF0000); // Red
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('item_fruit_small', 20, 20);
    graphics.clear();
    
    graphics.fillStyle(0xFF6600); // Orange
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('item_fruit_medium', 24, 24);
    graphics.clear();
    
    graphics.fillStyle(0xFFAA00); // Yellow
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('item_fruit_large', 30, 30);
    graphics.clear();
    
    graphics.fillStyle(0xFFD700); // Gold
    graphics.fillStar(12, 12, 5, 12, 6);
    graphics.generateTexture('item_fruit_special', 24, 24);
    graphics.clear();
    
    // Power-ups
    graphics.fillStyle(0xFF1493); // Pink (life)
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('item_life', 24, 24);
    graphics.clear();
    
    graphics.fillStyle(0x00FFFF); // Cyan (shield)
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('item_shield', 24, 24);
    graphics.clear();
    
    graphics.fillStyle(0xFFFF00); // Yellow (speed)
    graphics.fillTriangle(12, 4, 20, 12, 12, 20);
    graphics.generateTexture('item_speed', 24, 24);
    graphics.clear();
    
    graphics.fillStyle(0xFF6600); // Orange (weapon)
    graphics.fillRect(6, 6, 12, 12);
    graphics.generateTexture('item_weapon', 24, 24);
    graphics.clear();
    
    graphics.destroy();
    
    // ... rest of your create code ...
}
