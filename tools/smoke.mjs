// Smoke test: open every page in English and Thai on desktop and mobile, fail on JS errors or missing files,
// save screenshots to tools/screenshots/. Needs: npm i && npx playwright install chromium
import { chromium } from "playwright"; import { mkdirSync } from "node:fs"; import { start } from "./serve.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("./screenshots/", import.meta.url)); mkdirSync(OUT, { recursive: true });
const server = await start(8090); const browser = await chromium.launch(); const problems = [];
for (const vp of [{ n: "desktop", width: 1280, height: 860 }, { n: "mobile", width: 390, height: 844 }])
  for (const lang of ["en", "th"]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } }); const page = await ctx.newPage();
    page.on("pageerror", e => problems.push(`${vp.n}/${lang}: JS error: ${e.message}`));
    page.on("console", m => { if (m.type() === "error") problems.push(`${vp.n}/${lang}: console: ${m.text()}`); });
    page.on("response", r => { if (r.status() >= 400) problems.push(`${vp.n}/${lang}: HTTP ${r.status()} ${r.url()}`); });
    if (process.env.LOCAL_GSAP) { /* offline testing only: serve GSAP from a local folder, skip Google Fonts */
      await page.route("https://cdnjs.cloudflare.com/**", r => r.fulfill({ path: process.env.LOCAL_GSAP + "/" + r.request().url().split("/").pop(), contentType: "text/javascript" }));
      await page.route("https://fonts.googleapis.com/**", r => r.fulfill({ body: "", contentType: "text/css" }));
    }
    await page.addInitScript(l => { try { localStorage.setItem("lang", l); } catch {} }, lang);
    for (const r of ["", "how", "pricing", "data", "login", "signup"]) {
      await page.goto(`http://localhost:8090/#/${r}`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
      const visible = await page.locator(`[data-page]:not([hidden])`).count();
      if (visible !== 1) problems.push(`${vp.n}/${lang}/#/${r}: expected 1 visible page, got ${visible}`);
      await page.screenshot({ path: `${OUT}${vp.n}_${lang}_${r || "overview"}.png`, fullPage: true });
    }
    await ctx.close();
  }
await browser.close(); server.close();
for (const p of problems) console.log("FAIL " + p);
console.log(problems.length ? `\n${problems.length} problem(s).` : "\nOK: all pages load in EN and TH, desktop and mobile. Screenshots in tools/screenshots/");
process.exit(problems.length ? 1 : 0);
