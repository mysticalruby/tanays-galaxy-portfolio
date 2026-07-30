"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { planets, projects } from "@/lib/content";
import type { Planet, Project } from "@/types/content";

const MOON_SIZE = 22;
const MOON_ORBIT_STEP = 40;
const MOON_ORBIT_GAP = 28;
const FOCUS_PLANET_SCALE = 3.4;
const SOLAR_STAGE_SIZE = 650;

const SOLAR_VIEWPORT_CLASS =
  "h-[min(55vh,780px)] min-h-[240px] md:h-[min(70vh,860px)] md:min-h-[360px] lg:h-[min(75vh,920px)]";

function computeStageScale(width: number, height: number, stageSize: number) {
  if (width === 0 || height === 0) return 0.55;
  return Math.min(width / stageSize, height / stageSize);
}

function ScaledStage({
  stageSize,
  className = "",
  children,
}: {
  stageSize: number;
  className?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const half = stageSize / 2;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(computeStageScale(width, height, stageSize));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageSize]);

  return (
    <div ref={containerRef} className={className}>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: stageSize,
          height: stageSize,
          marginLeft: -half,
          marginTop: -half,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="pointer-events-auto relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}

function focusStageSize(planet: Planet, projectCount: number) {
  const disc = focusPlanetSize(planet);
  if (projectCount === 0) return Math.max(disc + 80, 280);
  const lastOrbit = moonOrbitRadius(projectCount - 1, disc);
  return Math.ceil((lastOrbit + MOON_SIZE / 2 + 32) * 2);
}

function moonOrbitRadius(index: number, planetDisc: number) {
  const minOrbit = planetDisc / 2 + MOON_SIZE / 2 + MOON_ORBIT_GAP;
  return minOrbit + index * MOON_ORBIT_STEP;
}

function focusPlanetSize(planet: Planet) {
  return Math.max(planet.size * FOCUS_PLANET_SCALE, 128);
}

function shortTitle(title: string) {
  return title.split(":")[0];
}

function orbitDelay(angleDeg: number, durationSec: number) {
  return `${-((angleDeg / 360) * durationSec)}s`;
}

function moonConfig(planetSlug: string, index: number, total: number) {
  const anglePresets: Record<string, number[]> = {
    "research-internships": [72, 252],
    "math-modeling": [20, 55, 90, 125, 160, 200, 240, 285],
    "coding-trading": [64, 238],
    engineering: [48, 168, 288],
    "leadership-community": [40, 160, 280],
  };
  const angles =
    anglePresets[planetSlug] ??
    Array.from({ length: total }, (_, i) => 40 + (i / total) * 280);
  const durations = [13, 18, 23, 28];
  return {
    startAngle: angles[index] ?? (index / Math.max(total, 1)) * 300 + 30,
    duration: durations[index % durations.length],
    reverse: index % 2 === 1,
  };
}

function projectsForPlanet(planet: Planet) {
  return planet.projectSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
}

function MoonOrbit({
  project,
  planetSlug,
  index,
  total,
  orbitRadius,
  onHover,
  onLeave,
  onSelect,
}: {
  project: Project;
  planetSlug: string;
  index: number;
  total: number;
  orbitRadius: number;
  onHover: (p: Project | null) => void;
  onLeave: () => void;
  onSelect: (slug: string) => void;
}) {
  const { startAngle, duration, reverse } = moonConfig(planetSlug, index, total);
  const spinClass = reverse ? "orbit-spin-reverse" : "orbit-spin";

  return (
    <div
      className={`${spinClass} pointer-events-none absolute left-1/2 top-1/2`}
      style={
        {
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          marginLeft: -orbitRadius,
          marginTop: -orbitRadius,
          "--orbit-duration": `${duration}s`,
          "--orbit-delay": orbitDelay(startAngle, duration),
        } as CSSProperties
      }
    >
      <button
        type="button"
        className="pointer-events-auto absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full border-2 border-silver/60 bg-white shadow-[0_0_10px_#ffffff55] hover:border-blue hover:ring-2 hover:ring-blue/40"
        style={{ width: MOON_SIZE, height: MOON_SIZE }}
        aria-label={`${shortTitle(project.title)}: ${project.summary}`}
        onMouseEnter={() => onHover(project)}
        onMouseLeave={() => onLeave()}
        onFocus={() => onHover(project)}
        onBlur={() => onLeave()}
        onClick={() => onSelect(project.slug)}
      />
    </div>
  );
}

function PlanetFocusView({
  planet,
  planetProjects,
  onBack,
}: {
  planet: Planet;
  planetProjects: Project[];
  onBack: () => void;
}) {
  const router = useRouter();
  const [hoveredMoon, setHoveredMoon] = useState<Project | null>(null);
  const planetDisc = focusPlanetSize(planet);

  return (
    <div className={`relative w-full ${SOLAR_VIEWPORT_CLASS}`}>
      <button
        type="button"
        onClick={onBack}
        className="absolute left-2 top-2 z-20 rounded-md border border-silver/30 bg-surface-navy px-4 py-2 text-sm text-text-muted hover:border-blue hover:text-blue"
      >
        ← Back to solar system
      </button>

      <div className="absolute inset-x-0 top-12 bottom-[5.75rem]">
        <ScaledStage
          stageSize={focusStageSize(planet, planetProjects.length)}
          className="relative h-full w-full"
        >
          {planetProjects.map((_, i) => {
            const r = moonOrbitRadius(i, planetDisc);
            const ringSize = r * 2 + MOON_SIZE;
            return (
              <div
                key={`ring-${i}`}
                className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-silver/12"
                style={{
                  width: ringSize,
                  height: ringSize,
                  marginLeft: -ringSize / 2,
                  marginTop: -ringSize / 2,
                }}
                aria-hidden
              />
            );
          })}

          <div
            className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] text-center shadow-lg"
            style={{
              width: planetDisc,
              height: planetDisc,
              borderColor: planet.color,
              backgroundColor: `${planet.color}40`,
              boxShadow: `0 0 48px ${planet.color}55, inset 0 0 24px ${planet.color}22`,
            }}
          >
            <span className="max-w-[85%] font-display text-base font-semibold leading-snug text-text-primary sm:text-lg">
              {planet.name}
            </span>
          </div>

          {planetProjects.map((proj, i) => (
            <MoonOrbit
              key={proj.slug}
              project={proj}
              planetSlug={planet.slug}
              index={i}
              total={planetProjects.length}
              orbitRadius={moonOrbitRadius(i, planetDisc)}
              onHover={setHoveredMoon}
              onLeave={() => setHoveredMoon(null)}
              onSelect={(slug) => router.push(`/experience/${slug}`)}
            />
          ))}
        </ScaledStage>
      </div>

      {hoveredMoon && (
        <div
          className="pointer-events-none absolute bottom-28 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-lg border border-blue/40 bg-surface-navy px-4 py-3 text-center shadow-xl"
          role="tooltip"
        >
          <p className="font-display text-sm font-semibold text-blue">
            {shortTitle(hoveredMoon.title)}
          </p>
          <p className="mt-1 text-xs text-text-muted">{hoveredMoon.summary}</p>
          <p className="mt-2 text-xs text-gold">Click to open experience →</p>
        </div>
      )}

      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-silver/15 bg-bg-deep/70 px-4 py-4 text-center backdrop-blur-sm">
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-text-muted">
          {planet.description}
        </p>
        <p className="mt-2 text-xs text-silver/80">
          Tap a moon for summary · Open full experience page
        </p>
      </footer>
    </div>
  );
}

