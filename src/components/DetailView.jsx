const FALLBACK_IMAGE_NOTE =
  "Gambar belum diupload — tambahkan ke Supabase Storage untuk mengganti placeholder ini.";

/**
 * Renders the inner content of a single project/certificate "detail" window.
 * Used both when opened directly (walking up to an NPC/portal) and when
 * opened from inside a CategoryListView (clicking a row in the project list).
 */
export default function DetailView({ entry, imageFailed, onImageError }) {
  const isCertificate = entry.kind === "certificate";
  // Action button is rendered ONLY when a non-empty link string exists in the
  // local data — no link, no button. This holds true no matter which layer
  // (direct NPC, or from inside a category list) the detail was opened from.
  const hasLink = typeof entry.link === "string" && entry.link.trim().length > 0;

  return (
    <div className="overlay-detail-inner">
      <div className="overlay-image-frame">
        {entry.imageUrl && !imageFailed ? (
          <img
            src={entry.imageUrl}
            alt={entry.title}
            className="overlay-image"
            onError={onImageError}
          />
        ) : (
          <div className="overlay-image-placeholder">
            <span>{isCertificate ? "🏅" : "🖼"}</span>
            <p>{FALLBACK_IMAGE_NOTE}</p>
          </div>
        )}
      </div>

      <div className="overlay-text">
        <p className="overlay-eyebrow">
          {isCertificate ? `Certificate · ${entry.issuer}` : "Project Log"}
        </p>
        <h2 className="overlay-title">{entry.title}</h2>
        {isCertificate && entry.date && <p className="overlay-date">{entry.date}</p>}
        <p className="overlay-description">{entry.description}</p>

        {Array.isArray(entry.tags) && entry.tags.length > 0 && (
          <ul className="overlay-tags">
            {entry.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        {hasLink && (
          <a
            className="overlay-link-btn"
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isCertificate ? "View Certificate ↗" : "View Project ↗"}
          </a>
        )}
      </div>
    </div>
  );
}
