"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, true afterwards.
 * Used to guard localStorage-backed (zustand persist) reads so server and
 * client markup match on first paint — without a setState-in-effect pattern.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
