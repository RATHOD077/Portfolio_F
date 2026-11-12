import Link from "next/link";
import { notFound } from "next/navigation";
import Media from "@/components/site/Media";
import ParallaxMedia from "@/components/site/ParallaxMedia";
import { Reveal, RevealText } from "@/components/site/Reveal";
import { getProject, getProjects } from "@/lib/content";
import { sanitizeCms } from "@/lib/sanitize";
import { CATEGORY_LABELS, SITE, STATUS_LABELS } from "@/lib/site";

const pad = (n) => String(n).padStart(2, "0");

export async function generateStaticParams() {
  const projects = await getProjects({ soft: true });
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug).catch(() => null);
  if (!project) return { title: "Project" };
  const type = CATEGORY_LABELS[project.category] ?? project.category;
  return {
    title: project.title,
    description: project.shortDesc || `${project.title} — a ${type.toLowerCase()} project by ${SITE.name}.`,
    openGraph: project.image ? { images: [{ url: project.image }] } : undefined,
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects({ soft: true })]);
  if (!project) notFound();

  const index = Math.max(0, all.findIndex((p) => p.slug === project.slug));
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const html = sanitizeCms(project.description);
  const type = CATEGORY_LABELS[project.category] ?? project.category;

  const facts = [
    { label: "Year", value: project.year ?? "—" },
    { label: "Type", value: type },
    { label: "Status", value: STATUS_LABELS[project.status] ?? project.status },
    { label: "Stack", value: project.tech.join(", ") || "—" },
  ];

  return (
    <article>
      <header className="container-site pt-28 md:pt-40">
        <Reveal y={0} className="label-mono flex justify-between gap-6 border-t border-line pt-4 text-dim">
          <Link href="/projects" className="link-line">
            ← All work
          </Link>
          {all.length > 0 ? (
            <span>
              Case {pad(index + 1)}/{pad(all.length)}
            </span>
          ) : null}
        </Reveal>

        <h1 className="mt-8 font-serif text-[clamp(3.2rem,10vw,10.5rem)] leading-[0.88] tracking-[-0.03em] md:mt-12">
          <RevealText text={project.title} immediate />
        </h1>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
          <Reveal delay={0.3} className="md:col-span-6">
            {project.shortDesc ? (
              <p className="max-w-[38ch] text-xl leading-snug text-ink/85 md:text-2xl">{project.shortDesc}</p>
            ) : null}
          </Reveal>
          <Reveal delay={0.4} className="flex flex-wrap gap-3 self-end md:col-span-5 md:col-start-8 md:justify-end">
            {project.live ? (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-canvas transition-colors duration-300 hover:bg-brand hover:text-brand-ink"
              >
                Visit live site
                <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </a>
            ) : null}
            {project.github ? (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 transition-colors duration-300 hover:border-ink/40"
              >
                Source code ↗
              </a>
            ) : null}
          </Reveal>
        </div>

        <dl className="mt-12 grid grid-cols-2 border-t border-line md:mt-16 md:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`border-line py-5 ${i % 2 ? "border-l pl-5" : "pr-5"} ${i < 2 ? "border-b md:border-b-0" : ""} ${i === 2 ? "md:border-l md:pl-5" : ""}`}
            >
              <dt className="label-mono text-dim">{f.label}</dt>
              <dd className="mt-2 text-lg leading-snug">{f.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="container-site mt-10 md:mt-14">
        <ParallaxMedia className="aspect-[16/10] rounded-[4px] md:aspect-[16/9]">
          <Media
            src={project.image}
            alt={project.title}
            title={project.title}
            priority
            sizes="(min-width: 1480px) 1400px, 100vw"
          />
        </ParallaxMedia>
      </div>

      <section className="container-site grid gap-12 py-20 md:grid-cols-12 md:py-32">
        <aside className="md:col-span-4">
          <div className="space-y-10 md:sticky md:top-32">
            <p className="label-mono text-dim">(Overview)</p>
            {project.tech.length > 0 && (
              <div>
                <p className="label-mono mb-3 text-dim">Built with</p>
                <ul className="border-t border-line">
                  {project.tech.map((t, i) => (
                    <li key={t} className="flex justify-between border-b border-line py-2.5">
                      <span>{t}</span>
                      <span className="label-mono text-dim">{pad(i + 1)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.skills.length > 0 && (
              <div>
                <p className="label-mono mb-3 text-dim">Skills used</p>
                <ul className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <li key={s.id ?? s.name} className="label-mono rounded-full border border-line px-3 py-1.5 text-dim">
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <div className="md:col-span-7 md:col-start-6">
          {html ? (
            <Reveal>
              <div className="prose-cms" dangerouslySetInnerHTML={{ __html: html }} />
            </Reveal>
          ) : (
            <Reveal>
              <p className="font-serif text-[clamp(1.7rem,2.6vw,2.5rem)] leading-snug text-ink/85">
                {project.shortDesc || `A ${type.toLowerCase()} project.`}{" "}
                {project.live ? "The best way to see it is live — use the link above." : ""}
              </p>
            </Reveal>
          )}

          {project.images.length > 0 && (
            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {project.images.map((src, i) => (
                <Reveal key={src} delay={(i % 2) * 0.08} className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-surface">
                  <Media src={src} alt={`${project.title} — screenshot ${i + 1}`} sizes="(min-width: 768px) 30vw, 100vw" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {next && next.slug !== project.slug && (
        <Link href={`/projects/${next.slug}`} data-cursor="Next project" className="group block border-t border-line">
          <div className="container-site grid items-end gap-8 py-16 md:grid-cols-12 md:py-24">
            <div className="md:col-span-7">
              <p className="label-mono text-dim">(Next project)</p>
              <p className="mt-4 font-serif text-[clamp(3rem,8vw,8.5rem)] leading-[0.88] tracking-[-0.03em] transition-colors duration-500 group-hover:text-brand">
                {next.title}{" "}
                <span className="inline-block transition-transform duration-700 ease-expo group-hover:translate-x-3">→</span>
              </p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-surface md:col-span-5">
              <div className="absolute inset-0 transition-transform duration-[1.2s] ease-expo group-hover:scale-105">
                <Media src={next.image} alt="" title={next.title} sizes="(min-width: 768px) 40vw, 100vw" />
              </div>
            </div>
          </div>
        </Link>
      )}
    </article>
  );
}
