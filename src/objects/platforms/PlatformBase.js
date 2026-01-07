/**
 * PlatformBase - Base class for tile-based platforms
 * 
 * Handles platform creation from tile patterns.
 * Tile indices:
 * - 0: Left edge
 * - 1: Center part
 * - 2: Right edge
 * - 6: Individual (single tile)
 */

export class PlatformBase {
  /**
   * @param {Phaser.Scene} scene - The game scene
   * @param {object} config - Platform configuration
   * @param {number} config.x - X position (tile coordinate)
   * @param {number} config.y - Y position (tile coordinate)
   * @param {Array<number>} config.pattern - Tile pattern (e.g., [0,1,1,2] for 4-tile platform)
   * @param {number} config.color - Color tint (0xRRGGBB)
   * @param {Phaser.Tilemaps.Tilemap} config.map - The tilemap reference
   * @param {Phaser.Tilemaps.TilemapLayer} config.layer - The layer to place tiles on
   */
  constructor(scene, config) {
    this.scene = scene;
    this.x = config.x;
    this.y = config.y;
    this.pattern = config.pattern || [6]; // Default: single tile
    this.color = config.color || 0xFFFFFF;
    this.map = config.map;
    this.layer = config.layer;
    
    this.tiles = [];
    this.isDestroyed = false;
    
    this.createPlatform();
  }

  /**
   * Create the platform tiles based on pattern
   */
  createPlatform() {
    for (let i = 0; i < this.pattern.length; i++) {
      const tileIndex = this.pattern[i];
      const tileX = this.x + i;
      const tileY = this.y;
      
      // Place tile at position
      const tile = this.layer.putTileAt(tileIndex, tileX, tileY);
      
      if (tile) {
        // Don't apply tint here - let subclass handle it
        
        // Store tile reference
        this.tiles.push(tile);
        
        // Store platform reference in tile for collision callbacks
        tile.properties = tile.properties || {};
        tile.properties.platform = this;
      }
    }
  }

  /**
   * Get center position of the platform in world coordinates
   */
  getCenterPosition() {
    if (this.tiles.length === 0) return { x: 0, y: 0 };
    
    const firstTile = this.tiles[0];
    const lastTile = this.tiles[this.tiles.length - 1];
    
    return {
      x: (firstTile.pixelX + lastTile.pixelX + lastTile.width) / 2,
      y: firstTile.pixelY + firstTile.height / 2
    };
  }

  /**
   * Destroy the platform
   */
  destroy() {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Remove all tiles
    this.tiles.forEach(tile => {
      if (tile && tile.tilemapLayer) {
        this.layer.removeTileAt(tile.x, tile.y);
      }
    });
    
    this.tiles = [];
  }

  /**
   * Update method (override in subclasses for animations)
   */
  update(time, delta) {
    // Override in subclasses
  }
}
