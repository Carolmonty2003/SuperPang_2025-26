# Items & Drops System - Integration Guide

## Overview

The items system provides a complete drop and pickup mechanism for your Super Pang game. All items inherit from `BaseItem` and share common behavior (physics, collision, TTL), while each item type implements its unique effect.

## Quick Start

### 1. Import the Dropper in Your Scene

```javascript
import { Dropper } from '../entities/items/Dropper.js';

export class Level_01 extends Phaser.Scene {
    create() {
        // ... other initialization ...
        
        // Initialize the dropper
        this.dropper = new Dropper(this);
    }
    
    update(time, delta) {
        // ... other updates ...
        
        // Check for item pickups with the hero
        if (this.hero && this.dropper) {
            this.dropper.update(this.hero);
        }
    }
}
```

### 2. Drop Items When Enemies Die

#### Example: Ball/Enemy Death

```javascript
// In your ball/enemy class (e.g., BaseBall.js, BaseEnemy.js):

destroy(fromScene) {
    // Drop an item when this enemy dies
    if (this.scene.dropper) {
        this.scene.dropper.dropFrom(this, this.x, this.y);
    }
    
    super.destroy(fromScene);
}
```

#### Example: Specific Ball Sizes Drop Different Items

```javascript
// In HugeBall.js or BigBall.js:

destroy(fromScene) {
    // Huge balls have a higher chance to drop rare items
    if (this.scene.dropper) {
        this.scene.dropper.dropFrom(this, this.x, this.y, {
            guaranteed: true // Force a drop (100% chance)
        });
    }
    
    super.destroy(fromScene);
}

// In SmallBall.js or TinyBall.js:

destroy(fromScene) {
    // Small balls have normal drop chance
    if (this.scene.dropper) {
        this.scene.dropper.dropFrom(this, this.x, this.y);
    }
    
    super.destroy(fromScene);
}
```

### 3. Force Specific Item Drops (For Testing/Debugging)

```javascript
// Drop a specific item type
this.dropper.dropFrom(enemy, x, y, {
    itemType: 'POWER_UP_WEAPON',
    guaranteed: true
});

// Drop a specific score bonus variant
this.dropper.dropFrom(enemy, x, y, {
    itemType: 'SCORE_BONUS',
    variant: 'SPECIAL', // 1000 points
    guaranteed: true
});

// Or use dropSpecific for quick testing
this.dropper.dropSpecific('POWER_UP_LIFE', 400, 300);
```

### 4. Customize Drop Rates (Optional)

```javascript
// Create custom loot table
const customLootTable = [
    { type: 'SCORE_BONUS', weight: 50, variant: 'SMALL' },
    { type: 'POWER_UP_WEAPON', weight: 20 },
    { type: 'POWER_UP_LIFE', weight: 10 }
];

this.dropper = new Dropper(this, {
    lootTable: customLootTable,
    maxItems: 10,
    dropChance: 0.6 // 60% drop chance
});
```

## Item Types

### Score Bonuses
- **SMALL**: 100 points (common fruit)
- **MEDIUM**: 250 points (apple)
- **LARGE**: 500 points (melon)
- **SPECIAL**: 1000 points (golden fruit, rare)

### Power-Ups
- **POWER_UP_LIFE**: Grants +1 life (rare)
- **POWER_UP_SHIELD**: 5 seconds of invulnerability (cyan glow)
- **POWER_UP_SPEED**: 8 seconds of 1.5x speed boost (yellow glow)
- **POWER_UP_WEAPON**: Upgrades weapon to next level (orange glow)

## Weapon Level System

The weapon upgrade system is level-based:

| Level | Description | Stats |
|-------|-------------|-------|
| 0 | Basic | 1 shot, normal speed |
| 1 | Fast | 1 shot, +30% speed |
| 2 | Double | 2 shots, 15° spread |
| 3 | Triple | 3 shots, 20° spread, +10% reach |
| 4 | Quad | 4 shots, 25° spread, +20% reach |
| 5 | MAX | 5 shots, 30° spread, +30% reach, rapid-fire |

Access weapon stats in your hero's shooting logic:
```javascript
const level = this.weaponLevel || 0;
const stats = this.weaponStats; // Contains shots, speedMultiplier, spread, etc.
```

