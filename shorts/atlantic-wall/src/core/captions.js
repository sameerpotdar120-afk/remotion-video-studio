// Two-word captions, ALL CAPS, rounded bold: first word white, second word in a rotating accent colour,
// dark outline + soft drop shadow, centred at ~47% of the frame height. Timed from data/words.json.
import { ctx, W, H } from './lib.js';
import { T } from './timing.js';

const ACCENTS = ['#4BE58A', '#FF4F5E', '#FFE04A', '#3FD9FF', '#FF62C9'];
let CHUNKS = [];
const clean = (w) => String(w).replace(/[^A-Za-z0-9'’-]/g, '').toUpperCase();

export function buildCaptions() {
  CHUNKS = [];
  const ws = T.words.filter((w) => clean(w.w));
  for (let i = 0; i < ws.length; i += 2) {
    const a = ws[i], b = ws[i + 1];
    const brk = b && b.line !== a.line;                       // never pair across a sentence/line break
    if (brk || !b) { CHUNKS.push({ s: a.s, e: a.e, words: [clean(a.w)] }); if (brk) i -= 1; continue; }
    CHUNKS.push({ s: a.s, e: b.e, words: [clean(a.w), clean(b.w)] });
  }
  for (let i = 0; i < CHUNKS.length; i++) { CHUNKS[i].e = i < CHUNKS.length - 1 ? Math.max(CHUNKS[i].e, CHUNKS[i + 1].s) : CHUNKS[i].e + 0.4; CHUNKS[i].c = ACCENTS[i % ACCENTS.length]; }
}
export function captionList() { return CHUNKS.map((c) => ({ s: c.s, e: c.e, words: c.words.map((w, i) => ({ txt: w, hi: i === 1 })) })); }

export function drawCaption(t) {
  const c = CHUNKS.find((k) => t >= k.s - 0.03 && t < k.e);
  if (!c) return;
  const k = Math.min(1, (t - c.s + 0.03) / 0.09), pop = 0.86 + 0.14 * (1 - Math.pow(1 - k, 3)) + 0.04 * Math.sin(k * Math.PI);
  const size = Math.round(W * 0.066), y = H * 0.47;
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(pop, pop);
  ctx.font = `700 ${size}px Fredoka`; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.letterSpacing = `${size * 0.02}px`;
  const gap = size * 0.28, ws = c.words.map((w) => ctx.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let x = -total / 2;
  c.words.forEach((w, i) => {
    const col = i === 0 && c.words.length > 1 ? '#FFFFFF' : c.c;
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.07;
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#141018'; ctx.strokeText(w, x, 0);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = col; ctx.fillText(w, x, 0);
    x += ws[i] + gap;
  });
  ctx.restore();
}
