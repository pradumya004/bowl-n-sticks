import Link from "next/link";
import { getAdminSections, getMenuHealth } from "@/lib/adminMenu";
import { getAnalytics } from "@/lib/adminAnalytics";
import BarList from "@/components/admin/stats/BarList";
import ColumnChart from "@/components/admin/stats/ColumnChart";
import Trend from "@/components/admin/stats/Trend";
import Tile from "@/components/admin/stats/TileRow";
import Attention from "@/components/admin/stats/Attention";
import {
  LayersIcon,
  ListIcon,
  EyeOffIcon,
  ExternalIcon,
  CameraIcon,
  TagIcon,
  AlertIcon,
} from "@/components/ui/icons";

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

  const [sections, stats, health] = await Promise.all([
    getAdminSections(),
    getAnalytics(days),
    getMenuHealth(),
  ]);

  const itemCount = sections.reduce((total, s) => total + s.itemCount, 0);
  const hiddenCount = sections.filter((s) => !s.active).length;
  const emptyCount = sections.filter((s) => s.itemCount === 0).length;
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

      <div className="tile-row">
        <Tile
          icon={<LayersIcon />}
          value={sections.length}
          label="Sections"
          note="Manage the menu"
          href="/admin/sections"
        />
        <Tile
          icon={<ListIcon />}
          value={itemCount}
          label="Dishes"
          note="Across every section"
          href="/admin/sections"
        />
        <Tile
          icon={<EyeOffIcon />}
          value={hiddenCount + health.hiddenItems}
          label="Hidden"
          note="Sections and dishes off the menu"
          href="/admin/sections"
        />
        <Tile
          icon={<ExternalIcon />}
          value="Open"
          label="Live menu"
          note="See what customers see"
          href="/"
          external
        />
      </div>

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

      <Attention
        rows={[
          {
            label: "dishes have no photo",
            note: "Photos are the single biggest thing that makes a menu look finished",
            count: health.noPhoto,
            href: "/admin/sections",
            icon: <CameraIcon />,
          },
          {
            label: "dishes have no price",
            note: 'These show as "MRP" on the menu',
            count: health.noPrice,
            href: "/admin/sections",
            icon: <TagIcon />,
          },
          {
            label: "dishes are hidden",
            note: "Customers cannot see these right now",
            count: health.hiddenItems,
            href: "/admin/sections",
            icon: <EyeOffIcon />,
          },
          {
            label: "sections are hidden",
            note: "Hidden sections and everything in them stay off the menu",
            count: hiddenCount,
            href: "/admin/sections",
            icon: <EyeOffIcon />,
          },
          {
            label: "sections have no dishes",
            note: "Empty sections never appear on the customer menu",
            count: emptyCount,
            href: "/admin/sections",
            icon: <AlertIcon />,
          },
        ]}
      />
    </>
  );
}
