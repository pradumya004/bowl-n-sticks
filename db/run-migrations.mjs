// Applies db/migrations/*.sql in filename order, exactly once each.
//
//   npm run migrate              apply everything pending
//   npm run migrate:status       show applied vs pending, change nothing
//   npm run migrate -- --baseline 002
//                                record 001 and 002 as applied WITHOUT running
//                                them (for migrations already run by hand)
//
// Each migration runs inside a transaction: if any statement fails the whole
// file rolls back, so a half-applied migration is not possible.
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { connect, scrub } from "./_connect.mjs";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "migrations");

async function migrationFiles() {
  const names = await readdir(DIR);
  return names.filter((n) => n.endsWith(".sql")).sort();
}

// Tracks what has run. Lives in the database, so it is the same truth for
// every machine and every person who ever works on this.
async function ensureTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function appliedSet(client) {
  const { rows } = await client.query("select filename from schema_migrations");
  return new Set(rows.map((r) => r.filename));
}

async function main() {
  const args = process.argv.slice(2);
  const statusOnly = args.includes("--status");
  const baselineIdx = args.indexOf("--baseline");
  const baseline = baselineIdx === -1 ? null : args[baselineIdx + 1];

  const client = await connect();
  try {
    await ensureTable(client);
    const files = await migrationFiles();
    const applied = await appliedSet(client);

    if (statusOnly) {
      for (const f of files) {
        console.log(`${applied.has(f) ? "applied" : "PENDING"}  ${f}`);
      }
      return;
    }

    if (baseline) {
      const upTo = files.filter((f) => f.split("-")[0] <= baseline);
      for (const f of upTo) {
        await client.query(
          "insert into schema_migrations (filename) values ($1) on conflict do nothing",
          [f],
        );
        console.log(`marked applied (not run)  ${f}`);
      }
      return;
    }

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log("nothing to apply, database is up to date");
      return;
    }

    for (const f of pending) {
      const sql = await readFile(join(DIR, f), "utf8");
      process.stdout.write(`applying ${f} ... `);
      try {
        await client.query("begin");
        await client.query(sql);
        await client.query(
          "insert into schema_migrations (filename) values ($1)",
          [f],
        );
        await client.query("commit");
        console.log("ok");
      } catch (err) {
        await client.query("rollback");
        console.log("FAILED (rolled back)");
        console.error(scrub(err.message));
        process.exitCode = 1;
        return;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(scrub(err.message));
  process.exit(1);
});
