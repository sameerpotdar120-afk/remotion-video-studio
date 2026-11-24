// Full-film sound for the anime Western, all made in code: ambiences per location, gunshots with echoes, glass,
// hooves, falls, doors, soldiers' laughter, saloon piano, stadium crowd, a score in sections, and the narration
// (Kokoro, placed on the reference timeline). Scene 1 (0-4.3 s) reuses its own finished mix.
// Usage: node scripts/pp_sound.mjs -> public/pp/mix.wav   (needs public/pp/voice.wav + episodes/pp/timeline.json, both private)
import fs from "node:fs";

const SR = 44100, TL = JSON.parse(fs.readFileSync("episodes/pp/timeline.json", "utf8")), DUR = 105.9, N = Math.round(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N), MUS = new Float32Array(N), VOX = new Float32Array(N);
let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const add = (buf, t0, gain = 1, pan = 0, dst = null) => { const o = Math.round(t0 * SR); const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && o + i < N; i++) if (o + i >= 0) { if (dst) dst[o + i] += buf[i] * gain; else { L[o + i] += buf[i] * gl; R[o + i] += buf[i] * gr; } } };
const noise = (dur, shape) => { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (rnd() * 2 - 1) * shape(i / SR, dur); return o; };
const lowpass = (x, fc) => { const a = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); o[i] = y; } return o; };
const highpass = (x, fc) => { const l = lowpass(x, fc); return x.map((v, i) => v - l[i]); };
const bandpass = (x, lo, hi) => highpass(lowpass(x, hi), lo);
const tone = (f0, f1, dur, decay = 8, att = 300) => { const n = Math.round(dur * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = f0 + (f1 - f0) * (t / dur); ph += (2 * Math.PI * f) / SR; o[i] = Math.sin(ph) * Math.exp(-t * decay) * Math.min(1, t * att); } return o; };
const mix = (...xs) => { const n = Math.max(...xs.map(([x]) => x.length)), o = new Float32Array(n); for (const [x, g] of xs) for (let i = 0; i < x.length; i++) o[i] += x[i] * g; return o; };
const span = (a, b, f) => { for (let i = Math.max(0, Math.round(a * SR)); i < Math.min(N, Math.round(b * SR)); i++) f(i, i / SR, (i / SR - a) / (b - a)); };

// ---------- one-shots ----------
const gun = (t, g = 1, pan = 0, big = 1) => { const crack = highpass(noise(0.08, (x) => Math.exp(-x * 60)), 1500), body = lowpass(noise(0.5, (x) => Math.exp(-x * 9) * Math.min(1, x * 3000)), 1800), boom = tone(75, 38, 0.9, 5, 4000);
  const s = mix([crack, 1], [body, 1.3], [boom, 1.1 * big]); add(s, t, g, pan); for (const [dt, gg, fc, p] of [[0.2, 0.3, 1400, -0.5], [0.43, 0.2, 900, 0.6], [0.78, 0.12, 600, -0.3]]) add(lowpass(s, fc), t + dt, g * gg * big, p);
  add(lowpass(noise(1.2, (x) => Math.exp(-x * 2.6) * Math.min(1, x * 40)), 700), t + 0.03, g * 0.3 * big); };
