import Link from "next/link";
import { Reveal } from "./Reveal";

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
    : "";

// Journal entries as editorial rows: date, title, excerpt, read time.
export default function PostList({ posts }) {
  return (
    <ul className="border-t border-line">
      {posts.map((post, i) => (
        <Reveal as="li" key={post.id} delay={i * 0.05} className="border-b border-line">
          <Link
            href={`/blog/${post.slug}`}
            data-cursor="Read"
            className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-3 py-7 md:py-10"
          >
            <span className="label-mono col-span-12 text-dim md:col-span-2">{formatDate(post.date)}</span>
            <span className="col-span-12 font-serif text-[clamp(1.8rem,3.6vw,3.3rem)] leading-[1.02] tracking-tight transition-colors duration-300 group-hover:text-brand md:col-span-6">
              {post.title}
            </span>
            <span className="col-span-12 line-clamp-2 text-dim md:col-span-3">
              {post.excerpt || (post.tags.length ? post.tags.join(" · ") : "")}
            </span>
            <span className="label-mono col-span-12 flex items-center justify-between gap-3 text-dim md:col-span-1 md:justify-end">
              {post.readTime ? `${post.readTime} min` : ""}
              <span className="inline-block text-base text-ink transition-transform duration-500 ease-expo group-hover:translate-x-1.5 group-hover:-translate-y-1.5">
                ↗
              </span>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

export { formatDate };
