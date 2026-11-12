"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import portrait from "@/assets/portrait.png";
import { SITE, whatsappLink } from "@/lib/site";
import Magnetic from "./Magnetic";
import WhatsAppIcon from "./WhatsAppIcon";
import { EASE } from "./Reveal";

const HeroParticles = dynamic(() => import("./HeroParticles"), { ssr: false });

function Letters({ text, delay = 0 }) {
  const reduce = useReducedMotion();
  return text.split("").map((ch, i) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.06em] -mb-[0.06em] align-bottom">
      <motion.span
        className="inline-block"
        initial={reduce ? false : { y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.2, delay: delay + i * 0.05, ease: EASE }}
      >
        {ch}
      </motion.span>
    </span>
  ));
}

const fadeUp = (delay, reduce) => ({
  initial: reduce ? false : { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
});

export default function Hero({ projectCount = 0, liveCount = 0, years = 0, stack = [] }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "10%"]);
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-6%"]);
  const nameX = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-6%"]);

  const stats = [
    { value: projectCount, label: "Projects shipped" },
    { value: liveCount, label: "Live websites" },
    { value: `${years}+`, label: "Years building" },
  ].filter((s) => s.value && s.value !== "0+");

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-20 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_45%,black,transparent)]">
        <HeroParticles />
      </div>

      <div className="container-site">
        <motion.div
          {...fadeUp(0.9, reduce)}
          className="label-mono grid grid-cols-2 gap-4 border-t border-line pt-4 text-dim md:grid-cols-4"
        >
          <span className="col-span-2 md:col-span-1">{SITE.role}</span>
          <span className="hidden md:block">Based in {SITE.shortLocation}</span>
          <span className="hidden md:block">{SITE.coords}</span>
          <span className="hidden items-center justify-end gap-2 text-ink md:flex">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
            {SITE.availability}
          </span>
        </motion.div>

        <div className="grid gap-x-12 gap-y-10 pb-16 pt-10 md:pb-24 md:pt-14 lg:min-h-[calc(100svh-9.5rem)] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:items-end">
          {/* Name */}
          <div className="lg:col-span-7 lg:row-start-1">
            <motion.p {...fadeUp(0.1, reduce)} className="label-mono text-brand">
              Hi, I&apos;m
            </motion.p>
            <motion.h1
              aria-label={SITE.name}
              style={{ x: nameX }}
              className="mt-4 select-none font-serif text-[24vw] font-normal leading-[0.82] tracking-[-0.035em] sm:text-[18vw] lg:text-[clamp(5.5rem,13.5vw,14rem)]"
            >
              <span aria-hidden className="block whitespace-nowrap">
                <Letters text="Sachin" delay={0.15} />
              </span>
              <span aria-hidden className="block whitespace-nowrap pl-[8vw] italic lg:pl-[5vw]">
                <Letters text="Rathod" delay={0.4} />
                <motion.span
                  className="inline-block not-italic text-brand"
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
                >
                  .
                </motion.span>
              </span>
            </motion.h1>
          </div>

          {/* Portrait */}
          {/* On large screens the card is capped so it always fits the window height */}
          <div className="relative mx-auto w-full max-w-[440px] lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:mr-0 lg:max-w-[calc((100svh_-_16rem)*0.8_+_1.5rem)] lg:self-center">
            <div className="relative mr-5 mb-5 md:mr-6 md:mb-6">
              {/* Offset colour card behind the photo */}
              <motion.div aria-hidden style={{ y: plateY }} className="absolute inset-0">
                <motion.div
                  initial={reduce ? false : { opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, x: 22, y: 22 }}
                  transition={{ duration: 1.2, delay: 0.9, ease: EASE }}
                  className="absolute inset-0 rounded-[28px] bg-brand"
                />
              </motion.div>
              <motion.div
                initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0% round 28px)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
                transition={{ duration: 1.4, delay: 0.25, ease: EASE }}
                className="group relative aspect-[4/5] select-none overflow-hidden rounded-[28px] bg-surface"
              >
                <motion.div style={{ y: photoY }} className="absolute -inset-y-[8%] inset-x-0">
                  <motion.div
                    className="absolute inset-0"
                    initial={reduce ? false : { scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, delay: 0.25, ease: EASE }}
                  >
                    <Image
                      src={portrait}
                      alt={`${SITE.name}, freelance fullstack developer`}
                      fill
                      priority
                      placeholder="blur"
                      sizes="(min-width: 1024px) 36vw, 90vw"
                      className="object-cover object-[50%_18%] transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.04]"
                    />
                  </motion.div>
                </motion.div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

                <motion.span
                  {...fadeUp(1.3, reduce)}
                  className="label-mono absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-white backdrop-blur-md"
                >
                  <span className="relative flex size-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-70" />
                    <span className="relative size-1.5 rounded-full bg-brand" />
                  </span>
                  Replies within 24 hours
                </motion.span>

                <motion.div {...fadeUp(1.4, reduce)} className="absolute inset-x-5 bottom-5 text-white md:inset-x-6 md:bottom-6">
                  <p className="font-serif text-[clamp(1.6rem,2.2vw,2.2rem)] leading-none">{SITE.name}</p>
                  <p className="label-mono mt-2 text-white/75">Websites · Web apps · Mobile apps</p>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Intro, actions, quick facts */}
          <div className="lg:col-span-6 lg:row-start-2">
            <motion.p
              {...fadeUp(1.0, reduce)}
              className="max-w-[38ch] text-[clamp(1.1rem,1.4vw,1.35rem)] leading-snug text-ink/85"
            >
              I&apos;m a freelance fullstack developer in Mumbai. I build{" "}
              <span className="text-ink">websites</span>, <span className="text-ink">web apps</span> and{" "}
              <span className="text-ink">mobile apps</span> — from the database to the last pixel.
            </motion.p>

            <motion.div {...fadeUp(1.15, reduce)} className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 rounded-full bg-brand px-7 py-3.5 font-medium text-brand-ink transition-transform duration-500 ease-expo hover:scale-[1.03]"
                >
                  Start a project
                  <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
                </Link>
              </Magnetic>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3.5 transition-colors duration-300 hover:border-brand hover:text-brand"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp me
              </a>
              <a href="#work" className="link-line ml-1 px-1 py-2 text-ink/80 transition-colors hover:text-ink">
                See my work ↓
              </a>
            </motion.div>

            {stats.length > 0 && (
              <motion.dl
                {...fadeUp(1.3, reduce)}
                className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-4"
              >
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-serif text-4xl leading-none">{s.value}</dd>
                    <dd className="label-mono mt-2 text-dim">{s.label}</dd>
                  </div>
                ))}
              </motion.dl>
            )}
            {stack.length > 0 && (
              <motion.p {...fadeUp(1.4, reduce)} className="label-mono mt-6 text-dim">
                {stack.join(" · ")}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
