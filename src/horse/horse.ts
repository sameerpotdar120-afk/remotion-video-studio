/**
 * Cartoon horse drawn with Canvas 2D (no images), matching the stickman style: flat colours, ink outlines,
 * dot eye. Side view facing +x. Units: ~100 long, hooves at y = 100, withers ~y = 30.
 * Modes: gallop (phase t), stand, graze (head down), buck (hind legs up), rear (front up).
 */
import { INK } from './chars';

export type HorseLook = { coat: string; mane: string; blaze?: boolean; hoof?: string; belly?: string };
export const HORSES: Record<string, HorseLook> = {
  brown: { coat: '#a85f34', mane: '#4a2a18', blaze: true, belly: '#c98a5a' },
  black: { coat: '#2c2a2e', mane: '#121114', blaze: true, belly: '#46434a' },
  tan: { coat: '#c79059', mane: '#5a3820', blaze: false, belly: '#ddb07e' },
};
export type HorsePose = { mode: 'gallop' | 'stand' | 'graze' | 'buck' | 'rear'; t?: number; blink?: boolean; angry?: boolean };

const rad = (d: number) => (d * Math.PI) / 180;
const ink = (g: CanvasRenderingContext2D, w = 1.6) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };

/** Leg: thick upper + thinner lower + hoof. a1/a2 in degrees from vertical (+ = forward/right). */
const leg = (g: CanvasRenderingContext2D, x: number, y: number, a1: number, a2: number, col: string, L1 = 19, L2 = 22, hoof = '#2a2420') => {
  const kx = x + Math.sin(rad(a1)) * L1, ky = y + Math.cos(rad(a1)) * L1;
  const hx = kx + Math.sin(rad(a2)) * L2, hy = ky + Math.cos(rad(a2)) * L2;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.lineTo(kx, ky); g.strokeStyle = INK; g.lineWidth = 10.5; g.stroke(); g.strokeStyle = col; g.lineWidth = 7.4; g.stroke();
  g.beginPath(); g.moveTo(kx, ky); g.lineTo(hx, hy); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.strokeStyle = col; g.lineWidth = 5; g.stroke();
  g.save(); g.translate(hx, hy); g.rotate(-rad(a2));
  g.beginPath(); g.moveTo(-3.8, -2); g.lineTo(3.8, -2); g.lineTo(4.4, 2.6); g.lineTo(-4, 2.6); g.closePath(); g.fillStyle = hoof; g.fill(); ink(g, 1.1);
  g.restore();
};

