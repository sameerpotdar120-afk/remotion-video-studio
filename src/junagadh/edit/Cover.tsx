import React from 'react';
import { AbsoluteFill, registerRoot, Composition } from 'remotion';
import { GEO, merc, ringsD, toS } from './cam';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';
import { Cut, Slab } from './Studio';

/**
 * The cover for YouTube Shorts and Instagram Reels: Gujarat on the satellite map, Junagadh as a raised Pakistan-green
 * slab with the hatched 2020 claim, India red and Pakistan green around it, the creator's new Somnath temple on it and
 * Sardar Patel beside it, and "आज भी उनके नक्शे में!" in the top third. Inside the 3:4 crop.
 * Own entry (not render.tsx), so it never touches the main render's bundle.
 */
const Big: React.FC<{ text: string; size: number; color: string }> = ({ text, size, color }) => (
  <span style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px #0B1830`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
export const JgCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(70.25, 21.8);
  const c = { x, y, mpp: 440 };
  const [jx, jy] = toS(c, GEO.jg_center);
  const cen = (k: string) => { const r = GEO.countries[k][0]; let a = 0, b = 0; for (const p of r) { a += p[0]; b += p[1]; } return toS(c, [a / r.length, b / r.length]); };
  return (
    <AbsoluteFill style={{ background: '#0E2A55', overflow: 'hidden' }}>
      <AbsoluteFill style={{ filter: 'contrast(1.08) saturate(1.2) brightness(1.03)' }}><MapLayers c={c} /></AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><pattern id="hatchc" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="rgba(31,163,74,0.25)" /><rect width="7" height="18" fill="#1FC25A" /></pattern></defs>
        <Slab id="cvInd" t={3} d={ringsD(c, GEO.countries.India)} hue="red" g={1} depth={16} cx={cen('India')[0]} cy={cen('India')[1]} />
        <Slab id="cvPak" t={3} d={ringsD(c, GEO.countries.Pakistan)} hue="green" g={1} depth={16} cx={cen('Pakistan')[0]} cy={cen('Pakistan')[1]} />
        <Slab id="cvJg" t={3} d={ringsD(c, GEO.junagadh)} hue="green" g={1} depth={14} cx={jx} cy={jy} s={1.04} />
        <path d={ringsD(c, GEO.junagadh)} fill="url(#hatchc)" stroke="#fff" strokeWidth={4} strokeDasharray="14 10" transform={`translate(${jx} ${jy - 14}) scale(1.04) translate(${-jx} ${-jy})`} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 780, background: 'linear-gradient(180deg, rgba(5,10,20,0.9) 0%, rgba(5,10,20,0.55) 55%, rgba(5,10,20,0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', lineHeight: 1.0 }}>
        <Big text="आज भी उनके" size={150} color="#fff" /><br />
        <Big text="नक्शे में!" size={200} color="#FFC21A" />
      </div>
      <div style={{ position: 'absolute', left: jx - 90, top: jy - 545 }}><Cut k="s_somnath_new" w={480} /></div>
      <div style={{ position: 'absolute', left: 30, top: 820 }}><Cut k="p_patel" w={300} /></div>
      <div style={{ position: 'absolute', right: 26, top: 1600, padding: '2px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', fontFamily: 'sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>AI illustration</div>
    </AbsoluteFill>
  );
};
const CoverRoot: React.FC = () => <Composition id="JgCover" component={JgCover} durationInFrames={1} fps={60} width={1080} height={1920} />;
registerRoot(CoverRoot);
