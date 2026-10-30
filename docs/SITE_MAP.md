# Site map: what is where

Line numbers are approximate (they move as you edit). Search for the HTML comment or the section name instead.
All files are under `public/`.

## Shared parts
| On the site | Where in the code |
|---|---|
| Top navigation, language button (ไทย/EN), Log in, "Check my list free" | `index.html` → `<header class="gnav">` (top of body) · menu CSS: `site.css` "Header and menu" |
| Icon set (Lucide) | `index.html` → `<svg>` sprite right after `<body>`; use with `<svg class="ic"><use href="#i-name"/></svg>` |
| Footer (contact, legal links, copyright) | `index.html` → `<footer class="gfoot">` at the bottom · Thai in `i18n-th.js` |
| Logos | `assets/img/logo-mark.png`, `logo-word.png` · originals in `assets/img/brand/` |
| Favicon, share image | `assets/img/favicon.png`, `apple-touch-icon.png`, `og-image.png` (1200×630) |
| Page titles per route | `main.js` → `const TITLES` in "Pages: one site, five routes" |
| Site settings (domain, app URL, Supabase) | `assets/js/config.js` |

## Overview `#/` — `index.html` → `<div class="page" data-page="overview">`
| Section | HTML comment | Behaviour (main.js) | Styles (site.css) |
|---|---|---|---|
| Hero with 5 motion slides: 1 Commission, 2 Low season booked ahead, 3 Length of stay, 4 Guest data, 5 Rate discipline | `<!-- Hero -->`, `<!-- 1 · Commission -->` … `<!-- 5 · Rate discipline -->` | "Hero slides: five problems, one motion graphic each" + "Hero (one continuous timeline)" | "Hero slides", "Hero (Apple-style tile)" |
| The problem (4 tiles: 15–25% commission, 63.4%, Masked, May–Oct) | `<!-- The problem -->` | — | "OccuUp site layer" |
| Campaign planner (Guests → Seasons → Your hotel → Package) | `<!-- Planner -->` | "Planner: build the generated parts", "Planner motion" | "Planner (hero motion)" |
| Guest list layers (free check funnel 12,480 → 6,912, sample data) | `<!-- Guest list layers -->` | "Scroll scenes (GSAP)" | "Guest list layers" |
| Journey film (Emma comes back) | `<!-- Journey film -->` | "Scroll scenes (GSAP)" | "Journey film (deep band)" |
| Season chart (occupancy, +870 room nights, sample) | `<!-- Season chart -->` | "Season chart, drawn to scale" | "Season chart" |
| Plans preview (4 packages, starting prices) | `<!-- Plans -->`, container `#ovPlans` | "Pricing" → `renderPlans()` | "OccuUp site layer" |
| 90-day proof + Founding hotels tiles | `<!-- Guarantee + founding offer -->` | — | — |
| Final call to action | `<!-- Final call to action -->` | — | — |
| Sources 1–6 | `<section class="notes" aria-label="Sources">` | — | — |

## How it works `#/how` — `data-page="how"`
Step 01, Step 02, Step 03 + 04, Sending standards (dark band), Measurement (holdout). Find by HTML comments `<!-- Step 01 -->` etc. Mostly static HTML with inline styles.

## Pricing `#/pricing` — `data-page="pricing"`
| Section | Where |
|---|---|
| Header | `<section class="phero">` |
| List-size tier switch (5 tiers) | `#tiers` (generated) |
| 4 package cards | `#plans` (generated) |
| Calculator ("Run your own numbers") | `<!-- Calculator -->`, `#pricing-calc`; inputs `#nights`, `#bk`, `#fee`…; logic `main.js` "Calculator" |
| Full price table | `#ptbody` (generated) |
| FAQ / guarantee terms | the `<section class="sec">` blocks after the table |
| **Price data (single source of truth)** | `main.js` → `const TIERS` (prices + setup per tier) and `const PLANS` (names, taglines, features) |

## Data & PDPA `#/data` — `data-page="data"`
Ask / never, Legal basis, Commitments (dark band). HTML comments `<!-- Ask / never -->`, `<!-- Legal basis -->`, `<!-- Commitments (dark) -->`.

## Log in / New hotel `#/login`, `#/signup` — `data-page="login"`
| Part | Where |
|---|---|
| Form markup (email, password, hotel name, honeypot, consent note, message) | `<section class="login-page">` |
| Tab switch, button labels, submit (lead → Supabase or redirect to app) | `main.js` "Log in / new hotel" |
| Settings that change behaviour | `config.js` → `appReady`, `appUrl`, `supabaseUrl`, `supabasePublishableKey` |
| Database table | `supabase/migrations/20261030000001_web_leads.sql` |

## Thai translation
| Kind of text | Where the Thai is |
|---|---|
| Element has `data-i18n="key"` | `main.js` → `const DICT = { en: null, th: { key: "…" } }` |
| Any other visible text | `i18n-th.js` → `TH_TEXT["exact English sentence"]` |
| Generated text (plans, buttons, messages) | wrapped in `T("English")` in `main.js`, Thai in `TH_TEXT` |
| Never translated | elements with `data-notr` |

All visible text in both languages: `docs/CONTENT_EN_TH.md`.
