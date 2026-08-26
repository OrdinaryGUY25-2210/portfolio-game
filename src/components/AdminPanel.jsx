import { useEffect, useState } from "react";
import {
  fetchProjectRows,
  fetchCertificateRows,
  upsertProjectRow,
  deleteProjectRow,
  upsertCertificateRow,
  deleteCertificateRow,
  signOutAdmin
} from "../lib/supabaseClient.js";
import { loadPortfolioContent } from "../lib/portfolioContent.js";
import portfolioData from "../data/portfolioData.json";
import "./AdminUI.css";

const EMPTY_PROJECT = {
  id: "",
  zone_id: portfolioData.zones[0]?.id || "",
  world_x: 500,
  title: "",
  description: "",
  image: "",
  link: "",
  tags: ""
};

const EMPTY_CERT = {
  id: "",
  island_x: 900,
  title: "",
  issuer: "",
  date: "",
  description: "",
  image: "",
  link: ""
};

/**
 * Full content-management interface, unlocked only after the hidden 10-click
 * copyright trigger + successful admin login. CRUD writes go straight to the
 * `portfolio_projects` / `portfolio_certificates` Supabase tables (see
 * README "4. Admin / CMS Setup" for the one-time Dashboard table setup).
 *
 * After every save/delete, `refreshLiveWorld()` re-fetches merged content and
 * pushes it into the running Phaser game's registry, then restarts
 * WorldScene if it's the active scene — so edits appear immediately without
 * a page reload.
 */
