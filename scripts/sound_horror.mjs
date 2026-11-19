// Horror sound design for the Mountain Cabin series, all made in code (no licences): dark drone, forest night / room ambience,
// sparse music-box notes, and timed effects (knocks, door creak, engine, footsteps, chewing, heartbeat, stingers).
// Usage: node scripts/sound_horror.mjs episodes/ep4/part1_sound.json  -> public/ep4/mix.wav (voice + bed) and public/ep4/bed.wav
import fs from "node:fs";

const C = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const SR = 44100, total = C.total, N = Math.ceil(total * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const add = (buf, t0, gain = 1, pan = 0) => { const o = Math.round(t0 * SR); const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && o + i < N; i++) if (o + i >= 0) { L[o + i] += buf[i] * gl; R[o + i] += buf[i] * gr; } };
const noise = (dur, shape) => { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (rnd() * 2 - 1) * shape(i / SR, dur); return o; };
const lowpass = (x, fc) => { const a = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); o[i] = y; } return o; };
const bandpass = (x, lo, hi) => { const l = lowpass(x, hi), h = lowpass(l, lo); return l.map((v, i) => v - h[i]); };
const tone = (f0, f1, dur, decay = 8) => { const n = Math.round(dur * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = f0 + (f1 - f0) * (t / dur); ph += (2 * Math.PI * f) / SR; o[i] = Math.sin(ph) * Math.exp(-t * decay) * Math.min(1, t * 300); } return o; };
const env = (t, a, b, fi = 1, fo = 1) => (t < a || t > b ? 0 : Math.min(1, (t - a) / fi, (b - t) / fo));
const inRanges = (t, rs, f = 0.6) => rs.reduce((m, [a, b]) => Math.max(m, env(t, a, b, f, f)), 0);

// ---- drone (always), intensity curve from the config ----
const intensity = (t) => { const k = C.drone; let j = 0; while (j < k.length - 2 && t > k[j + 1][0]) j++; const [a, va] = k[j], [b, vb] = k[j + 1]; return va + (vb - va) * Math.min(1, Math.max(0, (t - a) / (b - a))); };
{ const fr = [55, 55.4, 82.4, 110.3, 164.8]; const ph = fr.map(() => 0); let w = 0;
  for (let i = 0; i < N; i++) { const t = i / SR, I = intensity(t); if (I <= 0) continue; let s = 0;
    fr.forEach((f, k) => { ph[k] += (2 * Math.PI * f * (1 + 0.002 * Math.sin(t * 0.3 + k))) / SR; s += Math.sin(ph[k]) * [1, 0.8, 0.45, 0.3, 0.12 * I][k]; });
    w += 0.02 * ((rnd() * 2 - 1) - w); s += w * 2.5 * I;
    const v = s * 0.22 * I * (0.8 + 0.2 * Math.sin(t * 0.7)); L[i] += v; R[i] += v * (0.9 + 0.1 * Math.sin(t * 0.5)); } }

// ---- ambiences: forest night (wind + crickets + distant owl), room (low tone + fire crackle), clock tick ----
const OUTR = C.outside, INR = C.inside;
{ let w1 = 0, w2 = 0; for (let i = 0; i < N; i++) { const t = i / SR, g = inRanges(t, OUTR); if (!g) continue;
    w1 += 0.004 * ((rnd() * 2 - 1) - w1); w2 += 0.01 * ((rnd() * 2 - 1) - w2);
    const gust = 0.6 + 0.4 * Math.sin(t * 0.37) * Math.sin(t * 0.13 + 1);
    const cr = (Math.sin(2 * Math.PI * 4400 * t) * (Math.sin(2 * Math.PI * 28 * t) > 0.3 ? 1 : 0) * (Math.sin(2 * Math.PI * 0.9 * t) > 0 ? 1 : 0)) * 0.05;
    const cr2 = (Math.sin(2 * Math.PI * 3900 * t) * (Math.sin(2 * Math.PI * 23 * t + 1) > 0.4 ? 1 : 0) * (Math.sin(2 * Math.PI * 0.7 * t + 2) > 0.2 ? 1 : 0)) * 0.04;
    L[i] += g * (w1 * 6 * gust + w2 * 1.5 + cr); R[i] += g * (w1 * 6 * gust * 0.9 + w2 * 1.3 + cr2); } }
