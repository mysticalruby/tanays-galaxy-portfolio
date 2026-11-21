"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { site } from "@/lib/content";
import { ThemeToggle } from "@/components/ThemeToggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/") || (href === "/experience" && pathname.startsWith("/projects"));
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const closeMobileMenu = () => setMenuOpen(false);
  const openSearch = () => window.dispatchEvent(new Event("open-search"));
  const current = site.nav.find((n) => isActive(pathname, n.href))?.href ?? null;
  const highlight = hovered ?? current;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-bg-deep/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="font-display text-lg text-text-primary transition-colors hover:text-gold"
        >
          {site.name}
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2">
          <ul className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
            {site.nav.map((item) => {
              const active = item.href === current;
              return (
                <li key={item.href} className="relative">
                  {highlight === item.href && (
                    <motion.span
                      layoutId="nav-highlight"
                      className="absolute inset-0 bg-surface-raised"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      aria-hidden
                    />
                  )}
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`relative z-10 block px-3 py-2 font-ui text-[12px] transition-colors ${active ? "text-gold" : "text-text-primary hover:text-gold"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search the site"
            className="flex h-9 cursor-pointer items-center gap-2 border border-white/10 px-2.5 text-text-muted transition-colors hover:text-text-primary"
          >
            <Search size={15} aria-hidden />
            <kbd className="hidden font-mono text-[11px] sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
          <div className="md:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="cursor-pointer px-3 py-2 font-ui text-xs text-text-primary transition-colors hover:text-gold"
            >
              Menu
            </button>
            {menuOpen && (
              <ul id="mobile-navigation" className="absolute inset-x-0 top-full z-50 border-b border-white/10 bg-bg-deep px-4 py-2 sm:px-6">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="block px-3 py-3 font-ui text-xs text-text-muted transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
