import { getMenu } from "@/lib/menu";
import Marquee from "./components/Marquee";
import Hero from "./components/Hero";
import SectionNav from "./components/SectionNav";
import DishCard from "./components/DishCard";
import Footer from "./components/Footer";

export default async function Home() {
  const { cafe, sections } = await getMenu();
  const visible = sections.filter((s) => s.items.length > 0);

  return (
    <>
      <Marquee />
      <div className="menu-wrap">
        <Hero cafe={cafe} />
        <SectionNav sections={visible.map((s) => ({ id: s.id, name: s.name }))} />

        {visible.map((section) => (
          <section key={section.id} className="sec" id={section.id}>
            <h2>{section.name}</h2>
            {section.blurb && <p className="blurb">{section.blurb}</p>}
            <div className="items">
              {section.items.map((item) => (
                <DishCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        <Footer cafe={cafe} />
      </div>
    </>
  );
}
