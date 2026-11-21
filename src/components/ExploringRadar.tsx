"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { exploring } from "@/lib/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ExploringRadar.module.css";

type Topic = (typeof exploring.topics)[number];

/** Which sector each topic sits in. Position on the scope is only for layout, not a score. */
const SECTORS: { name: string; ids: string[] }[] = [
  { name: "Simulation", ids: ["computational-physics", "fem", "multiphysics", "openrocket"] },
  { name: "Hardware", ids: ["cad", "circuit-design", "arduino"] },
  { name: "Software and data", ids: ["matlab", "data-viz", "gis", "latex"] },
  { name: "Kitchen", ids: ["cooking"] },
];

const SIZE = 560;
const C = SIZE / 2;
const R = 240;
const RINGS = [0.33, 0.66, 1];
const SWEEP_SECONDS = 7;

type Blip = { topic: Topic; sector: string; angle: number; r: number; x: number; y: number };

function layout(topics: Topic[]): Blip[] {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const blips: Blip[] = [];
  const span = 360 / SECTORS.length;
  SECTORS.forEach((sector, si) => {
    const members = sector.ids.map((id) => byId.get(id)).filter((t): t is Topic => Boolean(t));
    members.forEach((topic, i) => {
      // spread blips across the sector, alternating distance so labels don't collide
      const angle = si * span + (span * (i + 1)) / (members.length + 1);
      const r = R * [0.5, 0.8, 0.62, 0.9][i % 4];
      const rad = ((angle - 90) * Math.PI) / 180;
      blips.push({ topic, sector: sector.name, angle, r, x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) });
    });
  });
  // anything not assigned to a sector still shows up
  topics
    .filter((t) => !SECTORS.some((s) => s.ids.includes(t.id)))
    .forEach((topic, i) => {
      const angle = (i * 37) % 360;
      const r = R * 0.4;
      const rad = ((angle - 90) * Math.PI) / 180;
      blips.push({ topic, sector: "Other", angle, r, x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) });
    });
  return blips;
}

const SHORT: Record<string, string> = {
  "computational-physics": "Computational physics",
  fem: "FEM",
  multiphysics: "Multiphysics",
  openrocket: "OpenRocket",
  cad: "CAD",
  "circuit-design": "Circuits",
  arduino: "Arduino",
  matlab: "MATLAB",
  "data-viz": "Data viz",
  gis: "GIS",
  latex: "LaTeX",
  cooking: "Cooking",
};
function shortLabel(topic: Topic) {
  return SHORT[topic.id] ?? topic.label.split(/[(&/]/)[0].trim();
}

export function ExploringRadar() {
  const reduced = useReducedMotion();
  const blips = useMemo(() => layout(exploring.topics as Topic[]), []);
  const [selectedId, setSelectedId] = useState<string>(blips[0]?.topic.id ?? "");
  const [sweepAngle, setSweepAngle] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = (t: number) => {
      if (start.current === null) start.current = t;
      setSweepAngle((((t - start.current) / 1000) * (360 / SWEEP_SECONDS)) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const selected = blips.find((b) => b.topic.id === selectedId) ?? blips[0];

  // how recently the sweep passed each blip (0 = just now, 1 = a full turn ago)
  const freshness = (angle: number) => {
    if (reduced) return 0.4;
    const behind = (sweepAngle - angle + 360) % 360;
    return behind / 360;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.scope}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label="Topics I am exploring, grouped into sectors">
          <defs>
            <radialGradient id="radar-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--surface-raised)" />
              <stop offset="100%" stopColor="var(--bg-deep)" />
            </radialGradient>
          </defs>

          <circle cx={C} cy={C} r={R} fill="url(#radar-bg)" />
          {RINGS.map((k) => (
            <circle key={k} cx={C} cy={C} r={R * k} className={styles.ring} />
          ))}
          {SECTORS.map((s, i) => {
            const a = ((i * (360 / SECTORS.length) - 90) * Math.PI) / 180;
            const mid = (((i + 0.5) * (360 / SECTORS.length) - 90) * Math.PI) / 180;
            return (
              <g key={s.name}>
                <line x1={C} y1={C} x2={C + R * Math.cos(a)} y2={C + R * Math.sin(a)} className={styles.spoke} />
                <text
                  x={C + (R + 16) * Math.cos(mid)}
                  y={C + (R + 16) * Math.sin(mid)}
                  className={styles.sectorLabel}
                  textAnchor={Math.cos(mid) > 0.2 ? "start" : Math.cos(mid) < -0.2 ? "end" : "middle"}
                  dominantBaseline="middle"
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          {!reduced && (
            <g transform={`rotate(${sweepAngle} ${C} ${C})`} className={styles.sweep}>
              {Array.from({ length: 12 }, (_, i) => {
                const a0 = (-(i + 1) * 3 * Math.PI) / 180;
                const a1 = (-i * 3 * Math.PI) / 180;
                return (
                  <path
                    key={i}
                    d={`M ${C} ${C} L ${C + R * Math.sin(a1)} ${C - R * Math.cos(a1)} A ${R} ${R} 0 0 0 ${C + R * Math.sin(a0)} ${C - R * Math.cos(a0)} Z`}
                    fill="var(--gold)"
                    fillOpacity={0.16 * (1 - i / 12)}
                  />
                );
              })}
              <line x1={C} y1={C} x2={C} y2={C - R} className={styles.sweepLine} />
            </g>
          )}

          {blips.map((b) => {
            const f = freshness(b.angle);
            const glow = Math.max(0.25, 1 - f * 1.4);
            const isSel = b.topic.id === selected?.topic.id;
            return (
              <g
                key={b.topic.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={b.topic.label}
                className={`${styles.blip} ${isSel ? styles.selected : ""}`}
                onClick={() => setSelectedId(b.topic.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(b.topic.id);
                  }
                }}
              >
                <circle cx={b.x} cy={b.y} r={18} className={styles.hit} />
                <circle cx={b.x} cy={b.y} r={isSel ? 7 : 5} className={styles.dot} style={{ opacity: isSel ? 1 : glow }} />
                {isSel && <circle cx={b.x} cy={b.y} r={13} className={styles.selRing} />}
                <text x={b.x + (isSel ? 18 : 11)} y={b.y + 4} className={styles.blipLabel} style={{ opacity: isSel ? 1 : 0.55 + glow * 0.45 }}>
                  {shortLabel(b.topic)}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={3} className={styles.center} />
        </svg>
        <p className={styles.note}>Sectors group related topics. Distance from the center is only for spacing.</p>
      </div>

      {selected && (
        <article className={styles.panel} aria-live="polite">
          <p className={styles.kicker}>{selected.sector}</p>
          <h2>{selected.topic.label}</h2>
          <h3>Why I&apos;m looking at it</h3>
          <p>{selected.topic.overview}</p>
          <h3>Where I am</h3>
          <p>{selected.topic.learning}</p>
          <h3>What I want to try next</h3>
          <p>{selected.topic.nextSteps}</p>
        </article>
      )}

      <nav className={styles.list} aria-label="All topics">
        {SECTORS.map((s) => (
          <div key={s.name}>
            <p className={styles.kicker}>{s.name}</p>
            <ul>
              {blips
                .filter((b) => b.sector === s.name)
                .map((b) => (
                  <li key={b.topic.id}>
                    <button type="button" aria-pressed={b.topic.id === selected?.topic.id} onClick={() => setSelectedId(b.topic.id)}>
                      {b.topic.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
