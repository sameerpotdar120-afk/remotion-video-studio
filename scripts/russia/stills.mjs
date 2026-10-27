// Render many stills in one bundle: node scripts/russia/stills.mjs OUTDIR scale frame1 frame2 …
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const [out, scale, ...frames] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const chrome = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell')).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const opts = { serveUrl, id: 'Russia-4K', browserExecutable: chrome, chromiumOptions: { gl: 'swangle' } };
const composition = await selectComposition(opts);
for (const f of frames) {
  await renderStill({ ...opts, composition, frame: Number(f), output: `${out}/f${String(f).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 82, scale: Number(scale) });
  process.stdout.write(`${f} `);
}
console.log('done');
