import { HeroBase } from './HeroBase.js';
import { Harpoon } from './weapons/Harpoon.js';
import { FixedHarpoon } from './weapons/FixedHarpoon.js';
import { Bullet } from './weapons/Bullet.js';
import { EVENTS } from '../core/events.js';
import { WEAPON_LEVELS, MAX_WEAPON_LEVEL } from './items/powerups/PowerUpWeapon.js';
import { SHIELD_CONFIG } from './items/powerups/PowerUpShield.js';
import { SPEED_CONFIG } from './items/powerups/PowerUpSpeed.js';

// tipos de arma
export const HERO_WEAPON = {
    HARPOON: 1,
    GUN: 2,
    FIXED_HARPOON: 3,
};

export class Hero extends HeroBase 
{
    constructor(scene, x, y, texture = 'player') 
    {
        super(scene, x, y, texture);

        this.activeHarpoons = []; // Array to track multiple harpoons
        this.maxHarpoonsActive = 1; // Default: 1 harpoon at a time
        this.activeFixedHarpoon = null;
        this.isShooting = false;

        this.weaponType = HERO_WEAPON.HARPOON;

        // Sistema de vida e invencibilidad
        this.lives = 3; // Usar 'lives' para compatibilidad con HUD
        this.maxLives = 5; // Maximum lives the hero can have
        this.isInvulnerable = false;

        // Items system: score tracking
        this.score = 0;

        // Items system: power-up states
        this.hasShield = false;
        this.shieldTimer = null;
        this.speedBuffTimer = null;
        this.originalSpeed = null;
        this.weaponLevel = 0; // Start at base weapon level
        this.weaponStats = WEAPON_LEVELS[0]; // Initialize with base weapon stats

        // Climbing system
        this.isClimbing = false;
        this.currentLadder = null;
        this.ladderBounds = null;
        this.climbSpeed = 100;

        this.createAnimations();

        // cambio de arma
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

        this.key1.on('down', () => this.setWeapon(HERO_WEAPON.HARPOON));
        this.key2.on('down', () => this.setWeapon(HERO_WEAPON.GUN));
        this.key3.on('down', () => this.setWeapon(HERO_WEAPON.FIXED_HARPOON));
        this.key4.on('down', () => {
            // Toggle double harpoon upgrade
            const newState = this.maxHarpoonsActive === 1;
            this.setDoubleHarpoon(newState);
            const status = newState ? 'ON (2 max)' : 'OFF (1 max)';
            this.scene.game.events.emit('UI_WEAPON_CHANGE', `DOUBLE HARPOON: ${status}`);
        });

        this.play('idle');

        // Notificar al HUD que el héroe está listo
        this.scene.game.events.emit(EVENTS.hero.READY, this);
    }

    setWeapon(weaponType) {
        this.weaponType = weaponType;

        let modeText;
        if (weaponType === HERO_WEAPON.GUN) {
            modeText = 'MACHINE GUN';
        } else if (weaponType === HERO_WEAPON.FIXED_HARPOON) {
            modeText = 'FIXED HARPOON';
        } else {
            modeText = 'HARPOON';
        }

        this.scene.game.events.emit('UI_WEAPON_CHANGE', modeText);
    }

