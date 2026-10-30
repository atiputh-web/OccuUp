# CLAUDE.md — OccuUp website (marketing site)

You are working on the public marketing website of **OccuUp**, a past-guest email win-back service
for independent hotels in Thailand (40–300 rooms, Phuket first). The owner is non-technical and
works in Thai; explain changes to him in plain Thai, short. This repo is the WEBSITE only. The hotel
app and its database are built separately (Supabase project, built with Claude Desktop + Codex).

**The site is finished and designed. Do NOT rebuild or redesign it.** `public/` is the complete, approved design
(UI, motion, Thai, pricing) — pixel-identical to the prototype https://claude.ai/artifact/AXZ8K8dPT37GnSgkZLjzPN.
Your job: deploy it, fill missing values, and make small, approved changes that match the existing design.
Design reference: `docs/DESIGN_SYSTEM.md`, `docs/design/screenshots/`, `docs/design/motion/`. Compare your result with these screenshots.

## Stack (deliberately simple)
- Plain static site, no framework, no build step. Deploy folder = `public/`.
- Hosting: Cloudflare Pages connected to GitHub (build command: empty, output directory: `public`).
- One page, hash routes: `#/` overview, `#/how`, `#/pricing`, `#/data`, `#/login`, `#/signup`
  (signup = login page in "New hotel" mode). Router: `main.js` section "Pages: one site, five routes".
- Motion: GSAP 3.12.5 + ScrollTrigger from cdnjs. Respect `prefers-reduced-motion` (already handled).
- Fonts: Inter + IBM Plex Sans Thai from Google Fonts. Icons: Lucide (ISC), inline SVG sprite at top of `index.html`.
- Languages: English source + Thai layer (see "Editing text").
- Lead form: "New hotel" tab posts to Supabase table `public.web_leads` with the PUBLISHABLE key
  (migration in `supabase/migrations/20261030000001_web_leads.sql`). Settings in `public/assets/js/config.js`.

## Files
- `public/index.html` — all markup and English copy (nav, 5 pages, footer).
- `public/assets/css/site.css` — all styles. Brand navy `#13325A`; tokens in `:root` at the top.
- `public/assets/js/config.js` — domain, app URL, appReady flag, Supabase URL + publishable key.
- `public/assets/js/i18n-th.js` — `TH_TEXT`: English sentence -> Thai (for plain text nodes).
- `public/assets/js/main.js` — behaviour: planner, season chart, calculator, `DICT` (Thai for `data-i18n` keys), hero slides, scroll scenes, pricing data (`TIERS`, `PLANS`), login/lead form, router, language switch.
- `public/_headers`, `robots.txt`, `sitemap.xml`, `assets/img/` (logos, favicon, og-image, `brand/` originals).
- `docs/SITE_MAP.md` (where each section lives), `docs/FIX_LIST.md` (backlog), `docs/DEPLOY.md`, `docs/SUPABASE.md`, `docs/CONTENT_EN_TH.md` (all visible text, EN + TH).
- `tools/check.mjs` (pre-deploy check), `tools/smoke.mjs` (Playwright: every page EN/TH, desktop/mobile), `tools/serve.mjs` (local server).

## Editing text: three places, keep them in sync
1. English lives in `index.html` (or in `main.js` for generated parts like pricing plans).
2. Thai for an element WITH `data-i18n="key"` lives in `DICT.th` in `main.js` (English for that key is in the HTML).
3. Thai for any other text lives in `TH_TEXT` in `i18n-th.js`, keyed by the EXACT English sentence
   (whitespace collapsed). **If you change an English sentence, change its key in `TH_TEXT` too**, or Thai visitors see English.
- Elements marked `data-notr` are never translated (numbers, prices, generated widgets).
- Thai typography (separate font, no negative letter-spacing, taller lines) is handled in CSS with `:lang(th)` selectors; the language switch sets `<html lang>`.
- After editing Thai, check line breaks on mobile; use a non-breaking space (U+00A0) to keep short Thai phrases together.

## Commands
- `npm install` then `npx playwright install chromium` (once).
- `npm run dev` — local preview at http://localhost:8080
- `npm run check` — MUST pass before every deploy (placeholders, secrets, missing files).
- `npm run smoke` — MUST pass after any change to HTML/JS/CSS; look at `tools/screenshots/` for the pages you touched.
- `npm run test:db` — tests the `web_leads` security rules with an in-memory Postgres.

## Hard rules
- NEVER put a Supabase secret key (`sb_secret_...`) or legacy `service_role` key in this repo or in any file under `public/`. Only the publishable key (`sb_publishable_...`, or legacy anon `eyJ...`) may appear, and only in `config.js`. `npm run check` fails if a secret is found.
- Never commit `.env` files. Never log or print guest data.
- Do not invent numbers, customers, results or testimonials. Every illustrative figure must stay labelled "Sample data" / "Illustration".
- Do not change prices, the guarantee wording, the founding offer or legal text without the owner's explicit OK (business decisions). Propose the text, wait for approval.
- Keep `npm run check` and `npm run smoke` green. Do not remove reduced-motion handling, ARIA labels or the pause buttons.
- Database changes for the app belong to the backend repo. The only table this site writes to is `public.web_leads`.
- Work on a branch and open a pull request; the owner merges. Cloudflare Pages builds a preview URL for every PR — share it.

## Backlog
See `docs/FIX_LIST.md`. Do the "Before launch" items first; several need values from the owner (company name, email, address, Premium package).

## Definition of done for any change
`npm run check` passes (or only warnings), `npm run smoke` passes, you looked at the screenshots of the changed pages in EN and TH on mobile, and you told the owner in Thai what changed and how to see it (preview URL).
