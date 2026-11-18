// Music + ambience + sound effects, all made in code (free, no licence worries).
// Usage: node scripts/sound.mjs ep1   -> public/ep1/bed.wav (everything except the voice)
// Reads episodes/<ep>/timing.json (shot start times) and episodes/<ep>/sound.json:
//   { "bpm": 108, "key": "D", "music": 0.16, "amb": { "<shot id>": "wind" | "pub" | "room" | "desk" },
//     "sfx": [ { "shot": 12, "at": 0.9, "type": "coin" }, ... ] }
import fs from "node:fs";
import path from "node:path";

const ep = process.argv[2] || "ep1";
const SR = 44100;
const T = JSON.parse(fs.readFileSync(path.join("episodes", ep, "timing.json"), "utf8"));
const S = JSON.parse(fs.readFileSync(path.join("episodes", ep, "sound.json"), "utf8"));
const TAIL = S.tail ?? 0.7, total = T.total + TAIL, N = Math.ceil(total * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const shotStart = (id) => { const i = T.shots.findIndex((s) => s.id === id); return i <= 0 ? 0 : T.shots[i].start; };
const shotEnd = (id) => { const i = T.shots.findIndex((s) => s.id === id); return i + 1 < T.shots.length ? T.shots[i + 1].start : total; };
const add = (buf, t0, gain = 1, pan = 0) => { const o = Math.round(t0 * SR); const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && o + i < N; i++) if (o + i >= 0) { L[o + i] += buf[i] * gl; R[o + i] += buf[i] * gr; } };

// ---- instruments ----
const pluck = (f, dur = 0.6, bright = 0.5) => { // Karplus-Strong pizzicato
  const n = Math.round(dur * SR), p = Math.max(2, Math.round(SR / f)), d = new Float32Array(p), out = new Float32Array(n);
  for (let i = 0; i < p; i++) d[i] = rnd() * 2 - 1;
  let idx = 0, last = 0;
  for (let i = 0; i < n; i++) { const v = d[idx]; const nv = (v * bright + last * (1 - bright)) * 0.996; last = v; d[idx] = nv; out[i] = v * Math.exp(-i / (SR * dur * 0.35)); idx = (idx + 1) % p; }
  return out;
};
const bell = (f, dur = 1.2) => { const n = Math.round(dur * SR), o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * Math.exp(-t * 3.2) * Math.min(1, t * 400); } return o; };
const noise = (dur, shape) => { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (rnd() * 2 - 1) * shape(i / SR, dur); return o; };
const lowpass = (x, fc) => { const a = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); o[i] = y; } return o; };
const bandpass = (x, lo, hi) => { const l = lowpass(x, hi), h = lowpass(l, lo); return l.map((v, i) => v - h[i]); };
const tone = (f0, f1, dur, decay = 8) => { const n = Math.round(dur * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = f0 + (f1 - f0) * (t / dur); ph += (2 * Math.PI * f) / SR; o[i] = Math.sin(ph) * Math.exp(-t * decay) * Math.min(1, t * 300); } return o; };

