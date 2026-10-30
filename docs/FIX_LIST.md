# Fix list (backlog)

Source: investor review of 29 Oct 2026 (simulated investors + Claude). Items marked **OWNER** need a decision or a value from the owner before an agent changes anything. When an English sentence changes, update its Thai (see CLAUDE.md "Editing text").

## A. Before launch (blocking: `npm run check` fails until done)
| # | What | Where | Action |
|---|---|---|---|
| A1 | Domain placeholder `__DOMAIN__` | `index.html` (canonical, og:url, og:image), `robots.txt`, `sitemap.xml`, `config.js` | Replace with the real domain, e.g. `occuup.com` |
| A2 | `[Company name]` | `index.html` footer copyright · `i18n-th.js` key "Copyright © 2026 [Company name]. All rights reserved." (Thai `[ชื่อบริษัท]`) | **OWNER**: registered company name (EN + TH). Update the English text AND the `TH_TEXT` key + value |
| A3 | `[sales@your-domain.com]` | `index.html` footer Contact | **OWNER**: e.g. `hello@<domain>` (set up receiving first, see DEPLOY.md step 6). Make it a `mailto:` link |
| A4 | `[Phuket office address]` | `index.html` footer · `i18n-th.js` (`[ที่อยู่สำนักงานภูเก็ต]`) | **OWNER**: address as registered |
| A5 | Premium package `[Premium positioning to confirm]`, `[Premium benefits to confirm]` | `main.js` → `PLANS[3]` · `i18n-th.js` | **OWNER**: write it, or remove the Premium plan (then also remove its column from `TIERS` prices and the price table header) |

## B. Before showing investors (credibility)
| # | What | Where | Proposed change |
|---|---|---|---|
| B1 | 90-day proof counts ALL tracked direct bookings, not bookings added versus the holdout group. Contradicts the site's own measurement promise | `index.html` → `<!-- Guarantee + founding offer -->` (`.ts` line) and Pricing page FAQ ("90-day proof") | **OWNER** approve wording, e.g. "If the extra direct room revenue versus the holdout group after 90 days is below the fees you paid, we refund month three and you can cancel." + Thai |
| B2 | Free-check sample looks too good: 6,912 of 12,480 ready (55%), OTA relays only 1,622 (13%) | `index.html` `<!-- Guest list layers -->` (`data-n`, `.ct` numbers), `<!-- Planner -->` KPI, `main.js` (`countEl.textContent = "6,912"`, `removedCounts`), `DICT` (`p1_cap`, `of_total`) | **OWNER** approve realistic sample, e.g. ~25–30% ready. All numbers must still add up to the total |
| B3 | Calculator default "10 direct bookings from past guests per month" is high for one hotel | `index.html` `#bk value="10"` | Propose 3. Keep the calculator's label "isn't a forecast" |
| B4 | Overview example "Paid to OTAs ฿4,192" (discount + commission) vs calculator "Commission ฿2,880" (commission only) | `index.html` `#tPaidV` text and calculator `#lOta` | Rename the first label to "Paid to OTAs, commission and member discount" (+ Thai) so the two numbers are clearly different things |
| B5 | Overview says "From ฿5,900" (tier under 5,000) while Pricing opens on tier 5,000–9,999 (฿8,900, setup ฿14,900) | `main.js` "Pricing" → `let cur = 1;` | Either start Pricing on tier 0 (`cur = 0`) or label the Overview plans "for 5,000–9,999 emails". **OWNER** choose |
| B6 | Founding offer says "first five" hotels; fundraising plan uses 10 founding hotels | `index.html` founding tile (2 places: overview + pricing) | **OWNER**: five or ten, and "pay from month 2" wording |
| B7 | Free check removes "stays older than 8 years" (contact under legitimate interest up to 8 years) | `index.html` `<!-- Guest list layers -->` r6 + How it works step 8 + `DICT` r6 | **OWNER** confirm with a lawyer; a reviewer suggested 3 years |

## C. Soon after launch
| # | What | Notes |
|---|---|---|
| C1 | Spam protection on the lead form | Honeypot is in place. Add Cloudflare Turnstile if spam appears (needs a small server-side check, e.g. a Supabase Edge Function) |
| C2 | Privacy Policy, Cookies, Terms links all point to `#/data` / `#/pricing` | **OWNER**/lawyer: real pages. PDPA requires a privacy notice for the lead form |
| C3 | Web analytics | Cloudflare Web Analytics (one toggle in Pages, no cookies) |
| C4 | Real URLs instead of `#/…` for SEO (`/pricing`, `/how`…) | Optional later: split into separate HTML files or move to a static site generator. Keep `#/` links working with redirects |
| C5 | Self-host GSAP and fonts (fewer third parties, works if a CDN is down) | Optional |
| C6 | When the app is live: set `appReady: true` and `appUrl` in `config.js` | Log in / New hotel then go to the app |
