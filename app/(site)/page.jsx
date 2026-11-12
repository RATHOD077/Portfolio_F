import Link from "next/link";
import Hero from "@/components/site/Hero";
import ScrollWords from "@/components/site/ScrollWords";
import VelocityMarquee from "@/components/site/VelocityMarquee";
import FeaturedWork from "@/components/site/FeaturedWork";
import CountUp from "@/components/site/CountUp";
import PostList from "@/components/site/PostList";
import Magnetic from "@/components/site/Magnetic";
import Services from "@/components/site/Services";
import { Reveal, RevealText } from "@/components/site/Reveal";
import {
  getPosts,
  getProjects,
  getResumeUrl,
  getSkills,
  groupSkills,
  pickFeatured,
  yearsBuilding,
} from "@/lib/content";
import { INTRO } from "@/lib/site";

// 2×2 grid on phones, one row of four on desktop, with hairlines between cells.
const STAT_CELL = [
  "pr-5 border-b md:border-b-0 md:pr-6",
  "pl-5 border-l border-b md:border-b-0 md:px-6",
  "pr-5 md:border-l md:px-6",
  "pl-5 border-l md:px-6",
];

export default async function HomePage() {
  const [projects, skills, posts, resume] = await Promise.all([
    getProjects(),
    getSkills(),
    getPosts(),
    getResumeUrl(),
  ]);

  const featured = pickFeatured(projects, 12);
  const groups = groupSkills(skills);
  const stats = [
    { value: projects.length, label: "Projects shipped" },
    { value: projects.filter((p) => p.live).length, label: "Live in production" },
    { value: skills.length, label: "Tools in the stack" },
    { value: yearsBuilding(), suffix: "+", label: "Years building for the web" },
  ];

  return (
    <>
      <Hero
        projectCount={projects.length}
        liveCount={projects.filter((p) => p.live).length}
        years={yearsBuilding()}
        stack={["Next.js", "React", "Node.js", "MySQL", "Flutter"]}
      />

      {/* (01) Selected work — auto-scrolling project row */}
      <FeaturedWork projects={featured} total={projects.length} />

      {/* (02) Intro */}
      <section id="intro" className="container-site scroll-mt-24 py-24 md:py-36">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label-mono text-dim md:col-span-3">(02) — Intro</p>
          <ScrollWords
            text={INTRO}
            className="font-serif text-[clamp(1.9rem,4.1vw,4rem)] leading-[1.1] tracking-[-0.01em] md:col-span-9"
          />
        </div>
        <Reveal className="mt-12 flex flex-wrap gap-3 md:ml-[25%] md:mt-16">
          <Magnetic>
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink"
            >
              More about me
              <span className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
            </Link>
          </Magnetic>
          {resume ? (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-line px-7 py-3.5 transition-colors duration-300 hover:border-ink/40"
            >
              Résumé ↗
            </a>
          ) : null}
        </Reveal>
      </section>

      {/* Tools ticker */}
      {skills.length > 0 && (
        <section aria-label="Tools I use" className="border-y border-line py-5 md:py-7">
          <VelocityMarquee items={skills.map((s) => s.name)} />
        </section>
      )}

      {/* (03) Freelance services */}
      <Services groups={groups} />

      {/* (04) Numbers */}
      {projects.length > 0 && (
        <section className="container-site pb-24 md:pb-40">
          <p className="label-mono border-t border-line pt-4 text-dim">(04) — By the numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal
                key={s.label}
                delay={i * 0.08}
                className={`border-line py-8 md:py-12 ${STAT_CELL[i]}`}
              >
                <div className="font-serif text-[clamp(4rem,9vw,9rem)] leading-none tracking-tight">
                  <CountUp value={s.value} />
                  {s.suffix ? <span className="text-brand">{s.suffix}</span> : null}
                </div>
                <p className="label-mono mt-3 text-dim">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* (05) Blog */}
      {posts.length > 0 && (
        <section className="container-site pb-24 md:pb-36">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="label-mono text-dim">(05) — Blog</p>
              <h2 className="mt-4 font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.02em]">
                <RevealText text="Notes from the" /> <RevealText text="workbench" className="italic" delay={0.1} />
              </h2>
            </div>
            <Link href="/blog" className="label-mono link-line hidden shrink-0 pb-2 md:inline-block">
              All posts →
            </Link>
          </div>
          <PostList posts={posts.slice(0, 3)} />
        </section>
      )}
    </>
  );
}
