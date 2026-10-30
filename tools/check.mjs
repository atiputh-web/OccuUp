// Pre-deploy check for the OccuUp website. No dependencies: `node tools/check.mjs`
// Exit code 1 = something must be fixed before going live. Warnings do not block.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../public/", import.meta.url));
const errors = [], warnings = [];
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } })(ROOT);
const text = files.filter(f => [".html", ".js", ".css", ".txt", ".xml", ""].includes(extname(f)) || f.endsWith("_headers"));
const rel = f => f.slice(ROOT.length);

// 1) Placeholders that must not go live
const PLACEHOLDERS = ["__DOMAIN__", "[Company name]", "[sales@your-domain.com]", "[Phuket office address]",
  "[Premium positioning to confirm]", "[Premium benefits to confirm]", "[ชื่อบริษัท]", "[ที่อยู่สำนักงานภูเก็ต]",
  "[รอยืนยันตำแหน่งของแพ็กเกจ Premium]", "[รอยืนยันสิทธิประโยชน์ของ Premium]"];
for (const f of text) {
  const s = readFileSync(f, "utf8");
  for (const p of PLACEHOLDERS) if (s.includes(p)) errors.push(`${rel(f)}: placeholder still present: ${p}`);
}

// 2) Secrets must never be in the public folder
for (const f of text) {
  const s = readFileSync(f, "utf8");
  if (/sb_secret_[A-Za-z0-9_-]+/.test(s)) errors.push(`${rel(f)}: contains a Supabase SECRET key (sb_secret_). Remove it and rotate the key.`);
  for (const jwt of s.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g) || []) {
    try { const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()); if (payload.role === "service_role") errors.push(`${rel(f)}: contains a service_role key. Remove it and rotate the key.`); } catch {}
  }
}

// 3) Every local file referenced from index.html exists
const html = readFileSync(join(ROOT, "index.html"), "utf8");
for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) if (!existsSync(join(ROOT, m[1]))) errors.push(`index.html references a missing file: ${m[1]}`);

// 4) Settings
const cfg = readFileSync(join(ROOT, "assets/js/config.js"), "utf8");
if (/supabaseUrl:\s*""/.test(cfg)) warnings.push("config.js: supabaseUrl is empty, the New hotel form stays in prototype mode (nothing is saved).");
if (/supabasePublishableKey:\s*""/.test(cfg)) warnings.push("config.js: supabasePublishableKey is empty.");
if (/appReady:\s*false/.test(cfg)) warnings.push("config.js: appReady is false, Log in shows the opens-soon message.");

for (const w of warnings) console.log("WARN  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(errors.length ? `\n${errors.length} error(s): fix before deploying.` : "\nOK: ready to deploy.");
process.exit(errors.length ? 1 : 0);
