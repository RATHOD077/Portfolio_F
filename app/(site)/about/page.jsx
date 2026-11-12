import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/portrait.png";
import PageHeader from "@/components/site/PageHeader";
import ParallaxMedia from "@/components/site/ParallaxMedia";
import Timeline from "@/components/site/Timeline";
import Magnetic from "@/components/site/Magnetic";
import { Reveal, RevealText } from "@/components/site/Reveal";
import { getResumeUrl } from "@/lib/content";
import { INTERESTS, PRINCIPLES, QUOTE, SITE, STORY, TIMELINE } from "@/lib/site";

export const metadata = {
  title: "About",
  description:
    "Sachin Rathod — Computer Engineer from Mumbai and freelance fullstack developer building websites, web apps and mobile apps.",
};

export default async function AboutPage() {
  const resume = await getResumeUrl();

  return (
    <>
      <PageHeader label="About" meta={SITE.location} title="Engineer by degree," italic="builder by habit." />

      <section className="container-site grid gap-12 pb-24 md:grid-cols-12 md:pb-36">
        <div className="md:col-span-5">
          <div className="relative mb-5 mr-5">
            {/* Offset colour card behind the photo, as on the home page */}
            <div aria-hidden className="absolute inset-0 translate-x-5 translate-y-5 rounded-[28px] bg-brand" />
            <ParallaxMedia className="aspect-[4/5] select-none rounded-[28px]" amount={8}>
              <Image
                src={portrait}
                alt={`Portrait of ${SITE.name}`}
                fill
                priority
                placeholder="blur"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </ParallaxMedia>
          </div>
          <p className="label-mono mt-9 flex justify-between gap-4 text-dim">
            <span>{SITE.role}</span>
            <span>B.E. Computer Engineering</span>
          </p>
        </div>

        <div className="flex flex-col md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="font-serif text-[clamp(1.8rem,2.8vw,2.6rem)] leading-[1.15]">{STORY[0]}</p>
          </Reveal>
          {STORY.slice(1).map((paragraph, i) => (
            <Reveal key={i} delay={0.08 * (i + 1)}>
              <p className="mt-8 text-lg leading-relaxed text-ink/80">{paragraph}</p>
            </Reveal>
          ))}
          <Reveal className="mt-12 flex flex-wrap gap-3">
            {resume ? (
              <Magnetic>
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink"
                >
                  View résumé ↗
                </a>
              </Magnetic>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 transition-colors duration-300 hover:border-ink/40"
            >
              Get in touch →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="container-site pb-24 md:pb-36">
        <p className="label-mono border-t border-line pt-4 text-dim">(01) — How I work</p>
        <div className="grid md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.08}
              className={`border-b border-line py-10 md:border-b-0 ${i > 0 ? "md:border-l md:pl-8" : ""} md:pr-8`}
            >
              <span className="label-mono text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-serif text-[2.6rem] leading-none tracking-tight">{p.title}</h3>
              <p className="mt-4 leading-relaxed text-ink/75">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-site pb-24 md:pb-36">
        <p className="label-mono text-dim">(02) — The path so far</p>
        <h2 className="mb-10 mt-4 font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.02em] md:mb-14">
          <RevealText text="Four years," /> <RevealText text="one direction." className="italic" delay={0.1} />
        </h2>
        <Timeline items={TIMELINE} />
      </section>

      <section className="container-site pb-24 md:pb-32">
        <div className="grid gap-6 border-t border-line pt-8 md:grid-cols-12">
          <p className="label-mono text-dim md:col-span-4">(03) — Off the clock</p>
          <Reveal as="p" className="font-serif text-[clamp(1.9rem,3.6vw,3.4rem)] leading-tight md:col-span-8">
            {INTERESTS.map((interest, i) => (
              <span key={interest}>
                {interest}
                {i < INTERESTS.length - 1 ? <span className="text-brand"> / </span> : null}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container-site pb-28 text-center md:pb-40">
        <blockquote>
          <p className="mx-auto max-w-[16ch] font-serif text-[clamp(2.6rem,7vw,7rem)] italic leading-[0.95] tracking-[-0.02em]">
            <RevealText text={`“${QUOTE}”`} />
          </p>
          <footer className="label-mono mt-8 text-dim">— {SITE.name}</footer>
        </blockquote>
      </section>
    </>
  );
}
