"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ExploringTopic } from "@/types/content";

/** Normalized playfield coords: x,y in roughly [-1, 1] across the field. */
interface AsteroidBody {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  sprite: string;
}

const ASTEROID_SPRITES = [
  "/images/asteroids/Asteroid1.png",
  "/images/asteroids/Asteroid2.png",
  "/images/asteroids/Asteroid3.png",
  "/images/asteroids/Asteroid4.png",
  "/images/asteroids/Asteroid5.png",
  "/images/asteroids/Asteroid6.png",
] as const;

/** Few rocks on screen at once — topics cycle as rocks exit. */
const MIN_ASTEROIDS = 5;
const MAX_ASTEROIDS = 8;

/** Past this (normalized) distance from center, the asteroid has left the field. */
const EXIT_LIMIT = 1.22;

/** Horizontal speed range (normalized units / second). */
const SPEED_MIN = 0.32;
const SPEED_MAX = 0.52;

/** Tiny vertical drift so paths aren't perfectly flat. */
const WOBBLE_MAX = 0.035;

function hashId(id: string) {
  return id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
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

function pickSprite(rand: () => number) {
  return ASTEROID_SPRITES[Math.floor(rand() * ASTEROID_SPRITES.length)];
}

function nextTopic(
  topics: ExploringTopic[],
  cursorRef: { current: number }
): ExploringTopic {
  const topic = topics[cursorRef.current % topics.length];
  cursorRef.current += 1;
  return topic;
}

/**
 * Spawn from left or right edge, traveling mostly horizontally.
 * Optional tiny vertical wobble only — no top/bottom entry or steep headings.
 */
function spawnHorizontal(
  base: Pick<AsteroidBody, "id" | "label">,
  rand: () => number,
  preferOppositeOf?: { vx: number }
): AsteroidBody {
  const speed = SPEED_MIN + rand() * (SPEED_MAX - SPEED_MIN);

  // Recycle: enter from the side opposite the exit direction.
  let fromLeft: boolean;
  if (preferOppositeOf) {
    fromLeft = preferOppositeOf.vx >= 0;
    if (rand() < 0.12) fromLeft = !fromLeft;
  } else {
    fromLeft = rand() < 0.5;
  }

  const x = fromLeft ? -EXIT_LIMIT : EXIT_LIMIT;
  const y = (rand() * 2 - 1) * 0.78;
  const vx = (fromLeft ? 1 : -1) * speed;
  const vy = (rand() - 0.5) * 2 * WOBBLE_MAX;

  return {
    id: base.id,
    label: base.label,
    x,
    y,
    vx,
    vy,
    size: 42 + rand() * 30,
    rotation: rand() * 360,
    spin: (rand() - 0.5) * 56,
    sprite: pickSprite(rand),
  };
}

function buildAsteroids(
  topics: ExploringTopic[],
  cursorRef: { current: number }
): AsteroidBody[] {
  if (topics.length === 0) return [];

  const seed = topics.reduce((sum, t) => sum + hashId(t.id), 0) ^ 0xa5a5;
  const rand = mulberry32(seed);
  const count = Math.min(
    topics.length,
    MIN_ASTEROIDS + Math.floor(rand() * (MAX_ASTEROIDS - MIN_ASTEROIDS + 1))
  );

  cursorRef.current = 0;

  return Array.from({ length: count }, (_, i) => {
    const rockRand = mulberry32(seed * 997 + i * 13 + 1);
    const topic = nextTopic(topics, cursorRef);
    const base = { id: `rock-${i}`, label: topic.label };

    // Seed some mid-field so the first paint isn't empty — still horizontal lanes.
    if (rockRand() < 0.55) {
      const speed = SPEED_MIN + rockRand() * (SPEED_MAX - SPEED_MIN);
      const goRight = rockRand() < 0.5;
      return {
        ...base,
        x: (rockRand() * 2 - 1) * 0.65,
        y: (rockRand() * 2 - 1) * 0.7,
        vx: (goRight ? 1 : -1) * speed,
        vy: (rockRand() - 0.5) * 2 * WOBBLE_MAX,
        size: 42 + rockRand() * 30,
        rotation: rockRand() * 360,
        spin: (rockRand() - 0.5) * 56,
        sprite: pickSprite(rockRand),
      };
    }
    return spawnHorizontal(base, rockRand);
  });
}

function isOffscreen(body: AsteroidBody) {
  return Math.abs(body.x) > EXIT_LIMIT || Math.abs(body.y) > EXIT_LIMIT;
}

function hitSize(size: number) {
  return Math.max(44, size + 10);
}

interface ExploringAsteroidsProps {
  topics: ExploringTopic[];
  hint: string;
}

export function ExploringAsteroids({ topics, hint }: ExploringAsteroidsProps) {
  const reducedMotion = useReducedMotion();

  const topicCursorRef = useRef(0);
  // Roster is structural only — remounted when topics change, never per frame.
  const [roster, setRoster] = useState(() =>
    buildAsteroids(topics, topicCursorRef)
  );
  // Capture label at click so recycle can change body.label without setState.
  const [selected, setSelected] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const bodiesRef = useRef(roster);
  const topicsRef = useRef(topics);
  const fieldRef = useRef<HTMLDivElement>(null);
  const fieldSizeRef = useRef({ w: 1, h: 1 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visualRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const seedRef = useRef(0xc0ffee);
  const selectedIdRef = useRef<string | null>(null);

  topicsRef.current = topics;
  selectedIdRef.current = selected?.id ?? null;

  useEffect(() => {
    const next = buildAsteroids(topics, topicCursorRef);
    bodiesRef.current = next;
    setRoster(next);
    setSelected(null);
  }, [topics]);

  const applyDom = (
    index: number,
    body: AsteroidBody,
    recycled: boolean
  ) => {
    const btn = buttonRefs.current[index];
    const visual = visualRefs.current[index];
    const trail = trailRefs.current[index];
    const img = imgRefs.current[index];
    if (!btn || !visual) return;

    const { w, h } = fieldSizeRef.current;
    const px = ((body.x + 1) / 2) * w;
    const py = ((body.y + 1) / 2) * h;
    const hit = hitSize(body.size);

    // Transform-only motion (no top/left) keeps layers on the compositor.
    btn.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;

    if (recycled) {
      btn.style.width = `${hit}px`;
      btn.style.height = `${hit}px`;
      btn.setAttribute("aria-label", `Learning topic: ${body.label}`);
      visual.style.width = `${body.size}px`;
      visual.style.height = `${body.size}px`;
      if (img) {
        img.src = body.sprite;
        img.width = body.size;
        img.height = body.size;
      }
      if (trail) {
        // Flame sits behind travel: default trails left; flip when going left.
        const facing = body.vx >= 0 ? 1 : -1;
        trail.style.width = `${body.size * 1.15}px`;
        trail.style.height = `${body.size * 0.55}px`;
        trail.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
      }
    }

    visual.style.transform = `translate(-50%, -50%) rotate(${body.rotation}deg)`;
  };

  // Measure playfield + paint initial transforms before first browser paint.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const measure = () => {
      const rect = field.getBoundingClientRect();
      fieldSizeRef.current = {
        w: Math.max(1, rect.width),
        h: Math.max(1, rect.height),
      };
      bodiesRef.current.forEach((body, i) => applyDom(i, body, true));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(field);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyDom closes over latest refs
  }, [roster]);

  // Motion loop: mutate refs + write GPU transforms. No React setState.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const speedScale = reducedMotion ? 0.22 : 1;
    const rand = mulberry32(seedRef.current);

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05) * speedScale;
      last = now;
      const bodies = bodiesRef.current;
      const topicList = topicsRef.current;

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.rotation += body.spin * dt;

        if (isOffscreen(body)) {
          const topic =
            topicList.length > 0
              ? nextTopic(topicList, topicCursorRef)
              : { id: body.id, label: body.label };

          if (selectedIdRef.current === body.id) {
            selectedIdRef.current = null;
            setSelected(null);
          }

          const next = spawnHorizontal(
            { id: body.id, label: topic.label },
            rand,
            { vx: body.vx }
          );
          bodies[i] = next;
          applyDom(i, next, true);
        } else {
          applyDom(i, body, false);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyDom closes over latest refs
  }, [reducedMotion, roster]);

  const dismiss = () => setSelected(null);

  const toggleAsteroid = (index: number) => {
    const body = bodiesRef.current[index];
    if (!body) return;
    setSelected((prev) =>
      prev?.id === body.id
        ? null
        : { id: body.id, label: body.label }
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="mb-4 text-center text-sm text-text-muted">{hint}</p>

      <div
        ref={fieldRef}
        className="relative aspect-[16/9] min-h-[16rem] w-full overflow-hidden bg-transparent sm:aspect-[1.75/1] sm:min-h-[20rem]"
        onClick={dismiss}
        role="region"
        aria-label="Asteroid field of learning topics"
      >
        {roster.map((asteroid, index) => {
          const isSelected = selected?.id === asteroid.id;

          return (
            <button
              key={asteroid.id}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              aria-label={`Learning topic: ${asteroid.label}`}
              aria-expanded={isSelected}
              aria-controls={
                isSelected ? `asteroid-topic-${asteroid.id}` : undefined
              }
              onClick={(e) => {
                e.stopPropagation();
                toggleAsteroid(index);
              }}
              className={
                "absolute left-0 top-0 cursor-pointer border-0 bg-transparent p-0 " +
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue " +
                (isSelected
                  ? "outline outline-2 outline-offset-2 outline-gold"
                  : "")
              }
              style={{ willChange: "transform" }}
            >
              {/* Flame trail — oriented opposite travel; CSS flicker only. */}
              <span
                ref={(el) => {
                  trailRefs.current[index] = el;
                }}
                aria-hidden
                className="asteroid-flame pointer-events-none absolute left-1/2 top-1/2 z-0 block"
              >
                <span className="asteroid-flame-core" />
              </span>

              <span
                ref={(el) => {
                  visualRefs.current[index] = el;
                }}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 z-[1] block"
                style={{ willChange: "transform" }}
              >
                {/* Sprite src/size are set imperatively so click re-renders don't reset recycled rocks. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={(el) => {
                    imgRefs.current[index] = el;
                  }}
                  alt=""
                  draggable={false}
                  decoding="async"
                  className="h-full w-full select-none object-contain"
                />
              </span>
            </button>
          );
        })}

        {selected && (
          <div
            id={`asteroid-topic-${selected.id}`}
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-[min(92%,22rem)] -translate-x-1/2 rounded-none border border-gold/55 bg-surface-navy/95 px-4 py-3 text-center shadow-lg sm:bottom-6"
          >
            <p className="font-readout text-[0.65rem] uppercase tracking-[0.18em] text-silver">
              Currently learning
            </p>
            <p className="mt-1.5 font-display text-base font-semibold leading-snug text-yellow sm:text-lg">
              {selected.label}
            </p>
            <p className="mt-2 text-xs text-text-muted">
              Click the asteroid again or elsewhere to dismiss
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
