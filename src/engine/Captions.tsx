// One-word captions (the measured style: one or two words at a time, heavy white type, dark outline, ~70% down).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, delayRender, continueRender } from "remotion";

// Montserrat (SIL Open Font License) bundled in public/fonts, so renders need no network.
const fontFamily = "MontserratLocal";
if (typeof document !== "undefined" && !document.fonts.check(`900 20px ${fontFamily}`)) {
  const h = delayRender("caption font");
  const face = new FontFace(fontFamily, `url(${staticFile("fonts/Montserrat-latin-var.woff2")}) format("woff2")`, { weight: "100 900" });
  face.load().then((f) => { (document.fonts as unknown as { add: (x: FontFace) => void }).add(f); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); });
}

export type Word = { w: string; start: number; end: number };

// Short words ride along with the next word so nothing flashes for 2 frames
export function groupWords(words: Word[], minDur = 0.22): Word[] {
  const out: Word[] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && last.end - last.start < minDur && (last.w + " " + w.w).length <= 14 && !/[.?!]$/.test(last.w)) { last.w += " " + w.w; last.end = w.end; }
    else out.push({ ...w });
  }
  return out;
}

export const Captions: React.FC<{ words: Word[]; y?: number; size?: number }> = ({ words, y = 0.8, size = 70 }) => {   // 2026-11-05 user: smaller and lower so the picture stays clear (was 0.75 / 86)
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const t = frame / fps;
  const g = groupWords(words);
  const cur = g.find((w) => t >= w.start && t < w.end + 0.04);
  if (!cur) return null;
  const k = interpolate(t - cur.start, [0, 0.07, 0.13], [0.8, 1.08, 1], { extrapolateRight: "clamp" });
  const text = cur.w.replace(/[,]$/, "");
  const scale = Math.min(width, height) / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: height * y, left: 0, right: 0, textAlign: "center", transform: `translateY(-50%) scale(${k})` }}>
        <span style={{ fontFamily, fontWeight: 900, fontSize: size * scale, color: "#ffffff", letterSpacing: -0.5,
          WebkitTextStroke: `${11 * scale}px #111014`, paintOrder: "stroke fill", textShadow: `0 ${6 * scale}px ${10 * scale}px rgba(0,0,0,0.45)` }}>{text}</span>
      </div>
    </AbsoluteFill>
  );
};
