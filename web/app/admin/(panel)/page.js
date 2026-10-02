import Link from "next/link";
import { getAdminSections } from "@/lib/adminMenu";
import { getAnalytics } from "@/lib/adminAnalytics";
import BarList from "@/components/admin/stats/BarList";
import ColumnChart from "@/components/admin/stats/ColumnChart";
import Trend from "@/components/admin/stats/Trend";

const RANGES = [7, 30, 90];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 24 slots always, even the empty ones: a quiet afternoon is a finding, and
// dropping zero columns would silently rescale the day.
function hourSlots(byHour) {
  const found = new Map((byHour ?? []).map((h) => [h.hour, Number(h.views)]));
  return Array.from({ length: 24 }, (_, hour) => ({
    label: `${hour}:00`,
    short: hour % 6 === 0 ? `${hour}` : "",
    value: found.get(hour) ?? 0,
  }));
}

function daySlots(byDay) {
  const found = new Map((byDay ?? []).map((d) => [d.dow, Number(d.views)]));
  return DAYS.map((name, i) => ({
    label: name,
    short: name.slice(0, 1),
    value: found.get(i + 1) ?? 0, // isodow: Monday = 1
  }));
}

export default async function Dashboard({ searchParams }) {
  const params = await searchParams;
  const days = RANGES.includes(Number(params?.days)) ? Number(params.days) : 30;

  const [sections, stats] = await Promise.all([
    getAdminSections(),
    getAnalytics(days),
  ]);

  const itemCount = sections.reduce((total, s) => total + s.itemCount, 0);
  const hiddenCount = sections.filter((s) => !s.active).length;
  const opens = Number(stats?.menu_opens ?? 0);

  return (
    <>
      <div className="admin-secthead">
        <h2>Dashboard</h2>
        <nav className="range-switch">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?days=${r}`}
              className={r === days ? "is-on" : ""}
            >
              {r}d
            </Link>
          ))}
        </nav>
      </div>

      {/* The headline is a number, not a chart. One value over one window has
          no shape to plot. */}
      <section className="hero-stat">
        <div className="hero-stat-figure">
          <span className="hero-stat-num">{opens.toLocaleString("en-IN")}</span>
          <span className="hero-stat-label">
            menu {opens === 1 ? "open" : "opens"}
          </span>
          <span className="hero-stat-sub">
            last {days} days ·{" "}
            {Number(stats?.section_views ?? 0).toLocaleString("en-IN")} section
            views
          </span>
        </div>
        <Trend
          points={(stats?.by_date ?? []).map((p) => ({
            d: p.d,
            value: Number(p.views),
          }))}
        />
      </section>

      <div className="stat-grid">
        <BarList
          title="Scans per table"
          empty="No scans yet. Put the QR cards on the tables and this fills up."
          rows={(stats?.by_table ?? []).map((t) => ({
            label: t.table_code,
            value: Number(t.views),
          }))}
        />

        <BarList
          title="Most looked at"
          empty="Nobody has scrolled the menu yet."
          rows={(stats?.top_sections ?? []).map((s) => ({
            label: s.name,
            value: Number(s.views),
          }))}
        />

        <ColumnChart
          title="Busiest hours"
          empty="Not enough visits yet to see a pattern."
          slots={hourSlots(stats?.by_hour)}
        />

        <ColumnChart
          title="Busiest days"
          empty="Not enough visits yet to see a pattern."
          slots={daySlots(stats?.by_day)}
        />
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