const glass = (t, g = 0.6, pan = 0) => { for (let k = 0; k < 14; k++) add(tone(2500 + rnd() * 4500, 2400 + rnd() * 4000, 0.25, 18 + rnd() * 20, 3000), t + rnd() * 0.12, g * (0.2 + rnd() * 0.3), pan + (rnd() - 0.5) * 0.5); add(highpass(noise(0.15, (x) => Math.exp(-x * 30)), 3000), t, g * 0.7, pan); };
const clink = (t, g = 0.5, pan = 0) => { add(mix([tone(1800, 1700, 0.3, 14, 3000), 0.6], [tone(2700, 2650, 0.25, 18, 3000), 0.4]), t, g, pan); };
const thud = (t, g = 1, pan = 0) => { add(mix([tone(70, 42, 0.6, 7, 2000), 1.2], [lowpass(noise(0.4, (x) => Math.exp(-x * 14)), 500), 1.0]), t, g, pan); add(mix([tone(80, 50, 0.25, 16), 0.5], [lowpass(noise(0.15, (x) => Math.exp(-x * 30)), 600), 0.4]), t + 0.09, g * 0.5, pan); };
const hit = (t, g = 0.8) => { add(highpass(noise(0.07, (x, d) => (x / d) ** 2), 3000), t - 0.04, g * 0.5, -0.5); add(mix([tone(95, 60, 0.25, 18), 1], [lowpass(noise(0.12, (x) => Math.exp(-x * 40)), 700), 0.8]), t, g); };
const door = (t, g = 0.6) => { add(mix([tone(110, 70, 0.4, 9), 1], [bandpass(noise(0.3, (x) => Math.exp(-x * 12)), 200, 1500), 0.8]), t, g); };
const swing = (t, g = 0.35) => { for (let k = 0; k < 3; k++) add(bandpass(noise(0.12, (x, d) => Math.sin(Math.PI * x / d)), 600, 2500), t + k * 0.22, g * (1 - k * 0.3)); add(tone(700, 520, 0.35, 6, 200), t, g * 0.15); };
const draw = (t, g = 0.45) => { add(bandpass(noise(0.16, (x, d) => Math.sin(Math.PI * x / d) ** 2), 900, 4200), t, g, 0.2); add(mix([tone(2950, 2900, 0.4, 9, 2000), 0.25]), t + 0.1, g * 0.8, 0.2); };
const cock = (t, g = 0.7) => { for (const [d, gg] of [[0, 0.7], [0.06, 1]]) add(bandpass(noise(0.025, (x) => Math.exp(-x * 300)), 2500, 7000), t + d, g * gg, 0.2); };
const hoofSet = (a, b, speed, gain = 0.6, horses = [[0, 0]]) => { // speed m/s; gallop (4-beat) or walk
  for (const [ph, pan] of horses) { let prev = null; const run = speed > 3; const stride = run ? 5.2 : 1.9; const pat = run ? [0, 0.12, 0.22, 0.5] : [0, 0.25, 0.5, 0.75];
    for (let t = a; t < b; t += 0.004) { const cyc = ((t - a) * speed) / stride + ph; const p = cyc % 1; const idx = pat.findIndex((q, i) => p >= q && p < (pat[i + 1] ?? 1)); const key = Math.floor(cyc) * 4 + idx;
      if (prev !== null && key !== prev) add(mix([tone(110 + rnd() * 30, 55, 0.12, 30), 1], [lowpass(noise(0.06, (x) => Math.exp(-x * 70)), run ? 900 : 2500), 0.9]), t, gain * (0.5 + rnd() * 0.15), pan); prev = key; } }
  if (speed > 3) add(lowpass(noise(b - a, (x, d) => Math.min(1, x * 4, (d - x) * 4) * 0.6), 90), a, gain * 1.4); };
const laughs = (a, b, g = 0.35) => { for (const [f0, pan, off] of [[150, -0.5, 0], [185, 0.1, 0.13], [125, 0.55, 0.07]]) { const n = Math.round((b - a) * SR), o = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; const syl = Math.max(0, Math.sin(2 * Math.PI * (5.2 + f0 / 100) * (t + off))) ** 2; const f = f0 * (1 + 0.15 * Math.sin(t * 3)) * (1 - 0.25 * (t / (b - a))); ph += 2 * Math.PI * f / SR;
    let v = 0; for (let k = 1; k < 12; k++) v += Math.sin(ph * k) / k * Math.exp(-((k * f - 700) ** 2) / 2e5) ; o[i] = v * syl * Math.min(1, t * 6, (b - a - t) * 4); }
  add(bandpass(o, 250, 3200), a, g, pan); } };

