import { useRef, useState } from "react";
import "./AdminUI.css";

const REQUIRED_CLICKS = 10;
const CLICK_RESET_MS = 1500; // clicks must land within this window of each other

export default function CopyrightFooter({ onUnlock }) {
  const [count, setCount] = useState(0);
  const resetTimer = useRef(null);

  const handleClick = () => {
    window.clearTimeout(resetTimer.current);

    const next = count + 1;
    if (next >= REQUIRED_CLICKS) {
      setCount(0);
      onUnlock();
      return;
    }

    setCount(next);
    resetTimer.current = window.setTimeout(() => setCount(0), CLICK_RESET_MS);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="copyright-footer"
      aria-label="copyright"
    >
      © {new Date().getFullYear()} Aldi Triantama
    </button>
  );
}
