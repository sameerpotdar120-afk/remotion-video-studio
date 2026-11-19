// Free narration with Kokoro (runs on your computer, no account, commercial use allowed: Apache-2.0 model).
// Usage: node scripts/voice.mjs ep1 [voice] [speed]
// Reads episodes/<ep>/shots.json (each shot has "text"), writes:
//   public/<ep>/voice.wav       the whole narration, no dead air (gap between lines = GAP)
//   episodes/<ep>/timing.json   per shot: start, end (s) + per word: start, end (for one-word captions)
import { KokoroTTS } from "kokoro-js";
import fs from "node:fs";
import path from "node:path";

const ep = process.argv[2] || "ep1";
const voice = process.argv[3] || "am_michael";
const speed = Number(process.argv[4] || 1.12);
const GAP = 0.06; // seconds between lines: these Shorts never pause
const SR = 24000;

const shots = JSON.parse(fs.readFileSync(path.join("episodes", ep, "shots.json"), "utf8"));
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });

// energy envelope in 10 ms frames
const env = (x) => { const F = SR / 100, n = Math.floor(x.length / F), e = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < F; j++) s += x[i * F + j] ** 2; e[i] = Math.sqrt(s / F); } return e; };
const trim = (x) => {
  const e = env(x), peak = Math.max(...e), th = peak * 0.04;
  let a = 0, b = e.length - 1;
  while (a < b && e[a] < th) a++;
  while (b > a && e[b] < th) b--;
  const s = Math.max(0, (a - 2) * SR / 100), t = Math.min(x.length, (b + 4) * SR / 100);
  return x.slice(s, t);
};
const syll = (w) => { const m = w.toLowerCase().replace(/[^a-z]/g, "").match(/[aeiouy]+/g); return Math.max(1, (m ? m.length : 1) - (/[^aeiou]e$/.test(w.toLowerCase()) ? 1 : 0)) + (/\d/.test(w) ? 3 : 0); };

// ---- word times, free and exact enough for one-word captions ----
// Each word is also spoken alone with the same voice; dynamic time warping matches those sounds to the full line.
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
const NF = 512, HOP = 240, NM = 40;
const mel = (() => { const m2f = (m) => 700 * (10 ** (m / 2595) - 1), f2m = (f) => 2595 * Math.log10(1 + f / 700);
  const lo = f2m(80), hi = f2m(8000), pts = Array.from({ length: NM + 2 }, (_, i) => Math.floor((m2f(lo + ((hi - lo) * i) / (NM + 1)) / SR) * NF));
  return Array.from({ length: NM }, (_, b) => { const w = new Float32Array(NF / 2); for (let k = pts[b]; k < pts[b + 2]; k++) w[k] = k < pts[b + 1] ? (k - pts[b]) / Math.max(1, pts[b + 1] - pts[b]) : (pts[b + 2] - k) / Math.max(1, pts[b + 2] - pts[b + 1]); return w; }); })();