// ---- music: light pizzicato, I-V-vi-IV ----
const KEYS = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0 };
const root = KEYS[S.key || "D"] / 2, semi = (n) => root * 2 ** (n / 12);
const prog = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]];
const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19];
const beat = 60 / (S.bpm || 108);
const mus = { L: new Float32Array(N), R: new Float32Array(N) };
const addM = (buf, t0, g, pan = 0) => { const o = Math.round(t0 * SR); for (let i = 0; i < buf.length && o + i < N; i++) { mus.L[o + i] += buf[i] * g * (1 - Math.max(0, pan)); mus.R[o + i] += buf[i] * g * (1 + Math.min(0, pan)); } };
let mel = 4;
for (let bar = 0, t = 0; t < total; bar++, t = bar * 4 * beat) {
  const ch = prog[bar % 4];
  addM(pluck(semi(ch[0] - 12), 0.9, 0.35), t, 0.9); addM(pluck(semi(ch[0] - 12), 0.9, 0.35), t + 2 * beat, 0.7);
  for (const b of [1, 3]) for (const n of ch) addM(pluck(semi(n), 0.25, 0.6), t + b * beat, 0.28, n % 2 ? 0.3 : -0.3);
  for (let e = 0; e < 8; e++) {
    if (rnd() < 0.3) continue;
    mel = Math.max(2, Math.min(scale.length - 1, mel + Math.floor(rnd() * 3) - 1));
    const n = e % 2 === 0 ? ch[Math.floor(rnd() * 3)] + 12 : scale[mel] + 12;
    addM(pluck(semi(n), 0.3, 0.7), t + e * beat * 0.5, 0.34, 0.15);
  }
  if (bar % 2 === 1) addM(bell(semi(ch[2] + 24), 1.4), t + 3.5 * beat, 0.12, -0.2);
}
if (S.beat) { const beat = 60 / (S.bpm || 100); for (let t = 0; t < total - 0.5; t += beat) { addM(tone(110, 42, 0.3, 11), t, 0.5, 0); addM(bandpass(noise(0.05, (x, d) => 1 - x / d), 6000, 10000), t + beat / 2, 0.18, 0.3); } }
if (S.musicStop) { const a0 = Math.round(S.musicStop * SR); for (let i = a0; i < N; i++) { const k = Math.max(0, 1 - (i - a0) / (0.08 * SR)); mus.L[i] *= k; mus.R[i] *= k; } }
// small room reverb on the music
for (const ch of [mus.L, mus.R]) for (const [dt, g] of [[0.031, 0.35], [0.053, 0.28], [0.079, 0.2], [0.113, 0.14]]) { const d = Math.round(dt * SR); for (let i = N - 1; i >= d; i--) ch[i] += ch[i - d] * g; }
const fadeIn = 0.15 * SR, fadeOut = 1.2 * SR;
for (let i = 0; i < N; i++) { const k = Math.min(1, i / fadeIn, (N - i) / fadeOut); L[i] += mus.L[i] * k * (S.music ?? 0.16); R[i] += mus.R[i] * k * (S.music ?? 0.16); }

// ---- ambience per shot ----
for (const [id, kind] of Object.entries(S.amb || {})) {
  const a = shotStart(+id), b = shotEnd(+id), d = b - a + 0.15;
  if (kind === "wind") { const w = lowpass(noise(d, (t) => (0.6 + 0.4 * Math.sin(t * 1.3 + +id)) * Math.min(1, t / 0.08, (d - t) / 0.1)), 500); add(w, a, 0.22 * 0.4, -0.1); /* 2026-11-05: softer wind, no hiss layer */ }
  // 2026-11-05 user: the pub sounded noisy. Now a soft, low murmur only (no glass clinks), much quieter.
  if (kind === "pub") { const m = lowpass(noise(d, (t) => (0.75 + 0.25 * Math.sin(t * 2.1)) * Math.min(1, t / 0.15, (d - t) / 0.2)), 420); add(m, a, 0.14); }
  if (kind === "room") { add(lowpass(noise(d, (t) => Math.min(1, t / 0.08, (d - t) / 0.1)), 300), a, 0.12); }
  if (kind === "desk") add(lowpass(noise(d, (t) => Math.min(1, t / 0.08, (d - t) / 0.1)), 200), a, 0.06);
  // ep2: open prairie (soft breeze + a few bird chirps), town, garage hum, rain on the roof
  if (kind === "field") { add(lowpass(noise(d, (t) => (0.55 + 0.45 * Math.sin(t * 0.9 + +id)) * Math.min(1, t / 0.1, (d - t) / 0.1)), 380), a, 0.07);
    for (let k = 0; k < Math.floor(d * 1.2); k++) { const c = tone(3200 + rnd() * 900, 2400 + rnd() * 600, 0.07, 30); add(c, a + 0.2 + rnd() * (d - 0.4), 0.025, rnd() - 0.5); } }
  if (kind === "town") add(lowpass(noise(d, (t) => Math.min(1, t / 0.1, (d - t) / 0.1)), 600), a, 0.06);
  if (kind === "garage") add(lowpass(noise(d, (t) => Math.min(1, t / 0.1, (d - t) / 0.1)), 160), a, 0.1);
  if (kind === "rain") { add(bandpass(noise(d, (t) => Math.min(1, t / 0.05, (d - t) / 0.08)), 900, 6000), a, 0.16); add(lowpass(noise(d, (t) => Math.min(1, t / 0.05, (d - t) / 0.08)), 220), a, 0.12); }
}

