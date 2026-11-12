"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { EASE } from "./Reveal";
import { useMediaQuery } from "./hooks";

// A small label that follows the mouse over elements with a data-cursor="…" attribute.
export default function CursorLabel() {
  const enabled = useMediaQuery("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  const [label, setLabel] = useState(null);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
      setLabel(el ? el.getAttribute("data-cursor") : null);
    };
    const onLeave = () => setLabel(null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[80]" style={{ x: sx, y: sy }}>
      <AnimatePresence>
        {label && (
          <motion.span
            key="cursor-label"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute left-4 top-4 origin-top-left whitespace-nowrap rounded-full bg-brand px-3.5 py-1.5 text-[0.8rem] font-medium text-brand-ink"
          >
            {label} ↗
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
