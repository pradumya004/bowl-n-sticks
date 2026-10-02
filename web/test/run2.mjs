// Regression check on items.js + sections.js after the error-handling rewrite.
import { createItem, updateItem, toggleItem, deleteItem } from "@/lib/actions/items";
import { createSection, updateSection, toggleSection, deleteSection } from "@/lib/actions/sections";
import { log, setScript } from "./stub-supabase.mjs";
import { calls as revalidateCalls } from "./stub-next-cache.mjs";

const SEC = "sec-1111";
const ITEM = "item-2222";
const CAFE = "cafe-3333";

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}`); if (detail !== undefined) console.log(`        got: ${JSON.stringify(detail)}`); }
}
function fd(obj) {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}
const cafeOk = { "select:cafe:single": { data: { id: CAFE }, error: null } };

// ── items: create ──────────────────────────────────────────────
console.log("\nitems: createItem");
setScript({ ...cafeOk, "select:menu_item:single": { data: { sort_order: 5 }, error: null }, "insert:menu_item": { data: null, error: null } });
revalidateCalls.length = 0;
let r = await createItem(fd({ menu_section_id: SEC, name: "Test Ramen", price: "199", diet_type: "egg", is_spicy: "on", protein_g: "20", badges: "Must Try, New", is_featured: "on" }));
let ins = log.find((q) => q.op === "insert");
check("returns nothing on success", r === undefined, r);
check("price -> number", ins?.payload.price === 199, ins?.payload.price);
check("protein -> number", ins?.payload.protein_g === 20, ins?.payload.protein_g);
check("badges -> trimmed array", JSON.stringify(ins?.payload.badges) === '["Must Try","New"]', ins?.payload.badges);
check("checkbox 'on' -> true", ins?.payload.is_spicy === true && ins?.payload.is_featured === true);
check("sort_order appends", ins?.payload.sort_order === 6, ins?.payload.sort_order);
check("refreshMenu called", revalidateCalls.length === 1);

console.log("\nitems: blank price means MRP, not zero");
setScript({ "select:menu_item:single": { data: null, error: null }, "insert:menu_item": { data: null, error: null } });
await createItem(fd({ menu_section_id: SEC, name: "No Price", price: "", diet_type: "veg", badges: "" }));
ins = log.find((q) => q.op === "insert");
check("price is null", ins?.payload.price === null, ins?.payload.price);
check("badges is []", JSON.stringify(ins?.payload.badges) === "[]", ins?.payload.badges);
check("unchecked boxes -> false", ins?.payload.is_spicy === false && ins?.payload.is_featured === false);

console.log("\nitems: validation");
setScript({});
check("blank name rejected", (await createItem(fd({ menu_section_id: SEC, name: "  ", badges: "" }))) === "Name is required.");
check("no query issued", log.length === 0, log.length);
setScript({});
check("junk price rejected", (await createItem(fd({ menu_section_id: SEC, name: "X", price: "abc", badges: "" }))) === "Price must be a number (or leave it blank for MRP).");
setScript({});
check("negative protein rejected", (await createItem(fd({ menu_section_id: SEC, name: "X", protein_g: "-2", badges: "" }))) === "Protein must be a number (or leave it blank).");
setScript({});
check("missing section id rejected", (await createItem(fd({ name: "X", badges: "" }))) === "Missing section id.");

console.log("\nitems: update / toggle / delete");
setScript({ "update:menu_item": { data: [{ id: ITEM }], error: null } });
revalidateCalls.length = 0;
r = await updateItem(fd({ id: ITEM, name: "Test Ramen", price: "250", diet_type: "egg", badges: "" }));
let upd = log.find((q) => q.op === "update");
check("update returns nothing", r === undefined, r);
check("selects id back", upd?.selected === "id", upd?.selected);
check("refreshMenu called", revalidateCalls.length === 1);

setScript({ "update:menu_item": { data: [], error: null } });
revalidateCalls.length = 0;
r = await updateItem(fd({ id: ITEM, name: "X", badges: "" }));
check("zero-row update reported", typeof r === "string" && r.includes("no longer exists"), r);
check("no refresh on failure", revalidateCalls.length === 0);

setScript({ "update:menu_item": { data: [{ id: ITEM }], error: null } });
await toggleItem(fd({ id: ITEM, active: "true" }));
check("toggle flips true -> false", log.find((q) => q.op === "update")?.payload.active === false);
setScript({ "update:menu_item": { data: [{ id: ITEM }], error: null } });
await toggleItem(fd({ id: ITEM, active: "false" }));
check("toggle flips false -> true", log.find((q) => q.op === "update")?.payload.active === true);

setScript({ "delete:menu_item": { data: [], error: null } });
check("already-deleted item reported", (await deleteItem(fd({ id: ITEM }))) === "That dish was already deleted.");

// ── sections ───────────────────────────────────────────────────
console.log("\nsections");
setScript({ ...cafeOk, "select:menu_section:single": { data: { sort_order: 23 }, error: null }, "insert:menu_section": { data: null, error: null } });
revalidateCalls.length = 0;
r = await createSection(fd({ name: "Test Section", blurb: "hello" }));
ins = log.find((q) => q.op === "insert");
check("create returns nothing", r === undefined, r);
check("cafe_id attached", ins?.payload.cafe_id === CAFE, ins?.payload.cafe_id);
check("sort_order appends", ins?.payload.sort_order === 24, ins?.payload.sort_order);
check("no slug written (generated column)", !("slug" in (ins?.payload ?? {})), Object.keys(ins?.payload ?? {}));
check("refreshMenu called", revalidateCalls.length === 1);

setScript({ ...cafeOk, "select:menu_section:single": { data: null, error: null }, "insert:menu_section": { data: null, error: null } });
await createSection(fd({ name: "Blank blurb", blurb: "   " }));
check("whitespace blurb -> null", log.find((q) => q.op === "insert")?.payload.blurb === null);

setScript({ "select:cafe:single": { data: null, error: null } });
check("missing cafe reported", (await createSection(fd({ name: "X" }))) === "Cafe not found in the database.");

setScript({ ...cafeOk });
check("blank section name rejected", (await createSection(fd({ name: " " }))) === "Name is required.");

setScript({ "update:menu_section": { data: [], error: null } });
check("zero-row section update reported", (await updateSection(fd({ id: SEC, name: "X" }))) === "That section no longer exists. Refresh the page.");

setScript({ "update:menu_section": { data: null, error: { code: "42501", message: "rls" } } });
r = await toggleSection(fd({ id: SEC, active: "true" }));
check("RLS denial -> session expired", typeof r === "string" && r.includes("session expired"), r);

setScript({ "delete:menu_section": { data: [{ id: SEC }], error: null } });
revalidateCalls.length = 0;
check("delete returns nothing", (await deleteSection(fd({ id: SEC }))) === undefined);
check("refreshMenu called", revalidateCalls.length === 1);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
