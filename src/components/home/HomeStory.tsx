"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { AboutGalleries } from "@/components/AboutGalleries";
import { BuildProcessOverview } from "@/components/BuildProcessOverview";
import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";
import { aboutGalleries, site } from "@/lib/content";
import { topics, type Topic } from "@/lib/aboutTopics";
import styles from "./HomeStory.module.css";
import { RocketFlight } from "./RocketFlight";
import { FeaturedWork } from "./FeaturedWork";

const NAME = site.name;
const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const NEXT_STOPS = [
  { href: "/experience", label: "Experience", note: "Every project, paper and team, with photos" },
  { href: "/awards", label: "Awards", note: "A chess board you can play against" },
  { href: "/skills", label: "Skills", note: "A terminal you can type into" },
  { href: "/exploring", label: "Exploring", note: "My notebook of things I am learning" },
  { href: "/contact", label: "Contact", note: "Email, LinkedIn and my résumé" },
];

function Hero() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  return (
    <section ref={ref} className={styles.hero} data-rocket-hero>
      <motion.div className={styles.heroText} style={{ y: textY, opacity: fade }}>
        <motion.p
          className={styles.kicker}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Mass Academy at WPI · Shrewsbury, MA
        </motion.p>
        <h1 className={styles.name} aria-label={NAME}>
          {NAME.split(" ").map((word, wi) => (
            <span key={wi} className={styles.word} aria-hidden>
              {word.split("").map((ch, ci) => (
                <span key={ci} className={styles.mask}>
                  <motion.span
                    className={styles.letter}
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, delay: 0.15 + (wi * 6 + ci) * 0.04, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
        >
          <p className={styles.lede}>
            Hi, I&apos;m Tanay, a senior at the Massachusetts Academy of Math and Science at WPI. Most of what I
            work on ends up somewhere between math, engineering and aerospace, because the problems I like best
            are the ones where the math has to turn into something that works, whether that is a model, a
            simulation or a thing I can hold.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/experience" variant="primary">See my work</ButtonLink>
            <ButtonLink href={site.academicsUrl} variant="secondary" external>Academics site ↗</ButtonLink>
            <ButtonLink href="/resume" variant="secondary">Résumé</ButtonLink>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.heroPhoto}
        style={{ y: photoY }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
      >
        {/* the one space touch: a slow orbit with a small satellite going around the photo */}
        <svg className={styles.orbit} viewBox="0 0 400 400" aria-hidden>
          <ellipse cx="200" cy="200" rx="190" ry="70" className={styles.orbitPath} />
          <circle r="5" cx={reduce ? 390 : 0} cy={reduce ? 200 : 0} className={styles.satellite}>
            {!reduce && (
              <animateMotion dur="16s" repeatCount="indefinite" path="M390,200 a190,70 0 1,1 -380,0 a190,70 0 1,1 380,0" />
            )}
          </circle>
        </svg>
        <Image
          src="/images/about/hero_tree.jpg"
          alt="Tanay standing under a tree in the fall"
          width={933}
          height={1400}
          priority
          sizes="(max-width: 900px) 70vw, 380px"
          className={styles.photo}
        />
      </motion.div>

      <motion.a href="#chapters" className={styles.scrollCue} style={{ opacity: fade }} aria-label="Scroll to the next section">
        <span>Scroll slowly for the best effect</span>
        <span className={styles.cueLine} aria-hidden />
      </motion.a>
    </section>
  );
}

function Chapter({ topic, index }: { topic: Topic; index: number }) {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const numberY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -120]);
  const flip = index % 2 === 1;

  return (
    <section ref={ref} id={topic.id} className={`${styles.chapter} ${flip ? styles.flip : ""}`} data-chapter={index}>
      <motion.span className={styles.bigNumber} style={{ y: numberY }} aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      <div className={styles.chapterText}>
        <Reveal>
          <p className={styles.kicker}>{String(index + 1).padStart(2, "0")} / {String(topics.length).padStart(2, "0")}</p>
          <h2 className={styles.chapterTitle}>{topic.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className={styles.body}>{topic.body}</div>
          {topic.links && (
            <p className={styles.links}>
              {topic.links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label} <span aria-hidden>→</span>
                </Link>
              ))}
            </p>
          )}
        </Reveal>
      </div>

      <motion.div className={styles.chapterPhotos} style={{ y: photoY }}>
        {topic.photos.map((p, i) => (
          <TiltFrame key={p.src} delay={i * 0.12}>
            <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width: 900px) 90vw, 440px" className={styles.photo} />
          </TiltFrame>
        ))}
      </motion.div>
    </section>
  );
}

