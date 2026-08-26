import { useEffect, useState } from "react";
import GameCanvas from "./game/GameCanvas.jsx";
import OverlayManager from "./components/OverlayManager.jsx";
import CopyrightFooter from "./components/CopyrightFooter.jsx";
import AdminLoginModal from "./components/AdminLoginModal.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { loadPortfolioContent } from "./lib/portfolioContent.js";
import { getAdminSession } from "./lib/supabaseClient.js";

export default function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    loadPortfolioContent().then(setPortfolioData);
  }, []);

  const handleUnlockTrigger = async () => {
    // If a valid admin session already exists (e.g. same tab, page not
    // reloaded), skip straight to the panel instead of asking to log in again.
    const session = await getAdminSession();
    if (session?.user) {
      setAdminUser(session.user);
      setShowPanel(true);
      return;
    }
    setShowLogin(true);
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    setShowLogin(false);
    setShowPanel(true);
  };

  const handlePanelClose = () => {
    setShowPanel(false);
    setAdminUser(null);
  };

  if (!portfolioData) {
    return (
      <div className="app-shell">
        <p style={{ fontFamily: '"VT323", monospace', fontSize: 20, color: "#4a3f35" }}>
          Memuat dunia…
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="game-frame">
        <GameCanvas portfolioData={portfolioData} />
        <OverlayManager />
      </div>

      <CopyrightFooter onUnlock={handleUnlockTrigger} />

      {showLogin && (
        <AdminLoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showPanel && adminUser && (
        <AdminPanel user={adminUser} onClose={handlePanelClose} />
      )}
    </div>
  );
}
