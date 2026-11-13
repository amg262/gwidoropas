#!/usr/bin/env node
/**
 * Contract test for a running copy of the site: production on Vercel, a
 * preview deployment, or the Docker container. The same checks pass on every
 * host, which is how we know the container is a faithful copy of production.
 *
 *   node scripts/smoke.mjs https://www.gwidoropas.com
 *   node scripts/smoke.mjs http://localhost:8080 --container --origin https://www.gwidoropas.com
 *
 *   --origin URL   The SITE_URL the site was built with. Canonicals and og:image
 *                  must use it. Defaults to the URL under test. This catches an
 *                  image accidentally built for localhost, which would break
 *                  every LinkedIn and iMessage preview.
 *   --container    Also check the container-only /healthz endpoint.
 *
 * What "the contract" is:
 *  • Every page in the sitemap answers 200 with HTML.
 *  • Response headers match vercel.json (same rules the container is compiled
 *    from; see scripts/lib/vercel-config.mjs) on pages, share images, assets,
 *    robots.txt and the 404.
 *  • While unlisted, every page also carries <meta name="robots" noindex>.
 *  • cleanUrls / trailingSlash: false redirects are 308s to the clean path,
 *    query string kept.
 *  • Unknown paths get the site's own 404 page with a 404 status.
 *
 * No dependencies: Node's fetch only. Exits 1 if anything fails.
 * (Behind an HTTPS proxy, run with NODE_USE_ENV_PROXY=1.)
 */
import { readVercelConfig, expectedHeaders } from './lib/vercel-config.mjs';

/* ── Arguments ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--origin');

if (!positional[0]) {
  console.error('Usage: node scripts/smoke.mjs <base-url> [--origin <site-url>] [--container]');
  process.exit(2);
}

const base = new URL(positional[0]);
const origin = new URL(option('--origin') ?? base.origin).origin;
const container = flag('--container');
const config = readVercelConfig(new URL('../vercel.json', import.meta.url));
const gha = !!process.env.GITHUB_ACTIONS;

/* ── Tiny test harness ─────────────────────────────────────────────────────── */

let passed = 0;
const failures = [];

function check(ok, label, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(`${label}${detail ? `: ${detail}` : ''}`);
    console.log(`  ✗ ${label}${detail ? `\n      ${detail}` : ''}`);
    if (gha) console.log(`::error title=Smoke test (${base.host})::${label}${detail ? ` (${detail})` : ''}`);
  }
  return ok;
}

const at = (path) => new URL(path, base);

/** GET without following redirects. Retries connection errors briefly, so a just-started container has time to come up. */
async function get(path, { attempts = 1 } = {}) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(at(path), {
        redirect: 'manual',
        headers: { 'user-agent': 'gwidoropas-smoke/1 (+contract test)' },
        signal: AbortSignal.timeout(15_000),
      });
      return { res, body: await res.text() };
    } catch (err) {
      if (i >= attempts) throw new Error(`GET ${at(path)} failed: ${err.cause?.code ?? err.message}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

/** Response headers must equal what vercel.json produces for this path. */
function checkHeaders(path, res) {
  const want = expectedHeaders(config, path);
  const wrong = [];
  for (const [key, value] of Object.entries(want)) {
    const got = res.headers.get(key);
    if (value === null ? got !== null : got !== value) wrong.push(`${key}: want ${JSON.stringify(value)}, got ${JSON.stringify(got)}`);
  }
  check(wrong.length === 0, `${path} headers match vercel.json`, wrong.join('; '));
  const server = res.headers.get('server') ?? '';
  check(!/\d/.test(server) && !res.headers.has('x-powered-by'), `${path} doesn't advertise server versions`, `server: ${server}`);
}

function checkPage(path, res, body) {
  check(res.status === 200, `GET ${path} → 200`, `got ${res.status}`);
  check((res.headers.get('content-type') ?? '').startsWith('text/html'), `${path} is HTML`, res.headers.get('content-type') ?? 'no content-type');
  checkHeaders(path, res);
  if ((expectedHeaders(config, path)['X-Robots-Tag'] ?? '').includes('noindex')) {
    check(/<meta name="robots" content="[^"]*noindex/.test(body), `${path} has the noindex meta tag (unlisted)`);
  }
}

const attr = (html, re) => re.exec(html)?.[1];

/* ── The checks ────────────────────────────────────────────────────────────── */

console.log(`\nSmoke test: ${base.origin}${origin !== base.origin ? ` (built for ${origin})` : ''}\n`);

