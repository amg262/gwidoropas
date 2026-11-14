<p align="center">
  <img src=".github/assets/gwido-ropas-record.png" width="300" alt="Gwido Ropas, pictured as the centre label of a black vinyl record from Ropas Records">
</p>

<h1 align="center">Ropas Records · Gwido Ropas</h1>

<p align="center">
  The portfolio and living résumé of <strong>Gwido Ropas</strong>, an AI-forward marketer working where marketing, technology and design meet.
</p>

<p align="center">
  <a href="https://github.com/amg262/gwidoropas/actions/workflows/pipeline.yml"><img src="https://github.com/amg262/gwidoropas/actions/workflows/pipeline.yml/badge.svg" alt="Pipeline"></a>
  <a href="https://github.com/amg262/gwidoropas/actions/workflows/production-check.yml"><img src="https://github.com/amg262/gwidoropas/actions/workflows/production-check.yml/badge.svg" alt="Production check"></a>
  <a href="https://github.com/amg262/gwidoropas/releases/latest"><img src="https://img.shields.io/github/v/release/amg262/gwidoropas?label=release&color=e0452b" alt="Latest release"></a>
</p>

It's designed as the catalogue of an imaginary mid-century record label: his career is the debut LP (RR-001), case studies are releases, experience is the discography, skills are the liner-note credits.

