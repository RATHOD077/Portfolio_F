"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Splits text into words, tracking _underscored phrases_ (one or more words) as accents.
function tokenize(text) {
  let open = false;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      let word = raw;
      let accent = open;
      if (word.startsWith("_")) {
        accent = true;
        open = true;
        word = word.slice(1);
      }
      if (/_[.,;:!?]?$/.test(word)) {
        open = false;
        word = word.replace(/_([.,;:!?]?)$/, "$1");
      }
      return { word, accent };
    });
}

// A paragraph whose words light up one by one as it scrolls through the viewport.
// Wrap words in underscores (_like this_) to set them in brand italic.
export default function ScrollWords({ text, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = tokenize(text);

  return (
    <p ref={ref} className={className}>
      {words.map(({ word, accent }, i) => {
        const start = i / words.length;
        return (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[start, start + 1 / words.length]}
            accent={accent}
            still={reduce}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({ children, progress, range, accent, still }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span
        style={still ? undefined : { opacity }}
        className={accent ? "font-serif italic text-brand" : undefined}
      >
        {children}
      </motion.span>{" "}
    </>
  );
}
