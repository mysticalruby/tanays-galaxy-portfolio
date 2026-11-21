/** The "about me" chapters shown on the home page. */
export type Photo = { src: string; alt: string; w: number; h: number };
export type Topic = {
  id: string;
  title: string;
  body: React.ReactNode;
  photos: Photo[];
  links?: { href: string; label: string }[];
};

export const topics: Topic[] = [
  {
    id: "research",
    title: "Research",
    body: (
      <>
        <p>
          I do computational physics research at WPI with Professor Ram-Mohan.
          We solve the one-dimensional quantum harmonic oscillator with finite
          elements and check the energy levels against the exact answers: the
          cubic Hermite version gets the first six levels almost exactly with
          far fewer elements than the linear one, and I have been extending it
          to quintic Hermite elements.
        </p>
        <p>
          I have also been a research intern on multiphysics modeling for metal
          additive manufacturing, which means refining a simulation of what
          happens to the metal while it is being printed.
        </p>
      </>
    ),
    photos: [{ src: "/images/IMG_1422.png", alt: "Handwritten integral work on paper", w: 1024, h: 868 }],
    links: [
      { href: "/experience/fem-quantum-harmonic-oscillator", label: "FEM research" },
      { href: "/experience/wpi-metal-am-research-intern", label: "Additive manufacturing internship" },
    ],
  },
  {
    id: "modeling",
    title: "Math modeling",
    body: (
      <>
        <p>
          A lot of my year goes into modeling competitions with my teams. For
          HiMCM 2025 we modeled how firefighters should sweep a burning building
          while smoke and blocked hallways keep changing the problem, for MTFC
          we did actuarial risk analysis, and for IMMC we worked on protecting
          wildlife in Etosha National Park.
        </p>
        <p>
          I also co-founded the Mass Academy Math Tournament, a competition for
          middle and high school students that raised over $1,000 from sponsors
          like AoPS, Jane Street, RSM and The Actuarial Foundation.
        </p>
      </>
    ),
    photos: [{ src: "/images/about/mtfc_team.jpg", alt: "My Modeling the Future Challenge team at Mass Academy", w: 1400, h: 1050 }],
    links: [
      { href: "/experience/hiemcm-evacuation-sweep", label: "HiMCM 2025" },
      { href: "/experience/mams-math-tournament", label: "Math tournament" },
    ],
  },
  {
    id: "building",
    title: "Building things",
    body: (
      <>
        <p>
          My STEM I project was a wrist brace that tracks wrist angle with two
          IMUs and warns you before you hold a position that leads to carpal
          tunnel syndrome. For STEM II my group built STATERA, glasses that
          detect balance loss and use galvanic vestibular stimulation to try to
          correct it, and for Apps for Good we built ARTICULATE, a speech app
          for people with atypical speech.
        </p>
      </>
    ),
    photos: [{ src: "/images/IMG_3202.png", alt: "Presenting the Ventrilo-Wrist poster at the WPI fair", w: 1024, h: 951 }],
    links: [
      { href: "/experience/flo-wrist", label: "Wrist brace" },
      { href: "/experience/gvs-balance-glasses", label: "STATERA" },
      { href: "/experience/articulate", label: "ARTICULATE" },
    ],
  },
  {
    id: "robotics",
    title: "Robotics",
    body: (
      <>
        <p>
          I started on FRC Team 467 at Shrewsbury High School doing CAD and
          machining, and now I am on FRC Team 190, working on CAD and
          prototyping and on the Impact Award and social media side of the
          team.
        </p>
      </>
    ),
    photos: [
      { src: "/images/IMG_3199.png", alt: "Team 190 celebrating at a competition", w: 644, h: 528 },
      { src: "/images/IMG_1316.png", alt: "Wiring plan for a robot drivetrain", w: 1024, h: 1014 },
    ],
    links: [{ href: "/experience/frc-team-190", label: "Team 190" }],
  },
  {
    id: "community",
    title: "Community",
    body: (
      <>
        <p>
          I co-founded the Tech Awareness Association, a student nonprofit that
          teaches digital literacy, repairs devices and cuts down on e-waste. We
          have repaired more than 120 devices across five towns, and I lead our
          programs and education. Most of my other volunteer hours are from the
          Community Harvest farm.
        </p>
      </>
    ),
    photos: [{ src: "/images/about/Volunteering.jpg", alt: "Picking peppers at the Community Harvest farm", w: 900, h: 1200 }],
    links: [{ href: "/experience/tech-awareness-association", label: "Tech Awareness Association" }],
  },
  {
    id: "chess",
    title: "Chess",
    body: (
      <>
        <p>
          I started playing chess when I was 6 or 7 and ended up playing in more
          than 100 in-person tournaments. During COVID I moved from playing to
          running events, and I became a certified tournament director.
        </p>
      </>
    ),
    photos: [{ src: "/images/PHOTO-2025-02-01-23-52-49-.png", alt: "Holding a knight trophy at a chess tournament", w: 1024, h: 768 }],
  },
  {
    id: "taekwondo",
    title: "Taekwondo",
    body: (
      <>
        <p>
          I am a second-degree black belt and taught taekwondo part time for
          several years. My demonstration team took second in the Elite
          category at the 2025 Kukkiwon World Taekwondo Hanmadang in Anaheim.
        </p>
      </>
    ),
    photos: [{ src: "/images/batch-32e69881.png", alt: "My team at the 2025 Kukkiwon World Taekwondo Hanmadang", w: 1024, h: 768 }],
    links: [{ href: "/experience/us-taekwondo-instructor", label: "Taekwondo" }],
  },
];

