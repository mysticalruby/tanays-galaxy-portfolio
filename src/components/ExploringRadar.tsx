"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
const R = 252;
const RINGS = [0.33, 0.66, 1];
/** Seconds for one full turn. Slow enough to read each topic as the sweep passes it. */
const SWEEP_SECONDS = 42;

type Blip = { topic: Topic; sector: string; angle: number; r: number; x: number; y: number };
type SectorArc = { name: string; start: number; end: number };

function layout(topics: Topic[]): { blips: Blip[]; arcs: SectorArc[] } {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const groups = SECTORS.map((s) => ({ name: s.name, members: s.ids.map((id) => byId.get(id)).filter((t): t is Topic => Boolean(t)) }));
  const extra = topics.filter((t) => !SECTORS.some((s) => s.ids.includes(t.id)));
  if (extra.length) groups.push({ name: "Other", members: extra });
  // each topic gets an equal slice of the circle, so the sweep spends the same time on each one
  const total = groups.reduce((n, g) => n + g.members.length, 0) || 1;
  const step = 360 / total;
  const blips: Blip[] = [];
  const arcs: SectorArc[] = [];
  let cursor = 0;
  groups.forEach((g) => {
    const start = cursor;
    g.members.forEach((topic, i) => {
      const angle = cursor + step / 2;
      const r = R * [0.52, 0.82, 0.66, 0.9][i % 4];
      const rad = ((angle - 90) * Math.PI) / 180;
      blips.push({ topic, sector: g.name, angle, r, x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) });
      cursor += step;
    });
    arcs.push({ name: g.name, start, end: cursor });
  });
  return { blips, arcs };
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
  const { blips, arcs } = useMemo(() => layout(exploring.topics as Topic[]), []);
  // total degrees swept since the page opened (not wrapped), so we know what has been revealed
  const startAt = Math.max(0, (blips[0]?.angle ?? 0) - 8);
  const [swept, setSwept] = useState(startAt);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = (t: number) => {
      if (start.current === null) start.current = t;
      setSwept(startAt + ((t - start.current) / 1000) * (360 / SWEEP_SECONDS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, startAt]);

  const sweepAngle = swept % 360;
  const isRevealed = (b: Blip) => reduced || swept >= 360 || b.angle <= swept;

  // the topic the sweep passed most recently
  const lastSwept = useMemo(() => {
    if (reduced) return blips[0];
    const passed = blips.filter((b) => b.angle <= sweepAngle);
    if (passed.length) return passed[passed.length - 1];
    return swept >= 360 ? blips[blips.length - 1] : undefined;
  }, [blips, sweepAngle, swept, reduced]);

  const following = pinnedId === null && !reduced;
  const selected = pinnedId ? blips.find((b) => b.topic.id === pinnedId) : lastSwept;

  const pin = (id: string) => setPinnedId(id);

  /** degrees since the sweep last crossed this blip (0 = just now) */
  const behind = (angle: number) => (sweepAngle - angle + 360) % 360;

  return (
    <div className={styles.wrap}>
      <div className={styles.scope}>
        <svg viewBox={`-130 -12 ${SIZE + 260} ${SIZE + 24}`} role="group" aria-label="Topics I am exploring. The sweep reveals each one; click a revealed dot to read about it.">
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
          {arcs.map((a) => {
            const edge = ((a.start - 90) * Math.PI) / 180;
            const mid = ((((a.start + a.end) / 2) - 90) * Math.PI) / 180;
            const cos = Math.cos(mid);
            return (
              <g key={a.name}>
                <line x1={C} y1={C} x2={C + R * Math.cos(edge)} y2={C + R * Math.sin(edge)} className={styles.spoke} />
                <text
                  x={C + (R + 18) * cos}
                  y={C + (R + 18) * Math.sin(mid)}
                  className={styles.sectorLabel}
                  textAnchor={cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle"}
                  dominantBaseline="middle"
                >
                  {a.name}
                </text>
              </g>
            );
          })}

          {!reduced && (
            <g transform={`rotate(${sweepAngle} ${C} ${C})`}>
              {Array.from({ length: 14 }, (_, i) => {
                const a0 = (-(i + 1) * 3 * Math.PI) / 180;
                const a1 = (-i * 3 * Math.PI) / 180;
                return (
                  <path
                    key={i}
                    d={`M ${C} ${C} L ${C + R * Math.sin(a1)} ${C - R * Math.cos(a1)} A ${R} ${R} 0 0 0 ${C + R * Math.sin(a0)} ${C - R * Math.cos(a0)} Z`}
                    fill="var(--gold)"
                    fillOpacity={0.18 * (1 - i / 14)}
                  />
                );
              })}
              <line x1={C} y1={C} x2={C} y2={C - R} className={styles.sweepLine} />
            </g>
          )}

          {blips.map((b) => {
            const shown = isRevealed(b);
            const d = behind(b.angle);
            const glow = reduced ? 0.8 : Math.max(0.35, 1 - (d / 360) * 1.3);
            const isSel = b.topic.id === selected?.topic.id;
            const leftSide = b.x < C - 10;
            const labelX = b.x + (leftSide ? -1 : 1) * (isSel ? 18 : 12);
            if (!shown) {
              // not reached yet: a faint unlabeled mark that cannot be clicked
              return <circle key={b.topic.id} cx={b.x} cy={b.y} r={2.5} className={styles.hidden} />;
            }
            return (
              <g
                key={b.topic.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={b.topic.label}
                className={styles.blip}
                onClick={() => pin(b.topic.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pin(b.topic.id);
                  }
                }}
              >
                <circle cx={b.x} cy={b.y} r={20} className={styles.hit} />
                {!reduced && d < 40 && (
                  <circle cx={b.x} cy={b.y} r={6 + d * 0.6} className={styles.ping} style={{ opacity: 1 - d / 40 }} />
                )}
                <circle cx={b.x} cy={b.y} r={isSel ? 7 : 5} className={styles.dot} style={{ opacity: isSel ? 1 : glow }} />
                {isSel && <circle cx={b.x} cy={b.y} r={13} className={styles.selRing} />}
                <text
                  x={labelX}
                  y={b.y + 5}
                  textAnchor={leftSide ? "end" : "start"}
                  className={`${styles.blipLabel} ${isSel ? styles.blipLabelSel : ""}`}
                  style={{ opacity: isSel ? 1 : 0.5 + glow * 0.5 }}
                >
                  {shortLabel(b.topic)}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r={3} className={styles.center} />
        </svg>
        <p className={styles.note}>
          {reduced
            ? "Click a dot to read about that topic."
            : "The sweep reveals each topic as it passes. Click any revealed dot to stop on it."}
        </p>
        <nav className={styles.list} aria-label="All topics">
          {arcs.map((a) => (
            <div key={a.name}>
              <p className={styles.kicker}>{a.name}</p>
              <ul>
                {blips
                  .filter((b) => b.sector === a.name)
                  .map((b) => (
                    <li key={b.topic.id}>
                      <button type="button" aria-pressed={b.topic.id === selected?.topic.id} onClick={() => pin(b.topic.id)}>
                        {b.topic.label}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.side}>
        <div className={styles.modeBar}>
          <span className={styles.modeState}>
            <span className={`${styles.led} ${following ? styles.ledOn : ""}`} aria-hidden />
            {following ? "Following the sweep" : "Stopped on a topic"}
          </span>
          {!reduced && (
            <button type="button" className={styles.modeBtn} onClick={() => setPinnedId(following ? (selected?.topic.id ?? null) : null)}>
              {following ? "Stop here" : "Resume sweep"}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.article
              key={selected.topic.id}
              className={styles.panel}
              aria-live="polite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <p className={styles.kicker}>{selected.sector}</p>
              <h2>{selected.topic.label}</h2>
              <h3>Why I&apos;m looking at it</h3>
              <p>{selected.topic.overview}</p>
              <h3>Where I am</h3>
              <p>{selected.topic.learning}</p>
              <h3>What I want to try next</h3>
              <p>{selected.topic.nextSteps}</p>
            </motion.article>
          ) : (
            <motion.article key="scanning" className={`${styles.panel} ${styles.waiting}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className={styles.kicker}>Scanning</p>
              <p>The first topic shows up here when the sweep reaches it.</p>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
