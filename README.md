# OccuUp website

Public marketing site for OccuUp: bring past hotel guests back to book direct.
Static HTML/CSS/JS, no build step, deployed from `public/` to Cloudflare Pages.

The design is complete (same as the prototype https://claude.ai/artifact/AXZ8K8dPT37GnSgkZLjzPN). Design system: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), screenshots in `docs/design/screenshots/`, motion recordings in `docs/design/motion/`.

- Agents: start with [CLAUDE.md](CLAUDE.md).
- Owner (Thai guide): [HANDOFF_TH.md](HANDOFF_TH.md).
- Where things are: [docs/SITE_MAP.md](docs/SITE_MAP.md) · Backlog: [docs/FIX_LIST.md](docs/FIX_LIST.md)
- Deploy: [docs/DEPLOY.md](docs/DEPLOY.md) · Supabase: [docs/SUPABASE.md](docs/SUPABASE.md)
- All page text EN + TH: [docs/CONTENT_EN_TH.md](docs/CONTENT_EN_TH.md)

```bash
npm install && npx playwright install chromium   # once
npm run dev      # http://localhost:8080
npm run check    # pre-deploy check (placeholders, secrets, missing files)
npm run smoke    # every page, EN + TH, desktop + mobile, screenshots in tools/screenshots/
npm run test:db  # security rules of the web_leads table (in-memory Postgres)
```

```
public/                 deploy folder (Cloudflare Pages output directory)
  index.html            markup + English copy, 5 pages via #/ routes
  assets/css/site.css   styles
  assets/js/config.js   domain, app URL, Supabase URL + publishable key
  assets/js/i18n-th.js  Thai text (English sentence -> Thai)
  assets/js/main.js     behaviour, pricing data, Thai for data-i18n keys, router
  assets/img/           logos, favicon, share image, brand originals
  _headers robots.txt sitemap.xml
supabase/               web_leads migration + test
tools/                  check, smoke test, local server
docs/                   site map, fix list, deploy, Supabase, content export
```

Third-party: GSAP 3.12.5 (cdnjs), Google Fonts (Inter, IBM Plex Sans Thai), Lucide icons (ISC licence).
