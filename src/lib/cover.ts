/**
 * Generative album covers. Pure functions → SVG strings, so the same art is
 * inlined on the page AND rasterised (via Sharp) into the Open Graph images.
 *
 * Every cover is drawn on a 600 × 600 canvas. The bottom band (y > 410) is kept
 * calm on purpose: that's where the album title is typeset in HTML on top.
 * Shapes only. No <text>, so rasterising never depends on system fonts.
 */

export type CoverStyle = 'stripes' | 'halftone' | 'ripples' | 'venn' | 'bars';

export interface CoverSpec {
  style: CoverStyle;
  bg: string;
  fg: string;
  accent: string;
  /** Any string. Same seed → same art. */
  seed: string;
}

/** Deterministic PRNG (mulberry32 seeded from a string hash). */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Racing lanes: speed bars with a sun behind them. (Molson Coors: pig races.) */
function stripes({ fg, accent, bg, seed }: CoverSpec) {
  const rand = rng(seed);
  const lanes = 7;
  const top = 64;
  const gap = 46;
  let out = `<circle cx="438" cy="178" r="118" fill="${accent}"/>`;
  for (let i = 0; i < lanes; i++) {
    const y = top + i * gap;
    const end = 230 + rand() * 300;
    const colour = i % 3 === 1 ? accent : fg;
    out += `<rect x="-30" y="${y}" width="${r1(end + 30)}" height="24" rx="12" fill="${colour}"/>`;
    // speed dots ahead of each bar
    for (let d = 0; d < 3; d++) {
      out += `<circle cx="${r1(end + 20 + d * 16)}" cy="${y + 12}" r="${4 - d}" fill="${colour}" opacity="${1 - d * 0.28}"/>`;
    }
  }
  out += `<rect x="36" y="410" width="528" height="2" fill="${fg}" opacity=".55"/>`;
  return { bg, body: out };
}

/** A halftone sphere with chocolate-bar segments. (Tabal: bean to bar.) */
function halftone({ fg, accent, bg }: CoverSpec) {
  const cx = 372;
  const cy = 196;
  const R = 230;
  const step = 20;
  let dots = '';
  for (let y = 10; y < 392; y += step) {
    for (let x = 10; x < 600; x += step) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > R) continue;
      // light falls from the upper left: dots grow toward the lower right
      const lx = (x - (cx - R * 0.45)) / (R * 1.6);
      const ly = (y - (cy - R * 0.45)) / (R * 1.6);
      const shade = Math.min(1, Math.max(0.08, Math.hypot(lx, ly)));
      const r = (step / 2) * 0.95 * (1 - shade * 0.85) * Math.sqrt(1 - (d / R) ** 2 * 0.6);
      if (r < 0.6) continue;
      dots += `<circle cx="${x}" cy="${y}" r="${r1(r)}"/>`;
    }
  }
  let bar = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      bar += `<rect x="${44 + col * 52}" y="${52 + row * 52}" width="42" height="42" rx="6" fill="none" stroke="${accent}" stroke-width="3"/>`;
    }
  }
  const body = `<g fill="${fg}">${dots}</g>${bar}<rect x="36" y="410" width="528" height="2" fill="${fg}" opacity=".55"/>`;
  return { bg, body };
}

/** Ripples from a single drop. (Peyton Pours: a pour, Lake Country water.) */
function ripples({ fg, accent, bg }: CoverSpec) {
  const cx = 418;
  const cy = 156;
  let rings = '';
  for (let i = 0, r = 22; r < 640; i++, r += 24) {
    const isAccent = i % 4 === 3;
    rings += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${isAccent ? accent : fg}" stroke-width="${isAccent ? 7 : 1.6}"/>`;
  }
  const body = `<defs><clipPath id="rp"><rect width="600" height="398"/></clipPath></defs>
    <g clip-path="url(#rp)">${rings}</g>
    <circle cx="${cx}" cy="${cy}" r="11" fill="${accent}"/>
    <rect x="36" y="410" width="528" height="2" fill="${fg}" opacity=".55"/>`;
  return { bg, body };
}

/** Equalizer bars. A neutral style for future releases. */
function bars({ fg, accent, bg, seed }: CoverSpec) {
  const rand = rng(seed);
  const n = 15;
  const w = 528 / n;
  let out = '';
  for (let i = 0; i < n; i++) {
    const h = 60 + rand() * 300;
    out += `<rect x="${r1(36 + i * w + 3)}" y="${r1(392 - h)}" width="${r1(w - 6)}" height="${r1(h)}" fill="${i % 5 === 2 ? accent : fg}"/>`;
  }
  out += `<rect x="36" y="410" width="528" height="2" fill="${fg}" opacity=".55"/>`;
  return { bg, body: out };
}

/**
 * Three inks overprinted: marketing, technology, design. Screen-blended on a
 * dark ground, so the overlaps get lighter and the brightest point is where
 * all three meet. (The debut LP: the positioning statement, drawn.)
 */
export const VENN = {
  r: 124,
  centres: [
    { x: 384, y: 244, key: 'marketing' },
    { x: 452, y: 362, key: 'technology' },
    { x: 316, y: 362, key: 'design' },
  ],
  /** Where all three meet (the centroid). */
  meet: { x: 384, y: 323 },
} as const;

function venn({ bg }: CoverSpec) {
  const inks = ['#e0452b', '#2a47c0', '#e9b13b'];
  const circles = VENN.centres
    .map((c, i) => `<circle cx="${c.x}" cy="${c.y}" r="${VENN.r}" fill="${inks[i]}" style="mix-blend-mode:screen"/>`)
    .join('');
  const meet = `<circle cx="${VENN.meet.x}" cy="${VENN.meet.y}" r="9" fill="none" stroke="#16130f" stroke-width="2"/><circle cx="${VENN.meet.x}" cy="${VENN.meet.y}" r="3.5" fill="#16130f"/>`;
  return { bg, body: `<g style="isolation:isolate">${circles}</g>${meet}` };
}

const DRAW = { stripes, halftone, ripples, bars, venn } as const;

/** Full <svg> markup for a cover. */
export function coverSvg(spec: CoverSpec, opts: { title?: string; size?: number } = {}): string {
  const { bg, body } = DRAW[spec.style](spec);
  const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
  const a11y = opts.title ? `role="img" aria-label="${opts.title.replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"${size} ${a11y} preserveAspectRatio="xMidYMid slice"><rect width="600" height="600" fill="${bg}"/>${body}</svg>`;
}
