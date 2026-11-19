// Adult cartoon people (long-form horror-story style): ~7 heads tall, flat colours + darker cel shade, thin dark outlines,
// big round white eyes with small pupils, simple nose line, defined hair, clothes with folds. Drawn in code every frame,
// so blinking, talking, head turns, walking/running and props are just numbers. Canvas: 768 x 1536 (feet at the bottom).

export type Hair = "sidepart" | "messy" | "long" | "bob" | "ponytail" | "stringy" | "bald" | "buzz";
export type Top = "jacket_tie" | "tee" | "blouse" | "flannel" | "torn" | "workjacket" | "sweater";
export type Bottom = "jeans" | "chinos" | "skirt" | "shorts" | "torn";
export type PersonSpec = {
  skin: string; hair: Hair; hairColor: string; top: Top; topColor: string; top2?: string; bottom: Bottom; bottomColor: string; shoes?: string;
  female?: boolean; height?: number; build?: number; eyeBags?: boolean; pale?: boolean; stubble?: boolean;
};
export type Arm = "down" | "hips" | "point" | "wave" | "hold" | "flashlight" | "toolbox" | "eat" | "cross" | "reach" | "up" | "knock";
export type PersonPose = {
  t: number; walk?: number; run?: number; turn?: number; // turn -1..1 (face looks left..right)
  eyes?: "normal" | "wide" | "narrow" | "closed" | "stare" | "worried" | "angry";
  mouth?: "closed" | "smile" | "open" | "frown" | "o" | "chew" | "grin";
  talk?: boolean; armL?: Arm; armR?: Arm; sit?: boolean; lean?: number; blink?: boolean; headTilt?: number;
};

const INK = "#1a1418";
const shade = (col: string, k: number) => {
  let c: number[];
  if (col.startsWith("#")) { const n = parseInt(col.slice(1), 16); c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  else c = (col.match(/\d+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number);
  const o = c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return "#" + o.map((v) => v.toString(16).padStart(2, "0")).join("");
};
const poly = (g: CanvasRenderingContext2D, pts: number[][], fill: string, lw = 4) => {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath();
  g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke();
};
const seg = (g: CanvasRenderingContext2D, a: number[], b: number[], w: number, fill: string) => {
  // a thick limb segment (rounded capsule) with outline
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
  g.beginPath(); g.moveTo(a[0] + nx, a[1] + ny); g.lineTo(b[0] + nx, b[1] + ny); g.arc(b[0], b[1], w / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, false);
  g.lineTo(a[0] - nx, a[1] - ny); g.arc(a[0], a[1], w / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, false); g.closePath();
  g.fillStyle = fill; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
};
const limbPath = (g: CanvasRenderingContext2D, pts: number[][], w: number, fill: string) => {
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); };
  g.lineCap = "round"; g.lineJoin = "round";
  path(); g.strokeStyle = INK; g.lineWidth = w + 8; g.stroke();
  path(); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
};
const hand = (g: CanvasRenderingContext2D, x: number, y: number, skin: string, ang = 0) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = skin; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.ellipse(-17, -2, 8, 14, -0.7, 0, Math.PI * 2); g.fill(); g.stroke(); // thumb
  g.beginPath(); g.roundRect(-16, -10, 32, 40, 14); g.fill(); g.stroke();
  g.lineWidth = 2.5; for (const fx of [-6, 2, 9]) { g.beginPath(); g.moveTo(fx, 20); g.lineTo(fx, 29); g.stroke(); }
  g.restore();
};

