import Marquee from "./Marquee";
import Hero from "./Hero";
import SectionMenu from "./SectionMenu";
import DishCard from "./DishCard";
import Footer from "./Footer";
import TrackMenuOpen from "./TrackMenuOpen";
import TrackDishViews from "./TrackDishViews";

// The whole menu page. Shared by "/" (no table) and "/t/[code]" (with a table).
export default function MenuView({ cafe, sections, tableLabel, tableCode }) {
  const visible = sections.filter((s) => s.items.length > 0);

  return (
    <>
      <TrackMenuOpen tableCode={tableCode} />
      <TrackDishViews />
      <Marquee />
      <div className="menu-wrap">
        <Hero cafe={cafe} tableLabel={tableLabel} />

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

      {/* outside .menu-wrap: it is position:fixed and must not inherit the
          column's padding or stacking */}
      <SectionMenu
        sections={visible.map((s) => ({
          id: s.id,
          name: s.name,
          count: s.items.length,
        }))}
      />
    </>
  );
}
