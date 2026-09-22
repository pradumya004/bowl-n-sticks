import { getMenu, getTable } from "@/lib/menu";
import MenuView from "@/app/components/MenuView";

export default async function TablePage({ params }) {
  // params is async and must be awaited before use. It comes from the dynamic route segment [code] in the file path.
  const { code } = await params;

  const [{ cafe, sections }, table] = await Promise.all([
    getMenu(),
    getTable(code.toUpperCase()), // so /t/t1 works the same as /t/T1
  ]);

  // If the code isn't a real table, the table is null and the hero just shows the generic line, menu still loads fine.
  return <MenuView cafe={cafe} sections={sections} tableLabel={table?.label} />;
}
