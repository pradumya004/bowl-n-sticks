import QRCode from "qrcode";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// The base URL the QRs point to.
// Pass a domain as an argument to override:
// node scripts/gen-qr.mjs https://mydomain.com

const BASE_URL = process.argv[2] || "https://bowl-n-sticks.vercel.app";

// The tables to make QRs for.
const TABLES = ["T1", "T2", "T3", "T4"];

// Output into a qr/ folder at the repo root.
const OUT = path.resolve(process.cwd(), "..", "qr");
await mkdir(OUT, { recursive: true });

// Brand colours: ink on cream (high contrast, still scans fine).
const color = { dark: "#141210", light: "#FBF3E7" };

for (const code of TABLES) {
  const url = `${BASE_URL}/t/${code}`;
  await QRCode.toFile(path.join(OUT, `${code}.png`), url, {
    margin: 2,
    width: 1024,
    color,
  });
  console.log(`Wrote ${code}.png → ${url}`);

  const svg = await QRCode.toString(url, { type: "svg", margin: 2, color });
  await writeFile(path.join(OUT, `${code}.svg`), svg);
  console.log(`Wrote ${code}.svg → ${url}`);
}

console.log(`\nDone. QRs are written in ${OUT}`);
