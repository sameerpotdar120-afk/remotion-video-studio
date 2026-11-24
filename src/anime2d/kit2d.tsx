// 2D anime drawing kit: every body part is a clipped shape with a base colour, cel-shadow shapes, highlight shapes
// and an ink outline drawn on top. Parts are plain SVG groups, so they can be transformed (rigged) for animation.
import React from "react";

export const INK = "#1c1320";
let uid = 0; export const useId = (p: string) => React.useMemo(() => `${p}_${uid++}`, [p]);

export const Part: React.FC<{ d: string; fill: string; shade?: string[]; shadeCol?: string; hi?: string[]; hiCol?: string; line?: number; lineCol?: string; extra?: React.ReactNode; inner?: { d: string; w?: number; col?: string }[]; opacity?: number }> =
  ({ d, fill, shade = [], shadeCol = "rgba(40,20,70,0.38)", hi = [], hiCol = "rgba(255,240,220,0.55)", line = 5, lineCol = INK, extra, inner = [], opacity }) => {
  const id = useId("clip");
  return (
    <g opacity={opacity}>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${id})`}>
        {shade.map((s, i) => <path key={"s" + i} d={s} fill={shadeCol} />)}
        {hi.map((s, i) => <path key={"h" + i} d={s} fill={hiCol} />)}
        {extra}
      </g>
      {inner.map((l, i) => <path key={"i" + i} d={l.d} fill="none" stroke={l.col ?? INK} strokeWidth={l.w ?? 2.5} strokeLinecap="round" strokeLinejoin="round" />)}
      {line ? <path d={d} fill="none" stroke={lineCol} strokeWidth={line} strokeLinejoin="round" strokeLinecap="round" /> : null}
    </g>
  );
};
// a tapered ink stroke (thick in the middle, thin at the ends) along a quadratic curve: the hand-drawn line
export const Stroke: React.FC<{ from: [number, number]; ctrl: [number, number]; to: [number, number]; w: number; col?: string }> = ({ from, ctrl, to, w, col = INK }) => {
  const n = 14; const pts: [number, number][] = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([(1 - t) ** 2 * from[0] + 2 * (1 - t) * t * ctrl[0] + t * t * to[0], (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * ctrl[1] + t * t * to[1]]); }
  const L: string[] = [], R: string[] = [];
  for (let i = 0; i <= n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; const t = i / n; const hw = (w / 2) * Math.sin(Math.PI * t) ** 0.6;
    L.push(`${pts[i][0] - (dy / len) * hw},${pts[i][1] + (dx / len) * hw}`); R.unshift(`${pts[i][0] + (dy / len) * hw},${pts[i][1] - (dx / len) * hw}`); }
  return <path d={`M${L.join(" L")} L${R.join(" L")} Z`} fill={col} />;
};
// paper grain + subtle colour noise over the whole frame
export const Paper: React.FC<{ w: number; h: number; seed?: number; amt?: number }> = ({ w, h, seed = 1, amt = 0.07 }) => {
  const id = useId("paper");
  return (<g style={{ mixBlendMode: "multiply" }} pointerEvents="none">
    <defs><filter id={id} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} /><feColorMatrix type="matrix" values={`0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.4  0 0 0 ${amt * 6} ${1 - amt * 4}`} /></filter></defs>
    <rect width={w} height={h} filter={`url(#${id})`} opacity={0.5} />
  </g>);
};
