import { getMenu } from "@/lib/menu";
import MenuView from "./components/MenuView";

export default async function Home() {
  const { cafe, sections } = await getMenu();
  return <MenuView cafe={cafe} sections={sections} />;
}
