"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE } from "./Reveal";

// A frame whose contents drift slower than the page, revealed with a wipe.
export default function ParallaxMedia({ children, className = "", amount = 10 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { clipPath: "inset(18% 8% 18% 8%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.4, ease: EASE }}
      className={`relative overflow-hidden bg-surface ${className}`}
    >
      <motion.div
        className="absolute inset-x-0"
        style={{ y: reduce ? 0 : y, top: `-${amount}%`, bottom: `-${amount}%` }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
