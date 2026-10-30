import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

/** One caption word: the frame it appears on (it stays until the next word) and its text. */
export type CapWord = { f: number; w: string };

/**
 * Stickman3D caption style: one word at a time, hard cuts, no pop. White Poppins Bold with a thin dark outline and a
 * soft shadow, centred at 73 % of the frame height, cap height ~3 % of the height. Words come from a JSON track
 * built with scripts/stickman3d/analysis/captions_ocr.py (or by hand) - [{ f, w }, ...] sorted by frame.
 */
export const WordCaptions: React.FC<{ words: CapWord[]; y?: number; scale?: number }> = ({ words, y = 0.728, scale = 1 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  let cur: CapWord | undefined;
  for (const w of words) { if (w.f <= f) cur = w; else break; }
  if (!cur) return null;
  const size = width * 0.061 * scale;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: height * y - size * 0.62, textAlign: 'center',
        fontFamily: 'Poppins', fontWeight: 700, fontSize: size, lineHeight: 1.1, color: '#ffffff', letterSpacing: -0.5,
        WebkitTextStroke: `${size * 0.075}px #1d1712`, paintOrder: 'stroke fill',
        textShadow: `0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.45)`,
      }}>{cur.w}</div>
    </AbsoluteFill>
  );
};
