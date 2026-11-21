/**
 * Flags and unit icons drawn in code (canvas), so nothing is copied from anywhere. 1967 versions: Egypt flew the
 * United Arab Republic flag (red, white, black, two green stars) and Syria the 1963 flag (three green stars).
 */
export type Side = 'il' | 'eg' | 'jo' | 'sy' | 'lb' | 'un' | 'in' | 'su' | 'br';
type C2 = CanvasRenderingContext2D;

const star = (c: C2, x: number, y: number, r: number, n = 5, inner = 0.4, rot = -Math.PI / 2) => {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n, rr = i % 2 ? r * inner : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath(); c.fill();
};
const bands = (c: C2, x: number, y: number, w: number, h: number, cols: string[]) => {
  cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(x, y + (h * i) / cols.length, w, h / cols.length + 0.5); });
};

/** Draw a flag into the rect (x, y, w, h). */
export const drawFlag = (c: C2, side: Side, x: number, y: number, w: number, h: number) => {
  c.save();
  c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (side === 'il') {
    c.fillStyle = '#fff'; c.fillRect(x, y, w, h);
    c.fillStyle = '#0038b8'; c.fillRect(x, y + h * 0.1, w, h * 0.15); c.fillRect(x, y + h * 0.75, w, h * 0.15);
    c.strokeStyle = '#0038b8'; c.lineWidth = h * 0.045;
    const cx = x + w / 2, cy = y + h / 2, r = h * 0.2;
    for (const s of [1, -1]) {
      c.beginPath();
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 * s + (i * 2 * Math.PI) / 3; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * s * s); }
      c.closePath(); c.stroke();
    }
  } else if (side === 'eg' || side === 'sy') {
    bands(c, x, y, w, h, ['#ce1126', '#ffffff', '#000000']);
    c.fillStyle = '#007a3d';
    const n = side === 'eg' ? 2 : 3;
    for (let i = 0; i < n; i++) star(c, x + w * (n === 2 ? 0.36 + i * 0.28 : 0.26 + i * 0.24), y + h / 2, h * 0.13);
  } else if (side === 'jo') {
    bands(c, x, y, w, h, ['#000000', '#ffffff', '#007a3d']);
    c.fillStyle = '#ce1126'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.5, y + h / 2); c.lineTo(x, y + h); c.closePath(); c.fill();
    c.fillStyle = '#fff'; star(c, x + w * 0.17, y + h / 2, h * 0.09, 7, 0.45);
  } else if (side === 'lb') {
    bands(c, x, y, w, h, ['#ed1c24', '#ffffff', '#ffffff', '#ed1c24']);
    c.fillStyle = '#00a651'; c.beginPath(); c.moveTo(x + w / 2, y + h * 0.28); c.lineTo(x + w * 0.62, y + h * 0.68); c.lineTo(x + w * 0.38, y + h * 0.68); c.closePath(); c.fill();
  } else if (side === 'un') {
    c.fillStyle = '#4b92db'; c.fillRect(x, y, w, h);
    c.strokeStyle = '#fff'; c.lineWidth = h * 0.05; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.28, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x + w / 2 - h * 0.28, y + h / 2); c.lineTo(x + w / 2 + h * 0.28, y + h / 2); c.stroke();
    c.beginPath(); c.moveTo(x + w / 2, y + h / 2 - h * 0.28); c.lineTo(x + w / 2, y + h / 2 + h * 0.28); c.stroke();
  } else if (side === 'in') {
    bands(c, x, y, w, h, ['#ff9933', '#ffffff', '#138808']);
    c.strokeStyle = '#000080'; c.lineWidth = Math.max(1, h * 0.018);
    const cx = x + w / 2, cy = y + h / 2, r = h * 0.13;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 24; i++) { const a = (i * Math.PI) / 12; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke(); }
  } else if (side === 'su') {
    c.fillStyle = '#cc0000'; c.fillRect(x, y, w, h);
    c.fillStyle = '#ffd700'; star(c, x + w * 0.16, y + h * 0.2, h * 0.07);
    c.strokeStyle = '#ffd700'; c.lineWidth = h * 0.045;
    c.beginPath(); c.arc(x + w * 0.16, y + h * 0.45, h * 0.11, Math.PI * 1.1, Math.PI * 0.35); c.stroke();
    c.beginPath(); c.moveTo(x + w * 0.1, y + h * 0.58); c.lineTo(x + w * 0.22, y + h * 0.36); c.stroke();
  } else if (side === 'br') {
    c.fillStyle = '#009c3b'; c.fillRect(x, y, w, h);
    c.fillStyle = '#ffdf00'; c.beginPath(); c.moveTo(x + w * 0.5, y + h * 0.1); c.lineTo(x + w * 0.92, y + h / 2); c.lineTo(x + w * 0.5, y + h * 0.9); c.lineTo(x + w * 0.08, y + h / 2); c.closePath(); c.fill();
    c.fillStyle = '#002776'; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.22, 0, Math.PI * 2); c.fill();
  }
  c.restore();
};

