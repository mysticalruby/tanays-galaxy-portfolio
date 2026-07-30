import Link from "next/link";
import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-silver/20 bg-surface-navy/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Tanay Mangal — {site.name}
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-4">
            {site.nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-text-muted hover:text-blue"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
