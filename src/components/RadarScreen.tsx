"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ExploringTopic } from "@/types/content";

const SIZE = 480;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 36;
const SWEEP_PERIOD_MS = 5000;
const DETECT_ARC = 22;

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
      topics.forEach((topic) => {
        if (angleDiff(angle, topic.bearing) <= DETECT_ARC) {
          detected.add(topic.id);
        }
      });
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
        className="relative w-full rounded-xl border border-green-500/30 bg-bg-deep p-4 shadow-[0_0_40px_rgba(74,222,128,0.08)]"
        role="img"
        aria-label="Radar visualization of current interests"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block aspect-square"
        >
          {[0.33, 0.66, 1].map((scale) => (
            <circle
              key={scale}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * scale}
              fill="none"
              stroke="#4ADE80"
              strokeWidth="0.5"
              opacity="0.25"
            />
          ))}
          <line
            x1={CENTER}
            y1={CENTER - MAX_RADIUS}
            x2={CENTER}
            y2={CENTER + MAX_RADIUS}
            stroke="#4ADE80"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1={CENTER - MAX_RADIUS}
            y1={CENTER}
            x2={CENTER + MAX_RADIUS}
            y2={CENTER}
            stroke="#4ADE80"
            strokeWidth="0.5"
            opacity="0.2"
          />

          <g transform={`rotate(${sweepAngle} ${CENTER} ${CENTER})`}>
            <path
              d={`M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - MAX_RADIUS} A ${MAX_RADIUS} ${MAX_RADIUS} 0 0 1 ${CENTER + MAX_RADIUS * Math.sin((DETECT_ARC * Math.PI) / 180)} ${CENTER - MAX_RADIUS * Math.cos((DETECT_ARC * Math.PI) / 180)} Z`}
              fill="url(#sweepGradient)"
            />
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - MAX_RADIUS}
              stroke="#4ADE80"
              strokeWidth="1.5"
              opacity="0.85"
            />
          </g>

          <defs>
            <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
            </radialGradient>
          </defs>

          {topics.map((topic) => {
            const { x, y } = blipPosition(topic.bearing, topic.distance);
            const detected = detectedIds.has(topic.id);
            const r = detected ? 11 : 8;

            return (
              <g key={topic.id}>
                {detected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="1.25"
                    opacity="0.6"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={detected ? "#4ADE80" : "#1A2332"}
                  stroke="#4ADE80"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y - 18}
                  textAnchor="middle"
                  fill={detected ? "#4ADE80" : "#8B95A5"}
                  fontSize="11"
                  className="pointer-events-none select-none font-readout"
                >
                  {topic.label.split(" ")[0]}
                </text>
              </g>
            );
          })}

          <circle cx={CENTER} cy={CENTER} r={8} fill="#4ADE80" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
