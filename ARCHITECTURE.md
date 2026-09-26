# How this app actually works

Written for the person maintaining this code. Read it once, then use it to find things.

---

## 1. There is no backend server

This is the biggest mental shift from MERN.

In MERN you run **two programs**: an Express server (backend) and a React app (frontend). They talk over HTTP, and you write routes like `app.get("/api/items", ...)`.

Here there is **one program**, Next.js, and it decides per file whether code runs on the server or in the browser.

| MERN | This project |
|---|---|
| `express` server you start and keep alive | Next.js, deployed as functions on Vercel |
| `app.get("/api/menu")` route | a file at `app/page.js` that fetches directly |
| `axios.get("/api/menu")` in React | no fetch at all - the server already has the data |
| `mongoose.find()` / `pool.query()` | `supabase.from("menu_item").select(...)` |
| `jsonwebtoken` + `authMiddleware` | Supabase Auth + `middleware.js` + RLS |

**The rule that tells you which is which: `"use client"` at the top of the file.**

- **No `"use client"`** → runs on the **server**. Can touch the database. Its `console.log` prints in the **terminal running `npm run dev`**. Ships zero JavaScript to the browser.
- **`"use client"`** → runs in the **browser**. Can use `useState`, `onClick`. Its `console.log` prints in **browser devtools**. Cannot touch the database.

If you remember one thing from this document, remember that.

---

## 2. The three layers

```
app/                  ROUTES      which URL shows what
components/           UI          what it looks like
lib/                  LOGIC       reads, writes, database, auth
```

`lib/` is the closest thing to "the backend". Split by job:

| File | Job |
|---|---|
| `lib/supabase/public.js` | connection used for **public reads** (anonymous key) |
| `lib/supabase/server.js` | connection that **carries the logged-in admin's session** |
| `lib/supabase/client.js` | connection for the **browser** (login/logout only) |
| `lib/menu.js` | **reads** for the customer menu |
| `lib/adminMenu.js` | **reads** for the admin panel (includes hidden rows) |
| `lib/actions/*.js` | **writes** - create / update / delete |
| `middleware.js` | the gate: blocks `/admin/*` when not signed in |

Three connections, not one, because **each carries a different identity**, and the database grants different rights to each. That is the whole security model. Section 6.

---

## 3. What Supabase actually is

Supabase is **Postgres** - a real SQL database - plus a few services around it.

There is **no ORM**. No Mongoose, no Prisma. What you're calling is **PostgREST**: a service that turns HTTP requests into SQL.

So this JavaScript:

```js
supabase
  .from("menu_item")
  .select("id, name, price")
  .eq("menu_section_id", sectionId)
  .order("sort_order")
```

becomes this HTTP request:

```
GET /rest/v1/menu_item?select=id,name,price&menu_section_id=eq.<uuid>&order=sort_order
```

which Postgres runs as roughly this SQL:

```sql
select id, name, price
from menu_item
where menu_section_id = '<uuid>'
order by sort_order;
```

**Every `.from(...).select(...)` chain is a SQL query you are writing in JavaScript.** That's why the table and column names must match `db/schema.sql` exactly - a typo like `menu)item_option` isn't a JS error, it's a request for a table that doesn't exist.

### The nested select is a JOIN

This, in `lib/menu.js`:

```js
.select(`
  id, name, blurb, sort_order,
  items:menu_item (
    id, name, price,
    options:menu_item_option ( label, price, is_delta )
  )
`)
```

does three tables in **one** round trip. PostgREST knows `menu_item` has `menu_section_id` pointing at `menu_section` (a foreign key in `schema.sql`), so it joins them automatically and nests the result.

`items:` and `options:` are **renames** - without them the keys would be `menu_item` and `menu_item_option`.

In MERN this would be three queries and a manual regroup, or an aggregation pipeline. That's the payoff of a relational database for a menu: sections own items, items own options, and the foreign keys say so.

---

## 4. Tracing one customer request

Someone scans the QR on table 3.

```
1. Browser   GET /t/T3
2. Next      matches app/t/[code]/page.js          (server component)
3. page.js   calls getTable("T3") and getMenu()    -> lib/menu.js
4. menu.js   uses lib/supabase/public.js (anon key)
5. Postgres  RLS filters to active rows only, returns JSON
6. menu.js   sorts sections/items/options by sort_order
7. page.js   renders components/menu/* to HTML
8. Browser   receives finished HTML
```

Note **what did not happen**: no `/api/...` route, no `fetch` from the browser, no loading spinner. The server already had the data when it built the page. That's why the menu opens fast on a phone.

### Where does sorting happen, SQL or JavaScript?

Both, deliberately:

- `.order("sort_order")` sorts the **top-level** sections in SQL.
- The `.sort()` calls in `menu.js` sort the **nested** items and options in JS, because PostgREST can't order nested rows reliably.

---

## 5. Tracing one admin write

You change a dish price and hit Save.

```
1. Browser   ItemCardActions.js ("use client") builds FormData
2. Browser   calls updateItem(formData)
             -> looks like a function call; is actually an HTTP POST
3. Server    lib/actions/items.js runs (it has "use server")
4.           itemFromForm()  parses the strings into real types
5.           itemProblem()   validates -> returns a message if bad
6.           supabase.from("menu_item").update(...).eq("id", id).select("id")
7. Postgres  RLS checks this session may write; updates; returns the row
8.           refreshMenu() -> revalidatePath("/", "layout")
9. Browser   gets back undefined (success) or a string (the reason it failed)
```

### Server Actions

