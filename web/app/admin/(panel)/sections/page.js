import Link from "next/link";
import { getAdminSections } from "@/lib/adminMenu";
import AddSectionButton from "@/components/admin/sections/AddSectionButton";
import SectionCardActions from "@/components/admin/sections/SectionCardActions";

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

      <ul className="admin-grid">
        {sections.map((s) => (
          <li key={s.id} className={`sec-card ${s.active ? "" : "is-off"}`}>
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
          </li>
        ))}
      </ul>
    </>
  );
}
