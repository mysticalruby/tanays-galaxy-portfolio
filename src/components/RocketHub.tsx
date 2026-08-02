"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { site } from "@/lib/content";

const RocketViewer = dynamic(
  () =>
    import("@/components/RocketViewer").then((mod) => mod.RocketViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(49vh,392px)] min-h-[224px] w-full items-center justify-center bg-transparent text-sm text-text-muted">
        Loading rocket model…
      </div>
    ),
  },
);

export function RocketHub() {
  return (
    <>
      <div className="relative mx-auto w-full max-w-6xl">
        <RocketViewer />
        <p className="mt-4 text-center text-sm text-text-muted">
          Click a module on the rocket to explore.
        </p>
      </div>

      <nav
        aria-label="Rocket module navigation"
        className="mx-auto mt-6 max-w-6xl"
      >
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {site.rocketModules.map((mod) => (
            <li key={mod.label}>
              <Link
                href={mod.href}
                className="flex min-h-[44px] items-center justify-center border border-white/10 bg-black px-3 py-2 text-center text-sm text-text-muted transition-colors hover:border-blue hover:text-blue"
              >
                {mod.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
