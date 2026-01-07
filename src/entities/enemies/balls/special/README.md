# Special Ball Implementation - Clock/Star Ball

## Overview

Implemented a new special ball type that changes appearance every time it bounces off the floor. Unlike normal balls, special balls **don't split** when destroyed.

## Features

### Special Ball Characteristics

1. **No Splitting**: When destroyed, special balls don't create smaller balls
2. **Two Sizes**: Big and Mid (no tiny or small variants)
3. **Floor-Bounce Transformation**: Changes between Clock and Star variants each floor bounce
4. **Animated Spritesheets**: Uses 1x2 spritesheets with 2 frames

### Variants

| Variant | Frame | Tint Color | Description |
|---------|-------|------------|-------------|
| **Clock** | 0 | Green (0x00ff00) | Initial state |
| **Star** | 1 | Orange (0xff8800) | Alternate state |

### Spritesheets

| Ball Size | Spritesheet | Dimensions | Frame Size |
|-----------|-------------|------------|------------|
| **Big** | `sp_big.png` | 100x42 | 100x42 (1x2 frames) |
| **Mid** | `sp_mid.png` | 68x28 | 68x28 (1x2 frames) |

Frame 0 = Clock, Frame 1 = Star

## Files Created

```
src/entities/enemies/balls/special/
├── BaseSpecialBall.js       (Base class with switching logic)
├── SpecialBigBall.js         (Large special ball)
└── SpecialMidBall.js         (Medium special ball)
```

## Implementation Details

### BaseSpecialBall.js

Core functionality:
- **Variant Tracking**: Monitors current variant (Clock or Star)
- **Floor Detection**: Uses `body.blocked.down` and `body.touching.down`
- **Automatic Switching**: Calls `switchVariant()` when floor bounce detected
- **No Splitting**: `nextBallType = null` (doesn't create child balls)
- **Tinting**: Applies green for Clock, orange for Star

Key method:
```javascript
switchVariant() {
    // Toggle between frame 0 and 1
    this.currentVariant = (currentVariant === 0) ? 1 : 0;
    this.setFrame(this.currentVariant);
    this.setTint(newTint);
}
```

### SpecialBigBall.js & SpecialMidBall.js

Simple subclasses that specify:
- Texture key (`sp_big` or `sp_mid`)
- Speed multiplier
- Score value (2x normal ball scores)

## Integration

### Level1.js Changes

1. **Spritesheet Loading**:
```javascript
this.load.spritesheet('sp_big', 'sp_big.png', {
    frameWidth: 100,
    frameHeight: 42
});
this.load.spritesheet('sp_mid', 'sp_mid.png', {
    frameWidth: 68,
    frameHeight: 28
});
```

2. **Mode Detection**:
```javascript
init(data) {
    this.gameMode = data.mode || 'normal';
}
```

3. **Conditional Spawning**:
```javascript
if (this.gameMode === 'panic') {
    ball = new SpecialBigBall(this, startX, startY, 1);
} else {
    ball = new HexBigBall(this, startX, startY, 1, 1);
}
```

## Testing

### How to Test

1. **Start Game** → Select "PANIC MODE" from menu
2. **Observe**: Special Big Ball spawns (starts as green Clock)
3. **Watch**: Ball bounces and changes to orange Star on floor bounce
4. **Continue**: Ball alternates Clock ↔ Star on each floor bounce
5. **Destroy**: Ball gives points but doesn't split

### Expected Behavior

- Ball starts green (Clock variant)
- First floor bounce → Changes to orange (Star variant)
- Second floor bounce → Back to green (Clock)
- Pattern repeats indefinitely
- Wall/ceiling bounces do NOT trigger transformation
- Only floor bounces change the variant

## Visual Feedback

- **Console Logs**: `"Special ball switched to CLOCK (green)"` or `"Special ball switched to STAR (orange)"`
- **Tint Changes**: Green (0x00ff00) ↔ Orange (0xff8800)
- **Frame Changes**: Spritesheet frame 0 ↔ 1

## Score Values

- **SpecialBigBall**: 40 points (2x normal big ball)
- **SpecialMidBall**: 60 points (2x normal mid ball)

## Physics

Same physics as normal balls:
- Gravity: 300
- Bounce: 1.0 (perfect bounce)
- Minimum bounce speed: 150
- Collision with world bounds

## Future Enhancements

Possible additions:
- Add Special Small/Tiny variants
- Different transformation triggers (time, hits, etc.)
- More variants (3+ frames)
- Special effects on transformation
- Sound effects on transformation

## Notes

- Special balls are designed for Panic Mode challenge
- They provide variety without the splitting complexity
- Floor-bounce detection is robust (uses both `blocked` and `touching`)
- Cooldown prevents multiple transformations in one bounce
- Works with all existing collision systems (hero, weapons, walls)
