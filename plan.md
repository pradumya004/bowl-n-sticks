# Bowl n Sticks — Digital Menu & Admin Platform · Master Plan

> Living document. We update this as we finish each phase. Checkboxes = source of truth for "what's done."
> **Cafe:** working name **"Bowl n Sticks"** (repo `bowl-n-sticks`) — name is being changed from "Maggilicious"; final name TBD by owners. Brand name stays OUT of code (comes from DB) so the switch is trivial.
> Karwar · anime / Japanese-Korean themed · signature = noodles/ramen/maggi. · **Instagram:** @maggilicious_cafe · **Zomato:** 4.2★

---

## 1. The Vision

A premium, fast, mobile-first digital menu that customers open by scanning a permanent QR on their table. It should feel like a **hi-fi cafe experience at an affordable price** — the "wow, this place is so put-together" reaction — and be solid enough that we can **franchise it** later. Not generic AI-template design; a real, crafted anime/premium identity.

Two surfaces:
- **Customer menu** (public, view-only for now) — scan QR → beautiful browsable menu.
- **Admin panel** (private) — dashboard, analytics, and full menu management (sections, items, variants, add-ons, images, videos, text).

---

## 2. Scope Decisions (locked)

| Decision | Choice | Notes |
|---|---|---|
| Ordering | **View-only for Phase 1** | Waiters take orders. Zomato/Swiggy links + "scan for offers" only. |
| Ordering later | Deferred | Order-to-table / online payment added as a later phase *after owner discussion* (gf + her brother). Architected so it bolts on without a rewrite. |
| Stack | **Next.js (App Router) on Vercel + Supabase** | Postgres + Storage + Auth. No always-on server to keep alive → no cold-start slowness. |
| Multi-cafe / franchising | **Built into data model from day 1** | Every row carries `cafe_id`. Franchising = add a cafe, not a rebuild. |
| Tables | T1–T4 (configurable) | Permanent QR per table. Count can change without new QRs (see QR strategy). |
| Analytics | Views/table, top items & sections, peak hours/days, searches (incl. no-results) | Dashboard designed to grow. |

---

## 3. How We Work Together

- **You write the code and run the commands. I guide + review.**
- Each step I give you: what to run/write → why → what success looks like → then I check.
- I maintain: `plan.md` (this file), the project skill, and memory. You maintain: the app.
- We finish and verify one phase before starting the next.

---

## 4. What You Install Locally (once)

- [x] **Node.js LTS** — v20.11.0, npm 10.2.4 ✅ (verified 2026-09-21).
- [x] **Git** — 2.52.0 ✅ (verified 2026-09-21).
- [ ] A code editor (VS Code assumed).
- **No local database.** Supabase is cloud. No MySQL/Mongo server on your laptop.
- Accounts to create (free): **GitHub**, **Supabase**, **Vercel** (can sign in with GitHub).

---

## 5. Tech Stack & Why (Path A)

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | Edge-cached pre-rendered HTML = near-instant menu. Built-in image optimization (auto WebP/resize/lazy) — critical for a photo-heavy menu. Good Google SEO (people search the cafe). |
| Hosting | **Vercel** | First-class Next.js host, global edge CDN, free tier, deploy-on-push. |
| Database | **Supabase (Postgres)** | Menu is naturally relational (sections→items→variants→add-ons). Managed, always-on, no cold starts. |
| Media | **Supabase Storage** | Upload images/videos from the admin panel; served via CDN. |
| Auth | **Supabase Auth** | Admin login without building auth ourselves; roles ready for franchising. |
| QR | **Static URLs + generated PNG/SVG** | Permanent, never need reprinting. |

---

## 6. QR Strategy (permanent, never reprint)

- Each table QR encodes a **stable URL**, e.g. `https://menu.maggilicious.com/t/T1` (or Vercel domain until a custom domain is bought).
- The **URL is the permanent thing**. What that URL *shows* is controlled by data in the DB, so we can redesign the menu, change items, even add ordering later — the printed QR never changes.
- Adding/removing tables = add/remove a row + print one new QR for the new table only. Existing QRs untouched.
- QR also carries the table code so analytics knows which table scanned.

---

## 7. Data Model (high level — detailed in Phase 1)

