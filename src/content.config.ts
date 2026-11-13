import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Case studies. One Markdown file per project in src/content/work/.
 * The filename becomes the URL: campus-coffee-rebrand.md → /work/campus-coffee-rebrand
 *
 * Frontmatter is validated at build time, so a typo (e.g. a missing summary)
 * fails the build with a clear message instead of shipping a broken page.
 */
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(80),
      /** One or two sentences. Used on cards, in search results and in link previews. */
      summary: z.string().max(200),
      /** Who it was for. Be honest about context: "Class project", "Internship", "Student org". */
      client: z.string(),
      context: z.enum(['Class project', 'Internship', 'Freelance', 'Student organization', 'Competition', 'Personal project']),
      role: z.string(),
      /** Used for sorting (newest first). */
      date: z.coerce.date(),
      duration: z.string(),
      tags: z.array(z.string()).min(1).max(4),
      tools: z.array(z.string()).default([]),
      /** The headline numbers. Keep to 2–4. These are what recruiters skim for. */
      metrics: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .min(1)
        .max(4),
      /** Colour for the auto-generated cover art (any CSS colour). */
      accent: z.string().default('#E4572E'),
      /** Optional real cover image (relative path, e.g. ./images/cover.jpg). Replaces the generated art. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { work };
