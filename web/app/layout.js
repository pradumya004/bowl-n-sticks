import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

// Display font (headings, stickers, prices) and body font. Loaded once here.
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Bowl n Sticks",
  description: "First anime themed cafe in Karwar. Ramen, maggi & good vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}