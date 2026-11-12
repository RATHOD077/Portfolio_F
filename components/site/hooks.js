"use client";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

// true after hydration, false during server render — without a setState-in-effect.
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// Live result of a CSS media query (false on the server).
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
