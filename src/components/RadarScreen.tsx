"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ExploringTopic } from "@/types/content";

const SIZE = 480;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 36;
const SWEEP_PERIOD_MS = 4500;
const DETECT_ARC = 28;
const ACCENT = "#4ADE80";
const ACCENT_DIM = "#4A9FD4";
const BG = "#0F1419";

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function angleDiff(a: number, b: number) {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(d, 360 - d);
}

function blipPosition(bearing: number, distance: number) {
  const rad = (bearing * Math.PI) / 180;
  const r = distance * MAX_RADIUS;
  return {
    x: CENTER + Math.sin(rad) * r,
    y: CENTER - Math.cos(rad) * r,
  };
}

function sweepWedgePath(arcDeg: number) {
  const rad = (arcDeg * Math.PI) / 180;
  const x = CENTER + Math.sin(rad) * MAX_RADIUS;
  const y = CENTER - Math.cos(rad) * MAX_RADIUS;
  return `M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - MAX_RADIUS} A ${MAX_RADIUS} ${MAX_RADIUS} 0 0 1 ${x} ${y} Z`;
}

interface RadarScreenProps {
  topics: ExploringTopic[];
  hint: string;
}

export function RadarScreen({ topics, hint }: RadarScreenProps) {
  const reducedMotion = useReducedMotion();
  const [sweepAngle, setSweepAngle] = useState(0);
  const [detectedIds, setDetectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const period = reducedMotion ? SWEEP_PERIOD_MS * 2 : SWEEP_PERIOD_MS;

    const tick = (now: number) => {
      const elapsed = (now - start) % period;
      const angle = (elapsed / period) * 360;
      setSweepAngle(angle);

      const detected = new Set<string>();
      for (const topic of topics) {
        if (angleDiff(angle, topic.bearing) <= DETECT_ARC) {
          detected.add(topic.id);
        }
      }
      setDetectedIds(detected);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, topics]);

  return (
    <div className="mx-auto w-full max-w-[32rem] sm:max-w-[36rem]">
      <p className="mb-4 text-center text-sm text-text-muted">{hint}</p>

      <div
        className="relative w-full rounded-none border border-silver/50 bg-bg-deep p-3 sm:p-4"
        role="img"
        aria-label="Radar visualization of current interests"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block aspect-square"
        >
          <defs>
            <linearGradient
              id="radarSweepFade"
              gradientUnits="userSpaceOnUse"
              x1={CENTER}
              y1={CENTER}
              x2={CENTER + MAX_RADIUS}
              y2={CENTER}
            >
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.45" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS}
            fill={BG}
            stroke={ACCENT_DIM}
            strokeWidth="1.25"
          />

          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle
              key={scale}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * scale}
              fill="none"
              stroke={ACCENT}
              strokeWidth="0.75"
              opacity="0.28"
            />
          ))}

          {[0, 45, 90, 135].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={CENTER - Math.cos(rad) * MAX_RADIUS}
                y1={CENTER - Math.sin(rad) * MAX_RADIUS}
                x2={CENTER + Math.cos(rad) * MAX_RADIUS}
                y2={CENTER + Math.sin(rad) * MAX_RADIUS}
                stroke={ACCENT_DIM}
                strokeWidth="0.6"
                opacity="0.35"
              />
            );
          })}

          <g transform={`rotate(${sweepAngle} ${CENTER} ${CENTER})`}>
            <path d={sweepWedgePath(DETECT_ARC)} fill="url(#radarSweepFade)" />
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - MAX_RADIUS}
              stroke={ACCENT}
              strokeWidth="2"
              opacity="0.95"
            />
          </g>

          {topics.map((topic) => {
            const { x, y } = blipPosition(topic.bearing, topic.distance);
            const detected = detectedIds.has(topic.id);
            const r = detected ? 10 : 7;
            const label = topic.label;

            return (
              <g key={topic.id}>
                {detected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={18}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={detected ? ACCENT : BG}
                  stroke={ACCENT}
                  strokeWidth={1.5}
                />
                <text
                  x={x}
                  y={y - 16}
                  textAnchor="middle"
                  fill={detected ? ACCENT : "#8B95A5"}
                  fontSize="12"
                  fontWeight={detected ? 600 : 500}
                  className="pointer-events-none select-none font-readout"
                >
                  {label.length > 18 ? `${label.slice(0, 16)}…` : label}
                </text>
              </g>
            );
          })}

          <circle cx={CENTER} cy={CENTER} r={6} fill={ACCENT} opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}
