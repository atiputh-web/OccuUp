// Tiny local web server for the public/ folder (no dependencies): `node tools/serve.mjs` -> http://localhost:8080
import { createServer } from "node:http"; import { readFile } from "node:fs/promises"; import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../public/", import.meta.url)), PORT = Number(process.env.PORT || 8080);
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".ico": "image/x-icon", ".woff2": "font/woff2" };
export function start(port = PORT) {
  return new Promise(res => { const s = createServer(async (q, a) => {
    let p = normalize(decodeURIComponent(q.url.split("?")[0])).replace(/^(\.\.[/\\])+/, ""); if (p.endsWith("/")) p += "index.html";
    try { const d = await readFile(join(ROOT, p)); a.writeHead(200, { "Content-Type": MIME[extname(p)] || "application/octet-stream" }); a.end(d); }
    catch { const d = await readFile(join(ROOT, "index.html")); a.writeHead(200, { "Content-Type": MIME[".html"] }); a.end(d); } /* SPA fallback, same as Cloudflare Pages without 404.html */
  }); s.listen(port, () => res(s)); });
}
if (import.meta.url === `file://${process.argv[1]}`) start().then(() => console.log(`Serving public/ at http://localhost:${PORT}`));
