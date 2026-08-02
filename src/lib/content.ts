import siteData from "../../content/site.json";
import hotspotsData from "../../content/hotspots.json";
import planetsData from "../../content/planets.json";
import projectsData from "../../content/projects.json";
import skillsData from "../../content/skills.json";
import awardsData from "../../content/awards.json";
import buildProcessData from "../../content/build-process.json";
import exploringData from "../../content/exploring.json";
import resumeData from "../../content/resume.json";
import aboutData from "../../content/about.json";
import type {
  Award,
  Hotspot,
  Planet,
  Project,
  ProjectWalkthrough,
  SkillCategoryGroup,
  SkillItem,
  BuildProcessStep,
} from "@/types/content";

export const site = siteData;
export const hotspots = hotspotsData.hotspots as Hotspot[];
export const rocketImage = {
  width: hotspotsData.imageWidth,
  height: hotspotsData.imageHeight,
  src: hotspotsData.imageSrc,
};
export const planets = planetsData.planets as Planet[];
export const projects = projectsData.projects as Project[];
export const skillCategories = skillsData.categories as SkillCategoryGroup[];
export const skillsIntro = skillsData.intro;
export const allSkills: SkillItem[] = skillCategories.flatMap((c) => c.skills);
export const awards = awardsData.awards as Award[];
export const awardsIntro = awardsData.intro;
export const constellations = awardsData.constellations as string[];
export const featuredAwardIds = awardsData.featuredAwardIds as string[];
export const buildProcess = buildProcessData;
export const projectWalkthroughs =
  buildProcessData.projectWalkthroughs as ProjectWalkthrough[];
export const exploring = exploringData;
export const resume = resumeData;
export const aboutGalleries = aboutData.galleriesSection;

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getWalkthroughBySlug(
  slug: string,
): ProjectWalkthrough | undefined {
  return projectWalkthroughs.find((w) => w.slug === slug);
}

export function getProjectsByCluster(clusterSlug: string): Project[] {
  return projects.filter((p) => p.clusterSlug === clusterSlug);
}

export function getSkillCategoryById(id: string): SkillCategoryGroup | undefined {
  return skillCategories.find((c) => c.id === id);
}

export function getSkillById(id: string): SkillItem | undefined {
  return allSkills.find((s) => s.id === id);
}

export function getAwardsByConstellation(name: string): Award[] {
  return awards.filter((a) => a.constellation === name);
}

export function getFeaturedAwards(): Award[] {
  return featuredAwardIds
    .map((id) => awards.find((a) => a.id === id))
    .filter((a): a is Award => Boolean(a));
}

export type { BuildProcessStep };
