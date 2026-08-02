/**
 * CAD part names → portfolio routes.
 *
 * Three.js sanitizes node names on load (spaces → underscores), so keys
 * use underscores to match loaded object names (e.g. "Part 79" → "Part_79").
 *
 * Overlaps: ranges are applied in order; later assignments overwrite earlier
 * ones for the same key (About wins over Experience for Part 14–18).
 */

export type RocketRouteLabel =
  | "Experience"
  | "Awards"
  | "Skills"
  | "Currently Exploring"
  | "Contact Me"
  | "About Me";

export interface RocketPartDestination {
  href: string;
  label: RocketRouteLabel;
}

function partNameVariants(n: number): string[] {
  return [`Part_${n}`, `Part_${n}__Part_${n}`];
}

function addRange(
  map: Record<string, RocketPartDestination>,
  start: number,
  end: number,
  dest: RocketPartDestination,
) {
  for (let n = start; n <= end; n++) {
    partNameVariants(n).forEach((name) => {
      map[name] = dest;
    });
  }
}

const experience: RocketPartDestination = {
  href: "/experience",
  label: "Experience",
};
const awards: RocketPartDestination = { href: "/awards", label: "Awards" };
const skills: RocketPartDestination = { href: "/skills", label: "Skills" };
const exploring: RocketPartDestination = {
  href: "/exploring",
  label: "Currently Exploring",
};
const contact: RocketPartDestination = {
  href: "/contact",
  label: "Contact Me",
};
const about: RocketPartDestination = { href: "/about", label: "About Me" };

function buildPartLinks(): Record<string, RocketPartDestination> {
  const map: Record<string, RocketPartDestination> = {};

  // Experience (was "Projects" in rocket-site)
  addRange(map, 10, 18, experience);
  addRange(map, 191, 199, experience);

  // Awards
  addRange(map, 77, 117, awards);

  // Skills
  addRange(map, 69, 76, skills);
  addRange(map, 184, 190, skills);
  addRange(map, 200, 208, skills);
  map.Part_1 = skills;

  // Currently Exploring
  addRange(map, 118, 126, exploring);

  // Contact Me
  addRange(map, 127, 158, contact);
  map.Alien = contact;

  // About Me (applied last so it wins overlaps, e.g. Part 14–18)
  addRange(map, 14, 20, about);
  [
    "Part_1",
    "Part_2",
    "Part_3",
    "Part_4",
    "Part_5",
    "Part_6",
    "Part_7",
    "Part_8",
    "Part_10",
    "Part_11",
    "Part_12",
    "Part_13",
  ].forEach((base) => {
    map[`${base}__${base}`] = about;
  });
  map.Solid1__Solid1 = about;

  return map;
}

export const rocketPartLinks = buildPartLinks();

export const ROCKET_MODEL_SRC = "/rocketfront.glb";
