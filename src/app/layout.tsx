import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Header } from "@/components/Header";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CommandPalette } from "@/components/CommandPalette";
import "./globals.css";
import "../styles/starfield.css";

/** Audiowide: the name and page headings. */
const audiowide = localFont({
  src: "../../public/fonts/audiowide-400.ttf",
  variable: "--font-display-family",
  display: "swap",
});

/** Orbitron: navigation and small labels only (too wide for long paragraphs). */
const orbitron = localFont({
  src: [
    { path: "../../public/fonts/orbitron-400.ttf", weight: "400" },
    { path: "../../public/fonts/orbitron-500.ttf", weight: "500" },
    { path: "../../public/fonts/orbitron-600.ttf", weight: "600" },
  ],
  variable: "--font-ui-family",
  display: "swap",
});

/** Space Mono: the terminal and other technical readouts. */
const spaceMono = localFont({
  src: [
    { path: "../../public/fonts/space-mono-400.ttf", weight: "400" },
    { path: "../../public/fonts/space-mono-700.ttf", weight: "700" },
  ],
  variable: "--font-mono-family",
  display: "swap",
});

/** IBM Plex Sans: body copy, so paragraphs stay easy to read. */
const plexSans = localFont({
  src: [
    { path: "../../public/fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/ibm-plex-sans-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

/** Runs before paint so the saved theme never flashes the wrong colors. */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export const metadata: Metadata = {
  title: {
    default: "Tanay Mangal",
    template: "%s | Tanay Mangal",
  },
  description:
    "Tanay Mangal, a senior at the Massachusetts Academy of Math and Science at WPI. Computational physics research, math modeling competitions, FRC Team 190, and the projects in between.",
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
    title: "Tanay Mangal",
    description:
      "Research, math modeling, robotics and engineering projects by Tanay Mangal.",
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
      className={`${audiowide.variable} ${orbitron.variable} ${spaceMono.variable} ${plexSans.variable} h-full`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative flex min-h-full flex-col font-sans antialiased">
        <SmoothScroll />
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
        <CommandPalette />
      </body>
    </html>
  );
}
