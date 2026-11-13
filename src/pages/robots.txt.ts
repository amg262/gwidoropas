import type { APIRoute } from 'astro';
import { robotsTxt } from '@/lib/visibility';

/** Built from site.visibility. See src/lib/visibility.ts. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(robotsTxt(sitemap), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
