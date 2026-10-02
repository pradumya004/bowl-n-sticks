import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeeds } from "@/lib/adminMenu";

export default async function NeedsPage({ params }) {
  const { kind } = await params;
  const data = await getNeeds(kind);
  if (!data) notFound();

  return (
    <>
      <div className="admin-back">
        <Link href="/admin" className="btn btn--sm">
          ← Dashboard
        </Link>
        <h2 className="admin-sectiontitle">{data.title}</h2>
      </div>

      <p className="admin-sectionblurb">{data.note}</p>

      <div className="admin-secthead">
        <h2>
          Found{" "}
          <span className="pill pill--yellow pill--round">
            {data.rows.length}
          </span>
        </h2>
      </div>

      {data.rows.length === 0 ? (
        <p className="stat-empty">Nothing here. This one is already sorted.</p>
      ) : (
        <ul className="need-list">
          {data.rows.map((row) => (
            <li key={row.id}>
              {/* straight to the card itself, not just the section */}
              <Link href={row.href}>
                <span className="need-name">{row.name}</span>
                <span className="need-where">{row.where}</span>
                <span className="need-go">Fix →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
