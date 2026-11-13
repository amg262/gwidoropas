# syntax=docker/dockerfile:1
#
# Ropas Records as a container: the static Astro build served by unprivileged
# nginx, behaving exactly like the Vercel deployment (same URLs, redirects,
# 404 and response headers, all compiled from vercel.json).
#
#   docker build -t gwidoropas .
#   docker run --rm -p 8080:8080 gwidoropas         → http://localhost:8080
#
# Build args:
#   SITE_URL      The public origin baked into canonicals, og:image, the sitemap
#                 and robots.txt. A static site can't learn it at runtime, so an
#                 image is built for one origin. Default suits `docker run` locally.
#   VERSION / REVISION  Stamped into the image labels by the pipeline.
#
# Base images are pinned to tag AND multi-arch digest: builds are reproducible,
# and Dependabot (.github/dependabot.yml) opens a PR when either moves. The Node
# major must match .nvmrc (and Vercel's Node.js setting); CI checks it.

# ── 1 · Press the record ─────────────────────────────────────────────────────
# Always runs on the build machine's own architecture, even for a multi-arch
# image: the output is plain HTML, CSS and PNG, identical on every platform, so
# there's no reason to run Node and sharp under QEMU emulation.
FROM --platform=$BUILDPLATFORM node:26-trixie-slim@sha256:e6bedef217677b276c591795e169840edd9096dbf13f29df8ef8d1856b8820bc AS build
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false

# Dependencies first, so this layer is cached until the lockfile changes.
# Behind a TLS-inspecting proxy (Zscaler, Netskope, a corporate MITM CA…),
# pass its CA bundle as a build secret; it is never written into a layer:
#   docker build --secret id=ca,src=/path/to/ca-bundle.pem .
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=secret,id=ca,required=false \
    if [ -s /run/secrets/ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca; fi \
 && npm ci

# .dockerignore is an allowlist: only what the build needs gets here.
COPY . .

ARG SITE_URL=http://localhost:8080
ENV SITE_URL=${SITE_URL}
RUN npm run build \
 && node scripts/vercel-headers-to-nginx.mjs vercel.json > /app/vercel-headers.conf

# ── 2 · Just the files ──────────────────────────────────────────────────────
# `docker buildx build --target site --output type=local,dest=out .` exports
# the built site without a runtime. The pipeline attaches it to each release.
FROM scratch AS site
COPY --from=build /app/dist /

# ── 3 · The runtime image (default target) ──────────────────────────────────
# nginx-unprivileged runs as uid 101 and listens on 8080, so it works under
# runAsNonRoot / restricted pod security and on platforms that forbid root.
# No RUN steps here: that keeps the multi-arch build emulation-free.
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03 AS runtime

ARG VERSION=dev
ARG REVISION=unknown
ARG SITE_URL=http://localhost:8080
LABEL org.opencontainers.image.title="gwidoropas" \
      org.opencontainers.image.description="Ropas Records: the portfolio and living résumé of Gwido Ropas, served by nginx." \
      org.opencontainers.image.source="https://github.com/amg262/gwidoropas" \
      org.opencontainers.image.url="${SITE_URL}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}"

COPY deploy/nginx/http.conf /etc/nginx/conf.d/00-http.conf
COPY --from=build /app/vercel-headers.conf /etc/nginx/conf.d/10-vercel-headers.conf
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
# Root-owned and read-only to the nginx user: the server can't alter the site.
COPY --from=build /app/dist /srv/site

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/healthz"]
