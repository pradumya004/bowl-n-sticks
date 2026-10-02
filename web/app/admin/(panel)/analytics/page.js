import Link from "next/link";
import { getAnalytics } from "@/lib/adminAnalytics";
import BarList from "@/components/admin/stats/BarList";
import ColumnChart from "@/components/admin/stats/ColumnChart";
import Trend from "@/components/admin/stats/Trend";

const RANGES = [7, 30, 90];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Every hour is drawn, even the empty ones: a dead afternoon is a finding, and
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

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const days = RANGES.includes(Number(params?.days)) ? Number(params.days) : 30;
  const stats = await getAnalytics(days);
  const opens = Number(stats?.menu_opens ?? 0);

  return (
    <>
      <div className="admin-secthead">
        <h2>Analytics</h2>
        <nav className="range-switch">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              className={r === days ? "is-on" : ""}
            >
              {r}d
            </Link>
          ))}
        </nav>
      </div>

      <section className="hero-stat">
        <div className="hero-stat-figure">
          <span className="hero-stat-num">{opens.toLocaleString("en-IN")}</span>
          <span className="hero-stat-label">
            menu {opens === 1 ? "open" : "opens"}
          </span>
          <span className="hero-stat-sub">
            last {days} days ·{" "}
            {Number(stats?.item_views ?? 0).toLocaleString("en-IN")} dish views
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
          title="Top dishes"
          empty="No dish views yet. This fills as people scroll the menu."
          rows={(stats?.top_dishes ?? []).map((d) => ({
            label: d.name,
            value: Number(d.views),
          }))}
        />
        <BarList
          title="Most looked at sections"
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
    </>
  );
}
