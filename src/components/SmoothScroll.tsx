"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Smooth wheel scrolling with Lenis. Off for anyone who prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const pause = (e: Event) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start());
    window.addEventListener("lenis-pause", pause);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("lenis-pause", pause);
      lenis.destroy();
    };
  }, []);
  return null;
}
