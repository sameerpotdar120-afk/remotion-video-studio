import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';

type Word = { text: string; hot: boolean };

const parse = (text: string): Word[] =>
  text.split(/\s+/).map((raw) => {
    const hot = raw.startsWith('*') && raw.includes('*', 1);
    return { text: raw.replace(/\*/g, ''), hot };
  });

// Break words into short on-screen chunks, closing a chunk at sentence ends.
const chunk = (words: Word[], max = 4): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[.?!]$/.test(w.text)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const Captions: React.FC<{ text: string; durationInFrames: number }> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parse(text);
  const chunks = chunk(words);

  // Words are spoken over the first 92% of the scene, weighted by length.
  const speakFrames = durationInFrames * 0.92;
  const weights = words.map((w) => 1 + w.text.length / 6);
  const total = weights.reduce((a, b) => a + b, 0);
  const starts: number[] = [];
  let acc = 0;
  for (const w of weights) {
    starts.push((acc / total) * speakFrames);
    acc += w;
  }

  let idx = 0;
  const chunkTimes = chunks.map((c) => {
    const first = idx;
    idx += c.length;
    return { first, start: starts[first], end: idx < starts.length ? starts[idx] : durationInFrames };
  });

  const active = chunkTimes.findIndex((t) => frame >= t.start && frame < t.end);
  if (active === -1) return null;
  const { first } = chunkTimes[active];

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 380 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 22px',
          maxWidth: 940,
          textAlign: 'center',
        }}
      >
        {chunks[active].map((w, i) => {
          const start = starts[first + i];
          const pop = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 220 } });
          const visible = frame >= start;
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.font,
                fontWeight: 900,
                fontSize: 92,
                lineHeight: 1.12,
                textTransform: 'uppercase',
                color: w.hot ? theme.accent : theme.text,
                opacity: visible ? interpolate(pop, [0, 1], [0, 1]) : 0,
                transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])}) translateY(${interpolate(pop, [0, 1], [20, 0])}px)`,
                textShadow: '0 6px 0 rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.7)',
                WebkitTextStroke: '3px rgba(0,0,0,0.9)',
                paintOrder: 'stroke fill',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
