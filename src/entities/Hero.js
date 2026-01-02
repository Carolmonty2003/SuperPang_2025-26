import { HeroBase } from './HeroBase.js';
import { Harpoon } from './Harpoon.js';
import { Bullet } from './Bullet.js';
import { EVENTS } from '../core/events.js';
import { WEAPON_LEVELS, MAX_WEAPON_LEVEL } from './items/drops/PowerUpWeapon.js';
import { SHIELD_CONFIG } from './items/drops/PowerUpShield.js';
import { SPEED_CONFIG } from './items/drops/PowerUpSpeed.js';

// tipos de arma
export const HERO_WEAPON = {
    HARPOON: 1,
    GUN: 2,
};

export class Hero extends HeroBase 
{
    constructor(scene, x, y, texture = 'player_walk') 
    {
        super(scene, x, y, texture);

        this.activeHarpoon = null;
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

        this.createAnimations();

        // cambio de arma
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);

        this.key1.on('down', () => this.setWeapon(HERO_WEAPON.HARPOON));
        this.key2.on('down', () => this.setWeapon(HERO_WEAPON.GUN));

        this.play('idle');

        // Notificar al HUD que el héroe está listo
        this.scene.game.events.emit(EVENTS.hero.READY, this);
    }

    setWeapon(weaponType) {
        this.weaponType = weaponType;

        const modeText = 
            weaponType === HERO_WEAPON.GUN
                ? 'MACHINE GUN'
                : 'HARPOON';

        this.scene.game.events.emit('UI_WEAPON_CHANGE', modeText);
    }

    createAnimations() {
        const anims = this.scene.anims;

        if (!anims.exists('idle')) {
            anims.create({
                key: 'idle',
                frames: [{ key: 'player_walk', frame: 0 }],
                frameRate: 1,
                repeat: -1,
            });
        }

        if (!anims.exists('run')) {
            anims.create({
                key: 'run',
                frames: anims.generateFrameNumbers('player_walk', { start: 0, end: 2 }),
                frameRate: 12,
                repeat: -1,
            });
        }

        if (!anims.exists('shoot')) {
            anims.create({
                key: 'shoot',
                frames: anims.generateFrameNumbers('player_shoot', { start: 0, end: 1 }),
                frameRate: 8,
                repeat: 0,
            });
        }
    }

    handleShootingInput() {
        if (this.isShooting) return;

        if (this.weaponType === HERO_WEAPON.HARPOON) {
            if (this.activeHarpoon && this.activeHarpoon.active) return;
        }

        this.isShooting = true;
        this.setVelocityX(0);
        this.play('shoot', true);

        if (this.weaponType === HERO_WEAPON.HARPOON) {
            this.shootHarpoon();
        } else {
            this.shootGunFan();
        }

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
            if (anim.key === 'shoot') this.isShooting = false;
        });
    }

    shootHarpoon() {
        this.activeHarpoon = new Harpoon(this.scene, this.x, this.y);
        this.scene.game.events.emit(EVENTS.hero.SHOOT);
    }

    shootGunFan() {
        const angles = [-80, -85, -90, -95, -100];

        angles.forEach(angle => {
            const bullet = new Bullet(this.scene, this.x, this.y - 40, 'bullet');

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

        // Reducir vida
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

    die() {
        console.log('Hero died! Game Over!');
        // Notificar muerte al sistema
        this.scene.game.events.emit(EVENTS.hero.DIED);
        this.scene.game.events.emit(EVENTS.game.GAME_OVER);
        // Aquí puedes agregar lógica de muerte: animación, game over screen, etc.
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
}
