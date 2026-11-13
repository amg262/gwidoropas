import type { APIRoute } from 'astro';
import { renderOg } from '@/lib/og';
import { site } from '@/data/site';

export const GET: APIRoute = async () => {
  const png = await renderOg({ eyebrow: 'Marketing portfolio', title: site.hero.headline });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
