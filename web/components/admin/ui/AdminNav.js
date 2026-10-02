"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  BowlIcon,
  CameraIcon,
  SmileIcon,
  QrIcon,
  ChartIcon,
  GearIcon,
} from "@/components/ui/icons";

// The whole admin map, including areas not built yet (they render as "Soon" and
// aren't clickable). As each phase lands, delete its `soon` and add the `href`.
const GROUPS = [
  {
    label: "Menu",
    links: [
      { href: "/admin", label: "Dashboard", icon: <GridIcon /> },
      { href: "/admin/sections", label: "Sections", icon: <BowlIcon /> },
    ],
  },
  {
    label: "Content",
    links: [
      // Photos exist now, so this points at the dishes still missing one -
      // which is the only reason you'd open a photos screen.
      { href: "/admin/needs/no-photo", label: "Photos", icon: <CameraIcon /> },
      { label: "Meme Feed", icon: <SmileIcon />, soon: true },
    ],
  },
  {
    label: "Tables",
    links: [{ label: "QR Codes", icon: <QrIcon />, soon: true }],
  },
  {
    label: "Insights",
    links: [
      { href: "/admin/analytics", label: "Analytics", icon: <ChartIcon /> },
    ],
  },
  {
    label: "Settings",
    links: [{ href: "/admin/settings", label: "Cafe Settings", icon: <GearIcon /> }],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-side">
      {GROUPS.map((group) => (
        <div key={group.label} className="nav-group">
          <span className="nav-group-label">{group.label}</span>

          {group.links.map((link) => {
            if (link.soon) {
              return (
                <span key={link.label} className="nav-item is-soon">
                  <span className="nav-ico" aria-hidden="true">
                    {link.icon}
                  </span>
                  <span className="nav-text">{link.label}</span>
                  <span className="pill pill--yellow nav-soon">Soon</span>
                </span>
              );
            }

            // "/admin" matches exactly; everything else matches its whole
            // subtree so /admin/sections/<id> still highlights Sections.
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`nav-item ${active ? "is-on" : ""}`}
              >
                <span className="nav-ico" aria-hidden="true">
                    {link.icon}
                  </span>
                <span className="nav-text">{link.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
