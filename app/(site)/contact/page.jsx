import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";
import CopyButton from "@/components/site/CopyButton";
import LocalTime from "@/components/site/LocalTime";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { Reveal } from "@/components/site/Reveal";
import { Mail, PenLine, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

const ICONS = {
  whatsapp: <WhatsAppIcon className="size-5" />,
  email: <Mail size={19} strokeWidth={1.6} />,
  call: <Phone size={19} strokeWidth={1.6} />,
  form: <PenLine size={19} strokeWidth={1.6} />,
};

export const metadata = {
  title: "Contact",
  description:
    "Hire Sachin Rathod, a freelance fullstack developer in Mumbai, to build your website, web app or mobile app. Reach out on WhatsApp, email, phone or the contact form.",
};

const CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: SITE.phone,
    note: "Chat with me directly",
    href: whatsappLink(),
    external: true,
  },
  {
    key: "email",
    label: "Email",
    value: SITE.email,
    note: "For briefs and documents",
    href: `mailto:${SITE.email}`,
    copy: SITE.email,
  },
  {
    key: "call",
    label: "Call",
    value: SITE.phone,
    note: "Prefer to talk it through",
    href: SITE.phoneHref,
  },
  {
    key: "form",
    label: "Form",
    value: "Write a message",
    note: "Pick how I should reply",
    href: "#contact-form",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Contact"
        meta={SITE.availability}
        title="Let's"
        italic="talk."
        intro="Need a website, a web app or a mobile app? Reach me however suits you — WhatsApp, email, a call, or the form. I usually reply within a day."
      />

      <section className="container-site grid gap-16 pb-24 md:grid-cols-12 md:pb-36">
        <div className="space-y-12 md:col-span-5">
          <div>
            <Reveal y={0}>
              <p className="label-mono mb-4 text-dim">Choose what suits you</p>
            </Reveal>
            <ul className="border-t border-line">
              {CHANNELS.map((c, i) => (
                <Reveal
                  as="li"
                  key={c.key}
                  delay={0.08 * i}
                  y={18}
                  className="group/row relative flex items-center gap-3 overflow-hidden border-b border-line"
                >
                  {/* Background that sweeps up on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-surface transition-transform duration-500 ease-expo group-hover/row:scale-y-100"
                  />
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group relative flex min-w-0 flex-1 items-center gap-4 py-5 pl-1 pr-2"
                  >
                    <span
                      className={`grid size-12 shrink-0 place-items-center rounded-full border transition-transform duration-500 ease-expo group-hover:scale-110 group-hover:-rotate-6 ${
                        c.key === "whatsapp" ? "border-brand bg-brand text-brand-ink" : "border-line text-ink/80"
                      }`}
                    >
                      {ICONS[c.key]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`label-mono block ${c.key === "whatsapp" ? "text-brand" : "text-dim"}`}>
                        {c.label} · {c.note}
                      </span>
                      <span className="mt-1 block truncate font-serif text-[clamp(1.4rem,2.1vw,2rem)] leading-tight transition-colors duration-300 group-hover:text-brand">
                        {c.value}
                      </span>
                    </span>
                    <span className="shrink-0 text-lg transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:translate-x-1">
                      {c.key === "form" ? "↓" : "↗"}
                    </span>
                  </a>
                  {c.copy ? <CopyButton value={c.copy} className="relative mr-2" /> : null}
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={0.1}>
            <p className="label-mono mb-3 text-dim">Location</p>
            <p className="text-xl">{SITE.location}</p>
            <LocalTime prefix="Local time" className="label-mono mt-1 block text-dim" />
          </Reveal>

          <Reveal delay={0.15}>
            <p className="label-mono mb-3 text-dim">Elsewhere</p>
            <ul className="border-t border-line">
              {SITE.socials.map((s) => (
                <li key={s.href} className="border-b border-line">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-3 text-xl"
                  >
                    {s.label}
                    <span className="transition-transform duration-500 ease-expo group-hover:-translate-y-1 group-hover:translate-x-1">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <Link
              href="/start"
              className="group mb-12 flex items-center justify-between gap-6 rounded-[4px] border border-line p-5 transition-colors duration-300 hover:border-brand md:p-6"
            >
              <span>
                <span className="label-mono text-brand">Not sure about scope or budget?</span>
                <span className="mt-2 block text-lg leading-snug">
                  Plan your project in four quick steps and see a rough price straight away.
                </span>
              </span>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                →
              </span>
            </Link>
          </Reveal>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
