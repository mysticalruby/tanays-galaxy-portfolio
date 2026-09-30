"use client";

import { useCallback, useId, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface SlideshowSlide {
  id: string;
  label: string;
  caption?: string;
  children: ReactNode;
}

interface SlideshowGalleryProps {
  slides: SlideshowSlide[];
  hiddenTitle: string;
  className?: string;
  compact?: boolean;
  /** Taller fixed-height media area for iframe embeds (e.g. Desmos). */
  embed?: boolean;
}

function ChevronIcon({ direction, compact }: { direction: "left" | "right"; compact?: boolean }) {
  return (
    <svg
      aria-hidden
      className={compact ? "h-4 w-4" : "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export function SlideshowGallery({
  slides,
  hiddenTitle,
  className = "",
  compact = false,
  embed = false,
}: SlideshowGalleryProps) {
  const titleId = useId();
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  if (count === 0) return null;

  const active = slides[index];
  const mediaHeight = embed
    ? compact
      ? "h-[20rem] sm:h-[22rem]"
      : "h-[24rem] sm:h-[28rem]"
    : compact
      ? "h-[16rem] sm:h-[18rem]"
      : "h-[20rem] sm:h-[24rem]";
  const captionMinHeight = compact ? "min-h-[4.5rem]" : "min-h-[5rem]";
  const arrowSize = compact
    ? "min-h-[36px] min-w-[36px]"
    : "min-h-[44px] min-w-[44px]";

  return (
    <section className={className} aria-labelledby={titleId}>
      <h3 id={titleId} className="sr-only">
        {hiddenTitle}
      </h3>

      <div className="overflow-hidden border border-white/10 bg-surface-navy">
        <div
          key={active.id}
          className={reducedMotion ? "" : "gallery-fade-in"}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}: ${active.label}`}
        >
          <div className={`relative w-full ${mediaHeight}`}>
            {active.children}

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous slide"
                  className={`absolute top-1/2 left-1.5 z-10 flex ${arrowSize} -translate-y-1/2 items-center justify-center rounded-full border border-silver/30 bg-bg-deep/90 text-silver transition-colors hover:border-blue hover:text-blue`}
                >
                  <ChevronIcon direction="left" compact={compact} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next slide"
                  className={`absolute top-1/2 right-1.5 z-10 flex ${arrowSize} -translate-y-1/2 items-center justify-center rounded-full border border-silver/30 bg-bg-deep/90 text-silver transition-colors hover:border-blue hover:text-blue`}
                >
                  <ChevronIcon direction="right" compact={compact} />
                </button>
              </>
            )}
          </div>

          {active.caption && (
            <p
              className={`border-t border-white/10 bg-surface-navy px-4 py-3 text-center text-sm leading-relaxed text-text-muted ${captionMinHeight}`}
            >
              {active.caption}
            </p>
          )}
        </div>
      </div>

      {count > 1 && (
        <nav
          className="mt-3 flex flex-wrap justify-center gap-1.5"
          aria-label="Slide navigation"
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.label}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index
                  ? "scale-110 bg-gold"
                  : "bg-silver/35 hover:bg-silver/60"
              }`}
            />
          ))}
        </nav>
      )}
    </section>
  );
}
