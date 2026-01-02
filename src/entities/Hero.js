import { HeroBase } from './HeroBase.js';
import { Harpoon } from './Harpoon.js';
import { Bullet } from './Bullet.js';
import { EVENTS } from '../core/events.js';

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
        this.isInvulnerable = false;

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
}