// ---- sound effects ----
const FX = {
  whoosh: () => lowpass(noise(0.45, (t, d) => Math.sin((Math.PI * t) / d) ** 2), 1400),
  coin: () => { const o = bell(2637, 0.6); const b = bell(3520, 0.5); return o.map((v, i) => v + (b[i] || 0) * 0.6); },
  pop: () => tone(900 + rnd() * 500, 300, 0.09, 30),
  thump: () => { const o = tone(120, 45, 0.35, 9); const n = lowpass(noise(0.12, (t, d) => 1 - t / d), 900); return o.map((v, i) => v + (n[i] || 0) * 0.8); },
  knock: () => tone(260, 180, 0.12, 35),
  tick: () => tone(1800, 1500, 0.05, 60),
  hoof: () => { const o = tone(380, 220, 0.08, 45); return o.map((v) => v * 0.9); },
  chatter: () => { const o = new Float32Array(Math.round(0.9 * SR)); for (let k = 0; k < 14; k++) { const c = tone(2000 + rnd() * 300, 1600, 0.02, 120); o.set(c.map((v, i) => v + (o[Math.round(k * 0.06 * SR) + i] || 0)), Math.round(k * 0.06 * SR)); } return o; },
  bite: () => lowpass(noise(0.12, (t, d) => (1 - t / d) * (t < 0.01 ? t / 0.01 : 1)), 2500),
  crash: () => { const n = noise(0.9, (t) => Math.exp(-t * 5) * (0.6 + 0.4 * Math.sin(t * 90))); const b = tone(90, 40, 0.5, 6); const g = bandpass(noise(0.6, (t) => Math.exp(-t * 7)), 2500, 9000); return n.map((v, i) => v * 0.7 + (b[i] || 0) + (g[i] || 0) * 0.6); },
  bonk: () => { const b = tone(140, 70, 0.4, 8); const n = lowpass(noise(0.2, (t, d) => 1 - t / d), 1200); return b.map((v, i) => v + (n[i] || 0) * 0.5); },
  chainsaw: () => { const d = 1.6, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 95 + 25 * Math.sin(t * 3) + (t > 0.4 ? 40 : 0); ph += 2 * Math.PI * f / SR; o[i] = (Math.sign(Math.sin(ph)) * 0.5 + Math.sin(ph * 2) * 0.3) * Math.min(1, t * 20, (d - t) * 6) * 0.6; } const r = bandpass(noise(d, () => 0.4), 1500, 5000); return o.map((v, i) => v + r[i] * 0.4); },
  crack: () => { const o = new Float32Array(Math.round(1.4 * SR)); for (let k = 0; k < 9; k++) { const c = bandpass(noise(0.05, (t, d) => 1 - t / d), 500, 4000); o.set(c.map((v, i) => v + (o[Math.round(k * 0.07 * SR) + i] || 0)), Math.round(k * 0.07 * SR)); } const th = tone(70, 35, 0.8, 4); for (let i = 0; i < th.length; i++) o[Math.round(0.6 * SR) + i] += th[i] * 1.2; return o; },
  thud: () => { const o = tone(60, 30, 0.9, 4); const n = lowpass(noise(0.6, (t, d) => 1 - t / d), 500); return o.map((v, i) => v + (n[i] || 0) * 0.8); },
  thunder: () => lowpass(noise(2.2, (t) => Math.exp(-t * 1.6) * (0.5 + 0.5 * Math.sin(t * 7))), 300),
  ding: () => { const o = bell(1760, 0.8); return o; },
  pop2: () => tone(500, 900, 0.12, 20),
  // ep3 (reference-style punchy effects, all synthesized)
  boom: () => { const b = tone(70, 32, 1.4, 2.6); const n = lowpass(noise(0.5, (t, d) => Math.exp(-t * 6)), 260); return b.map((v, i) => v * 1.2 + (n[i] || 0) * 0.9); },
  hit: () => { const b = tone(160, 55, 0.45, 9); const n = bandpass(noise(0.25, (t) => Math.exp(-t * 18)), 800, 6000); return b.map((v, i) => v + (n[i] || 0) * 0.7); },
  riser: () => { const d = 1.1, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 200 + 1400 * (t / d) ** 2; ph += 2 * Math.PI * f / SR; o[i] = Math.sin(ph) * 0.25 * (t / d); } const w = bandpass(noise(d, (t) => (t / d) ** 2), 1500, 8000); return o.map((v, i) => v + w[i] * 0.6); },
  swell: () => { const d = 1.0; const w = bandpass(noise(d, (t) => (t / d) ** 3), 2000, 9000); return w; },
  buzz: () => { const d = 0.6, n = Math.round(d * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = Math.sign(Math.sin(2 * Math.PI * 160 * t)) * 0.4 * ((Math.floor(t / 0.12) % 2) ? 0 : 1) * Math.min(1, (d - t) * 20); } return lowpass(o, 900); },
  heart: () => { const a = tone(60, 40, 0.18, 22), b = tone(55, 38, 0.18, 22), o = new Float32Array(Math.round(0.5 * SR)); o.set(a, 0); for (let i = 0; i < b.length; i++) o[i + Math.round(0.22 * SR)] += b[i] * 0.8; return o; },
  typing: () => { const o = new Float32Array(Math.round(1.2 * SR)); for (let k = 0; k < 16; k++) { const c = bandpass(noise(0.025, (t, d) => 1 - t / d), 1500, 7000); const off = Math.round((k * 0.07 + rnd() * 0.03) * SR); for (let i = 0; i < c.length && off + i < o.length; i++) o[off + i] += c[i]; } return o; },
  crowd: () => { const d = 2.0; const m = bandpass(noise(d, (t) => (0.6 + 0.4 * Math.sin(t * 5)) * Math.min(1, t / 0.2, (d - t) / 0.4)), 300, 2500); return m; },
  siren: () => { const d = 0.9, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 700 + 500 * Math.sin(2 * Math.PI * 1.6 * t); ph += 2 * Math.PI * f / SR; o[i] = Math.sin(ph) * 0.5 * Math.min(1, t * 30, (d - t) * 6); } return o; },
  tape: () => { const d = 0.7, n = Math.round(d * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 420 * (1 - 0.8 * t / d); ph += 2 * Math.PI * f / SR; o[i] = (Math.sin(ph) + 0.4 * Math.sin(2 * ph)) * 0.4 * (1 - t / d); } return o; },
  shimmer: () => { const o = new Float32Array(Math.round(1.6 * SR)); [0, 4, 7, 12, 16].forEach((n, k) => { const b = bell(semi(n + 24), 1.2); for (let i = 0; i < b.length && i + k * 3000 < o.length; i++) o[i + k * 3000] += b[i] * 0.6; }); return o; },
};
// 2026-11-05 user: effects were too loud -> all about 5 dB lower
const SFXK = 0.4;   // 2026-11-05 user (2nd time): effects still too loud → 0.56 → 0.4
const GAIN = { whoosh: 0.35 * SFXK, coin: 0.25 * SFXK, pop: 0.12 * SFXK, thump: 0.6 * SFXK, knock: 0.35 * SFXK, tick: 0.18 * SFXK, hoof: 0.22 * SFXK, chatter: 0.12 * SFXK, bite: 0.25 * SFXK, shimmer: 0.12 * SFXK, boom: 0.9 * SFXK, hit: 0.6 * SFXK, riser: 0.35 * SFXK, swell: 0.35 * SFXK, buzz: 0.3 * SFXK, heart: 0.8 * SFXK, typing: 0.35 * SFXK, crowd: 0.25 * SFXK, siren: 0.22 * SFXK, tape: 0.4 * SFXK, crash: 0.7 * SFXK, bonk: 0.5 * SFXK, chainsaw: 0.35 * SFXK, crack: 0.6 * SFXK, thud: 0.7 * SFXK, thunder: 0.6 * SFXK, ding: 0.25 * SFXK, pop2: 0.2 * SFXK };
for (const c of S.sfx || []) {
  const t0 = shotStart(c.shot) + (c.at || 0);
  const n = c.repeat || 1;
  for (let k = 0; k < n; k++) add(FX[c.type](), t0 + k * (c.every || 0.25) + (c.jitter ? rnd() * c.jitter : 0), (c.gain ?? 1) * GAIN[c.type], c.pan || 0);
}

