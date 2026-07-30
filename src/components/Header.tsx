import Link from "next/link";
import { site } from "@/lib/content";

export function Header() {
  return (
    <header className="relative z-50 border-b border-silver/20 bg-surface-navy/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-text-primary hover:text-blue"
        >
          {site.name}
        </Link>
        <nav aria-label="Main navigation">
          <ul className="hidden flex-wrap items-center justify-end gap-1 md:flex">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-navy hover:text-blue"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <details className="md:hidden">
            <summary className="cursor-pointer list-none rounded-md border border-silver/30 px-3 py-2 text-sm text-text-primary [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <ul className="absolute inset-x-0 top-full z-50 border-t border-silver/20 bg-surface-navy px-4 py-2 shadow-lg sm:px-6">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-3 text-sm text-text-muted hover:bg-bg-deep hover:text-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </nav>
      </div>
    </header>
  );
}
