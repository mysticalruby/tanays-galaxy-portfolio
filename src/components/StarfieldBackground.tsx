"use client";

import { useMemo, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FIELD_W = 2000;
const FIELD_H = 2000;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStarShadow(seed: number, count: number) {
  const rand = mulberry32(seed);
  return Array.from(
    { length: count },
    () => `${Math.floor(rand() * FIELD_W)}px ${Math.floor(rand() * FIELD_H)}px #fff`
  ).join(", ");
}

const LAYERS = [
  { id: "stars-1", seed: 11, count: 420, size: 1, duration: 50 },
  { id: "stars-2", seed: 29, count: 160, size: 2, duration: 100 },
  { id: "stars-3", seed: 47, count: 85, size: 3, duration: 150 },
] as const;

export function StarfieldBackground() {
  const reducedMotion = useReducedMotion();

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
          className={`starfield-layer ${reducedMotion ? "starfield-static" : "starfield-drift"}`}
          style={
            {
              width: layer.size,
              height: layer.size,
              "--star-shadow": shadows[i],
              "--star-duration": `${layer.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
