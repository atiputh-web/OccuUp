# AGENTS.md

Instructions for coding agents (Codex and others) are in **CLAUDE.md** in this folder. Read it first; it is the single source of truth.

Short version:
- Static site, deploy folder `public/`, no build step. Cloudflare Pages (output directory `public`).
- Run `npm run check` and `npm run smoke` before every pull request.
- Never put a Supabase secret / service_role key anywhere in this repo.
- English copy in `index.html`; Thai in `DICT` (main.js) for `data-i18n` keys and in `TH_TEXT` (i18n-th.js) for everything else, keyed by the exact English sentence.
- Do not change prices, guarantee, founding offer or legal text without the owner's OK.
