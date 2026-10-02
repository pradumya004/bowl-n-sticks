import Link from "next/link";

// A compact stat tile. Same card language as everything else on the page:
// ink border, hard shadow, lift on hover. The icon sits in a yellow chip so the
// row reads as a set rather than four loose boxes.
export default function Tile({ icon, value, label, note, href, external }) {
  const inner = (
    <>
      <span className="tile-icon">{icon}</span>
      <span className="tile-num">{value}</span>
      <span className="tile-label">{label}</span>
      <span className="tile-note">{note}</span>
    </>
  );

  if (!href) {
    return <div className="tile">{inner}</div>;
  }
  if (external) {
    return (
      <a className="tile tile--link" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className="tile tile--link" href={href}>
      {inner}
    </Link>
  );
}
