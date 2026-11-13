import PageHeader from "@/components/site/PageHeader";
import ProjectPlanner from "@/components/site/ProjectPlanner";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Start a project",
  description: `Plan your website, web app or mobile app in four quick steps, see a rough price and timeline straight away, and send the brief to ${SITE.name}, a freelance fullstack developer in Mumbai.`,
};

// /start?type=mobile opens the planner with "Mobile app" already picked
// (used by the service links on the home page).
export default async function StartPage({ searchParams }) {
  const { type } = await searchParams;
  return (
    <>
      <PageHeader
        label="Start a project"
        meta="4 quick steps · about a minute"
        title="Plan your"
        italic="project."
        intro="Pick what you need and see a rough price and timeline straight away. Then send me the brief — I usually reply within a day."
      />
      <section className="container-site pb-24 md:pb-36">
        <ProjectPlanner initialType={typeof type === "string" ? type : ""} />
      </section>
    </>
  );
}
