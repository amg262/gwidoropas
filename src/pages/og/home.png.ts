import type { APIRoute } from 'astro';
import { renderHomeOg } from '@/lib/og';

export const GET: APIRoute = async () => {
  const png = await renderHomeOg();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