`"use server"` at the top of `lib/actions/items.js` is what makes step 2-3 work. Next replaces the function with a stub that POSTs to the server, runs the real one there, and returns the result.

It is an API endpoint. You just don't write the routing, the URL, the JSON parsing or the `axios` call.

Two rules that follow:
- **A `"use server"` file may only export `async function`s.** That's why `itemFromForm` and `GONE` are not exported - they'd be invalid exports.
- **Never trust the input.** The browser can POST anything to a server action, exactly like it can to an Express route. That's what `itemProblem()` is for.

### Why `FormData` and not an object

Server actions receive `FormData` from a real `<form>` submit. Everything in it is a **string** - `"199"`, not `199`; a checkbox is `"on"` or absent entirely.

`itemFromForm()` is the conversion layer. This is why `price: price ? Number(price) : null` exists, and why `is_spicy: formData.get("is_spicy") === "on"`.

### Why `revalidatePath`

The customer menu is **cached**. Vercel serves saved HTML instead of querying Postgres for every diner - that's the speed.

The cost: after you edit a dish, the cache still holds the old HTML. `revalidatePath("/", "layout")` throws it away so the next visitor gets fresh HTML.

**Forget this and edits will not appear on the menu.** It is the single most important line in the write path.

---

## 6. The first-principles checklist

### Authentication - *who are you?*

Supabase Auth. `app/admin/login/page.js` calls `signInWithPassword`, Supabase sets a **session cookie**. Signups are OFF in the dashboard, so only accounts created by hand exist.

### Authorization - *what may you do?* (two layers)

**Layer 1, `middleware.js`** runs before any `/admin/*` page. No session → redirect to login. This protects **pages**.

**Layer 2, Row-Level Security** in `db/schema.sql` + `db/admin-policies.sql`. This protects **data**, and it lives in the database itself:

```sql
-- anonymous visitors may READ, and only rows where active = true
create policy "public read menu_item" on menu_item
  for select to anon using (active);

-- signed-in admins may do anything
create policy "admin all menu_item" on menu_item
  for all to authenticated using (true) with check (true);
```

Why both? Because **middleware can be bypassed and RLS cannot.** The public key is in the browser, visible to anyone. Someone could take it and call the Supabase API directly, skipping our app entirely. RLS still stops them: Postgres refuses the write. Middleware is convenience; RLS is the actual wall.

This is also why "hidden" really is hidden. `active = false` means the anon key cannot see the row at all - it isn't fetched and hidden with CSS.

### Validation - *is this data sane?* (three layers)

| Layer | Where | Example |
|---|---|---|
| Browser | `required`, `type="number"`, `maxLength` in the JSX | catches typos instantly |
| Server | `itemProblem()`, `optionProblem()` in `lib/actions/` | the one that counts - browser checks can be bypassed |
| Database | `check (price >= 0)`, `not null`, foreign keys in `schema.sql` | last line of defence, protects against bugs in our own code |

### Error handling

**Writes return, reads throw.**

Writes return the reason they failed, or nothing on success. They don't throw, because Next hides server error messages in production and the error boundary would wipe the form you were typing in.

Reads throw, so `app/error.js` shows. A database outage must never render as "no sections" or "table not found".

`dbFailure()` in `lib/actions/shared.js` does both jobs: `console.error` for the Vercel logs, and a readable sentence for the user.

**Supabase never throws.** It returns `{ data, error }`. Ignore `error` and a failure is indistinguishable from a success - that bug was in every action in this project until it was fixed.

---

## 7. Seeing the data for yourself

Add to `web/.env.local`:

```
DEBUG_DATA=1
```

Restart `npm run dev`. Now `lib/debug.js` prints every database result.

**The output goes to the terminal running `npm run dev`, NOT the browser console**, because these reads happen in server components. This trips up everyone coming from React.

Load `/` and you'll see the real shape:

```js
───── getMenu: raw first section (before sorting) ─────
{
  id: 'a1b2...',
  name: 'Combo Meals',
  blurb: 'Meal combos...',
  sort_order: 1,
  items: [
    {
      id: 'c3d4...',
      name: 'Maggi Meals',
      price: 129,              // number, because Postgres numeric -> JSON number
      diet_type: 'veg',        // text, one of veg | egg | nonveg
      is_spicy: false,         // real boolean, not "false"
      badges: [ 'Highest selling' ],  // Postgres text[] -> JS array
      options: [
        { label: 'Paneer Maggi Meal', price: 60, is_delta: true }
      ]
    }
  ]
}
```

Things worth noticing in that output:

- `items` and `options` are **nested arrays** - that's the join from section 3
- `badges` is a real **array**, because the column is `text[]`, not a comma string
- `price` is `null` on some dishes - that's what renders as "MRP"
- the admin read has extra fields (`active`, `sort_order` on items) that the public read never requests

To inspect anything else, drop `logData("label", whatever)` on the line after the query.

For a **client** component, plain `console.log` is right and it prints in devtools. If you ever log inside a server action, it prints in the terminal too - server actions are server code.

---

## 8. Finding things

| "Where is…" | Look in |
|---|---|
| the customer menu page | `app/page.js`, `app/t/[code]/page.js` |
| how a dish card looks | `components/menu/` |
| the admin shell + sidebar | `app/admin/(panel)/layout.js` |
| a database read | `lib/menu.js`, `lib/adminMenu.js` |
| a database write | `lib/actions/` |
| table + column definitions | `db/schema.sql` |
| the real menu data | `db/seed.sql` |
| who can read/write what | `db/schema.sql` (RLS), `db/admin-policies.sql` |
| every colour, border, radius | `app/globals.css` (`@theme` and `:root`) |
