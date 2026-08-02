"use client";

import Image from "next/image";
import Link from "next/link";
import { hotspots, rocketImage, site } from "@/lib/content";

export function RocketHub() {
  return (
    <>
      <div className="relative mx-auto w-full max-w-6xl">
        <div
          className="relative mx-auto w-full"
          style={{ aspectRatio: `${rocketImage.width} / ${rocketImage.height}` }}
        >
          <Image
            src={rocketImage.src}
            alt="Rocket cross-section navigation hub — click a labeled module to explore"
            width={rocketImage.width}
            height={rocketImage.height}
            className="h-auto w-full select-none"
            priority
            draggable={false}
          />
          {hotspots.map((hotspot) => (
            <Link
              key={hotspot.id}
              href={hotspot.href}
              aria-label={`${hotspot.label}: ${hotspot.tooltip}`}
              title={hotspot.tooltip}
              className="absolute border-2 border-transparent bg-transparent hover:border-blue/60 hover:bg-blue/10 focus-visible:border-blue focus-visible:bg-blue/10 focus-visible:outline-none"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
            />
          ))}
        </div>
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