for (const [a, b] of OUTR) for (let t = a + 1.2; t < b - 1; t += 5 + rnd() * 3) { const h = tone(390, 360, 0.5, 4); add(h, t, 0.05, -0.6); add(h, t + 0.45, 0.04, -0.6); }
{ let w = 0; for (let i = 0; i < N; i++) { const t = i / SR, g = inRanges(t, INR, 0.3); if (!g) continue; w += 0.003 * ((rnd() * 2 - 1) - w); L[i] += g * w * 2.2; R[i] += g * w * 2.2; } }
for (const [a, b] of C.fire ?? []) for (let t = a; t < b; t += 0.05 + rnd() * 0.25) add(bandpass(noise(0.012 + rnd() * 0.02, (x, d) => 1 - x / d), 1200, 6000), t, 0.15 + rnd() * 0.25, rnd() * 1.2 - 0.6);
for (const [a, b] of C.clock ?? []) for (let t = Math.ceil(a); t < b; t += 1) add(bandpass(noise(0.015, (x, d) => 1 - x / d), 2500, 7000), t, 0.5, -0.4);

// ---- music box: sparse high notes in A minor, a slow low piano note under them ----
const bell = (f, dur = 1.6) => { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 8)) * Math.exp(-t * 2.4) * Math.min(1, t * 500); } return o; };
const NOTES = [880, 1046.5, 987.8, 659.3, 880, 784, 659.3, 587.3, 659.3, 523.3, 493.9, 440];
for (const [a, b] of C.music) { let k = 0; for (let t = a; t < b - 0.5; t += 0.85, k++) { add(bell(NOTES[k % NOTES.length]), t, 0.1, Math.sin(k) * 0.4); if (k % 4 === 0) add(tone(110 * (k % 8 ? 1 : 0.89), 110 * (k % 8 ? 1 : 0.89), 3.2, 0.9), t, 0.18); } }

