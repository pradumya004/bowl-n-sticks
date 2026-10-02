// Menu opens per day across the window, drawn inside the hero panel.
//
// Every day in the range is present, zeroes included, so a dead week shows as a
// gap rather than being closed up. The point of a trend is the shape, and
// dropping empty days changes the shape.
export default function Trend({ points }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const first = points[0]?.d;
  const last = points.at(-1)?.d;

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "";

  return (
    <div className="trend">
      <div className="trend-bars">
        {points.map((p) => (
          <span key={p.d} className="trend-slot">
            <span className="trend-peek">
              {p.value} on {fmt(p.d)}
            </span>
            <span
              className="trend-fill"
              style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 8 : 2)}%` }}
            />
          </span>
        ))}
      </div>
      <div className="trend-axis">
        <span>{fmt(first)}</span>
        <span>{fmt(last)}</span>
      </div>
    </div>
  );
}
