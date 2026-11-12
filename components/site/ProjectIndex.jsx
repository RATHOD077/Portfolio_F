"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Media from "./Media";
import { EASE } from "./Reveal";
import { CATEGORY_LABELS } from "@/lib/site";

const pad = (n) => String(n).padStart(2, "0");

// Full project list with category filters. On desktop, hovering a row shows a
// floating preview that follows the cursor; on touch screens the image is inline.
export default function ProjectIndex({ projects }) {
  const categories = useMemo(() => {
    const counts = new Map();
    projects.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return [["all", projects.length], ...counts.entries()];
  }, [projects]);

  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 160, damping: 20, mass: 0.5 });

  const onMove = (e) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };

  if (!projects.length) {
    return <p className="border-t border-line pt-8 text-lg text-dim">Projects will appear here soon.</p>;
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by type">
          {categories.map(([key, count]) => {
            const selected = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setFilter(key);
                  setActive(null);
                }}
                className={`label-mono rounded-full border px-4 py-2 transition-colors duration-300 ${
                  selected ? "border-ink bg-ink text-canvas" : "border-line text-dim hover:border-ink/40 hover:text-ink"
                }`}
              >
                {key === "all" ? "All" : CATEGORY_LABELS[key] ?? key} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="label-mono hidden grid-cols-12 gap-4 border-b border-line pb-3 text-dim md:grid">
        <span className="col-span-1">No.</span>
        <span className="col-span-6">Project</span>
        <span className="col-span-3">Stack</span>
        <span className="col-span-1">Type</span>
        <span className="col-span-1 text-right">Year</span>
      </div>

      <ul onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <motion.li
              key={`${filter}-${p.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: EASE }}
              onPointerEnter={() => setActive(i)}
              className="border-b border-line"
            >
              <Link
                href={`/projects/${p.slug}`}
                className={`group grid grid-cols-12 items-center gap-x-4 gap-y-4 py-6 transition-opacity duration-500 md:py-8 ${
                  active !== null && active !== i ? "md:opacity-30" : ""
                }`}
              >
                <span className="label-mono col-span-2 text-dim md:col-span-1">{pad(i + 1)}</span>
                <span className="col-span-10 font-serif text-[clamp(2.1rem,5vw,4.6rem)] leading-[0.95] tracking-tight transition-transform duration-700 ease-expo md:col-span-6 md:group-hover:translate-x-4">
                  {p.title}
                </span>
                <span className="label-mono col-span-12 text-dim md:col-span-3">
                  {p.tech.slice(0, 3).join(" · ") || "—"}
                </span>
                <span className="label-mono hidden text-dim md:col-span-1 md:block">
                  {CATEGORY_LABELS[p.category] ?? p.category}
                </span>
                <span className="label-mono hidden text-right text-dim md:col-span-1 md:block">{p.year ?? ""}</span>
                <div className="relative col-span-12 aspect-[16/10] overflow-hidden rounded-[4px] bg-surface md:hidden">
                  <Media src={p.image} alt={p.title} title={p.title} sizes="100vw" />
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Floating preview — desktop only */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          animate={{ scale: active !== null ? 1 : 0.6, opacity: active !== null ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[4px] bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          style={{ width: 400, height: 250 }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ y: `${-(active ?? 0) * 100}%` }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {list.map((p, i) => (
              <div key={`${filter}-${p.id}`} className="absolute inset-x-0 h-full" style={{ top: `${i * 100}%` }}>
                <Media src={p.image} alt="" title={p.title} sizes="400px" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
