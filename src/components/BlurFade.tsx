"use client";

import { motion } from "motion/react";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import type { ReactNode } from "react";

/** Soft fade-up. Filter and transform are cleared at the end so fixed-position modals inside still work.
 *  Soft fade-up with a little blur, in the style of Cult UI / Magic UI "blur fade". */
export function BlurFade({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useSafeReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
