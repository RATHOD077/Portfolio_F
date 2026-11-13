"use client";
import { useState } from "react";
import Link from "next/link";
import Media from "./Media";
import { Reveal, RevealText } from "./Reveal";

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/** Client photo, or their initials if there is no photo (or it fails to load). */
function Avatar({ name, src, size = "size-12" }) {
  const [failed, setFailed] = useState(!src);
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-brand-ink`}>
      <span className="font-mono text-sm font-medium" aria-hidden>
        {initialsOf(name)}
      </span>
      {!failed ? (
        <span className="absolute inset-0">
          <Media src={src} alt={name} sizes="96px" onFail={() => setFailed(true)} />
        </span>
      ) : null}
    </span>
  );
}

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <span className="flex gap-0.5 text-brand" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={`size-4 ${n <= rating ? "" : "opacity-25"}`} fill="currentColor" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function Author({ t }) {
  const about = [t.role, t.company].filter(Boolean).join(" · ");
  return (
    <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
      <Avatar name={t.name} src={t.avatar} />
      <span className="min-w-0 flex-1">
        <span className="block text-lg leading-tight">{t.name}</span>
        {about ? <span className="label-mono mt-1 block text-dim">{about}</span> : null}
      </span>
      <Stars rating={t.rating} />
    </figcaption>
  );
}

/** One testimonial, used on a project's page ("What the client said"). */
export function TestimonialQuote({ t }) {
  return (
    <figure className="border-t border-line pt-8">
      <blockquote className="font-serif text-[clamp(1.7rem,2.6vw,2.4rem)] leading-[1.15] tracking-[-0.01em]">
        <span className="text-brand">“</span>
        {t.quote}
        <span className="text-brand">”</span>
      </blockquote>
      <Author t={t} />
    </figure>
  );
}

/** Home page section. Renders nothing until testimonials are added in the admin panel. */
export default function Testimonials({ items = [], number = "04" }) {
  if (!items.length) return null;
  const [first, ...rest] = items;

  return (
    <section className="container-site pb-24 md:pb-40" aria-labelledby="testimonials-title">
      <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
        <p className="label-mono text-dim md:col-span-3">({number}) — Kind words</p>
        <h2
          id="testimonials-title"
          className="font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.02em] md:col-span-9"
        >
          <RevealText text="What clients" /> <RevealText text="say" className="italic" delay={0.1} />
        </h2>
      </div>

      {/* The first testimonial, large */}
      <Reveal as="figure" className="border-t border-line pt-10 md:grid md:grid-cols-12 md:gap-6 md:pt-14">
        <span className="hidden font-serif text-[9rem] leading-[0.7] text-brand md:col-span-3 md:block" aria-hidden>
          “
        </span>
        <div className="md:col-span-9">
          <blockquote className="font-serif text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] tracking-[-0.015em]">
            {first.quote}
          </blockquote>
          <Author t={first} />
          {first.project ? (
            <Link href={`/projects/${first.project.slug}`} className="label-mono link-line mt-6 inline-block text-ink">
              See the {first.project.title} project →
            </Link>
          ) : null}
        </div>
      </Reveal>

      {/* The rest, two per row */}
      {rest.length > 0 && (
        <div className="mt-16 grid gap-x-10 gap-y-14 md:mt-24 md:grid-cols-2">
          {rest.map((t, i) => (
            <Reveal key={t.id} as="figure" delay={(i % 2) * 0.08} className="flex flex-col border-t border-line pt-8">
              <blockquote className="font-serif text-[clamp(1.5rem,2.2vw,2.1rem)] leading-[1.18]">
                <span className="text-brand">“</span>
                {t.quote}
                <span className="text-brand">”</span>
              </blockquote>
              <div className="mt-auto">
                <Author t={t} />
                {t.project ? (
                  <Link href={`/projects/${t.project.slug}`} className="label-mono link-line mt-5 inline-block text-dim hover:text-ink">
                    On {t.project.title} →
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
