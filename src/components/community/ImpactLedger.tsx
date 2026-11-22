"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import styles from "./Community.module.css";

type Stat = { value: string; label: string; note?: string };

/** Counts the number part of a value like "120+" or "$4,000+" up from zero when it scrolls into view. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useSafeReducedMotion();
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const countable = Boolean(match);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!countable || !inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, target, countable]);

  if (!match || n === null) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {match[1]}
      {n.toLocaleString("en-US")}
      {match[3]}
    </span>
  );
}

export function ImpactLedger({ stats }: { stats: Stat[] }) {
  return (
    <section className={styles.ledger} aria-label="Impact">
      <p className={styles.ledgerHead}>
        <span>Impact ledger</span>
        <span>Tech Awareness Association</span>
      </p>
      <dl className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <dd className={styles.value}>
              <CountUp value={s.value} />
            </dd>
            <dt className={styles.label}>{s.label}</dt>
            {s.note && <p className={styles.note}>{s.note}</p>}
          </div>
        ))}
      </dl>
    </section>
  );
}
