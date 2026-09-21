# Maggilicious — Digital Menu & Admin Platform · Master Plan

> Living document. We update this as we finish each phase. Checkboxes = source of truth for "what's done."
> **Cafe:** Maggilicious (spelled with double-g — pun on *Maggi* noodles) · Karwar · anime / Japanese-Korean themed · signature = noodles/ramen/maggi.
> **Instagram:** @maggilicious_cafe · **Zomato:** 4.2★

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
- [ ] Confirm Node & Git installed.
- [ ] Create GitHub repo + local git.
- [ ] Create Supabase project (cloud) + save keys in `.env.local`.
- [ ] Scaffold Next.js app, run it locally, see the starter page.
- [ ] First commit + push.
- [ ] Connect Vercel to the repo (auto-deploy on push) — get a live URL early.

### Phase 1 — Data Model + Real Menu Seed
- [ ] Design the SQL schema (tables above) in Supabase.
- [ ] Set up Row-Level Security (public read, admin write).
- [ ] Enter the **real Maggilicious menu** as seed data (all ~22 sections + items + prices + tags + combos + add-ons).
- [ ] Wire the Supabase client into Next.js; fetch the menu.

### Phase 2 — Customer Menu UI (the "wow")
- [ ] Design direction locked (see §9) — real inspiration, not AI-generic.
- [ ] Mobile-first layout: hero, sticky section nav, section blocks, item cards with photo/tags/price.
- [ ] Veg/egg/non-veg/spicy indicators, "featured/fan-favorite" treatment, combos & add-ons display.
- [ ] Search + filter (veg-only, spicy, section jump).
- [ ] Anime/Japanese polish: motion, typography, *Itadakimasu*, subtle theming.
- [ ] Performance pass (see §10).

### Phase 3 — QR Codes
- [ ] Generate permanent QR PNG/SVG for T1–T4 pointing at `/t/{code}`.
- [ ] Print-ready sheet (table tents / stickers) for the owners.

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

## 12. Status Log

- **2026-09-21** — Plan created. Scope + stack locked (view-only Phase 1, Next.js + Supabase). Menu PDF parsed (~22 sections). Next up: Phase 0 setup, coded side-by-side.
