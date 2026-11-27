// Check stills for episode 2: node scripts/stills2.mjs 1 2 3 [--frame=40] [--at=1:30,7:45]  -> out/stills2/sNN.png (720x1280)
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
const args = process.argv.slice(2);
const frame = (args.find((a) => a.startsWith("--frame=")) || "--frame=40").split("=")[1];
const at = Object.fromEntries(((args.find((a) => a.startsWith("--at=")) || "--at=").split("=")[1] || "").split(",").filter(Boolean).map((p) => p.split(":")));
const ids = args.filter((a) => !a.startsWith("--"));
const comp = (args.find((a) => a.startsWith("--comp=")) || "--comp=Ep2Shot").split("=")[1];
const outd = comp === "Ep2Shot" ? "out/stills2" : "out/stills_" + comp;
fs.mkdirSync(outd, { recursive: true });
if (!args.includes("--nobundle")) execSync("npx remotion bundle src/index.ts --out-dir=out/bundle --log=error", { stdio: "inherit" });
const run = (id) => new Promise((ok) => {
  const p = spawn("npx", ["remotion", "still", "out/bundle", comp, `${outd}/s${String(id).padStart(2, "0")}.png`, `--props={"id":${id}}`, `--frame=${at[id] ?? frame}`, "--log=error", "--timeout=240000"], { stdio: "inherit" });
  p.on("close", ok);
});
for (let i = 0; i < ids.length; i += 2) await Promise.all(ids.slice(i, i + 2).map(run));
console.log("done");
