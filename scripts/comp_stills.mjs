// Stills for any composition: COMP=Caesar node scripts/comp_stills.mjs t1 t2 ... [--scale=0.5]   (times in seconds; none = list from CUTS env file)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const scale = Number((args.find((a) => a.startsWith("--scale=")) || "--scale=0.5").split("=")[1]);
const ts = args.filter((a) => !a.startsWith("--")).map(Number);
const id = process.env.COMP || "Caesar", out = `out/${id.toLowerCase()}`;
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { noAudio: true };
const opts = fs.existsSync(CHROME) ? { browserExecutable: CHROME } : {};
const composition = await selectComposition({ serveUrl, id, inputProps, ...opts });
fs.mkdirSync(out, { recursive: true });
for (const t of ts) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 30));
  const o = `${out}/f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output: o, inputProps, scale, imageFormat: "jpeg", jpegQuality: 85, ...opts });
}
console.log("done", ts.length);