function SolarSystemView({
  focusedSlug,
  onFocusPlanet,
  onBack,
}: {
  focusedSlug: string | null;
  onFocusPlanet: (slug: string) => void;
  onBack: () => void;
}) {
  const focusedPlanet = focusedSlug
    ? planets.find((p) => p.slug === focusedSlug)
    : null;

  if (focusedPlanet) {
    return (
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-silver/20 bg-surface-navy/40 backdrop-blur-sm">
        <PlanetFocusView
          planet={focusedPlanet}
          planetProjects={projectsForPlanet(focusedPlanet)}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-silver/20 bg-surface-navy/40 backdrop-blur-sm ${SOLAR_VIEWPORT_CLASS}`}
      >
        <ScaledStage stageSize={SOLAR_STAGE_SIZE} className="relative h-full w-full">
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow/25 ring-2 ring-yellow/60 sm:h-20 sm:w-20"
              style={{ boxShadow: "0 0 40px #F4D03F55" }}
            >
              <span className="font-readout text-[0.6rem] font-bold text-yellow sm:text-xs">
                SUN
              </span>
            </div>
          </div>

          {planets.map((planet, i) => {
            const r = planet.orbitRadius;
            const startAngle = planet.startAngle;
            const duration = planet.orbitDuration;

            return (
              <div key={planet.slug}>
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-silver/10"
                  style={{
                    width: r * 2,
                    height: r * 2,
                    marginLeft: -r,
                    marginTop: -r,
                  }}
                  aria-hidden
                />

                <div
                  className="orbit-spin pointer-events-none absolute left-1/2 top-1/2"
                  style={
                    {
                      width: r * 2,
                      height: r * 2,
                      marginLeft: -r,
                      marginTop: -r,
                      zIndex: 20 - i,
                      "--orbit-duration": `${duration}s`,
                      "--orbit-delay": orbitDelay(startAngle, duration),
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="pointer-events-auto absolute left-1/2 top-0 z-10 flex -translate-x-1/2 flex-col items-center justify-center rounded-full border-2 text-center transition hover:scale-110 hover:ring-2 hover:ring-blue/50"
                    style={{
                      width: planet.size,
                      height: planet.size,
                      borderColor: planet.color,
                      backgroundColor: `${planet.color}33`,
                    }}
                    aria-label={`${planet.name}: ${planet.description}. Click to zoom in.`}
                    onClick={() => onFocusPlanet(planet.slug)}
                  >
                    <span
                      className="orbit-spin-reverse inline-block px-1 font-readout text-[0.55rem] font-semibold leading-tight text-text-primary"
                      style={
                        {
                          "--orbit-duration": `${duration}s`,
                          "--orbit-delay": orbitDelay(startAngle, duration),
                        } as CSSProperties
                      }
                    >
                      {planet.name.split(" ")[0]}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </ScaledStage>
      </div>
      <p className="mt-3 text-center text-sm text-text-muted">
        Tap a planet to zoom in · Moons link to full experience pages
      </p>
    </div>
  );
}

function CategoryCard({
  planet,
  selected,
  onSelect,
}: {
  planet: Planet;
  selected: boolean;
  onSelect: () => void;
}) {
  const count = planet.projectSlugs.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border bg-surface-navy p-5 text-left transition-colors hover:border-blue/50 ${
        selected ? "border-blue ring-1 ring-blue/30" : "border-silver/25"
      }`}
      style={{ borderLeftColor: planet.color, borderLeftWidth: 4 }}
    >
      <h3 className="font-display font-semibold" style={{ color: planet.color }}>
        {planet.name}
      </h3>
      <p className="mt-1 text-sm text-text-muted">{planet.description}</p>
      <p className="mt-3 text-xs text-silver">
        {count} experience{count === 1 ? "" : "s"}
      </p>
    </button>
  );
}

