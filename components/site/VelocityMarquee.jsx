"use client";
import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Endless ticker that speeds up — and flips direction — with scroll velocity.
export default function VelocityMarquee({ items, baseVelocity = -2.5, className = "", separator = "✳" }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    moveBy += direction.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  const row = items.map((item, i) => (
    <span key={i} className="flex shrink-0 items-center">
      <span
        className={`px-[0.35em] font-serif text-[clamp(2.6rem,6.5vw,6.5rem)] leading-[1.05] tracking-[-0.02em] ${i % 2 ? "italic" : ""}`}
      >
        {item}
      </span>
      <span className="px-[0.35em] text-[clamp(1.3rem,3vw,3rem)] text-brand">{separator}</span>
    </span>
  ));

  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <span className="sr-only">{items.join(", ")}</span>
      <motion.div aria-hidden className="flex flex-nowrap whitespace-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {row}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
