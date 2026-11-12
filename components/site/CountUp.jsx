"use client";
import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// Counts from 0 to `value` the first time it scrolls into view.
export default function CountUp({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduce) {
      node.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}
