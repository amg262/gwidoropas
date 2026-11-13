import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { initials } from '@/data/site';

/** 180×180 home-screen icon, generated from the initials in site.ts. */
export const GET: APIRoute = async () => {
  const font = await fs.readFile(path.join(process.cwd(), 'node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff'));
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: 180,
          height: 180,
          alignItems: 'center',
          justifyContent: 'center',
          background: '#17140f',
          color: '#f6f2ea',
          fontFamily: 'Fraunces',
          fontSize: 76,
          letterSpacing: -2,
        },
        children: initials,
      },
    } as unknown as Parameters<typeof satori>[0],
    { width: 180, height: 180, fonts: [{ name: 'Fraunces', data: font, weight: 500, style: 'normal' }] },
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
