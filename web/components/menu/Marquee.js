// Scrolling ribbon at the very top. Doubled list so the loop is seamless.
const WORDS = ["Itadakimasu", "Slurp Loud", "Karwar's First Anime Cafe", "Made By Students"];

export default function Marquee() {
  const loop = [...WORDS, ...WORDS];
  return (
    <div className="ribbon" aria-hidden="true">
      <div className="track">
        {loop.map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
