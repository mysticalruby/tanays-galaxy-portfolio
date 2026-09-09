export type ProjectStatus = "completed" | "collection" | "planned" | "ongoing";
export type ExperienceKind = "project" | "experience";

export interface Project {
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  status: ProjectStatus;
  kind?: ExperienceKind;
  organization?: string;
  employmentType?: string;
  location?: string;
  dateRange?: string;
  cluster: string;
  clusterSlug: string;
  tags: string[];
  opening: string;
  problem: string;
  role: string;
  methods: string[];
  results: string;
  learned: string;
  placeholders: string[];
  /** Optional real photos shown as hero + technical evidence */
  images?: { src: string; alt: string; caption?: string }[];
  skills: string[];
  relatedProjects?: string[];
  /** Optional research PDFs shown with an in-page pdf.js viewer */
  papers?: {
    src: string;
    title: string;
    label?: string;
    /** CSS aspect-ratio for the viewer frame, e.g. "3 / 2" for landscape posters */
    aspectRatio?: string;
    /** Let a landscape or featured document span both columns in the document grid. */
    fullWidth?: boolean;
  }[];
  /** Display project documents in two columns on wider screens. */
  paperGrid?: boolean;
  /** Shorthand for a single paper — prefer `papers` for multiple PDFs */
  paperUrl?: string;
  paperLabel?: string;
  /** Optional external project / org website */
  websiteUrl?: string;
  websiteLabel?: string;
  /** Extra outbound links (GitHub, live demo, etc.) */
  links?: { href: string; label: string; note?: string }[];
  /** People who worked on the project with Tanay. */
  collaborators?: { name: string; href?: string }[];
  safetyNote?: string;
  needsVerification?: string[];
}

export interface Planet {
  slug: string;
  name: string;
  description: string;
  color: string;
  /** Real celestial PNG under /images/celestial/ */
  imageSrc?: string;
  projectSlugs: string[];
  orbitRadius: number;
  orbitDuration: number;
  startAngle: number;
  size: number;
}

export interface SkillItem {
  id: string;
  name: string;
  meaning: string;
  evidence: string[];
  growing: string;
  level: "developing" | "applied" | "recurring";
  projectSlugs: string[];
}

export interface SkillCategoryGroup {
  id: string;
  name: string;
  meaning: string;
  growing: string;
  skills: SkillItem[];
}

/** @deprecated Use SkillCategoryGroup — kept as alias for gradual migration */
export type SkillCategory = SkillItem;

export interface Award {
  id: string;
  name: string;
  organization: string;
  year?: string;
  description: string;
  constellation: string;
  verified: boolean;
  /** 0 = common, 1 = rare (horizontal axis) */
  rarity: number;
  /** 0 = less technical, 1 = more technical (vertical axis) */
  technical: number;
  starColor: string;
  starSize: number;
}

export interface Hotspot {
  id: string;
  label: string;
  tooltip: string;
  type: "link";
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuildProcessStep {
  title: string;
  description: string;
}

export interface ProjectWalkthrough {
  slug: string;
  title: string;
  href: string;
  category: string;
  categorySlug: string;
  cells: string[];
}

export interface ExploringTopic {
  id: string;
  label: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface GalleryItem {
  id: string;
  caption: string;
  placeholder?: string;
  embedUrl?: string;
  embedTitle?: string;
  imageSrc?: string;
}

export interface AboutGallery {
  id: string;
  title: string;
  description: string;
  relatedHref: string | null;
  relatedLabel: string | null;
  items: GalleryItem[];
}

export interface GalleriesSection {
  title: string;
  intro: string;
  galleries: AboutGallery[];
}
