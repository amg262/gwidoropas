# Marketing portfolio

A fast, static portfolio site for a marketing student, built with [Astro](https://astro.build) and hosted on [Vercel](https://vercel.com).

- **Home page** with hero, headline numbers, case studies, about, experience, skills, certifications and contact
- **Case study pages** written in Markdown, each with a results-at-a-glance strip
- **Auto-generated résumé** at `/resume`, built from the same data, that prints cleanly to a one-page PDF
- **Link previews**: an Open Graph image is generated for every page at build time, so LinkedIn and iMessage shares look polished
- **SEO basics built in**: canonical URLs, sitemap, robots.txt, `Person` and `CreativeWork` structured data
- **Light and dark mode**, responsive down to small phones, WCAG 2.1 AA colour contrast, keyboard friendly
- **Ships almost no JavaScript**: the only scripts are the copy-email button, the print button and analytics

> **Everything in the repo right now is template content.** The name, school, jobs, projects and numbers are invented. A banner across the top of the site says so until you turn it off.

---

## Make it yours (no coding experience needed)

You only need to edit two places.

### 1. `src/data/site.ts`: you

Open the file and replace each value: name, headline, intro, highlights, about, experience, education, skills, certifications, email and social links. The comments in the file explain every field.

- Wrap words in the headline in `*asterisks*` to make them italic and accent-coloured.
- **Headshot:** add a square or portrait photo to `public/` (for example `public/headshot.jpg`) and set `about.photo: '/headshot.jpg'`.
- **Your own résumé PDF:** put it in `public/` and set `resume.href` to its path, e.g. `'/alex-rivera-resume.pdf'`. Leave it as `'/resume'` to use the generated one.
- When you're done, set **`isTemplate: false`** to remove the banner.

### 2. `src/content/work/`: your case studies

One Markdown file per project. The filename becomes the URL (`campus-coffee-rebrand.md` → `/work/campus-coffee-rebrand`). Copy an existing file and edit it. The block at the top (frontmatter) holds the card details:

```yaml
---
title: Repositioning a campus coffee shop for the afternoon crowd
summary: One or two sentences for the card and link previews (max 200 characters).
client: The Grind (student-run café)
context: Class project # Class project | Internship | Freelance | Student organization | Competition | Personal project
role: Strategy lead, team of 4
date: 2026-04-20 # used for ordering, newest first
duration: 10 weeks
tags: [Brand strategy, Research, Social] # 1–4
tools: [Qualtrics, Canva]
metrics: # 1–4; the first one goes on the card
  - value: '+38%'
    label: Weekday 2–5pm transactions
accent: '#E4572E' # colour of the generated cover art
featured: true # featured projects are listed first
# cover: ./images/my-cover.jpg   # optional real image, replaces the generated art
# coverAlt: Description of the image
# draft: true                    # hide from the live site
---
```

Below that, write the story. A structure that works well for recruiters: **The challenge → Research / insight → Strategy → Execution → Results → What I learned.**

If a field is missing or wrong, the build fails with a message naming the file and field, so a broken page never goes live.

> **Be honest with numbers.** Recruiters do ask. If a project was a class exercise, say so in `context`; if a result is an estimate or projection, label it that way.

---

## Running it locally

Requires **Node.js 22.23.4 or newer** (see `.nvmrc`).

```bash
npm install
npm run dev       # http://localhost:4321, reloads as you edit
npm run check     # type-check content and components
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Deploying

### Recommended: connect the GitHub repo to Vercel (automatic deploys)

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Vercel detects Astro automatically. No settings need changing.
3. Click **Deploy**.

From then on, every push to `main` deploys to production, and every pull request gets its own preview URL. Preview deployments are kept out of search results automatically, and canonical URLs always point at production.

### Or: deploy from the command line

```bash
npx vercel        # first run links the project; creates a preview
npx vercel --prod # production
```

### After the first deploy

- **Analytics:** in the Vercel dashboard, open the project → **Analytics** → **Enable**. It's cookieless, so no consent banner is needed. To use Google Analytics 4 as well, set `analytics.ga4` in `site.ts` to your `G-XXXXXXXXXX` ID.
- **Custom domain:** project → **Settings → Domains**. Then add an environment variable **`SITE_URL`** = `https://yourdomain.com` (Settings → Environment Variables) and redeploy, so canonical URLs, the sitemap and link previews use your domain.

---

## How it's built

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7, fully static | A portfolio is content, not an app. Static HTML is the fastest, cheapest and most robust thing to serve, and it's free on Vercel's Hobby plan. |
| Content | Astro content collections + Zod schema | Case studies are plain Markdown anyone can edit; the schema catches mistakes at build time. |
| Fonts | Fraunces + Instrument Sans, self-hosted via Astro's Fonts API | No third-party font requests. Preloaded, with metric-matched fallbacks to avoid layout shift. Latin-ext files only download when needed. |
| Link previews | Satori + Sharp at build time | Every page gets an on-brand 1200×630 card that updates when the content does. |
| Hosting | Vercel (`vercel.json`) | Clean URLs, long-lived caching for hashed assets, basic security headers. |

```
src/
├── content/work/        ← case studies (Markdown)
├── data/site.ts         ← everything about the person
├── content.config.ts    ← case study schema
├── components/          ← Header, Footer, CaseCard, Cover art, icons…
├── layouts/Base.astro   ← <head>, SEO tags, structured data, analytics
├── lib/                 ← OG image renderer, helpers
├── pages/
│   ├── index.astro      ← home
│   ├── work/[id].astro  ← case study template
│   ├── resume.astro     ← printable résumé
│   ├── 404.astro
│   ├── og/              ← generated Open Graph images
│   └── favicon.svg.ts, apple-touch-icon.png.ts, robots.txt.ts
└── styles/global.css    ← design tokens (colours, type scale, spacing)
```

**Re-branding:** the whole colour scheme comes from a handful of variables at the top of `src/styles/global.css`. Change `--accent` and `--accent-ink` (keep `--accent-ink` dark enough for text: at least 4.5:1 contrast against `--paper`).
