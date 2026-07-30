import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectsPath = join(root, "content", "projects.json");
const skillsPath = join(root, "content", "skills.json");

const projectSkills = {
  articulate: [
    "Artificial Intelligence (AI)",
    "API Development",
    "Machine Learning",
    "Teamwork",
    "Assistive Technology",
    "Python (Programming Language)",
    "Documentation",
    "Public Speaking",
    "Natural Language Processing (NLP)",
    "Hugging Face Products",
    "Whisper",
    "User-centered Design",
    "Transformers",
  ],
  "gvs-balance-glasses": [
    "Structural Analysis",
    "Galvanic Vestibular Stimulation",
    "Experimental Design",
    "Poster Design",
    "Ergonomics",
    "Engineering Drawings",
    "Teamwork",
    "Data Collection",
    "Printed Circuit Board (PCB) Design",
    "Computer-Aided Design (CAD)",
    "Documentation",
    "Embedded Systems",
    "Onshape",
    "Public Speaking",
    "User-centered Design",
    "Prototyping",
    "Wearable Technology",
  ],
  "imc-prosperity-trading": [
    "Optimization",
    "Teamwork",
    "Python (Programming Language)",
    "Data Analysis",
    "Team Leadership",
    "Numerical Simulation",
  ],
  "autonomous-vehicles-boston-emissions": [
    "Research Writing",
    "Teamwork",
    "Data Collection",
    "Python (Programming Language)",
    "Documentation",
    "Resource Allocation",
    "Data Analysis",
    "Mathematical Modeling",
    "Graph Theory",
    "Data Visualization",
    "LaTeX",
    "Diffusion",
  ],
  "etosha-wildlife-optimization": [
    "Research Writing",
    "Optimization",
    "Teamwork",
    "Python (Programming Language)",
    "Documentation",
    "Resource Allocation",
    "Data Analysis",
    "Mathematical Modeling",
    "Conservation Modeling",
    "Data Visualization",
    "LaTeX",
    "Spatial Analysis",
    "GIS-Style Mapping",
    "Numerical Simulation",
  ],
  "m3c-sports-gambling": [
    "Research Writing",
    "Machine Learning",
    "Teamwork",
    "Stochastic Processes",
    "Python (Programming Language)",
    "Documentation",
    "Monte Carlo Simulation",
    "Data Analysis",
    "Mathematical Modeling",
    "Regression Analysis",
    "Network Theory",
    "Financial Modeling",
    "Prototyping",
    "LaTeX",
  ],
  "flo-wrist": [
    "Structural Analysis",
    "Experimental Design",
    "Engineering Design",
    "Ergonomics",
    "Engineering Drawings",
    "Computer-Aided Design (CAD)",
    "Documentation",
    "Embedded Systems",
    "Onshape",
    "Data Analysis",
    "Public Speaking",
    "Electric Circuits",
    "Wearable Technology",
  ],
  "hiemcm-evacuation-sweep": [
    "Multi-agent Systems",
    "Research Writing",
    "Optimization",
    "Teamwork",
    "Python (Programming Language)",
    "Documentation",
    "Mathematical Modeling",
    "Graph Theory",
    "Data Visualization",
    "Algorithms",
    "Dynamic Systems",
    "LaTeX",
    "Numerical Simulation",
  ],
  "penny-phase-out-model": [
    "Research Writing",
    "Teamwork",
    "Data Collection",
    "Python (Programming Language)",
    "Probabilistic Models",
    "Monte Carlo Simulation",
    "Data Analysis",
    "Mathematical Modeling",
    "Financial Modeling",
    "Dynamic Systems",
    "LaTeX",
  ],
  "himcm-graph-diffusion": [
    "Research Writing",
    "Optimization",
    "Data Collection",
    "Python (Programming Language)",
    "Resource Allocation",
    "Data Analysis",
    "Mathematical Modeling",
    "Graph Theory",
    "Conservation Modeling",
    "Network Theory",
    "Data Visualization",
    "LaTeX",
    "Spatial Analysis",
    "GIS-Style Mapping",
    "Diffusion",
  ],
  "fem-quantum-harmonic-oscillator": [
    "Mathematical Modeling",
    "Numerical Simulation",
    "Scientific Computing",
    "Documentation",
    "LaTeX",
    "Data Visualization",
  ],
  "robotics-design-manufacturing": [
    "Prototyping",
    "Engineering Drawings",
    "Engineering Design",
    "Knee Mill",
    "Structural Analysis",
    "Documentation",
    "Computer-Aided Design (CAD)",
    "Teamwork",
    "Milling",
    "Onshape",
    "Experimental Design",
  ],
  "wpi-metal-am-research-intern": [
    "COMSOL",
    "Numerical Simulation",
    "Data Analysis",
    "Research Writing",
  ],
  "wpi-computational-physics-intern": [
    "Computational Physics",
    "Mathematical Modeling",
    "Numerical Simulation",
    "Quantum Mechanics",
    "Finite Element Analysis (FEA)",
    "Python (Programming Language)",
    "Data Analysis",
    "Research Writing",
  ],
  "frc-team-190": [
    "Prototyping",
    "Content Idea",
    "Engineering Drawings",
    "Engineering Design",
    "Public Speaking",
    "Structural Analysis",
    "Documentation",
    "Computer-Aided Design (CAD)",
    "Teamwork",
    "Milling",
    "Onshape",
    "Experimental Design",
  ],
  "tech-awareness-association": [
    "Public Speaking",
    "Documentation",
    "Teamwork",
    "Teaching",
    "Tech Repair",
    "LaTeX",
  ],
  "us-taekwondo-instructor": [
    "Taekwondo",
    "Public Speaking",
    "Teamwork",
    "Teaching",
  ],
};

