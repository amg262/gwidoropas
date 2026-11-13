# Ropas Records · Gwido Ropas

The portfolio and living résumé of **Gwido Ropas**, an AI-forward marketer working where marketing, technology and design meet. It's designed as the catalogue of an imaginary mid-century record label: his career is the debut LP (RR-001), case studies are releases, experience is the discography, skills are the liner-note credits.

Built with [Astro](https://astro.build), fully static, deployed on [Vercel](https://vercel.com).

> **The site ships as an unlisted advance copy.** A mustard strip across the top reads *Advance promo copy · Not for sale*, because the words are a first draft taken from Gwido's résumés and launch plan, and the plan says Gwido owns every word. Separately, the site is **unlisted**: anyone with the link can open it, but search engines, AI crawlers and web archives are kept out (see [Who can find it](#who-can-find-it)). These are two switches in `src/data/site.ts`: `advanceCopy` and `visibility`.

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

## Who can find it

`visibility: 'unlisted'` in `src/data/site.ts`, set up in `src/lib/visibility.ts`.

**Unlisted (now).** Anyone with the link can open the site, and link previews still work in LinkedIn, iMessage, Slack and the rest. Nobody should be able to find it any other way:

| Layer | What it does |
| --- | --- |
| `<meta name="robots" content="noindex, nofollow, noarchive">` on every page | Search engines leave every page out of their results. |
| `X-Robots-Tag` header in `vercel.json` on every response | Does the same for files with no `<head>`: share images, the sitemap XML, the favicon. |
| `robots.txt` | Blocks AI training and AI search crawlers, Common Crawl, the Wayback Machine and SEO crawlers. **Search engines are still allowed to crawl**, on purpose: a blocked crawler never sees the noindex, and Google lists a blocked URL anyway if it finds a link to it. Blocking everyone would also break LinkedIn previews. |
| Sitemap | Still generated, so it's ready for launch, but nothing links to it. |

The build fails if `site.ts` and `vercel.json` disagree, or if `visibility` is `'public'` while `advanceCopy` is still `true`.

**Unlisted isn't private.** Someone who guesses the URL (`gwidoropas.vercel.app` is easy to guess) or reads certificate-transparency logs for a new custom domain can still open it. If it ever needs to be truly private, use Vercel's password protection. Also, while this GitHub repo is public, all of the site's copy and the résumé files can be found on GitHub; make the repo private to close that gap (Vercel deploys private repos fine).

**Check it's working.** Run `curl -sI https://<your-domain>/og/home.png | grep -i x-robots` and look for `noindex`. In Google Search Console (add `verification.google` in `site.ts`), URL Inspection should report *Excluded by 'noindex' tag*.

### Going public

1. Finish the sign-off checklist above and set `advanceCopy: false`.
2. Set `visibility: 'public'` in `src/data/site.ts`.
3. Delete the `X-Robots-Tag` header from `vercel.json`.
4. Make sure `SITE_URL` points at the final domain, and in Vercel → Domains set `*.vercel.app` to redirect to it, so Google sees one site rather than two.
5. In Google Search Console and Bing Webmaster Tools, submit `/sitemap-index.xml` and request indexing for the home page.
6. Optional: decide whether AI crawlers should be welcome. Public mode allows every crawler, which helps Gwido show up in ChatGPT, Perplexity and Claude answers. To keep AI training crawlers out but let AI search in, copy part of `BLOCKED_WHILE_UNLISTED` into the public `robots.txt`.

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
- **Search Console / Bing Webmaster Tools (optional while unlisted):** choose the "HTML tag" method, paste the `content` value into `verification` in `src/data/site.ts` and deploy.

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
├── lib/                    ← cover art, OG renderer, date helpers,
│                             visibility.ts (unlisted vs public)
├── pages/                  ← index, work/[id], resume, 404, og images, favicon
└── styles/global.css       ← tokens: paper, ink, label colours, type voices
```
