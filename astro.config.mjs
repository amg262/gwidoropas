// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical site URL, used for canonical tags, Open Graph URLs and the sitemap.
 *
 * Resolution order:
 *  1. SITE_URL — set this in Vercel once you attach a custom domain (e.g. https://gwidoropas.com).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel system env var; always the production domain,
 *     even during preview builds, so previews never advertise themselves as canonical.
 *  3. localhost for local dev.
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

/** Unicode ranges for the latin / latin-ext subsets, so latin-ext only downloads when a page needs it. */
const UNICODE = {
  latin: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
  'latin-ext': ['U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF', 'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF', 'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF'],
};

/** @typedef {'latin' | 'latin-ext'} Subset */
/** @type {Subset[]} */
const SUBSETS = ['latin', 'latin-ext'];

/**
 * @template T
 * @param {T[]} list
 * @returns {[T, ...T[]]}
 */
const nonEmpty = (list) => /** @type {[T, ...T[]]} */ (list);

/**
 * Archivo variable: weight 100–900 AND width 62–125%. One file gives us the
 * condensed poster cuts, the expanded label cuts and the regular body text.
 */
const archivo = nonEmpty(
  SUBSETS.map((subset) => ({
    src: nonEmpty([`./node_modules/@fontsource-variable/archivo/files/archivo-${subset}-wdth-normal.woff2`]),
    weight: '100 900',
    stretch: '62% 125%',
    style: /** @type {const} */ ('normal'),
    unicodeRange: nonEmpty(UNICODE[subset]),
  })),
);

/**
 * Static fontsource files.
 * @param {string} pkg
 * @param {string[]} weights
 * @param {('normal' | 'italic')[]} styles
 */
function staticVariants(pkg, weights, styles) {
  return nonEmpty(
    weights.flatMap((weight) =>
      styles.flatMap((style) =>
        SUBSETS.map((subset) => ({
          src: nonEmpty([`./node_modules/@fontsource/${pkg}/files/${pkg}-${subset}-${weight}-${style}.woff2`]),
          weight,
          style,
          unicodeRange: nonEmpty(UNICODE[subset]),
        })),
      ),
    ),
  );
}

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Archivo',
      cssVariable: '--font-sans',
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      options: { variants: archivo },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: { variants: staticVariants('instrument-serif', ['400'], ['normal', 'italic']) },
    },
    {
      /* Hand-lettered cards only (staff pick, price tags, the coming-soon board). One weight. */
      provider: fontProviders.local(),
      name: 'Caveat',
      cssVariable: '--font-hand',
      fallbacks: ['Bradley Hand', 'Segoe Print', 'cursive'],
      options: { variants: staticVariants('caveat', ['600'], ['normal']) },
    },
    {
      provider: fontProviders.local(),
      name: 'DM Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
      options: { variants: staticVariants('dm-mono', ['400', '500'], ['normal']) },
    },
  ],
});
