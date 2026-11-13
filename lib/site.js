// Static profile content for the public site.
// Dynamic content (projects, skills, posts, resume) comes from the API — see lib/content.js.

export const SITE = {
  name: 'Sachin Rathod',
  role: 'Freelance Fullstack Developer',
  availability: 'Available for freelance',
  location: 'Mumbai, India',
  shortLocation: 'Mumbai, IN',
  coords: '19.07° N, 72.87° E',
  timeZone: 'Asia/Kolkata',
  email: 'rathodsachin0766@gmail.com',
  phone: '+91 96046 69232',
  phoneHref: 'tel:+919604669232',
  whatsapp: '919604669232', // country code + number, digits only (used by wa.me links)
  socials: [
    { label: 'GitHub', href: 'https://github.com/FNICKE' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sachin-rathod-469168310' },
  ],
  description:
    'Sachin Rathod is a freelance fullstack developer in Mumbai who builds websites, web apps and mobile apps — from the database to the interface — with Next.js, React, Node.js, MySQL and Flutter.',
};

export const NAV = [
  { label: 'Work', href: '/projects', countKey: 'projects' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/skills' },
  { label: 'Blog', href: '/blog', countKey: 'posts' },
  { label: 'Contact', href: '/contact' },
];

// The year the first web project shipped — used for "years building" on the home page.
export const STARTED_BUILDING = 2023;

export const INTRO =
  "I'm a freelance fullstack developer who takes ideas from first sketch to launch — _websites,_ web apps and _mobile apps_ — with clean interfaces, APIs that hold up under real use, and products people actually open.";

// Freelance services. `categories` pulls matching tools from the skills API;
// `tools` are always shown (used when the API has no skills in that category).
export const SERVICES = [
  {
    title: 'Websites',
    planType: 'website', // "Price my website" opens /start with this type picked
    text: 'Fast, responsive websites for businesses and brands — landing pages, company sites and online stores, with an admin panel you can update yourself.',
    examples: 'Business sites · E-commerce · Landing pages',
    categories: ['frontend'],
    tools: [],
  },
  {
    title: 'Web apps',
    planType: 'webapp',
    text: 'Dashboards, portals and internal tools with logins, roles, file uploads and reports — on an API built to keep running in production.',
    examples: 'Dashboards · Admin panels · Portals · APIs',
    categories: ['backend', 'database'],
    tools: [],
  },
  {
    title: 'Mobile apps',
    planType: 'mobile',
    text: 'Cross-platform apps in Flutter that share one backend with your website, so your content stays in sync on every screen.',
    examples: 'Android · Cross-platform · Companion apps',
    categories: ['mobile'],
    tools: ['Flutter', 'Dart', 'REST APIs'],
  },
];

export const PROCESS = [
  {
    title: 'Plan',
    text: 'We talk through your goals, users and timeline. You get a clear scope before any code is written.',
  },
  {
    title: 'Build',
    text: 'I design and develop in short rounds and share progress often, so you always know where things stand.',
  },
  {
    title: 'Launch',
    text: 'I deploy it, walk you through the admin panel, and stay available for fixes and new features.',
  },
];

export const PROJECT_TYPES = ['Website', 'Web app', 'Mobile app', 'Something else'];

// How a visitor would like to hear back (contact form).
export const REPLY_METHODS = ['Email', 'WhatsApp', 'Phone call'];

export const WHATSAPP_GREETING = "Hi Sachin, I found your portfolio and I'd like to talk about a project.";

// Opens a WhatsApp chat with Sachin, with the message already typed in.
export const whatsappLink = (text = WHATSAPP_GREETING) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const STORY = [
  "I'm Sachin Rathod, a Computer Engineer from Saraswati College of Engineering, Mumbai. Four years of engineering weren't only lectures — they were late-night debugging sessions, weekend projects and a curiosity that turned a student into a developer.",
  'Today I work as a freelance fullstack developer, building websites, web apps and mobile apps for clients. Front ends in Next.js and React, back ends in Node.js and Express, data in MySQL, and cross-platform apps in Flutter — one person who understands how all the parts fit together.',
  "Freelancing since 2024 has meant shipping real client work: online stores, business sites and dashboards that people use every day. Right now I'm going deeper on TypeScript, cloud deployments and AI-integrated apps — the learning doesn't stop.",
];

export const PRINCIPLES = [
  {
    title: 'Readable code',
    text: 'Small pieces, clear names, no clever tricks. Code the next person can change without fear — including me in six months.',
  },
  {
    title: 'Simple for the user',
    text: 'I like taking a messy requirement and turning it into something that feels obvious to use.',
  },
  {
    title: 'Always learning',
    text: 'The web moves fast. I keep shipping small experiments so new tools earn their place in real projects.',
  },
];

export const TIMELINE = [
  {
    year: '2022',
    title: 'Started engineering',
    text: 'Joined Saraswati College of Engineering for Computer Engineering.',
  },
  {
    year: '2023',
    title: 'First web project',
    text: 'Built my first fullstack app — a task manager on Node.js and MySQL. The bug-fixing never stopped.',
  },
  {
    year: '2024',
    title: 'Freelancing begins',
    text: 'Took on freelance projects and shipped real client work while still in college.',
  },
  {
    year: '2025',
    title: 'Going deeper',
    text: 'TypeScript, scalable architecture and production-grade projects.',
  },
  {
    year: '2026',
    title: 'Degree completed',
    text: "Graduated with a Bachelor's in Computer Engineering. Now building the next chapter full-time.",
  },
];

export const INTERESTS = ['Open source', 'Scalable apps', 'UI & UX', 'Coffee', 'Gaming', 'Reading'];

export const QUOTE = 'Code is poetry written in logic.';

export const CATEGORY_LABELS = {
  web: 'Web',
  mobile: 'Mobile',
  api: 'API',
  fullstack: 'Fullstack',
  other: 'Other',
};

export const STATUS_LABELS = {
  completed: 'Completed',
  in_progress: 'In progress',
  archived: 'Archived',
};

export const SKILL_GROUPS = {
  frontend: { title: 'Frontend', text: 'Interfaces that load fast, read clearly and feel good to use.' },
  backend: { title: 'Backend', text: 'APIs, auth and business logic that stay calm in production.' },
  database: { title: 'Data', text: 'Schemas, queries and state — relational and document stores.' },
  devops: { title: 'Workflow', text: 'Version control, reviews and getting code shipped.' },
  cloud: { title: 'Cloud', text: 'Deployments, hosting and the infrastructure around the code.' },
  mobile: { title: 'Mobile', text: 'Apps for the device in your pocket.' },
  tools: { title: 'Tools', text: 'The everyday kit behind the work.' },
  other: { title: 'Also', text: 'Everything else in the toolbox.' },
};
