import type { Metadata } from "next";
import { Audiowide, Orbitron, Space_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import "./globals.css";
import "../styles/starfield.css";

/** Wide futuristic display — logos, posters, page headers */
const audiowide = Audiowide({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** Geometric sci-fi sans — body copy and HUD-style UI readouts */
const orbitron = Orbitron({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Fixed-width technical face — terminals and starship-style interfaces */
const spaceMono = Space_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tanay's Galaxy",
    template: "%s | Tanay's Galaxy",
  },
  description:
    "Exploring difficult problems through engineering, research, and creativity. Portfolio of Tanay Mangal — mathematical modeling, engineering design, and applied research.",
  openGraph: {
    title: "Tanay's Galaxy",
    description:
      "Student researcher and builder portfolio — projects in modeling, wearables, and engineering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${audiowide.variable} ${orbitron.variable} ${spaceMono.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col font-sans antialiased">
        <StarfieldBackground />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
