"use client";
import { motion, useReducedMotion } from "framer-motion";

// Soft fade between pages. Opacity only — a transform here would break the
// fixed/pinned elements (GSAP pins, cursor preview) inside the page.
export default function Template({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
