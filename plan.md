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
- [x] Create Supabase project (cloud) + save keys in `web/.env.local`. → project ref `weamsykuzutontupvygy` (personal-account project; the original work-email project was migrated away + deleted on 2026-09-22). New-style publishable key.

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
- [x] **Custom 404 + error pages** → `app/not-found.js` + `app/error.js`. Concept: a kitchen **order slip** for "the page you wanted", stamped **NOT FOUND** in red (stamp-slam animation), giant stroked number, 6 floating stickers, a quip line that cycles through 5 messages in pure CSS (no JS random = no hydration risk), Back-to-menu button. 500 page = same joke, `Status: Burnt`, stamped **REMAKE**. Covers public + admin routes.

### Phase 3 — QR Codes
- [x] `/t/[code]` route: scanning a table QR opens the menu with that table in the hero (graceful fallback for unknown codes). `lib/menu.js#getTable`, `app/t/[code]/page.js`, shared `MenuView`. Live + verified (`/t/T1` → 200 "Table 1").
- [x] QR generator `web/scripts/gen-qr.mjs` (npm `qrcode`): `qr/T1..T4` PNG (1024px) + SVG, brand colours. Encodes `https://bowl-n-sticks.vercel.app/t/<code>`.
- [x] Print sheet `qr/print.html` (A4, 4 branded cards, "Scan for menu" + table label).
- [ ] **Before printing for real:** lock the final URL/domain, then re-run `node scripts/gen-qr.mjs <url>` and reprint. Printed QRs break if the domain changes later.

