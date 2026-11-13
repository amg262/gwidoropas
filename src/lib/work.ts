import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;

/** Published case studies, newest first. Drafts show in `astro dev` only. */
export async function getWork(): Promise<Work[]> {
  const entries = await getCollection('work', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Featured first (in date order), then everything else. */
export function orderForHome(entries: Work[]): Work[] {
  return [...entries.filter((e) => e.data.featured), ...entries.filter((e) => !e.data.featured)];
}

export const formatMonth = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * Clean, canonical URL for the current page. With `build.format: 'file'`,
 * Astro.url.pathname ends in ".html" at build time; Vercel serves clean URLs.
 */
export function canonicalUrl(url: URL, site: URL | undefined): URL {
  const path = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
  return new URL(path, site);
}
