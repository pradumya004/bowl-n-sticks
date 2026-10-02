# Bowl n Sticks - project rules

Read this before touching anything. `plan.md` has the phases and status log,
`ARCHITECTURE.md` explains how the app works, `db/README.md` covers the database
tooling. This file is the rules.

---

## 1. Responsive is not optional

**No page is done until it has been LOOKED AT at 390px and 820px.** Not reasoned
about - looked at. This has been asked for more times than anything else.

Chrome ignores `resize_window` on this machine. Render the page in fixed-width
iframes instead, where media queries respond to the frame width:

```js
document.documentElement.innerHTML =
  '<body style="margin:0;display:flex;gap:6px">' +
  '<iframe src="/the/path" width="390" height="700"></iframe>' +
  '<iframe src="/the/path" width="820" height="700"></iframe></body>';
```

To measure rather than eyeball, check `scrollWidth > clientWidth` inside each
frame. Traps already hit here:

- `auto-fill` leaves empty grid tracks, so content huddles left of a void. Use `auto-fit`.
- `auto-fit` with a small minimum gives too MANY columns on a laptop and squeezes content. Cap it with an explicit `1fr 1fr` at a breakpoint when two is the maximum.
- A full-bleed banner beside text that wraps at half the width reads as broken. One page width for everything.
- `min-width: auto` is the default on grid/flex items, and an `<input>`'s intrinsic minimum is its `size` attribute (~20 chars). `width: 100%` does not fix it. Use `min-width: 0`.
- `flex: 1` stretches fixed-size things. Exclude 32px icon buttons.
- Anything `position: fixed` needs `env(safe-area-inset-*)`.

## 2. The design is chosen. Do not soften it.

"Manga Pop": cream `#FBF3E7`, ink `#141210`, ONE primary red `#FF3B30`, ONE
accent yellow `#FFC53D`. Thick borders, hard offset shadows, Space Grotesk
display + Inter, halftone texture, rotated stickers.

- Fixed jobs: **ink** = borders/shadows/price/text, **red** = the single highlight, **yellow** = the single accent. No per-section colours.
- Never redesign toward neutral/minimal/"clean". A past attempt to make it "more subtle" destroyed it and the original had been deleted. Never delete or overwrite something the user said they liked without keeping a copy.
- Yellow fails contrast on cream (**1.54:1**, measured). It is an accent and a hover state, never a bar fill or body text.

## 3. UI consistency

One scale in `globals.css`: `--line-sm/--line/--line-lg`, `--sh-sm/--sh/--sh-lg/--sh-xl`, `--r-sm/--r/--r-lg/--r-xl/--r-pill`. No one-off values.

- ONE `.btn` (`--sm --primary --danger --accent --block --icon`), ONE `.pill` (`--yellow --red --ink --round --tilt`), one `.admin-field`.
- **No browser-native UI anywhere**: no `<select>` (use `.seg-*`), no `window.confirm` (use `Modal`), no `title` tooltips (use `aria-label` + a CSS chip), no default focus rings/scrollbars/number spinners.
- **Row-level actions are icons; create, confirm and cancel stay text.** Icons are drawn in `components/ui/icons.js` - never an emoji, never an icon pack (licensing).
- Admin panels: ink border, hard shadow, yellow icon chip on the heading. An ink block with display type anchors every page.
- A count with nowhere to click is noise. Make it link to where you'd fix it.

## 4. Writing

- **Never an em dash or en dash.** Plain hyphen, comma, parentheses, or two sentences. Everywhere: chat, code, commits, docs.
- Lean. No filler, no restating the obvious, no padded intros.
- **Never any AI/Claude attribution** in commits, PRs, or any artifact.

## 5. Commit messages

Scannable, not prose. A one-line subject, then section headings with bullets:

```
short imperative subject

Section heading
- what changed
- why, where it is not obvious

Another heading
- one bullet per thing
```

## 6. Explaining to the user

He is a MERN dev meeting Postgres for the first time, and Next after a gap.
Being handed code to type teaches him nothing, and he has said so.

- Every file gets a plain-words walkthrough **after** the code: which layer it is in, what runs server vs browser, the shape of the data in and out, which first principle it serves.
- Flow-first narrative in the order things happen. **Keep every technical term** and gloss it. Anchor to real `file.js:line`. No bullet-dump spec sheets.
- Cover a new Postgres concept **before** the code that uses it.
- `DEBUG_DATA=1` in `web/.env.local` makes `lib/debug.js` print row shapes **to the terminal** - server components log there, not to devtools.

## 7. Database

Tooling is at the repo root: `npm run migrate`, `npm run migrate:status`,
`npm run sql -- "select ..."`. Connection string lives in `SUPABASE_DB_URL` in
`~/.bashrc`, never in the repo. Non-interactive shells do not read `.bashrc`, so
prefix commands with `. ~/.bashrc >/dev/null 2>&1;`.

- Every `db/*.sql` opens with its Supabase SQL Editor **Name + Description**. The description states behaviour, never an example value or a row count - those go stale.
- A migration must ALSO be mirrored into `schema.sql`, or a fresh rebuild differs from a migrated database. `schema.sql` says `create table if not exists`, so it can never alter a live table - that is what migrations are for.
- Migrations are numbered and run once each, tracked in `schema_migrations` **in the database**.
- **Verify against the live database, never assume.** Row counts, policies, and refusals all get checked.

## 8. Security

- `anon` can read active rows and nothing else. Every write path is `authenticated`.
- **`security definer` is the exception, not the rule.** It bypasses RLS. Only for a narrow validated door (`record_event`, `record_item_views`), always with `set search_path = public` and `revoke ... from public`.
- Supabase returns `{ data, error }` and **never throws**. Ignore `error` and a failure is indistinguishable from success.
- **Writes return a message or nothing; reads throw.** Writes must not throw: Next hides server errors in production and the error boundary wipes the open form. Reads throw so `error.js` shows - a DB outage must never render as "no sections".
- `update`/`delete` use `.select("id")`. RLS filters rows silently and returns 204, which is indistinguishable from success without it.
- Never store the Supabase **secret** key anywhere. The publishable key is public by design.
- `.env*` files are blocked from Claude's tools. The user edits those.

## 9. Files and media

- `app/` holds **routes only**. Components by feature in `components/`, logic in `lib/`.
- A `"use server"` file may only EXPORT async functions.
- Store the **path** inside the storage bucket, never a full URL - a URL hard-codes the Supabase project ref, and this project already changed refs once.
- Uploads go **browser → Storage directly**, never through a Server Action: the body is capped at 1 MB by Next and 4.5 MB by Vercel.
- Every upload gets a fresh random filename, or a replaced photo serves stale from the CDN for hours.
- Point the row at the new file **before** deleting the old one.
- Deleting a row must delete its storage files. Postgres cascades rows; it cannot see Storage.

## 10. Privacy

Analytics store **no IP, no user agent, no cookie, no device id**. A row is what
happened, at which table, and when. Keep it that way.

## 11. Things that are not code, and matter

- **The QR codes encode the current domain.** Decide the domain BEFORE printing, or every card gets reprinted.
- The cafe name is never written in code - it comes from the `cafe` row, so a rename is a form submission.
- Twemoji artwork (the chilli) is CC BY 4.0 and the credit is in the footer. Keep it.
