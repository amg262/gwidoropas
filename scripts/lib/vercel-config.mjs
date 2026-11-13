/**
 * Reads vercel.json's `headers` the way Vercel does. Shared by the nginx
 * compiler (scripts/vercel-headers-to-nginx.mjs) and the contract test
 * (scripts/smoke.mjs), so the container and the test can't disagree about
 * what the rules mean.
 */
import fs from 'node:fs';

/** Headers Vercel's edge sends when vercel.json says nothing. Lowest precedence. */
export const PLATFORM_DEFAULTS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
};

export class UnsupportedConfigError extends Error {}

export function readVercelConfig(file = 'vercel.json') {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * The path-to-regexp subset Vercel configs use in practice, as a PCRE/JS regex
 * source: literal segments, regex groups like (.*) passed through (made
 * non-capturing), :param (one segment), :param* (the rest), :param+ and :param?.
 */
export function sourceToRegex(source) {
  if (!source.startsWith('/')) throw new UnsupportedConfigError(`Header source "${source}" must start with "/".`);
  let out = '';
  for (let i = 0; i < source.length; ) {
    const ch = source[i];
    if (ch === '(') {
      let depth = 0;
      let j = i;
      for (; j < source.length; j++) {
        if (source[j] === '(') depth++;
        if (source[j] === ')' && --depth === 0) break;
      }
      if (depth !== 0) throw new UnsupportedConfigError(`Unbalanced parentheses in header source "${source}".`);
      // Non-capturing, so an nginx map can't clobber $1… used elsewhere.
      out += source.slice(i, j + 1).replace(/\((?!\?)/g, '(?:');
      i = j + 1;
    } else if (ch === ':') {
      const m = /^:([A-Za-z_]\w*)([*+?]?)/.exec(source.slice(i));
      if (!m) throw new UnsupportedConfigError(`Can't parse parameter in header source "${source}".`);
      out += { '*': '.*', '+': '.+', '?': '[^/]*', '': '[^/]+' }[m[2]];
      i += m[0].length;
    } else if (ch === '{' || ch === '}') {
      throw new UnsupportedConfigError(`Header source "${source}" uses path-to-regexp syntax this tooling doesn't support ("${ch}").`);
    } else {
      out += /[.*+?^$|[\]\\]/.test(ch) ? `\\${ch}` : ch;
      i++;
    }
  }
  return `^${out}$`;
}

/**
 * Every header key with its rules in vercel.json order, plus Vercel's platform
 * default as the fallback. Keys keep the casing of their first appearance.
 * @returns {{ key: string, rules: { regex: string, value: string, source: string }[], fallback: string | null }[]}
 */
export function headerRules(config) {
  const byKey = new Map();
  const entry = (key) => {
    const id = key.toLowerCase();
    if (!byKey.has(id)) byKey.set(id, { key, rules: [], fallback: null });
    return byKey.get(id);
  };
  for (const rule of config.headers ?? []) {
    if (rule.has || rule.missing) throw new UnsupportedConfigError(`Header rule for "${rule.source}" uses has/missing conditions, which this tooling doesn't support.`);
    const regex = sourceToRegex(rule.source);
    for (const { key, value } of rule.headers) entry(key).rules.push({ regex, value, source: rule.source });
  }
  for (const [key, value] of Object.entries(PLATFORM_DEFAULTS)) entry(key).fallback = value;
  return [...byKey.values()];
}

/**
 * What Vercel would send for a request path: for each key, the last matching
 * rule wins, else the platform default, else nothing (null).
 * @returns {Record<string, string | null>}
 */
export function expectedHeaders(config, path) {
  const out = {};
  for (const { key, rules, fallback } of headerRules(config)) {
    const hit = rules.filter((r) => new RegExp(r.regex).test(path)).at(-1);
    out[key] = hit ? hit.value : fallback;
  }
  return out;
}
