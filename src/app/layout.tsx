import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Header } from "@/components/Header";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import "./globals.css";
import "../styles/starfield.css";

/** One family for everything: IBM Plex Sans for reading, IBM Plex Mono for small technical labels. */
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

const plexMono = localFont({
  src: [
    { path: "../../public/fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../public/fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-mono-family",
  display: "swap",
});

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
      className={`${plexSans.variable} ${plexMono.variable} h-full`}
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
