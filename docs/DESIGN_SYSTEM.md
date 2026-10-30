# OccuUp design system (UI · UX · front end · motion)

This documents the design that is ALREADY BUILT in `public/`. It is the reference for every change: match it, do not redesign.
Visual reference: `docs/design/screenshots/` (every page, EN + TH, desktop 1280 px + mobile 390 px, plus the 5 hero slides) and `docs/design/motion/` (real recordings of the motion).
Original prototype (single-file version, same design): https://claude.ai/artifact/AXZ8K8dPT37GnSgkZLjzPN

## 1. Design direction
- Apple-style product page: white space, large tight headlines, light grey tiles, one dark band for product moments, motion that explains a mechanism (not decoration).
- Layout balance: light page (about 60%), deep/dark bands for product moments (about 30%), colour accents only for meaning (about 10%): navy = OccuUp / gain, amber = cost and season.
- Every illustrative number is labelled "Sample data" / "Illustration". Sources are numbered and listed at the foot of the page.

## 2. Colour tokens (`site.css` `:root`)
| Token | Value | Use |
|---|---|---|
| `--accent` | `#13325A` navy | brand, primary buttons, links, OccuUp gain in charts |
| `--accent-soft` | `#E6EDF6` | soft navy fills |
| `--bright` | `#7BA7E8` | navy-light highlight on dark bands |
| `--sun` / `--sun-ink` / `--sun-soft` | `#E8962F` / `#9A4F0A` / `#FBEBD6` | cost, OTA commission, low season |
| `--ink` / `--ink-2` | `#1D1D1F` / `#6E6E73` | text / secondary text |
| `--bg` / `--bg-alt` | `#FFFFFF` / `#F5F5F7` | page / tiles and alternating sections |
| `--line` | `#E3E3E6` | borders, dividers |
| `--deep` / `--deep-2` / `--deep-line` | `#000000` / `#1C1C1E` / `#2C2C2E` | dark bands (Journey film, Sending standards, Commitments) |
| `--on-deep` / `--on-deep-2` | `#F5F5F7` / `#A1A1A6` | text on dark |
| `--gone` | `#D2D2D7` | removed/inactive items (free-check layers) |
Light theme only (`color-scheme: light`).

## 3. Typography
- Fonts: **Inter** (Latin, variable, optical sizing) + **IBM Plex Sans Thai** (Thai), loaded from Google Fonts. Stack: `"Inter","IBM Plex Sans Thai",system-ui,…`.
- Body: 17 px / 1.55, letter-spacing −0.011em. Thai body: letter-spacing 0, line-height 1.75.
- H1: 600, `clamp(2.5rem, 4.3vw, 3.75rem)`, line-height 1.02, letter-spacing −0.035em, `text-wrap: balance`. Thai H1: −0.005em, 1.2.
- H2: 600, `clamp(2rem, 3.6vw, 3rem)`, 1.06, −0.03em. Thai H2: 0, 1.25.
- Small text: 12–15 px for captions, notes, footer (`.fine` 13 px, grey).
- Numbers that change or align use tabular figures (`font-variant-numeric: tabular-nums`) only on numeric elements (Inter widens hyphens under tnum).
- Thai: keep short phrases together with a non-breaking space; never negative tracking.

## 4. Layout and spacing
- Content width `--wrap: 1180px`, side padding 20 px (respects iPhone safe areas).
- Section padding `clamp(72px, 10vw, 128px)` top and bottom; tighter sections use `.sec` / `.sec.tight`.
- Breakpoints used: 1180, 960, 900, 860, 760, 640, 620, 440, 380 px (max-width). Main switches: 860 (nav → menu button, grids → single column), 640/620 (cards stack), 440/380 (small phones).
- Mobile reference width: 390 px. No horizontal scroll at any width.

## 5. Components
| Component | Class | Spec |
|---|---|---|
| Top navigation | `.gnav` | sticky, translucent white `rgba(251,251,253,.8)` + 20 px backdrop blur, 1 px bottom line; links centre, language + Log in + primary CTA right; collapses to a sheet menu on mobile |
| Primary button | `.btn.btn-primary` | navy pill (radius 999 px), 15 px/500, padding 14×22, hover darkens 16% |
| Secondary button | `.btn.btn-line` | white pill, 1 px `--line` border |
| Text link with chevron | `.more` | "Read the terms ›" style |
| Segmented control | `.seg` | grey track `rgba(0,0,0,.06)`, radius 22 px, pressed item white (used for tiers and Log in / New hotel) |
| Plan card | `.plan` (`.plan.rec` = recommended) | `--bg-alt`, radius 28 px, padding 32×28, badge "Recommended" navy pill 12 px |
| Teaser tile | `.tease` (`.tease.dark`) | radius 30 px, padding 56×40, centred icon + eyebrow + title + text + link |
| Problem tiles | `.kpi`-style tiles on Overview | big number + caption + footnote number |
| Dark band | `section.deep` / `.block.deep` | black background, `--on-deep` text |
| Icons | Lucide (ISC) inline SVG sprite, `<svg class="ic"><use href="#i-…"/></svg>`, 1.5–2 px stroke |
| Focus ring | `:focus-visible` | 2 px navy outline, 3 px offset |
Common radii: 12, 22–30 px for cards, 999 px for pills. Shadow (rare): `0 1px 2px rgba(0,0,0,.04), 0 18px 40px -26px rgba(0,0,0,.18)`.

