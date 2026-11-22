"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Community.module.css";

type Photo = { src: string; alt: string; caption?: string; tag?: string };

/** Masonry wall of photos with a small tag on each; click one to see it large. */
export function PhotoWall({ photos, title = "From the bench" }: { photos: Photo[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    window.dispatchEvent(new CustomEvent("lenis-pause", { detail: true }));
    return () => {
      window.removeEventListener("keydown", onKey);
      window.dispatchEvent(new CustomEvent("lenis-pause", { detail: false }));
    };
  }, [open, photos.length]);

  const current = open === null ? null : photos[open];

  return (
    <section className={styles.wallSection}>
      <p className={styles.wallTitle}>{title}</p>
      <div className={styles.wall}>
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            className={styles.tile}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            aria-label={`Open photo: ${p.caption ?? p.alt}`}
          >
            <Image src={p.src} alt={p.alt} width={900} height={700} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px" className={styles.tileImg} />
            {p.tag && <span className={styles.tag}>{p.tag}</span>}
            {p.caption && <span className={styles.tileCaption}>{p.caption}</span>}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className={styles.lightbox}
            role="dialog"
            aria-modal="true"
            aria-label={current.caption ?? current.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.figure
              key={current.src}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={current.src} alt={current.alt} width={1600} height={1200} sizes="90vw" className={styles.lightboxImg} />
              <figcaption>
                {current.tag && <span className={styles.tagInline}>{current.tag}</span>}
                {current.caption ?? current.alt}
              </figcaption>
            </motion.figure>
            <button type="button" className={styles.close} onClick={() => setOpen(null)} aria-label="Close">×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
