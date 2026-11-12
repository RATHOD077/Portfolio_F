// Server-side data access for the public site.
//
// Pages render on the server and are cached for REVALIDATE seconds (ISR), so
// visitors get instant HTML even while the Render API is asleep.
//
// Failure handling:
// - During `next build` a sleeping/broken API must not fail the deploy, so we
//   fall back to empty data.
// - At runtime we throw instead. Next.js then keeps serving the last good
//   cached page rather than replacing it with an empty one, and uncached
//   pages show the (site) error boundary with a retry button.
// - `soft: true` never throws (used by the shared layout for nav counts).

import { API_URL, resolveImage } from './api';
import { STARTED_BUILDING } from './site';

const REVALIDATE = 300;
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

async function request(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(IS_BUILD ? 60_000 : 25_000),
    });
    if (res.status === 404) return { ok: false, notFound: true };
    if (!res.ok) return { ok: false };
    const json = await res.json();
    return json?.success ? { ok: true, data: json.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

function unavailable(path, fallback, soft) {
  if (IS_BUILD || soft) return fallback;
  throw new Error(`The API did not respond for ${path}`);
}

async function load(path, fallback, { soft = false } = {}) {
  const result = await request(path);
  if (result.ok) return result.data ?? fallback;
  if (result.notFound) return null;
  return unavailable(path, fallback, soft);
}

/* ── normalisers ─────────────────────────────────────────────── */

const toBool = (v) => v === true || v === 1 || v === '1';

const cleanUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const value = url.trim();
  if (!value || value === 'null' || value === 'undefined') return '';
  if (/^www\./i.test(value)) return `https://${value}`;
  return value;
};

const yearOf = (date) => {
  const d = date ? new Date(date) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : null;
};

function normalizeProject(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: (p.title || 'Untitled').trim(),
    shortDesc: (p.short_desc || '').trim(),
    description: p.description || '',
    image: resolveImage(p.thumbnail_url),
    live: cleanUrl(p.live_url),
    github: cleanUrl(p.github_url),
    tech: Array.isArray(p.tech_stack)
      ? p.tech_stack.map((t) => String(t).trim()).filter(Boolean)
      : [],
    category: p.category || 'fullstack',
    status: p.status || 'completed',
    featured: toBool(p.featured),
    year: yearOf(p.created_at),
    skills: Array.isArray(p.skills) ? p.skills.filter((s) => s && s.name) : [],
    images: Array.isArray(p.images)
      ? p.images.map((img) => resolveImage(img.image_url || img.url)).filter(Boolean)
      : [],
  };
}

function normalizePost(b) {
  const date = b.published_at || b.created_at;
  return {
    id: b.id,
    slug: b.slug,
    title: (b.title || 'Untitled').trim(),
    excerpt: (b.excerpt || '').trim(),
    content: b.content || '',
    cover: resolveImage(b.cover_url),
    tags: Array.isArray(b.tags) ? b.tags.map(String).filter(Boolean) : [],
    readTime: Number(b.read_time) || null,
    views: Number(b.views) || 0,
    date: date || null,
    published: toBool(b.published),
  };
}

function normalizeSkill(s) {
  return {
    id: s.id,
    name: (s.name || '').trim(),
    icon: resolveImage(s.icon_url),
    category: (s.category || 'other').toLowerCase(),
  };
}

/* ── queries ─────────────────────────────────────────────────── */

export async function getProjects(opts) {
  const data = await load('/projects', [], opts);
  return (data || []).map(normalizeProject);
}

export async function getProject(slug) {
  const data = await load(`/projects/${encodeURIComponent(slug)}`, null);
  return data ? normalizeProject(data) : null;
}

export async function getSkills(opts) {
  const data = await load('/skills', [], opts);
  return (data || []).map(normalizeSkill).filter((s) => s.name);
}

export async function getPosts(opts) {
  const data = await load('/blogs?published=true', [], opts);
  return (data || []).map(normalizePost).filter((p) => p.published);
}

// Note: the API counts a view each time this is fetched; with caching that is
// roughly once per revalidation. Real visits are counted by <ViewPing />.
export async function getPost(slug) {
  const data = await load(`/blogs/${encodeURIComponent(slug)}`, null);
  if (!data) return null;
  const post = normalizePost(data);
  return post.published ? post : null; // drafts stay private on the site
}

export async function getResumeUrl() {
  const data = await load('/settings/resume', {}, { soft: true });
  return cleanUrl(data?.resume_url ? resolveImage(data.resume_url) : '');
}

/* ── helpers ─────────────────────────────────────────────────── */

export function pickFeatured(projects, limit = 5) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function groupSkills(skills) {
  const groups = new Map();
  for (const skill of skills) {
    if (!groups.has(skill.category)) groups.set(skill.category, []);
    groups.get(skill.category).push(skill);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}

export function yearsBuilding() {
  return Math.max(1, new Date().getFullYear() - STARTED_BUILDING);
}