## 6. UX: pages and flows
| Route | Purpose | Primary action |
|---|---|---|
| `#/` Overview | Problem → mechanism → proof style → plans → guarantee → CTA | "Check my guest list free" → `#/signup` |
| `#/how` | 4 steps, sending standards, measurement vs holdout | same CTA |
| `#/pricing` | tier by verified emails, 4 packages, calculator, full table, FAQ | "Start with a free check" |
| `#/data` | what we ask / never ask, legal basis, commitments | trust, links to DPA |
| `#/login` / `#/signup` | Log in, or New hotel (lead form while the app is not live) | see `config.js` `appReady` |
Rules: one primary CTA per view; every claim near its source number; prices always "excl. VAT"; language choice remembered per visitor (localStorage, wrapped in try/catch).

## 7. Motion (GSAP 3.12.5 + ScrollTrigger)
Principles: motion shows how money or guests move; it loops calmly; it stops when off-screen or when the tab is hidden; every auto-playing element has a Pause button; with `prefers-reduced-motion: reduce` everything shows its final frame and nothing auto-plays.

| Element | Code (main.js) | Behaviour |
|---|---|---|
| Hero slides (5) | "Hero slides: five problems, one motion graphic each" | Auto-advance every **8.5 s**, progress bar per dot, swipe (>50 px) and dot click, Pause button, pauses off-screen. Recording: `motion/hero-5-slides.mp4`. Frames: `screenshots/hero-slide-1…5_*.jpg` |
| Slide 1 Commission | `art1` | Two lanes: guest dot travels to hotel through OTA in 2.4 s linear, "−18% commission" chip pops (back.out(2)); then direct lane 1.8 s power1.inOut, "Direct · ฿0 commission" chip; loop with 0.4 s delay. Rest frame at 5.2 s |
| Slide 2 Low season | `art2` | Navy "booked ahead" segments grow up on May–Oct bars (scaleY 0→1, 0.8 s, stagger 0.18, power3.out), tag fades in at 1.9 s |
| Slide 3 Length of stay | `art3` | Night counter 3 → 7, each added night pops (scale 0.7→1, back.out(2.4)) every 0.55 s from 1.0 s |
| Slide 4 Guest data | `art4` | Masked OTA emails flip (rotateX −180) into real emails, 0.8 s, stagger 0.45, power2.inOut; tag at 2.6 s |
| Slide 5 Rate discipline | `art5` | Legend (Public rate cut · Closed offer to past guests · Low season) fades in with stagger 0.15, then the chart reveals left to right (clip width 0→560, 2.4 s, power1.inOut) |
| Campaign planner | "Planner motion" | 4 stages (Guests → Seasons → Your hotel → Package) cycle every **4.4 s** while visible; chips clickable; Pause. Recording: `motion/planner.mp4` |
| Guest list layers | "Scroll scenes (GSAP)" | Pinned scroll scene (≈2.6 viewport heights, scrub 0.6): layers lift off a stack one by one (duplicates, invalid, OTA relays, agents, unsubscribed, old stays) and the counter drops 12,480 → 6,912 |
| Journey film | "Scroll scenes (GSAP)" | Looping phone story (OTA booking → offer email → direct booking → toast) plays only while on screen (ScrollTrigger toggle, top 75% → bottom 20%), Pause button |
| Season chart | "Season chart, drawn to scale" + scroll scenes | Returning-guest bars grow with scroll (scrub 0.5, top 80% → centre 45%) |
| Page change | router `go()` | instant scroll to top, no page-transition animation |
Recording of the whole Overview scroll: `motion/overview-scroll.mp4`.

## 8. Accessibility (keep)
Semantic landmarks and headings; `aria-label` on icon buttons and charts; `aria-current` on nav and slide dots; `role="status"` for form messages; visible focus ring; pause controls (WCAG 2.2.2); reduced-motion support; colour never the only signal (labels on charts); Thai labels for screen readers via the same translation layer.

## 9. Brand assets
`public/assets/img/brand/`: `mark-navy.png`, `mark-white.png`, `word-navy.png`, `word-white.png`, `logo-stacked-navy.png`. Site uses `logo-mark.png` + `logo-word.png` (small versions). Share image `og-image.png` 1200×630.
