import Link from "next/link";
import Magnetic from "./Magnetic";
import WhatsAppIcon from "./WhatsAppIcon";
import { Reveal, RevealText } from "./Reveal";
import { PROCESS, SERVICES, SITE, whatsappLink } from "@/lib/site";

const pad = (n) => String(n).padStart(2, "0");

// Tools shown under a service: matching skills from the API, plus fixed extras.
function toolsFor(service, groups) {
  const fromApi = groups
    .filter((g) => service.categories.includes(g.category))
    .flatMap((g) => g.items.map((s) => s.name));
  return [...new Set([...fromApi, ...service.tools])].slice(0, 8);
}

// Home-page freelance section: what I build for clients and how a project runs.
export default function Services({ groups = [] }) {
  return (
    <section id="services" className="container-site scroll-mt-24 py-24 md:py-40">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <p className="label-mono text-dim">(03) — Freelance services</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5.2vw,5.2rem)] leading-[0.92] tracking-[-0.02em]">
              <RevealText text="Websites, web" /> <RevealText text="& mobile apps." className="italic" delay={0.1} />
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-ink/75">
              I work with businesses, startups and founders as a freelance developer — one person from the first call
              to launch day, across web and mobile.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  href="/start"
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
                WhatsApp
              </a>
            </div>
            <div className="mt-6">
              <span className="label-mono flex items-center gap-2 text-dim">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative size-2 rounded-full bg-brand" />
                </span>
                {SITE.availability}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {SERVICES.map((service, i) => {
            const tools = toolsFor(service, groups);
            return (
              <Reveal key={service.title} className="grid grid-cols-12 gap-4 border-t border-line py-9 md:py-12">
                <span className="label-mono col-span-2 pt-2 text-brand">{pad(i + 1)}</span>
                <div className="col-span-10">
                  <h3 className="font-serif text-[clamp(2.1rem,3.4vw,3.3rem)] leading-none tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-lg leading-relaxed text-ink/75">{service.text}</p>
                  <p className="label-mono mt-4 text-ink/60">{service.examples}</p>
                  {service.planType ? (
                    <Link
                      href={`/start?type=${service.planType}`}
                      className="label-mono link-line mt-5 inline-block text-ink transition-colors duration-300 hover:text-brand"
                    >
                      Price my {service.title.toLowerCase().replace(/s$/, "")} →
                    </Link>
                  ) : null}
                  {tools.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {tools.map((tool) => (
                        <li key={tool} className="label-mono rounded-full border border-line px-3 py-1.5 text-dim">
                          {tool}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="mt-20 md:mt-28">
        <p className="label-mono border-t border-line pt-4 text-dim">How a project works</p>
        <ol className="grid md:grid-cols-3">
          {PROCESS.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.08}
              className={`border-b border-line py-8 md:border-b-0 md:py-10 md:pr-8 ${i > 0 ? "md:border-l md:pl-8" : ""}`}
            >
              <span className="label-mono text-brand">Step {pad(i + 1)}</span>
              <h3 className="mt-5 font-serif text-[2.6rem] leading-none tracking-tight">{step.title}</h3>
              <p className="mt-4 leading-relaxed text-ink/75">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