### Phase 4 — Admin: Auth + Menu Management
- [x] Admin login (Supabase Auth). → `@supabase/ssr` (browser+server clients + `middleware.js` guarding `/admin`), `/admin/login` (email+password), `/admin` home + logout. Signups off; write RLS via `db/admin-policies.sql`. Login loop verified.
- [x] CRUD: **sections** (add/edit name+blurb/hide/delete) and **items** (add/edit/hide/delete, all 9 fields) via modals + server actions. Items CRUD **fully tested 2026-09-26** (9-test script, verified against the DB): field round-trip with no clobbering, RLS hides inactive rows from the public key, blank price → MRP, defaults on minimal input, required-name validation, counts, clean delete with no orphans.
- [x] Toggle active/featured + edit text & prices. (Featured/active both working.)
- [~] **Combo options CRUD** built (add/edit/delete on `menu_item_option`, inline rows inside an Options modal, no nested modals). **Not yet verified against the DB.**
- [x] **Drag-to-reorder** sections and items. Migration 002 adds `reorder_menu_sections(ids)` / `reorder_menu_items(ids)`: `unnest(ids) with ordinality` rewrites every `sort_order` in one atomic call and returns the row count, so a stale list is caught instead of silently half-applied. `security invoker` + `revoke from anon` keeps RLS in force and refuses anonymous callers outright. UI is dnd-kit with a grip strip per card (the only drag target, so the card's own buttons still work), optimistic order with rollback on failure.

### Phase 5 — Admin: Media
- [x] **Database tooling first**: `npm run migrate` applies `db/migrations/*.sql` once each, tracked in a `schema_migrations` table in the database, each file inside a transaction so a failure rolls back whole. `npm run sql -- "..."` for ad-hoc queries. Connection string lives in `SUPABASE_DB_URL` in `~/.bashrc`, never in the repo; `db/_connect.mjs` scrubs it from error output.
- [x] Upload/replace/remove **item images** (Supabase Storage, `menu-media` bucket). Section images: columns + actions exist, UI not wired yet.
- [x] Sensible size limits: 5 MB cap and an image-only mime allowlist enforced **by the bucket**, not just the form. Public reads, authenticated-only writes (verified: anon upload returns an RLS violation).
- [x] Auto-optimized delivery: `next/image` with `fill` + `sizes="92px"`, so a 3 MB phone photo reaches a diner as a ~92px WebP.
- [ ] **Videos** deliberately deferred — one clip outweighs every photo on the page, and "must not load slow" is a hard requirement. Revisit after seeing real photos on cafe wifi.

### Phase 6 — Admin: Dashboard + Analytics
- [x] Capture events: `menu_open` (with table code from the QR) and `section_view` (first time each section is scrolled to, deduped per page load). Search events are wired through but unused until search exists.
- [x] **Privacy by design**: no IP, no user agent, no cookie, no device id. A row is what happened, which table, and when.
- [x] **Customers can write but not read.** No RLS policy for `anon` on `analytics_event` at all; the only door is `record_event()`, a narrow `security definer` function that validates the event type, resolves `cafe_id` itself so it can't be forged, and truncates free text. Verified: anon write 204, anon table read returns `[]` while rows exist, forged event type rejected, `analytics_summary` refused outright.
- [x] Dashboard: headline menu opens + a per-day trend across the window, scans per table, most-looked-at sections, busiest hours, busiest days. Range switcher 7/30/90 days.
- [x] One `analytics_summary()` SQL function returns all of it as JSON in a single round trip; hours and days converted to **Asia/Kolkata** first (grouping raw UTC would report peak hours 5.5h off).
- [x] **Item-level views** (migrations 008/009) — reversed the earlier decision at the owner's request, and done in a way that is not noise: a dish counts only after **1 second on screen**, once per page load, and ids are **batched into one call** (capped at 60 server-side). `record_item_views()` joins to `menu_item` so junk uuids are dropped rather than stored. Surfaces as **Top dishes**.
- [ ] Search insights — blocked until menu search is built (deferred from Phase 2).

### Phase 7 — Deploy, Domain & Performance
- [ ] **Custom domain — decide BEFORE printing QR cards.** They currently encode `bowl-n-sticks.vercel.app`; changing the domain after printing means reprinting every card.
- [ ] Caching/ISR so menu is instant; Lighthouse pass.
- [ ] Backups + basic monitoring.

### Phase 9 — 404 Meme Feed (PARKED, agreed 2026-09-25)
Owner wants real memes pulled from **subreddits** (not a hand-picked handful) on the 404 page.
**Key decision: never fetch Reddit at request time** (Reddit rate-limits/403s cloud IPs like Vercel's, deleted posts break images, and it blocks page render). Instead cache into our own DB + Storage and serve random from there.
- [ ] 1. Owners pick the subreddits (config array, editable anytime).
- [ ] 2. Reddit **script app** (reddit.com/prefs/apps) → client ID + secret → `.env.local` + Vercel (Type: **Secret**). OAuth is required now; the public `.json` endpoint is throttled/blocked from servers.
- [ ] 3. `db/memes.sql`: table `meme` (`reddit_id` unique for dedupe, `source_subreddit`, `title`, `permalink`, `author`, `score`, `image_path`, `status` pending/approved/rejected, `created_at`) + RLS (public reads approved only, admin full).
- [ ] 4. Supabase Storage bucket `memes` (public read) so images are ours and can't 404.
- [ ] 5. `app/api/cron/fetch-memes/route.js`: OAuth token → top posts per sub → filter (images only, skip `over_18`/`stickied`/`spoiler`, min score, size cap) → dedupe on `reddit_id` → download → upload to Storage → insert as `pending`.
- [ ] 6. `vercel.json` cron (daily) + `CRON_SECRET` header check.
- [ ] 7. Admin moderation page `/admin/memes` (Approve/Reject grid, reuses `.btn`/`.pill`/modal). Keeps an NSFW/offensive post off a customer's screen; ~30s a week.
- [ ] 8. 404 pulls one random **approved** meme server-side (uncached) + small "via r/xyz" credit; falls back to the order-slip art when empty.
- [ ] 9. Test end to end; 10. log here.
Effort ~2-3 sessions. Note: memes are third-party content, the approve step + credit keeps it reasonable; don't reuse them in printed menus or paid ads.

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

- **2026-10-03 (layout consistency)** — Two pages broke the admin's rhythm. **QR page**: the red warning ran the full window while the paragraph above it wrapped at half that width, and the grid used `auto-fill`, which keeps empty tracks, so four cards huddled on the left of a void. Now `auto-fit`, one page width for banner/text/grid, and at under 480px it drops to two columns and hides the URLs (noise on a phone). **Settings page**: it was a single 760px column with dead space beside it while every other page filled the width. Now the same panel grid the dashboard uses - but capped at **two** columns, because `auto-fit` gave four on a laptop and squeezed the tagline and the rules box. Checked both at 390px, 780px and full width.

- **2026-10-03 (admin nav rationalised)** — Owner asked what the Photos tab was for and how Analytics differed from Dashboard. Both were fair: **Photos was a task list wearing a section's clothes** (it listed dishes missing a photo, which already lives in Needs attention) so it is **removed** - nav should not duplicate. **Dashboard vs Analytics now have distinct jobs**: Dashboard = the state of the menu right now (counts, what needs fixing, headline + trend, two charts), Analytics = the numbers over time with the 7/30/90 switcher and every chart. **QR Codes built** (`/admin/qr`): generated at request time from `dining_table` and the host actually being used, as SVG so they stay sharp at any print size - a committed folder of PNGs goes stale the moment a table is added or the domain changes. It refuses quietly to be useful on localhost by warning the codes won't scan. **Item view tracking added** (see §8). Sidebar is now honest: only Meme Feed still says Soon.

- **2026-10-03 (admin IA + settings)** — **Needs-attention rows now deep-link to the actual rows**, not a generic list page: `/admin/needs/<kind>` names each dish and its section, and the Fix link jumps to `#item-<id>` where the card flags itself via `:target`. A count with nowhere to click is noise. **Sidebar emoji replaced with drawn icons** matching the dashboard, and two badges that had become lies were fixed: Photos now points at the dishes still missing one, Analytics got its own page at `/admin/analytics` (range switcher + all four charts) so the dashboard stays an overview. **Cafe Settings built** (migration 007 adds `address`, `maps_url`, `phone`): name, tagline, address + maps link, phone, opening hours, Instagram/Zomato/Swiggy, and house rules one-per-line - all editable, all rendered in the live menu footer, nothing hard-coded. `maps_url` is validated to http(s) so a `javascript:` URL can't reach a page every customer opens. Verified settings, needs and analytics at 400px and 700px. **Still "Soon": Meme Feed (Phase 9, parked) and QR Codes.**

- **2026-10-03 (dashboard polish)** — Bottom of the dashboard was four plain white boxes with an emoji, inconsistent with the panels above. Rebuilt as proper tiles: drawn icon in a yellow chip, big number, the same ink border, hard shadow and hover lift the rest of the app uses. Filled the dead space below with **Needs attention** - dishes with no photo, dishes with no price, hidden dishes, hidden sections, sections with no dishes - each row linking to where you'd fix it, because a count with nowhere to click is noise. Counts come from `getMenuHealth()`, which uses `menu_section!inner(cafe_id)` so they stay correct once a second branch exists. Checked at 390px and 820px. Deleted the test events afterwards; `analytics_event` is back to 0.

- **2026-10-03 (later)** — **PHASE 6 DONE: analytics + dashboard.** Migrations 005/006 add `analytics_event` (bigint identity key, not uuid: this table outgrows every other one and a random uuid key bloats the index), `record_event()` as the single customer write path, and `analytics_summary()` returning the whole dashboard as one JSON round trip. Security verified against the live project, not assumed. Dashboard rebuilt: ink hero panel with the headline number and a 30-day trend, then scans/table, most-looked-at sections, busiest hours, busiest days, with a 7/30/90 range switcher. Charts are hand-built CSS, no charting library. Ran the dataviz palette validator, which **failed brand yellow at 1.54:1 contrast on cream** — so bars are red with the unique winner in ink, and yellow stays an accent. Values are always visible rather than hover-only, so each chart doubles as its own table view. Seeded ~550 sample events to judge the design, screenshotted at 30d and 7d, then deleted every row: `analytics_event` is back to 0.

- **2026-10-03** — **Phase 5 (photos) LIVE + migrations are now self-serve.** Built `npm run migrate` / `npm run sql` at the repo root (`pg` over the session pooler), so schema changes no longer need hand-pasting into the dashboard. What has run is tracked in a `schema_migrations` table **in the database**, each migration wrapped in a transaction. Credentials live in `SUPABASE_DB_URL` in `~/.bashrc`, outside the repo, and `_connect.mjs` scrubs connection strings out of error output. Baselined 001-002 (already applied by hand), then applied **003** (image_url/video_url → image_path/video_path, + menu_section.image_path) and **004** (the `menu-media` bucket: public read, 5 MB cap, image-only mime allowlist, authenticated-only writes). Verified against the live DB: columns exist, bucket configured, all 4 storage policies present, and an anonymous upload is refused with an RLS violation while anonymous read works. App side: upload/replace/remove photo per dish (fresh random filename each time so a replace is not served stale from the CDN; row repointed before the old file is deleted; section and dish deletes clean up their storage files, which Postgres' cascade cannot see), `next/image` on the menu with the 🍜 tile as fallback. Videos deferred on purpose.

- **2026-10-02** — **Admin responsive fix + hydration error, found by driving the browser.** Window resize would not take in Chrome, so the admin was rendered inside 360/390/560px iframes to exercise the breakpoints. Two real faults: (1) under 560px the admin top strip was `overflow-x: auto` with `margin-left: auto` on the account block, which pushed the signed-in email and **Log out entirely off-screen** with nothing to indicate horizontal scroll - it now wraps onto its own row; (2) dnd-kit numbers its `aria-describedby` by render order, so server and client disagreed and every admin list page threw a **hydration mismatch** - fixed by passing a stable `id` to `DndContext`. Console is clean on sections, items, dashboard and the public menu. Phase 5 (media) parked: it needs DDL that only the owner can run.

- **2026-10-02** — **PHASE 4 FEATURE-COMPLETE.** Drag-to-reorder shipped (migration 002 + dnd-kit, see §8). Audit fixes alongside it: **the footer was rendering empty on every page** (`<Footer />` got no `cafe` prop, so Instagram, Zomato and all 7 rules were invisible despite being in the DB); `protein_g` truthy-check printed a bare "0" for a 0g dish; `SortableList` matched cards by reading `child.props.id` across the server/client boundary and `.filter(Boolean)` silently dropped the 19 that failed to match (now matched by position, with an unsorted fallback instead of hiding cards). Also: Twemoji attribution added to the footer (CC BY 4.0, was owed since Sept), `middleware.js` → `proxy.js` for Next 16 (guard re-verified: `/admin` 307s to login, `/admin/login` 200s, `/` untouched), Next bumped 16.3.5 → 16.3.8 for a critical `next/og` RCE advisory, dead vars removed from the proxy. **Still open:** Paneer Ramen `is_spicy` needs unticking in prod; admin responsiveness needs a screenshot of what breaks; local Node 20 is deprecated by `@supabase/supabase-js` (wants 22+).
- **2026-10-01** — **Menu nav + width.** Sticky chip bar deleted (`SectionNav.js` + its CSS): 23 sections never fit a horizontal strip, so everything past Pizza was unreachable. Replaced by `SectionMenu.js`, a fixed bottom-right pill (Swiggy/Zomato pattern) that shows the section you're currently in and opens a panel listing all sections with item counts; real `#id` anchors so it still jumps without JS, Esc/backdrop close, safe-area insets. `.menu-wrap` raised 1080 → 1320px (3 dish columns → 4 on a laptop; hero text stays 640px so a tagline isn't stretched across the screen). `scroll-margin-top` 70 → 20px, no sticky bar left to clear. Dish tile 🍜 kept as-is by choice until Phase 5 photos. Fixed a responsive bug where `.sec-actions .btn { flex: 1 }` under 560px stretched the new 32px icon buttons across the card.
- **2026-09-26** — **Options CRUD + error handling + slug URLs.** (1) `menu_item_option` add/edit/delete via an Options modal on each dish card; edit and delete are inline rows, no modal stacked on a modal. (2) **Every server action now checks Supabase's `error`** — previously all of them ignored it, so an RLS denial or a dropped connection was indistinguishable from a successful save. Actions return the reason they failed or nothing; modals show it and stay open so a rejected save keeps the typed values; update/delete use `.select("id")` to catch writes that matched zero rows; reads throw so a DB outage hits `error.js` instead of rendering as "no sections". (3) **Migration 001** adds a generated `slug` column to `menu_section` (unique per `cafe_id`), so admin URLs read `/admin/sections/<slug>`; writes still key off the id. Route folder `[id]` → `[slug]`. (4) Per-row card actions are now icon buttons; create/confirm/cancel stay text. (5) `ARCHITECTURE.md` + `lib/debug.js` (`DEBUG_DATA=1`) added because the user is learning Postgres and was being handed code to copy rather than taught.
- **2026-09-26** — **Item CRUD DONE + fully tested.** 9-test script run against the live DB (Ramen Dishes), every result verified over the REST API, not just eyeballed: add writes all 9 fields correctly; new item appears on the public menu (proves `refreshMenu()` busts the static cache); edit changes only the fields touched (no clobbering); hide/show is enforced by RLS at the DB level, not hidden in the UI; blank price renders "MRP"; minimal input falls back to correct defaults (veg / not spicy / not featured / no badges); empty name is rejected; delete removes cleanly with no orphans. Menu is back to its seeded baseline (**141 items, 5 in Ramen Dishes**) with all three test dishes removed. Phase 4 remaining: combo options CRUD + drag-to-reorder.
- **2026-09-21** — Plan created. Scope + stack locked (view-only Phase 1, Next.js + Supabase). Menu PDF parsed (~22 sections).
- **2026-09-25** — **Admin restructure + UI hardening.** Routes: `/admin` is now the **dashboard**, sections moved to `/admin/sections` + `/admin/sections/[id]`; signed-in pages share `app/admin/(panel)/layout.js` (route group, so `/admin/login` gets no chrome). **Structure rule: `app/` holds routes only** — components live in `components/menu|admin/ui|admin/sections|admin/items|ui`, server actions in `lib/actions/{sections,items,shared}.js`, `lib/supabaseClient.js` renamed `lib/supabase/public.js`. Sidebar rebuilt as an **ink panel** (cream on ink, same pairing as the marquee), grouped nav with Soon badges for unbuilt areas, account + logout moved into it. **Browser-native UI replaced everywhere**: number spinners, checkboxes, `<select>` (now a segmented control), placeholders, selection colour, focus rings, scrollbars, Chrome autofill wash, `title` tooltips. Bugs fixed: missing `?.` on badges parse (would crash the dish form), 5c-ii form CSS never added, `ItemCardActions` imported but not rendered, blurb `-8px` margin overlapping the section title.
- [ ] **TODO (licensing):** the spicy chilli uses **Twemoji** artwork (CC-BY 4.0) recoloured to brand red — it needs a visible credit (footer or NOTICE), or swap to Noto Emoji (Apache-2.0, no visible credit). Decide before launch.
- **2026-09-25** — **404 + 500 pages shipped** (`app/not-found.js`, `app/error.js`): kitchen order-slip concept stamped NOT FOUND / REMAKE, floating stickers, CSS-cycled quip lines. Reddit **meme feed parked as Phase 9** with full steps (cache-into-our-DB architecture, not live fetch). Back to Phase 4 item CRUD.
- **2026-09-25** — **UI consistency pass.** Added a shared design scale in `globals.css` (`--line-sm/--line/--line-lg`, `--sh-sm/--sh/--sh-lg/--sh-xl`, `--r-sm/--r/--r-lg/--r-xl/--r-pill`), values taken from the approved menu design. Collapsed the admin's **6 button styles into ONE `.btn`** (variants `--sm --primary --danger --accent --block --icon`) and **4 pill styles into ONE `.pill`** (`--yellow --red --ink --round --tilt`), plus one shared `.admin-field` for inputs + textareas. Deleted every one-off class (`admin-kicker/submit/newbtn/logout`, `modal-x/kicker`, `sec-btn`, `sec-card-count/off`). Admin item price now uses the same ink pill as the menu. **Customer menu untouched.** Lint clean. Next: custom 404/error page.
- **2026-09-22** — **Supabase migrated to a personal-account project** (`weamsykuzutontupvygy`) after finding the old project was under the work email. Old project/account deleted. Rebuild = re-run `db/schema.sql` + `db/seed.sql`; update `NEXT_PUBLIC_SUPABASE_*` in `web/.env.local` + Vercel with the new URL + new publishable key; redeploy. QRs unaffected (point at vercel.app). VERIFIED clean: new-project row counts match, live deploy green, all 4 table routes render correct labels, no legacy refs/keys in code.
- **2026-09-22** — **Phase 3 DONE.** `/t/[code]` route live (all T1-T4 verified 200 + correct label), QR generator + `qr/*` images + `qr/print.html` print sheet. Scan-to-menu confirmed working on a real phone. QRs point at vercel.app (regenerate before physical print if a custom domain is chosen). Next: Phase 4 admin (auth + menu management).
- **2026-09-22** — **Phase 2 DONE + LIVE.** Added the two `NEXT_PUBLIC_SUPABASE_*` vars to Vercel (type: Config) and redeployed; live at https://bowl-n-sticks.vercel.app. Desktop responsiveness fixed (footer rules 2-col, blurb width, grid overflow, featured cells). Starting Phase 3 (QR + per-table route), back to side-by-side.
- **2026-09-22** — **Phase 2 customer menu UI built.** `app/page.js` renders the live menu: Marquee, Hero (brand name from DB), sticky SectionNav (client, IntersectionObserver), DishCard (diet mark, stickers, protein, options), Footer (socials + rules). Responsive grid (1/2/3 cols, featured full-width). Palette/fonts as `@theme` tokens in `globals.css`; card/chrome CSS ported from approved `03-manga-plus`. Lint clean. Remaining: search + veg/spicy filter (deferred, ask owner), Lottie, real photos (Phase 5), Vercel env vars for live deploy.
- **2026-09-21** — **Phase 1 COMPLETE.** `@supabase/supabase-js` installed; `web/lib/supabaseClient.js` created; `app/page.js` test fetch renders all sections + items end to end. Next: Phase 2 (customer menu UI + design direction).
- **2026-09-21** — **Phase 1 (data): schema + seed done.** `db/schema.sql` + `db/seed.sql` run on Supabase. Verified via REST API: 1 cafe, 4 tables (T1-T4), 23 sections, 141 items, 16 combo options; RLS public-read works; nested reads work. Left to do in Phase 1: wire `@supabase/supabase-js` into Next and fetch the menu. Owner still to verify diet_type/is_spicy/protein against the printed menu.
- **2026-09-21** — **Phase 0 COMPLETE.** Node 20.11/npm 10.2.4/git 2.52 verified. Next.js 16 (App Router, JS) + Tailwind v4 scaffolded in `web/`, runs locally. Private GitHub repo `pradumya004/bowl-n-sticks` (branch `main`). Vercel connected (Root Directory `web`, auto-deploy on push). Supabase project `bxwfcyhlvfknkpivpjis` provisioned; `web/.env.local` holds URL + publishable key (new-style keys). Name in flux ("Bowl n Sticks" working name). Next up: Phase 1 — schema design + real menu seed.
