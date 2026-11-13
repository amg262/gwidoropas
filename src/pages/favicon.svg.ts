import type { APIRoute } from 'astro';
import { initials } from '@/data/site';

/** Monogram favicon generated from the name in site.ts. */
export const GET: APIRoute = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>circle{fill:#17140f}text{fill:#f6f2ea}@media (prefers-color-scheme:dark){circle{fill:#f3eee6}text{fill:#13110e}}</style>
  <circle cx="32" cy="32" r="32"/>
  <text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-family="Georgia, 'Times New Roman', serif" font-size="${initials.length > 1 ? 27 : 34}" font-weight="600">${initials}</text>
</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
