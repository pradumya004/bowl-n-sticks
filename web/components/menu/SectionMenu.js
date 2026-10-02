"use client";
import { useEffect, useRef, useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { track } from "@/lib/track";

// Floating section jumper, the Swiggy/Zomato pattern. Replaces the old sticky
// chip bar: 23 sections never fit in a strip, so everything past Pizza was
// unreachable. The button always shows the section you're currently in.
export default function SectionMenu({ sections }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);
  const panelRef = useRef(null);
  // Sections already counted on this page load. Without it, scrolling up and
  // down the menu would log the same section over and over.
  const counted = useRef(new Set());

  // Track which section is under the viewport, same as the old nav did.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          const id = visible[0].target.id;
          setActive(id);
          if (!counted.current.has(id)) {
            counted.current.add(id);
            track("section_view", { sectionId: id });
          }
        }
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Esc closes; focus moves into the panel so keyboard users aren't stranded.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const activeName =
    sections.find((s) => s.id === active)?.name ?? sections[0]?.name ?? "Menu";

  return (
    <>
      <button
        type="button"
        className="secmenu-fab"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label={`Jump to a section. Currently in ${activeName}`}
      >
        <MenuIcon />
        <span className="secmenu-fab-label">{activeName}</span>
      </button>

      {open && (
        <div
          className="secmenu-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Menu sections"
            className="secmenu-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="secmenu-head">
              <h2>Menu</h2>
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="secmenu-list">
              {sections.map((s) => (
                <li key={s.id}>
                  {/* a plain anchor, so it still jumps if JS hasn't loaded */}
                  <a
                    href={`#${s.id}`}
                    className={s.id === active ? "is-here" : ""}
                    onClick={() => setOpen(false)}
                  >
                    <span>{s.name}</span>
                    <span className="secmenu-count">{s.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
