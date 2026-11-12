"use client";
import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

const TAGS = {
  div: motion.div,
  section: motion.section,
  p: motion.p,
  span: motion.span,
  li: motion.li,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
};

// Fades and lifts its children into view once.
export function Reveal({ as = "div", children, className, delay = 0, y = 28, amount = 0.2, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Splits text into words that slide up from behind a mask.
// `immediate` plays on mount (for above-the-fold headings) instead of on scroll.
export function RevealText({ text, as = "span", className, delay = 0, stagger = 0.06, immediate = false }) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] ?? motion.span;
  const words = String(text).split(/\s+/).filter(Boolean);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 1, ease: EASE } },
  };

  const trigger = immediate
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, amount: 0.4 } };

  return (
    <Tag
      className={className}
      aria-label={text}
      variants={container}
      initial={reduce ? false : "hidden"}
      {...trigger}
    >
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
            <motion.span className="inline-block" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
