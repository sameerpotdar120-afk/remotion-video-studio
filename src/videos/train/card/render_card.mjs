// node render_card.mjs poses.json  -> writes each pose's PNG (transparent) via headless Chromium
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright'); import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');   // src/videos
const srv = http.createServer((q, r) => { let p = q.url.split('?')[0]; p = p.startsWith('/toon/') ? path.join(ROOT, 'nest', p) : path.join(ROOT, 'train', 'card', p);
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); r.end(d); }); }).listen(0);
const port = srv.address().port; const poses = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const b = await chromium.launch(); const pg = await b.newPage(); await pg.goto(`http://127.0.0.1:${port}/card.html`); await pg.waitForFunction('window.ready');
for (const p of poses) { const url = await pg.evaluate((p) => window.drawCard(p), p); fs.writeFileSync(p.out, Buffer.from(url.split(',')[1], 'base64')); console.log('card', p.out); }
await b.close(); srv.close();
