// Napoleon: render stills at given seconds (or one mid-shot still per shot): node scripts/nap_stills.mjs [t1 t2 ...] [--scale=0.5]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const scale = Number((args.find((a) => a.startsWith("--scale=")) || "--scale=0.5").split("=")[1]);
let ts = args.filter((a) => !a.startsWith("--")).map(Number);
const CUTS = [0, 0.7, 1.44, 2.04, 2.44, 3.36, 4.54, 4.98, 5.86, 6.56, 7.4, 8.2, 9.36, 9.84, 10.32, 11.36, 12.1, 13.14, 14.28, 15.2, 15.6, 16.56, 17.74, 18.44, 19.5];
if (!ts.length) ts = CUTS.slice(0, -1).map((c, i) => (c + CUTS[i + 1]) / 2);
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { noAudio: true };
const opts = fs.existsSync(CHROME) ? { browserExecutable: CHROME } : {};
const composition = await selectComposition({ serveUrl, id: "Napoleon", inputProps, ...opts });
fs.mkdirSync("out/nap", { recursive: true });
for (const t of ts) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 30));
  const out = `out/nap/f${String(frame).padStart(3, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output: out, inputProps, scale, imageFormat: "jpeg", jpegQuality: 88, ...opts });
  console.log(out);
}
