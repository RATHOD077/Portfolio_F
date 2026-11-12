import Link from "next/link";
import { notFound } from "next/navigation";
import CoverImage from "@/components/site/CoverImage";
import ViewPing from "@/components/site/ViewPing";
import { formatDate } from "@/components/site/PostList";
import { Reveal, RevealText } from "@/components/site/Reveal";
import { getPost, getPosts } from "@/lib/content";
import { sanitizeCms } from "@/lib/sanitize";
import { SITE } from "@/lib/site";

export async function generateStaticParams() {
  const posts = await getPosts({ soft: true });
  return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.excerpt || `A post by ${SITE.name}.`,
    openGraph: {
      type: "article",
      publishedTime: post.date ?? undefined,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = sanitizeCms(post.content);

  return (
    <article>
      <header className="container-site pt-28 md:pt-40">
        <Reveal y={0} className="label-mono flex flex-wrap justify-between gap-4 border-t border-line pt-4 text-dim">
          <Link href="/blog" className="link-line">
            ← Blog
          </Link>
          <span>
            {formatDate(post.date)}
            {post.readTime ? ` · ${post.readTime} min read` : ""}
          </span>
        </Reveal>

        <h1 className="mt-8 max-w-[20ch] font-serif text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.92] tracking-[-0.025em] md:mt-12">
          <RevealText text={post.title} immediate stagger={0.035} />
        </h1>

        {post.excerpt ? (
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-[42ch] text-xl leading-snug text-ink/80 md:ml-[33%] md:text-2xl">{post.excerpt}</p>
          </Reveal>
        ) : null}

        {post.tags.length > 0 && (
          <Reveal delay={0.4} className="mt-8 flex flex-wrap gap-2 md:ml-[33%]">
            {post.tags.map((tag) => (
              <span key={tag} className="label-mono rounded-full border border-line px-3 py-1.5 text-dim">
                {tag}
              </span>
            ))}
          </Reveal>
        )}
      </header>

      <CoverImage src={post.cover} alt={post.title} />

      <div className="container-site grid py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7 md:col-start-4">
          {html ? (
            <div className="prose-cms" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-lg text-dim">This post doesn&apos;t have any content yet.</p>
          )}
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <Link href="/blog" className="label-mono link-line">
              ← All posts
            </Link>
            <span className="label-mono text-dim">Written by {SITE.name}</span>
          </div>
        </div>
      </div>

      <ViewPing slug={post.slug} />
    </article>
  );
}
