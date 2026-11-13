import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '@/lib/og';
import { getWork, type Work } from '@/lib/work';

export const getStaticPaths = (async () => {
  const work = await getWork();
  return work.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: Work }> = async ({ props }) => {
  const { title, context, accent, metrics } = props.entry.data;
  const png = await renderOg({ eyebrow: `Case study · ${context}`, title, accent, metric: metrics[0] });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
