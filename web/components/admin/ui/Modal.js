"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Branded modal used for every admin add / edit / confirm flow.
// Closes on Escape or backdrop click, locks page scroll, focuses the first field.
export default function Modal({ open, onClose, title, kicker, children }) {
  const cardRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose in a ref so the effect below does NOT depend on it.
  // (onClose is usually an inline arrow, so its identity changes every render;
  //  depending on it would re-run the effect constantly and make the modal
  //  steal focus and flicker the scrollbar.)
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    function onKey(e) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);

    // Lock page scroll. Removing the scrollbar would shift the page sideways,
    // so pad the body by exactly the scrollbar width to keep it still.
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    cardRef.current?.querySelector("input, textarea, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]); // only when the modal actually opens or closes

  if (!open || typeof document === "undefined") return null;

  // Rendered into <body> via a portal. It must NOT live inside the section card:
  // that card gets a CSS `transform` on hover, and a transformed ancestor becomes
  // the containing block for position:fixed children, which would pin the modal
  // to the card instead of the viewport.
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div className="modal-card" ref={cardRef} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div className="modal-headings">
            {kicker && <span className="pill pill--yellow pill--tilt">{kicker}</span>}
            <h3>{title}</h3>
          </div>
          <button
            type="button"
            className="btn btn--icon"
            onClick={() => onCloseRef.current()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
