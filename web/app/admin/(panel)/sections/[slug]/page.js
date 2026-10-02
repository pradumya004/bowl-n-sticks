import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSection } from "@/lib/adminMenu";
import { reorderItems } from "@/lib/actions/items";
import { setItemImage, removeItemImage } from "@/lib/actions/media";
import AddItemButton from "@/components/admin/items/AddItemButton";
import ItemCardActions from "@/components/admin/items/ItemCardActions";
import OptionsButton from "@/components/admin/options/OptionsButton";
import PhotoButton from "@/components/admin/media/PhotoButton";
import SortableList from "@/components/admin/ui/SortableList";
import SortableItem from "@/components/admin/ui/SortableItem";
import SpicyMark from "@/components/ui/SpicyMark";

export default async function SectionItemsPage({ params }) {
  const { slug } = await params;
  const section = await getAdminSection(slug);
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

      {section.items.length > 1 && (
        <p className="admin-hint">
          Drag a card by its grip to change the order customers see.
        </p>
      )}

      <SortableList
        id="items"
        ids={section.items.map((i) => i.id)}
        action={reorderItems}
        className="admin-grid"
      >
        {section.items.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            className={`sec-card ${item.active ? "" : "is-off"}`}
          >
            <div className="sec-card-top">
              <h3 className="item-name">
                <span
                  className={`diet ${item.diet_type}`}
                  aria-label={item.diet_type}
                />
                {item.name}
              </h3>
              <span className="pill pill--ink">
                {item.price != null ? `₹${item.price}` : "MRP"}
              </span>
            </div>

            {item.description && (
              <p className="sec-card-blurb">{item.description}</p>
            )}

            <div className="item-tags">
              {item.is_featured && (
                <span className="pill pill--red">Featured</span>
              )}
              {item.badges?.map((b) => (
                <span key={b} className="pill pill--yellow">
                  {b}
                </span>
              ))}
              {item.protein_g != null && (
                <span className="pill pill--yellow">
                  {item.protein_g}g protein
                </span>
              )}
              {item.is_spicy && <SpicyMark />}
              {!item.active && <span className="pill pill--ink">Hidden</span>}
            </div>

            <div className="sec-card-foot">
              <PhotoButton
                id={item.id}
                name={item.name}
                folder="items"
                imagePath={item.image_path}
                onSave={setItemImage}
                onRemove={removeItemImage}
              />
              <OptionsButton item={item} />
              <ItemCardActions item={item} />
            </div>
          </SortableItem>
        ))}
      </SortableList>
    </>
  );
}
