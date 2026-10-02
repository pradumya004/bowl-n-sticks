# Database

The app is in `web/`. This folder holds the schema, the seed data, and the tooling that applies them.

## Files

| File | What it is |
|---|---|
| `schema.sql` | The blueprint. Run only on an **empty** project. Already includes everything the migrations added. |
| `seed.sql` | The real menu. Re-runnable: deletes this cafe first, then re-inserts. |
| `admin-policies.sql` | Write access for logged-in admins. |
| `migrations/NNN-*.sql` | Changes to a database that **already has data**. Run in order, once each. |

Every file carries its Supabase SQL Editor name and description in its header.

## Why both `schema.sql` and `migrations/`

`schema.sql` says `create table if not exists`, so on a database where the table
already exists Postgres **skips the whole statement**, new columns included. It
can never alter a live database. That is what migrations are for.

Rule: a migration must also be mirrored into `schema.sql`, so a rebuild from
scratch produces the same database as one that was migrated.

## Setup (once per machine)

1. Supabase dashboard → **Connect** → **Session pooler** → copy the URI.
   Use the *session* pooler (port 5432), not the transaction pooler: the
   transaction pooler does not support everything DDL needs.
2. Replace `[YOUR-PASSWORD]` with the database password
   (Project Settings → Database → Database password → reset if unknown).
3. Put it in your shell profile, **not in this repo**. In Git Bash:

   ```bash
   echo "export SUPABASE_DB_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres'" >> ~/.bashrc
   ```

   `~/.bashrc` is outside the repo, so it cannot be committed by accident.
4. Open a new terminal, then `npm install` in the repo root.

Non-interactive shells (including the one Claude Code runs commands in) do not
read `~/.bashrc`. Prefix with `. ~/.bashrc` when a command needs the variable:

```bash
. ~/.bashrc >/dev/null 2>&1; npm run migrate:status
```

This password allows full read, write and DDL on **this database only**. It
cannot reach other Supabase projects or the account itself. If it ever leaks,
reset it in the dashboard and update `~/.bashrc`.

## Commands (from the repo root)

```bash
npm run migrate:status                 # what is applied, what is pending
npm run migrate                        # apply everything pending
npm run migrate -- --baseline 002      # record up to 002 as applied, without running
npm run sql -- "select count(*) from menu_item"
```

Each migration runs inside a transaction, so a failure rolls back the whole file
rather than leaving it half applied. What has run is recorded in a
`schema_migrations` table in the database, which means the answer is the same on
every machine instead of living in somebody's memory.
