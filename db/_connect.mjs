// Shared Postgres connection for the db/ tooling.
//
// The connection string lives in the SUPABASE_DB_URL environment variable, set
// outside this repo (see db/README.md). It is never read from a file here and
// never printed, so it cannot end up in a commit or in a terminal transcript.
import pg from "pg";

export function requireUrl() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error(
      "SUPABASE_DB_URL is not set.\n" +
        "Add it to ~/.bashrc (see db/README.md), then open a new terminal.",
    );
    process.exit(1);
  }
  return url;
}

export async function connect() {
  const client = new pg.Client({
    connectionString: requireUrl(),
    // Supabase terminates TLS at the pooler with its own CA, which Node does
    // not ship. The connection is still encrypted.
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

// Never let a connection string reach stdout, even inside an error message.
export function scrub(text) {
  return String(text).replace(/postgres(ql)?:\/\/[^\s'"]+/gi, "postgres://<redacted>");
}
