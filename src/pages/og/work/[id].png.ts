import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '@/lib/og';
import { getWork, type Work } from '@/lib/work';
import { site } from '@/data/site';

export const getStaticPaths = (async () => {
  const work = await getWork();
  return work.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: Work }> = async ({ props }) => {
  const { id, data: d } = props.entry;
  const lead = d.metrics.find((m) => !m.pending);
  const words = d.album.split(' ');
  const half = Math.ceil(words.length / 2);
  const png = await renderOg({
    kicker: `${d.catalog} · ${d.context}${d.released ? ` · ${d.released}` : ''}`,
    title: d.title,
    subtitle: `A release by ${site.name}`,
    footer: `${site.label.name} · ${d.tags.slice(0, 3).join(' · ')}`,
    cover: { ...d.cover, seed: id },
    coverTitle: words.length > 1 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [d.album],
    coverCatalog: d.catalog,
    labelColour: d.cover.accent,
    labelInk: d.cover.bg,
    metric: lead,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
