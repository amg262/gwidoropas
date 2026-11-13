import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { initials } from '@/data/site';

const ring = (size: number, total: number) => ({
  type: 'div',
  props: {
    style: {
      position: 'absolute',
      left: (total - size) / 2,
      top: (total - size) / 2,
      width: size,
      height: size,
      borderRadius: size,
      border: '1.5px solid rgba(255,255,255,0.12)',
    },
  },
});

/** 180×180 home-screen icon: the record, label up. */
export const GET: APIRoute = async () => {
  const font = await fs.readFile(path.join(process.cwd(), 'src/assets/og-fonts/archivo-condensed-800.woff'));
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: { display: 'flex', width: 180, height: 180, alignItems: 'center', justifyContent: 'center', background: '#0e0d0b', position: 'relative' },
        children: [
          ring(160, 180),
          ring(136, 180),
          ring(112, 180),
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: 84,
                height: 84,
                borderRadius: 84,
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e0452b',
                color: '#16130f',
                fontFamily: 'Condensed',
                fontSize: 40,
              },
              children: initials,
            },
          },
        ],
      },
    } as unknown as Parameters<typeof satori>[0],
    { width: 180, height: 180, fonts: [{ name: 'Condensed', data: font, weight: 800, style: 'normal' }] },
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
