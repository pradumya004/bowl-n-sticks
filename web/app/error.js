"use client";
import Link from "next/link";

// Shown when something actually crashes (not a missing page). Next requires
// this to be a Client Component and hands us a `reset` to retry the render.
const LINES = [
  "Something burned in the kitchen.",
  "The chef dropped the bowl.",
  "Kitchen's on fire, give us a sec.",
  "That order came back wrong.",
  "We'll remake it, promise.",
];

export default function Error({ reset }) {
  return (
    <main className="oops">
      <div aria-hidden="true">
        <span className="oops-sticker s1">🍳</span>
        <span className="oops-sticker s2">✦</span>
        <span className="oops-sticker s3">🥢</span>
        <span className="oops-sticker s4">🔥</span>
        <span className="oops-sticker s5">✧</span>
        <span className="oops-sticker s6">💨</span>
      </div>

      <span className="pill pill--yellow pill--tilt">🔥 Oops</span>

      <h1 className="oops-code oops-code--sm">
        <span className="out">500</span>
      </h1>

      <div className="oops-slip">
        <div className="oops-slip-head">
          <span>Order slip</span>
          <span>#500</span>
        </div>
        <dl className="oops-slip-rows">
          <div>
            <dt>Table</dt>
            <dd>Yours</dd>
          </div>
          <div>
            <dt>Item</dt>
            <dd>This page</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Burnt</dd>
          </div>
        </dl>
        <div className="oops-stamp">Remake</div>
        <p className="oops-slip-foot">Kitchen error. Not your fault.</p>
      </div>

      <ul className="oops-quips">
        {LINES.map((line, i) => (
          <li key={line} style={{ animationDelay: `${i * 2.6}s` }}>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <p className="oops-sub">
        Something went wrong on our side. Try again, and if it keeps happening,
        tell the staff.
      </p>

      <div className="oops-actions">
        <button type="button" className="btn btn--primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn">
          Back to the menu
        </Link>
      </div>
    </main>
  );
}
