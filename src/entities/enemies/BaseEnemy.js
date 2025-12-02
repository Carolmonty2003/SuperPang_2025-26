import { ENEMY } from '../../core/constants.js';

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite 
{
   /**
   * @param {Phaser.Scene} _scene   - escena en la que se instanciará
   * @param {number} _posX          - posición X del sprite
   * @param {number} _posY          - posición Y del sprite
   * @param {string} _texture       - key/spriteTag del spritesheet/atlas
   */
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        
        this.setCollideWorldBounds(true);
        this.setBounce(1); // Rebote básico
    }

    howItpatrols()
    {
        return (this.body.blocked.left || this.body.blocked.right)    
    }

    takeDamage() {
        this.destroy();
    }

    preUpdate(time,delta)
    {
        super.preUpdate(time,delta);  

        if(this.howItpatrols())
        {
            this.direction *=-1;
            this.flipX = !this.flipX;
            this.body.setVelocityX(ENEMY.SPEED*this.direction);
        }

          
    }
}