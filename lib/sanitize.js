// Cleans rich-text HTML from the admin editor (Quill) before it is rendered
// with dangerouslySetInnerHTML. Server-only.
import sanitizeHtml from 'sanitize-html';

const OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'iframe', 'h1', 'h2', 'span', 'u', 's', 'sub', 'sup',
  ]),
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    iframe: ['src', 'allowfullscreen', 'frameborder'],
    li: ['data-list'],
    '*': ['class'],
  },
  // Keep Quill's layout classes (alignment, indent, lists, code) but nothing else.
  allowedClasses: { '*': ['ql-*'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
  ],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
};

export function sanitizeCms(html) {
  if (!html || typeof html !== 'string') return '';
  const clean = sanitizeHtml(html.replace(/&nbsp;/g, ' ').replace(/ /g, ' '), OPTIONS);
  const hasText = clean.replace(/<[^>]*>/g, '').trim().length > 0;
  const hasMedia = /<(img|iframe)\b/i.test(clean);
  return hasText || hasMedia ? clean : '';
}
