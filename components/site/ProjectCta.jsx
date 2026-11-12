import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "./Magnetic";

// Big "Start a project" call to action used in the footer.
// Hover: orange fills the pill outward from the arrow, the label rolls up and
// is replaced in the new colour, and the arrow turns. A soft sheen passes over
// it every few seconds to draw the eye (disabled with reduced motion).
export default function ProjectCta({ href = "/contact" }) {
  const label = (
    <>
      Start a <span className="italic">project</span>
    </>
  );

  return (
    <Magnetic strength={0.25}>
      <Link
        href={href}
        className="group relative isolate flex items-center justify-between gap-5 overflow-hidden rounded-full bg-ink py-2.5 pl-7 pr-2.5 text-canvas shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-expo active:scale-[0.97] md:gap-9 md:pl-9"
      >
        {/* Orange fill that grows out of the arrow circle on hover */}
        <span
          aria-hidden
          className="absolute right-2.5 top-1/2 -z-10 size-14 -translate-y-1/2 rounded-full bg-brand transition-transform duration-[900ms] ease-expo group-hover:scale-[11] md:size-16"
        />
        {/* Passing sheen */}
        <span aria-hidden className="cta-sheen pointer-events-none absolute inset-0 -z-[5] transition-opacity duration-500 group-hover:opacity-0" />

        <span className="flex flex-col">
          <span className="label-mono flex items-center gap-2 text-canvas/60 transition-colors duration-500 group-hover:text-brand-ink/75">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-70 group-hover:bg-brand-ink" />
              <span className="relative size-1.5 rounded-full bg-brand transition-colors duration-500 group-hover:bg-brand-ink" />
            </span>
            Taking new projects
          </span>
          {/* Rolling label: the first copy slides up and out, the second slides in */}
          <span className="relative mt-1 block overflow-hidden pb-[0.08em] font-serif text-[2rem] leading-[1.05] tracking-tight md:text-[2.7rem]">
            <span className="block transition-transform duration-700 ease-expo group-hover:-translate-y-[110%]">{label}</span>
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 block translate-y-[110%] text-brand-ink transition-transform duration-700 ease-expo group-hover:translate-y-0"
            >
              {label}
            </span>
          </span>
        </span>

        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-brand-ink transition-colors duration-500 group-hover:bg-canvas group-hover:text-ink md:size-16">
          <ArrowUpRight
            aria-hidden
            className="size-6 transition-transform duration-700 ease-expo group-hover:rotate-45 md:size-7"
            strokeWidth={1.8}
          />
        </span>
      </Link>
    </Magnetic>
  );
}
