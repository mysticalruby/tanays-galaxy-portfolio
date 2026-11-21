"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { exploring } from "@/lib/content";
import styles from "./ExploringNotebook.module.css";

type Topic = (typeof exploring.topics)[number];

/** Notebook sections, in order. Topics not listed here go in "Other". */
const SECTIONS: { name: string; ids: string[] }[] = [
  { name: "Simulation", ids: ["computational-physics", "fem", "multiphysics", "openrocket"] },
  { name: "Hardware", ids: ["cad", "circuit-design", "arduino"] },
  { name: "Software and data", ids: ["matlab", "data-viz", "gis", "latex"] },
  { name: "Kitchen", ids: ["cooking"] },
];

export function ExploringNotebook() {
  const reduce = useSafeReducedMotion();
  const byId = new Map((exploring.topics as Topic[]).map((t) => [t.id, t]));
  const groups = SECTIONS.map((s) => ({ name: s.name, topics: s.ids.map((id) => byId.get(id)).filter((t): t is Topic => Boolean(t)) }));
  const leftover = (exploring.topics as Topic[]).filter((t) => !SECTIONS.some((s) => s.ids.includes(t.id)));
  if (leftover.length) groups.push({ name: "Other", topics: leftover });

  let n = 0;
  const numbered = groups.map((g) => ({ ...g, topics: g.topics.map((t) => ({ topic: t, num: ++n })) }));
  const [active, setActive] = useState<string>(numbered[0]?.topics[0]?.topic.id ?? "");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-entry]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.wrap}>
      <nav className={styles.toc} aria-label="Notebook contents">
        <p className={styles.tocTitle}>Contents</p>
        {numbered.map((g) => (
          <div key={g.name} className={styles.tocGroup}>
            <p className={styles.tocSection}>{g.name}</p>
            <ol>
              {g.topics.map(({ topic, num }) => (
                <li key={topic.id}>
                  <a href={`#${topic.id}`} aria-current={active === topic.id ? "true" : undefined}>
                    <span className={styles.tocNum}>{String(num).padStart(2, "0")}</span>
                    {topic.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </nav>

      <div className={styles.notebook}>
        {numbered.map((g) => (
          <section key={g.name} className={styles.group} aria-label={g.name}>
            <h2 className={styles.groupTitle}>{g.name}</h2>
            {g.topics.map(({ topic, num }) => (
              <motion.article
                key={topic.id}
                id={topic.id}
                data-entry
                className={styles.entry}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <header className={styles.entryHead}>
                  <span className={styles.entryNum}>Entry {String(num).padStart(2, "0")}</span>
                  <span className={styles.entrySection}>{g.name}</span>
                </header>
                <h3 className={styles.entryTitle}>
                  {topic.label}
                  <motion.span
                    className={styles.underline}
                    aria-hidden
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
                  />
                </h3>

                <div className={styles.cols}>
                  <div>
                    <h4>Why I&apos;m looking at it</h4>
                    <p>{topic.overview}</p>
                  </div>
                  <div>
                    <h4>Where I am</h4>
                    <p>{topic.learning}</p>
                  </div>
                </div>

                <ul className={styles.checklist} aria-label="Progress">
                  <li className={styles.done}>
                    <span className={styles.box} aria-hidden>✓</span>
                    <span>First few tutorials</span>
                  </li>
                  <li>
                    <span className={styles.box} aria-hidden />
                    <span>
                      <span className={styles.nextLabel}>Next</span>
                      {topic.nextSteps}
                    </span>
                  </li>
                </ul>
              </motion.article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
