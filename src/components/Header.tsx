"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/content";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-bg-deep">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
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
                  className="px-3 py-2 text-sm text-text-primary transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="md:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="cursor-pointer px-3 py-2 text-sm text-text-primary transition-colors hover:text-blue"
            >
              Menu
            </button>
            {menuOpen && <ul id="mobile-navigation" className="absolute inset-x-0 top-full z-50 bg-bg-deep px-4 py-2 sm:px-6">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block px-3 py-3 text-sm text-text-muted transition-colors hover:text-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>}
          </div>
        </nav>
      </div>
    </header>
  );
}
