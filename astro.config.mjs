// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical site URL, used for canonical tags, Open Graph URLs and the sitemap.
 *
 * Resolution order:
 *  1. SITE_URL — set this in Vercel once you attach a custom domain (e.g. https://alexrivera.com).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel system env var; always the production domain,
 *     even during preview builds, so previews never advertise themselves as canonical.
 *  3. localhost for local dev.
 */
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

/**
 * Self-hosted variable fonts from @fontsource-variable, served through Astro's Fonts API
 * (which adds preload hints and metric-matched fallbacks to prevent layout shift).
 * Latin-ext files only download if a page actually uses those characters.
 */
const UNICODE = {
  latin: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
  'latin-ext': ['U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF', 'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF', 'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF'],
};

/**
 * @param {string} pkg     fontsource package name (without scope)
 * @param {string} axes    which variable cut to use, e.g. "wght" or "opsz"
 * @param {string} weight  the font's real weight range, e.g. "400 700"
 */
function fontsourceVariants(pkg, axes, weight) {
  const variants = /** @type {const} */ (['normal', 'italic']).flatMap((style) =>
    /** @type {const} */ (['latin', 'latin-ext']).map((subset) => ({
      src: /** @type {[string]} */ ([`./node_modules/@fontsource-variable/${pkg}/files/${pkg}-${subset}-${axes}-${style}.woff2`]),
      weight,
      style,
      unicodeRange: /** @type {[string, ...string[]]} */ (UNICODE[subset]),
    })),
  );
  return /** @type {[typeof variants[number], ...typeof variants]} */ (variants);
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
      name: 'Fraunces',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      // "opsz" cut: weight + optical-size axes, so huge headlines get the high-contrast display design.
      options: { variants: fontsourceVariants('fraunces', 'opsz', '100 900') },
    },
    {
      provider: fontProviders.local(),
      name: 'Instrument Sans',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { variants: fontsourceVariants('instrument-sans', 'wght', '400 700') },
    },
  ],
});
