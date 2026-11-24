// Scene 1 sound, all made in code: gallop, tack jingle, wind, draw, hammer cock, gunshot + canyon echo,
// bullet hit, body fall, a tension drone that cuts dead on the shot, and the narration placed on the beats.
// Usage: node scripts/anime1_sound.mjs  -> public/anime1/mix.wav + episodes/anime1/words.json (caption timing)
import fs from "node:fs";
import path from "node:path";

const SR = 44100, DUR = 4.3, N = Math.round(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N), MUS = new Float32Array(N);
let seed = 777; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const add = (buf, t0, gain = 1, pan = 0, dst = null) => { const o = Math.round(t0 * SR); const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && o + i < N; i++) if (o + i >= 0) { if (dst) dst[o + i] += buf[i] * gain; else { L[o + i] += buf[i] * gl; R[o + i] += buf[i] * gr; } } };
const noise = (dur, shape) => { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (rnd() * 2 - 1) * shape(i / SR, dur); return o; };
const lowpass = (x, fc) => { const a = 1 - Math.exp((-2 * Math.PI * fc) / SR); let y = 0; const o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); o[i] = y; } return o; };
const highpass = (x, fc) => { const l = lowpass(x, fc); return x.map((v, i) => v - l[i]); };
const bandpass = (x, lo, hi) => highpass(lowpass(x, hi), lo);
const tone = (f0, f1, dur, decay = 8, att = 300) => { const n = Math.round(dur * SR), o = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = f0 + (f1 - f0) * (t / dur); ph += (2 * Math.PI * f) / SR; o[i] = Math.sin(ph) * Math.exp(-t * decay) * Math.min(1, t * att); } return o; };
const mix = (...xs) => { const n = Math.max(...xs.map(([x]) => x.length)), o = new Float32Array(n); for (const [x, g] of xs) for (let i = 0; i < x.length; i++) o[i] += x[i] * g; return o; };
const ntrack = (keys, t) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; const k = (t - t0) / (t1 - t0); return v0 + (v1 - v0) * k * k * (3 - 2 * k); } return keys[keys.length - 1][1]; };

// same motion as the picture (src/anime/Scene1.tsx)
const T_SHOT = 2.8, T_CUT = 2.9, T_LAND = 3.7;
const speed = (t) => ntrack([[0, 8], [1.35, 8], [2.45, 1.6], [3, 1.2]], t);
const dist = (t) => { let d = 0; for (let x = 0; x < t; x += 0.005) d += speed(x) * 0.005; return d; };

// ---- hooves: each horse lands 4 beats per stride (gallop: 1-2-3 ... 4), beats get brighter "clops" as they slow ----
const hoof = (bright) => mix([tone(110 + rnd() * 30, 55, 0.12, 30), 1], [lowpass(noise(0.06, (t, d) => Math.exp(-t * 70)), 900 + bright * 2500), 0.9]);
const horses = [{ ph: 0, pan: 0, g: 1 }, { ph: 0.31, pan: -0.5, g: 0.6 }, { ph: 0.57, pan: 0.5, g: 0.6 }, { ph: 0.13, pan: -0.8, g: 0.4 }, { ph: 0.74, pan: 0.15, g: 0.4 }, { ph: 0.46, pan: 0.8, g: 0.4 }];
const near = (t) => ntrack([[0, 1], [0.35, 0.95], [1.25, 0.55], [1.95, 1], [2.5, 0.8], [T_CUT, 0.75]], t);
for (const h of horses) {
  let prev = null;
  for (let t = 0; t < T_CUT; t += 0.004) {
    const run = Math.max(0, Math.min(1, (speed(t) - 2.5) / 3));
    const cyc = run > 0.5 ? dist(t) / 5.2 + h.ph : dist(t) / 1.9 + h.ph;
    const pat = run > 0.5 ? [0, 0.12, 0.22, 0.5] : [0, 0.25, 0.5, 0.75];
    const ph = cyc % 1; const idx = pat.findIndex((p, i) => ph >= p && ph < (pat[i + 1] ?? 1));
    const key = Math.floor(cyc) * 4 + idx;
    if (prev !== null && key !== prev) add(hoof(1 - run), t + rnd() * 0.01, h.g * near(t) * (0.5 + rnd() * 0.15) * (run > 0.5 ? 1 : 0.7), h.pan);
    prev = key;
  }
}
// ground rumble under the gallop + tack jingle
add(lowpass(noise(T_CUT, (t, d) => ntrack([[0, 0.7], [1.3, 0.5], [1.9, 0.8], [2.45, 0.2], [d, 0.1]], t) * Math.min(1, (d - t) * 20)), 90), 1.4);
for (let t = 0.05; t < 2.4; t += 0.33 + rnd() * 0.1) add(bandpass(noise(0.08, (x) => Math.exp(-x * 45)), 4500, 9000), t, 0.12, rnd() * 1.4 - 0.7);
// wind across the whole scene, a little colder after the cut
add(bandpass(noise(DUR, (t) => 0.5 + 0.3 * Math.sin(t * 1.7) + (t > T_CUT ? 0.25 : 0)), 250, 1400), 0, 0.22);

