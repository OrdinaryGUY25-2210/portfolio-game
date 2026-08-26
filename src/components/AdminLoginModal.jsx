import { useState } from "react";
import { verifyAdminLogin } from "../lib/supabaseClient.js";
import "./AdminUI.css";

export default function AdminLoginModal({ onSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyAdminLogin(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onSuccess(result.user);
  };

  return (
    <div className="admin-backdrop" role="dialog" aria-modal="true" aria-label="Admin Login">
      <form className="admin-box admin-login-box" onSubmit={handleSubmit}>
        <button type="button" className="admin-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="admin-eyebrow">Master Game — Restricted</p>
        <h2 className="admin-title">Login Admin</h2>
        <p className="admin-subtitle">
          Masuk dengan email yang sudah terdaftar sebagai admin di Supabase.
        </p>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-submit-btn" disabled={loading}>
          {loading ? "Memverifikasi…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
