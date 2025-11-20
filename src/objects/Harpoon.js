// src/entities/Harpoon.js

export class Harpoon extends Phaser.Physics.Arcade.Sprite {
    constructor(_scene, _posX, _posY, _texture = 'arponFijo') {
        super(_scene, _posX, _posY, _texture);

        this.scene = _scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        // Posicionar justo donde se pidió (debajo del player) y fijar baseY
        this.baseY = Math.round(_posY);
        this.setPosition(_posX, this.baseY);

        // Origen en la base (centro-abajo). Al cambiar displayHeight la base permanece fija.
        this.setOrigin(0.5, 1);

        // ANCHO VISIBLE DEL ARPÓN
        const originalSpriteWidth = (this.width && this.width > 0) ? this.width : 8;
        this._baseWidth = Math.round(originalSpriteWidth * 3);

        // FACTOR para el collider (0.0 - 1.0). Menor = collider más estrecho.
        this.COLLIDER_WIDTH_FACTOR = 0.35;
        // Ajuste fino horizontal del collider (px). Prueba -6, -3, 0, 3, etc.
        this.COLLIDER_OFFSET_X = -3;

        // Propiedades de extensión
        this.isExtending = true;
        this.EXTENSION_SPEED = 900;

        this.MAX_HEIGHT = this.scene.map ? this.scene.map.heightInPixels : (this.scene.cameras.main.height || 800);
        this.STOP_Y = 2;

        // Inicial: muy pequeño (prácticamente oculto) y cuerpo acorde
        this._currentHeight = 2;
        this.setDisplaySize(this._baseWidth, this._currentHeight);

        // Física: no gravedad, inmóvil
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Sincronizar body inicial usando displayWidth/displayHeight pero estrechando el ancho
        const initialBodyW = Math.max(2, Math.round(this.displayWidth * this.COLLIDER_WIDTH_FACTOR));
        const initialBodyH = Math.max(1, Math.round(this.displayHeight));
        this.body.setSize(initialBodyW, initialBodyH);
        // centrar horizontalmente el body respecto al sprite y aplicar ajuste fino
        const initialOffsetX = -10000//Math.round((this.displayWidth - initialBodyW) / 2 + this.COLLIDER_OFFSET_X);
        this.body.setOffset(initialOffsetX, 0);
        if (this.body.updateFromGameObject) this.body.updateFromGameObject();
    }

    // No añadir collider con walls para que el arpón solo termine al tocar techo.
    setColliders() {
        // Intencionalmente vacío
    }

    onReachedCeiling() {
        // comportamiento al tocar techo: destruir y notificar al héroe
        this.destroyHarpoon();
    }

    // Método para limpiar y destruir el arpón
    destroyHarpoon() {
        const sceneRef = this.scene;

        // Avisar al héroe antes de destruir el arpón
        if (sceneRef && sceneRef.hero && typeof sceneRef.hero.harpoonDestroyed === 'function') {
            sceneRef.hero.harpoonDestroyed();
        }

        // Limpiar física/listeners si hubiera
        try {
            if (this.body && this.body.world && this.onWorldBounds) {
                this.body.world.off(Phaser.Physics.Arcade.Events.WORLD_BOUNDS, this.onWorldBounds, this);
            }
        } catch (e) {
            // ignore
        }

        // Finalmente destruir el objeto
        this.destroy();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.isExtending) {
            // Aumentar altura según velocidad y delta
            this._currentHeight += (this.EXTENSION_SPEED * (delta / 1000));

            // Limitar a la altura máxima posible (desde suelo hasta techo)
            const maxPossible = this.baseY - this.STOP_Y;
            if (this._currentHeight > maxPossible) {
                this._currentHeight = maxPossible;
            }

            // Mantener el ancho aumentado y actualizar altura (la base permanece en baseY)
            this.setDisplaySize(this._baseWidth, this._currentHeight);

            // Sincronizar el body exactamente con el display (offset centrado, ancho reducido)
            if (this.body && this.body.setSize) {
                const bodyW = Math.max(2, Math.round(this.displayWidth * this.COLLIDER_WIDTH_FACTOR));
                const bodyH = Math.max(1, Math.round(this.displayHeight));
                this.body.setSize(bodyW, bodyH);
                // centrar y aplicar ajuste fino en cada frame
                const offsetX = Math.round((this.displayWidth - bodyW) / 2 + this.COLLIDER_OFFSET_X);
                this.body.setOffset(offsetX, 0);
                if (this.body.updateFromGameObject) this.body.updateFromGameObject();
            }

            // Comprobar si la punta ha alcanzado el techo
            const topY = this.getTopCenter().y;
            if (topY <= this.STOP_Y || this._currentHeight >= maxPossible) {
                this.isExtending = false;
                this.onReachedCeiling();
            }
        }
    }
}