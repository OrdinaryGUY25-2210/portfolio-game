import { useEffect, useRef } from "react";
import { createGame } from "./config/gameConfig.js";

export default function GameCanvas({ portfolioData }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return; // guard against React StrictMode double-mount

    const id = "phaser-root";
    const game = createGame(id, portfolioData);
    gameRef.current = game;

    // Exposed so the hidden Admin CMS (AdminPanel.jsx) can push live content
    // updates into the running world via game.registry + a WorldScene restart.
    window.__portfolioGame = game;

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      if (window.__portfolioGame === game) {
        window.__portfolioGame = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="phaser-root" ref={containerRef} className="phaser-root" />;
}