// ---- effects ----
const FX = {
  boom: () => { const b = tone(65, 28, 2.2, 1.8); const n = lowpass(noise(0.8, (t) => Math.exp(-t * 5)), 220); return b.map((v, i) => v * 1.3 + (n[i] || 0) * 1.2); },
  hit: () => { const b = tone(150, 50, 0.6, 7); const n = bandpass(noise(0.4, (t) => Math.exp(-t * 12)), 600, 5000); return b.map((v, i) => v + (n[i] || 0) * 0.8); },
  stinger: () => { const d = 2.6, o = new Float32Array(Math.round(d * SR)); [233, 247, 466, 494, 698].forEach((f, k) => { let ph = 0; for (let i = 0; i < o.length; i++) { const t = i / SR; ph += 2 * Math.PI * f * (1 + 0.004 * Math.sin(t * 30 + k)) / SR; o[i] += Math.sin(ph) * 0.18 * Math.exp(-t * 1.4) * Math.min(1, t * 80); } });
    const b = FX.boom(); for (let i = 0; i < b.length && i < o.length; i++) o[i] += b[i] * 0.9; const s = bandpass(noise(d, (t) => Math.exp(-t * 2)), 3000, 9000); return o.map((v, i) => v + s[i] * 0.3); },
  riser: () => { const d = 1.8, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0, ph2 = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 120 + 700 * (t / d) ** 2; ph += 2 * Math.PI * f / SR; ph2 += 2 * Math.PI * f * 1.06 / SR; o[i] = (Math.sin(ph) + Math.sin(ph2)) * 0.2 * (t / d) ** 1.5; } const w = bandpass(noise(d, (t) => (t / d) ** 2.5), 1500, 8000); return o.map((v, i) => v + w[i] * 0.7); },
  whoosh: () => lowpass(noise(0.5, (t, d) => Math.sin((Math.PI * t) / d) ** 2), 1600),
  sizzle: () => { const d = 0.7, o = new Float32Array(Math.round(d * SR)); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = Math.sign(Math.sin(2 * Math.PI * 120 * t)) * 0.3 * (Math.sin(t * 70) > 0 ? 1 : 0.2) * (1 - t / d); } const z = bandpass(noise(d, (t, dd) => (1 - t / dd) * 0.5), 2000, 8000); return lowpass(o, 1500).map((v, i) => v + z[i]); },
  type: () => bandpass(noise(0.03, (t, d) => 1 - t / d), 1500, 7000),
  knock: () => { const b = tone(105, 80, 0.25, 22); const m = tone(210, 170, 0.12, 40); const n = bandpass(noise(0.06, (t, d) => (1 - t / d) ** 2), 300, 2500); return b.map((v, i) => v * 1.4 + (m[i] || 0) * 0.5 + (n[i] || 0) * 1.4); },
  creak: () => { const d = 1.5, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 380 + 260 * Math.sin(t * 2.2) + 40 * Math.sin(t * 37); ph += 2 * Math.PI * f / SR; const g = (Math.sin(t * 160) > -0.2 ? 1 : 0.3) * Math.min(1, t * 10, (d - t) * 4); o[i] = (Math.sin(ph) + 0.5 * Math.sin(ph * 2.01) + 0.25 * Math.sin(ph * 3.03)) * 0.25 * g; } return bandpass(o, 250, 3000); },
  engine: () => { const d = 6.5, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 38 + 4 * Math.sin(t * 0.8); ph += 2 * Math.PI * f / SR; o[i] = (Math.sin(ph) + 0.5 * Math.sin(ph * 2) + 0.3 * Math.sign(Math.sin(ph * 0.5))) * 0.3 * Math.min(1, t * 1.5, (d - t) * 1.5); } const gr = lowpass(noise(d, (t, dd) => 0.25 * Math.min(1, t, dd - t)), 900); return lowpass(o, 300).map((v, i) => v + gr[i]); },
  idle: () => { const d = 4.9, n = Math.round(d * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * 31 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 7.5 * t)) * 0.25 * Math.min(1, t * 2, (d - t) * 2); } return lowpass(o, 200); },
  step: () => { const n = bandpass(noise(0.09, (t, d) => (1 - t / d) ** 1.5), 400, 4500); const th = tone(90, 60, 0.08, 40); return n.map((v, i) => v * 1.2 + (th[i] || 0) * 0.5); },
  chew: () => { const n = lowpass(noise(0.16, (t, d) => Math.sin(Math.PI * t / d) * (0.6 + 0.4 * Math.sin(t * 300))), 1800); return n; },
  clink: () => { const o = new Float32Array(Math.round(0.9 * SR)); [2793, 3520, 4186].forEach((f, k) => { for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (6 + k * 3)) * 0.3; } }); return o; },
  murmur: () => { const d = 3.8; return bandpass(noise(d, (t) => (0.5 + 0.5 * Math.abs(Math.sin(t * 4.3) * Math.sin(t * 2.9 + 1))) * Math.min(1, t * 2, (d - t) * 2)), 250, 1800); },
  heart: () => { const a = tone(58, 40, 0.2, 18), b = tone(54, 38, 0.2, 18), o = new Float32Array(Math.round(0.5 * SR)); o.set(a, 0); for (let i = 0; i < b.length; i++) o[i + Math.round(0.24 * SR)] += b[i] * 0.8; return o; },
  gust: () => lowpass(noise(2.2, (t, d) => Math.sin(Math.PI * t / d) ** 2), 700),
};
const GAIN = { boom: 0.9, hit: 0.55, stinger: 1.0, riser: 0.4, whoosh: 0.3, sizzle: 0.35, type: 0.35, knock: 1.4, creak: 0.55, engine: 0.6, idle: 0.6, step: 0.45, chew: 0.35, clink: 0.25, murmur: 0.18, heart: 0.9, gust: 0.5 };
for (const e of C.sfx) { const b = FX[e.type](); add(b, e.at, (GAIN[e.type] ?? 0.5) * (e.gain ?? 1), e.pan ?? 0); }
for (const h of C.heart ?? []) { let t = h.from; while (t < h.to) { add(FX.heart(), t, GAIN.heart * (h.gain ?? 1)); const p = h.p0 + (h.p1 - h.p0) * ((t - h.from) / (h.to - h.from)); t += p; } }
for (const s of C.steps ?? []) for (let t = s.from; t < s.to; t += s.every) add(FX.step(), t, GAIN.step, (rnd() - 0.5) * 0.3);
for (const s of C.chews ?? []) for (let t = s.from; t < s.to; t += 0.32 + rnd() * 0.15) add(FX.chew(), t, GAIN.chew);
// silence holes (e.g. the beat after "we all froze")
for (const [a, b] of C.duck ?? []) for (let i = Math.round(a * SR); i < Math.min(N, Math.round(b * SR)); i++) { const t = i / SR, g = 1 - 0.85 * Math.min(1, (t - a) / 0.08, (b - t) / 0.4); L[i] *= g; R[i] *= g; }

