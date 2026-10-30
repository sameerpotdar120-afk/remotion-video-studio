/**
 * Stickman characters drawn with the Canvas 2D API (no images): rounded-square heads with thick ink outlines,
 * pill-shaped robes, stick limbs with round hands, dot eyes and blush - the reference's character style.
 *
 * Units: the figure is 100 units tall, feet at y = 100, centre line x = 0 (head top at y = 0).
 * drawChar(g, look, pose) draws in those units; the caller sets the transform (scale/translate).
 */

export type Eyes = 'dot' | 'sleepy' | 'happy' | 'star' | 'wide' | 'closed' | 'sad' | 'angry' | 'dizzy' | 'side';
export type Mouth = 'none' | 'line' | 'smile' | 'open' | 'grin' | 'frown' | 'o' | 'flat' | 'wavy';
export type Brows = 'none' | 'flat' | 'raised' | 'sad' | 'angry' | 'arch';

export type Look = {
  skin: string; robe: string; robe2?: string; trim?: string; belt?: string;
  hair: 'oldman' | 'bun' | 'bob' | 'cap' | 'furhat' | 'band' | 'helmet' | 'short' | 'womanbun' | 'none';
  hairColor?: string; hatColor?: string;
  beard?: boolean; armor?: boolean; vest?: 'stripes' | 'puffer'; pants?: string; patch?: boolean;
};

export type Arm = { a: number; e?: number }; // a: degrees from hanging straight down (+ = away from body); e: elbow bend (+ = forearm up/in)
export type Pose = {
  armL?: Arm; armR?: Arm; legL?: number; legR?: number; // legs: degrees from vertical (+ = outward)
  kneeL?: number; kneeR?: number;
  bob?: number; lean?: number; headTilt?: number;
  eyes?: Eyes; mouth?: Mouth; brows?: Brows; open?: number; look?: number; // look: pupils -1..1
  blush?: boolean; anger?: number; sweat?: boolean; sparkles?: number; dizzy?: number; // 0..1 strengths / phases
  bandage?: boolean; crutch?: boolean; spear?: boolean; holdBag?: boolean; scaleY?: number;
};

export const INK = '#2a1c12';
const LW = 1.55;

/* ───────────── looks: the cast ───────────── */
export const CAST: Record<string, Look> = {
  oldman: { skin: '#f3dcc1', robe: '#ece4d2', trim: '#d9cfb8', belt: '#7a5232', hair: 'oldman', hairColor: '#fbfaf6', beard: true, patch: true },
  blue: { skin: '#e9b98c', robe: '#2f5597', trim: '#f2efe6', belt: '#d98a2b', hair: 'bun', hairColor: '#2b2420' },
  red: { skin: '#f0c9a3', robe: '#b8322c', trim: '#f2efe6', belt: '#3a2a20', hair: 'bob', hairColor: '#8a5a3a' },
  yellow: { skin: '#9a5a35', robe: '#d9a530', trim: '#f2efe6', belt: '#5a3b20', hair: 'cap', hatColor: '#c9772f' },
  green: { skin: '#d9a77b', robe: '#5d8a46', trim: '#f2efe6', belt: '#3a2a20', hair: 'furhat', hatColor: '#d0803a' },
  son: { skin: '#f0cfa8', robe: '#8b5a32', robe2: '#3a2a20', trim: '#5c3a20', belt: '#3a2a20', hair: 'band', hairColor: '#2b2420', hatColor: '#e2b13c' },
  soldier: { skin: '#f0cfa8', robe: '#9aa0a6', robe2: '#b3262b', belt: '#3a2a20', hair: 'helmet', hatColor: '#8f969c', armor: true },
  soldier2: { skin: '#9a5a35', robe: '#9aa0a6', robe2: '#b3262b', belt: '#3a2a20', hair: 'helmet', hatColor: '#8f969c', armor: true },
  modern: { skin: '#f0cfa8', robe: '#2e5fb3', robe2: '#22252b', hair: 'short', hairColor: '#1f1a17', vest: 'stripes' },
  woman: { skin: '#e7b787', robe: '#e2ae2e', robe2: '#3b5f9a', hair: 'womanbun', hairColor: '#5a3820', vest: 'puffer' },
};

