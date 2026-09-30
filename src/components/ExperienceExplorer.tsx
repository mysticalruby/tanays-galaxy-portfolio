"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CelestialSphere } from "@/components/CelestialSphere";
import { ProjectCard } from "@/components/ProjectCard";
import { planets, projects } from "@/lib/content";
import type { Planet, Project } from "@/types/content";

const MOON_SIZE = 34;
const MOON_ORBIT_STEP = 80;
const MOON_ORBIT_GAP = 35;
const FOCUS_PLANET_SCALE = 4.8;
const SOLAR_STAGE_SIZE = 730;
const SOLAR_ORBIT_TILT = 0.48;
const MOON_ORBIT_TILT = 0.72;
const SOLAR_VIEWPORT_CLASS =
  "h-[min(78vh,780px)] min-h-[400px] md:h-[min(75vh,860px)] md:min-h-[500px] lg:h-[min(80vh,920px)]";

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
  const minOrbit = (planetDisc / 2 + MOON_SIZE / 2 + MOON_ORBIT_GAP) / MOON_ORBIT_TILT;
  return minOrbit + Math.floor(index / 3) * MOON_ORBIT_STEP;
}

function focusPlanetSize(planet: Planet) {
  return Math.max(planet.size * FOCUS_PLANET_SCALE, 128);
}

function shortTitle(title: string) {
  return title.split(":")[0];
}

function planetKind(planet: Planet) {
  const imageName = planet.imageSrc?.split("/").pop()?.split(".")[0]?.toLowerCase();
  if (imageName === "mercury" || imageName === "venus" || imageName === "mars" || imageName === "jupiter" || imageName === "neptune") {
    return imageName;
  }
  return "earth";
}