// ---------- ambiences ----------
const wind = (a, b, g, lo = 250, hi = 1400) => add(bandpass(noise(b - a, (t, d) => (0.5 + 0.3 * Math.sin(t * 1.7) + 0.2 * Math.sin(t * 0.43)) * Math.min(1, t * 3, (d - t) * 3)), lo, hi), a, g);
const crickets = (a, b, g) => { for (let k = 0; k < 4; k++) { const f = 4200 + k * 650, rate = 14 + k * 3, pan = (k - 1.5) * 0.4; span(a, b, (i, t) => { const ch = Math.max(0, Math.sin(2 * Math.PI * rate * t + k)) ** 8 * (Math.sin(2 * Math.PI * 0.7 * t + k * 2) > -0.3 ? 1 : 0); const v = Math.sin(2 * Math.PI * f * t) * ch * g * Math.min(1, (t - a) * 3, (b - t) * 3); L[i] += v * (1 - pan); R[i] += v * (1 + pan); }); } };
const birds = (a, b, g) => { for (let t = a + 0.2; t < b - 0.3; t += 0.35 + rnd() * 0.6) add(tone(2800 + rnd() * 1500, 3600 + rnd() * 1500, 0.12, 14, 400), t, g, (rnd() - 0.5) * 1.2); };
const crowdRoar = (a, b, g) => { add(bandpass(noise(b - a, (t, d) => (0.7 + 0.3 * Math.sin(t * 2.1)) * Math.min(1, t * 1.5, (d - t) * 2)), 300, 3000), a, g); laughs(a, b, g * 0.25); };
const murmur = (a, b, g) => add(bandpass(noise(b - a, (t, d) => (0.6 + 0.4 * Math.sin(t * 4.1) * Math.sin(t * 2.3)) * Math.min(1, t * 3, (d - t) * 3)), 250, 1800), a, g);
const piano = (a, b, g) => { const notes = [146.8, 174.6, 220, 261.6, 220, 174.6, 196, 246.9]; let k = 0; for (let t = a; t < b - 0.2; t += 0.27, k++) { const f = notes[k % notes.length] * (k % 16 < 8 ? 1 : 1.122);
  add(mix([tone(f, f, 0.6, 5, 2000), 0.5], [tone(f * 2.01, f * 2.01, 0.4, 8, 2000), 0.25], [tone(f * 3.02, f * 3.02, 0.3, 11, 2000), 0.12]), t, g * (k % 2 ? 0.7 : 1), 0.3); if (k % 2 === 0) add(tone(f / 2, f / 2, 0.5, 6, 2000), t, g * 0.5, -0.2); } };

// ---------- the events (absolute seconds) ----------
wind(4.3, 17.2, 0.16); add(lowpass(noise(12.9, (t, d) => Math.min(1, t, d - t) * 0.25), 300), 4.3, 0.3);
murmur(17.2, 21.5, 0.18); wind(21.86, 27.66, 0.14); wind(27.66, 38.7, 0.12, 300, 1800);
crickets(40.38, 55.74, 0.035); wind(40.38, 55.74, 0.08, 150, 700);
wind(55.74, 61.7, 0.16); wind(61.7, 66.96, 0.13, 200, 1000); for (const t of [62.4, 64.1]) add(bandpass(noise(0.25, (x, d) => Math.sin(Math.PI * x / d)), 900, 2200), t, 0.15, 0.6); // crow
wind(66.96, 73.6, 0.14); wind(73.6, 77.1, 0.16);
murmur(77.1, 85.2, 0.07); piano(77.3, 82.7, 0.1); birds(93.0, 96.7, 0.12); crowdRoar(96.7, 105.9, 0.32);
// act 1: the gun handed over
add(bandpass(noise(0.3, (x, d) => Math.sin(Math.PI * x / d)), 500, 2500), 6.6 + 1.3, 0.2); add(tone(220, 180, 0.3, 10), 6.6 + 1.6, 0.3); // heavy weight drop into small hands
// practice
gun(24.45, 0.5, 0.2, 0.8); glass(24.5, 0.6); gun(25.1, 0.5, 0.2, 0.8); glass(25.15, 0.6);
gun(25.92, 0.55, 0, 0.85); glass(25.96, 0.6); gun(26.27, 0.55, -0.2, 0.9); gun(26.45, 0.55, -0.2, 0.9);
for (const s of [0.15, 0.42, 0.68]) { gun(26.6 + s, 0.55, 0.1, 0.9); clink(26.6 + s + 0.05, 0.6, (s - 0.4)); }
// fort
for (let t = 27.8; t < 31.0; t += 0.52) { add(bandpass(noise(0.07, (x) => Math.exp(-x * 50)), 300, 2500), t, 0.22, -0.1); }
laughs(31.0, 33.4, 0.4);
[0.25, 0.47, 0.69, 0.91, 1.13, 1.35].forEach((s, i) => { gun(33.6 + s, 0.6, 0.1, 0.9); glass(33.6 + s + 0.04, 0.55, -0.5 + i * 0.2); });
add(tone(330, 330, 0.5, 4, 50), 35.15, 0.05); // the soldiers' gasp tail
// the hunt
hoofSet(42.76, 44.72, 1.6, 0.5); door(44.72 + 0.35, 0.8); for (let t = 45.1; t < 46.4; t += 0.24) add(lowpass(noise(0.06, (x) => Math.exp(-x * 60)), 1200), t, 0.35); // boots on boards
cock(46.9, 0.6); gun(48.74 + 0.14, 1.0, 0.2, 1.1); hit(48.74 + 0.2, 0.7); thud(48.74 + 0.7, 0.9); add(mix([tone(600, 500, 0.3, 12), 0.4], [highpass(noise(0.2, (x) => Math.exp(-x * 25)), 1500), 0.5]), 48.74 + 0.9, 0.5, 0.4); // rifle clatter
draw(50.36 + 0.75, 0.45); gun(50.36 + 2.2, 1.0, 0, 1.1); hit(50.36 + 2.26, 0.7); thud(50.36 + 2.75, 0.85);
hoofSet(55.74, 59.2, 8, 0.45);
gun(60.25, 0.9, -0.3, 1); add(mix([tone(160, 90, 0.4, 9), 1], [bandpass(noise(0.4, (x) => Math.exp(-x * 9)), 300, 3000), 0.7]), 60.45, 0.6); // poker: chair + table crash
for (const t of [60.48, 60.55, 60.6, 60.7]) clink(t, 0.25, (rnd() - 0.5)); // chips
// town duel
swing(68.47, 0.45); for (let t = 68.9; t < 69.9; t += 0.45) add(lowpass(noise(0.06, (x) => Math.exp(-x * 60)), 1500), t, 0.3, 0.3); // spurs/boots
draw(70.0 + 0.1, 0.5); draw(70.0 + 0.14, 0.5); gun(70.7 + 0.12, 1.0, -0.1, 1.1); gun(70.7 + 0.34, 1.0, -0.1, 1.1);
hit(71.44, 0.6); thud(71.44 + 0.4, 0.85, 0.3); thud(71.44 + 0.5, 0.75, -0.3); add(highpass(noise(0.3, (x) => Math.exp(-x * 8)), 800), 71.44 + 0.42, 0.2);
add(bandpass(noise(0.15, (x, d) => Math.sin(Math.PI * x / d)), 700, 3000), 73.05, 0.3); // holster
hoofSet(74.52, 77.1, 9, 0.5);
// the saloon
swing(77.25, 0.5); for (let t = 77.6; t < 79.4; t += 0.5) add(lowpass(noise(0.07, (x) => Math.exp(-x * 50)), 1200), t, 0.35);
laughs(79.9, 82.5, 0.3);
for (const [t, p] of [[85.32, 0.1], [85.5, -0.2], [85.66, 0.2], [85.83, -0.1], [86.0, 0.15]]) gun(t, 0.95, p, 1.0);
for (const [t, p] of [[85.42, 0.6], [85.75, -0.6]]) gun(t, 0.6, p, 0.8); // their shots back
for (const [t, p] of [[86.95, 0.3], [87.25, -0.3], [87.55, 0]]) thud(t, 0.9, p); add(mix([tone(160, 90, 0.4, 9), 1], [bandpass(noise(0.5, (x) => Math.exp(-x * 7)), 300, 3000), 0.8]), 87.6, 0.6); for (let k = 0; k < 6; k++) clink(87.65 + k * 0.05, 0.3, (rnd() - 0.5));
swing(91.6, 0.4); for (let t = 91.3; t < 92.8; t += 0.55) add(lowpass(noise(0.07, (x) => Math.exp(-x * 50)), 1200), t, 0.3);

