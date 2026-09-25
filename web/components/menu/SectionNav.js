"use client";
import { useEffect, useState } from "react";

// Sticky chip bar. Clicking a chip jumps to that section (via #id anchors);
// as you scroll, the chip for the section near the top highlights itself.
export default function SectionNav({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      // "active" = the section whose top is just below the nav bar
      { rootMargin: "-70px 0px -70% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="nav">
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={s.id === active ? "on" : ""}>
          {s.name}
        </a>
      ))}
    </nav>
  );
}
