import { Reveal, RevealText } from "./Reveal";

// Large editorial page title used at the top of inner pages.
export default function PageHeader({ label, meta, title, italic, count, intro, children }) {
  return (
    <section className="container-site pb-14 pt-28 md:pb-20 md:pt-40">
      <Reveal className="label-mono flex justify-between gap-6 border-t border-line pt-4 text-dim" y={0}>
        <span>({label})</span>
        {meta ? <span>{meta}</span> : null}
      </Reveal>
      <h1 className="mt-8 font-serif text-[clamp(3.4rem,11.5vw,12rem)] font-normal leading-[0.86] tracking-[-0.03em] md:mt-12">
        <RevealText text={title} immediate />
        {italic ? (
          <>
            {" "}
            <RevealText text={italic} immediate delay={0.12} className="italic" />
          </>
        ) : null}
        {count != null ? (
          <sup className="ml-2 align-top font-mono text-[0.13em] tracking-normal text-dim">({count})</sup>
        ) : null}
      </h1>
      {intro ? (
        <Reveal delay={0.35}>
          <p className="mt-8 max-w-[44ch] text-lg leading-snug text-ink/80 md:ml-[42%] md:mt-14 md:text-xl">{intro}</p>
        </Reveal>
      ) : null}
      {children}
    </section>
  );
}
