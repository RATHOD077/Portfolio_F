import PageHeader from "@/components/site/PageHeader";
import VelocityMarquee from "@/components/site/VelocityMarquee";
import { Reveal, RevealText } from "@/components/site/Reveal";
import { getSkills, groupSkills } from "@/lib/content";
import { SKILL_GROUPS } from "@/lib/site";

const pad = (n) => String(n).padStart(2, "0");

export const metadata = {
  title: "Skills",
  description: "The languages, frameworks and tools Sachin Rathod uses to take products from idea to production.",
};

export default async function SkillsPage() {
  const skills = await getSkills();
  const groups = groupSkills(skills);

  return (
    <>
      <PageHeader
        label="Toolbox"
        title="Tools I"
        italic="reach for"
        count={skills.length}
        intro="The languages, frameworks and services I use to take a product from idea to production — grouped by where they sit in the stack."
      />

      {skills.length > 0 && (
        <section aria-label="All tools" className="border-y border-line py-5 md:py-7">
          <VelocityMarquee items={skills.map((s) => s.name)} baseVelocity={2} />
        </section>
      )}

      <section className="container-site space-y-20 py-20 md:space-y-28 md:py-32">
        {groups.map((group, gi) => {
          const meta = SKILL_GROUPS[group.category] ?? { title: group.category, text: "" };
          return (
            <div key={group.category} className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="md:sticky md:top-32">
                  <p className="label-mono text-dim">
                    ({pad(gi + 1)}) — {group.items.length} {group.items.length === 1 ? "tool" : "tools"}
                  </p>
                  <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-none tracking-tight">
                    <RevealText text={meta.title} />
                  </h2>
                  {meta.text ? <p className="mt-4 max-w-xs leading-relaxed text-ink/70">{meta.text}</p> : null}
                </div>
              </div>
              <ul className="grid border-t border-line sm:grid-cols-2 sm:gap-x-8 md:col-span-7 md:col-start-6">
                {group.items.map((skill, i) => (
                  <Reveal
                    as="li"
                    key={skill.id}
                    delay={(i % 2) * 0.06}
                    className="group flex items-center justify-between gap-4 border-b border-line py-5"
                  >
                    <span className="flex items-center gap-3 text-2xl transition-transform duration-500 ease-expo group-hover:translate-x-2 md:text-[1.75rem]">
                      {skill.icon ? (
                        // Icons come from any URL entered in the admin panel.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={skill.icon} alt="" className="size-6 object-contain" loading="lazy" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-brand opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                      {skill.name}
                    </span>
                    <span className="label-mono text-dim">{pad(i + 1)}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
          );
        })}

        <Reveal className="grid gap-6 border-t border-line pt-8 md:grid-cols-12">
          <p className="label-mono text-dim md:col-span-4">(Currently exploring)</p>
          <p className="font-serif text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] md:col-span-7 md:col-start-6">
            TypeScript, cloud deployments and <span className="italic text-brand">AI-integrated</span> web apps.
          </p>
        </Reveal>
      </section>
    </>
  );
}
