import Link from "next/link";

// Things the owner can go and fix. A count with nowhere to click is just noise,
// so every row links to the screen where you'd actually do something about it.
export default function Attention({ rows }) {
  const open = rows.filter((r) => r.count > 0);

  return (
    <section className="stat-panel">
      <h3>Needs attention</h3>
      {open.length === 0 ? (
        <p className="stat-empty">
          Nothing to fix. Every dish has a photo and a price, and no sections are
          sitting empty.
        </p>
      ) : (
        <ul className="attn-list">
          {open.map((r) => (
            <li key={r.label}>
              <Link href={r.href}>
                <span className="attn-icon">{r.icon}</span>
                <span className="attn-count">{r.count}</span>
                <span className="attn-text">
                  <b>{r.label}</b>
                  <em>{r.note}</em>
                </span>
                <span className="attn-go">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
