// Tests for reorderSections / reorderItems (migration 002 RPCs).
import { reorderSections } from "@/lib/actions/sections";
import { reorderItems } from "@/lib/actions/items";
import { log, setScript } from "./stub-supabase.mjs";
import { calls as revalidateCalls } from "./stub-next-cache.mjs";

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); if (detail !== undefined) console.log(`        got: ${JSON.stringify(detail)}`); }
}

const IDS = ["a", "b", "c"];

console.log("\nreorderSections: happy path");
setScript({ "rpc:reorder_menu_sections": { data: 3, error: null } });
revalidateCalls.length = 0;
let r = await reorderSections(IDS);
let call = log.find((q) => q.op === "rpc");
check("returns nothing on success", r === undefined, r);
check("calls the right function", call?.name === "reorder_menu_sections", call?.name);
check("passes ids in order", JSON.stringify(call?.args) === '{"ids":["a","b","c"]}', call?.args);
check("refreshMenu called", revalidateCalls.length === 1 && revalidateCalls[0][0] === "/");

console.log("\nreorderSections: stale list (fewer rows moved than sent)");
setScript({ "rpc:reorder_menu_sections": { data: 2, error: null } });
revalidateCalls.length = 0;
r = await reorderSections(IDS);
check("reports the list is stale", typeof r === "string" && r.includes("changed while you were dragging"), r);
check("does NOT refresh the menu", revalidateCalls.length === 0, revalidateCalls);

console.log("\nreorderSections: permission denied");
setScript({ "rpc:reorder_menu_sections": { data: null, error: { code: "42501", message: "permission denied for function" } } });
r = await reorderSections(IDS);
check("maps 42501 to session expired", typeof r === "string" && r.includes("session expired"), r);

console.log("\nreorderSections: guards");
setScript({});
check("empty array rejected", (await reorderSections([])) === "Nothing to reorder.");
check("no call issued", log.length === 0, log.length);
setScript({});
check("non-array rejected", (await reorderSections(undefined)) === "Nothing to reorder.");
setScript({});
check("string rejected", (await reorderSections("a,b,c")) === "Nothing to reorder.");

console.log("\nreorderItems");
setScript({ "rpc:reorder_menu_items": { data: 3, error: null } });
revalidateCalls.length = 0;
r = await reorderItems(IDS);
call = log.find((q) => q.op === "rpc");
check("returns nothing on success", r === undefined, r);
check("calls the right function", call?.name === "reorder_menu_items", call?.name);
check("passes ids in order", JSON.stringify(call?.args) === '{"ids":["a","b","c"]}', call?.args);
check("refreshMenu called", revalidateCalls.length === 1);

setScript({ "rpc:reorder_menu_items": { data: 0, error: null } });
check("zero rows moved reported", typeof (await reorderItems(IDS)) === "string");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
