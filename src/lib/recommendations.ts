/**
 * Recommendations are other people's words, so the one thing the site must
 * never do is misquote them. Every sticker excerpt is checked against the full
 * text at build time: a typo, or an edit to one but not the other, fails the
 * build instead of shipping a quote the recommender never wrote.
 */
import { site, type Recommendation } from '@/data/site';

/** Curly and straight quotes compare equal; so does letter case and spacing. */
const normalize = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

for (const r of site.recommendations) {
  if (r.paragraphs.length === 0) {
    throw new Error(`site.recommendations: the recommendation from ${r.name} has no text.`);
  }
  if (r.sticker && !normalize(r.paragraphs.join(' ')).includes(normalize(r.sticker))) {
    throw new Error(
      `site.recommendations: the sticker for ${r.name} ("${r.sticker}") doesn't appear word for word in their recommendation. ` +
        'Quote them exactly, or change the sticker.',
    );
  }
}

export const recommendations: Recommendation[] = site.recommendations;

/** The quote for the hype sticker on the hero sleeve: the newest recommendation that has one. */
export const stickerQuote = recommendations.find((r) => r.sticker);

/** 'Andrew Gunn' → 'AG'. */
export const monogram = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
