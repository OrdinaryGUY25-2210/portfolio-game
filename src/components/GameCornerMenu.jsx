import { useState } from "react";
import { returnToStartScreen } from "../game/sceneControl.js";
import "./GameCornerMenu.css";

export default function GameCornerMenu({ onOpenInfo }) {
  const [open, setOpen] = useState(false);

  const handleBackToStart = () => {
    setOpen(false);
    returnToStartScreen();
  };

  const handleInfo = () => {
    setOpen(false);
    onOpenInfo();
  };

  return (
    <div className="corner-menu">
      <button
        type="button"
        className="corner-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
      >
        ☰
      </button>

      {open && (
        <div className="corner-menu-dropdown">
          <button type="button" onClick={handleBackToStart}>
            🏠 Menu Utama
          </button>
          <button type="button" onClick={handleInfo}>
            ❓ Info &amp; Kontrol
          </button>
        </div>
      )}
    </div>
  );
}
