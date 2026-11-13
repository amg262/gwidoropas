/**
 * Build-time Open Graph images (the preview card on LinkedIn, iMessage, Slack…).
 * Layout → SVG with Satori, SVG → PNG with Sharp. The cover art is the same
 * generative SVG the site uses, rasterised by Sharp and placed as an image, so
 * a shared link looks like the sleeve on the page. No runtime cost.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { coverSvg, type CoverSpec } from '@/lib/cover';
import { site, catalog } from '@/data/site';

const W = 1200;
const H = 630;

const C = {
  paper: '#efe8da',
  ink: '#16130f',
  ink2: '#3a352e',
  muted: '#625b4f',
  line: '#cfc4ae',
  red: '#e0452b',
  mustard: '#e9b13b',
  vinyl: '#0e0d0b',
};

type Child = Node | string | null;
interface Node {
  type: string;
  props: { style?: Record<string, unknown>; src?: string; width?: number; height?: number; children?: Child | Child[] };
}

const el = (style: Record<string, unknown>, children: Child | Child[] = []): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

const img = (src: string, size: number, style: Record<string, unknown> = {}): Node => ({
  type: 'img',
  props: { src, width: size, height: size, style: { width: size, height: size, ...style } },
});

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;

function loadFonts() {
  const nm = (p: string) => path.join(process.cwd(), 'node_modules', p);
  const local = (f: string) => path.join(process.cwd(), 'src', 'assets', 'og-fonts', f);
  fonts ??= Promise.all([
    fs.readFile(local('archivo-condensed-800.woff')),
    fs.readFile(local('archivo-expanded-600.woff')),
    fs.readFile(nm('@fontsource/archivo/files/archivo-latin-500-normal.woff')),
    fs.readFile(nm('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff')),
    fs.readFile(nm('@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff')),
  ]).then(([condensed, expanded, body, serif, mono]) => [
    { name: 'Condensed', data: condensed, weight: 800 as const, style: 'normal' as const },
    { name: 'Expanded', data: expanded, weight: 600 as const, style: 'normal' as const },
    { name: 'Archivo', data: body, weight: 500 as const, style: 'normal' as const },
    { name: 'Serif', data: serif, weight: 400 as const, style: 'italic' as const },
    { name: 'Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ]);
  return fonts;
}

async function coverPng(spec: CoverSpec, size: number): Promise<string> {
  const png = await sharp(Buffer.from(coverSvg(spec, { size: size * 2 })))
    .resize(size * 2, size * 2)
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

/** A vinyl record peeking out from behind the sleeve. */
function record(size: number, label: string, labelInk: string, text: string): Node {
  const rings = [0.96, 0.86, 0.76, 0.66, 0.56, 0.46].map((f) =>
    el({
      position: 'absolute',
      left: (size * (1 - f)) / 2,
      top: (size * (1 - f)) / 2,
      width: size * f,
      height: size * f,
      borderRadius: size,
      border: '1.5px solid rgba(255,255,255,0.07)',
    }),
  );
  const labelSize = size * 0.34;
  return el(
    {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size,
      background: C.vinyl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    [
      ...rings,
      el(
        {
          width: labelSize,
          height: labelSize,
          borderRadius: labelSize,
          background: label,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: labelInk,
        },
        [el({ fontFamily: 'Condensed', fontSize: labelSize * 0.2, letterSpacing: 1 }, text), el({ width: 10, height: 10, borderRadius: 10, background: C.paper, marginTop: 6 })],
      ),
    ],
  );
}

interface OgOptions {
  /** Small caps line above the title. */
  kicker: string;
  /** Big condensed title. */
  title: string;
  /** Serif italic line under the title. */
  subtitle: string;
  /** Mono footer line. */
  footer: string;
  cover: CoverSpec;
  /** Typeset over the cover: [line1, line2?]. */
  coverTitle: string[];
  coverCatalog: string;
  labelColour: string;
  labelInk: string;
  /** Optional headline number in the footer area. */
  metric?: { value: string; label: string };
}

export async function renderOg(o: OgOptions): Promise<Buffer> {
  const sleeve = 470;
  const recSize = 440;
  const x0 = 56;
  const y0 = (H - sleeve) / 2;

  const titleSize = o.title.length > 44 ? 64 : o.title.length > 26 ? 78 : 112;

  const cover = await coverPng(o.cover, sleeve);

  const art = el({ position: 'absolute', left: x0, top: y0, width: sleeve + 190, height: sleeve }, [
    el({ position: 'absolute', left: 190, top: (sleeve - recSize) / 2, width: recSize, height: recSize }, [record(recSize, o.labelColour, o.labelInk, o.coverCatalog)]),
    el(
      {
        position: 'absolute',
        left: 0,
        top: 0,
        width: sleeve,
        height: sleeve,
        boxShadow: '0 18px 40px rgba(30,20,10,0.35)',
      },
      [
        img(cover, sleeve, { position: 'absolute', left: 0, top: 0 }),
        el(
          {
            position: 'absolute',
            left: 30,
            top: 26,
            right: 30,
            justifyContent: 'space-between',
            fontFamily: 'Mono',
            fontSize: 15,
            color: o.cover.fg,
          },
          [o.coverCatalog, el({ fontFamily: 'Expanded', fontSize: 11, letterSpacing: 2 }, site.label.name.toUpperCase())],
        ),
        el(
          {
            position: 'absolute',
            left: 30,
            bottom: 28,
            right: 30,
            flexDirection: 'column',
            color: o.cover.fg,
          },
          [
            el({ flexDirection: 'column', fontFamily: 'Condensed', fontSize: o.coverTitle.join(' ').length > 12 ? 58 : 68, lineHeight: 0.86 }, o.coverTitle.map((t) => el({}, t.toUpperCase()))),
            el({ marginTop: 10, fontFamily: 'Expanded', fontSize: 11, letterSpacing: 2 }, site.name.toUpperCase()),
          ],
        ),
      ],
    ),
  ]);

  const text = el(
    {
      position: 'absolute',
      left: 760,
      top: 64,
      right: 56,
      bottom: 64,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    [
      el({ fontFamily: 'Expanded', fontSize: 14, letterSpacing: 2.6, color: C.ink2 }, o.kicker.toUpperCase()),
      el({ flexDirection: 'column' }, [
        el({ flexDirection: 'column', fontFamily: 'Condensed', fontSize: titleSize, lineHeight: 0.88, color: C.ink }, o.title.toUpperCase().split('\n').map((t) => el({ flexWrap: 'wrap' }, t))),
        el({ marginTop: 18, fontFamily: 'Serif', fontStyle: 'italic', fontSize: 34, lineHeight: 1.08, color: C.ink2 }, o.subtitle),
      ]),
      el({ flexDirection: 'column', gap: 14 }, [
        o.metric
          ? el({ alignItems: 'flex-end', gap: 14, paddingTop: 14, borderTop: `2px solid ${C.ink}` }, [
              el({ fontFamily: 'Condensed', fontSize: 64, lineHeight: 0.8, color: C.red }, o.metric.value),
              el({ fontFamily: 'Archivo', fontSize: 18, color: C.ink2, maxWidth: 230, lineHeight: 1.2 }, o.metric.label),
            ])
          : el({ height: 2, background: C.ink }),
        el({ fontFamily: 'Mono', fontSize: 16, color: C.muted, letterSpacing: 0.5 }, o.footer),
      ]),
    ],
  );

  const root = el({ position: 'relative', width: W, height: H, background: C.paper }, [art, text]);

  const svg = await satori(root as unknown as Parameters<typeof satori>[0], { width: W, height: H, fonts: await loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

/** The debut LP: the home page card. */
export function renderHomeOg() {
  const [first, ...rest] = site.name.split(' ');
  return renderOg({
    kicker: `${site.label.name} presents`,
    title: `${first}\n${rest.join(' ')}`,
    subtitle: `${site.headline}, working where marketing, technology and design meet.`,
    footer: `${catalog(1)} · LP · ${site.label.city}`,
    cover: { style: 'venn', bg: '#16130f', fg: '#efe8da', accent: C.red, seed: 'debut' },
    coverTitle: [first!, rest.join(' ')],
    coverCatalog: catalog(1),
    labelColour: C.red,
    labelInk: C.ink,
  });
}
