"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Award } from "@/types/content";

interface ConstellationMapProps {
  awards: Award[];
}

interface BgStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
  vx: number;
  vy: number;
  twinkleDuration: number;
  twinkleDelay: number;
}

interface BgLine {
  a: number;
  b: number;
  opacity: number;
}

interface AwardMotion {
  x: number;
  y: number;
  vx: number;
  vy: number;
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

const SKY_W = 200;
const SKY_H = 100;
const PAD_X = 8;
const PAD_Y = 6;

function idSeed(id: string) {
  return id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function randomVelocity(rand: () => number, speedMin: number, speedMax: number) {
  const angle = rand() * Math.PI * 2;
  const speed = speedMin + rand() * (speedMax - speedMin);
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function buildAwardMotions(awards: Award[]): AwardMotion[] {
  const minDist = 4.2;

  const positions = awards.map((award) => {
    const rand = mulberry32(idSeed(award.id));
    const { vx, vy } = randomVelocity(rand, 0.8, 2.2);
    return {
      x: PAD_X + rand() * (SKY_W - PAD_X * 2),
      y: PAD_Y + rand() * (SKY_H - PAD_Y * 2),
      vx,
      vy,
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
      positions[i].x = Math.min(SKY_W - PAD_X, Math.max(PAD_X, positions[i].x));
      positions[i].y = Math.min(SKY_H - PAD_Y, Math.max(PAD_Y, positions[i].y));
    }
  }

  return positions;
}

function buildDecorativeField(seed: number) {
  const rand = mulberry32(seed);
  const stars: BgStar[] = [];
  const lines: BgLine[] = [];

  for (let i = 0; i < 180; i++) {
    const { vx, vy } = randomVelocity(rand, 0.4, 1.6);
    stars.push({
      x: rand() * SKY_W,
      y: rand() * SKY_H,
      r: 0.2 + rand() * 1.1,
      opacity: 0.12 + rand() * 0.35,
      vx,
      vy,
      twinkleDuration: 2.5 + rand() * 4.5,
      twinkleDelay: rand() * 6,
    });
  }

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
      if (dist < 22 && rand() < 0.14) {
        lines.push({
          a: i,
          b: j,
          opacity: 0.08 + rand() * 0.14,
        });
      }
    }
  }

  for (let i = 0; i < 20; i++) {
    const a = Math.floor(rand() * stars.length);
    const b = Math.floor(rand() * stars.length);
    if (a === b) continue;
    const dist = Math.hypot(stars[a].x - stars[b].x, stars[a].y - stars[b].y);
    if (dist > 12 && dist < 55) {
      lines.push({
        a,
        b,
        opacity: 0.06 + rand() * 0.1,
      });
    }
  }

  return { stars, lines };
}

function stepBodies<T extends { x: number; y: number; vx: number; vy: number }>(
  bodies: T[],
  dt: number,
  padX: number,
  padY: number
): T[] {
  return bodies.map((body) => {
    let { x, y, vx, vy } = body;
    x += vx * dt;
    y += vy * dt;

    if (x < padX) {
      x = padX;
      vx = Math.abs(vx);
    } else if (x > SKY_W - padX) {
      x = SKY_W - padX;
      vx = -Math.abs(vx);
    }

    if (y < padY) {
      y = padY;
      vy = Math.abs(vy);
    } else if (y > SKY_H - padY) {
      y = SKY_H - padY;
      vy = -Math.abs(vy);
    }

    return { ...body, x, y, vx, vy };
  });
}

export function ConstellationMap({ awards }: ConstellationMapProps) {
  const [hovered, setHovered] = useState<Award | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const decorativeSeed = useMemo(() => buildDecorativeField(42), []);
  const initialAwardMotions = useMemo(
    () => buildAwardMotions(awards),
    [awards]
  );
  const [bgStars, setBgStars] = useState(decorativeSeed.stars);
  const [awardMotions, setAwardMotions] = useState(initialAwardMotions);

  const bgRef = useRef(decorativeSeed.stars);
  const awardRef = useRef(initialAwardMotions);

  useEffect(() => {
    awardRef.current = initialAwardMotions;
    setAwardMotions(initialAwardMotions);
  }, [initialAwardMotions]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      bgRef.current = stepBodies(bgRef.current, dt, 0, 0);
      awardRef.current = stepBodies(awardRef.current, dt, PAD_X, PAD_Y);
      setBgStars(bgRef.current);
      setAwardMotions(awardRef.current);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Stable link topology from initial layout — lines track stars as they drift
  const awardConnections = useMemo(() => {
    const rand = mulberry32(7);
    const edges = new Set<string>();
    const pairs: { a: number; b: number; color: string }[] = [];
    const positions = initialAwardMotions;

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
      const pa = positions[a];
      const pb = positions[b];
      return Math.hypot(pa.x - pb.x, pa.y - pb.y);
    };

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
  }, [awards, initialAwardMotions]);

  const scrollToAward = (id: string) => {
    setSelected(id);
    document
      .getElementById(`award-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-[2/1] w-full max-w-[80rem] overflow-visible">
        <svg
          viewBox={`0 0 ${SKY_W} ${SKY_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Constellation map of awards and honors"
        >
          {decorativeSeed.lines.map((line, i) => {
            const a = bgStars[line.a];
            const b = bgStars[line.b];
            if (!a || !b) return null;
            return (
              <line
                key={`deco-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#FFFFFF"
                strokeWidth="0.12"
                opacity={line.opacity}
              />
            );
          })}

          {bgStars.map((s, i) => (
            <circle
              key={`bg-${i}`}
              className="star-twinkle"
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#FFFFFF"
              style={
                {
                  "--star-o": s.opacity,
                  "--twinkle-duration": `${s.twinkleDuration}s`,
                  "--twinkle-delay": `${s.twinkleDelay}s`,
                } as CSSProperties
              }
            />
          ))}

          {awardConnections.map(({ a, b, color }, i) => {
            const pa = awardMotions[a];
            const pb = awardMotions[b];
            if (!pa || !pb) return null;
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

          {awards.map((award, i) => {
            const motion = awardMotions[i];
            if (!motion) return null;
            const { x, y } = motion;
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
            className="pointer-events-none absolute bottom-3 left-1/2 z-10 max-w-xs -translate-x-1/2 rounded-none border bg-surface-navy/95 px-4 py-3 text-center shadow-lg"
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
        Colored stars are awards — silver for math, gold for engineering, blue
        for leadership, purple for discipline. Click a star to jump to its card.
      </p>
    </div>
  );
}
