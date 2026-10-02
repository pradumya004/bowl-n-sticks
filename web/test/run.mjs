// Runs the REAL lib/actions/options.js against a recording Supabase stub.
import { createOption, updateOption, deleteOption } from "@/lib/actions/options";
import { log, setScript } from "./stub-supabase.mjs";
import { calls as revalidateCalls } from "./stub-next-cache.mjs";

const ITEM = "de8896af-1ba4-40a4-a890-92a13c310487"; // real Maggi Meals id
const OPT = "11111111-2222-3333-4444-555555555555";

let pass = 0;
let fail = 0;
function check(name, cond, detail) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}`);
    if (detail !== undefined) console.log(`        got: ${JSON.stringify(detail)}`);
  }
}

function fd(obj) {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

// ── T1: add, delta ─────────────────────────────────────────────
setScript({
  "select:menu_item_option:single": { data: { sort_order: 3 }, error: null },
  "insert:menu_item_option": { data: null, error: null },
});
revalidateCalls.length = 0;
let r = await createOption(fd({ menu_item_id: ITEM, label: "Test Upgrade", price: "55", price_mode: "delta" }));
const ins = log.find((q) => q.op === "insert");
console.log("\nT1  add option (delta)");
check("returns nothing on success", r === undefined, r);
check("writes to menu_item_option", ins?.table === "menu_item_option", ins?.table);
check("label trimmed through", ins?.payload.label === "Test Upgrade", ins?.payload.label);
check("price is a NUMBER not a string", ins?.payload.price === 55, ins?.payload.price);
check("is_delta true", ins?.payload.is_delta === true, ins?.payload.is_delta);
check("menu_item_id attached", ins?.payload.menu_item_id === ITEM, ins?.payload.menu_item_id);
check("sort_order appends (3 -> 4)", ins?.payload.sort_order === 4, ins?.payload.sort_order);
check("refreshMenu called", revalidateCalls.length === 1 && revalidateCalls[0][0] === "/", revalidateCalls);

// ── T1b: first option on a dish with none ──────────────────────
setScript({
  "select:menu_item_option:single": { data: null, error: null },
  "insert:menu_item_option": { data: null, error: null },
});
await createOption(fd({ menu_item_id: ITEM, label: "First", price: "10", price_mode: "delta" }));
console.log("\nT1b first option on an empty dish");
check("sort_order starts at 1", log.find((q) => q.op === "insert")?.payload.sort_order === 1);

// ── T3: fixed price ────────────────────────────────────────────
setScript({
  "select:menu_item_option:single": { data: { sort_order: 1 }, error: null },
  "insert:menu_item_option": { data: null, error: null },
});
await createOption(fd({ menu_item_id: ITEM, label: "Test Fixed", price: "199", price_mode: "absolute" }));
console.log("\nT3  add option (fixed price)");
check("is_delta false", log.find((q) => q.op === "insert")?.payload.is_delta === false);

// ── T4/T5: update ──────────────────────────────────────────────
setScript({ "update:menu_item_option": { data: [{ id: OPT }], error: null } });
revalidateCalls.length = 0;
r = await updateOption(fd({ id: OPT, label: "Test Upgrade", price: "75", price_mode: "delta" }));
const upd = log.find((q) => q.op === "update");
console.log("\nT4/T5  edit an option");
check("returns nothing on success", r === undefined, r);
check("filters by id", upd?.filters.id === OPT, upd?.filters);
check("price updated to 75", upd?.payload.price === 75, upd?.payload.price);
check("selects id back (zero-row detection)", upd?.selected === "id", upd?.selected);
check("only label/price/is_delta sent", Object.keys(upd?.payload ?? {}).sort().join() === "is_delta,label,price", Object.keys(upd?.payload ?? {}));
check("refreshMenu called", revalidateCalls.length === 1);

// ── zero-row update (RLS silently filtered, the 204 case) ──────
setScript({ "update:menu_item_option": { data: [], error: null } });
revalidateCalls.length = 0;
r = await updateOption(fd({ id: OPT, label: "X", price: "5", price_mode: "delta" }));
console.log("\nZero-row update (the silent-204 case I hit over REST)");
check("reports the row is gone", typeof r === "string" && r.includes("no longer exists"), r);
check("does NOT refresh the menu", revalidateCalls.length === 0, revalidateCalls);

// ── RLS denial ─────────────────────────────────────────────────
setScript({ "update:menu_item_option": { data: null, error: { code: "42501", message: "rls" } } });
r = await updateOption(fd({ id: OPT, label: "X", price: "5", price_mode: "delta" }));
console.log("\nRLS denial (42501)");
check("says the session expired", typeof r === "string" && r.includes("session expired"), r);

// ── T6: validation ─────────────────────────────────────────────
console.log("\nT6  validation (nothing should reach the database)");
setScript({});
r = await createOption(fd({ menu_item_id: ITEM, label: "   ", price: "10", price_mode: "delta" }));
check("whitespace-only label rejected", r === "Label is required.", r);
check("no query was issued", log.length === 0, log.length);

setScript({});
r = await createOption(fd({ menu_item_id: ITEM, label: "Bad", price: "-5", price_mode: "delta" }));
check("negative price rejected", r === "Price must be a number, 0 or more.", r);
check("no query was issued", log.length === 0, log.length);

setScript({});
r = await createOption(fd({ menu_item_id: ITEM, label: "Bad", price: "abc", price_mode: "delta" }));
check("non-numeric price rejected (NaN guard)", r === "Price must be a number, 0 or more.", r);

setScript({});
r = await createOption(fd({ label: "No dish", price: "10", price_mode: "delta" }));
check("missing menu_item_id rejected", r === "Missing dish id.", r);

setScript({});
r = await updateOption(fd({ label: "No id", price: "10", price_mode: "delta" }));
check("update without id rejected", r === "Missing option id.", r);

setScript({});
r = await createOption(fd({ menu_item_id: ITEM, label: "Free", price: "", price_mode: "delta" }));
check("blank price defaults to 0, not rejected", r === undefined || r === undefined, r);
check("price sent as 0", log.find((q) => q.op === "insert")?.payload.price === 0, log.find((q) => q.op === "insert")?.payload.price);

// ── T9: delete ─────────────────────────────────────────────────
setScript({ "delete:menu_item_option": { data: [{ id: OPT }], error: null } });
revalidateCalls.length = 0;
r = await deleteOption(fd({ id: OPT }));
const del = log.find((q) => q.op === "delete");
console.log("\nT9  delete an option");
check("returns nothing on success", r === undefined, r);
check("filters by id", del?.filters.id === OPT, del?.filters);
check("refreshMenu called", revalidateCalls.length === 1);

setScript({ "delete:menu_item_option": { data: [], error: null } });
r = await deleteOption(fd({ id: OPT }));
check("already-deleted reported", typeof r === "string" && r.includes("already deleted"), r);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