Built with [Astro](https://astro.build), fully static. Production runs on [Vercel](https://vercel.com); every release is also published as a versioned, multi-arch **container image** on GHCR that behaves identically and runs anywhere.

> **The site ships as an unlisted advance copy.** A mustard strip across the top reads *Advance promo copy · Not for sale*, because the words are a first draft taken from Gwido's résumés and launch plan, and the plan says Gwido owns every word. Separately, the site is **unlisted**: anyone with the link can open it, but search engines, AI crawlers and web archives are kept out (see [Who can find it](#who-can-find-it)). These are two switches in `src/data/site.ts`: `advanceCopy` and `visibility`.

---

## Sign-off checklist (before `advanceCopy: false`)

Every line must be something Gwido has done or can talk about for two minutes in an interview.

- [ ] **Rewrite in your own voice:** `hero`, `about`, `hooks`, `pullQuote` and `contact.blurb` in `src/data/site.ts`.
- [ ] **Tabal Chocolate:** say exactly which parts were yours (team of 3), and add the term it ran. See the comment block at the top of `src/content/work/tabal-chocolate-pr-campaign.md`.
- [ ] **Molson Coors:** confirm the brief, the course, and whether $1.0M was given or derived. Make sure you can defend every change in the Remaster.
- [ ] **Peyton Pours:** confirm which menu and brand pieces were yours. Wording stays at "co-designed" and "supported." Add photos.
- [ ] **In the studio:** update each item's `stage` (1–4) as the HubSpot and GA certifications and the two automations progress.
- [ ] **Photo:** confirm Gwido is happy with the back-cover photo (`src/assets/portrait/gwido-ropas.jpg`). The current file is 483 px; a 1000 px+ square original will look sharper on retina screens. After swapping it, run `npm run readme:portrait` to re-press the README image.
- [ ] **Real cover art (optional):** add `coverImage` to any release.
- [ ] **January:** replace the Peyton Pours `TBA` metric with real numbers and set `status: released`.
- [ ] **Recommendation:** once Andrew's recommendation is live on LinkedIn and Gwido has accepted it, check the site's text matches it word for word, set its `date` and paste the link into `url`. The paste-ready text and posting steps are in `linkedin-recommendation-andrew-gunn.md`.

---

## Who can find it

`visibility: 'unlisted'` in `src/data/site.ts`, set up in `src/lib/visibility.ts`.

**Unlisted (now).** Anyone with the link can open the site, and link previews still work in LinkedIn, iMessage, Slack and the rest. Nobody should be able to find it any other way:

| Layer | What it does |
| --- | --- |
| `<meta name="robots" content="noindex, nofollow, noarchive">` on every page | Search engines leave every page out of their results. |
| `X-Robots-Tag` header in `vercel.json` on every response | Does the same for files with no `<head>`: share images, the photo, the sitemap XML, the favicon. The container compiles its headers from the same file, so both hosts send it. |
| `robots.txt` | Blocks AI training and AI search crawlers, Common Crawl, the Wayback Machine and SEO crawlers. **Search engines are still allowed to crawl**, on purpose: a blocked crawler never sees the noindex, and Google lists a blocked URL anyway if it finds a link to it. Blocking everyone would also break LinkedIn previews. |
| Sitemap | Still generated, so it's ready for launch, but nothing links to it. |

The build fails if `site.ts` and `vercel.json` disagree, or if `visibility` is `'public'` while `advanceCopy` is still `true`. The [production check](#production-check) re-verifies the live site every day and after every deploy.

**Unlisted isn't private.** Someone who guesses the URL or reads certificate-transparency logs for the custom domain can still open it. If it ever needs to be truly private, use Vercel's password protection. Also, while this GitHub repo is public, all of the site's copy, the résumé files and the photo in this README can be found on GitHub; make the repo private to close that gap (Vercel and GHCR both work fine with private repos).

**Check it's working.** `npm run smoke -- https://<your-domain>` runs the full contract, noindex included. In Google Search Console (add `verification.google` in `site.ts`), URL Inspection should report *Excluded by 'noindex' tag*.

### Going public

1. Finish the sign-off checklist above and set `advanceCopy: false`.
2. Set `visibility: 'public'` in `src/data/site.ts`.
3. Delete the `X-Robots-Tag` header from `vercel.json`. (The container follows automatically.)
4. Make sure `SITE_URL` points at the final domain, and in Vercel → Domains set `*.vercel.app` to redirect to it, so Google sees one site rather than two. If you also run the container on a public hostname, give it the same `SITE_URL` so its canonical tags point at the one real site.
5. In Google Search Console and Bing Webmaster Tools, submit `/sitemap-index.xml` and request indexing for the home page.
6. Optional: decide whether AI crawlers should be welcome. Public mode allows every crawler, which helps Gwido show up in ChatGPT, Perplexity and Claude answers. To keep AI training crawlers out but let AI search in, copy part of `BLOCKED_WHILE_UNLISTED` into the public `robots.txt`.

---

## How to update the record

Almost everything lives in two places.

### `src/data/site.ts`: the master tape

Name, headline, photo, about, experience, education, skills, studio items and contact. The home page, the printable résumé at `/resume`, the link previews and the structured data are all pressed from this one file, so they never drift apart.

- **Tenure stays true automatically.** Phrases like "almost six years" and "5+" are computed from `PLANT_START` at build time.
- **"Now playing"** (the yellow ticker) is derived: roles with `nowPlaying: true` and no end date, plus credentials still `pressing`.
- **`bullets` vs `resumeBullets`:** the home page shows the full bullets; the one-page printable résumé uses the shorter "radio edit" when one is given.
- **`portrait`:** the back-cover photo beside the liner notes, also the `image` in the structured data. Astro turns it into AVIF/WebP/JPEG at three sizes (about 12 kB for most visitors). It is deliberately **not** on the printable résumé: US hiring norms advise against photos on résumés. Set it to `null` to hide it.
- **Phone number** is `null` on purpose so it isn't scraped from the public site.
- **`recommendations`** (A4, *On the record*) are other people's words, so they're the one part Gwido doesn't rewrite: each is quoted exactly as published on LinkedIn. The newest one with a `sticker` also becomes the hype sticker on the hero sleeve, and the build fails if the sticker isn't a word-for-word excerpt of the full text. An empty list hides both.

### `src/content/work/*.md`: releases (case studies)

One Markdown file per project. The filename becomes the URL. The frontmatter is validated at build time, so a typo fails the build with a message naming the file and field instead of shipping a broken page.

Each release follows the structure the launch plan asks for: **the brief → what I did → the result → the remaster** (what I'd do differently, the part interviewers remember). The remaster is structured data (`remaster.changes[]`, each pairing the original with the v2), not prose, so it always gets its signature treatment.

Cover art is generated from `cover.style` (`stripes`, `halftone`, `ripples`, `bars`, `venn`) and three colours. Or set `coverImage` to a real image.

---

## Running it

Node.js 22.23.4 or newer; `.nvmrc` pins **26**, the version Vercel builds production with, and CI and the Dockerfile use the same major.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # type-check content and components
npm run build     # production build into dist/
npm run preview   # serve the production build
```

### In a container

```bash
docker compose up --build                       # http://localhost:8080, locked down as in production
npm run smoke -- http://localhost:8080 --container
```

Or without Compose: `npm run docker:build && npm run docker:run`. To run a published release instead of building: `docker run --rm -p 8080:8080 ghcr.io/amg262/gwidoropas:latest`.

---

## The container

A multi-stage `Dockerfile`: Node builds the site, then the files are copied into [`nginx-unprivileged`](https://hub.docker.com/r/nginxinc/nginx-unprivileged) (Alpine). The result is about 26 MB per architecture.

**It behaves exactly like production.** Same URLs (`/resume`, not `/resume.html`), the same 308 redirects for `.html` and trailing slashes, the same 404 page, and the same response headers. Rather than copying Vercel's settings into nginx by hand, `scripts/vercel-headers-to-nginx.mjs` compiles `vercel.json`'s headers into nginx config while the image builds, so **`vercel.json` stays the single source of truth**. If someone adds something to `vercel.json` the container can't do yet (redirects, rewrites, conditional headers), the image build fails and says so, rather than silently ignoring it. `deploy/nginx/default.conf` implements the routing, and `scripts/smoke.mjs` proves the result: the same contract test passes against the container and against live production.

**Hardened by default.** It runs as uid 101 with no root and works with a read-only root filesystem, all Linux capabilities dropped and `no-new-privileges` (see `compose.yaml`). The site files are root-owned, so the server can't modify them. No server version is advertised. A `/healthz` endpoint serves Docker's `HEALTHCHECK` and Kubernetes or Container Apps probes.

**Reproducible and multi-arch.** Base images are pinned by tag *and* digest (Dependabot keeps them fresh). The Node build stage always runs natively on the build machine, because static HTML is the same on every platform, so the `linux/arm64` image needs no QEMU emulation and adds seconds, not minutes.

| Build arg | Default | Purpose |
| --- | --- | --- |
| `SITE_URL` | `http://localhost:8080` | The public origin baked into canonicals, `og:image`, the sitemap and `robots.txt`. A static site can't discover it at runtime, so **an image is built for one origin**: the pipeline uses the production domain. The contract test fails if an image's canonicals point somewhere else (e.g. a localhost build), which would break every link preview. |
| `VERSION`, `REVISION` | `dev`, `unknown` | Stamped into the OCI labels by the pipeline. |

**Building behind a corporate proxy** that inspects TLS (Zscaler, Netskope…), `npm ci` will fail with `SELF_SIGNED_CERT_IN_CHAIN`. Pass the proxy's CA as a BuildKit secret; it's used for that one step and never stored in a layer:

```bash
docker build --secret id=ca,src=/path/to/corporate-ca.pem -t gwidoropas .
```

---

## Pipeline

`.github/workflows/pipeline.yml`, on every pull request and every push to `main`:

```
PR:    Verify ──▶ Container                               nothing is published
main:  Verify ──▶ Container ──┐
            └───▶ Plan ───────┴──▶ Publish vX.Y.Z          image · attestation · tag · release
```

| Job | What it does |
| --- | --- |
| **Verify** | `npm ci`, `astro check`, `astro build`; checks the Dockerfile's Node major matches `.nvmrc`, and that the container can be compiled from `vercel.json`. |
| **Container** | Builds the image, checks the nginx config, starts it locked down (read-only, no capabilities), and runs the contract test against it. |
| **Plan** (main) | Works out the next version from the git tags (`scripts/next-version.mjs`). |
| **Publish** (main) | Pushes `linux/amd64` + `linux/arm64` to `ghcr.io/amg262/gwidoropas` with an SBOM and SLSA provenance, signs a GitHub build attestation, creates the git tag and a GitHub Release with the built site attached as a reproducible tarball plus `SHA256SUMS`. |

Vercel keeps deploying production from its own Git integration (and previews for PRs); the pipeline gates PRs and produces the versioned, portable artifact.

### Versions and tags

Every merge to `main` is a production deploy, so every merge gets a version. Tags are the source of truth (the first release takes `package.json`'s version, 1.0.0).

| Commits since the last release | Bump |
| --- | --- |
| anything ordinary | patch: `1.0.0 → 1.0.1` |
| a `feat:` commit (Conventional Commits) | minor: `1.0.1 → 1.1.0` |
| `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer | major: `1.1.0 → 2.0.0` |

To force a bump, run the workflow by hand: Actions → Pipeline → *Run workflow* → choose `patch` / `minor` / `major`. `npm run version:next` shows what the next version would be.

Each release pushes these image tags, so consumers can choose how much change to accept:

| Tag | Moves when | Use it for |
| --- | --- | --- |
| `1.4.2` | never | pinning an exact release |
| `1.4`, `1` | new patch / minor releases | auto-updating within a line |
| `latest` | every release | trying it out |
| `sha-3b23a6a` | never | tracing an image to a commit |

Re-running a pipeline is safe: an already-tagged commit reuses its version instead of bumping again, and an old run never releases a commit that `main` has moved past (so `latest` can't go backwards). Runs on `main` queue rather than overlap, so two merges can't claim the same version.

**Verify an image** came from this repo's pipeline:

```bash
gh attestation verify oci://ghcr.io/amg262/gwidoropas:latest --repo amg262/gwidoropas
```

### Production check

`.github/workflows/production-check.yml` runs the same contract test against the live site after every successful Vercel production deployment, daily, and on demand. If production stops behaving the way `vercel.json` says (most importantly, if the noindex header disappears), it fails and GitHub notifies you.

### Supply chain

- Only first-party actions (`actions/*`, `docker/*`), on current major versions, kept up to date by Dependabot (`.github/dependabot.yml`), which also bumps npm packages and base-image digests weekly. Every update PR runs the whole pipeline.
- No third-party scanner actions. The March 2026 [Trivy action compromise](https://www.aquasec.com/blog/trivy-supply-chain-attack/) rewrote the action's version tags to steal CI secrets. For more hardening, enable *Require actions to be pinned to a full-length commit SHA* (Settings → Actions → General); Dependabot then maintains the SHA pins.
- Workflows default to read-only tokens; only the Publish job can write, and checkouts don't persist credentials.
- The build attestation is kept in GitHub's attestation store rather than pushed to the registry (`push-to-registry` is off because of CVE-2026-59891 in `@sigstore/oci`).

### One-time repository settings

These can't be set from code:

1. **Turn off GitHub Pages:** Settings → Pages → Source: *None*. It was switched on for this repo and ran Jekyll over the raw source, which fails (it reads the `---` fences in `.astro` files as YAML front matter) and leaves a red ✗ on `main`. Even fixed, it would be a second copy of the site that can't send the noindex header (GitHub Pages doesn't allow custom headers) and couldn't serve it from a sub-path without code changes. Vercel is the host; the container covers everywhere else.
2. **Protect `main`:** Settings → Rules → require the *Verify* and *Container* checks before merging, so nothing reaches Vercel without passing the contract.
3. **Package visibility:** after the first release, GHCR → `gwidoropas` → Package settings. Public means anyone can `docker pull` it; private needs a token with `read:packages`.
4. **Optional `SITE_URL` variable:** Settings → Secrets and variables → Actions → Variables. The workflows default to the production domain.
5. **Align Vercel's Node.js version** with `.nvmrc` if either changes (Vercel → Settings → Build and Deployment).

---

## Deploying

### Vercel (production)

Already set up: the project builds from `main`, with previews for every PR, and the custom domain is attached. Canonicals, the sitemap and link previews use the `SITE_URL` env var, or Vercel's production domain when it isn't set (see `astro.config.mjs`); set `SITE_URL` explicitly so a domain change in the dashboard can never silently change the canonical URLs.

- **Analytics:** project → Analytics → Enable (cookieless, no consent banner). Optionally set `analytics.ga4`.
- **Search Console / Bing Webmaster Tools (optional while unlisted):** choose the "HTML tag" method, paste the `content` value into `verification` in `src/data/site.ts` and deploy.

### The container, anywhere else

Any platform that runs an OCI image on a port works: it listens on **8080**, needs no environment variables, no volumes and no secrets, and has a `/healthz` probe. TLS terminates at the platform's ingress. For a domain other than production, build an image with that `SITE_URL`.

**Azure Container Apps** (scales to zero, so an idle portfolio costs close to nothing):

```bash
az containerapp up \
  --name gwidoropas \
  --resource-group rg-gwidoropas \
  --location centralus \
  --image ghcr.io/amg262/gwidoropas:1 \
  --ingress external \
  --target-port 8080
```

If the package is private, add `--registry-server ghcr.io --registry-username <github-user> --registry-password <token with read:packages>`. The same image works on Azure App Service for Containers, Google Cloud Run, AWS App Runner, Fly.io or a VPS.

**Kubernetes:** run it with `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: [ALL]`, `seccompProfile.type: RuntimeDefault`, an `emptyDir` mounted at `/tmp`, and HTTP liveness and readiness probes on `/healthz:8080`. With those it meets the *restricted* Pod Security Standard.

---

## How it's built

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7, fully static | A portfolio is content, not an app: fastest, cheapest, most robust. |
| Type | Archivo variable (weight **and** width axes), Instrument Serif, DM Mono, self-hosted via Astro's Fonts API | One Archivo file gives condensed poster cuts (`font-stretch: 62%`), expanded label caps (`125%`) and body text. Preloaded, metric-matched fallbacks. |
| Art | Generative SVG covers (`src/lib/cover.ts`), SVG vinyl (`Record.astro`) | Crisp at any size, tiny, and the same function feeds the share images. |
| Photo | `astro:assets` `<Picture>`: AVIF → WebP → JPEG at 240/360/483 px | ~12 kB for most visitors; lazy-loaded below the fold. |
| Link previews | Satori + Sharp at build time | Each page gets a 1200×630 card that looks like its sleeve. Static Archivo cuts live in `src/assets/og-fonts/` (OFL) because Satori can't read variable fonts. The README record is pressed the same way. |
| Motion | CSS only; 33⅓ rpm records, ticker, equalizers | A "Stop the record" button pauses every loop (WCAG 2.2.2); reduced-motion users start paused. |
| JavaScript | Copy-email button, motion toggle, print button, analytics | That's all. |
| Hosting | Vercel (production) + a container image on GHCR | Vercel for zero-ops previews and the edge; the image so the site isn't locked to one host. One header contract (`vercel.json`) for both. |
| CI/CD | GitHub Actions: verify → container contract test → semver release | Every merge is tested the way production behaves, versioned, attested and reproducible. |

```
src/
├── data/site.ts            ← the master tape: everything about Gwido
├── assets/portrait/        ← the back-cover photo
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

Dockerfile                  ← build with Node, serve with unprivileged nginx
compose.yaml                ← run the container locally, hardened
deploy/nginx/               ← routing (cleanUrls, trailingSlash, 404) + http tuning
scripts/
├── vercel-headers-to-nginx.mjs  ← compiles vercel.json's headers for the container
├── smoke.mjs                    ← the contract test (container and production)
├── next-version.mjs             ← semver from git tags
├── readme-portrait.mjs          ← presses the README record image
└── lib/vercel-config.mjs        ← how vercel.json's rules are read, shared by the above
.github/
├── workflows/pipeline.yml          ← verify → container → plan → publish
├── workflows/production-check.yml  ← the contract, against the live site
└── dependabot.yml
```
