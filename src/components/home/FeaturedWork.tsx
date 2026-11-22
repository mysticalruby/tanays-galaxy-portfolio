"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { Reveal } from "@/components/Reveal";
import styles from "./FeaturedWork.module.css";

type Feature = { href: string; title: string; kind: string; result: string; img: string; alt: string };

const FEATURES: Feature[] = [
  {
    href: "/experience/tech-awareness-association",
    title: "Tech Awareness Association",
    kind: "Nonprofit I co-founded",
    result: "120+ devices repaired across five towns",
    img: "/images/tech-awareness/IMG_3299.jpg",
    alt: "Two students repairing a device at a library table",
  },
  {
    href: "/experience/hiemcm-evacuation-sweep",
    title: "HiMCM 2025",
    kind: "Math modeling",
    result: "Meritorious, modeling how firefighters sweep a burning building",
    img: "/images/himcm/responder-variables-whiteboard.webp",
    alt: "Whiteboard listing variables for a building search-and-rescue model",
  },
  {
    href: "/experience/autonomous-vehicles-boston-emissions",
    title: "Modeling the Future Challenge",
    kind: "Math modeling",
    result: "Finalist, top 3 in the Northeast and top 15 nationally, on autonomous vehicles in Boston",
    img: "/images/mtfc/policy-heatmaps.png",
    alt: "Policy heatmaps from the MTFC autonomous vehicle model",
  },
  {
    href: "/experience/m3c-sports-gambling",
    title: "MathWorks Math Modeling Challenge",
    kind: "Math modeling",
    result: "Top 20% internationally, on the spread of sports gambling",
    img: "/images/m3c/m3c-team-pizza.webp",
    alt: "M3 Challenge team eating pizza around a table with a laptop open",
  },
  {
    href: "/experience/wpi-computational-physics-intern",
    title: "Computational physics research at WPI",
    kind: "Research",
    result: "Finite elements for the quantum harmonic oscillator with Professor Ram-Mohan",
    img: "/images/quantum-research/qho-energy-spectrum-fem-vs-exact.png",
    alt: "Energy spectrum of the quantum harmonic oscillator, finite elements compared with the exact values",
  },
  {
    href: "/experience/frc-team-190",
    title: "FRC Team 190",
    kind: "Robotics",
    result: "CAD and prototyping on the climber, FIRST Leadership Award",
    img: "/images/frc-190/designing-climber-cad.jpg",
    alt: "Working on the climber in Onshape in the robotics lab",
  },
];

/**
 * A short list of the work worth seeing first. On desktop a preview photo
 * follows the pointer while you hover a row; on phones each row shows a thumbnail.
 */
export function FeaturedWork() {
  const [hover, setHover] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  return (
    <section
      className={styles.section}
      aria-labelledby="featured-title"
      data-rocket-park
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <Reveal>
        <p className={styles.kicker}>Featured</p>
        <h2 id="featured-title" className={styles.title}>Where to start</h2>
      </Reveal>

      <ol className={styles.list}>
        {FEATURES.map((f, i) => (
          <Reveal key={f.href} delay={i * 0.05}>
            <li>
              <Link
                href={f.href}
                className={`${styles.row} ${hover !== null && hover !== i ? styles.dim : ""}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                onFocus={() => setHover(null)}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.thumb} aria-hidden>
                  <Image src={f.img} alt="" width={160} height={120} sizes="96px" />
                </span>
                <span className={styles.main}>
                  <span className={styles.rowTitle}>{f.title}</span>
                  <span className={styles.result}>{f.result}</span>
                </span>
                <span className={styles.kind}>{f.kind}</span>
                <span className={styles.arrow} aria-hidden>→</span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ol>

      <AnimatePresence>
        {hover !== null && (
          <motion.div
            className={styles.preview}
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            aria-hidden
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={hover}
                className={styles.previewInner}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Image src={FEATURES[hover].img} alt={FEATURES[hover].alt} fill sizes="320px" className={styles.previewImg} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
