// One horizontal bar: a label, a proportional bar, and its value.
//
// The value is always visible rather than hover-only, so the chart doubles as
// its own table view and reads fine printed or with colour vision deficiency.
export default function BarRow({ label, value, max, highlight }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar-track">
        <span
          className={`bar-fill ${highlight ? "is-top" : ""}`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </span>
      <span className="bar-value">{value}</span>
    </li>
  );
}
