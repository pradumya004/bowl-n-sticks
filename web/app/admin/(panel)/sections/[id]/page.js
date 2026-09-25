import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSection } from "@/lib/adminMenu";
import AddItemButton from "@/components/admin/items/AddItemButton";
import ItemCardActions from "@/components/admin/items/ItemCardActions";
import SpicyMark from "@/components/ui/SpicyMark";

export default async function SectionItemsPage({ params }) {
  const { id } = await params;
  const section = await getAdminSection(id);
  if (!section) notFound();

  return (
    <>
      <div className="admin-back">
        <Link href="/admin/sections" className="btn btn--sm">
          ← Sections
        </Link>
        <h2 className="admin-sectiontitle">{section.name}</h2>
      </div>

      {section.blurb && <p className="admin-sectionblurb">{section.blurb}</p>}

      <div className="admin-secthead">
        <h2>
          Items{" "}
          <span className="pill pill--yellow pill--round">
            {section.items.length}
          </span>
        </h2>
        <AddItemButton sectionId={section.id} />
      </div>

      <ul className="admin-grid">
        {section.items.map((item) => (
          <li key={item.id} className={`sec-card ${item.active ? "" : "is-off"}`}>
            <div className="sec-card-top">
              <h3 className="item-name">
                <span className={`diet ${item.diet_type}`} aria-label={item.diet_type} />
                {item.name}
              </h3>
              <span className="pill pill--ink">
                {item.price != null ? `₹${item.price}` : "MRP"}
              </span>
            </div>

            {item.description && <p className="sec-card-blurb">{item.description}</p>}

            <div className="item-tags">
              {item.is_featured && <span className="pill pill--red">Featured</span>}
              {item.badges?.map((b) => (
                <span key={b} className="pill pill--yellow">{b}</span>
              ))}
              {item.protein_g && <span className="pill pill--yellow">{item.protein_g}g protein</span>}
              {item.is_spicy && <SpicyMark />}
              {!item.active && <span className="pill pill--ink">Hidden</span>}
            </div>

            <div className="sec-card-foot">
              <ItemCardActions item={item} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
