# Deploy: GitHub → Cloudflare Pages → your domain

Target setup
- Website: `https://<domain>` (and `www.<domain>` redirecting to it) on Cloudflare Pages, free plan.
- App (built separately): `https://app.<domain>` later.
- Database/auth: the existing Supabase project.

Why Cloudflare Pages: static site, deploys on every `git push`, a preview URL for every pull request, free plan limits (500 builds/month, 20,000 files, 100 custom domains per project) are far above what this site needs, and DNS + domain + email forwarding can live in one Cloudflare account.
Not Vercel Hobby: its docs restrict the free Hobby plan to non-commercial, personal use; a company website would need Pro.

## 1. Domain
- Simplest: buy a `.com` at Cloudflare Registrar (Dashboard → Domain Registration → Register Domains). The domain is then already a Cloudflare zone, which Pages needs for the root domain (`example.com`).
- Bought elsewhere (e.g. a Thai registrar): add the domain to Cloudflare (Add a domain → Free plan) and change the nameservers at the registrar to the two Cloudflare nameservers shown. Wait until Cloudflare shows "Active".
- `.co.th` needs a registered Thai company (or a Thai trademark) and documents; it can be added later and redirected to the `.com`.

## 2. GitHub repository
1. Create a new private repo, e.g. `occuup-web`.
2. Upload the contents of this folder (not the folder itself) so `public/`, `docs/`, `CLAUDE.md` are at the repo root. Or with git:
   ```bash
   git init && git add . && git commit -m "OccuUp website v1"
   git branch -M main && git remote add origin https://github.com/<you>/occuup-web.git && git push -u origin main
   ```

## 3. Cloudflare Pages project
Dashboard → Workers & Pages → Create → Pages → Connect to Git → choose `occuup-web`.
- Production branch: `main`
- Framework preset: None
- Build command: leave empty (or `exit 0`)
- Build output directory: `public`
Deploy. You get `https://occuup-web.pages.dev` (name may differ). Open it and click through all pages.

## 4. Connect the domain
Pages project → Custom domains → Set up a domain:
1. Add `<domain>` (root). Cloudflare creates the DNS record.
2. Add `www.<domain>` too, then Rules → Redirect Rules → "Redirect from WWW to root" template (301).
HTTPS certificates are issued automatically (can take a few minutes).

## 5. Fill settings and placeholders
Edit and commit (Claude Desktop can do it):
- Replace `__DOMAIN__` in `public/index.html`, `public/robots.txt`, `public/sitemap.xml`, `public/assets/js/config.js`.
- Company name, contact email, address, Premium plan (docs/FIX_LIST.md section A).
- In `config.js`: `supabaseUrl` and `supabasePublishableKey` (see docs/SUPABASE.md), keep `appReady: false` until the app is live.
- Run `npm run check` (must say OK) and `npm run smoke`.
Push → Cloudflare deploys in about a minute.

## 6. Email on your domain
- Receive mail at `hello@<domain>` for free: Cloudflare Email Routing (Email → Email Routing) → forward to your Gmail. Use this address on the website.
- Sending campaigns (later, app side): Amazon SES or another provider will give SPF/DKIM/DMARC DNS records; add them in Cloudflare DNS. Do not add a second SPF record; merge into one.
- Supabase Auth emails (app side): set a custom SMTP sender in Supabase (Auth → SMTP) using your domain, otherwise the built-in sender is rate-limited.

## 7. After the app is live
- `config.js`: `appReady: true`, `appUrl: "https://app.<domain>"`.
- Supabase → Authentication → URL Configuration: Site URL `https://app.<domain>`, add redirect URLs for the app.

## Rollback
Pages project → Deployments → pick an earlier deployment → "Rollback to this deployment". Or revert the commit on GitHub.

## Optional
- Web Analytics: Pages project → Metrics/Web Analytics → enable (no cookies).
- Security headers are in `public/_headers`.
