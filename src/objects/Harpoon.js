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

        // Ajustables: factor ancho collider y desplazamiento fino (px)
        this.COLLIDER_WIDTH_FACTOR = 0.35;
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

        // No uses setOffset aquí: body se posicionará manualmente en preUpdate()
        const initialBodyW = Math.max(2, Math.round(this.displayWidth * this.COLLIDER_WIDTH_FACTOR));
        const initialBodyH = Math.max(1, Math.round(this.displayHeight));
        this.body.setSize(initialBodyW, initialBodyH);
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

            // Actualizar tamaño visual (la base permanece en baseY)
            this.setDisplaySize(this._baseWidth, this._currentHeight);

            // Actualizar tamaño del body (ancho reducido) y POSICIONARLO MANUALMENTE
            if (this.body && this.body.setSize) {
                const bodyW = Math.max(2, Math.round(this.displayWidth * this.COLLIDER_WIDTH_FACTOR));
                const bodyH = Math.max(1, Math.round(this.displayHeight));
                this.body.setSize(bodyW, bodyH);

                // Calcular top-left del sprite según origin y display size
                const spriteLeft = this.x - this.displayWidth * this.originX;
                const spriteTop = this.y - this.displayHeight * this.originY;

                // Centrar el collider horizontalmente y aplicar ajuste fino
                const bx = Math.round(spriteLeft + (this.displayWidth - bodyW) / 2 + this.COLLIDER_OFFSET_X);
                const by = Math.round(spriteTop); // top del sprite (origen y = 1 hace que y = base)

                // Asignar al body (y a position para consistencia en Arcade)
                this.body.x = bx;
                this.body.y = by;
                if (this.body.position) {
                    this.body.position.x = bx;
                    this.body.position.y = by;
                }

                // (opcional) actualizar center para usos internos
                if (this.body.center) {
                    this.body.center.x = bx + bodyW / 2;
                    this.body.center.y = by + bodyH / 2;
                }
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