/* ───────────── helpers ───────────── */
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rt: number, rb: number) => {
  g.beginPath();
  g.moveTo(x + rt, y); g.lineTo(x + w - rt, y); g.quadraticCurveTo(x + w, y, x + w, y + rt);
  g.lineTo(x + w, y + h - rb); g.quadraticCurveTo(x + w, y + h, x + w - rb, y + h);
  g.lineTo(x + rb, y + h); g.quadraticCurveTo(x, y + h, x, y + h - rb);
  g.lineTo(x, y + rt); g.quadraticCurveTo(x, y, x + rt, y); g.closePath();
};
const ink = (g: CanvasRenderingContext2D, w = LW) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const fillInk = (g: CanvasRenderingContext2D, c: string, w = LW) => { g.fillStyle = c; g.fill(); ink(g, w); };
const rad = (d: number) => (d * Math.PI) / 180;
const star = (g: CanvasRenderingContext2D, x: number, y: number, r: number, pts = 5, inner = 0.45) => {
  g.beginPath();
  for (let i = 0; i < pts * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / pts, rr2 = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  g.closePath();
};
const sparkle = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  g.beginPath(); g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r);
  g.closePath(); g.fillStyle = '#ffffff'; g.fill(); ink(g, 0.9);
};

/* geometry of the figure (units) */
const HEAD = { x: -13.5, y: 0, w: 27, h: 29 };
const BODY = { x: -12.5, y: 27.5, w: 25, h: 41 };
const SHOULDER_Y = 33, HIP_Y = 66, FOOT_Y = 98.5;

/** Draw one limb as an ink stick from (x, y) with angle a (deg, 0 = straight down), elbow bend e, returns the end point. */
const limb = (g: CanvasRenderingContext2D, x: number, y: number, a: number, len: number, e = 0, side = 1, w = LW * 1.15) => {
  const a1 = rad(a) * side;
  const ex = x + Math.sin(a1) * len * 0.5, ey = y + Math.cos(a1) * len * 0.5;
  const a2 = a1 - rad(e) * side;
  const hx = ex + Math.sin(a2) * len * 0.5, hy = ey + Math.cos(a2) * len * 0.5;
  g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy);
  g.strokeStyle = INK; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
  return [hx, hy] as const;
};

