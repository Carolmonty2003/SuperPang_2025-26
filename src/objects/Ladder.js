/**
 * Ladder Class
 * 
 * Climbable ladder object that allows the hero to move vertically.
 * 
 * Features to implement:
 * - Climb up/down with arrow keys
 * - Stick to ladder (disable gravity while climbing)
 * - Climb animation
 * - Jump off ladder
 * - Get on/off ladder at top and bottom
 */

export class Ladder extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, height = 200) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.ladderHeight = height;
    this.isBeingClimbed = false;
    
    // TODO: Set immovable = true
    // TODO: Configure collision area
    // TODO: Set up overlap detection with hero
  }

  /**
   * Called when hero enters ladder area
   */
  onHeroEnter(hero) {
    // TODO: Enable climbing mode for hero
    // TODO: Disable gravity for hero
    // TODO: Play climb animation
  }

  /**
   * Called when hero exits ladder area
   */
  onHeroExit(hero) {
    // TODO: Disable climbing mode for hero
    // TODO: Re-enable gravity for hero
    // TODO: Stop climb animation
  }

  /**
   * Update hero position while climbing
   */
  updateClimbing(hero, cursors) {
    // TODO: Move hero up/down based on input
    // TODO: Keep hero centered on ladder X position
    // TODO: Check if hero reached top/bottom
  }
}
