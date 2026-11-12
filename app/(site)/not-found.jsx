import Link from "next/link";

export const metadata = { title: "Not found" };

export default function SiteNotFound() {
  return (
    <section className="container-site flex min-h-[85svh] flex-col justify-center pb-20 pt-32">
      <p className="label-mono border-t border-line pt-4 text-dim">(404)</p>
      <h1 className="mt-8 font-serif text-[clamp(3.4rem,11vw,11rem)] leading-[0.86] tracking-[-0.03em]">
        Nothing <span className="italic text-brand">here.</span>
      </h1>
      <p className="mt-8 max-w-lg text-lg text-ink/75">
        This page moved, was unpublished, or never existed. The work is still where it always was.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/projects" className="rounded-full bg-ink px-7 py-3.5 text-canvas transition-colors hover:bg-brand hover:text-brand-ink">
          See projects
        </Link>
        <Link href="/" className="rounded-full border border-line px-7 py-3.5 transition-colors hover:border-ink/40">
          Go home
        </Link>
      </div>
    </section>
  );
}