/* ───────────── the figure ───────────── */
export const drawChar = (g: CanvasRenderingContext2D, L: Look, P: Pose = {}) => {
  const bob = P.bob ?? 0;
  g.save();
  g.translate(0, 100); g.rotate(rad(P.lean ?? 0)); g.scale(1, P.scaleY ?? 1); g.translate(0, -100 + bob);

  // crutch behind the near arm
  if (P.crutch) { g.beginPath(); g.moveTo(17, 40); g.lineTo(19, FOOT_Y + 0.5); g.strokeStyle = '#7a4a2a'; g.lineWidth = 2.2; g.stroke(); g.beginPath(); g.moveTo(13, 40); g.lineTo(21, 40); g.lineWidth = 2.4; g.stroke(); }
  if (P.spear) {
    g.beginPath(); g.moveTo(-17, -22); g.lineTo(-17, FOOT_Y); g.strokeStyle = '#6a3a20'; g.lineWidth = 1.8; g.stroke();
    g.beginPath(); g.moveTo(-17, -34); g.quadraticCurveTo(-13.5, -25, -17, -20); g.quadraticCurveTo(-20.5, -25, -17, -34); fillInk(g, '#c7a24a', 0.9);
    g.beginPath(); g.ellipse(-17, -19, 2.4, 1.6, 0, 0, Math.PI * 2); fillInk(g, '#b3262b', 0.8);
  }

  // legs
  const legLen = FOOT_Y - HIP_Y;
  const legs: [number, number, number][] = [[-5, P.legL ?? 0, P.kneeL ?? 0], [5, P.legR ?? 0, P.kneeR ?? 0]];
  for (const [lx, la, k] of legs) {
    const side = lx < 0 ? -1 : 1;
    const [fx, fy] = limb(g, lx, HIP_Y, la, legLen, -k, side, LW * 1.2);
    if (P.bandage && lx > 0) { for (let i = 0; i < 4; i++) { const t = 0.55 + i * 0.1; const bx = lx + (fx - lx) * t, by = HIP_Y + (fy - HIP_Y) * t; g.beginPath(); g.moveTo(bx - 2.2, by - 0.6); g.lineTo(bx + 2.2, by + 0.6); g.strokeStyle = '#ffffff'; g.lineWidth = 1.6; g.stroke(); g.lineWidth = 0.5; g.strokeStyle = INK; g.stroke(); } }
    g.beginPath(); g.ellipse(fx + side * 1.2, fy + 0.3, 3, 1.7, 0, 0, Math.PI * 2); fillInk(g, '#2a2420', 0.8);
  }

  // body (robe pill)
  const B = BODY;
  rr(g, B.x, B.y, B.w, B.h, 6.5, 12.5);
  g.save(); g.clip();
  g.fillStyle = L.robe; g.fillRect(B.x - 1, B.y - 1, B.w + 2, B.h + 2);
  if (L.robe2 && !L.vest) { g.fillStyle = L.robe2; g.fillRect(B.x - 1, B.y + B.h * 0.72, B.w + 2, B.h); }
  if (L.armor) { // scale armour
    g.fillStyle = L.robe; g.fillRect(B.x - 1, B.y - 1, B.w + 2, B.h);
    g.strokeStyle = 'rgba(40,40,45,0.75)'; g.lineWidth = 0.55;
    for (let r = 0; r < 9; r++) for (let c = -1; c < 7; c++) { const x = B.x + c * 4.2 + (r % 2 ? 2.1 : 0), y = B.y + 2 + r * 3.3; g.beginPath(); g.arc(x, y, 2.1, 0, Math.PI); g.stroke(); }
    g.fillStyle = L.robe2 ?? '#b3262b'; g.fillRect(B.x - 1, B.y + B.h * 0.7, B.w + 2, B.h);
  }
  if (L.vest === 'stripes') {
    g.fillStyle = '#eef0f2'; g.fillRect(B.x - 1, B.y - 1, B.w + 2, B.h);
    g.fillStyle = L.robe; g.fillRect(B.x + 3, B.y - 1, B.w - 6, B.h * 0.66);
    g.strokeStyle = '#eef0f2'; g.lineWidth = 0.9;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(B.x + 3 + i * (B.w - 6) / 6, B.y); g.lineTo(B.x + 3 + i * (B.w - 6) / 6, B.y + B.h * 0.66); g.stroke(); }
    g.beginPath(); g.moveTo(B.x + 3, B.y + B.h * 0.38); g.lineTo(B.x + B.w - 3, B.y + B.h * 0.38); g.lineWidth = 1.4; g.stroke();
    g.fillStyle = L.robe2 ?? '#22252b'; g.fillRect(B.x - 1, B.y + B.h * 0.66, B.w + 2, B.h);
  }
  if (L.vest === 'puffer') {
    g.fillStyle = L.robe2 ?? '#3b5f9a'; g.fillRect(B.x - 1, B.y + B.h * 0.68, B.w + 2, B.h);
    g.strokeStyle = 'rgba(120,80,20,0.7)'; g.lineWidth = 0.7;
    for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(B.x, B.y + i * 4.2); g.lineTo(B.x + B.w, B.y + i * 4.2); g.stroke(); }
    g.beginPath(); g.moveTo(0, B.y); g.lineTo(0, B.y + B.h * 0.68); g.lineWidth = 0.9; g.stroke();
  }
  // shading on the far side
  const sh = g.createLinearGradient(B.x, 0, B.x + B.w, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,20,10,0.13)');
  g.fillStyle = sh; g.fillRect(B.x, B.y, B.w, B.h);
  g.restore();
  rr(g, B.x, B.y, B.w, B.h, 6.5, 12.5); ink(g);
  // collar / belt
  if (!L.armor && !L.vest) {
    g.beginPath(); g.moveTo(-6.5, B.y + 0.6); g.lineTo(5.5, B.y + 13); g.moveTo(6.5, B.y + 0.6); g.lineTo(-2.5, B.y + 9.5);
    g.strokeStyle = L.trim ?? '#f2efe6'; g.lineWidth = 2; g.stroke(); g.lineWidth = 0.55; g.strokeStyle = INK; g.stroke();
    if (L.belt) {
      g.fillStyle = L.belt; g.fillRect(B.x + 0.3, 50, B.w - 0.6, 2.6); g.strokeStyle = INK; g.lineWidth = 0.6; g.strokeRect(B.x + 0.3, 50, B.w - 0.6, 2.6);
      rr(g, 1.2, 51.5, 2.2, 8.5, 1, 1); fillInk(g, L.belt, 0.6);
    }
    if (L.patch) { rr(g, -3.5, 58, 5.5, 4.5, 0.8, 0.8); fillInk(g, L.trim ?? '#d9cfb8', 0.55); }
    if (L.beard) { g.beginPath(); g.moveTo(1, B.y + 2); g.lineTo(2.5, B.y + 23); g.strokeStyle = 'rgba(0,0,0,0)'; }
  }
  if (L.armor) { g.fillStyle = L.belt ?? '#3a2a20'; g.fillRect(B.x + 0.3, 55, B.w - 0.6, 2.4); }

  // arms
  const arms: [number, Arm][] = [[-1, P.armL ?? { a: 8 }], [1, P.armR ?? { a: 8 }]];
  for (const [side, A] of arms) {
    const sx = side * 11, sy = SHOULDER_Y;
    const [hx, hy] = limb(g, sx, sy, A.a, 34, A.e ?? 0, side);
    g.beginPath(); g.arc(hx, hy, 2.7, 0, Math.PI * 2); fillInk(g, L.skin, 1);
    if (P.holdBag && side === 1) { rr(g, hx - 3.5, hy + 1, 7, 7.5, 2, 2); fillInk(g, '#f4f1e8', 0.8); }
  }

  // head
  g.save(); g.translate(0, 28); g.rotate(rad(P.headTilt ?? 0)); g.translate(0, -28);
  drawHead(g, L, P);
  g.restore();
  g.restore();
};

