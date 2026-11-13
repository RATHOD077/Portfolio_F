import PageHeader from "@/components/site/PageHeader";
import { SITE } from "@/lib/site";

// Privacy policy for the website and the Android app (also linked from Google Play).
// Keep it in sync with what the site, app and API actually do.

export const metadata = {
  title: "Privacy policy",
  description: `How ${SITE.name}'s website and Android app handle your information.`,
};

const UPDATED = "14 November 2026";

const SECTIONS = [
  {
    title: "The short version",
    body: [
      "You can browse the website and use the app without an account. There are no ads, no tracking cookies and no analytics tools. I only receive personal information when you choose to send it to me — through the contact form, the project planner or the AI assistant — and I only use it to reply to you. I never sell or share it for marketing.",
    ],
  },
  {
    title: "What you send me",
    body: [
      "Contact form and project planner (website and app): your name, email address, your phone or WhatsApp number if you choose a reply by WhatsApp or phone, your message, and the project details you pick (type, features, timeline, budget). The server also records the IP address the message came from, to help deal with spam.",
      "This is stored in my database and sent to my email inbox so I can reply. I keep it as long as needed for our conversation and any project that follows, and delete it on request.",
      "If you choose “Send on WhatsApp”, the message goes through WhatsApp from your own phone, under WhatsApp’s own privacy policy.",
    ],
  },
  {
    title: "The AI assistant",
    body: [
      "Questions you type into the AI assistant are sent to my server and then to Groq, an AI provider, to write the answer. The conversation is not saved in my database. Please don’t type personal or sensitive information into it.",
    ],
  },
  {
    title: "The Android app",
    body: [
      "The app shows the same content as this website and uses the same contact form and AI assistant described above.",
      "The version downloaded from GitHub checks GitHub Releases for new versions and can download and install updates from there; GitHub receives the usual technical information of such a request (such as your IP address). It may ask permission to show notifications, used only to tell you an update is available, and permission to install updates. The Google Play version leaves updates to Google Play and does neither.",
      "Your theme choice and similar settings stay on your device.",
    ],
  },
  {
    title: "On this website",
    body: [
      "Your light/dark theme choice is kept in your browser’s storage. Blog posts count views anonymously. Pages and images are delivered by my hosting providers, which see standard technical information such as your IP address and browser type.",
    ],
  },
  {
    title: "Where it is stored",
    body: [
      "The website and server run on cloud hosting providers, and the database is hosted by Clever Cloud. They process data only to run these services for me. Data may be processed outside India.",
    ],
  },
  {
    title: "Your choices",
    body: [
      `You can ask me what I hold about you, ask me to correct it, or ask me to delete it — email ${SITE.email}. You can turn off the app’s notifications or uninstall it at any time.`,
    ],
  },
  {
    title: "Children",
    body: ["This website and app are meant for businesses and adults looking for a developer, not for children under 13."],
  },
  {
    title: "Changes",
    body: [`If this policy changes, the new version will be posted on this page with a new date. Last updated ${UPDATED}.`],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        label="Privacy"
        meta={`Updated ${UPDATED}`}
        title="Privacy"
        italic="policy."
        intro={`How the ${SITE.name} website and Android app handle your information — in plain words.`}
      />
      <section className="container-site pb-24 md:pb-36">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="space-y-14 md:col-span-8 md:col-start-5">
            {SECTIONS.map((section, i) => (
              <article key={section.title} className="border-t border-line pt-6">
                <p className="label-mono text-brand">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-3 font-serif text-[clamp(1.9rem,3vw,2.8rem)] leading-tight tracking-tight">{section.title}</h2>
                <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink/80">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
            <p className="text-ink/70">
              Questions? Email{" "}
              <a className="link-line text-ink" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
