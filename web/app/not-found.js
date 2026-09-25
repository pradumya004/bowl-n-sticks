import Link from "next/link";
import Marquee from "@/components/menu/Marquee";

const LINES = [
  "This dish is off the menu.",
  "Chef says: no such page.",
  "Itadaki-oops.",
  "We checked every bowl. Nothing.",
  "404 noodles not found.",
];

export default function NotFound() {
  return (
    <>
      <Marquee />
      <main className="oops">
        <div aria-hidden="true">
          <span className="oops-sticker s1">🍜</span>
          <span className="oops-sticker s2">✦</span>
          <span className="oops-sticker s3">🥢</span>
          <span className="oops-sticker s4">🍥</span>
          <span className="oops-sticker s5">✧</span>
          <span className="oops-sticker s6">🍙</span>
        </div>

        <span className="pill pill--yellow pill--tilt">🍜 Lost?</span>

        <h1 className="oops-code">
          <span className="out">404</span>
        </h1>

        {/* the joke: a kitchen docket for the page you wanted, stamped NOT FOUND */}
        <div className="oops-slip">
          <div className="oops-slip-head">
            <span>Order slip</span>
            <span>#404</span>
          </div>
          <dl className="oops-slip-rows">
            <div>
              <dt>Table</dt>
              <dd>??</dd>
            </div>
            <div>
              <dt>Item</dt>
              <dd>The page you wanted</dd>
            </div>
            <div>
              <dt>Qty</dt>
              <dd>0</dd>
            </div>
          </dl>
          <div className="oops-stamp">Not found</div>
          <p className="oops-slip-foot">Chef checked every bowl. It is not here.</p>
        </div>

        {/* all 5 lines render; the CSS fades between them, one every 2.6s */}
        <ul className="oops-quips">
          {LINES.map((line, i) => (
            <li key={line} style={{ animationDelay: `${i * 2.6}s` }}>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="oops-sub">
          The page you were looking for isn&apos;t on our menu. The food still is.
        </p>

        <Link href="/" className="btn btn--primary">
          Back to the menu
        </Link>
      </main>
    </>
  );
}
