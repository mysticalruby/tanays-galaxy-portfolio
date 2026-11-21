"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const noop = () => () => {};

/**
 * Like motion's useReducedMotion, but false while hydrating so the server HTML
 * and the first client render match (no hydration error for visitors who have
 * "reduce motion" turned on).
 */
export function useSafeReducedMotion(): boolean {
  const reduce = useReducedMotion();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return hydrated && Boolean(reduce);
}
