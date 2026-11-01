import React from 'react';
import { useCurrentFrame } from 'remotion';

/** Reference 61–66 s and 0.87 s ("Canada"): text types on one character every `every` frames with a blinking caret;
 *  `accentFrom` colours the tail of the text (the reference's two-tone labels). */
export const TypeOn: React.FC<{ text: string; at?: number; every?: number; style?: React.CSSProperties; accent?: string; accentFrom?: number }> = ({ text, at = 0, every = 2, style, accent, accentFrom }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const chars = Array.from(text);
  const n = Math.min(chars.length, Math.floor(f / every) + 1);
  const caret = n < chars.length || Math.floor(f / 15) % 2 === 0;
  return (
    <span style={style}>
      {chars.slice(0, n).map((c, i) => <span key={i} style={accent && accentFrom != null && i >= accentFrom ? { color: accent } : undefined}>{c}</span>)}
      <span style={{ opacity: caret ? 0.9 : 0, marginLeft: 2 }}>|</span>
    </span>
  );
};
