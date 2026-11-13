/**
 * Date helpers for the living résumé.
 *
 * Dates in src/data/site.ts are written as 'YYYY-MM' (or 'YYYY' when only the
 * year is known). `null` means "present". Anything time-relative — tenure,
 * "now playing", the pressing date in the footer — is computed at build time,
 * so the copy stays true every time the site is rebuilt.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** The moment this pressing was built. */
export const BUILD_DATE = new Date();

function parse(ym: string): { y: number; m: number | null } {
  const [y, m] = ym.split('-').map(Number);
  return { y: y!, m: m ? m : null };
}

/** '2026-07' → 'Jul 2026'; '2024' → '2024'; null → 'Present'. */
export function formatYm(ym: string | null): string {
  if (ym === null) return 'Present';
  const { y, m } = parse(ym);
  return m ? `${MONTHS[m - 1]} ${y}` : String(y);
}

/** 'Jul 2026 – Present', '2024', 'Mar – Dec 2024'. */
export function formatRange(start: string, end: string | null): string {
  if (end !== null && start === end) return formatYm(start);
  const a = parse(start);
  if (end !== null) {
    const b = parse(end);
    if (a.y === b.y && a.m && b.m) return `${MONTHS[a.m - 1]} – ${MONTHS[b.m - 1]} ${b.y}`;
  }
  return `${formatYm(start)} – ${formatYm(end)}`;
}

/** Just the years: '2026–', '2024', '2021–24'. Used in the discography's year column. */
export function yearSpan(start: string, end: string | null): string {
  const a = parse(start).y;
  if (end === null) return `${a}–`;
  const b = parse(end).y;
  return a === b ? String(a) : `${a}–${String(b).slice(2)}`;
}

/** Whole months between a 'YYYY-MM' date and the build date. */
export function monthsSince(ym: string, now = BUILD_DATE): number {
  const { y, m } = parse(ym);
  return (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1 - (m ?? 1));
}

/** Completed years since a 'YYYY-MM' date: the "5" in "5+ years". */
export function yearsSince(ym: string, now = BUILD_DATE): number {
  return Math.floor(monthsSince(ym, now) / 12);
}

/**
 * Natural-language tenure that stays honest as time passes:
 * 5y 9m → "almost six years", 6y 1m → "six years", 6y 5m → "over six years".
 */
export function tenure(ym: string, now = BUILD_DATE): string {
  const months = monthsSince(ym, now);
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const word = (n: number) => WORDS[n] ?? String(n);
  if (rem >= 9) return `almost ${word(years + 1)} years`;
  if (rem <= 2) return years === 1 ? 'one year' : `${word(years)} years`;
  return years === 1 ? 'over a year' : `over ${word(years)} years`;
}

/** 'November 13, 2026' — the pressing date printed in the footer. */
export function formatPressing(d = BUILD_DATE): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' });
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
