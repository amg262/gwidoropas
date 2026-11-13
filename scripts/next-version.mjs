#!/usr/bin/env node
/**
 * Works out the version for a release from the git tags. Used by the pipeline
 * on every push to main; also handy locally:
 *
 *   node scripts/next-version.mjs            # what the next release would be
 *   node scripts/next-version.mjs minor      # force a bump
 *
 * Rules
 *  • Tags (vMAJOR.MINOR.PATCH) are the source of truth. With no tags yet, the
 *    first release is package.json's version.
 *  • "auto" (the default) reads the commits since the last tag, using
 *    Conventional Commits if they're there:
 *       feat!: / fix!: / "BREAKING CHANGE"  → major
 *       feat: / feat(scope):                → minor
 *       anything else                       → patch
 *    So an ordinary merge is a patch release, which suits a website: every
 *    merge to main is a production deploy, and each one gets a version.
 *  • Re-running the pipeline on a commit that's already tagged reuses that
 *    version instead of bumping again (idempotent re-runs).
 *  • If main has moved past this commit, there is nothing to release: a
 *    re-run of an old pipeline must never stamp `latest` on older content.
 *
 * Writes key=value lines to $GITHUB_OUTPUT when set, and always to stdout:
 *   release=true|false  version=1.4.2  tag=v1.4.2  previous=v1.4.1  bump=patch  reason=…
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const SEMVER_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

const requested = (process.argv[2] ?? process.env.BUMP ?? 'auto').toLowerCase();
if (!['auto', 'patch', 'minor', 'major'].includes(requested)) {
  console.error(`Unknown bump "${requested}". Use auto, patch, minor or major.`);
  process.exit(2);
}

const out = {};
const emit = () => {
  const lines = Object.entries(out).map(([k, v]) => `${k}=${v}`);
  console.log(lines.join('\n'));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
};

const head = git('rev-parse', 'HEAD');

// 1. Superseded? (Only meaningful where origin/main exists, i.e. in CI.)
const branch = process.env.RELEASE_BRANCH ?? 'main';
let tip = null;
try {
  tip = git('rev-parse', `origin/${branch}`);
} catch {
  /* no remote-tracking branch locally: skip the check */
}
if (tip && tip !== head && process.env.GITHUB_ACTIONS) {
  Object.assign(out, { release: false, reason: `${branch} has moved on to ${tip.slice(0, 7)}; not releasing the older ${head.slice(0, 7)}` });
  emit();
  process.exit(0);
}

const versionTags = git('tag', '--list', 'v*')
  .split('\n')
  .filter((t) => SEMVER_TAG.test(t))
  .sort((a, b) => {
    const [, ...x] = SEMVER_TAG.exec(a).map(Number);
    const [, ...y] = SEMVER_TAG.exec(b).map(Number);
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });

// 2. Already released this exact commit? Reuse it.
const onHead = git('tag', '--points-at', head)
  .split('\n')
  .filter((t) => SEMVER_TAG.test(t));
if (onHead.length) {
  const tag = onHead.at(-1);
  const i = versionTags.indexOf(tag);
  Object.assign(out, { release: true, existing: true, version: tag.slice(1), tag, previous: i > 0 ? versionTags[i - 1] : '', bump: 'none', reason: `${head.slice(0, 7)} is already ${tag}` });
  emit();
  process.exit(0);
}

const previous = versionTags.at(-1);

// 3. First release.
if (!previous) {
  const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`package.json version "${version}" isn't MAJOR.MINOR.PATCH`);
  Object.assign(out, { release: true, existing: false, version, tag: `v${version}`, previous: '', bump: 'initial', reason: 'first release (version from package.json)' });
  emit();
  process.exit(0);
}

// 4. Bump from the last tag.
let bump = requested;
let reason = `requested ${requested}`;
if (bump === 'auto') {
  const log = git('log', '--format=%s%n%b%n--end--', `${previous}..${head}`);
  const subjects = log.split('--end--').map((c) => c.trim());
  if (subjects.some((c) => /^\w+(\([^)]*\))?!:/.test(c) || /^BREAKING[ -]CHANGE:/m.test(c))) {
    bump = 'major';
    reason = 'a commit since the last release is marked breaking';
  } else if (subjects.some((c) => /^feat(\([^)]*\))?:/.test(c))) {
    bump = 'minor';
    reason = 'a feat: commit since the last release';
  } else {
    bump = 'patch';
    reason = 'no feat: or breaking commits since the last release';
  }
}

let [, major, minor, patch] = SEMVER_TAG.exec(previous).map(Number);
if (bump === 'major') [major, minor, patch] = [major + 1, 0, 0];
else if (bump === 'minor') [minor, patch] = [minor + 1, 0];
else patch += 1;

const version = `${major}.${minor}.${patch}`;
Object.assign(out, { release: true, existing: false, version, tag: `v${version}`, previous, bump, reason });
emit();
