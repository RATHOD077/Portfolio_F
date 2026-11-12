"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import Media from "./Media";
import { EASE, Reveal, RevealText } from "./Reveal";
import { useMediaQuery } from "./hooks";
import { CATEGORY_LABELS } from "@/lib/site";

const pad = (n) => String(n).padStart(2, "0");
const SPEED = 55; // pixels per second, moving left → right
const DRAG_THRESHOLD = 6;

function ProjectCard({ project, index, hidden }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-cursor="View project"
      draggable={false}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="group block w-[78vw] shrink-0 select-none sm:w-[46vw] lg:w-[31vw] xl:w-[27vw]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-surface">
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.06]">
          <Media src={project.image} alt={project.title} title={project.title} label="" sizes="(min-width: 1024px) 31vw, 78vw" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="label-mono absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur-md">
          {pad(index + 1)} · {CATEGORY_LABELS[project.category] ?? project.category}
        </span>
        {project.featured && (
          <span className="label-mono absolute right-4 top-4 rounded-full bg-brand px-3 py-1.5 text-brand-ink">
            Featured
          </span>
        )}
        <span className="absolute bottom-4 right-4 grid size-11 translate-y-3 place-items-center rounded-full bg-brand text-lg text-brand-ink opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100">
          ↗
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="truncate font-serif text-[clamp(1.6rem,2.1vw,2.4rem)] leading-none tracking-tight transition-colors duration-300 group-hover:text-brand">
          {project.title}
        </h3>
        <span className="label-mono flex shrink-0 items-center gap-2 text-dim">
          {project.live ? (
            <span className="flex items-center gap-1.5 text-ink/80">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          ) : null}
          {project.year ?? ""}
        </span>
      </div>
      <p className="label-mono mt-2 truncate text-dim">
        {project.tech.slice(0, 4).join(" · ") || project.shortDesc || "View case study"}
      </p>
    </Link>
  );
}

// Home-page project scroller: an endless row of project cards that drifts
// left → right, speeds up and leans with page scroll, pauses on hover/focus,
// and can be dragged, swiped or stepped with the arrow buttons.
export default function FeaturedWork({ projects, total }) {
  const reduce = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const setRef = useRef(null);
  const [width, setWidth] = useState(0); // width of one full set of cards
  const [step, setStep] = useState(400); // one card + gap
  const [copies, setCopies] = useState(3);
  const [paused, setPaused] = useState(false); // pause button
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const x = useMotionValue(0);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: 0, id: null });
  const nudging = useRef(false);

  // Scroll velocity → speed boost and a slight lean.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, (v) => Math.min(5, Math.abs(v) / 350));
  const skew = useTransform(velocity, [-2500, 0, 2500], reduce ? [0, 0, 0] : [3, 0, -3]);

  const wrap = useCallback(
    (v) => (width ? ((((v % width) + width) % width) - width) : v), // keeps x in [-width, 0)
    [width]
  );

  // Measure the row and how many copies are needed to fill wide screens.
  useEffect(() => {
    const el = setRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const first = el.children[0];
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      if (first) setStep(first.offsetWidth + gap);
      if (w) {
        setWidth(w);
        setCopies(Math.max(3, Math.ceil(window.innerWidth / w) + 2));
        x.set(-w);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [projects.length, x]);

  const stopped = reduce || paused || hovered || focused || dragging;

  useAnimationFrame((_, delta) => {
    if (!width || stopped || nudging.current) return;
    const dt = Math.min(delta, 64) / 1000;
    x.set(wrap(x.get() + SPEED * (1 + boost.get()) * dt));
  });

  const nudge = (direction) => {
    nudging.current = true;
    const from = x.get();
    animate(from, from + direction * step, {
      duration: 0.8,
      ease: EASE,
      onUpdate: (v) => x.set(wrap(v)),
      onComplete: () => {
        nudging.current = false;
      },
    });
  };

  /* drag & swipe — capture the pointer only once it really moves, so plain clicks still open projects */
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, startOffset: x.get(), moved: 0, id: e.pointerId };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved > DRAG_THRESHOLD) {
      if (!dragging) {
        setDragging(true);
        e.currentTarget.setPointerCapture?.(d.id);
      }
      x.set(wrap(d.startOffset + dx));
    }
  };
  const endDrag = () => {
    drag.current.active = false;
    setDragging(false);
  };
  const onClickCapture = (e) => {
    if (drag.current.moved > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.moved = 0;
  };
  // Horizontal trackpad swipes move the row too.
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) x.set(wrap(x.get() - e.deltaX));
  };

  if (!projects.length) return null;

  const isPaused = paused || reduce;
  const controlClass =
    "grid size-11 place-items-center rounded-full border border-line text-lg transition-colors duration-300 hover:border-brand hover:text-brand";

  return (
    <section id="work" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28" aria-roledescription="carousel" aria-label="Selected projects">
      <div className="container-site flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-mono text-dim">(01) — Selected work</p>
          <h2 className="mt-4 font-serif text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.9] tracking-[-0.02em]">
            <RevealText text="Things I've" /> <RevealText text="built" className="italic" delay={0.15} />
          </h2>
        </div>
        <Reveal y={10} className="flex items-center gap-2">
          <button type="button" onClick={() => nudge(1)} aria-label="Previous projects" className={controlClass}>
            ←
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={isPaused}
            aria-label={isPaused ? "Play the project scroller" : "Pause the project scroller"}
            className={controlClass}
            disabled={reduce}
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            )}
          </button>
          <button type="button" onClick={() => nudge(-1)} aria-label="Next projects" className={controlClass}>
            →
          </button>
          <Link
            href="/projects"
            className="ml-2 hidden rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink sm:inline-flex"
          >
            All projects ({total}) →
          </Link>
        </Reveal>
      </div>

      <Reveal y={40} delay={0.1} className="mt-12 md:mt-14">
        <div
          className={`relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ touchAction: "pan-y" }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            endDrag();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onWheel={onWheel}
          onFocus={() => setFocused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
        >
          <motion.div className="flex w-max" style={{ x, skewX: skew }}>
            {Array.from({ length: copies }, (_, copy) => (
              <div key={copy} ref={copy === 0 ? setRef : undefined} className="flex gap-6 pr-6 md:gap-8 md:pr-8">
                {projects.map((p, i) => (
                  <ProjectCard key={`${copy}-${p.id}`} project={p} index={i} hidden={copy > 0} />
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </Reveal>

      <div className="container-site mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="label-mono text-dim">
          {!canHover
            ? "Swipe or use the arrows"
            : reduce
              ? "Drag or use the arrows"
              : "Hover to pause · drag or use the arrows"}
        </p>
        <Link href="/projects" className="label-mono link-line text-ink sm:hidden">
          All projects ({total}) →
        </Link>
      </div>
    </section>
  );
}
