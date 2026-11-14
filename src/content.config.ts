import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Releases (case studies). One Markdown file per project in src/content/work/.
 * The filename becomes the URL: tabal-chocolate-pr-campaign.md → /work/tabal-chocolate-pr-campaign
 *
 * Frontmatter is validated at build time, so a typo (a missing summary, a bad
 * colour) fails the build with a message naming the file, instead of shipping
 * a broken page.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      /** The plain, descriptive title. This is the page's <h1>. */
      title: z.string().max(80),
      /** The "album name" printed on the cover art. Short and playful. */
      album: z.string().max(28),
      /** One or two sentences for cards, search results and link previews. */
      summary: z.string().max(220),
      /** Catalogue number, e.g. RR-003. RR-001 is the site itself. */
      catalog: z.string().regex(/^[A-Z]{2}-\d{3}$/, 'Use the form RR-002'),
      /** Who it was for. */
      client: z.string(),
      /** Be honest about context. */
      context: z.enum(['Class project', 'Internship', 'Part-time role', 'Freelance', 'Personal project']),
      /** Where it was made, e.g. "Waukesha County Technical College". */
      studio: z.string(),
      role: z.string(),
      /** Used for ordering only (newest first). Not shown when `released` is omitted. */
      date: z.coerce.date(),
      /** Shown as the release date, e.g. "Jan 2025" or "Aug 2026 – present". Omit to hide. */
      released: z.string().optional(),
      /** 'released' = finished work. 'recording' = in progress; shows a "Now recording" sticker. */
      status: z.enum(['released', 'recording']).default('released'),
      tags: z.array(z.string()).min(1).max(4),
      tools: z.array(z.string()).default([]),
      /** Credit lines, e.g. "Brand by Peyton Ropas". */
      credits: z.array(z.string()).default([]),
      /** A live link to the work or the business. */
      link: z.object({ label: z.string(), href: z.url() }).optional(),
      /** Headline numbers (1–4). The first one goes on the card. `pending` shows as "TBA". */
      metrics: z
        .array(z.object({ value: z.string(), label: z.string(), pending: z.boolean().default(false) }))
        .min(1)
        .max(4),
      /** Heading for the numbers strip. */
      metricsTitle: z.string().default('At a glance'),
      /** Optional stacked bar, e.g. a budget split. Values are relative. */
      breakdown: z
        .object({
          title: z.string(),
          items: z.array(z.object({ label: z.string(), value: z.number().positive(), display: z.string() })).min(2).max(5),
        })
        .optional(),
      /**
       * The Remaster: "what I'd do differently". Each change pairs what the
       * original did with what the v2 does and why. This is the part
       * interviewers remember, so make it specific.
       */
      remaster: z
        .object({
          intro: z.string(),
          changes: z.array(z.object({ original: z.string(), remaster: z.string() })).min(1).max(6),
        })
        .optional(),
      /** Cover art. `style` picks the generative pattern; colours are any CSS hex. */
      cover: z.object({
        style: z.enum(['stripes', 'halftone', 'ripples', 'venn', 'bars']),
        bg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        fg: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      }),
      /** Optional real cover image (relative path). Replaces the generated art. */
      coverImage: image().optional(),
      coverAlt: z.string().optional(),
      /**
       * Inserts: real pieces of the work (a menu, a poster, a screen), tucked in
       * like the printed inserts that come inside a record sleeve. They show small
       * on the case study and open full size on click, and their top edges peek
       * out of the sleeve on the home page wall. Images are relative paths, e.g.
       * ./images/menu.jpg. Credit other people's work in `credit`.
       */
      inserts: z
        .object({
          title: z.string().max(60),
          intro: z.string().max(320),
          credit: z.string().optional(),
          items: z
            .array(
              z.object({
                image: image(),
                /** Describe what's on it for screen readers. */
                alt: z.string().min(1),
                /** A short name, e.g. "Cyanotype". */
                name: z.string().max(28),
                note: z.string().max(140).optional(),
              }),
            )
            .min(1)
            .max(4),
        })
        .optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { work };
