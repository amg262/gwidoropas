#!/usr/bin/env node
/**
 * Compile the `headers` in vercel.json into nginx config for the container.
 *
 * Why: the site is served two ways: by Vercel (production) and by the Docker
 * image (anywhere else). The response headers are a contract, and the
 * X-Robots-Tag in particular is what keeps an unlisted site out of search (see
 * src/lib/visibility.ts). Hand-copying them into nginx would drift, so
 * vercel.json stays the single source of truth and the image is compiled from
 * it at build time. Going public (deleting the X-Robots-Tag rule) therefore
 * updates both hosts in one edit.
 *
 * Output: one file for nginx's http{} context (it goes in conf.d/). For each
 * header key there is a `map` from the request path to the value, plus one
 * `add_header … always` line. Keeping every add_header at http level matters:
 * nginx drops inherited add_header directives in any block that declares its
 * own, so the server config (deploy/nginx/default.conf) must declare none.
 *
 * Semantics copied from Vercel (see scripts/lib/vercel-config.mjs):
 *  • `source` is matched against the request path (query string excluded).
 *  • When several rules set the same key on one path, the last rule wins.
 *  • Vercel's platform default Cache-Control applies when no rule sets one.
 *
 * Anything this compiler doesn't understand (has/missing conditions, redirects,
 * rewrites, exotic path patterns) fails the image build with an explanation.
 * Shipping a container that silently ignores part of vercel.json is worse.
 *
 * Usage: node scripts/vercel-headers-to-nginx.mjs [vercel.json] > vercel-headers.conf
 */
import { readVercelConfig, headerRules, UnsupportedConfigError } from './lib/vercel-config.mjs';

const file = process.argv[2] ?? 'vercel.json';

function fail(message) {
  console.error(`[vercel-headers-to-nginx] ${message}`);
  process.exit(1);
}

let config;
let keys;
try {
  config = readVercelConfig(file);
  keys = headerRules(config);
} catch (err) {
  fail(err instanceof UnsupportedConfigError ? err.message : `Couldn't read ${file}: ${err.message}`);
}

/* ── Guard the routing behaviour that deploy/nginx/default.conf hard-codes ── */

if (config.cleanUrls !== true) fail('deploy/nginx/default.conf implements cleanUrls: true, but vercel.json no longer says so. Update both together.');
if (config.trailingSlash !== false) fail('deploy/nginx/default.conf implements trailingSlash: false, but vercel.json no longer says so. Update both together.');
for (const key of ['redirects', 'rewrites', 'routes']) {
  if (config[key]?.length) fail(`vercel.json has "${key}", which the container doesn't implement yet. Add the equivalent to deploy/nginx/default.conf and teach this script to accept it.`);
}

for (const { key, rules } of keys) {
  for (const { value } of rules) {
    if (/[\r\n]/.test(value)) fail(`Header ${key} contains a line break.`);
    if (value.includes('$')) fail(`Header ${key} contains "$", which nginx would read as a variable.`);
  }
}

/* ── Emit ──────────────────────────────────────────────────────────────────── */

const q = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const varName = (key) => `$vercel_hdr_${key.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

const lines = [
  `# GENERATED from ${file} by scripts/vercel-headers-to-nginx.mjs at image build time.`,
  '# Do not edit; change vercel.json instead. http{} context.',
  '',
  '# The request path as Vercel matches it: the original URI, before any',
  '# clean-URL lookup or 404 handling, without the query string.',
  'map $request_uri $vercel_request_path {',
  '    "~^(?<vercel_p>[^?]*)" $vercel_p;',
  '    default $request_uri;',
  '}',
  '',
];

for (const { key, rules, fallback } of keys) {
  lines.push(`map $vercel_request_path ${varName(key)} {`);
  // nginx tests map regexes top to bottom and stops at the first match, so the
  // last vercel.json rule goes first to get Vercel's last-one-wins behaviour.
  for (const r of [...rules].reverse()) lines.push(`    ${q(`~${r.regex}`)} ${q(r.value)}; # ${r.source}`);
  lines.push(`    default ${q(fallback ?? '')};`, '}', '');
}

// `always` adds the header to error responses too (a 404 must say noindex).
// An empty value makes nginx skip the header, i.e. "no rule matched".
for (const { key } of keys) lines.push(`add_header ${key} ${varName(key)} always;`);
lines.push('');

process.stdout.write(lines.join('\n'));
