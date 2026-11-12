import Link from "next/link";

export const metadata = { title: "Not found" };

// Fallback for URLs outside every route (no site navigation here).
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col justify-center px-[clamp(1.25rem,4vw,3.5rem)] py-20">
      <p className="label-mono border-t border-line pt-4 text-dim">(404)</p>
      <h1 className="mt-8 font-serif text-[clamp(3.4rem,11vw,11rem)] leading-[0.86] tracking-[-0.03em]">
        Nothing <span className="italic text-brand">here.</span>
      </h1>
      <Link href="/" className="label-mono link-line mt-10 self-start text-ink">
        ← Back to the homepage
      </Link>
    </main>
  );
}