function ExperienceIndex({
  focusedSlug,
  onFocusPlanet,
}: {
  focusedSlug: string | null;
  onFocusPlanet: (slug: string | null) => void;
}) {
  const focusedPlanet = focusedSlug
    ? planets.find((p) => p.slug === focusedSlug)
    : null;
  const focusedProjects = focusedPlanet
    ? projectsForPlanet(focusedPlanet)
    : [];

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold text-text-primary">
        Experience index
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        {focusedPlanet
          ? `Browsing ${focusedPlanet.name} — pick another category or open an experience below.`
          : "Choose a category to explore experiences in that cluster."}
      </p>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Experience categories"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!focusedSlug}
          onClick={() => onFocusPlanet(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            !focusedSlug
              ? "border-blue bg-blue/15 text-blue"
              : "border-silver/30 text-text-muted hover:border-silver/50"
          }`}
        >
          All categories
        </button>
        {planets.map((planet) => (
          <button
            key={planet.slug}
            type="button"
            role="tab"
            aria-selected={focusedSlug === planet.slug}
            onClick={() => onFocusPlanet(planet.slug)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              focusedSlug === planet.slug
                ? "border-blue bg-blue/15 text-text-primary"
                : "border-silver/30 text-text-muted hover:border-silver/50"
            }`}
            style={
              focusedSlug === planet.slug
                ? { borderColor: planet.color, color: planet.color }
                : undefined
            }
          >
            {planet.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!focusedPlanet ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {planets.map((planet) => (
              <CategoryCard
                key={planet.slug}
                planet={planet}
                selected={false}
                onSelect={() => onFocusPlanet(planet.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {focusedProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ExperienceExplorer() {
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);

  return (
    <>
      <SolarSystemView
        focusedSlug={focusedSlug}
        onFocusPlanet={setFocusedSlug}
        onBack={() => setFocusedSlug(null)}
      />
      <ExperienceIndex
        focusedSlug={focusedSlug}
        onFocusPlanet={setFocusedSlug}
      />
    </>
  );
}