/** Photo frame that reveals with a clip and tilts in 3D toward the pointer. */
function TiltFrame({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduce = useSafeReducedMotion();
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });
  return (
    <div className={styles.tiltWrap}>
      <motion.div
        className={styles.photoFrame}
        style={{ rotateX: rx, rotateY: ry }}
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        initial={reduce ? false : { clipPath: "inset(12% 12% 12% 12%)", opacity: 0 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * The gap before each chapter. It pins to the screen while the rocket flies
 * across, and the next chapter's title is uncovered right behind the rocket
 * (RocketFlight sets --flight on this element). The chapter itself only
 * scrolls up once the flight has finished.
 */
function FlightBand({ index, title }: { index: number; title: string }) {
  const towardRight = index % 2 === 0;
  return (
    <div className={styles.flight} data-flight={towardRight ? "right" : "left"}>
      <div className={styles.flightStage}>
        <div className={`${styles.flightCard} ${towardRight ? styles.revealRight : styles.revealLeft}`}>
          <p className={styles.kicker}>
            {String(index + 1).padStart(2, "0")} / {String(topics.length).padStart(2, "0")}
          </p>
          <p className={styles.flightTitle}>{title}</p>
        </div>
      </div>
    </div>
  );
}

/** Vertical "trajectory" on the left edge: fills as you scroll and marks which chapter you are on. */
function TrajectoryRail() {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.getAttribute("data-chapter")));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className={styles.rail} aria-label="Chapters">
      <div className={styles.railTrack}>
        <motion.div className={styles.railFill} style={{ scaleY: fill }} />
      </div>
      <ol>
        {topics.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className={i === active ? styles.railActive : undefined}>
              <span className={styles.railDot} aria-hidden />
              <span className={styles.railLabel}>{t.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function HomeStory() {
  return (
    <div className={styles.page}>
      <RocketFlight />
      <Hero />
      <FeaturedWork />
      <TrajectoryRail />

      <div id="chapters" className={styles.chapters}>
        {topics.map((t, i) => (
          <div key={t.id}>
            <FlightBand index={i} title={t.title} />
            <Chapter topic={t} index={i} />
          </div>
        ))}
        <div className={`${styles.flight} ${styles.launch}`} data-flight="launch">
          <div className={styles.flightStage}>
            <p className={`${styles.flightTitle} ${styles.revealUp}`}>That&apos;s the tour.</p>
          </div>
        </div>
      </div>

      <div id="outside-school" className={styles.section}>
        <Reveal>
          <AboutGalleries section={aboutGalleries} />
        </Reveal>
      </div>

      <Reveal className={styles.section}>
        <section id="build-process">
          <h2 className={styles.sectionTitle}>How I build things</h2>
          <div className="mt-6">
            <BuildProcessOverview />
          </div>
        </section>
      </Reveal>

      <section className={`${styles.section} ${styles.next}`}>
        <Reveal>
          <p className={styles.kicker}>Where to next</p>
        </Reveal>
        <ul>
          {NEXT_STOPS.map((s, i) => (
            <Reveal key={s.href} delay={i * 0.06}>
              <li>
                <Link href={s.href}>
                  <span className={styles.nextLabel}>{s.label}</span>
                  <span className={styles.nextNote}>{s.note}</span>
                  <span className={styles.nextArrow} aria-hidden>→</span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