export function drawPerson(g: CanvasRenderingContext2D, s: PersonSpec, p: PersonPose) {
  g.clearRect(0, 0, 768, 1536);
  const H = 1380 * (s.height ?? 1), B = s.build ?? 1, cx = 384, ground = 1510;
  const run = p.run ?? 0, walk = run ? 0 : (p.walk ?? 0), mov = run || walk;
  const ph = p.t * (run ? 11 : 7);
  const bob = mov ? Math.abs(Math.sin(ph)) * (run ? 16 : 8) : Math.sin(p.t * 1.8) * 2;
  const lean = (p.lean ?? 0) + (run ? 0.12 : 0);
  const skin = s.pale ? shade(s.skin, 0.92) : s.skin, skinD = shade(skin, 0.8);
  const head = H / 5.9, hipY = ground - H * 0.47 - bob, shY = ground - H * 0.8 - bob, neckY = shY - head * 0.12;
  const hw = H * 0.12 * B * (s.female ? 0.88 : 1), hipW = H * 0.085 * B * (s.female ? 1.05 : 1);
  const turn = p.turn ?? 0, tilt = p.headTilt ?? 0;
  g.save(); g.translate(cx, hipY); g.rotate(lean); g.translate(-cx, -hipY);

  // ---- legs ----
  const legW = H * 0.055 * B, legCol = s.bottom === "skirt" || s.bottom === "shorts" ? skin : s.bottomColor;
  const leg = (side: number, front: boolean) => {
    const sw = mov ? Math.sin(ph + (side > 0 ? Math.PI : 0)) : 0;
    const hx = cx + side * hipW * 0.55, knee = [hx + sw * (run ? 70 : 34) + (p.sit ? 90 : 0), p.sit ? hipY + 40 : hipY + H * 0.24 - Math.max(0, -sw) * (run ? 30 : 10)];
    const foot = [hx + sw * (run ? 120 : 60) + (p.sit ? 110 : 0), ground - Math.max(0, Math.cos(ph + (side > 0 ? Math.PI : 0))) * (run ? 50 : 14) * (mov ? 1 : 0)];
    if (p.sit) foot[1] = ground;
    const col = front ? legCol : shade(legCol, 0.82);
    limbPath(g, [[hx, hipY], knee, foot], legW, col);
    if (s.bottom === "shorts") limbPath(g, [[hx, hipY - 10], [(hx * 0.45 + knee[0] * 0.55), (hipY * 0.45 + knee[1] * 0.55)]], legW * 1.35, front ? s.bottomColor : shade(s.bottomColor, 0.82));
    g.beginPath(); g.ellipse(foot[0] + 14, foot[1] - 10, 30, 14, 0, 0, Math.PI * 2); g.fillStyle = s.shoes ?? "#2a2226"; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  };
  leg(-1, false); leg(1, true);
  if (s.bottom === "skirt") poly(g, [[cx - hipW * 0.9, hipY - 30], [cx + hipW * 0.9, hipY - 30], [cx + hipW * 1.25, hipY + H * 0.16], [cx - hipW * 1.25, hipY + H * 0.16]], s.bottomColor);
  else poly(g, [[cx - hipW, hipY - 40], [cx + hipW, hipY - 40], [cx + hipW * 1.02, hipY + 20], [cx - hipW * 1.02, hipY + 20]], s.bottomColor);

  // ---- arms ----
  const armLen = H * 0.34, armW = H * 0.05 * B;
  const sleeve = s.top === "tee" || s.top === "torn" ? "short" : "long";
  const armPts = (side: number, a: Arm) => {
    const sx = cx + side * hw * 0.92, sy = shY + 18;
    const sw = mov ? Math.sin(ph + (side < 0 ? 0 : Math.PI)) * (run ? 0.9 : 0.45) : Math.sin(p.t * 1.8 + side) * 0.03;
    let a1 = 0.08 * side + sw, a2 = 0.05 * side;                 // angles from straight down (rad, +x is outward for side=1)
    switch (a) {
      case "hips": a1 = 0.75 * side; a2 = -1.9 * side; break;
      case "point": a1 = 1.35 * side; a2 = 0.1 * side; break;
      case "wave": a1 = 2.2 * side; a2 = -0.5 * side + Math.sin(p.t * 8) * 0.3; break;
      case "up": a1 = 2.6 * side; a2 = -0.2 * side; break;
      case "hold": a1 = 0.35 * side; a2 = -1.5 * side; break;
      case "flashlight": a1 = 0.9 * side; a2 = -0.9 * side; break;
      case "toolbox": a1 = 0.12 * side; a2 = 0.02 * side; break;
      case "eat": a1 = 0.4 * side; a2 = -2.5 * side + Math.max(0, Math.sin(p.t * 7)) * 0.5 * side; break;
      case "cross": a1 = 0.45 * side; a2 = -2.1 * side; break;
      case "reach": a1 = 1.15 * side; a2 = -0.25 * side; break;
      case "knock": a1 = 1.3 * side; a2 = -1.2 * side + Math.max(0, Math.sin(p.t * 14)) * 0.5 * side; break;
    }
    const e = [sx + Math.sin(a1) * armLen * 0.5, sy + Math.cos(a1) * armLen * 0.5];
    const h = [e[0] + Math.sin(a1 + a2) * armLen * 0.5, e[1] + Math.cos(a1 + a2) * armLen * 0.5];
    return { s: [sx, sy], e, h };
  };
  const drawArm = (side: number, a: Arm, front: boolean) => {
    const A = armPts(side, a), top = front ? s.topColor : shade(s.topColor, 0.82), sk = front ? skin : skinD;
    if (sleeve === "short") { limbPath(g, [A.s, A.e, A.h], armW * 0.82, sk); limbPath(g, [A.s, [(A.s[0] * 0.55 + A.e[0] * 0.45), (A.s[1] * 0.55 + A.e[1] * 0.45)]], armW * 1.25, top); }
    else limbPath(g, [A.s, A.e, A.h], armW, top);
    hand(g, A.h[0], A.h[1], sk, Math.atan2(A.h[0] - A.e[0], A.e[1] - A.h[1]) * -0.3);
    // props
    if (a === "flashlight") { g.save(); g.translate(A.h[0], A.h[1]); g.rotate(-0.4 * side); g.fillStyle = "#3a3a42"; g.fillRect(-9, -50, 18, 60); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-9, -50, 18, 60); g.fillStyle = "#fff6c8"; g.fillRect(-12, -60, 24, 12); g.strokeRect(-12, -60, 24, 12); g.restore(); }
    if (a === "toolbox") { g.save(); g.translate(A.h[0], A.h[1] + 30); poly(g, [[-70, 0], [70, 0], [70, 70], [-70, 70]], "#b8322a"); g.fillStyle = "#8a2420"; g.fillRect(-70, 20, 140, 8); g.restore(); }
    if (a === "eat") { g.save(); g.translate(A.h[0], A.h[1]); g.strokeStyle = "#c9ccd2"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 0); g.lineTo(side * 26, -34); g.stroke(); g.fillStyle = "#c97a4a"; g.beginPath(); g.ellipse(side * 28, -40, 12, 9, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    return A;
  };
  const aL = p.armL ?? "down", aR = p.armR ?? "down";
  const front = (a: Arm) => ["hold", "cross", "eat", "flashlight"].includes(a);
  if (!front(aL)) drawArm(-1, aL, false);
  if (!front(aR)) drawArm(1, aR, true);

  // ---- torso ----
  const tw = hw, chestY = shY, waist = hipY - 40;
  const torso = [[cx - tw, chestY + 10], [cx - tw * 0.4, chestY - 8], [cx + tw * 0.4, chestY - 8], [cx + tw, chestY + 10], [cx + hipW * 1.08, waist + 30], [cx - hipW * 1.08, waist + 30]];
  if (s.top === "torn") { torso[4] = [cx + hipW * 1.15, waist + 70]; torso[5] = [cx - hipW * 1.15, waist + 70]; }
  const torsoPath = () => { g.beginPath(); g.moveTo(torso[5][0], torso[5][1]); g.lineTo(torso[0][0] + 4, torso[0][1] + 40); g.quadraticCurveTo(torso[0][0] - 4, chestY - 10, torso[1][0], torso[1][1]);
    g.lineTo(torso[2][0], torso[2][1]); g.quadraticCurveTo(torso[3][0] + 4, chestY - 10, torso[3][0] - 4, torso[3][1] + 40); g.lineTo(torso[4][0], torso[4][1]); g.closePath(); };
  torsoPath(); g.fillStyle = s.topColor; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  g.save(); torsoPath(); g.clip();
  g.fillStyle = shade(s.topColor, 0.78); g.fillRect(cx + tw * 0.35, chestY - 20, tw, waist - chestY + 120); // cel shade on the right side
  g.restore();
  g.lineWidth = 3; g.strokeStyle = INK;
  if (s.top === "jacket_tie") {
    poly(g, [[cx - tw * 0.32, chestY - 6], [cx, chestY + 70], [cx + tw * 0.32, chestY - 6]], s.top2 ?? "#c9ccd2", 3);
    poly(g, [[cx - 9, chestY + 4], [cx + 9, chestY + 4], [cx + 13, chestY + 160], [cx, chestY + 180], [cx - 13, chestY + 160]], "#8a8a96", 3);
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 4; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(cx - 10, chestY + 20 + k * 26); g.lineTo(cx + 12, chestY + 30 + k * 26); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - tw * 0.32, chestY - 6); g.lineTo(cx - 30, waist + 30); g.moveTo(cx + tw * 0.32, chestY - 6); g.lineTo(cx + 30, waist + 30); g.stroke();
    poly(g, [[cx - tw * 0.72, chestY + 70], [cx - tw * 0.42, chestY + 70], [cx - tw * 0.42, chestY + 86], [cx - tw * 0.72, chestY + 86]], "#e8e6ee", 2);
  } else if (s.top === "blouse") {
    poly(g, [[cx - 40, chestY - 8], [cx - 6, chestY + 34], [cx - 52, chestY + 30]], shade(s.topColor, 1.12), 3);
    poly(g, [[cx + 40, chestY - 8], [cx + 6, chestY + 34], [cx + 52, chestY + 30]], shade(s.topColor, 1.12), 3);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(cx, chestY + 60 + k * 40, 5, 0, 7); g.stroke(); }
  } else if (s.top === "flannel") {
    g.save(); torsoPath(); g.clip();
    g.strokeStyle = "rgba(20,10,10,0.35)"; g.lineWidth = 10; for (let x = cx - tw; x < cx + tw; x += 36) { g.beginPath(); g.moveTo(x, chestY - 20); g.lineTo(x, waist + 80); g.stroke(); } for (let y = chestY; y < waist + 80; y += 36) { g.beginPath(); g.moveTo(cx - tw, y); g.lineTo(cx + tw, y); g.stroke(); }
    g.restore(); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, chestY); g.lineTo(cx, waist + 30); g.stroke();
  } else if (s.top === "workjacket") {
    g.beginPath(); g.moveTo(cx, chestY); g.lineTo(cx, waist + 30); g.stroke();
    for (const sx of [-1, 1]) poly(g, [[cx + sx * tw * 0.65, chestY + 70], [cx + sx * tw * 0.2, chestY + 70], [cx + sx * tw * 0.2, chestY + 120], [cx + sx * tw * 0.65, chestY + 120]], shade(s.topColor, 0.9), 2);
  } else if (s.top === "torn") {
    g.fillStyle = shade(s.topColor, 0.7); for (const [x, y] of [[-40, 90], [30, 160], [-20, 230], [50, 60]]) { g.beginPath(); g.ellipse(cx + x, chestY + y, 9, 14, 0.3, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx - 10, chestY + 50 + k * 50, 6, 0, 7); g.stroke(); }
  }
  if (!front(aL) || true) { if (front(aL)) drawArm(-1, aL, true); if (front(aR)) drawArm(1, aR, true); }

  // ---- neck + head ----
  const hx = cx + turn * 10, hy = neckY - head * 0.5;
  limbPath(g, [[cx, chestY + 4], [cx, neckY - head * 0.2]], head * 0.3, skinD);
  g.save(); g.translate(hx, hy); g.rotate(tilt);
  const hwid = head * 0.5, hht = head * 0.62;
  // back hair
  const hc = s.hairColor;
  const backHair = (len: number, wid: number) => { g.beginPath(); g.moveTo(-hwid * wid, -hht * 0.3); g.bezierCurveTo(-hwid * (wid + 0.15), hht * len * 0.6, -hwid * (wid - 0.1), hht * len, -hwid * 0.5, hht * len);
    g.lineTo(hwid * 0.5, hht * len); g.bezierCurveTo(hwid * (wid - 0.1), hht * len, hwid * (wid + 0.15), hht * len * 0.6, hwid * wid, -hht * 0.3); g.closePath(); g.fillStyle = shade(hc, 0.8); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); };
  if (s.hair === "long" || s.hair === "stringy") backHair(1.55, 1.18);
  if (s.hair === "bob") backHair(0.75, 1.22);
  if (s.hair === "ponytail") { g.beginPath(); g.ellipse(hwid * 1.05, hht * 0.1, hwid * 0.28, hht * 0.75, -0.25, 0, Math.PI * 2); g.fillStyle = shade(hc, 0.85); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); }
  // ears + face (jaw shape)
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * hwid * 0.98 + turn * -6, 4, 12, 20, 0, 0, Math.PI * 2); g.fillStyle = skinD; g.fill(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke(); }
  g.beginPath(); g.moveTo(-hwid, -hht * 0.45); g.bezierCurveTo(-hwid * 1.02, hht * 0.5, -hwid * 0.55, hht * 0.98, 0 + turn * 8, hht * 1.02); g.bezierCurveTo(hwid * 0.55, hht * 0.98, hwid * 1.02, hht * 0.5, hwid, -hht * 0.45);
  g.bezierCurveTo(hwid * 0.95, -hht * 1.05, -hwid * 0.95, -hht * 1.05, -hwid, -hht * 0.45); g.closePath();
  g.fillStyle = skin; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  g.save(); g.clip(); g.fillStyle = skinD; g.fillRect(hwid * 0.45 + turn * 10, -hht, hwid, hht * 2.2); g.restore();
  if (s.stubble) { g.fillStyle = "rgba(60,40,30,0.25)"; g.beginPath(); g.ellipse(turn * 8, hht * 0.62, hwid * 0.75, hht * 0.38, 0, 0, Math.PI); g.fill(); }
  // eyes
  const blink = p.blink ?? ((p.t * 1000) % 3700 < 130);
  const ex = hwid * 0.38, ey = -hht * 0.08, er = head * 0.1 * (p.eyes === "wide" || p.eyes === "stare" ? 1.15 : 1);
  for (const sd of [-1, 1]) {
    const x = sd * ex + turn * 14;
    if (s.eyeBags) { g.fillStyle = "rgba(60,30,50,0.55)"; g.beginPath(); g.ellipse(x, ey + er * 0.9, er * 1.25, er * 0.65, 0, 0, Math.PI * 2); g.fill(); }
    if (blink || p.eyes === "closed") { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x, ey, er * 0.9, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); continue; }
    g.fillStyle = s.eyeBags ? "#f0d8d8" : "#ffffff"; g.beginPath(); g.ellipse(x, ey, er, er * 1.1, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 3.5; g.strokeStyle = INK; g.stroke();
    const pr = p.eyes === "stare" ? er * 0.22 : er * 0.32;
    g.fillStyle = INK; g.beginPath(); g.arc(x + turn * er * 0.5, ey + (p.eyes === "worried" ? er * 0.1 : 0), pr, 0, Math.PI * 2); g.fill();
    if (p.eyes === "narrow" || p.eyes === "angry") { g.fillStyle = skin; g.fillRect(x - er * 1.2, ey - er * 1.3, er * 2.4, er * 0.8); g.beginPath(); g.moveTo(x - er, ey - er * 0.5); g.lineTo(x + er, ey - er * 0.5); g.lineWidth = 3.5; g.stroke(); }
    // brows
    g.strokeStyle = shade(hc, 0.7); g.lineWidth = 5; g.lineCap = "round"; g.beginPath();
    const by = ey - er * 1.55;
    if (p.eyes === "worried") { g.moveTo(x - sd * er, by - 2); g.lineTo(x + sd * er, by + 8 * -1); }
    else if (p.eyes === "angry") { g.moveTo(x - sd * er, by - 8); g.lineTo(x + sd * er, by + 6); }
    else if (p.eyes === "wide" || p.eyes === "stare") { g.moveTo(x - er, by - 6); g.quadraticCurveTo(x, by - 14, x + er, by - 6); }
    else { g.moveTo(x - er, by); g.quadraticCurveTo(x, by - 6, x + er, by); }
    g.stroke();
  }
  // nose
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(turn * 16 + 4, ey + er * 0.6); g.quadraticCurveTo(turn * 16 + 14, hht * 0.34, turn * 16 - 4, hht * 0.38); g.stroke();
  // mouth
  let m = p.mouth ?? "closed"; if (p.talk) m = Math.sin(p.t * 20) > 0 ? "open" : "closed"; if (m === "chew") m = Math.sin(p.t * 12) > 0 ? "closed" : "o";
  const my = hht * 0.6, mx = turn * 14;
  g.lineWidth = 3.5; g.strokeStyle = INK; g.fillStyle = "#5a1e24"; g.beginPath();
  if (m === "smile") { g.arc(mx, my - 14, 22, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke(); }
  else if (m === "grin") { g.moveTo(mx - 26, my - 4); g.quadraticCurveTo(mx, my + 20, mx + 26, my - 4); g.closePath(); g.fill(); g.stroke(); }
  else if (m === "open") { g.ellipse(mx, my, 14, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  else if (m === "o") { g.ellipse(mx, my, 9, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  else if (m === "frown") { g.arc(mx, my + 14, 18, 1.25 * Math.PI, 1.75 * Math.PI); g.stroke(); }
  else { g.moveTo(mx - 16, my); g.quadraticCurveTo(mx, my + 3, mx + 16, my - 1); g.stroke(); }
  // front hair
  g.fillStyle = hc; g.strokeStyle = INK; g.lineWidth = 4;
  const capTop = -hht * 1.02;
  if (s.hair !== "bald") {
    g.beginPath();
    if (s.hair === "buzz") { g.moveTo(-hwid * 1.0, -hht * 0.4); g.bezierCurveTo(-hwid, capTop - 6, hwid, capTop - 6, hwid * 1.0, -hht * 0.4); g.quadraticCurveTo(0, -hht * 0.7, -hwid, -hht * 0.4); }
    else if (s.hair === "sidepart" || s.hair === "messy") {
      g.moveTo(-hwid * 1.05, -hht * 0.2); g.bezierCurveTo(-hwid * 1.15, capTop - 30, hwid * 1.15, capTop - 34, hwid * 1.05, -hht * 0.25);
      g.quadraticCurveTo(hwid * 0.5, -hht * 0.62, -hwid * 0.25, -hht * 0.55); g.quadraticCurveTo(-hwid * 0.7, -hht * 0.5, -hwid * 1.05, -hht * 0.2);
      if (s.hair === "messy") { for (let k = -2; k <= 2; k++) { g.moveTo(k * 22 - 10, capTop - 20); g.lineTo(k * 22, capTop - 44); g.lineTo(k * 22 + 10, capTop - 20); } }
    } else {
      // long / bob / ponytail / stringy: middle part framing the face
      g.moveTo(-hwid * 1.15, hht * (s.hair === "stringy" ? 0.9 : 0.3)); g.bezierCurveTo(-hwid * 1.25, capTop - 30, hwid * 1.25, capTop - 30, hwid * 1.15, hht * (s.hair === "stringy" ? 0.9 : 0.3));
      g.lineTo(hwid * 0.92, hht * (s.hair === "stringy" ? 0.9 : 0.1)); g.quadraticCurveTo(hwid * 0.78, -hht * 0.6, 0, -hht * 0.72); g.quadraticCurveTo(-hwid * 0.78, -hht * 0.6, -hwid * 0.92, hht * (s.hair === "stringy" ? 0.9 : 0.1));
    }
    g.closePath(); g.fill(); g.stroke();
    if (s.hair === "stringy") { g.strokeStyle = shade(hc, 0.7); g.lineWidth = 3; for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(sd * hwid * (0.75 + k * 0.1), -hht * 0.5); g.lineTo(sd * hwid * (0.95 + k * 0.08), hht * (0.6 + (k % 3) * 0.2)); g.stroke(); } }
    g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 5; g.beginPath(); g.arc(-hwid * 0.15, -hht * 0.45, hwid * 0.55, 1.2 * Math.PI, 1.42 * Math.PI); g.stroke();
  }
  g.restore();
  g.restore();
}
