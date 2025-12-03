import { BaseEnemy } from './BaseEnemy.js';
import { ENEMY } from '../../core/constants.js';
import { EVENTS } from '../../core/events.js';

export class BaseBalls extends BaseEnemy 
{
    constructor(scene, x, y, texture, size = 3, direction = 1) 
    {
        super(scene, x, y, texture);
        
        this.size = size;
        
        // Escalar según el tamaño de la bola
        const scales = [0.2, 0.4, 0.7, 1.0];
        const bounceHeights = [-300, -450, -550, -600]; 

        this.setScale(scales[size]);
        this.bounceVelocity = bounceHeights[size];

        this.body.setBounce(1, 1);
        this.body.setCollideWorldBounds(true);
        this.body.setVelocityX(ENEMY.SPEED * direction);
    }

    create(){
        // Grupo de bolas
    this.ballsGroup = this.physics.add.group();

    // Ejemplo de bola inicial
    const initialBallX = map.widthInPixels * 0.25;
    const initialBallY = 100;

    // OJO: aquí el tercer parámetro es la key de textura que has cargado arriba
    const firstBall = new BaseBalls(this, initialBallX, initialBallY, "sp_big", 3, 1);
    this.ballsGroup.add(firstBall);
 
    }

    takeDamage() 
    {
        this.scene.game.events.emit(EVENTS.enemy.BALL_DESTROYED, { x: this.x, y: this.y, size: this.size });
        this.scene.game.events.emit(EVENTS.game.SCORE_CHANGE, (this.size + 1) * 100);

        if (this.size > 0) {
            this.split();
        }
        this.destroy();
    }

    split() 
    {
        const newSize = this.size - 1;
        const texture = this.texture.key;
        
        // Usamos BaseBall recursivamente (luego podrás cambiarlo por subclases)
        const ball1 = new BaseBalls(this.scene, this.x, this.y, texture, newSize, -1);
        ball1.body.setVelocityY(-300);

        const ball2 = new BaseBalls(this.scene, this.x, this.y, texture, newSize, 1);
        ball2.body.setVelocityY(-300);
        
        if (this.scene.ballsGroup) {
            this.scene.ballsGroup.add(ball1);
            this.scene.ballsGroup.add(ball2);
        }
    }
}