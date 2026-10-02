import BarRow from "./BarRow";

// A ranked list of bars. One series, so no legend: the heading names it.
export default function BarList({ title, rows, empty }) {
  const max = Math.max(0, ...rows.map((r) => r.value));
  // Only mark a winner when there IS one. Highlighting every row that ties the
  // maximum paints the whole chart ink and reads as a rendering fault.
  const clearWinner = rows.filter((r) => r.value === max).length === 1;
  return (
    <section className="stat-panel">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="stat-empty">{empty}</p>
      ) : (
        <ul className="bar-list">
          {rows.map((r) => (
            <BarRow
              key={r.label}
              label={r.label}
              value={r.value}
              max={max}
              highlight={clearWinner && r.value === max}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