## Advanced Integration

### Custom Drop Scenarios

```javascript
// Boss defeated - guaranteed rare drop
this.dropper.dropFrom(boss, boss.x, boss.y, {
    itemType: 'POWER_UP_LIFE',
    guaranteed: true,
    velocityY: -300 // Launch upward
});

// Breakable platform - drop items when broken
platform.on('break', () => {
    this.dropper.dropFrom(platform, platform.x, platform.y, {
        itemType: 'SCORE_BONUS',
        variant: 'MEDIUM',
        guaranteed: true
    });
});
```

### Level Transitions

```javascript
// Clear all items when transitioning levels
onLevelComplete() {
    this.dropper.clearAll();
    this.hero.resetPowerUps(); // Clear active buffs
}
```

### Item Limit Management

```javascript
// Check if at max capacity before forcing drops
if (this.dropper.getActiveItemCount() < this.dropper.maxItems) {
    this.dropper.dropSpecific('POWER_UP_WEAPON', x, y);
}
```

## Hero Methods

The Hero class now has these item-related methods:

```javascript
// Score
hero.addScore(points);

// Lives
hero.addLife(1);

// Shield (5 seconds of invulnerability)
hero.setShield(duration);

// Speed Boost (1.5x speed for 8 seconds)
hero.applySpeedBuff(multiplier, duration);

// Weapon Upgrade
hero.upgradeWeapon();

// Reset all power-ups (on death/level change)
hero.resetPowerUps();
```

## Events

Listen to item-related events:

```javascript
this.game.events.on('hero:life_gained', (lives) => {
    console.log(`Hero now has ${lives} lives`);
});

this.game.events.on('hero:weapon_upgraded', (level) => {
    console.log(`Weapon upgraded to level ${level}`);
});

this.game.events.on('game:score_change', (points) => {
    console.log(`Score increased by ${points}`);
});
```

## Testing Tips

1. **Force drops for testing**: Use `guaranteed: true` option
2. **Test specific items**: Use `dropper.dropSpecific(type, x, y)`
3. **Adjust drop rates**: Modify `DEFAULT_LOOT_TABLE` in Dropper.js
4. **Debug item spawning**: Check console logs for drop confirmations
5. **Test max items**: Set `maxItems: 3` to quickly reach the limit

## Visual Placeholders

Currently, items use placeholder texture keys. You'll need to load these textures in your scene:

```javascript
preload() {
    // Score bonuses
    this.load.image('item_fruit_small', 'assets/sprites/items/fruit_small.png');
    this.load.image('item_fruit_medium', 'assets/sprites/items/fruit_medium.png');
    this.load.image('item_fruit_large', 'assets/sprites/items/fruit_large.png');
    this.load.image('item_fruit_special', 'assets/sprites/items/fruit_special.png');
    
    // Power-ups
    this.load.image('item_life', 'assets/sprites/items/heart.png');
    this.load.image('item_shield', 'assets/sprites/items/shield.png');
    this.load.image('item_speed', 'assets/sprites/items/lightning.png');
    this.load.image('item_weapon', 'assets/sprites/items/weapon.png');
}
```

Or use temporary colored rectangles for testing:

```javascript
create() {
    // Create colored rectangles as placeholder items
    const graphics = this.add.graphics();
    
    // Small fruit (red)
    graphics.fillStyle(0xFF0000);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('item_fruit_small', 20, 20);
    
    // Repeat for other items...
    graphics.destroy();
}
```

## Performance Considerations

- **Max Items**: Default is 8 items on screen. Adjust based on performance.
- **TTL**: Items auto-despawn after their TTL expires (saves memory).
- **Cleanup**: Always call `dropper.clearAll()` on level transitions.

## Summary

The items system is fully functional and ready to use. Simply:
1. Initialize `Dropper` in your scene's `create()`
2. Call `dropper.update(hero)` in your scene's `update()`
3. Call `dropper.dropFrom(enemy, x, y)` when enemies die
4. Customize drop rates and loot tables as needed

All items will automatically spawn, fall, collide with the world, and be picked up by the hero with appropriate visual feedback and effects!