export const drawHorse = (g: CanvasRenderingContext2D, H: HorseLook, P: HorsePose) => {
  const t = P.t ?? 0, ph = t * Math.PI * 2;
  let pitch = 0, lift = 0, neckA = 0, headA = 0;
  // [upper, lower] for frontNear, frontFar, hindNear, hindFar (deg from vertical, + = forward)
  let legs: [number, number][] = [[3, 0], [-3, 0], [-2, 2], [3, -1]];
  if (P.mode === 'gallop') {
    const f = (o: number) => { const s = Math.sin(ph + o); return [30 * s, 30 * s - 38 * Math.max(0, -Math.cos(ph + o))] as [number, number]; };
    const h = (o: number) => { const s = Math.sin(ph + o); return [-28 * s, -28 * s + 40 * Math.max(0, Math.cos(ph + o))] as [number, number]; };
    legs = [f(0), f(0.6), h(2.2), h(2.8)];
    pitch = 4 * Math.sin(ph + 1.2); lift = -5 * Math.abs(Math.sin(ph + 0.4)); neckA = 7 * Math.sin(ph + 0.7);
  }
  if (P.mode === 'graze') { neckA = 78; headA = 20; legs = [[-6, 0], [5, 0], [0, 2], [-6, 0]]; }
  if (P.mode === 'buck') { const k = 0.5 + 0.5 * Math.sin(ph); pitch = -16 * k; legs = [[10, -8], [4, -4], [-58 * k - 4, -28 * k], [-48 * k - 4, -16 * k]]; neckA = -10 * k; }
  if (P.mode === 'rear') { const k = 0.5 + 0.5 * Math.sin(ph); pitch = 30 * k; legs = [[55 * k, -55 * k], [40 * k, -70 * k], [-8, 6], [4, -2]]; neckA = -12 * k; headA = -10 * k; }
  const col = H.coat, dark = shade(col, -0.22);
  g.save();
  g.translate(0, lift);
  const piv: [number, number] = pitch > 0 ? [-24, 62] : [22, 62];
  g.translate(piv[0], piv[1]); g.rotate(-rad(pitch)); g.translate(-piv[0], -piv[1]);

  // far legs + tail behind
  leg(g, 17, 58, legs[1][0], legs[1][1], dark);
  leg(g, -22, 57, legs[3][0], legs[3][1], dark);
  const sw = Math.sin(ph * 1.1) * 4;
  g.beginPath(); g.moveTo(-30, 42); g.bezierCurveTo(-44, 40, -50 + sw, 54, -46 + sw, 74); g.bezierCurveTo(-42 + sw, 66, -38, 56, -30, 50); g.closePath(); g.fillStyle = H.mane; g.fill(); ink(g, 1.4);
  // barrel
  g.beginPath(); g.ellipse(-2, 50, 31, 14.5, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill();
  g.save(); g.clip(); g.fillStyle = H.belly ?? shade(col, 0.15); g.beginPath(); g.ellipse(-2, 66, 28, 7, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.beginPath(); g.ellipse(-2, 50, 31, 14.5, 0, 0, Math.PI * 2); ink(g, 1.8);
  // near legs
  leg(g, 20, 58, legs[0][0], legs[0][1], col);
  leg(g, -24, 57, legs[2][0], legs[2][1], col);
  // neck (rotates about the withers) + head
  g.save(); g.translate(20, 44); g.rotate(rad(neckA));
  g.beginPath(); g.moveTo(-7, 6); g.bezierCurveTo(-5, -8, 2, -20, 9, -27); g.lineTo(19, -22); g.bezierCurveTo(14, -12, 13, -1, 12, 8); g.closePath();
  g.fillStyle = col; g.fill(); ink(g, 1.7);
  g.beginPath(); g.moveTo(-7, 5); g.bezierCurveTo(-5, -8, 1, -21, 8, -29); g.lineTo(12, -26); g.bezierCurveTo(5, -18, 0, -8, -2, 4); g.closePath(); g.fillStyle = H.mane; g.fill(); ink(g, 1.2);
  // head: hinge at the poll, muzzle forward-down
  g.save(); g.translate(13, -25); g.rotate(rad(headA));
  g.beginPath(); g.moveTo(-4, -5); g.bezierCurveTo(2, -9, 10, -7, 15, -1); g.lineTo(24, 11); g.bezierCurveTo(27, 16, 23, 21, 17, 20); g.lineTo(7, 15); g.bezierCurveTo(-1, 12, -6, 5, -4, -5); g.closePath();
  g.fillStyle = col; g.fill(); ink(g, 1.7);
  if (H.blaze) { g.beginPath(); g.moveTo(5, -5); g.lineTo(19, 8); g.lineTo(21, 15); g.lineTo(17, 13.5); g.lineTo(6, 0); g.closePath(); g.fillStyle = '#f6f1e6'; g.fill(); }
  g.beginPath(); g.ellipse(20.5, 15.5, 4.6, 3.6, rad(40), 0, Math.PI * 2); g.fillStyle = shade(col, 0.28); g.fill();
  g.beginPath(); g.arc(21.5, 15, 0.9, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(-2, -5); g.lineTo(-1, -14); g.lineTo(4, -7); g.closePath(); g.fillStyle = col; g.fill(); ink(g, 1.2);
  if (P.blink) { g.beginPath(); g.moveTo(3.5, 1); g.lineTo(8, 1); g.strokeStyle = INK; g.lineWidth = 1.1; g.stroke(); }
  else { g.beginPath(); g.ellipse(5.8, 1, 1.5, 2, 0, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(6.2, 0.3, 0.5, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill(); }
  if (P.angry) { g.beginPath(); g.moveTo(1.5, -3.5); g.lineTo(9, -1.5); g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke(); }
  g.restore(); g.restore();
  g.restore();
};

/** lighten (+) / darken (-) a hex colour */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const f = (c: number) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  r = f(r); gg = f(gg); b = f(b);
  return `#${((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1)}`;
};
