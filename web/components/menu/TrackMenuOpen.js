"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

// Renders nothing. Logs one menu_open when the page is first shown.
export default function TrackMenuOpen({ tableCode }) {
  // React runs effects twice in development's Strict Mode, which would double
  // every number on the dashboard. The ref makes it fire once per mount.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) {
      return;
    }
    sent.current = true;
    track("menu_open", { tableCode });
  }, [tableCode]);

  return null;
}
