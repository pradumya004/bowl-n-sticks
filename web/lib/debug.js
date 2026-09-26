// Print the shape of anything coming back from the database.
// Off unless DEBUG_DATA=1 is set in web/.env.local, so it never runs in production.
//
// WHERE IT PRINTS: this runs on the SERVER, so the output lands in the terminal
// where `npm run dev` is running - not in the browser console.
export function logData(label, value) {
  if (process.env.DEBUG_DATA !== "1") {
    return;
  }
  console.log(`\n───── ${label} ─────`);
  console.dir(value, { depth: null, colors: true });
  console.log("─".repeat(label.length + 12), "\n");
}
