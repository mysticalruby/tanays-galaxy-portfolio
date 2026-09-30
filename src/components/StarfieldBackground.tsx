"use client";

import { useMemo, type CSSProperties } from "react";

/** Star tones share the site palette so they stay in sync with theme changes. */
const STAR_COLORS = ["var(--text-primary)", "var(--text-primary)", "var(--silver)", "var(--gold)"] as const;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Viewport-relative box-shadow stars spanning 0–200vh for a seamless scroll loop. */
function buildStarShadow(seed: number, count: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const x = (rand() * 100).toFixed(2);
    const y = (rand() * 200).toFixed(2);
    const color = STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)];
    return `${x}vw ${y}vh ${color}`;
  }).join(", ");
}

/**
 * Three parallax layers matching the reference static site:
 * small/fast → large/slow, with ::after clones for seamless vertical drift.
 */
const LAYERS = [
  { id: "stars-1", seed: 11, count: 60, size: 2, opacity: 0.36, duration: 38 },
  { id: "stars-2", seed: 29, count: 20, size: 4, opacity: 0.28, duration: 65 },
  { id: "stars-3", seed: 47, count: 8, size: 6, opacity: 0.2, duration: 95 },
] as const;

export function StarfieldBackground() {
  const shadows = useMemo(
    () => LAYERS.map((l) => buildStarShadow(l.seed, l.count)),
    []
  );

  return (
    <div
      className="starfield-sky pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          className="starfield-layer starfield-drift starfield-enabled"
          style={
            {
              width: layer.size,
              height: layer.size,
              opacity: layer.opacity,
              "--star-shadow": shadows[i],
              "--star-duration": `${layer.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
