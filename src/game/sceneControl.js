/**
 * Stops whatever Phaser scene is currently active and starts "StartScene".
 * Used by the in-game top-right menu button so players can return to the
 * title screen mid-exploration without reloading the page.
 */
export function returnToStartScreen() {
  const game = window.__portfolioGame;
  if (!game) return;

  game.scene.getScenes(true).forEach((scene) => {
    if (scene.scene.key !== "StartScene") {
      scene.scene.stop();
    }
  });

  if (!game.scene.isActive("StartScene")) {
    game.scene.start("StartScene");
  }
}
