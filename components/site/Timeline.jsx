"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "./Reveal";

// Year-by-year timeline with a line that draws down as you scroll through it.
export default function Timeline({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.6"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-0 left-0 top-0 hidden w-px bg-line md:block">
        <motion.div className="absolute inset-0 origin-top bg-brand" style={{ scaleY: progress }} />
      </div>
      <ol>
        {items.map((item) => (
          <Reveal
            as="li"
            key={item.year}
            className="grid grid-cols-12 gap-4 border-b border-line py-8 md:py-10 md:pl-10"
          >
            <span className="col-span-12 font-serif text-[clamp(2.8rem,6vw,5.5rem)] leading-none tracking-tight md:col-span-4">
              {item.year}
            </span>
            <span className="col-span-12 text-xl font-medium md:col-span-3 md:pt-3">{item.title}</span>
            <span className="col-span-12 leading-relaxed text-dim md:col-span-5 md:pt-3">{item.text}</span>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
