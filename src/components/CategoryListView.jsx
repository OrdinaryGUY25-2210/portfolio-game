/**
 * Renders the list of projects for a zone/category. Each row is clickable
 * and pushes a "project" detail entry onto the overlay stack (rendered as a
 * new window layered on top of this list — see OverlayManager.jsx).
 */
export default function CategoryListView({ zoneTitle, projects, onSelectProject }) {
  return (
    <div className="overlay-list-inner">
      <p className="overlay-eyebrow">Category</p>
      <h2 className="overlay-title">{zoneTitle}</h2>
      <p className="overlay-list-hint">
        {projects.length} proyek ditemukan — pilih salah satu untuk melihat detailnya.
      </p>

      <ul className="overlay-project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              className="overlay-project-row"
              onClick={() => onSelectProject(project)}
            >
              <span className="overlay-project-row-title">{project.title}</span>
              <span className="overlay-project-row-desc">{project.description}</span>
              {Array.isArray(project.tags) && project.tags.length > 0 && (
                <span className="overlay-project-row-tags">{project.tags.join(" · ")}</span>
              )}
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="overlay-list-empty">Belum ada proyek di kategori ini.</li>
        )}
      </ul>
    </div>
  );
}
