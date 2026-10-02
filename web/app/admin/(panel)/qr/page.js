import { headers } from "next/headers";
import { getTableQrs } from "@/lib/adminTables";

export default async function QrPage() {
  // Built from the host the admin is actually on, so the printed code points at
  // the real site rather than a value hard-coded at build time.
  const h = await headers();
  const host = h.get("host");
  const proto = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${proto}://${host}`;

  const tables = await getTableQrs(baseUrl);
  const isLocal = host?.startsWith("localhost");

  return (
    <div className="qr-page">
      <div className="admin-secthead">
        <h2>
          QR codes{" "}
          <span className="pill pill--yellow pill--round">{tables.length}</span>
        </h2>
      </div>

      <p className="admin-sectionblurb">
        One per table, generated from <code>{baseUrl}</code>. Print these and put
        them on the tables. Scanning one opens the menu and records which table
        it came from.
      </p>

      {isLocal && (
        <p className="admin-error">
          These point at localhost and will not work on a phone. Open this page
          on the live site before printing.
        </p>
      )}

      <ul className="qr-grid">
        {tables.map((table) => (
          <li key={table.id} className={`qr-card ${table.active ? "" : "is-off"}`}>
            <div
              className="qr-art"
              // qrcode returns an SVG string; there is no user input in it
              dangerouslySetInnerHTML={{ __html: table.svg }}
            />
            <span className="qr-code">{table.code}</span>
            {table.label && <span className="qr-label">{table.label}</span>}
            <span className="qr-url">{table.url}</span>
            {!table.active && <span className="pill pill--ink">Inactive</span>}
          </li>
        ))}
      </ul>

      <p className="admin-sectionblurb">
        Printing: use your browser&apos;s print dialog on this page. The codes are
        SVG, so they stay sharp at any size.
      </p>
    </div>
  );
}
