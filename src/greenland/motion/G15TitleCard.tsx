import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { UI, useFonts } from './font';
import { G02NameLabel } from './G02NameLabel';
import { idle } from './theme';

// g15_title_card (frame 0 and the loop's last frame): "GREENLAND" in ice blue and "ICELAND" in green, the names
// already crossed over, with a "नाम उल्टे क्यों?" sticker between them. Everything is in place on frame 0 (no build-on),
// breathing and floating; `fo` offsets its clock so the loop's last frame matches frame 0. Transparent, 1080×760, 60 fps.
export const G15TitleCard: React.FC<{ fo?: number; ask?: string }> = ({ fo = 1, ask = 'नाम उल्टे क्यों?' }) => {
  useFonts();
  const f = useCurrentFrame() + fo;
  const [ix, iy, ir] = idle(f, 5, 0.5);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 40, top: 0, width: 1000, height: 300 }}><G02NameLabel text="GREENLAND" kind="ice" size={140} fo={fo + 200} seed={2} /></div>
      <div style={{ position: 'absolute', left: 540, top: 380, transform: `translate(-50%,-50%) translate(${ix}px, ${iy}px) rotate(${-3 + ir}deg)`, padding: '8px 40px 0', borderRadius: 24,
        background: '#FFE234', border: '6px solid #111', boxShadow: '0 12px 20px rgba(0,0,0,0.4)', fontFamily: UI, fontWeight: 800, fontSize: 84, lineHeight: 1.3, color: '#111', whiteSpace: 'nowrap' }}>{ask}</div>
      <div style={{ position: 'absolute', left: 40, top: 460, width: 1000, height: 300 }}><G02NameLabel text="ICELAND" kind="green" size={140} fo={fo + 200} seed={3} /></div>
    </AbsoluteFill>
  );
};
