"use client";

import { useMemo, useState } from "react";
import type { Award } from "@/types/content";

interface ConstellationMapProps {
  awards: Award[];
}

interface BgStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

interface BgLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wide sky matches the 2:1 container — avoids letterboxing in the center. */
const SKY_W = 200;
const SKY_H = 100;

function idSeed(id: string) {
  return id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function buildAwardPositions(awards: Award[]) {
  const padX = 8;
  const padY = 6;
  const minDist = 4.2;

  const positions = awards.map((award) => {
    const rand = mulberry32(idSeed(award.id));
    return {
      x: padX + rand() * (SKY_W - padX * 2),
      y: padY + rand() * (SKY_H - padY * 2),
    };
  });

  for (let iter = 0; iter < 18; iter++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dist = Math.hypot(dx, dy) || 0.01;

        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          positions[i].x -= nx * push;
          positions[i].y -= ny * push;
          positions[j].x += nx * push;
          positions[j].y += ny * push;
        }
      }
    }

    for (let i = 0; i < positions.length; i++) {
      positions[i].x = Math.min(SKY_W - padX, Math.max(padX, positions[i].x));
      positions[i].y = Math.min(SKY_H - padY, Math.max(padY, positions[i].y));
    }
  }

  return positions;
}

function buildDecorativeField(seed: number) {
  const rand = mulberry32(seed);
  const stars: BgStar[] = [];
  const lines: BgLine[] = [];

  for (let i = 0; i < 180; i++) {
    stars.push({
      x: rand() * SKY_W,
      y: rand() * SKY_H,
      r: 0.2 + rand() * 1.1,
      opacity: 0.12 + rand() * 0.35,
    });
  }

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (dist < 22 && rand() < 0.14) {
        lines.push({
          x1: stars[i].x,
          y1: stars[i].y,
          x2: stars[j].x,
          y2: stars[j].y,
          opacity: 0.08 + rand() * 0.14,
        });
      }
    }
  }

  for (let i = 0; i < 20; i++) {
    const a = stars[Math.floor(rand() * stars.length)];
    const b = stars[Math.floor(rand() * stars.length)];
    if (a === b) continue;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist > 12 && dist < 55) {
      lines.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        opacity: 0.06 + rand() * 0.1,
      });
    }
  }

  return { stars, lines };
}

export function ConstellationMap({ awards }: ConstellationMapProps) {
  const [hovered, setHovered] = useState<Award | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const { stars: bgStars, lines: decorativeLines } = useMemo(
    () => buildDecorativeField(42),
    []
  );

  const awardPositions = useMemo(
    () => buildAwardPositions(awards),
    [awards]
  );

  const awardConnections = useMemo(() => {
    const rand = mulberry32(7);
    const edges = new Set<string>();
    const pairs: { a: number; b: number; color: string }[] = [];

    const add = (a: number, b: number) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edges.has(key)) {
        edges.add(key);
        pairs.push({
          a,
          b,
          color: awards[a].starColor,
        });
      }
    };

    const distBetween = (a: number, b: number) => {
      const pa = awardPositions[a];
      const pb = awardPositions[b];
      return Math.hypot(pa.x - pb.x, pa.y - pb.y);
    };

    // Each star links to its 2 nearest neighbors
    for (let i = 0; i < awards.length; i++) {
      const neighbors = awards
        .map((_, j) => ({ j, dist: distBetween(i, j) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);
      neighbors.forEach(({ j }) => add(i, j));
    }

    const byConstellation = new Map<string, number[]>();
    awards.forEach((award, i) => {
      const list = byConstellation.get(award.constellation) ?? [];
      list.push(i);
      byConstellation.set(award.constellation, list);
    });

    byConstellation.forEach((indices) => {
      for (let i = 0; i < indices.length - 1; i++) {
        add(indices[i], indices[i + 1]);
      }
    });

    for (let i = 0; i < awards.length; i++) {
      for (let j = i + 1; j < awards.length; j++) {
        const dist = distBetween(i, j);
        if (dist < 40 && rand() < 0.2) {
          add(i, j);
        }
      }
    }

    return pairs;
  }, [awards, awardPositions]);

  const scrollToAward = (id: string) => {
    setSelected(id);
    document.getElementById(`award-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-[2/1] w-full max-w-[80rem] overflow-hidden rounded-xl border border-silver/20 bg-bg-deep">
        <svg
          viewBox={`0 0 ${SKY_W} ${SKY_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="Constellation map of awards and honors"
        >
          {/* Decorative constellation lines (background only) */}
          {decorativeLines.map((line, i) => (
            <line
              key={`deco-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#FFFFFF"
              strokeWidth="0.12"
              opacity={line.opacity}
            />
          ))}

          {/* Decorative background stars — dim white only */}
          {bgStars.map((s, i) => (
            <circle
              key={`bg-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#FFFFFF"
              opacity={s.opacity}
            />
          ))}

          {/* Award constellation lines — colored */}
          {awardConnections.map(({ a, b, color }, i) => {
            const pa = awardPositions[a];
            const pb = awardPositions[b];
            return (
              <line
                key={`award-line-${i}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={color}
                strokeWidth="0.22"
                opacity="0.45"
              />
            );
          })}

          {/* Award stars — each with its own color */}
          {awards.map((award, i) => {
            const { x, y } = awardPositions[i];
            const isHovered = hovered?.id === award.id;
            const isSelected = selected === award.id;
            const r = award.starSize * 0.35;
            const color = award.starColor;

            return (
              <g key={award.id}>
                {(isHovered || isSelected) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 2.2}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.35"
                    opacity="0.65"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r * (isHovered ? 1.25 : 1)}
                  fill={color}
                  opacity={award.verified ? 1 : 0.55}
                  stroke={isSelected ? "#FFFFFF" : color}
                  strokeWidth={isSelected ? "0.45" : "0.15"}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(award)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => scrollToAward(award.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${award.name}: ${award.description}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      scrollToAward(award.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-xs -translate-x-1/2 rounded-lg border bg-surface-navy/95 px-4 py-3 text-center shadow-lg"
            style={{ borderColor: `${hovered.starColor}66` }}
            role="tooltip"
          >
            <p
              className="font-readout text-sm font-semibold"
              style={{ color: hovered.starColor }}
            >
              {hovered.name}
            </p>
            <p className="mt-0.5 text-xs text-blue">{hovered.organization}</p>
            <p className="mt-1 text-xs text-text-muted">{hovered.description}</p>
            {!hovered.verified && (
              <p className="mt-1 text-xs text-silver">To be verified</p>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-text-muted">
        Colored stars are awards — silver for math, gold for engineering, blue for leadership, purple for discipline. Click a star to jump to its card.
      </p>
    </div>
  );
}
