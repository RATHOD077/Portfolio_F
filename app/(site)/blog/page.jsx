import PageHeader from "@/components/site/PageHeader";
import PostList from "@/components/site/PostList";
import { getPosts } from "@/lib/content";

export const metadata = {
  title: "Blog",
  description: "Write-ups from building things — projects, hackathons and what I learned along the way.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHeader
        label="Blog"
        title="Notes &"
        italic="writing"
        count={posts.length}
        intro="Write-ups from building things — projects, hackathons and what I learned along the way."
      />
      <section className="container-site pb-24 md:pb-36">
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <p className="border-t border-line pt-8 text-lg text-dim">The first post is on its way.</p>
        )}
      </section>
    </>
  );
}
