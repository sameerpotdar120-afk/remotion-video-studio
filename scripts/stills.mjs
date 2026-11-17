// Check stills before rendering: node scripts/stills.mjs 1 2 3 [--frame=20] [--ep=ep1]
// Bundles once, then renders one still per shot into out/stills/sNN.png. Look at every one before you render.
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
const args = process.argv.slice(2);
const frame = (args.find((a) => a.startsWith("--frame=")) || "--frame=20").split("=")[1];
const ids = args.filter((a) => !a.startsWith("--"));
fs.mkdirSync("out/stills", { recursive: true });
execSync("npx remotion bundle src/index.ts --out-dir=out/bundle --log=error", { stdio: "inherit" });
const run = (id) => new Promise((ok) => {
  const p = spawn("npx", ["remotion", "still", "out/bundle", "Shot", `out/stills/s${String(id).padStart(2, "0")}.png`, `--props={"id":${id}}`, `--frame=${frame}`, "--log=error"], { stdio: "inherit", shell: process.platform === "win32" });
  p.on("close", ok);
});
for (let i = 0; i < ids.length; i += 4) await Promise.all(ids.slice(i, i + 4).map(run));
console.log("stills in out/stills:", ids.map((i) => `s${String(i).padStart(2, "0")}.png`).join(" "));