// ---------- score: D minor, in sections ----------
const saw = (f, t) => { let s = 0; for (let k = 1; k < 7; k++) s += Math.sin(2 * Math.PI * f * k * t) / k; return s; };
const pad = (a, b, chord, g, fadeIn = 1, fadeOut = 1) => span(a, b, (i, t) => { const e = Math.min(1, (t - a) / fadeIn, (b - t) / fadeOut) * g; let v = 0; for (const [f, w] of chord) v += saw(f * (1 + 0.002 * Math.sin(t * 4 + f)), t) * w; MUS[i] += v * e; });
const Dm = [[73.42, 0.5], [110, 0.35], [174.6, 0.2]], Bb = [[58.27, 0.5], [116.5, 0.3], [174.6, 0.2], [233.1, 0.12]], Gm = [[49, 0.5], [98, 0.35], [146.8, 0.2], [233.1, 0.12]], A = [[55, 0.5], [110, 0.35], [138.6, 0.2], [164.8, 0.15]], F = [[43.65, 0.5], [87.3, 0.35], [130.8, 0.2], [220, 0.12]];
pad(4.3, 10, Dm, 0.12, 1.2); pad(10, 14.7, Gm, 0.14); pad(14.7, 17.2, A, 0.16, 0.5, 0.3);
pad(17.2, 21.86, Bb, 0.08, 0.3); // flashback: thin
pad(21.86, 27.66, Dm, 0.12, 0.5); for (let t = 21.86; t < 27.6; t += 0.5) add(mix([tone(73.4, 73.4, 0.4, 8, 400), 1]), t, 0.18); // determined pulse
pad(27.66, 33.6, F, 0.08, 0.5); pad(33.6, 38.7, [[73.42, 0.5], [110, 0.35], [146.8, 0.3], [220, 0.2]], 0.12, 0.3); // fort: brighter
pad(38.7, 48.7, Dm, 0.12, 0.6, 0.1); for (let t = 40.4; t < 48.7; t += 0.75) add(tone(110, 108, 0.6, 5, 200), t, 0.1); // hunt: heartbeat
pad(50.5, 55.7, Gm, 0.1, 0.5); pad(55.74, 61.7, [[73.42, 0.5], [110, 0.35], [146.8, 0.25], [185, 0.1]], 0.11, 0.6, 0.3); // the long ride: open
pad(61.7, 67, Bb, 0.08, 0.6); pad(67, 70.0, A, 0.14, 0.4, 0.05); // duel tension, cut dead at the draw
pad(73.6, 77.1, Dm, 0.12, 0.3); pad(79.9, 85.2, A, 0.11, 1, 0.05);
pad(88.2, 93.0, Dm, 0.12, 1.5); pad(93.0, 101, F, 0.12, 1); pad(101, 105.9, [[73.42, 0.5], [110, 0.35], [146.8, 0.3], [174.6, 0.2]], 0.12, 1, 1.5);
const mus = lowpass(lowpass(MUS, 900), 1500); add(mus, 0, 0.55);