// ---- final mix: voice at a loud, clear level, everything else BED_DB under it, soft limiter ----
const readWav = (f) => { const b = fs.readFileSync(f); let o = 12, fmt = null, data = null;
  while (o < b.length - 8) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12) }; if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) { let v = 0; for (let c = 0; c < fmt.ch; c++) v += data.readInt16LE((i * fmt.ch + c) * 2); x[i] = v / fmt.ch / 32768; } return { x, sr: fmt.sr }; };
const V = readWav(path.join("public", ep, "voice.wav"));
const vox = new Float32Array(N); for (let i = 0; i < N; i++) { const p = (i * V.sr) / SR, j = Math.floor(p), f = p - j; vox[i] = j + 1 < V.x.length ? V.x[j] * (1 - f) + V.x[j + 1] * f : 0; }
const med = (a) => { const F = Math.round(SR * 0.05), d = []; for (let i = 0; i + F <= a.length; i += F) { let s = 0; for (let j = 0; j < F; j++) s += a[i + j] ** 2; const db = 10 * Math.log10(s / F + 1e-12); if (db > -50) d.push(db); } d.sort((a, b) => a - b); return d[Math.floor(d.length / 2)] ?? -60; };
const bedMono = new Float32Array(N); for (let i = 0; i < N; i++) bedMono[i] = (L[i] + R[i]) / 2;
const vg = 10 ** ((-17 - med(vox)) / 20), bg = 10 ** ((-17 - (S.bedDb ?? 17) - med(bedMono)) / 20);
const ML = new Float32Array(N), MR = new Float32Array(N);
const lim = (v) => (Math.abs(v) < 0.7 ? v : Math.sign(v) * (0.7 + 0.28 * Math.tanh((Math.abs(v) - 0.7) / 0.28)));
for (let i = 0; i < N; i++) { ML[i] = lim(vox[i] * vg + L[i] * bg); MR[i] = lim(vox[i] * vg + R[i] * bg); }
const wr = (f, A, B) => { const b = Buffer.alloc(44 + N * 4); b.write("RIFF", 0); b.writeUInt32LE(36 + N * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, A[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, B[i])) * 32767), 46 + i * 4); } fs.writeFileSync(f, b); };
wr(path.join("public", ep, "mix.wav"), ML, MR);
console.log("mix.wav: voice at -17 dB, bed", S.bedDb ?? 17, "dB under");

// ---- write the bed on its own (peak-safe) ----
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const k = pk > 0.95 ? 0.95 / pk : 1;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k)) * 32767), 46 + i * 4); }
fs.mkdirSync(path.join("public", ep), { recursive: true });
fs.writeFileSync(path.join("public", ep, "bed.wav"), buf);
console.log("bed.wav", total.toFixed(1) + "s", "peak scale", k.toFixed(2));
