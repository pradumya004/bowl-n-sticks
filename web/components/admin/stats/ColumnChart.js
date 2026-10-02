// Vertical bars across a fixed span (24 hours, or 7 days). Every slot is drawn
// even when it is zero, because the gaps are the point: an empty afternoon is
// information, and dropping those columns would quietly rescale the day.
export default function ColumnChart({ title, slots, empty }) {
  const max = Math.max(0, ...slots.map((s) => s.value));
  const total = slots.reduce((sum, s) => sum + s.value, 0);
  // Same rule as BarList: no winner highlight unless the peak is unique.
  const clearPeak = slots.filter((s) => s.value === max).length === 1;

  return (
    <section className="stat-panel">
      <h3>{title}</h3>
      {total === 0 ? (
        <p className="stat-empty">{empty}</p>
      ) : (
        <div className="col-chart">
          {slots.map((s) => {
            const pct = max > 0 ? (s.value / max) * 100 : 0;
            return (
              <div key={s.label} className="col-slot">
                {/* the count rides above the bar on hover, so there is no
                    browser-native tooltip anywhere in this admin */}
                <span className="col-peek">{s.value}</span>
                <span className="col-track">
                  <span
                    className={`col-fill ${clearPeak && s.value === max ? "is-top" : ""}`}
                    style={{ height: `${Math.max(pct, s.value > 0 ? 6 : 0)}%` }}
                  />
                </span>
                <span className="col-label">{s.short}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