// ---- the draw: leather slide + steel ring at 0.43-0.5 ----
add(bandpass(noise(0.16, (t, d) => Math.sin(Math.PI * t / d) ** 2), 900, 4200), 0.40, 0.55, 0.25);
add(mix([tone(2950, 2900, 0.45, 9, 2000), 0.25], [tone(4400, 4380, 0.35, 12, 2000), 0.12]), 0.5, 0.5, 0.25);
// hammer cock as the gun comes down (two clicks)
for (const [t, g] of [[2.17, 0.7], [2.23, 0.9]]) add(bandpass(noise(0.025, (x) => Math.exp(-x * 300)), 2500, 7000), t, g, 0.2);

// ---- gunshot on "man": crack + body + low boom, then canyon echoes ----
const crack = highpass(noise(0.08, (t) => Math.exp(-t * 60)), 1500);
const body = lowpass(noise(0.5, (t) => Math.exp(-t * 9) * Math.min(1, t * 3000)), 1800);
const boom = tone(75, 38, 0.9, 5, 4000);
const shot = mix([crack, 1.0], [body, 1.3], [boom, 1.1]);
add(shot, T_SHOT, 1.0, 0.1);
for (const [dt, g, fc, pan] of [[0.2, 0.32, 1400, -0.5], [0.43, 0.22, 900, 0.6], [0.78, 0.14, 600, -0.3], [1.2, 0.08, 450, 0.4]]) add(lowpass(shot, fc), T_SHOT + dt, g, pan);
add(lowpass(noise(1.4, (t, d) => Math.exp(-t * 2.4) * Math.min(1, t * 40)), 700), T_SHOT + 0.03, 0.35);   // rolling tail
// bullet whip into Thomas just after the cut + the hit
add(highpass(noise(0.07, (t, d) => (t / d) ** 2), 3000), T_CUT - 0.02, 0.5, -0.6);
add(mix([tone(95, 60, 0.25, 18), 1], [lowpass(noise(0.12, (t) => Math.exp(-t * 40)), 700), 0.8]), T_CUT + 0.03, 0.9);
// his boots scuff during the stagger, then the fall: heavy thud, dust, the bounce
add(bandpass(noise(0.18, (t, d) => Math.sin(Math.PI * t / d)), 300, 2200), 3.3, 0.25, 0.1);
add(mix([tone(70, 42, 0.6, 7, 2000), 1.2], [lowpass(noise(0.4, (t) => Math.exp(-t * 14)), 500), 1.0]), T_LAND, 1.0);
add(mix([tone(80, 50, 0.25, 16), 0.5], [lowpass(noise(0.15, (t) => Math.exp(-t * 30)), 600), 0.4]), T_LAND + 0.09, 0.6);
add(bandpass(noise(0.9, (t, d) => Math.exp(-t * 3) * Math.min(1, t * 30)), 400, 2500), T_LAND + 0.02, 0.18);

// ---- music: low D minor drone that swells with the ride and cuts dead on the shot; one mournful note after ----
const saw = (f, t) => { let s = 0; for (let k = 1; k < 9; k++) s += Math.sin(2 * Math.PI * f * k * t) / k; return s; };
for (let i = 0; i < N; i++) { const t = i / SR;
  if (t < T_SHOT) { const sw = ntrack([[0, 0.25], [1.9, 0.55], [2.6, 1], [T_SHOT, 1]], t) * Math.min(1, (T_SHOT - t) * 200);
    MUS[i] += sw * (saw(73.42 * (1 + 0.002 * Math.sin(t * 5)), t) * 0.5 + saw(110 * (1 - 0.002 * Math.sin(t * 4.3)), t) * 0.35 + saw(174.6, t) * 0.18 * Math.min(1, t / 1.5)); }
  if (t > 3.05) { const e = Math.min(1, (t - 3.05) * 1.6) * Math.min(1, (DUR - t) * 4); MUS[i] += e * (Math.sin(2 * Math.PI * 146.8 * t) * 0.5 + Math.sin(2 * Math.PI * 293.7 * t) * 0.12 + Math.sin(2 * Math.PI * 220 * t) * 0.2) * (1 + 0.15 * Math.sin(t * 9)); }
}
const mus = lowpass(lowpass(MUS, 900), 1400);
// a high tremolo string note rising into the shot
for (let i = 0; i < N; i++) { const t = i / SR; if (t > 1.9 && t < T_SHOT) { const e = ((t - 1.9) / (T_SHOT - 1.9)) ** 2; mus[i] += e * 0.25 * Math.sin(2 * Math.PI * 587.3 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 14 * t)) * Math.min(1, (T_SHOT - t) * 200); } }
add(mus, 0, 0.09, 0); add(mus, 0.012, 0.0, 0);

