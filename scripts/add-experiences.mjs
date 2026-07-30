import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
  "projects.json"
);

const experiences = [
  {
    slug: "wpi-metal-am-research-intern",
    title: "Research Intern — Multiphysics Modeling for Metal Additive Manufacturing",
    subtitle: "Worcester Polytechnic Institute",
    summary:
      "Refining a multiphysics simulation framework for metal additive manufacturing under faculty mentorship.",
    status: "ongoing",
    kind: "experience",
    organization: "Worcester Polytechnic Institute",
    employmentType: "Internship",
    location: "Worcester, Massachusetts · Hybrid",
    dateRange: "Jun 2026 – Present",
    cluster: "Research & Internships",
    clusterSlug: "research-internships",
    tags: ["COMSOL", "Multiphysics", "Additive Manufacturing", "Simulation"],
    opening:
      "Conducting research in computational materials science and advanced manufacturing at WPI. The work centers on a multiphysics simulation framework for metal additive-manufacturing processes and how processing conditions influence material behavior and final-part quality.",
    problem:
      "How can simulation help predict melt-pool behavior, solidification, and defect risk across varying metal AM process parameters?",
    role: "Research intern under faculty mentorship, contributing to simulation development, parameter studies, and analysis of manufacturing-relevant outputs.",
    methods: [
      "Refining multiphysics simulation models for metal additive manufacturing",
      "Applying heat-transfer, fluid-flow, and numerical-modeling methods",
      "Running parameter studies across processing conditions",
      "Analyzing temperature fields, melt-pool behavior, and solidification trends",
      "Visualizing simulation outputs to support manufacturing-reliability research",
    ],
    results:
      "Contributing to research aimed at improving manufacturing reliability and reducing defect formation in metal parts.",
    learned:
      "Metal AM research requires tightly coupled physics models and careful interpretation of simulation trends—not just single-variable optimization.",
    placeholders: [
      "Melt-pool simulation visualization",
      "Temperature field plot",
      "Parameter-study summary chart",
    ],
    skills: [
      "COMSOL",
      "Numerical Simulation",
      "Mathematical Modeling",
      "Data Visualization",
      "Research Writing",
      "Scientific Computing",
    ],
  },
  {
    slug: "wpi-computational-physics-intern",
    title: "Research Intern — Computational Physics & Advanced Modeling",
    subtitle: "Worcester Polytechnic Institute",
    summary:
      "Computational-physics research applying mathematical modeling and scientific computing to complex physical systems.",
    status: "ongoing",
    kind: "experience",
    organization: "Worcester Polytechnic Institute",
    employmentType: "Internship",
    location: "Worcester, Massachusetts · Hybrid",
    dateRange: "May 2026 – Present",
    cluster: "Research & Internships",
    clusterSlug: "research-internships",
    tags: ["Computational Physics", "Scientific Computing", "WPI", "Research"],
    opening:
      "Conducting computational-physics research under faculty mentorship at Worcester Polytechnic Institute—building foundations in quantum mechanics, advanced materials modeling, and numerical simulation.",
    problem:
      "How can computational tools and mathematical models advance understanding of complex physical systems in early-stage research?",
    role: "Research intern developing computational methods, reviewing literature, and contributing to theoretical and numerical analysis with faculty and lab collaborators.",
    methods: [
      "Applying mathematical modeling and numerical methods to physical systems",
      "Building computational tools for simulation and analysis",
      "Reviewing research literature and refining methods iteratively",
      "Collaborating on interpretation of results and next research steps",
      "Preparing foundations for future research outputs",
    ],
    results:
      "Advancing early-stage computational-physics work across modeling, simulation, and literature-informed method development.",
    learned:
      "Research progress depends as much on careful method refinement and literature grounding as on raw computation.",
    placeholders: [
      "Simulation output figure",
      "Model schematic",
      "Research notes snapshot",
    ],
    skills: [
      "Computational Physics",
      "Mathematical Modeling",
      "Numerical Simulation",
      "Scientific Computing",
      "LaTeX",
      "Documentation",
      "Research Writing",
      "Python (Programming Language)",
      "Data Visualization",
    ],
  },
  {
    slug: "frc-team-190",
    title: "FIRST Robotics Competition — Team 190",
    subtitle: "Mass Academy / WPI · Team Member",
    summary:
      "FRC Team 190 member — CAD, prototyping, FLL volunteering, and Impact Award / social media team work.",
    status: "ongoing",
    kind: "experience",
    organization: "FIRST Robotics Competition · Team 190",
    employmentType: "Team Member",
    location: "Massachusetts",
    dateRange: "Aug 2025 – Present",
    cluster: "Engineering",
    clusterSlug: "engineering",
    tags: ["FRC", "CAD", "Onshape", "Prototyping", "FIRST"],
    opening:
      "Member of FRC Team 190 at Mass Academy/WPI, contributing CAD and prototyping for robot subsystems while supporting outreach through FLL kit builds and competition-season team operations.",
    problem:
      "How can a competition team iterate quickly on subsystem designs while supporting broader FIRST community outreach?",
    role: "CAD and prototyping contributor; FLL volunteer; member of Impact Award and Social Media teams.",
    methods: [
      "Prototyping and CAD for subsystems in Onshape",
      "Collaborative design iteration with teammates",
      "Volunteering for FLL teams — building kits and practice mats",
      "Brainstorming and content work on Impact Award and social media teams",
    ],
    results:
      "Hands-on contribution to competition-season engineering and community-facing FIRST outreach.",
    learned:
      "Strong robotics teams combine fast mechanical iteration with clear communication and outreach ownership.",
    placeholders: ["Onshape assembly screenshot", "Prototype photo", "Outreach event photo"],
    skills: [
      "Prototyping",
      "Computer-Aided Design (CAD)",
      "Onshape",
      "Teamwork",
      "Public Speaking",
      "Engineering Design",
      "Documentation",
    ],
  },
  {
    slug: "tech-awareness-association",
    title: "Co-Founder & Programs and Education Lead",
    subtitle: "Tech Awareness Association",
    summary:
      "Student-led nonprofit teaching device repair, e-waste reduction, and digital literacy — 120+ devices repaired across five towns.",
    status: "ongoing",
    kind: "experience",
    organization: "Tech Awareness Association",
    employmentType: "Self-employed",
    location: "Shrewsbury, Massachusetts · Hybrid",
    dateRange: "Jan 2024 – Present",
    cluster: "Leadership & Community",
    clusterSlug: "leadership-community",
    tags: ["Nonprofit", "Repair", "Education", "Leadership"],
    opening:
      "Co-founded a student-led nonprofit teaching device repair, e-waste reduction, and digital literacy to community members and seniors. Lead a team of five running library and senior-center workshops with a recurring repair bench.",
    problem:
      "How can students build durable community programs that reduce e-waste and expand digital access?",
    role: "Co-founder and Programs & Education Lead — team leadership, workshop design, repair operations, and partnership development.",
    methods: [
      "Leading a team of five across workshops and repair operations",
      "Running library and senior-center repair and literacy programs",
      "Repairing 120+ devices through a recurring community repair bench",
      "Expanding programming to five towns and helping each launch local programs",
      "Developing an organizational partnership with iFixit for supplies and programming",
    ],
    results:
      "Scaled community impact across five towns and secured iFixit partnership support for repair programming worth over $4,000 in supplies.",
    learned:
      "Sustained community impact comes from repeatable workshops, strong partnerships, and training others to run local programs.",
    placeholders: ["Repair bench photo", "Workshop session photo", "Community outreach graphic"],
    skills: [
      "Public Speaking",
      "Documentation",
      "Team Leadership",
      "Teamwork",
      "User-centered Design",
      "Prototyping",
    ],
  },
  {
    slug: "hmmt-captain",
    title: "HMMT Captain",
    subtitle: "Harvard-MIT Math Tournament",
    summary:
      "Coordinated team selection, logistics, and competition strategy for Harvard-MIT Math Tournament.",
    status: "completed",
    kind: "experience",
    organization: "Harvard-MIT Math Tournament (HMMT)",
    employmentType: "Team Captain",
    location: "Massachusetts",
    dateRange: "Nov 2025",
    cluster: "Leadership & Community",
    clusterSlug: "leadership-community",
    tags: ["HMMT", "Math Competition", "Leadership"],
    opening:
      "Served as HMMT Captain — coordinating team selection from ARML and Mass Academy, logistics, and strategy for the Harvard-MIT Math Tournament.",
    problem:
      "How should a competition team prepare and coordinate under tight tournament logistics?",
    role: "Captain responsible for selection, scheduling, practice direction, and competition logistics.",
    methods: [
      "Coordinated team selection from ARML and Mass Academy",
      "Planned practice schedule and advanced problem-solving direction",
      "Managed logistics and strategy for tournament day",
      "Communicated expectations and preparation structure to teammates",
    ],
    results:
      "Delivered organized team preparation and clear competition-day logistics for HMMT.",
    learned:
      "Competition leadership is logistics plus deliberate practice design—not just individual problem speed.",
    placeholders: ["Team schedule outline", "Practice plan snapshot"],
    skills: ["Communication", "Documentation", "Team Leadership", "Teamwork"],
  },
  {
    slug: "mmaths-co-captain",
    title: "MMATHS Co-Captain",
    subtitle: "Yale Math Competition",
    summary:
      "Co-captain for Yale MMATHS — team communication, logistics, and round strategy.",
    status: "completed",
    kind: "experience",
    organization: "Yale Math Competition (MMATHS)",
    employmentType: "Co-Captain",
    location: "Connecticut",
    dateRange: "Nov 2025",
    cluster: "Leadership & Community",
    clusterSlug: "leadership-community",
    tags: ["MMATHS", "Math Competition", "Leadership"],
    opening:
      "Co-captain for the Yale MMATHS competition team — primary liaison with supervising adults, team tracking, and round strategy.",
    problem:
      "How can a student leader keep a competition team coordinated and supported throughout a full tournament day?",
    role: "Co-captain managing communication, logistics, and team/guts round strategy.",
    methods: [
      "Tracked and accounted for team members throughout the event",
      "Served as primary communication point with supervising adult",
      "Managed meal voucher inventory",
      "Developed strategies for Team and Guts rounds",
    ],
    results:
      "Kept the team organized and strategically prepared across competition rounds.",
    learned:
      "Tournament leadership means constant communication and small logistical details handled before they become problems.",
    placeholders: ["Event logistics checklist"],
    skills: ["Communication", "Team Leadership", "Teamwork"],
  },
  {
    slug: "us-taekwondo-instructor",
    title: "2nd Dan Black Belt / Instructor",
    subtitle: "US Taekwondo Center",
    summary:
      "Part-time instructor teaching Taekwondo to ages 5+ and competing on the demonstration team.",
    status: "completed",
    kind: "experience",
    organization: "US Taekwondo Center",
    employmentType: "Part-time",
    location: "Shrewsbury, Massachusetts",
    dateRange: "Mar 2017 – Oct 2025",
    cluster: "Leadership & Community",
    clusterSlug: "leadership-community",
    tags: ["Taekwondo", "Teaching", "Martial Arts"],
    opening:
      "2nd Dan Black Belt instructor at US Taekwondo Center — assisting and leading classes for students ages 5 and older while competing on the demonstration team.",
    problem:
      "How do you teach physical discipline and confidence across a wide range of ages and skill levels?",
    role: "Instructor assisting 10–20 student classes and teaching the Taekwondo curriculum.",
    methods: [
      "Assisted and led classes of 10–20 students",
      "Taught curriculum to students ages 5 and older",
      "Competed on the school demonstration team",
      "Modeled discipline, form, and public performance under pressure",
    ],
    results:
      "Eight years of teaching experience building communication, patience, and leadership in a physical instruction setting.",
    learned:
      "Teaching movement requires clear demonstration, patience, and adapting tone for different age groups.",
    placeholders: ["Class instruction photo", "Demonstration team photo"],
    skills: [
      "Taekwondo",
      "Public Speaking",
      "Teamwork",
      "Communication",
      "Team Leadership",
    ],
  },
  {
    slug: "pltw-principles-of-engineering",
    title: "PLTW Principles of Engineering",
    subtitle: "Project Lead The Way",
    summary:
      "Year-long engineering design course — dynamics, mechanical systems, notebooks, and electrical systems instruction.",
    status: "completed",
    kind: "experience",
    organization: "Project Lead The Way",
    employmentType: "Course",
    location: "Massachusetts",
    dateRange: "Aug 2024 – Jun 2025",
    cluster: "Engineering",
    clusterSlug: "engineering",
    tags: ["PLTW", "Mechanical Design", "Engineering Notebook", "Electrical Systems"],
    opening:
      "Participated in Project Lead The Way Principles of Engineering — continuous design challenges around forces, dynamics, and mechanical systems with rigorous engineering documentation.",
    problem:
      "How do structured design processes, calculations, and prototyping combine in a full-year engineering course?",
    role: "Student engineer maintaining notebooks, building prototypes, and teaching classmates electrical systems beyond course material.",
    methods: [
      "Completed design challenges involving forces, dynamics, and mechanical systems",
      "Maintained engineering notebooks with decision matrices, calculations, and isometric drawings",
      "Built and iterated prototype designs",
      "Taught the class electrical systems and components beyond standard material",
    ],
    results:
      "Developed disciplined engineering documentation habits and peer-teaching experience in core mechanical and electrical topics.",
    learned:
      "Engineering notebooks turn scattered prototypes into accountable design decisions.",
    placeholders: [
      "Engineering notebook spread",
      "Prototype photo",
      "Isometric drawing sample",
    ],
    skills: [
      "Engineering Design",
      "Engineering Drawings",
      "Prototyping",
      "Electric Circuits",
      "Documentation",
      "Public Speaking",
      "Structural Analysis",
      "Teamwork",
    ],
  },
];

