import SmoothScroll from "@/components/site/SmoothScroll";
import CursorLabel from "@/components/site/CursorLabel";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ContactDock from "@/components/site/ContactDock";
import ChatbotWrapper from "@/components/ui/ChatbotWrapper";
import { getPosts, getProjects } from "@/lib/content";

// Shell for every public page: smooth scroll, navigation, footer, chatbot.
export default async function SiteLayout({ children }) {
  const [projects, posts] = await Promise.all([getProjects({ soft: true }), getPosts({ soft: true })]);

  return (
    <>
      <SmoothScroll />
      <CursorLabel />
      <div aria-hidden className="grain" />
      <Navbar counts={{ projects: projects.length || null, posts: posts.length || null }} />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer />
      <ContactDock />
      <ChatbotWrapper showLauncher={false} />
    </>
  );
}
