import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noir et Crème — Carte",
  description:
    "L'art du café, l'esprit frais. La carte de Noir et Crème — Gambetta, Oran. Cafés, jus pressés, mocktails et spécialités d'été.",
  openGraph: {
    title: "Noir et Crème — Carte",
    description: "L'art du café, l'esprit frais. Gambetta, Oran.",
    type: "website",
  },
  // the logo card in app/opengraph-image.jpg is what gets shared
  twitter: {
    card: "summary_large_image",
    title: "Noir et Crème — Carte",
    description: "L'art du café, l'esprit frais. Gambetta, Oran.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
