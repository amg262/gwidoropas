/** Deterministic, build-stable ids for SVG <defs> (textPath, clipPath). */
let n = 0;
export const uid = (prefix = 'u') => `${prefix}${(++n).toString(36)}`;
