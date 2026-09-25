import Link from "next/link";
import { getAdminSections } from "@/lib/adminMenu";

// The dashboard. Lives at /admin. Analytics land here in Phase 6; for now it
// shows the menu at a glance and routes into the management screens.
export default async function Dashboard() {
  const sections = await getAdminSections();
  const itemCount = sections.reduce((total, s) => total + s.itemCount, 0);
  const hiddenCount = sections.filter((s) => !s.active).length;

  return (
    <>
      <div className="admin-secthead">
        <h2>Dashboard</h2>
      </div>

      <div className="admin-grid">
        <Link href="/admin/sections" className="sec-card stat-card">
          <span className="stat-num">{sections.length}</span>
          <span className="stat-label">Sections</span>
          <span className="stat-go">Manage →</span>
        </Link>

        <Link href="/admin/sections" className="sec-card stat-card">
          <span className="stat-num">{itemCount}</span>
          <span className="stat-label">Dishes</span>
          <span className="stat-go">Manage →</span>
        </Link>

        <div className="sec-card stat-card">
          <span className="stat-num">{hiddenCount}</span>
          <span className="stat-label">Hidden sections</span>
          <span className="stat-go">Not shown to customers</span>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="sec-card stat-card"
        >
          <span className="stat-num">👀</span>
          <span className="stat-label">View live menu</span>
          <span className="stat-go">Opens in a new tab →</span>
        </a>
      </div>
    </>
  );
}