```
cafe            (id, name, slug, timings, socials, ...)          ← franchising root
table           (id, cafe_id, code 'T1'..'Tn', label, active)
section         (id, cafe_id, name, description, sort_order, active)     e.g. "Ramen Dishes"
item            (id, section_id, name, description, veg_type, is_spicy,
                 base_price, image, video, tags, protein_g, sort_order, active, featured)
variant         (id, item_id, name, price_delta)    e.g. Ramen sizes / "Make it Cheese +20"
addon / topping (id, cafe_id or item_id, name, price)  e.g. Extra egg +20
item_addon      (join)                              which add-ons apply to which items
analytics_event (id, cafe_id, table_code, type, item_id?, query?, ts)
```
Veg/egg/non-veg/spicy tags, combo upgrades, and toppings from the real menu all map cleanly here.

---

## 8. Phases

### Phase 0 — Foundations & Setup
- [x] Confirm Node & Git installed. (Node 20.11, npm 10.2.4, git 2.52)
- [x] Create GitHub repo + local git. → private repo `pradumya004/bowl-n-sticks`, branch `main`.
- [x] Scaffold Next.js app, run it locally, see the starter page. → Next 16 (App Router, JS) + Tailwind v4 in `web/`.
- [x] First commit + push.
- [x] Connect Vercel to the repo (auto-deploy on push) — Root Directory = `web`. Live URL on Vercel.
- [x] Create Supabase project (cloud) + save keys in `web/.env.local`. → project ref `bxwfcyhlvfknkpivpjis`, region Mumbai/Singapore, new-style publishable key.

### Phase 1 — Data Model + Real Menu Seed
- [x] Design the SQL schema in Supabase. → `db/schema.sql` run; 5 tables live (verified via REST API).
- [x] Row-Level Security: public read done (anon reads active rows). Admin write policies deferred to Phase 4.
- [x] Enter the **real menu** as seed data → `db/seed.sql` run. Verified: 1 cafe, 4 tables, 23 sections, 141 items, 16 combo options. (diet_type/is_spicy/protein still to be double-checked against the printed menu by owner.)
- [x] Wire the Supabase client into Next.js; fetch the menu. → `web/lib/supabaseClient.js` + test fetch in `app/page.js` renders all sections + items. Phase 1 COMPLETE.

### Phase 2 — Customer Menu UI (the "wow")
- [x] Design direction locked → bold "Manga Pop", preview `design-previews/03-manga-plus.html` (02 kept for reference). Strict palette: cream/ink/red/yellow. Now building into Next.
- [x] Mobile-first layout: marquee, hero, sticky section nav, section blocks, item cards. Responsive grid (1 col phone / up to 3 desktop; featured spans full width).
- [x] Veg/egg/non-veg/spicy indicators, featured treatment (red shadow + bob), combos & options display, badge/protein stickers.
- [~] Search + filter: **section jump done** (sticky nav + IntersectionObserver active state). Search + veg-only/spicy filter NOT built yet — decide with owner.
- [x] Anime/Japanese polish: motion (marquee, pop, wiggle, bob, spin, chili shake), Space Grotesk + Inter, *Itadakimasu*, halftone.
- [ ] Performance pass → deferred to Phase 7 (pairs with real images in Phase 5). Currently server-rendered, emoji placeholders.

### Phase 3 — QR Codes
- [x] `/t/[code]` route: scanning a table QR opens the menu with that table in the hero (graceful fallback for unknown codes). `lib/menu.js#getTable`, `app/t/[code]/page.js`, shared `MenuView`. Live + verified (`/t/T1` → 200 "Table 1").
- [x] QR generator `web/scripts/gen-qr.mjs` (npm `qrcode`): `qr/T1..T4` PNG (1024px) + SVG, brand colours. Encodes `https://bowl-n-sticks.vercel.app/t/<code>`.
- [x] Print sheet `qr/print.html` (A4, 4 branded cards, "Scan for menu" + table label).
- [ ] **Before printing for real:** lock the final URL/domain, then re-run `node scripts/gen-qr.mjs <url>` and reprint. Printed QRs break if the domain changes later.

### Phase 4 — Admin: Auth + Menu Management
- [ ] Admin login (Supabase Auth).
- [ ] CRUD: sections (add/remove/reorder), items, variants, add-ons.
- [ ] Toggle active/featured, edit text & prices, drag-to-reorder.

### Phase 5 — Admin: Media
- [ ] Upload/replace item & section images and videos (Supabase Storage).
- [ ] Auto-optimized delivery; sensible size limits.

### Phase 6 — Admin: Dashboard + Analytics
- [ ] Capture events (menu open per table, item/section views, searches incl. no-results).
- [ ] Dashboard: views per table, top items & sections, peak hours/days, search insights.

### Phase 7 — Deploy, Domain & Performance
- [ ] Custom domain (e.g. maggilicious.com) — optional, when ready.
- [ ] Caching/ISR so menu is instant; Lighthouse pass.
- [ ] Backups + basic monitoring.

