// src/objects/Platform.js

/**
 * Plataforma rompible basada en un tile del tilemap.
 * Más adelante aquí podrás manejar drops, animaciones, etc.
 */
export class Platform 
{
    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Tilemaps.Tile} tile 
     */
    constructor(scene, tile) 
    {
        this.scene = scene;
        this.tile = tile;

        // Guardamos posición en mundo por comodidad (para futuros drops, partículas, etc.)
        this.x = tile.getCenterX();
        this.y = tile.getCenterY();
    }

    /**
     * Rompe la plataforma y opcionalmente destruye el arma que la ha golpeado.
     * Aquí podrás añadir lógica de drop de ítems más adelante.
     */
    break(weapon = null) 
    {
        if (this.tile && this.tile.tilemapLayer) {
            this.tile.tilemapLayer.removeTileAt(this.tile.x, this.tile.y);
        }

        if (weapon && weapon.destroy) {
            weapon.destroy();
        }

        // EJEMPLO para futuro:
        // this.scene.spawnDrop(this.x, this.y);
    }
}

export default Platform;
