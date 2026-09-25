// Spicy marker. NOT the 🌶 emoji: every platform renders that near-black, so it
// disappeared on both cream and red.
//
// Shape is Twemoji's hot pepper (U+1F336), recoloured to our brand red with an
// ink outline so it sits with the rest of the UI instead of looking like a
// pasted-in emoji.
// Twemoji graphics are CC-BY 4.0 (c) Twitter, Inc and other contributors.
export default function SpicyMark() {
  return (
    <svg
      className="spicy-mark"
      viewBox="0 0 36 36"
      width="22"
      height="22"
      role="img"
      aria-label="Spicy"
    >
      <title>Spicy</title>

      {/* body */}
      <path
        d="M4.042 27.916c4.89.551 9.458-1.625 13.471-5.946 4.812-5.182 5-13 5-14s11.31-3.056 11 5c-.43 11.196-7.43 20.946-19.917 21.916-5.982.465-9.679-.928-11.387-2.345-2.69-2.231-.751-4.916 1.833-4.625z"
        fill="var(--color-red)"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* stem */}
      <path
        d="M30.545 6.246c.204-1.644.079-3.754-.747-4.853-1.111-1.479-4.431-.765-3.569.113.96.979 2.455 2.254 2.401 4.151-.044-.01-.085-.022-.13-.032-3.856-.869-6.721 1.405-7.167 2.958-.782 2.722 4.065.568 4.68 1.762 1.82 3.53 3.903.155 4.403 1.28s4.097 4.303 4.097.636c0-3.01-1.192-4.903-3.968-6.015z"
        fill="#77b255"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