function feats(x) {
  const n = Math.max(1, Math.floor((x.length - NF) / HOP) + 1), out = [];
  for (let f = 0; f < n; f++) {
    const re = new Float64Array(NF), im = new Float64Array(NF);
    for (let i = 0; i < NF; i++) re[i] = (x[f * HOP + i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / NF));
    fft(re, im);
    const v = new Float32Array(NM);
    for (let b = 0; b < NM; b++) { let s = 0; const w = mel[b]; for (let k = 0; k < NF / 2; k++) if (w[k]) s += w[k] * (re[k] * re[k] + im[k] * im[k]); v[b] = Math.log(s + 1e-8); }
    out.push(v);
  }
  const mean = new Float32Array(NM); for (const v of out) for (let b = 0; b < NM; b++) mean[b] += v[b] / out.length;
  for (const v of out) for (let b = 0; b < NM; b++) v[b] -= mean[b];
  return out;
}
function dtw(A, B) { // returns for each B frame the matched A frame (first match)
  const n = A.length, m = B.length, D = new Float32Array((n + 1) * (m + 1)).fill(Infinity), P = new Uint8Array((n + 1) * (m + 1));
  D[0] = 0;
  const dist = (a, b) => { let s = 0; for (let k = 0; k < NM; k++) { const d = a[k] - b[k]; s += d * d; } return Math.sqrt(s); };
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const c = dist(A[i - 1], B[j - 1]), d0 = D[(i - 1) * (m + 1) + j - 1], d1 = D[(i - 1) * (m + 1) + j] + 0.3, d2 = D[i * (m + 1) + j - 1] + 0.3;
    let best = d0, p = 0; if (d1 < best) { best = d1; p = 1; } if (d2 < best) { best = d2; p = 2; }
    D[i * (m + 1) + j] = c + best; P[i * (m + 1) + j] = p;
  }
  const map = new Int32Array(m).fill(-1); let i = n, j = m;
  while (i > 0 && j > 0) { map[j - 1] = i - 1; const p = P[i * (m + 1) + j]; if (p === 0) { i--; j--; } else if (p === 1) i--; else j--; }
  for (let k = 1; k < m; k++) if (map[k] < 0) map[k] = map[k - 1];
  return map;
}
async function words(text, sayText, x) {
  const ws = text.split(/\s+/).filter(Boolean);
  let units = sayText.split(/\s+/).filter(Boolean);
  if (units.length !== ws.length) units = ws.map((w, i) => (i < units.length ? units[i] : w));
  const solo = [];
  for (const u of units) solo.push(trim((await tts.generate(u.replace(/_/g, " ").replace(/[,.?!:;]+$/, ""), { voice, speed })).audio));
  const ref = new Float32Array(solo.reduce((a, s) => a + s.length, 0)); const starts = []; let o = 0;
  for (const s of solo) { starts.push(Math.floor(o / HOP)); ref.set(s, o); o += s.length; }
  const map = dtw(feats(x), feats(ref));
  const dur = x.length / SR, b = starts.map((f) => Math.min(dur, (map[Math.min(f, map.length - 1)] * HOP + NF / 2) / SR));
  b[0] = 0;
  for (let i = 1; i < b.length; i++) b[i] = Math.max(b[i], b[i - 1] + 0.06);
  return ws.map((w, i) => ({ w, start: +b[i].toFixed(3), end: +(i + 1 < b.length ? b[i + 1] : dur).toFixed(3) }));
}

const parts = [];
const timing = [];
let t = 0;
for (const s of shots) {
  const a = await tts.generate((s.say ?? s.text).replace(/_/g, " "), { voice, speed });
  const x = trim(a.audio);
  const ws = (await words(s.text, (s.say ?? s.text), x)).map((o) => ({ ...o, start: +(o.start + t).toFixed(3), end: +(o.end + t).toFixed(3) }));
  timing.push({ id: s.id, start: +t.toFixed(3), end: +(t + x.length / SR).toFixed(3), words: ws });
  parts.push(x, new Float32Array(Math.round(GAP * SR)));
  t += x.length / SR + GAP;
  console.log(s.id, (x.length / SR).toFixed(2) + "s", s.text);
}
const all = new Float32Array(parts.reduce((a, p) => a + p.length, 0));
let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
// gentle level: peak -1 dB
const pk = all.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
const k = 0.89 / pk;
const buf = Buffer.alloc(44 + all.length * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + all.length * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(all.length * 2, 40);
for (let i = 0; i < all.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(all[i] * k * 32767))), 44 + i * 2);
fs.mkdirSync(path.join("public", ep), { recursive: true });
fs.writeFileSync(path.join("public", ep, "voice.wav"), buf);
fs.writeFileSync(path.join("episodes", ep, "timing.json"), JSON.stringify({ voice, speed, total: +t.toFixed(3), shots: timing }, null, 1));
console.log("total", t.toFixed(1), "s,", (timing.reduce((a, s) => a + s.words.length, 0) / t).toFixed(2), "words/s, voice", voice);