// ---- narration: "Six men ride up to the farm," / "and shoot a man" (man on the flash) ... "dead." (on the landing) ----
const readWav = (f) => { const b = fs.readFileSync(f); let o = 12, fmt = null, data = null;
  while (o < b.length - 8) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12) }; if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) { let v = 0; for (let c = 0; c < fmt.ch; c++) v += data.readInt16LE((i * fmt.ch + c) * 2); x[i] = v / fmt.ch / 32768; } return { x, sr: fmt.sr }; };
const V = readWav("public/anime1/voice.wav"); const TM = JSON.parse(fs.readFileSync("episodes/anime1/timing.json", "utf8"));
const slice = (a, b) => { const n = Math.round((b - a) * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const p = (a + i / SR) * V.sr, j = Math.floor(p), f = p - j; o[i] = j + 1 < V.x.length ? V.x[j] * (1 - f) + V.x[j + 1] * f : 0; } const F = Math.round(0.008 * SR); for (let i = 0; i < F && i < n; i++) { o[i] *= i / F; o[n - 1 - i] *= i / F; } return o; };
const w1 = TM.shots[0].words, w2 = TM.shots[1].words; const man = w2.find((w) => w.w === "man"), dead = w2[w2.length - 1];
const parts = [
  { a: TM.shots[0].start, b: TM.shots[0].end + 0.04, at: 0.12, words: w1 },
  { a: TM.shots[1].start, b: dead.start, at: 2.74 - (man.start - TM.shots[1].start), words: w2.slice(0, -1) },
  { a: dead.start, b: dead.end + 0.08, at: 3.5, words: [dead] },
];
const VOX = new Float32Array(N); const words = [];
for (const p of parts) { add(slice(p.a, p.b), p.at, 1, 0, VOX); for (const w of p.words) words.push({ w: w.w, start: +(p.at + w.start - p.a).toFixed(3), end: +(p.at + w.end - p.a).toFixed(3) }); }
fs.writeFileSync("episodes/anime1/words.json", JSON.stringify(words, null, 1));

// ---- mix: voice clear on top; SFX bed under it with the voice ducking it a little; soft limiter ----
const rms = (a) => { let s = 0, c = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > 0.01) { s += a[i] ** 2; c++; } return Math.sqrt(s / Math.max(1, c)); };
const vg = 0.27 / rms(VOX);
let env = 0; const duck = new Float32Array(N); for (let i = 0; i < N; i++) { const v = Math.abs(VOX[i] * vg); env = v > env ? env + (v - env) * 0.01 : env * 0.9997; duck[i] = 1 - Math.min(0.45, env * 1.3); const t = i / SR; if (t > T_SHOT - 0.01 && t < T_SHOT + 0.5) duck[i] = Math.max(duck[i], 1); }
const lim = (v) => (Math.abs(v) < 0.75 ? v : Math.sign(v) * (0.75 + 0.24 * Math.tanh((Math.abs(v) - 0.75) / 0.24)));
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const bg = 0.9 / pk;
const ML = new Float32Array(N), MR = new Float32Array(N);
for (let i = 0; i < N; i++) { const fade = Math.min(1, (N - i) / (0.15 * SR)); ML[i] = lim((VOX[i] * vg + L[i] * bg * duck[i]) * fade); MR[i] = lim((VOX[i] * vg + R[i] * bg * duck[i]) * fade); }
const b = Buffer.alloc(44 + N * 4); b.write("RIFF", 0); b.writeUInt32LE(36 + N * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ML[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, MR[i])) * 32767), 46 + i * 4); }
fs.writeFileSync("public/anime1/mix.wav", b);
console.log("mix.wav written;", words.map((w) => `${w.w}@${w.start}`).join(" "));
