// Render check stills of the Brands Short: node tools/brands/stills.mjs <outdir> <pubdir> <comp> <scale> t1 t2 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
const [out, pub, comp, scale, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve('src/brands/render.tsx'), publicDir: pub });
const composition = await selectComposition({ serveUrl, id: comp, inputProps: { audio: '' } });
for (const t of ts) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * composition.fps));
  await renderStill({ serveUrl, composition, frame, output: path.join(out, `st_${t}.jpg`), imageFormat: 'jpeg', jpegQuality: 88, scale: parseFloat(scale), inputProps: { audio: '' }, timeoutInMilliseconds: 240000 });
  console.log('still', t);
}
