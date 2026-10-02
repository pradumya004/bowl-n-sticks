"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/track";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import SpicyMark from "@/components/ui/SpicyMark";

const DIETS = [
  { value: "all", label: "All" },
  { value: "veg", label: "Veg" },
  { value: "egg", label: "Egg" },
  { value: "nonveg", label: "Non-veg" },
];

// Search and diet filter for the customer menu.
//
// It hides cards in place rather than re-rendering the menu. The menu is
// server-rendered HTML, which is what makes it open instantly on a phone; moving
// 141 dishes into browser state to support a feature most diners never touch
// would trade that away. So the server still renders everything and this walks
// the DOM.
export default function MenuFilter({ dishes }) {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("all");
  const [spicyOnly, setSpicyOnly] = useState(false);
  const logged = useRef(new Set());

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || diet !== "all" || spicyOnly;

  // Matching happens here, during render, from plain data. The effect below only
  // applies the result to the DOM. Doing the counting inside the effect meant
  // setting state from an effect, which is the bug that bit the 404 page.
  const matches = useMemo(() => {
    const set = new Set();
    for (const d of dishes) {
      if (q && !d.text.includes(q)) continue;
      if (diet !== "all" && d.diet !== diet) continue;
      if (spicyOnly && !d.spicy) continue;
      set.add(d.id);
    }
    return set;
  }, [dishes, q, diet, spicyOnly]);

  const found = filtering ? matches.size : null;

  useEffect(() => {
    for (const card of document.querySelectorAll("[data-dish]")) {
      card.hidden = filtering && !matches.has(card.dataset.dish);
    }

    // A section whose dishes are all hidden must go too, otherwise you scroll
    // past a row of headings with nothing under them.
    for (const section of document.querySelectorAll(".sec")) {
      const anyVisible = section.querySelector("[data-dish]:not([hidden])");
      section.hidden = filtering && !anyVisible;
    }

    document.body.classList.toggle("is-filtering", filtering);
  }, [matches, filtering]);

  // Log what people search for, once per distinct query, and only after they
  // stop typing. Without the debounce "chicken" would log seven times.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      return;
    }
    const timer = setTimeout(() => {
      if (logged.current.has(q.toLowerCase())) {
        return;
      }
      logged.current.add(q.toLowerCase());
      track("search", { query: q });
    }, 900);
    return () => clearTimeout(timer);
  }, [query]);

  function clearAll() {
    setQuery("");
    setDiet("all");
    setSpicyOnly(false);
  }

  return (
    <div className="filterbar">
      <div className="filterbar-row">
        <label className="filter-search">
          <MenuIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            aria-label="Search the menu"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </label>

        <div className="filter-chips">
          {DIETS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`fchip ${diet === d.value ? "is-on" : ""}`}
              onClick={() => setDiet(d.value)}
              aria-pressed={diet === d.value}
            >
              {d.value !== "all" && (
                <span className={`diet ${d.value}`} aria-hidden="true" />
              )}
              {d.label}
            </button>
          ))}
          <button
            type="button"
            className={`fchip ${spicyOnly ? "is-on" : ""}`}
            onClick={() => setSpicyOnly((v) => !v)}
            aria-pressed={spicyOnly}
          >
            <SpicyMark />
            Spicy
          </button>
        </div>
      </div>

      {found !== null && (
        <p className="filter-count">
          {found === 0 ? (
            <>
              Nothing matches that. <button type="button" onClick={clearAll}>Clear</button>
            </>
          ) : (
            <>
              {found} {found === 1 ? "dish" : "dishes"}{" "}
              <button type="button" onClick={clearAll}>Clear</button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