const data = JSON.parse(readFileSync(projectsPath, "utf8"));

const robotics = data.projects.find((p) => p.slug === "robotics-design-manufacturing");
if (robotics) {
  robotics.opening =
    "Hands-on engineering through FRC Team 467 at Shrewsbury High School (Sep 2024 – Jun 2025) — CAD in Onshape, prototyping, and manufacturing with knee mill, CNC, and lathe. Recognized with the FIRST Leadership Award (1 of 2 from 54 students).";
  robotics.role =
    "Member of FRC Team 467: prototyping and CAD for subsystems, manufacturing and machining parts, and team collaboration across competition season.";
  robotics.methods = [
    "Prototyping and CAD for subsystems in Onshape",
    "Manufacturing parts using knee mill, CNC, and lathe",
    "Iterative design based on testing and team feedback",
    "FRC competition-season engineering workflow",
    "Community outreach and team platform contributions",
  ];
  robotics.kind = "experience";
  robotics.organization = "FIRST Robotics Competition · Team 467";
  robotics.employmentType = "Team Member";
  robotics.dateRange = "Sep 2024 – Jun 2025";
  robotics.location = "Shrewsbury, Massachusetts";
}

data.projects.push(...experiences);
writeFileSync(projectsPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Added ${experiences.length} experience entries`);
