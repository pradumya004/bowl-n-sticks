import Image from "next/image";
import Marquee from "./Marquee";
import Hero from "./Hero";
import SectionMenu from "./SectionMenu";
import DishCard from "./DishCard";
import Footer from "./Footer";
import TrackMenuOpen from "./TrackMenuOpen";
import TrackDishViews from "./TrackDishViews";
import MenuFilter from "./MenuFilter";
import { mediaUrl } from "@/lib/storage";

// The whole menu page. Shared by "/" (no table) and "/t/[code]" (with a table).
export default function MenuView({ cafe, sections, tableLabel, tableCode }) {
  const visible = sections.filter((s) => s.items.length > 0);

  // Just enough for the filter to match on. Names and descriptions already
  // travel in the HTML, so this adds a few KB rather than a second copy of the
  // whole menu.
  const dishes = visible.flatMap((section) =>
    section.items.map((item) => ({
      id: item.id,
      text: `${item.name} ${item.description ?? ""}`.toLowerCase(),
      diet: item.diet_type,
      spicy: item.is_spicy,
    })),
  );

  return (
    <>
      <TrackMenuOpen tableCode={tableCode} />
      <TrackDishViews />
      <Marquee />
      <div className="menu-wrap">
        <Hero cafe={cafe} tableLabel={tableLabel} />
        <MenuFilter dishes={dishes} />

        {visible.map((section) => (
          <section key={section.id} className="sec" id={section.id}>
            {mediaUrl(section.image_path) && (
              <div className="sec-banner">
                <Image
                  src={mediaUrl(section.image_path)}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, 1320px"
                />
              </div>
            )}
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