export type Kind = 'inf' | 'arm' | 'air' | 'art' | 'ship';
/** A white unit icon centred at (x, y), about s px tall. */
export const drawIcon = (c: C2, kind: Kind, x: number, y: number, s: number, col = '#f4f1e8') => {
  c.save(); c.translate(x, y); c.scale(s / 100, s / 100); c.fillStyle = col; c.strokeStyle = col;
  if (kind === 'inf') {
    // a soldier aiming a rifle (side view)
    c.beginPath(); c.arc(-6, -34, 9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(-16, -24); c.lineTo(6, -24); c.lineTo(10, 8); c.lineTo(-14, 8); c.closePath(); c.fill();
    c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-10, 6); c.lineTo(-20, 48); c.stroke();
    c.beginPath(); c.moveTo(4, 6); c.lineTo(14, 48); c.stroke();
    c.beginPath(); c.moveTo(-4, -18); c.lineTo(26, -26); c.stroke();
    c.lineWidth = 5; c.beginPath(); c.moveTo(-6, -24); c.lineTo(48, -30); c.stroke();
  } else if (kind === 'arm') {
    // a tank (side view)
    c.beginPath(); c.roundRect(-46, 0, 92, 24, 12); c.fill();
    c.beginPath(); c.moveTo(-38, 0); c.lineTo(-30, -14); c.lineTo(32, -14); c.lineTo(40, 0); c.closePath(); c.fill();
    c.beginPath(); c.roundRect(-18, -30, 34, 18, 6); c.fill();
    c.fillRect(14, -26, 44, 6);
  } else if (kind === 'air') {
    // a delta-wing jet (top view)
    c.beginPath(); c.moveTo(0, -48); c.lineTo(7, -18); c.lineTo(40, 26); c.lineTo(40, 34); c.lineTo(8, 26); c.lineTo(12, 44); c.lineTo(-12, 44);
    c.lineTo(-8, 26); c.lineTo(-40, 34); c.lineTo(-40, 26); c.lineTo(-7, -18); c.closePath(); c.fill();
  } else if (kind === 'art') {
    // a field gun
    c.beginPath(); c.arc(-10, 22, 16, 0, Math.PI * 2); c.fill();
    c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, 14); c.lineTo(44, -24); c.stroke();
    c.lineWidth = 7; c.beginPath(); c.moveTo(-10, 22); c.lineTo(-46, 40); c.stroke();
  } else if (kind === 'ship') {
    c.beginPath(); c.moveTo(-50, 4); c.lineTo(50, 4); c.lineTo(38, 26); c.lineTo(-42, 26); c.closePath(); c.fill();
    c.fillRect(-28, -14, 30, 18); c.fillRect(-20, -30, 8, 16);
  }
  c.restore();
};
