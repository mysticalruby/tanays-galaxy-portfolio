import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutGalleries } from "@/components/AboutGalleries";
import { BlurFade } from "@/components/BlurFade";
import { BuildProcessOverview } from "@/components/BuildProcessOverview";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";
import { aboutGalleries } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "About Tanay Mangal: research at WPI, math modeling, FRC Team 190, the Tech Awareness Association, chess, taekwondo and cooking.",
};

const ACADEMICS_URL = "https://users.wpi.edu/~tmangal/";

type Photo = { src: string; alt: string; w: number; h: number };
type Topic = {
  id: string;
  title: string;
  body: React.ReactNode;
  photos: Photo[];
  links?: { href: string; label: string }[];
};

const topics: Topic[] = [
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <BlurFade>
        <section className="grid items-end gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <h1 className="font-display text-3xl text-text-primary sm:text-4xl">About Me</h1>
            <p className="mt-3 font-ui text-xs text-gold">
              Mass Academy at WPI · Shrewsbury, MA
            </p>
            <div className="mt-6 space-y-4 text-text-primary">
              <p>
                Hi, I&apos;m Tanay, a senior at the Massachusetts Academy of Math
                and Science at WPI. Most of what I work on ends up somewhere
                between math, engineering and aerospace, because the problems I
                like best are the ones where the math has to turn into something
                that actually works, whether that is a model, a simulation or a
                thing I can hold.
              </p>
              <p className="text-text-muted">
                This page is the longer version. My school assignments and
                coursework are on my academic site.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={ACADEMICS_URL} variant="primary" external>
                Academics site ↗
              </ButtonLink>
              <ButtonLink href="/resume" variant="secondary">
                Résumé
              </ButtonLink>
            </div>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-ui text-[11px] text-text-muted">
              {topics.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="hover:text-gold">
                  {t.title}
                </a>
              ))}
              <a href="#outside-school" className="hover:text-gold">Cooking and Desmos</a>
            </nav>
          </div>
          <Image
            src="/images/about/hero_tree.jpg"
            alt="Tanay standing under a tree in the fall"
            width={933}
            height={1400}
            priority
            className="h-auto w-full max-w-sm justify-self-center border border-white/10 lg:justify-self-end"
            sizes="(max-width: 1024px) 80vw, 380px"
          />
        </section>
      </BlurFade>

      {topics.map((t) => (
        <Reveal key={t.id}>
          <section
            id={t.id}
            className="grid scroll-mt-24 gap-6 border-b border-white/10 py-10 md:grid-cols-[170px_1fr_minmax(0,300px)] md:gap-8"
          >
            <h2 className="font-display text-xl text-text-primary">{t.title}</h2>
            <div className="space-y-4 text-text-primary">
              {t.body}
              {t.links && (
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {t.links.map((l) => (
                    <Link key={l.href} href={l.href} className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold">
                      {l.label} →
                    </Link>
                  ))}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              {t.photos.map((p) => (
                <Image
                  key={p.src}
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  className="h-auto w-full border border-white/10"
                  sizes="(max-width: 768px) 90vw, 300px"
                />
              ))}
            </div>
          </section>
        </Reveal>
      ))}

      <div id="outside-school" className="scroll-mt-24">
        <AboutGalleries section={aboutGalleries} />
      </div>

      <Reveal>
        <section id="build-process" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-2xl text-text-primary">How I build things</h2>
          <div className="mt-6">
            <BuildProcessOverview />
          </div>
        </section>
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/experience" variant="secondary">
          See all experience
        </ButtonLink>
        <ButtonLink href={ACADEMICS_URL} variant="secondary" external>
          Academics site ↗
        </ButtonLink>
      </div>
    </div>
  );
}