### Phase 8 — Later (post owner discussion)
- [ ] Order-to-table (kitchen/staff view, realtime).
- [ ] Online payments (Razorpay/UPI).
- [ ] Zomato/Swiggy deep links & offers module.
- [ ] Full franchising: multiple cafes, per-cafe admins, roles.

---

## 9. Design Direction (to define together in Phase 2)

- **Not** generic AI-template look. Draw from real references (e.g. Aura-style component sites the user likes, premium restaurant menus, tasteful anime/Japanese design).
- Premium but **user-friendly** — a hungry customer finds their dish in seconds.
- Anime/Japanese-Korean identity: typography, subtle motion, *Itadakimasu*, ramen/noodle motifs, manga texture — restrained, not cluttered.
- Mobile-first (everyone scans on a phone); fast, thumb-reachable, readable in cafe lighting.
- We'll gather references and agree the look before building.

---

## 10. Performance Principles (non-negotiable — "not ass slow")

- Pre-render/edge-cache the menu; revalidate when admin edits.
- Next.js `<Image>` for every photo (WebP, right-sized, lazy).
- No always-on server to cold-start (Supabase managed) → no Uptime-ping hack needed.
- Keep the menu payload lean; load images progressively.
- Target: menu visually usable in ~1s on cafe wifi/4G.

---

## 11. Open / Deferred Questions

- Custom domain name & who owns it (decide before Phase 7).
- Exact ordering/payment model (Phase 8, after owner discussion).
- Multi-language? (Karwar — English fine for now; revisit for franchising.)
- Any dish photos available, or do we shoot/collect them for Phase 5?

---

## Environment Variables

Set in `web/.env.local` (local dev) AND in Vercel → Settings → Environment Variables (live). Both are PUBLIC (safe in the browser); Supabase RLS keeps the key read-only.

| Variable | What it's for | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Which Supabase project/database the app connects to (base URL). | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public read-only key the browser uses to fetch the menu. | Supabase → Project Settings → API Keys |

---

## 12. Status Log

- **2026-09-21** — Plan created. Scope + stack locked (view-only Phase 1, Next.js + Supabase). Menu PDF parsed (~22 sections).
- **2026-09-22** — **Phase 2 DONE + LIVE.** Added the two `NEXT_PUBLIC_SUPABASE_*` vars to Vercel (type: Config) and redeployed; live at https://bowl-n-sticks.vercel.app. Desktop responsiveness fixed (footer rules 2-col, blurb width, grid overflow, featured cells). Starting Phase 3 (QR + per-table route), back to side-by-side.
- **2026-09-22** — **Phase 2 customer menu UI built.** `app/page.js` renders the live menu: Marquee, Hero (brand name from DB), sticky SectionNav (client, IntersectionObserver), DishCard (diet mark, stickers, protein, options), Footer (socials + rules). Responsive grid (1/2/3 cols, featured full-width). Palette/fonts as `@theme` tokens in `globals.css`; card/chrome CSS ported from approved `03-manga-plus`. Lint clean. Remaining: search + veg/spicy filter (deferred, ask owner), Lottie, real photos (Phase 5), Vercel env vars for live deploy.
- **2026-09-21** — **Phase 1 COMPLETE.** `@supabase/supabase-js` installed; `web/lib/supabaseClient.js` created; `app/page.js` test fetch renders all sections + items end to end. Next: Phase 2 (customer menu UI + design direction).
- **2026-09-21** — **Phase 1 (data): schema + seed done.** `db/schema.sql` + `db/seed.sql` run on Supabase. Verified via REST API: 1 cafe, 4 tables (T1-T4), 23 sections, 141 items, 16 combo options; RLS public-read works; nested reads work. Left to do in Phase 1: wire `@supabase/supabase-js` into Next and fetch the menu. Owner still to verify diet_type/is_spicy/protein against the printed menu.
- **2026-09-21** — **Phase 0 COMPLETE.** Node 20.11/npm 10.2.4/git 2.52 verified. Next.js 16 (App Router, JS) + Tailwind v4 scaffolded in `web/`, runs locally. Private GitHub repo `pradumya004/bowl-n-sticks` (branch `main`). Vercel connected (Root Directory `web`, auto-deploy on push). Supabase project `bxwfcyhlvfknkpivpjis` provisioned; `web/.env.local` holds URL + publishable key (new-style keys). Name in flux ("Bowl n Sticks" working name). Next up: Phase 1 — schema design + real menu seed.
