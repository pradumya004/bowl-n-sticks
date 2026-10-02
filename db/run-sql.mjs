// Runs one ad-hoc query, for inspecting state. Read-only by habit, not by force.
//
//   npm run sql -- "select name, slug from menu_section order by sort_order"
import { connect, scrub } from "./_connect.mjs";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('usage: npm run sql -- "select ..."');
  process.exit(1);
}

const client = await connect();
try {
  const result = await client.query(query);
  if (result.rows?.length) {
    console.table(result.rows);
    console.log(`${result.rowCount} row(s)`);
  } else {
    console.log(`${result.command} ok, ${result.rowCount ?? 0} row(s)`);
  }
} catch (err) {
  console.error(scrub(err.message));
  process.exitCode = 1;
} finally {
  await client.end();
}