function OrbitingBody({
  radius,
  tilt,
  duration,
  startAngle,
  size,
  frontLayer,
  backLayer,
  children,
}: {
  radius: number;
  tilt: number;
  duration: number;
  startAngle: number;
  size: number;
  frontLayer: number;
  backLayer: number;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let frame = 0;
    const started = performance.now();
    const animate = (now: number) => {
      // Viewed from above the orbital plane, every category travels prograde.
      const angle = ((startAngle - ((now - started) / 1000) * (360 / duration)) * Math.PI) / 180;
      const x = Math.sin(angle) * radius;
      const y = -Math.cos(angle) * radius * tilt;
      const depth = (1 + Math.cos(angle)) / 2;
      body.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${0.76 + depth * 0.4})`;
      body.style.zIndex = String(y > 0 ? frontLayer : backLayer);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [radius, tilt, duration, startAngle, frontLayer, backLayer]);

  return (
    <div
      ref={bodyRef}
      className="pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      {children}
    </div>
  );
}

function OrbitRing({ radius, tilt, opacity = 0.72 }: { radius: number; tilt: number; opacity?: number }) {
  return (
    <div
      className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 border border-white"
      style={{
        width: radius * 2,
        height: radius * 2 * tilt,
        marginLeft: -radius,
        marginTop: -radius * tilt,
        opacity,
        boxShadow: "0 0 7px rgba(244, 246, 251, 0.13)",
      }}
      aria-hidden
    />
  );
}

function moonConfig(planetSlug: string, index: number, total: number) {
  const anglePresets: Record<string, number[]> = {
    "research-internships": [72, 252],
    "math-modeling": [20, 140, 260, 75, 195, 315, 120, 300],
    "coding-trading": [64, 238],
    engineering: [48, 168, 288],
    "leadership-community": [40, 160, 280],
  };
  const angles =
    anglePresets[planetSlug] ??
    Array.from({ length: total }, (_, i) => 40 + (i / total) * 280);
  const ringIndex = Math.floor(index / 3);
  const durations = [17, 24, 31];
  return {
    startAngle: angles[index] ?? (index / Math.max(total, 1)) * 300 + 30,
    duration: durations[ringIndex % durations.length],
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
  const { startAngle, duration } = moonConfig(planetSlug, index, total);
  return (
    <OrbitingBody
      radius={orbitRadius}
      tilt={MOON_ORBIT_TILT}
      duration={duration}
      startAngle={startAngle}
      size={MOON_SIZE}
      frontLayer={30}
      backLayer={10}
    >
      <button
        type="button"
        className="pointer-events-auto block h-full w-full overflow-visible border-0 bg-transparent p-0 transition hover:scale-110"
        style={{ width: MOON_SIZE, height: MOON_SIZE }}
        aria-label={`${shortTitle(project.title)}: ${project.summary}`}
        onMouseEnter={() => onHover(project)}
        onMouseLeave={() => onLeave()}
        onFocus={() => onHover(project)}
        onBlur={() => onLeave()}
        onClick={() => onSelect(project.slug)}
      >
        <CelestialSphere kind="moon" className="drop-shadow-[0_0_8px_rgba(199,205,230,0.45)]" />
      </button>
    </OrbitingBody>
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
    <div className="relative h-[min(85vh,800px)] min-h-[560px] w-full md:h-[min(80vh,920px)] md:min-h-[620px]">
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
          {[...new Set(planetProjects.map((_, i) => moonOrbitRadius(i, planetDisc)))].map((r) => (
            <OrbitRing key={`ring-${r}`} radius={r} tilt={MOON_ORBIT_TILT} opacity={0.87} />
          ))}

          <div
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ width: planetDisc, height: planetDisc }}
          >
            <CelestialSphere kind={planetKind(planet)} interactive className="drop-shadow-[0_0_28px_rgba(18,39,90,0.45)]" />
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
          Drag the planet to turn it · Tap a moon to open a project
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
            <div className="relative h-28 w-28">
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-gold/15 blur-2xl" />
              <CelestialSphere kind="sun" className="relative drop-shadow-[0_0_28px_rgba(255,182,59,0.85)]" />
            </div>
          </div>

          {planets.map((planet) => {
            const r = planet.orbitRadius;
            const startAngle = planet.startAngle;
            const duration = planet.orbitDuration;

            return (
              <div key={planet.slug}>
                <OrbitRing radius={r} tilt={SOLAR_ORBIT_TILT} opacity={0.72} />

                <OrbitingBody
                  radius={r}
                  tilt={SOLAR_ORBIT_TILT}
                  duration={duration}
                  startAngle={startAngle}
                  size={planet.size * 1.1}
                  frontLayer={30}
                  backLayer={5}
                >
                  <button
                    type="button"
                    className="pointer-events-auto block h-full w-full border-0 bg-transparent p-0 transition hover:scale-110"
                    style={{ width: planet.size * 1.1, height: planet.size * 1.1 }}
                    aria-label={`${planet.name}: ${planet.description}. Click to zoom in.`}
                    title={planet.name}
                    onMouseEnter={() => setHoveredPlanet(planet)}
                    onMouseLeave={() => setHoveredPlanet(null)}
                    onFocus={() => setHoveredPlanet(planet)}
                    onBlur={() => setHoveredPlanet(null)}
                    onClick={() => onFocusPlanet(planet.slug)}
                  >
                    <CelestialSphere kind={planetKind(planet)} className="drop-shadow-[0_0_14px_rgba(18,39,90,0.4)]" />
                  </button>
                </OrbitingBody>
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
        Planets orbit the sun · Tap one to see its projects
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
      <div className="bg-surface-navy p-5 sm:p-6">
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
              ? "border-blue bg-surface-navy text-blue"
              : "border-white/15 bg-surface-navy text-text-muted hover:text-blue"
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
                ? "border-blue bg-surface-navy text-text-primary"
                : "border-white/15 bg-surface-navy text-text-muted hover:text-blue"
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
      <p className="mt-12 text-center font-mono text-[10px] text-text-muted">
        Planet maps by <a className="underline hover:text-gold" href="https://edu.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer">Solar System Scope</a> · <a className="underline hover:text-gold" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>
      </p>
    </>
  );
}