    createAnimations() {
        const anims = this.scene.anims;

        if (!anims.exists('idle')) {
            anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 3 }],
                frameRate: 1,
                repeat: -1,
            });
        }

        if (!anims.exists('run')) {
            anims.create({
                key: 'run',
                frames: anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!anims.exists('shoot')) {
            anims.create({
                key: 'shoot',
                frames: anims.generateFrameNumbers('player', { start: 4, end: 5 }),
                frameRate: 8,
                repeat: 0,
            });
        }

        // Climbing animations
        if (!anims.exists('climb_start')) {
            anims.create({
                key: 'climb_start',
                frames: [{ key: 'player', frame: 9 }],
                frameRate: 1,
                repeat: 0,
            });
        }

        if (!anims.exists('climb_loop')) {
            anims.create({
                key: 'climb_loop',
                frames: anims.generateFrameNumbers('player', { start: 10, end: 11 }),
                frameRate: 8,
                repeat: -1,
            });
        }

        if (!anims.exists('climb_end')) {
            anims.create({
                key: 'climb_end',
                frames: [{ key: 'player', frame: 12 }],
                frameRate: 1,
                repeat: 0,
            });
        }
    }

    handleShootingInput() {
        if (this.isShooting) return;

        if (this.weaponType === HERO_WEAPON.HARPOON) {
            // Clean up destroyed harpoons from array
            this.activeHarpoons = this.activeHarpoons.filter(h => h && h.active);
            // Check if we've reached the cap
            if (this.activeHarpoons.length >= this.maxHarpoonsActive) return;
        }

        if (this.weaponType === HERO_WEAPON.FIXED_HARPOON) {
            if (this.activeFixedHarpoon && this.activeFixedHarpoon.active) return;
        }

        this.isShooting = true;
        this.setVelocityX(0);
        this.play('shoot', true);

        if (this.weaponType === HERO_WEAPON.HARPOON) {
            this.shootHarpoon();
        } else if (this.weaponType === HERO_WEAPON.FIXED_HARPOON) {
            this.shootFixedHarpoon();
        } else {
            this.shootGunFan();
        }

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
            if (anim.key === 'shoot') this.isShooting = false;
        });
    }

    shootHarpoon() {
        // Calculate horizontal offset to prevent visual overlap when multiple harpoons exist
        let offsetX = 0;
        if (this.activeHarpoons.length > 0 && this.maxHarpoonsActive > 1) {
            // Alternate left/right offset: first harpoon left, second right
            offsetX = (this.activeHarpoons.length % 2 === 0) ? -15 : 15;
        }
        
        // Use 'arpon' sprite when double harpoon is enabled, otherwise use default 'arponFijo'
        const texture = this.maxHarpoonsActive > 1 ? 'arpon' : 'arponFijo';
        
        const harpoon = new Harpoon(this.scene, this.x + offsetX, this.y, texture);
        this.activeHarpoons.push(harpoon);
        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }

    shootFixedHarpoon() {
        this.activeFixedHarpoon = new FixedHarpoon(this.scene, this.x, this.y);
        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }

    shootGunFan() {
        const angles = [-80, -85, -90, -95, -100];
        const offsets = [-10, -5, 0, 5, 10]; // Offset horizontal para evitar superposición

        angles.forEach((angle, index) => {
            const bullet = new Bullet(this.scene, this.x + offsets[index], this.y - 40, 'bullet');

            if (this.scene.bullets) {
                this.scene.bullets.add(bullet);
            }

            bullet.setDepth(10);

            bullet.fire(angle);
        });

        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }

    takeDamage(amount = 1) {
        // Si ya es invulnerable, no recibe daño
        if (this.isInvulnerable) return;

        // SHIELD SYSTEM: Si tiene escudo, absorbe el golpe
        if (this.hasShield) {
            console.log('Shield blocked damage!');
            
            // El escudo se rompe
            this.hasShield = false;
            
            // Cancelar timer del escudo si existe
            if (this.shieldTimer) {
                this.shieldTimer.destroy();
                this.shieldTimer = null;
            }
            
            // Detener pulsación del escudo
            if (this._shieldPulse) {
                this._shieldPulse.stop();
                delete this._shieldPulse;
            }
            
            // Mostrar efecto visual de escudo roto
            this.showShieldBreakEffect();
            
            // Dar 1 segundo de invulnerabilidad después de romper el escudo
            this.isInvulnerable = true;
            
            // Parpadeo amarillo (escudo roto)
            const invulnDuration = SHIELD_CONFIG.INVULN_AFTER_BREAK || 1000;
            const blinkInterval = 100;
            let blinkCount = 0;
            const maxBlinks = invulnDuration / blinkInterval;
            
            const blinkTimer = this.scene.time.addEvent({
                delay: blinkInterval,
                callback: () => {
                    blinkCount++;
                    // Alternar entre amarillo y transparente
                    if (blinkCount % 2 === 0) {
                        this.setTint(0xFFFF00);
                        this.setAlpha(0.5);
                    } else {
                        this.clearTint();
                        this.setAlpha(1);
                    }
                    
                    if (blinkCount >= maxBlinks) {
                        this.clearTint();
                        this.setAlpha(1);
                        this.isInvulnerable = false;
                        blinkTimer.destroy();
                    }
                },
                loop: true
            });
            
            // NO pierde vida, el escudo lo protegió
            return;
        }

        // NO SHIELD: Recibe daño normal
        this.lives -= amount;
        console.log(`Hero took ${amount} damage! Lives: ${this.lives}`);

        // Notificar al HUD de la pérdida de vida
        this.scene.game.events.emit(EVENTS.hero.DAMAGED, this.lives);

        // Activar invencibilidad
        this.isInvulnerable = true;

        // Parpadeo rojo durante 2 segundos
        const invulnerabilityDuration = 2000;
        const blinkInterval = 150;
        let blinkCount = 0;
        const maxBlinks = invulnerabilityDuration / blinkInterval;

        const blinkTimer = this.scene.time.addEvent({
            delay: blinkInterval,
            callback: () => {
                blinkCount++;
                // Alternar entre rojo y normal
                if (blinkCount % 2 === 0) {
                    this.setTint(0xff0000); // Rojo
                } else {
                    this.clearTint(); // Normal
                }

                // Terminar el parpadeo
                if (blinkCount >= maxBlinks) {
                    this.clearTint();
                    this.isInvulnerable = false;
                    blinkTimer.destroy();
                }
            },
            loop: true
        });

        // Verificar muerte
        if (this.lives <= 0) {
            this.die();
        }
    }

    showShieldBreakEffect() {
        // Efecto visual de escudo rompiéndose
        const breakText = this.scene.add.text(
            this.x,
            this.y - 50,
            'SHIELD BREAK!',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#FFFF00',
                stroke: '#FF6600',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        breakText.setDepth(100);
        
        this.scene.tweens.add({
            targets: breakText,
            y: breakText.y - 40,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => breakText.destroy()
        });
        
        // Partículas de escudo roto (círculos cyan)
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const particle = this.scene.add.circle(
                this.x,
                this.y - 30,
                4,
                0x00FFFF,
                1
            );
            particle.setDepth(99);
            
            const targetX = this.x + Math.cos(angle) * 60;
            const targetY = this.y - 30 + Math.sin(angle) * 60;
            
            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    die() {
        console.log('Hero died! Game Over!');
        // Notificar muerte al sistema
        this.scene.game.events.emit(EVENTS.hero.DIED);
        this.scene.game.events.emit(EVENTS.game.GAME_OVER);
        // Aquí puedes agregar lógica de muerte: animación, game over screen, etc.
    }

    /**
     * Enable or disable Double Harpoon upgrade
     * @param {boolean} enabled - True to enable double harpoon (2 max), false for normal (1 max)
     */
    setDoubleHarpoon(enabled) {
        this.maxHarpoonsActive = enabled ? 2 : 1;
        const status = enabled ? 'ENABLED' : 'DISABLED';
        console.log(`Double Harpoon ${status} - Max harpoons: ${this.maxHarpoonsActive}`);
    }

    // ============================================================
    // ITEMS SYSTEM INTEGRATION METHODS
    // ============================================================

    /**
     * Add score to the hero/game
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
        console.log(`Score +${points} = ${this.score}`);
        
        // Emit score change event for HUD
        this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, points);
    }

    /**
     * Add lives to the hero
     * @param {number} amount - Number of lives to add
     */
    addLife(amount = 1) {
        const oldLives = this.lives;
        this.lives = Math.min(this.lives + amount, this.maxLives);
        const actualGain = this.lives - oldLives;
        
        if (actualGain > 0) {
            console.log(`Lives +${actualGain} = ${this.lives}/${this.maxLives}`);
            
            // Emit life gained event for HUD
            this.scene.game.events.emit(EVENTS.hero.LIFE_GAINED, this.lives);
        } else {
            console.log(`Lives already at maximum (${this.maxLives})`);
        }
    }

    /**
     * Activate shield protection
     * @param {number} duration - Duration in milliseconds
     */
    setShield(duration = SHIELD_CONFIG.DURATION) {
        // Clear existing shield timer if any (reset duration)
        if (this.shieldTimer) {
            this.shieldTimer.destroy();
            console.log('Shield refreshed (timer reset)');
        } else {
            console.log('Shield activated');
        }
        
        // Enable shield
        this.hasShield = true;
        this.isInvulnerable = true;
        
        // Visual feedback: cyan glow
        this.setTint(SHIELD_CONFIG.TINT_COLOR);
        
        // Add pulsing effect
        const shieldPulse = this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.7 },
            duration: SHIELD_CONFIG.BLINK_INTERVAL,
            yoyo: true,
            repeat: -1
        });
        
        // Set timer to remove shield
        this.shieldTimer = this.scene.time.delayedCall(duration, () => {
            this.hasShield = false;
            this.isInvulnerable = false;
            this.clearTint();
            this.setAlpha(1);
            shieldPulse.stop();
            this.shieldTimer = null;
            
            console.log('Shield expired');
        });
    }

    /**
     * Apply speed buff to hero
     * @param {number} multiplier - Speed multiplier (e.g., 1.5 for 50% faster)
     * @param {number} duration - Duration in milliseconds
     */
    applySpeedBuff(multiplier = SPEED_CONFIG.MULTIPLIER, duration = SPEED_CONFIG.DURATION) {
        // Store original speed if not already buffed
        if (!this.originalSpeed) {
            this.originalSpeed = this.speed || 250; // Fallback to default
        }
        
        // Clear existing speed timer if any (reset duration, not stack)
        if (this.speedBuffTimer) {
            this.speedBuffTimer.destroy();
            console.log('Speed buff refreshed (timer reset)');
        } else {
            console.log('Speed buff applied');
        }
        
        // Apply speed multiplier
        const newSpeed = this.originalSpeed * multiplier;
        this.speed = newSpeed;
        this.moveSpeed = newSpeed; // Some implementations use moveSpeed
        
        // Visual feedback: yellow tint
        this.setTint(SPEED_CONFIG.VISUAL_TINT);
        
        // Set timer to revert speed
        this.speedBuffTimer = this.scene.time.delayedCall(duration, () => {
            // Revert to original speed
            this.speed = this.originalSpeed;
            this.moveSpeed = this.originalSpeed;
            this.clearTint();
            this.speedBuffTimer = null;
            this.originalSpeed = null;
            
            console.log('Speed buff expired');
        });
    }

    /**
     * Upgrade the hero's weapon
     * Increases weapon level and updates weapon stats
     */
    upgradeWeapon() {
        // Increase weapon level (cap at MAX)
        if (this.weaponLevel < MAX_WEAPON_LEVEL) {
            this.weaponLevel++;
        }
        
        // Update weapon stats
        this.weaponStats = WEAPON_LEVELS[this.weaponLevel];
        
        console.log(`Weapon upgraded to Level ${this.weaponLevel}: ${this.weaponStats.name}`);
        console.log(`Stats: ${this.weaponStats.shots} shots, ${this.weaponStats.speedMultiplier}x speed, ${this.weaponStats.spread}° spread`);
        
        // Visual feedback
        this.setTint(0xFF6600);
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
        
        // Emit weapon upgrade event
        this.scene.game.events.emit(EVENTS.hero.WEAPON_UPGRADED, this.weaponLevel);
    }

    /**
     * Reset power-ups (on death or level transition)
     */
    resetPowerUps() {
        // Clear timers
        if (this.shieldTimer) {
            this.shieldTimer.destroy();
            this.shieldTimer = null;
        }
        if (this.speedBuffTimer) {
            this.speedBuffTimer.destroy();
            this.speedBuffTimer = null;
        }
        
        // Reset states
        this.hasShield = false;
        this.isInvulnerable = false;
        this.originalSpeed = null;
        this.weaponLevel = 0;
        this.weaponStats = WEAPON_LEVELS[0];
        
        // Clear visual effects
        this.clearTint();
        this.setAlpha(1);
        
        console.log('Power-ups reset');
    }

    /**
     * Start climbing ladder
     */
    startClimbing(ladderX, ladderTop, ladderBottom) {
        if (this.isClimbing) return;
        
        this.isClimbing = true;
        this.ladderBounds = {
            x: ladderX,
            top: ladderTop,
            bottom: ladderBottom
        };
        
        // Disable gravity and physics
        this.body.setAllowGravity(false);
        this.body.setVelocity(0, 0);
        this.body.enable = false; // Disable physics completely during climb
        
        // Center player on ladder
        this.x = ladderX;
        
        // Set initial frame (frame 9 - starting to climb, manos arriba)
        this.setFrame(9);
        this.anims.stop();
        
        // Automatically climb to top
        const distance = this.y - ladderTop;
        const duration = (distance / this.climbSpeed) * 1000; // Convert to ms
        
        this.scene.tweens.add({
            targets: this,
            y: ladderTop - 20, // Exit above ladder
            duration: duration,
            ease: 'Linear',
            onUpdate: (tween) => {
                // Keep centered
                this.x = ladderX;
                
                // Play loop animation during climb
                const distanceLeft = this.y - ladderTop;
                if (distanceLeft > 64) {
                    // Middle of ladder - frames 1-2
                    if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'climb_loop') {
                        this.play('climb_loop');
                    }
                } else if (distanceLeft > 20) {
                    // Near top - frame 3
                    if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'climb_end') {
                        this.play('climb_end');
                    }
                }
            },
            onComplete: () => {
                this.stopClimbing();
            }
        });
    }

    /**
     * Stop climbing ladder
     */
    stopClimbing() {
        if (!this.isClimbing) return;
        
        this.isClimbing = false;
        this.ladderBounds = null;
        
        // Re-enable physics and gravity
        this.body.enable = true;
        this.body.setAllowGravity(true);
        
        // Return to idle
        this.play('idle');
    }

    /**
     * Update climbing state
     */
    updateClimbing() {
        if (!this.isClimbing || !this.ladderBounds) return;
        
        // Keep centered on ladder during tween
        this.x = this.ladderBounds.x;
    }

    /**
     * Check if player wants to enter ladder
     */
    checkLadderEntry() {
        if (this.isClimbing || !this.cursors.up.isDown) return;
        
        // Check if near ladder in the scene
        if (this.scene.ladders && this.scene.ladders.length > 0) {
            for (const ladder of this.scene.ladders) {
                const distance = Math.abs(this.x - ladder.x);
                
                if (distance < 32 && this.y >= ladder.top && this.y <= ladder.bottom) {
                    this.startClimbing(ladder.x, ladder.top, ladder.bottom);
                    break;
                }
            }
        }
    }
}

