/**
 * Who can find the site. Set `site.visibility` in src/data/site.ts.
 *
 *  'unlisted': the site is live for anyone who has the link, and link previews
 *              (LinkedIn, iMessage, Slack…) still work, but it stays out of
 *              search results, AI datasets and web archives.
 *  'public':   open to search engines; robots.txt and <head> advertise the sitemap.
 *
 * How unlisted works, and why it isn't just "Disallow: /":
 *
 *  1. Every response says noindex: the <meta name="robots"> tag on pages, and
 *     an X-Robots-Tag header in vercel.json on everything else (the share
 *     images, the sitemap XML, the favicon).
 *  2. robots.txt still lets search engines crawl. That sounds backwards, but a
 *     crawler that's blocked never sees the noindex, and Google will list a
 *     blocked URL with no snippet if it finds a link to it anywhere. Blocking
 *     everyone would also break link previews, because LinkedInBot and Twitterbot
 *     obey robots.txt, and a résumé site lives on being shared as a link.
 *  3. robots.txt does block crawlers that copy pages into datasets, AI answer
 *     engines, public archives and SEO indexes. None of them help someone who
 *     already has the link. Fetchers a person triggers by pasting the link into
 *     ChatGPT or Claude are left alone, for the same reason link previews are.
 *  4. The sitemap is still generated (so it's ready for launch) but nothing links
 *     to it.
 *
 * The meta tag lives here and the header lives in vercel.json, which can't read
 * this file. This module checks they agree when it loads, so the build fails
 * instead of shipping a half-hidden site.
 */
import { site } from '@/data/site';
import vercelConfig from '../../vercel.json';

export const unlisted = site.visibility === 'unlisted';

/** The robots directive for every page while unlisted. Also the X-Robots-Tag value in vercel.json. */
export const UNLISTED_ROBOTS = 'noindex, nofollow, noarchive';

/**
 * Crawlers turned away while unlisted. Each feeds something public that someone
 * without the link could find the site through. Search engines (Googlebot,
 * Bingbot, DuckDuckBot, Applebot) and link-preview bots are deliberately absent.
 * See the top of this file for why.
 */
export const BLOCKED_WHILE_UNLISTED = [
  // AI training and AI search indexes
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Google-Extended', // Gemini training only; Google Search is unaffected
  'Applebot-Extended', // Apple Intelligence training only; Spotlight and Siri are unaffected
  'PerplexityBot',
  'Meta-ExternalAgent', // not facebookexternalhit, which draws Facebook and iMessage previews
  'Amazonbot',
  'Bytespider',
  'DuckAssistBot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'AI2Bot',
  'YouBot',
  'PanguBot',
  'Timpibot',
  'ImagesiftBot',
  'Diffbot',
  // Open web datasets that most AI models are trained on
  'CCBot',
  'omgili',
  'omgilibot',
  // Public archives (the Wayback Machine keeps copies forever)
  'archive.org_bot',
  'ia_archiver',
  // SEO crawlers whose databases list every site they find
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
];

export function robotsTxt(sitemapUrl: string): string {
  if (!unlisted) {
    return ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`, ''].join('\n');
  }
  return [
    '# Unlisted: open to anyone with the link, kept out of search results.',
    '# Search engines may crawl so they can read the noindex on every page.',
    '# Dataset, AI, archive and SEO crawlers may not.',
    '',
    ...BLOCKED_WHILE_UNLISTED.map((agent) => `User-agent: ${agent}`),
    'Disallow: /',
    '',
    'User-agent: *',
    'Allow: /',
    '',
  ].join('\n');
}

/* ── Guard rails: fail the build rather than ship a half-hidden site ───────── */

const siteWideHeader = vercelConfig.headers
  .filter((rule) => rule.source === '/(.*)')
  .flatMap((rule) => rule.headers)
  .find((h) => h.key.toLowerCase() === 'x-robots-tag');

if (!unlisted && site.advanceCopy) {
  throw new Error(
    "[visibility] site.visibility is 'public' but site.advanceCopy is still true. Finish the sign-off checklist in README.md and set advanceCopy to false before opening the site to search engines.",
  );
}

if (unlisted && !siteWideHeader?.value.includes('noindex')) {
  throw new Error(
    `[visibility] site.visibility is 'unlisted' but vercel.json doesn't send a noindex header, so the share images and sitemap could be indexed. Add { "key": "X-Robots-Tag", "value": "${UNLISTED_ROBOTS}" } to the headers for source "/(.*)".`,
  );
}

if (!unlisted && siteWideHeader) {
  throw new Error(
    "[visibility] site.visibility is 'public' but vercel.json still sends X-Robots-Tag on every response, which keeps the whole site out of search. Remove that header from vercel.json.",
  );
}