export default function AdminPanel({ user, onClose }) {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [certForm, setCertForm] = useState(EMPTY_CERT);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);

  useEffect(() => {
    refreshLists();
  }, []);

  async function refreshLists() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchProjectRows(), fetchCertificateRows()]);
      setProjects(p);
      setCertificates(c);
    } catch (err) {
      setStatus({ type: "error", message: `Gagal memuat data: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  async function refreshLiveWorld() {
    const merged = await loadPortfolioContent();
    const game = window.__portfolioGame;
    if (!game) return;

    game.registry.set("portfolioData", merged);
    const worldScene = game.scene.getScene("WorldScene");
    if (worldScene && worldScene.scene.isActive()) {
      worldScene.scene.restart();
    }
  }

  function zoneOptions() {
    return portfolioData.zones.map((z) => (
      <option key={z.id} value={z.id}>
        {z.title}
      </option>
    ));
  }

  // --- Projects ------------------------------------------------------------

  function startEditProject(row) {
    setEditingProjectId(row.id);
    setProjectForm({
      id: row.id,
      zone_id: row.zone_id,
      world_x: row.world_x,
      title: row.title,
      description: row.description,
      image: row.image || "",
      link: row.link || "",
      tags: Array.isArray(row.tags) ? row.tags.join(", ") : ""
    });
  }

  function resetProjectForm() {
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT);
  }

  async function submitProject(e) {
    e.preventDefault();
    setStatus(null);

    const id =
      editingProjectId ||
      projectForm.id.trim() ||
      `proj-${Date.now().toString(36)}`;

    const row = {
      id,
      zone_id: projectForm.zone_id,
      world_x: Number(projectForm.world_x) || 0,
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      image: projectForm.image.trim(),
      link: projectForm.link.trim(),
      tags: projectForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    };

    if (!row.title) {
      setStatus({ type: "error", message: "Judul proyek wajib diisi." });
      return;
    }

    try {
      await upsertProjectRow(row);
      setStatus({ type: "success", message: `Proyek "${row.title}" tersimpan.` });
      resetProjectForm();
      await refreshLists();
      await refreshLiveWorld();
    } catch (err) {
      setStatus({ type: "error", message: `Gagal menyimpan: ${err.message}` });
    }
  }

  async function removeProject(id) {
    if (!window.confirm("Hapus proyek ini secara permanen?")) return;
    try {
      await deleteProjectRow(id);
      setStatus({ type: "success", message: "Proyek dihapus." });
      await refreshLists();
      await refreshLiveWorld();
    } catch (err) {
      setStatus({ type: "error", message: `Gagal menghapus: ${err.message}` });
    }
  }

  // --- Certificates ----------------------------------------------------

  function startEditCert(row) {
    setEditingCertId(row.id);
    setCertForm({
      id: row.id,
      island_x: row.island_x,
      title: row.title,
      issuer: row.issuer,
      date: row.date || "",
      description: row.description,
      image: row.image || "",
      link: row.link || ""
    });
  }

  function resetCertForm() {
    setEditingCertId(null);
    setCertForm(EMPTY_CERT);
  }

  async function submitCert(e) {
    e.preventDefault();
    setStatus(null);

    const id = editingCertId || certForm.id.trim() || `cert-${Date.now().toString(36)}`;

    const row = {
      id,
      island_x: Number(certForm.island_x) || 0,
      title: certForm.title.trim(),
      issuer: certForm.issuer.trim(),
      date: certForm.date.trim(),
      description: certForm.description.trim(),
      image: certForm.image.trim(),
      link: certForm.link.trim()
    };

    if (!row.title) {
      setStatus({ type: "error", message: "Judul sertifikat wajib diisi." });
      return;
    }

    try {
      await upsertCertificateRow(row);
      setStatus({ type: "success", message: `Sertifikat "${row.title}" tersimpan.` });
      resetCertForm();
      await refreshLists();
      await refreshLiveWorld();
    } catch (err) {
      setStatus({ type: "error", message: `Gagal menyimpan: ${err.message}` });
    }
  }

  async function removeCert(id) {
    if (!window.confirm("Hapus sertifikat ini secara permanen?")) return;
    try {
      await deleteCertificateRow(id);
      setStatus({ type: "success", message: "Sertifikat dihapus." });
      await refreshLists();
      await refreshLiveWorld();
    } catch (err) {
      setStatus({ type: "error", message: `Gagal menghapus: ${err.message}` });
    }
  }

  async function handleSignOut() {
    await signOutAdmin();
    onClose();
  }

  return (
    <div className="admin-backdrop" role="dialog" aria-modal="true" aria-label="Content Management">
      <div className="admin-box admin-panel-box">
        <button type="button" className="admin-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="admin-panel-header">
          <div>
            <p className="admin-eyebrow">Master Game — Content Management</p>
            <h2 className="admin-title" style={{ marginBottom: 2 }}>
              Kelola Portfolio
            </h2>
            <p className="admin-subtitle" style={{ margin: 0 }}>
              Masuk sebagai {user?.email}
            </p>
          </div>
          <button type="button" className="admin-secondary-btn" onClick={handleSignOut}>
            Keluar
          </button>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${tab === "projects" ? "active" : ""}`}
            onClick={() => setTab("projects")}
          >
            Proyek ({projects.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === "certificates" ? "active" : ""}`}
            onClick={() => setTab("certificates")}
          >
            Sertifikat ({certificates.length})
          </button>
        </div>

        {status && (
          <p className={status.type === "error" ? "admin-error" : "admin-success"}>
            {status.message}
          </p>
        )}

        {loading ? (
          <p className="admin-subtitle">Memuat data…</p>
        ) : tab === "projects" ? (
          <>
            <div className="admin-list">
              {projects.length === 0 && (
                <p className="admin-subtitle" style={{ padding: 14 }}>
                  Belum ada proyek di Supabase. Data yang tampil di game saat ini memakai fallback lokal
                  (portfolioData.json). Tambahkan proyek di bawah untuk mulai mengelola dari sini.
                </p>
              )}
              {projects.map((row) => (
                <div className="admin-list-row" key={row.id}>
                  <div>
                    <div className="admin-list-title">{row.title}</div>
                    <div className="admin-list-meta">
                      {row.zone_id} · x={row.world_x} {row.link ? "· ada link" : "· tanpa link"}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button type="button" onClick={() => startEditProject(row)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeProject(row.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitProject}>
              <h3 className="admin-title" style={{ fontSize: 12 }}>
                {editingProjectId ? "Edit Proyek" : "Tambah Proyek Baru"}
              </h3>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>ID (kosongkan untuk auto)</span>
                  <input
                    value={projectForm.id}
                    disabled={Boolean(editingProjectId)}
                    onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value })}
                    placeholder="proj-web-04"
                  />
                </label>
                <label className="admin-field">
                  <span>Zona</span>
                  <select
                    value={projectForm.zone_id}
                    onChange={(e) => setProjectForm({ ...projectForm, zone_id: e.target.value })}
                  >
                    {zoneOptions()}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Judul</span>
                  <input
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Posisi X di dunia</span>
                  <input
                    type="number"
                    value={projectForm.world_x}
                    onChange={(e) => setProjectForm({ ...projectForm, world_x: e.target.value })}
                  />
                </label>
                <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Deskripsi</span>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, description: e.target.value })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Path gambar di Supabase Storage</span>
                  <input
                    value={projectForm.image}
                    onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                    placeholder="web-apps/nama-file.webp"
                  />
                </label>
                <label className="admin-field">
                  <span>Link eksternal (kosongkan = tombol disembunyikan)</span>
                  <input
                    value={projectForm.link}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
                <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Tags (pisahkan dengan koma)</span>
                  <input
                    value={projectForm.tags}
                    onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                    placeholder="React, Supabase"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-submit-btn" style={{ width: "auto" }}>
                  {editingProjectId ? "Simpan Perubahan" : "Tambah Proyek"}
                </button>
                {editingProjectId && (
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={resetProjectForm}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="admin-list">
              {certificates.length === 0 && (
                <p className="admin-subtitle" style={{ padding: 14 }}>
                  Belum ada sertifikat di Supabase. Data yang tampil di game saat ini memakai fallback lokal.
                </p>
              )}
              {certificates.map((row) => (
                <div className="admin-list-row" key={row.id}>
                  <div>
                    <div className="admin-list-title">{row.title}</div>
                    <div className="admin-list-meta">
                      {row.issuer} · x={row.island_x} {row.link ? "· ada link" : "· tanpa link"}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button type="button" onClick={() => startEditCert(row)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeCert(row.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitCert}>
              <h3 className="admin-title" style={{ fontSize: 12 }}>
                {editingCertId ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
              </h3>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>ID (kosongkan untuk auto)</span>
                  <input
                    value={certForm.id}
                    disabled={Boolean(editingCertId)}
                    onChange={(e) => setCertForm({ ...certForm, id: e.target.value })}
                    placeholder="cert-04"
                  />
                </label>
                <label className="admin-field">
                  <span>Posisi X pulau</span>
                  <input
                    type="number"
                    value={certForm.island_x}
                    onChange={(e) => setCertForm({ ...certForm, island_x: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Judul</span>
                  <input
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Penerbit</span>
                  <input
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Tanggal (mis. 2024-03)</span>
                  <input
                    value={certForm.date}
                    onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Path gambar di Supabase Storage</span>
                  <input
                    value={certForm.image}
                    onChange={(e) => setCertForm({ ...certForm, image: e.target.value })}
                    placeholder="certificates/nama-file.webp"
                  />
                </label>
                <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Deskripsi</span>
                  <textarea
                    value={certForm.description}
                    onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                  />
                </label>
                <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Link eksternal (kosongkan = tombol disembunyikan)</span>
                  <input
                    value={certForm.link}
                    onChange={(e) => setCertForm({ ...certForm, link: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="admin-submit-btn" style={{ width: "auto" }}>
                  {editingCertId ? "Simpan Perubahan" : "Tambah Sertifikat"}
                </button>
                {editingCertId && (
                  <button type="button" className="admin-secondary-btn" onClick={resetCertForm}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
