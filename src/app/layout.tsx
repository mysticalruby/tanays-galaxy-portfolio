import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Header } from "@/components/Header";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import "./globals.css";
import "../styles/starfield.css";

/** Wide futuristic display — logos, posters, page headers */
const audiowide = localFont({
  src: "../../public/fonts/audiowide-400.ttf",
  variable: "--font-display-family",
  display: "swap",
});

/** Geometric sci-fi sans — body copy and HUD-style UI readouts */
const orbitron = localFont({
  src: [
    { path: "../../public/fonts/orbitron-400.ttf", weight: "400" },
    { path: "../../public/fonts/orbitron-500.ttf", weight: "500" },
    { path: "../../public/fonts/orbitron-600.ttf", weight: "600" },
    { path: "../../public/fonts/orbitron-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

/** Fixed-width technical face — terminals and starship-style interfaces */
const spaceMono = localFont({
  src: [
    { path: "../../public/fonts/space-mono-400.ttf", weight: "400" },
    { path: "../../public/fonts/space-mono-700.ttf", weight: "700" },
  ],
  variable: "--font-mono-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tanay's Galaxy",
    template: "%s | Tanay's Galaxy",
  },
  description:
    "Exploring difficult problems through engineering, research, and creativity. Portfolio of Tanay Mangal — mathematical modeling, engineering design, and applied research.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.png",
  },
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xvwtffmxp8");`}
        </Script>
        <StarfieldBackground />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <div className="h-16 shrink-0" aria-hidden="true" />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
