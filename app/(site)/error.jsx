"use client";
import Link from "next/link";

// Shown when the API can't be reached for a page that isn't cached yet.
export default function SiteError({ retry, reset }) {
  const tryAgain = retry ?? reset;
  return (
    <section className="container-site flex min-h-[85svh] flex-col justify-center pb-20 pt-32">
      <p className="label-mono border-t border-line pt-4 text-dim">(Hold on)</p>
      <h1 className="mt-8 font-serif text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.03em]">
        The server is <span className="italic text-brand">waking up.</span>
      </h1>
      <p className="mt-8 max-w-lg text-lg text-ink/75">
        My API runs on a free server that naps when it&apos;s quiet. Give it a few seconds and try again.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        {tryAgain ? (
          <button
            type="button"
            onClick={() => tryAgain()}
            className="rounded-full bg-ink px-7 py-3.5 text-canvas transition-colors hover:bg-brand hover:text-brand-ink"
          >
            Try again
          </button>
        ) : null}
        <Link href="/" className="rounded-full border border-line px-7 py-3.5 transition-colors hover:border-ink/40">
          Go home
        </Link>
      </div>
    </section>
  );
}
