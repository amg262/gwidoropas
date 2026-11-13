#!/usr/bin/env node
/**
 * Presses the README header image: Gwido as the centre label of the Ropas
 * Records LP, using the same grooves, track gaps and label red as the site's
 * record (src/components/Record.astro).
 *
 *   npm run readme:portrait
 *
 * Re-run it after replacing src/assets/portrait/gwido-ropas.jpg. Rendered with
 * Satori (text becomes vector paths, using the fonts committed in the repo) and
 * Sharp, so the output is the same on every machine. Transparent background,
 * so it sits on GitHub's light and dark themes alike.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const SRC = path.join(root, 'src/assets/portrait/gwido-ropas.jpg');
const OUT = path.join(root, '.github/assets/gwido-ropas-record.png');

const S = 720; // output size in px
const u = (n) => (n / 400) * S; // Record.astro draws on a 400-unit canvas

const C = { vinyl: '#0e0d0b', red: '#e0452b', ink: '#16130f', paper: '#efe8da' };

const div = (style, children = []) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const ring = (r, style) => div({ position: 'absolute', left: u(200 - r), top: u(200 - r), width: u(2 * r), height: u(2 * r), borderRadius: '50%', ...style });

// Grooves with three smooth track gaps, as on the site, starting outside the (bigger) label.
const LABEL = 118;
const PHOTO = 104;
const gaps = [
  [143, 148],
  [164, 169],
  [181, 186],
];
const grooves = [];
for (let r = LABEL + 6; r < 195; r += 2.3) if (!gaps.some(([a, b]) => r > a && r < b)) grooves.push(r);

// Label text set around the red band, one glyph at a time (Satori has no textPath).
const RING_TEXT = 'ROPAS RECORDS · RR-001 · SIDE A · STEREO · GWIDO ROPAS · ';
const R_TEXT = (LABEL + PHOTO) / 2 + 0.6;
const glyphs = [...RING_TEXT].map((ch, i, all) => {
  const theta = (i / all.length) * 2 * Math.PI;
  const box = u(10);
  return div(
    {
      position: 'absolute',
      left: u(200) + u(R_TEXT) * Math.sin(theta) - box / 2,
      top: u(200) - u(R_TEXT) * Math.cos(theta) - box / 2,
      width: box,
      height: box,
      alignItems: 'center',
      justifyContent: 'center',
      transform: `rotate(${(theta * 180) / Math.PI}deg)`,
      fontFamily: 'Mono',
      fontSize: u(7),
      color: C.ink,
    },
    ch,
  );
});

const photo = await sharp(SRC).resize(Math.round(u(2 * PHOTO) * 2)).jpeg({ quality: 90 }).toBuffer();
const photoUri = `data:image/jpeg;base64,${photo.toString('base64')}`;

const tree = div({ position: 'relative', width: S, height: S }, [
  // The disc, its edge and a still sheen.
  ring(199.5, { background: C.vinyl }),
  ring(198, { border: `${u(1)}px solid rgba(255,255,255,0.10)` }),
  ...grooves.map((r) => ring(r, { border: `${u(0.7)}px solid rgba(255,255,255,0.055)` })),
  ...gaps.map(([a, b]) => ring((a + b) / 2, { border: `${u(2.6)}px solid rgba(255,255,255,0.08)` })),
  ring(199.5, { backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.13) 34%, rgba(255,255,255,0) 46%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 80%)' }),
  // The label: red band with the ring text, the photo inset in it.
  ring(LABEL, { background: C.red }),
  ring(LABEL - 3, { border: `${u(0.8)}px solid rgba(22,19,15,0.35)` }),
  ...glyphs,
  {
    type: 'img',
    props: {
      src: photoUri,
      width: u(2 * PHOTO),
      height: u(2 * PHOTO),
      style: { position: 'absolute', left: u(200 - PHOTO), top: u(200 - PHOTO), width: u(2 * PHOTO), height: u(2 * PHOTO), borderRadius: '50%' },
    },
  },
  ring(PHOTO, { border: `${u(1.6)}px solid ${C.ink}` }),
]);

const mono = await fs.readFile(path.join(root, 'node_modules/@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff'));
const svg = await satori(tree, { width: S, height: S, fonts: [{ name: 'Mono', data: mono, weight: 500, style: 'normal' }] });
await fs.mkdir(path.dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);

const { size } = await fs.stat(OUT);
console.log(`Pressed ${path.relative(root, OUT)} (${S}×${S}, ${(size / 1024).toFixed(0)} kB)`);
