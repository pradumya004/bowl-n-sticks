import Link from "next/link";
import { getAdminSections } from "@/lib/adminMenu";
import { reorderSections } from "@/lib/actions/sections";
import AddSectionButton from "@/components/admin/sections/AddSectionButton";
import SectionCardActions from "@/components/admin/sections/SectionCardActions";
import SortableList from "@/components/admin/ui/SortableList";
import SortableItem from "@/components/admin/ui/SortableItem";

export default async function SectionsPage() {
  const sections = await getAdminSections();

  return (
    <>
      <div className="admin-secthead">
        <h2>
          Sections{" "}
          <span className="pill pill--yellow pill--round">{sections.length}</span>
        </h2>
        <AddSectionButton />
      </div>

      {sections.length > 1 && (
        <p className="admin-hint">
          Drag a card by its grip to change the order customers see.
        </p>
      )}

      <SortableList
        id="sections"
        ids={sections.map((s) => s.id)}
        action={reorderSections}
        className="admin-grid"
      >
        {sections.map((s) => (
          <SortableItem
            key={s.id}
            id={s.id}
            className={`sec-card ${s.active ? "" : "is-off"}`}
          >
            <div className="sec-card-top">
              <h3>
                <Link href={`/admin/sections/${s.slug}`} className="sec-link">
                  {s.name}
                </Link>
              </h3>
              <span className="pill pill--yellow pill--round">
                {s.itemCount}
              </span>
            </div>

            {s.blurb && <p className="sec-card-blurb">{s.blurb}</p>}

            <div className="sec-card-foot">
              {!s.active && <span className="pill pill--ink">Hidden</span>}
              <SectionCardActions section={s} />
            </div>
          </SortableItem>
        ))}
      </SortableList>
    </>
  );
}
