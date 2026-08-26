import Phaser from "phaser";
import BootScene from "../scenes/BootScene.js";
import StartScene from "../scenes/StartScene.js";
import CharacterSelectScene from "../scenes/CharacterSelectScene.js";
import WorldScene from "../scenes/WorldScene.js";

/**
 * Builds a fresh Phaser.Game instance mounted into the given DOM element id.
 * Kept as a factory (rather than a singleton) so React's StrictMode double-invoke
 * of effects in dev doesn't leak duplicate game instances.
 *
 * `initialPortfolioData` is seeded into the Phaser registry under the key
 * "portfolioData" and read by CharacterSelectScene / WorldScene. This is the
 * hook the hidden Admin CMS (AdminPanel.jsx) uses to push live content
 * updates into the running world via `game.registry.set("portfolioData", ...)`
 * followed by a WorldScene restart — no full page reload required.
 */
export function createGame(parentId, initialPortfolioData) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 960,
    height: 600,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#b9cdd6",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 900 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, StartScene, CharacterSelectScene, WorldScene]
  });

  game.registry.set("portfolioData", initialPortfolioData);
  return game;
}