// ---- mix with the voice ----
const readWav = (f) => { const b = fs.readFileSync(f); let o = 12, fmt = null, data = null;
  while (o < b.length - 8) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12) }; if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) { let v = 0; for (let c = 0; c < fmt.ch; c++) v += data.readInt16LE((i * fmt.ch + c) * 2); x[i] = v / fmt.ch / 32768; } return { x, sr: fmt.sr }; };
const V = readWav(C.voice);
const vox = new Float32Array(N); for (let i = 0; i < N; i++) { const p = (i * V.sr) / SR, j = Math.floor(p), f = p - j; vox[i] = j + 1 < V.x.length ? V.x[j] * (1 - f) + V.x[j + 1] * f : 0; }
const med = (a) => { const F = Math.round(SR * 0.05), d = []; for (let i = 0; i + F <= a.length; i += F) { let s = 0; for (let j = 0; j < F; j++) s += a[i + j] ** 2; const db = 10 * Math.log10(s / F + 1e-12); if (db > -50) d.push(db); } d.sort((a, b) => a - b); return d[Math.floor(d.length / 2)] ?? -60; };
const bedMono = new Float32Array(N); for (let i = 0; i < N; i++) bedMono[i] = (L[i] + R[i]) / 2;
const vg = 10 ** ((-17 - med(vox)) / 20), bg = 10 ** ((-17 - C.bedDb - med(bedMono)) / 20);
const lim = (v) => (Math.abs(v) < 0.7 ? v : Math.sign(v) * (0.7 + 0.28 * Math.tanh((Math.abs(v) - 0.7) / 0.28)));
const wr = (f, A, B) => { const b = Buffer.alloc(44 + N * 4); b.write("RIFF", 0); b.writeUInt32LE(36 + N * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, A[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, B[i])) * 32767), 46 + i * 4); } fs.writeFileSync(f, b); };
const ML = new Float32Array(N), MR = new Float32Array(N); for (let i = 0; i < N; i++) { ML[i] = lim(vox[i] * vg + L[i] * bg); MR[i] = lim(vox[i] * vg + R[i] * bg); }
wr(C.out, ML, MR);
const BL = L.map((v) => lim(v * bg * 2)), BR = R.map((v) => lim(v * bg * 2)); wr(C.out.replace("mix.wav", "bed.wav"), BL, BR);
console.log("mix:", C.out, total + "s, bed", C.bedDb, "dB under the voice");
