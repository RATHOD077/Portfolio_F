import PageHeader from "@/components/site/PageHeader";
import ProjectIndex from "@/components/site/ProjectIndex";
import { getProjects } from "@/lib/content";

export const metadata = {
  title: "Work",
  description: "Client sites, products and experiments built by Sachin Rathod — most of them live.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader
        label="Index"
        meta={`${projects.filter((p) => p.live).length} live`}
        title="Selected"
        italic="work"
        count={projects.length}
        intro="Client sites, products and experiments — most of them live. Hover a row to preview it, open it for the details."
      />
      <section className="container-site pb-24 md:pb-36">
        <ProjectIndex projects={projects} />
      </section>
    </>
  );
}
