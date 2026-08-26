import { useEffect, useState } from "react";
import CategoryListView from "./CategoryListView.jsx";
import DetailView from "./DetailView.jsx";
import "./OverlayManager.css";

/**
 * Manages a stack of RPG "quest window" style overlays on top of the game.
 *
 * Stack entries:
 *   { kind: "category", zoneId, zoneTitle, projects }   -> CategoryListView
 *   { kind: "project" | "certificate", ...itemFields }  -> DetailView
 *
 * Triggered by the Phaser world dispatching `window.dispatchEvent(new
 * CustomEvent("quest:open", { detail: entry }))` — from a category signpost,
 * an individual project NPC, or a certificate portal. Every layer gets its
 * own X button in the corner:
 *   - Closing a "detail" layer that was opened from a list pops back to that
 *     list (still open underneath).
 *   - Closing a "detail" layer opened directly (no list underneath), or
 *     closing a "category" list layer, empties the stack entirely and hands
 *     control back to the game world (`quest:close` is dispatched so
 *     WorldScene re-arms interaction).
 */
export default function OverlayManager() {
  const [stack, setStack] = useState([]);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const handleOpen = (e) => {
      setStack((prev) => [...prev, e.detail]);
    };
    window.addEventListener("quest:open", handleOpen);
    return () => window.removeEventListener("quest:open", handleOpen);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && stack.length > 0) closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack]);

  function closeTop() {
    setStack((prev) => {
      const next = prev.slice(0, -1);
      if (next.length === 0) {
        window.dispatchEvent(new CustomEvent("quest:close"));
      }
      return next;
    });
  }

  function openProjectFromList(project) {
    setStack((prev) => [...prev, { kind: "project", ...project }]);
  }

  function markImageFailed(layerIndex) {
    setFailedImages((prev) => ({ ...prev, [layerIndex]: true }));
  }

  if (stack.length === 0) return null;

  return (
    <div className="overlay-backdrop">
      {stack.map((entry, index) => {
        const isTop = index === stack.length - 1;
        const depthFromTop = stack.length - 1 - index;

        return (
          <div
            key={`${entry.kind}-${entry.zoneId || entry.id || index}-${index}`}
            className={`overlay-window ${isTop ? "is-top" : "is-behind"}`}
            style={{
              zIndex: 100 + index,
              transform: `translate(${depthFromTop * 14}px, ${depthFromTop * -14}px) scale(${1 - depthFromTop * 0.05
                })`
            }}
            role="dialog"
            aria-modal={isTop}
            aria-label={entry.zoneTitle || entry.title}
          >
            <button
              className="overlay-close"
              onClick={isTop ? closeTop : undefined}
              aria-label="Close"
              tabIndex={isTop ? 0 : -1}
            >
              ✕
            </button>

            {entry.kind === "category" ? (
              <CategoryListView
                zoneTitle={entry.zoneTitle}
                projects={entry.projects}
                onSelectProject={openProjectFromList}
              />
            ) : (
              <DetailView
                entry={entry}
                imageFailed={Boolean(failedImages[index])}
                onImageError={() => markImageFailed(index)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
