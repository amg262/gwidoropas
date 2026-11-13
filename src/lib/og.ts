/**
 * Build-time Open Graph images (the preview card on LinkedIn, iMessage, Slack…).
 * Rendered with Satori (layout → SVG) and Sharp (SVG → PNG), so they always
 * reflect the current name, headline and case-study metrics. No runtime cost.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { site, initials } from '@/data/site';

const W = 1200;
const H = 630;
const PAD_X = 64;
const PAD_Y = 56;

const C = {
  paper: '#f6f2ea',
  ink: '#17140f',
  ink2: '#4a443b',
  line: '#d9d1c3',
  accent: '#e4572e',
};

type Child = Node | string;
interface Node {
  type: string;
  props: { style?: Record<string, unknown>; children?: Child | Child[] };
}

const el = (style: Record<string, unknown>, children: Child | Child[] = []): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined;

function loadFonts() {
  const dir = path.join(process.cwd(), 'node_modules', '@fontsource');
  const read = (pkg: string, file: string) => fs.readFile(path.join(dir, pkg, 'files', file));
  fonts ??= Promise.all([
    read('fraunces', 'fraunces-latin-400-normal.woff'),
    read('fraunces', 'fraunces-latin-400-italic.woff'),
    read('instrument-sans', 'instrument-sans-latin-500-normal.woff'),
    read('instrument-sans', 'instrument-sans-latin-600-normal.woff'),
  ]).then(([serif, serifItalic, sans500, sans600]) => [
    { name: 'Fraunces', data: serif, weight: 400 as const, style: 'normal' as const },
    { name: 'Fraunces', data: serifItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Instrument Sans', data: sans500, weight: 500 as const, style: 'normal' as const },
    { name: 'Instrument Sans', data: sans600, weight: 600 as const, style: 'normal' as const },
  ]);
  return fonts;
}

/** "*accent* words" → individual word nodes so emphasised words can be styled. */
function headline(text: string, size: number, accent: string): Node {
  const words: Node[] = [];
  for (const part of text.split(/(\*[^*]+\*)/g).filter(Boolean)) {
    const emphasised = part.startsWith('*') && part.endsWith('*');
    for (const word of part.replace(/\*/g, '').split(/\s+/).filter(Boolean)) {
      words.push(
        el(emphasised ? { color: accent, fontStyle: 'italic' } : {}, word),
      );
    }
  }
  return el(
    {
      flexWrap: 'wrap',
      columnGap: size * 0.26,
      fontFamily: 'Fraunces',
      fontSize: size,
      lineHeight: 1.05,
      letterSpacing: -size * 0.03,
      color: C.ink,
    },
    words,
  );
}

interface OgOptions {
  eyebrow: string;
  title: string;
  accent?: string;
  metric?: { value: string; label: string };
}

export async function renderOg({ eyebrow, title, accent = C.accent, metric }: OgOptions): Promise<Buffer> {
  const titleSize = title.length > 70 ? 60 : title.length > 48 ? 68 : 78;

  const top = el({ justifyContent: 'space-between', alignItems: 'center', width: '100%' }, [
    el({ alignItems: 'center', gap: 18 }, [
      el(
        {
          width: 60,
          height: 60,
          borderRadius: 30,
          background: C.ink,
          color: C.paper,
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Fraunces',
          fontSize: 26,
        },
        initials,
      ),
      el({ fontFamily: 'Instrument Sans', fontWeight: 600, fontSize: 28, color: C.ink }, site.name),
    ]),
    el(
      {
        fontFamily: 'Instrument Sans',
        fontWeight: 600,
        fontSize: 20,
        letterSpacing: 2.4,
        textTransform: 'uppercase',
        color: C.ink2,
      },
      eyebrow,
    ),
  ]);

  const body = el({ flexDirection: 'column', gap: 28, flex: 1, justifyContent: 'center', maxWidth: metric ? 660 : 1000 }, [
    headline(title, titleSize, accent),
  ]);

  const metricBlock = metric
    ? el(
        {
          position: 'absolute',
          right: 0,
          bottom: 0,
          // content-box: rendered size is 388 × 368 including padding
          width: 300,
          height: 320,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 44px 48px',
          background: accent,
          borderTopLeftRadius: 28,
          color: '#fff',
        },
        [
          el({ fontFamily: 'Fraunces', fontSize: 104, lineHeight: 1, letterSpacing: -3 }, metric.value),
          el({ fontFamily: 'Instrument Sans', fontWeight: 600, fontSize: 26, lineHeight: 1.25, marginTop: 12 }, metric.label),
        ],
      )
    : null;

  const footer = el(
    {
      alignItems: 'center',
      gap: 16,
      fontFamily: 'Instrument Sans',
      fontWeight: 500,
      fontSize: 24,
      color: C.ink2,
    },
    [el({ width: 44, height: 4, background: accent, borderRadius: 2 }), `${site.education.school} · Class of ${site.education.graduation.split(' ').pop()}`],
  );

  const root = el(
    {
      position: 'relative',
      // Satori sizes boxes content-box: subtract the padding so nothing overflows the canvas.
      width: W - PAD_X * 2,
      height: H - PAD_Y * 2,
      boxSizing: 'content-box',
      flexDirection: 'column',
      padding: `${PAD_Y}px ${PAD_X}px`,
      background: C.paper,
    },
    [top, body, el({ maxWidth: metric ? 660 : 1000 }, [footer]), ...(metricBlock ? [metricBlock] : [])],
  );

  // Satori's types expect ReactNode; our plain object tree is the same shape.
  const svg = await satori(root as unknown as Parameters<typeof satori>[0], { width: W, height: H, fonts: await loadFonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
