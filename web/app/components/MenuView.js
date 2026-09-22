import Marquee from "./Marquee";
import Hero from "./Hero";
import SectionNav from "./SectionNav";
import DishCard from "./DishCard";
import Footer from "./Footer";

// The whole menu page. Shared by "/" (no table) and "/t/[code]" (with a table).
export default function MenuView({ cafe, sections, tableLabel }) {
  const visible = sections.filter((s) => s.items.length > 0);

  return (
    <>
      <Marquee />
      <div className="menu-wrap">
        <Hero cafe={cafe} tableLabel={tableLabel} />
        <SectionNav
          sections={visible.map((s) => ({ id: s.id, name: s.name }))}
        />

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

        <Footer />
      </div>
    </>
  );
}
