"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProjectCta from "./ProjectCta";
import LocalTime from "./LocalTime";
import { RevealText } from "./Reveal";
import { getLenis } from "./SmoothScroll";
import WhatsAppIcon from "./WhatsAppIcon";
import { NAV, SITE, whatsappLink } from "@/lib/site";

export default function Footer() {
  const pathname = usePathname();
  const onContactPage = pathname === "/contact";

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-line">
      {!onContactPage && (
        <div className="container-site pb-16 pt-24 md:pb-24 md:pt-36">
          <p className="label-mono text-dim">(Freelance — taking new projects)</p>
          <h2 className="mt-6 font-serif text-[clamp(3.2rem,11vw,11.5rem)] leading-[0.86] tracking-[-0.03em]">
            <RevealText text="Got an idea?" as="span" className="block" />
            <RevealText text="Let's build it." as="span" className="block italic text-brand" delay={0.15} />
          </h2>
          <div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-mono mb-3 text-dim">Website, web app or mobile app — write to me</p>
              <a
                href={`mailto:${SITE.email}`}
                className="link-line font-serif text-[clamp(1.6rem,3.6vw,3.2rem)] leading-tight"
              >
                {SITE.email}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 flex w-fit items-center gap-2.5 rounded-full border border-line px-5 py-2.5 transition-colors duration-300 hover:border-brand hover:text-brand"
              >
                <WhatsAppIcon className="size-4" />
                or chat on WhatsApp
                <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </a>
            </div>
            <ProjectCta />
          </div>
        </div>
      )}

      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line py-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="label-mono mb-4 text-dim">Menu</p>
          <ul className="space-y-1.5">
            {[{ label: "Home", href: "/" }, ...NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-line">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label-mono mb-4 text-dim">Elsewhere</p>
          <ul className="space-y-1.5">
            {SITE.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-line">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label-mono mb-4 text-dim">Contact</p>
          <ul className="space-y-1.5">
            <li>
              <a href={`mailto:${SITE.email}`} className="link-line break-all">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link-line">
                WhatsApp ↗
              </a>
            </li>
            <li>
              <a href={SITE.phoneHref} className="link-line">
                {SITE.phone}
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3 md:text-right">
          <p className="label-mono mb-4 text-dim">Local time</p>
          <LocalTime prefix="" className="font-serif text-4xl" />
          <p className="mt-1 text-dim">{SITE.location}</p>
        </div>
      </div>

      <div className="container-site label-mono flex flex-wrap items-center justify-between gap-4 pb-6 text-dim">
        <span>
          © {new Date().getFullYear()} {SITE.name} ·{" "}
          <Link href="/privacy" className="link-line">
            Privacy
          </Link>
        </span>
        <span className="hidden md:inline">Built with Next.js, GSAP &amp; Lenis</span>
        <button type="button" onClick={toTop} className="link-line uppercase">
          Back to top ↑
        </button>
      </div>

      <div
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-serif text-[20.5vw] leading-[0.74] tracking-[-0.04em] text-ink/[0.07]"
      >
        Sachin <span className="italic">Rathod</span>
      </div>
    </footer>
  );
}
