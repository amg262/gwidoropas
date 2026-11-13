# Ropas Records · Gwido Ropas

The portfolio and living résumé of **Gwido Ropas**, an AI-forward marketer working where marketing, technology and design meet. It's designed as the catalogue of an imaginary mid-century record label: his career is the debut LP (RR-001), case studies are releases, experience is the discography, skills are the liner-note credits.

Built with [Astro](https://astro.build), fully static, deployed on [Vercel](https://vercel.com).

> **The site ships in "advance copy" mode.** A mustard strip across the top reads *Advance promo copy · Not for sale*, and every page is `noindex`. The words are a first draft taken from Gwido's résumés and launch plan; the plan says Gwido owns every word. Once he's rewritten and approved them, set `advanceCopy: false` in `src/data/site.ts`.

---

## Sign-off checklist (before `advanceCopy: false`)

Every line must be something Gwido has done or can talk about for two minutes in an interview.

- [ ] **Rewrite in your own voice:** `hero`, `about`, `hooks`, `pullQuote` and `contact.blurb` in `src/data/site.ts`.
- [ ] **Tabal Chocolate:** say exactly which parts were yours (team of 3), and add the term it ran. See the comment block at the top of `src/content/work/tabal-chocolate-pr-campaign.md`.
- [ ] **Molson Coors:** confirm the brief, the course, and whether $1.0M was given or derived. Make sure you can defend every change in the Remaster.
- [ ] **Peyton Pours:** confirm which menu and brand pieces were yours. Wording stays at "co-designed" and "supported." Add photos.
- [ ] **In the studio:** update each item's `stage` (1–4) as the HubSpot and GA certifications and the two automations progress.
- [ ] **Headshot or real cover art (optional):** add `coverImage` to any release.
- [ ] **January:** replace the Peyton Pours `TBA` metric with real numbers and set `status: released`.

---

## How to update the record

Almost everything lives in two places.

### `src/data/site.ts`: the master tape

Name, headline, about, experience, education, skills, studio items and contact. The home page, the printable résumé at `/resume`, the link previews and the structured data are all pressed from this one file, so they never drift apart.

- **Tenure stays true automatically.** Phrases like "almost six years" and "5+" are computed from `PLANT_START` at build time.
- **"Now playing"** (the yellow ticker) is derived: roles with `nowPlaying: true` and no end date, plus credentials still `pressing`.
- **`bullets` vs `resumeBullets`:** the home page shows the full bullets; the one-page printable résumé uses the shorter "radio edit" when one is given.
- **Phone number** is `null` on purpose so it isn't scraped from the public site.

### `src/content/work/*.md`: releases (case studies)

One Markdown file per project. The filename becomes the URL. The frontmatter is validated at build time, so a typo fails the build with a message naming the file and field instead of shipping a broken page.

Each release follows the structure the launch plan asks for: **the brief → what I did → the result → the remaster** (what I'd do differently, the part interviewers remember). The remaster is structured data (`remaster.changes[]`, each pairing the original with the v2), not prose, so it always gets its signature treatment.

Cover art is generated from `cover.style` (`stripes`, `halftone`, `ripples`, `bars`, `venn`) and three colours. Or set `coverImage` to a real image.

---

## Running it

Requires Node.js 22.23.4 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # type-check content and components
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## Deploying

Import the repo at [vercel.com/new](https://vercel.com/new). Vercel detects Astro; no settings needed. Every push to `main` deploys; every PR gets a preview URL. Then:

- **Analytics:** project → Analytics → Enable (cookieless, no consent banner). Optionally set `analytics.ga4`.
- **Custom domain:** project → Settings → Domains, then set the env var `SITE_URL` (e.g. `https://gwidoropas.com`) and redeploy so canonicals, the sitemap and link previews use it.

---

## How it's built

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7, fully static | A portfolio is content, not an app: fastest, cheapest, most robust. |
| Type | Archivo variable (weight **and** width axes), Instrument Serif, DM Mono, self-hosted via Astro's Fonts API | One Archivo file gives condensed poster cuts (`font-stretch: 62%`), expanded label caps (`125%`) and body text. Preloaded, metric-matched fallbacks. |
| Art | Generative SVG covers (`src/lib/cover.ts`), SVG vinyl (`Record.astro`) | Crisp at any size, tiny, and the same function feeds the share images. |
| Link previews | Satori + Sharp at build time | Each page gets a 1200×630 card that looks like its sleeve. Static Archivo cuts live in `src/assets/og-fonts/` (OFL) because Satori can't read variable fonts. |
| Motion | CSS only; 33⅓ rpm records, ticker, equalizers | A "Stop the record" button pauses every loop (WCAG 2.2.2); reduced-motion users start paused. |
| JavaScript | Copy-email button, motion toggle, print button, analytics | That's all. |

```
src/
├── data/site.ts            ← the master tape: everything about Gwido
├── content/work/           ← releases (case studies, Markdown)
├── content.config.ts       ← release schema
├── components/
│   ├── home/               ← Hero, Ticker, LinerNotes, Discography, Releases,
│   │                         SideB, Personnel, Certified, Studio, Booking
│   ├── Record.astro        ← the spinning LP
│   ├── Sleeve.astro        ← album cover + typography
│   └── …                   ← Header, Footer, LabelMark, ReleaseCard, MotionToggle
├── lib/                    ← cover art, OG renderer, date helpers
├── pages/                  ← index, work/[id], resume, 404, og images, favicon
└── styles/global.css       ← tokens: paper, ink, label colours, type voices
```