// ---------- narration on the timeline (line 1 lives in scene 1's mix) ----------
const readWav = (f) => { const b = fs.readFileSync(f); let o = 12, fmt = null, data = null;
  while (o < b.length - 8) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12) }; if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) { let v = 0; for (let c = 0; c < fmt.ch; c++) v += data.readInt16LE((i * fmt.ch + c) * 2); x[i] = v / fmt.ch / 32768; } return { x, sr: fmt.sr, ch: fmt.ch, raw: data }; };
const V = readWav("public/pp/voice.wav");
for (const l of TL.lines) { if (l.id === 1) continue; const n = Math.round(l.dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const p = (l.src + i / SR) * V.sr, j = Math.floor(p), f = p - j; o[i] = j + 1 < V.x.length ? V.x[j] * (1 - f) + V.x[j + 1] * f : 0; } const F = Math.round(0.008 * SR); for (let i = 0; i < F && i < n; i++) { o[i] *= i / F; o[n - 1 - i] *= i / F; } add(o, l.at, 1, 0, VOX); }

// ---------- mix ----------
const rms = (a) => { let s = 0, c = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > 0.01) { s += a[i] ** 2; c++; } return Math.sqrt(s / Math.max(1, c)); };
const vg = 0.26 / rms(VOX);
let env = 0; const duck = new Float32Array(N); for (let i = 0; i < N; i++) { const v = Math.abs(VOX[i] * vg); env = v > env ? env + (v - env) * 0.01 : env * 0.9997; duck[i] = 1 - Math.min(0.5, env * 1.4); }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const bg = 0.85 / pk;
const lim = (v) => (Math.abs(v) < 0.75 ? v : Math.sign(v) * (0.75 + 0.24 * Math.tanh((Math.abs(v) - 0.75) / 0.24)));
const ML = new Float32Array(N), MR = new Float32Array(N);
for (let i = 0; i < N; i++) { const fade = Math.min(1, (N - i) / (1.2 * SR)); ML[i] = lim((VOX[i] * vg + L[i] * bg * duck[i]) * fade); MR[i] = lim((VOX[i] * vg + R[i] * bg * duck[i]) * fade); }
// scene 1's own mix for 0-4.3 s, crossfaded into the rest
const S1 = readWav("public/anime1/mix.wav"); const s1n = Math.min(S1.raw.length / 4, Math.round(4.3 * SR));
for (let i = 0; i < s1n; i++) { const k = Math.min(1, (s1n - i) / (0.08 * SR)); const a = S1.raw.readInt16LE(i * 4) / 32768, b2 = S1.raw.readInt16LE(i * 4 + 2) / 32768; ML[i] = a * k + ML[i] * (1 - k); MR[i] = b2 * k + MR[i] * (1 - k); }
const b = Buffer.alloc(44 + N * 4); b.write("RIFF", 0); b.writeUInt32LE(36 + N * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ML[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, MR[i])) * 32767), 46 + i * 4); }
fs.writeFileSync("public/pp/mix.wav", b); console.log("public/pp/mix.wav", DUR, "s");
