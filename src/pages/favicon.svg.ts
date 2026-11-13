import type { APIRoute } from 'astro';
import { initials } from '@/data/site';

/** A tiny record: vinyl, grooves, red label, monogram. */
export const GET: APIRoute = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="31.5" fill="#0e0d0b"/>
  <g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1"><circle cx="32" cy="32" r="27"/><circle cx="32" cy="32" r="23"/><circle cx="32" cy="32" r="19.5"/></g>
  <circle cx="32" cy="32" r="15" fill="#e0452b"/>
  <text x="32" y="32.5" text-anchor="middle" dominant-baseline="central" font-family="'Arial Narrow', Arial, sans-serif" font-weight="700" font-size="${initials.length > 1 ? 12 : 15}" fill="#16130f">${initials}</text>
</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
