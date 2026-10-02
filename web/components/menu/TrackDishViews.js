"use client";
import { useEffect } from "react";
import { trackItems } from "@/lib/track";

// Logs which dishes a diner actually looked at.
//
// Two deliberate limits, because the naive version is useless data:
// 1. A dish counts only after it has been on screen for a full second. Fast
//    scrolling past something is not looking at it.
// 2. Each dish counts once per page load, and the ids are batched into one
//    request rather than one call per card.
const DWELL_MS = 1000;

export default function TrackDishViews() {
  useEffect(() => {
    const seen = new Set();
    const pending = new Set();
    const timers = new Map();

    function flush() {
      if (pending.size === 0) {
        return;
      }
      const batch = [...pending];
      pending.clear();
      trackItems(batch);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.dataset.dish;
          if (!id || seen.has(id)) {
            continue;
          }
          if (entry.isIntersecting) {
            timers.set(
              id,
              setTimeout(() => {
                seen.add(id);
                pending.add(id);
                timers.delete(id);
                if (pending.size >= 40) flush();
              }, DWELL_MS),
            );
          } else {
            clearTimeout(timers.get(id));
            timers.delete(id);
          }
        }
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("[data-dish]").forEach((el) => observer.observe(el));

    // Send on the way out. visibilitychange fires when a phone is locked or the
    // tab is switched, which "beforeunload" misses on mobile browsers.
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    const interval = setInterval(flush, 15000);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      clearInterval(interval);
      timers.forEach(clearTimeout);
      flush();
    };
  }, []);

  return null;
}
