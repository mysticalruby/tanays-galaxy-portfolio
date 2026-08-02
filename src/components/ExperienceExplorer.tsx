"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { planets, projects } from "@/lib/content";
import type { Planet, Project } from "@/types/content";

const MOON_SIZE = 34;
const MOON_ORBIT_STEP = 44;
const MOON_ORBIT_GAP = 28;
const FOCUS_PLANET_SCALE = 3.4;
const SOLAR_STAGE_SIZE = 650;
const MOON_IMAGES = [
  "/images/celestial/Moon1.png",
  "/images/celestial/Moon2.png",
  "/images/celestial/Moon3.png",
  "/images/celestial/Moon4.png",
  "/images/celestial/Moon5.png",
  "/images/celestial/Moon6.png",
  "/images/celestial/Moon7.png",
];
const SUN_IMAGE = "/images/celestial/sun.png";

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
        className="pointer-events-auto absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 overflow-visible border-0 bg-transparent p-0 transition hover:scale-110"
        style={{ width: MOON_SIZE, height: MOON_SIZE }}
        aria-label={`${shortTitle(project.title)}: ${project.summary}`}
        onMouseEnter={() => onHover(project)}
        onMouseLeave={() => onLeave()}
        onFocus={() => onHover(project)}
        onBlur={() => onLeave()}
        onClick={() => onSelect(project.slug)}
      >
        <Image
          src={MOON_IMAGES[index % MOON_IMAGES.length]}
          alt=""
          width={MOON_SIZE}
          height={MOON_SIZE}
          className="celestial-disc h-full w-full object-contain drop-shadow-[0_0_8px_rgba(192,197,206,0.45)]"
          draggable={false}
        />
      </button>
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
        className="absolute left-2 top-2 z-20 rounded-none border border-silver/40 bg-surface-navy px-4 py-2 text-sm text-text-muted hover:border-blue hover:text-blue"
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
            const ringSize = r * 2;
            return (
              <div
                key={`ring-${i}`}
                className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 border border-dashed border-silver/25"
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
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ width: planetDisc, height: planetDisc }}
          >
            {planet.imageSrc ? (
              <Image
                src={planet.imageSrc}
                alt={planet.name}
                width={planetDisc}
                height={planetDisc}
                className="celestial-disc h-full w-full object-contain drop-shadow-[0_0_28px_rgba(74,159,212,0.35)]"
                priority
                draggable={false}
              />
            ) : (
              <div
                className="celestial-disc flex h-full w-full items-center justify-center border-[3px] text-center"
                style={{
                  borderColor: planet.color,
                  backgroundColor: `${planet.color}40`,
                }}
              >
                <span className="max-w-[85%] font-display text-base font-semibold leading-snug text-text-primary sm:text-lg">
                  {planet.name}
                </span>
              </div>
            )}
            <span className="pointer-events-none absolute inset-x-0 -bottom-8 text-center font-display text-sm font-semibold text-text-primary sm:text-base">
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
          className="pointer-events-none absolute bottom-28 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-none border border-blue/50 bg-surface-navy px-4 py-3 text-center shadow-xl"
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
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const focusedPlanet = focusedSlug
    ? planets.find((p) => p.slug === focusedSlug)
    : null;

  if (focusedPlanet) {
    return (
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden">
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
        className={`relative mx-auto w-full max-w-6xl overflow-visible ${SOLAR_VIEWPORT_CLASS}`}
      >
        <ScaledStage stageSize={SOLAR_STAGE_SIZE} className="relative h-full w-full">
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              <Image
                src={SUN_IMAGE}
                alt="Sun — home / overview"
                width={96}
                height={96}
                className="celestial-disc h-full w-full object-contain drop-shadow-[0_0_32px_rgba(244,208,63,0.45)]"
                priority
                draggable={false}
              />
            </div>
          </div>

          {planets.map((planet, i) => {
            const r = planet.orbitRadius;
            const startAngle = planet.startAngle;
            const duration = planet.orbitDuration;

            return (
              <div key={planet.slug}>
                <div
                  className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 border border-silver/25"
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
                    className="pointer-events-auto absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 transition hover:scale-110"
                    style={{ width: planet.size, height: planet.size }}
                    aria-label={`${planet.name}: ${planet.description}. Click to zoom in.`}
                    title={planet.name}
                    onMouseEnter={() => setHoveredPlanet(planet)}
                    onMouseLeave={() => setHoveredPlanet(null)}
                    onFocus={() => setHoveredPlanet(planet)}
                    onBlur={() => setHoveredPlanet(null)}
                    onClick={() => onFocusPlanet(planet.slug)}
                  >
                    {planet.imageSrc ? (
                      <Image
                        src={planet.imageSrc}
                        alt={planet.name}
                        width={planet.size}
                        height={planet.size}
                        className="celestial-disc h-full w-full object-contain drop-shadow-[0_0_14px_rgba(74,159,212,0.4)]"
                        draggable={false}
                      />
                    ) : (
                      <span
                        className="celestial-disc block h-full w-full border-2"
                        style={{
                          borderColor: planet.color,
                          backgroundColor: `${planet.color}33`,
                        }}
                      />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </ScaledStage>

        {hoveredPlanet && (
          <div
            className="pointer-events-none absolute bottom-4 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-none border border-blue/50 bg-surface-navy/95 px-4 py-3 text-center shadow-xl"
            role="tooltip"
          >
            <p className="font-display text-sm font-semibold text-blue">
              {hoveredPlanet.name}
            </p>
            <p className="mt-1 text-xs text-text-muted">{hoveredPlanet.description}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-text-muted">
        Hover a planet for its name · Tap to zoom in · Moons link to experiences
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
      className={`group w-full border border-white/10 p-[1px] text-left transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        selected ? "border-blue/50" : "hover:border-blue/35"
      }`}
    >
      <div className="bg-black p-5 sm:p-6">
        <h3
          className="font-display text-lg font-semibold tracking-tight transition-colors"
          style={{ color: selected ? undefined : planet.color }}
        >
          <span className={selected ? "text-blue" : undefined}>{planet.name}</span>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {planet.description}
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-silver">
          {count} experience{count === 1 ? "" : "s"}
        </p>
      </div>
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
          className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
            !focusedSlug
              ? "border-blue bg-black text-blue"
              : "border-white/15 bg-black text-text-muted hover:text-blue"
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
            className={`rounded-none border px-4 py-2 text-sm font-medium transition-colors ${
              focusedSlug === planet.slug
                ? "border-blue bg-black text-text-primary"
                : "border-white/15 bg-black text-text-muted hover:text-blue"
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
