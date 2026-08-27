import "./OverlayManager.css";

export default function InfoModal({ onClose }) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-label="Info & Controls">
      <div className="overlay-window is-top" style={{ position: "relative", width: "min(560px, 100%)" }}>
        <button className="overlay-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="overlay-list-inner">
          <p className="overlay-eyebrow">Panduan</p>
          <h2 className="overlay-title">Info &amp; Kontrol</h2>

          <h3 className="info-subhead">Kontrol</h3>
          <ul className="info-list">
            <li><strong>← → / A D</strong> — jalan kiri/kanan</li>
            <li><strong>↑ / W / Space</strong> — lompat</li>
            <li><strong>E</strong> — buka detail rumah proyek / portal sertifikat</li>
            <li><strong>Esc</strong> atau tombol <strong>✕</strong> — tutup overlay</li>
          </ul>

          <h3 className="info-subhead">Legenda Dunia</h3>
          <ul className="info-list">
            <li><span className="legend-dot legend-bold" /> Rumah warna cerah = <strong>proyek</strong>, bisa ditekan (E)</li>
            <li><span className="legend-dot legend-muted" /> Rumah warna pudar = dekorasi saja, tidak bisa ditekan</li>
            <li>Warga di depan rumah proyek akan menunjukkan nama proyeknya lewat bubble teks saat kamu mendekat</li>
            <li>Pulau melayang di langit = sertifikat, naik lewat tangga lalu masuk portal</li>
            <li>Burung, awan, dan pergantian siang/malam serta 4 musim berjalan otomatis secara real-time</li>
          </ul>

          <h3 className="info-subhead">Lainnya</h3>
          <ul className="info-list">
            <li>Klik ikon ☰ di pojok kanan atas kapan saja untuk kembali ke menu utama</li>
            <li>Klik teks copyright di bawah layar 10x berturut-turut untuk akses admin (kalau kamu pemiliknya)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
