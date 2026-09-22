// Top-of-page hero. Brand name comes from the DB (cafe.name), never hardcoded,
// so a rename is a data change. The last word gets the stroked "pop" treatment.
export default function Hero({ cafe }) {
  const words = (cafe?.name ?? "").trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words.at(-1);

  return (
    <header className="hero">
      <span className="star a">✦</span>
      <span className="star b">✧</span>
      <div className="kicker">Karwar&apos;s first anime cafe</div>
      <h1>
        {lead} <span className="out">{last}</span>
      </h1>
      {cafe?.tagline && <p>{cafe.tagline}</p>}
      <div className="tablechip">
        <span className="pin" /> A waiter will take your order
      </div>
    </header>
  );
}
