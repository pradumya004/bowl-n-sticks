import Link from "next/link";
import { getAdminSections, getMenuHealth } from "@/lib/adminMenu";
import { getAnalytics } from "@/lib/adminAnalytics";
import Trend from "@/components/admin/stats/Trend";
import Tile from "@/components/admin/stats/TileRow";
import Attention from "@/components/admin/stats/Attention";
import BarList from "@/components/admin/stats/BarList";
import {
  LayersIcon,
  ListIcon,
  EyeOffIcon,
  ExternalIcon,
  CameraIcon,
  TagIcon,
  AlertIcon,
} from "@/components/ui/icons";

// The dashboard is the overview. The charts live on /admin/analytics.
const DAYS = 30;

export default async function Dashboard() {
  const [sections, stats, health] = await Promise.all([
    getAdminSections(),
    getAnalytics(DAYS),
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
        <Link href="/admin/analytics" className="btn btn--sm">
          Full analytics →
        </Link>
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
            last {DAYS} days ·{" "}
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
          title="Top dishes"
          empty="No dish views yet. This fills as people scroll the menu."
          rows={(stats?.top_dishes ?? []).map((d) => ({
            label: d.name,
            value: Number(d.views),
          }))}
        />
      </div>

      <Attention
        rows={[
          {
            label: "dishes have no photo",
            note: "Photos are the single biggest thing that makes a menu look finished",
            count: health.noPhoto,
            href: "/admin/needs/no-photo",
            icon: <CameraIcon />,
          },
          {
            label: "dishes have no price",
            note: 'These show as "MRP" on the menu',
            count: health.noPrice,
            href: "/admin/needs/no-price",
            icon: <TagIcon />,
          },
          {
            label: "dishes are hidden",
            note: "Customers cannot see these right now",
            count: health.hiddenItems,
            href: "/admin/needs/hidden-dishes",
            icon: <EyeOffIcon />,
          },
          {
            label: "sections are hidden",
            note: "Hidden sections and everything in them stay off the menu",
            count: hiddenCount,
            href: "/admin/needs/hidden-sections",
            icon: <EyeOffIcon />,
          },
          {
            label: "sections have no dishes",
            note: "Empty sections never appear on the customer menu",
            count: emptyCount,
            href: "/admin/needs/empty-sections",
            icon: <AlertIcon />,
          },
        ]}
      />
    </>
  );
}