export const drawHead = (g: CanvasRenderingContext2D, L: Look, P: Pose) => {
  const H = HEAD;
  // things behind the head
  if (L.hair === 'oldman') { g.beginPath(); g.arc(0, -3.2, 3.6, 0, Math.PI * 2); fillInk(g, L.hairColor!, 1.2); }
  if (L.hair === 'bun' || L.hair === 'band') { g.beginPath(); g.arc(0, -2.8, 4.3, 0, Math.PI * 2); fillInk(g, L.hairColor!, 1.2); }
  if (L.hair === 'womanbun') { g.beginPath(); g.arc(-12.5, 9, 4.8, 0, Math.PI * 2); fillInk(g, L.hairColor!, 1.1); }
  if (L.hair === 'helmet') { g.beginPath(); g.moveTo(0, -1); g.lineTo(0, -6); g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); g.beginPath(); g.arc(0, -6.5, 2.2, 0, Math.PI * 2); fillInk(g, '#b3262b', 0.9); }

  rr(g, H.x, H.y, H.w, H.h, 9.5, 8.5);
  g.save(); g.clip();
  g.fillStyle = L.skin; g.fillRect(H.x - 1, H.y - 1, H.w + 2, H.h + 2);
  const sh = g.createLinearGradient(H.x, 0, H.x + H.w, 0); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(60,30,10,0.12)');
  g.fillStyle = sh; g.fillRect(H.x, H.y, H.w, H.h);
  // hair caps inside the head silhouette
  if (L.hair === 'oldman') { g.fillStyle = L.hairColor!; g.beginPath(); g.ellipse(0, 0.5, 15, 8.2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(200,190,170,0.35)'; g.fillRect(H.x, 6.6, H.w, 1); }
  if (L.hair === 'bun' || L.hair === 'band' || L.hair === 'short') { g.fillStyle = L.hairColor!; g.beginPath(); g.ellipse(0, 0.8, 16, L.hair === 'short' ? 9.5 : 8.5, 0, 0, Math.PI * 2); g.fill(); }
  if (L.hair === 'bob' || L.hair === 'womanbun') { g.fillStyle = L.hairColor!; g.beginPath(); g.ellipse(0, 1, 16, 10, 0, 0, Math.PI * 2); g.fill(); if (L.hair === 'bob') { g.fillRect(H.x - 1, 3, 4, 15); g.fillRect(H.x + H.w - 3, 3, 4, 15); } }
  g.restore();
  rr(g, H.x, H.y, H.w, H.h, 9.5, 8.5); ink(g, LW * 1.05);
  // hats on top
  if (L.hair === 'cap') { g.beginPath(); g.ellipse(0, 2.5, 13.5, 5.5, 0, Math.PI, 0); g.lineTo(13.5, 4); g.lineTo(-13.5, 4); g.closePath(); fillInk(g, L.hatColor!, 1.1); }
  if (L.hair === 'furhat') { rr(g, -12, -4.5, 24, 9.5, 4.5, 2.5); fillInk(g, L.hatColor!, 1.1); g.strokeStyle = 'rgba(90,40,10,0.5)'; g.lineWidth = 0.6; for (let i = -10; i <= 10; i += 3) { g.beginPath(); g.moveTo(i, -3); g.lineTo(i + 1, 4); g.stroke(); } }
  if (L.hair === 'band') { g.beginPath(); g.moveTo(H.x + 0.5, 7.2); g.lineTo(H.x + H.w - 0.5, 7.2); g.lineTo(H.x + H.w - 0.4, 10); g.lineTo(H.x + 0.4, 10); g.closePath(); fillInk(g, L.hatColor!, 0.8); g.beginPath(); g.moveTo(H.x + H.w - 1, 8.5); g.lineTo(H.x + H.w + 3.5, 7.5); g.lineTo(H.x + H.w + 3, 10.5); g.closePath(); fillInk(g, L.hatColor!, 0.7); }
  if (L.hair === 'helmet') { g.beginPath(); g.moveTo(-14.5, 9.5); g.quadraticCurveTo(-15, -2, 0, -2); g.quadraticCurveTo(15, -2, 14.5, 9.5); g.closePath(); fillInk(g, L.hatColor!, 1.1); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-9, 1, 4, 5); g.beginPath(); g.moveTo(-14.5, 9.5); g.lineTo(14.5, 9.5); g.lineWidth = 1.2; ink(g, 1.2); }
  if (L.hair === 'oldman') { g.beginPath(); g.ellipse(0, 0.5, 15, 8.2, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.strokeStyle = 'rgba(0,0,0,0)'; }

  drawFace(g, L, P);
};

const drawFace = (g: CanvasRenderingContext2D, L: Look, P: Pose) => {
  const eyes = P.eyes ?? 'dot', look = (P.look ?? 0) * 1.4;
  const ey = 15.5, ex = 5.6;
  // blush
  if (P.blush !== false) { for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 8.6, 19.6, 3, 1.9, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(240,130,120,0.45)'; g.fill(); } }
  // brows
  const brows = P.brows ?? (L.hair === 'oldman' ? 'flat' : 'none');
  g.strokeStyle = INK; g.lineWidth = 1.05; g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const bx = s * ex, by = ey - 4.3;
    g.beginPath();
    if (brows === 'flat') { g.moveTo(bx - 2.4, by); g.lineTo(bx + 2.4, by); }
    if (brows === 'raised' || brows === 'arch') { g.moveTo(bx - 2.6, by); g.quadraticCurveTo(bx, by - (brows === 'raised' ? 2.6 : 1.6), bx + 2.6, by); }
    if (brows === 'sad') { g.moveTo(bx - 2.4 * s, by - 1.4); g.lineTo(bx + 2.4 * s, by + 0.6); g.moveTo(bx + 2.4 * s, by + 0.6); }
    if (brows === 'angry') { g.moveTo(bx + 2.6 * s, by + 1.3); g.lineTo(bx - 2.4 * s, by - 0.9); }
    if (brows !== 'none') g.stroke();
  }
  // eyes
  for (const s of [-1, 1]) {
    const x = s * ex + look, y = ey;
    g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 1;
    if (eyes === 'dot' || eyes === 'side') { g.beginPath(); g.ellipse(x, y, 1.15, 1.6, 0, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'sleepy') { g.beginPath(); g.moveTo(x - 2.6, y - 0.4); g.lineTo(x + 2.6, y - 0.4); g.stroke(); g.beginPath(); g.ellipse(x, y + 0.5, 1.15, 0.95, 0, 0, Math.PI); g.fill(); }
    if (eyes === 'happy') { g.beginPath(); g.arc(x, y + 0.8, 2, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 1.1; g.stroke(); }
    if (eyes === 'closed') { g.beginPath(); g.arc(x, y - 0.6, 2, Math.PI * 0.1, Math.PI * 0.9); g.lineWidth = 1.1; g.stroke(); }
    if (eyes === 'wide') { g.beginPath(); g.ellipse(x, y, 2.4, 2.8, 0, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 0.9; g.stroke(); g.beginPath(); g.arc(x + look * 0.3, y + 0.3, 1.1, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); }
    if (eyes === 'star') { star(g, x, y, 3.9, 5, 0.5); g.fillStyle = '#f6d54a'; g.fill(); g.lineWidth = 0.8; g.stroke(); }
    if (eyes === 'sad') { g.beginPath(); g.ellipse(x, y + 0.3, 1.1, 1.45, 0, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'angry') { g.beginPath(); g.ellipse(x, y + 0.5, 1.15, 1.2, 0, 0, Math.PI * 2); g.fill(); }
    if (eyes === 'dizzy') { g.beginPath(); g.moveTo(x - 1.8, y - 1.8); g.lineTo(x + 1.8, y + 1.8); g.moveTo(x + 1.8, y - 1.8); g.lineTo(x - 1.8, y + 1.8); g.stroke(); }
  }
  // mouth
  const m = P.mouth ?? 'line', open = P.open ?? 0.6, my = 21.8;
  g.strokeStyle = INK; g.lineWidth = 1.05;
  if (L.beard) { drawBeard(g, m, open); return; }
  g.beginPath();
  if (m === 'line') { g.moveTo(-1.8, my); g.lineTo(1.8, my); g.stroke(); }
  if (m === 'flat') { g.moveTo(-2.6, my); g.lineTo(2.6, my); g.stroke(); }
  if (m === 'smile') { g.arc(0, my - 1.5, 2.6, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
  if (m === 'frown') { g.arc(0, my + 2, 2.4, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  if (m === 'wavy') { g.moveTo(-2.6, my); g.quadraticCurveTo(-1.3, my - 1, 0, my); g.quadraticCurveTo(1.3, my + 1, 2.6, my); g.stroke(); }
  if (m === 'o') { g.ellipse(0, my, 1.3, 1.6 * (0.6 + open * 0.6), 0, 0, Math.PI * 2); g.fillStyle = '#5a1f1a'; g.fill(); g.lineWidth = 0.8; g.stroke(); }
  if (m === 'open' || m === 'grin') {
    const w = m === 'grin' ? 4 : 3, h = 1 + open * 3;
    g.moveTo(-w, my - 0.8); g.quadraticCurveTo(0, my - 0.8 + (m === 'grin' ? 0.6 : 0), w, my - 0.8); g.quadraticCurveTo(0, my + h * 1.4, -w, my - 0.8);
    g.closePath(); g.fillStyle = '#6a1e1c'; g.fill(); g.lineWidth = 0.9; g.stroke();
    g.save(); g.clip(); g.beginPath(); g.ellipse(0, my + h * 1.05, w * 0.55, h * 0.45, 0, 0, Math.PI * 2); g.fillStyle = '#e0605a'; g.fill(); g.restore();
  }
};

/** The old man's moustache + long white beard (the mouth sits under the moustache). */
const drawBeard = (g: CanvasRenderingContext2D, m: Mouth, open: number) => {
  const my = 21.2;
  if (m === 'open' || m === 'o' || m === 'grin') {
    g.beginPath(); g.ellipse(0, my + 0.9, 2.2, 0.8 + open * 1.6, 0, 0, Math.PI * 2); g.fillStyle = '#5a1f1a'; g.fill(); g.lineWidth = 0.8; g.strokeStyle = INK; g.stroke();
  }
  // beard: long tapered shape down the chest with a forked tip
  g.beginPath();
  g.moveTo(-4.2, 22.5); g.quadraticCurveTo(-5.5, 36, -2.8, 50); g.lineTo(-1.2, 47.5); g.lineTo(0.2, 51.5); g.lineTo(1.6, 47.8); g.lineTo(3.2, 50.5);
  g.quadraticCurveTo(5.5, 36, 4.2, 22.5); g.closePath();
  g.fillStyle = '#fbfaf6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.1; g.stroke();
  g.beginPath(); g.moveTo(0.4, 26); g.lineTo(0.9, 44); g.strokeStyle = 'rgba(160,150,135,0.7)'; g.lineWidth = 0.6; g.stroke();
  // moustache: two drooping arcs
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(0, 19.4); g.quadraticCurveTo(s * 5.5, 18.6, s * 6.4, 24.8);
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 2.7; g.stroke(); g.strokeStyle = '#fbfaf6'; g.lineWidth = 1.5; g.stroke();
  }
  if (m === 'smile') { g.beginPath(); g.arc(0, my - 0.6, 1.8, Math.PI * 0.2, Math.PI * 0.8); g.strokeStyle = INK; g.lineWidth = 0.9; g.stroke(); }
  if (m === 'line' || m === 'flat' || m === 'frown') { g.beginPath(); g.moveTo(-1.6, my + 0.6); g.lineTo(1.6, my + 0.6); g.strokeStyle = INK; g.lineWidth = 0.9; g.stroke(); }
};

/** Extras that float around the head: anger marks, sweat drop, sparkles, dizzy stars. t = frame for wobble. */
export const drawFx = (g: CanvasRenderingContext2D, P: Pose, t: number) => {
  if (P.anger) {
    g.save(); g.translate(11, 2); const s = 0.85 + 0.15 * Math.sin(t * 0.5); g.scale(s * P.anger, s * P.anger);
    g.strokeStyle = '#d4231e'; g.lineWidth = 1.5; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.save(); g.rotate((i * Math.PI) / 2); g.beginPath(); g.moveTo(1.2, 1.2); g.quadraticCurveTo(1.5, 3.4, 3.6, 3.6); g.moveTo(1.2, 1.2); g.quadraticCurveTo(3.4, 1.5, 3.6, 3.6); g.stroke(); g.restore(); }
    g.restore();
  }
  if (P.sweat) { g.beginPath(); g.moveTo(13.5, 4); g.quadraticCurveTo(16.5, 9, 14.5, 10.5); g.quadraticCurveTo(12, 10.5, 13.5, 4); g.fillStyle = '#a9d8f2'; g.fill(); ink(g, 0.6); }
  if (P.sparkles) {
    const pts: [number, number, number][] = [[-22, 4, 3.4], [21, 8, 3], [-19, 22, 2.2], [24, -4, 2.4]];
    pts.forEach(([x, y, r], i) => { const k = 0.75 + 0.25 * Math.sin(t * 0.35 + i * 1.7); sparkle(g, x, y, r * k * P.sparkles!); });
  }
  if (P.dizzy) {
    for (let i = 0; i < 3; i++) { const a = t * 0.18 + (i * Math.PI * 2) / 3; star(g, Math.cos(a) * 12, -3 + Math.sin(a) * 3, 2.2); g.fillStyle = '#f6d54a'; g.fill(); ink(g, 0.6); }
  }
};

/* ───────────── poses ───────────── */
export const walk = (t: number, speed = 1): Pose => {
  const s = Math.sin(t * 0.22 * speed);
  return { legL: 14 * s, legR: -14 * s, armL: { a: 10 - 12 * s, e: 0 }, armR: { a: 10 + 12 * s, e: 0 }, bob: -Math.abs(Math.cos(t * 0.22 * speed)) * 1.2 };
};
export const idle = (t: number, seed = 0): Pose => ({ bob: Math.sin(t * 0.05 + seed) * 0.35, armL: { a: 7 + Math.sin(t * 0.04 + seed) }, armR: { a: 7 + Math.sin(t * 0.045 + seed + 1) } });