/** Nine top-level groups; each lists specific skill names (~5 per group). */
const categoryGroups = [
  {
    id: "ai-machine-learning",
    name: "AI & Machine Learning",
    meaning:
      "Speech, language, and ML systems — from model integration to accessible AI products.",
    growing: "Deeper work on efficient inference, fine-tuning, and human-centered AI deployment.",
    skillNames: [
      "Artificial Intelligence (AI)",
      "Machine Learning",
      "Natural Language Processing (NLP)",
      "Transformers",
      "Whisper",
      "Hugging Face Products",
    ],
  },
  {
    id: "programming-software",
    name: "Programming & Software",
    meaning:
      "Building software pipelines, APIs, and computational tools that turn ideas into working systems.",
    growing: "More structured engineering practices and production-quality codebases.",
    skillNames: [
      "Python (Programming Language)",
      "API Development",
      "Algorithms",
      "Scientific Computing",
      "Documentation",
    ],
  },
  {
    id: "mathematical-modeling",
    name: "Mathematical Modeling",
    meaning:
      "Formulating real problems as equations, stochastic processes, and dynamic systems.",
    growing: "Control theory, optimization under uncertainty, and larger-scale simulation.",
    skillNames: [
      "Mathematical Modeling",
      "Probabilistic Models",
      "Stochastic Processes",
      "Dynamic Systems",
      "Financial Modeling",
      "Regression Analysis",
      "Computational Physics",
      "Quantum Mechanics",
    ],
  },
  {
    id: "data-simulation",
    name: "Data & Simulation",
    meaning:
      "Collecting, analyzing, and simulating data to test hypotheses and forecast outcomes.",
    growing: "Reproducible simulation workflows and richer uncertainty quantification.",
    skillNames: [
      "Data Analysis",
      "Data Collection",
      "Monte Carlo Simulation",
      "Numerical Simulation",
      "Data Visualization",
      "COMSOL",
    ],
  },
  {
    id: "optimization-networks",
    name: "Optimization & Networks",
    meaning:
      "Graph-based routing, resource allocation, and multi-agent decision models.",
    growing: "Large-scale network models and real-time optimization.",
    skillNames: [
      "Optimization",
      "Graph Theory",
      "Network Theory",
      "Multi-agent Systems",
      "Resource Allocation",
    ],
  },
  {
    id: "spatial-environmental",
    name: "Spatial & Environmental Modeling",
    meaning:
      "Mapping spatial risk, diffusion, and conservation dynamics across real geographies.",
    growing: "GIS-integrated policy models and climate-impact spatial analysis.",
    skillNames: [
      "Conservation Modeling",
      "Spatial Analysis",
      "GIS-Style Mapping",
      "Diffusion",
      "Experimental Design",
    ],
  },
  {
    id: "engineering-design",
    name: "Engineering & Design",
    meaning:
      "Mechanical design, CAD, ergonomics, and iterative prototyping of physical systems.",
    growing: "Design-for-manufacturing and tighter integration with embedded sensing.",
    skillNames: [
      "Engineering Design",
      "Computer-Aided Design (CAD)",
      "Onshape",
      "Structural Analysis",
      "Prototyping",
      "Engineering Drawings",
      "Ergonomics",
      "Finite Element Analysis (FEA)",
      "Milling",
      "Knee Mill",
      "Tech Repair",
    ],
  },
  {
    id: "embedded-wearables",
    name: "Embedded & Wearables",
    meaning:
      "Sensors, circuits, PCBs, and wearable hardware for assistive and health applications.",
    growing: "Robust embedded test design and low-power closed-loop systems.",
    skillNames: [
      "Embedded Systems",
      "Printed Circuit Board (PCB) Design",
      "Electric Circuits",
      "Wearable Technology",
      "Galvanic Vestibular Stimulation",
      "Assistive Technology",
    ],
  },
  {
    id: "research-leadership",
    name: "Research & Leadership",
    meaning:
      "Technical writing, presentation, teamwork, and leading collaborative project work.",
    growing: "Research communication for interdisciplinary and industry audiences.",
    skillNames: [
      "Research Writing",
      "LaTeX",
      "Teamwork",
      "Team Leadership",
      "Public Speaking",
      "User-centered Design",
      "Poster Design",
      "Teaching",
      "Content Idea",
      "Taekwondo",
    ],
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shortTitle(title) {
  return title.split(":")[0].split("—")[0].trim();
}

function skillLevel(count) {
  if (count >= 5) return "recurring";
  if (count >= 2) return "applied";
  return "developing";
}

const projectsData = JSON.parse(readFileSync(projectsPath, "utf8"));
const titleBySlug = Object.fromEntries(
  projectsData.projects.map((p) => [p.slug, shortTitle(p.title)])
);

for (const project of projectsData.projects) {
  const skills = projectSkills[project.slug];
  if (skills) {
    project.skills = skills;
  }
  delete project.relatedSkills;
}

const skillMap = new Map();
for (const [projectSlug, skills] of Object.entries(projectSkills)) {
  for (const name of skills) {
    const id = slugify(name);
    if (!skillMap.has(id)) {
      skillMap.set(id, { id, name, projectSlugs: [] });
    }
    const entry = skillMap.get(id);
    if (!entry.projectSlugs.includes(projectSlug)) {
      entry.projectSlugs.push(projectSlug);
    }
  }
}

function buildSkillItem(name) {
  const id = slugify(name);
  const base = skillMap.get(id);
  if (!base) {
    throw new Error(`Unknown skill: ${name}`);
  }
  const evidence = base.projectSlugs.map((slug) => titleBySlug[slug]);
  const count = base.projectSlugs.length;
  return {
    id: base.id,
    name: base.name,
    meaning: `Demonstrated across ${count} project${count === 1 ? "" : "s"} with concrete methods, deliverables, and outcomes.`,
    evidence,
    growing:
      "Continue applying and deepening this skill through research, competitions, and engineering work.",
    level: skillLevel(count),
    projectSlugs: base.projectSlugs,
  };
}

const categories = categoryGroups.map((group) => ({
  id: group.id,
  name: group.name,
  meaning: group.meaning,
  growing: group.growing,
  skills: group.skillNames.map(buildSkillItem),
}));

const skillsData = {
  intro:
    "Skills are organized into nine areas. Type skills, pick a category, then explore specific skills and linked projects.",
  categories,
};

writeFileSync(projectsPath, `${JSON.stringify(projectsData, null, 2)}\n`);
writeFileSync(skillsPath, `${JSON.stringify(skillsData, null, 2)}\n`);

console.log(`Updated ${projectsData.projects.length} projects`);
console.log(
  `Generated ${categories.length} categories with ${categories.reduce((n, c) => n + c.skills.length, 0)} skills`
);