try {
  // Home page, and what it points at.
  console.log('Home');
  const home = await get('/', { attempts: 20 });
  checkPage('/', home.res, home.body);

  const canonical = attr(home.body, /<link rel="canonical" href="([^"]+)"/);
  check(canonical === `${origin}/`, 'canonical URL uses the site origin', `got ${canonical}`);

  const ogImage = attr(home.body, /<meta property="og:image" content="([^"]+)"/);
  check(ogImage?.startsWith(`${origin}/`), 'og:image is an absolute URL on the site origin', `got ${ogImage}`);

  // Pages from the sitemap: every page, so new case studies are covered automatically.
  console.log('\nPages (from the sitemap)');
  const index = await get('/sitemap-index.xml');
  check(index.res.status === 200 && /xml/.test(index.res.headers.get('content-type') ?? ''), 'GET /sitemap-index.xml → 200 XML', `got ${index.res.status}`);
  checkHeaders('/sitemap-index.xml', index.res);

  const pages = new Set();
  for (const sitemapUrl of index.body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const sitemap = await get(new URL(sitemapUrl[1]).pathname);
    for (const loc of sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)) pages.add(new URL(loc[1]).pathname);
  }
  check(pages.size > 0, `sitemap lists pages (${pages.size})`);
  for (const path of [...pages].filter((p) => p !== '/')) {
    const page = await get(path);
    checkPage(path, page.res, page.body);
  }

  // Share image and a hashed stylesheet.
  console.log('\nAssets');
  if (ogImage) {
    const ogPath = new URL(ogImage).pathname;
    const og = await get(ogPath);
    check(og.res.status === 200 && og.res.headers.get('content-type') === 'image/png', `GET ${ogPath} → 200 image/png`, `got ${og.res.status} ${og.res.headers.get('content-type')}`);
    checkHeaders(ogPath, og.res);
  }
  const css = attr(home.body, /<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"/);
  if (check(!!css, 'home page links a hashed stylesheet')) {
    const sheet = await get(css);
    check(sheet.res.status === 200 && (sheet.res.headers.get('content-type') ?? '').startsWith('text/css'), `GET ${css} → 200 text/css`, `got ${sheet.res.status}`);
    checkHeaders(css, sheet.res);
  }

  const robots = await get('/robots.txt');
  check(robots.res.status === 200 && (robots.res.headers.get('content-type') ?? '').startsWith('text/plain') && robots.body.includes('User-agent:'), 'GET /robots.txt → 200 text/plain', `got ${robots.res.status}`);
  checkHeaders('/robots.txt', robots.res);

  // cleanUrls + trailingSlash: false.
  console.log('\nRedirects');
  const sample = [...pages].find((p) => p !== '/') ?? '/resume';
  const redirects = [
    [`${sample}/`, sample],
    [`${sample}.html`, sample],
    [`${sample}/?ref=smoke`, `${sample}?ref=smoke`],
    ['/index.html', '/'],
  ];
  for (const [from, to] of redirects) {
    const { res } = await get(from);
    const location = res.headers.get('location');
    const landed = location ? new URL(location, at(from)) : null;
    const ok = res.status === 308 && landed?.origin === base.origin && `${landed.pathname}${landed.search}` === to;
    check(ok, `GET ${from} → 308 ${to}`, `got ${res.status} ${location ?? '(no Location)'}`);
  }

  // Not found.
  console.log('\nNot found');
  const missing = '/__smoke__/no-such-track';
  const nf = await get(missing);
  check(nf.res.status === 404, `GET ${missing} → 404`, `got ${nf.res.status}`);
  check((nf.res.headers.get('content-type') ?? '').startsWith('text/html') && nf.body.includes('/_astro/'), 'serves the site’s own 404 page (not the server’s)');
  checkHeaders(missing, nf.res);

  if (container) {
    console.log('\nContainer');
    const health = await get('/healthz');
    check(health.res.status === 200 && health.body.trim() === 'ok', 'GET /healthz → 200 ok', `got ${health.res.status}`);
  }
} catch (err) {
  check(false, 'request failed', err.message);
}

/* ── Report ────────────────────────────────────────────────────────────────── */

const total = passed + failures.length;
console.log(`\n${failures.length ? '✗' : '✓'} ${passed}/${total} checks passed on ${base.origin}\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  const lines = [`### Smoke test: \`${base.origin}\``, '', `${passed}/${total} checks passed${origin !== base.origin ? ` (built for \`${origin}\`)` : ''}.`, ''];
  for (const f of failures) lines.push(`- ✗ ${f}`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}

process.exit(failures.length ? 1 : 0);
