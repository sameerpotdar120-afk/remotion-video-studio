import React from 'react';
import { AbsoluteFill, Composition, Img, registerRoot, staticFile, useVideoConfig } from 'remotion';
import { ASPECT } from './assets';
import { LABEL, UI, useFonts } from './font';
import { Aravalli3D, P3, useHeights } from './Terrain3D';

/**
 * The cover for YouTube Shorts and Instagram Reels: the 3D charcoal map with the Aravalli risen in green, the Thar in
 * sand, Rashtrapati Bhavan standing at the Delhi end, and "ये दीवार टूट रही है!" in the top third. Inside the 3:4 crop.
 * Own entry (not render.tsx), so it never touches the main render's bundle.
 */
const Big: React.FC<{ text: string; size: number; color: string }> = ({ text, size, color }) => (
  <span style={{ fontFamily: UI, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, WebkitTextStroke: `${Math.round(size / 11)}px #0B1830`, paintOrder: 'stroke fill', textShadow: `0 0 ${size / 4}px ${color}55, 0 10px 24px rgba(0,0,0,0.5)`, whiteSpace: 'nowrap' }}>{text}</span>
);
const ArCover: React.FC = () => {
  useFonts();
  const { width, height } = useVideoConfig();
  const h = useHeights();
  if (!h) return <AbsoluteFill style={{ background: '#16181b' }} />;
  const cam = { pos: P3(h, 73.2, 23.6, 360), look: P3(h, 75.8, 27.2, 0), fov: 50 };
  return (
    <AbsoluteFill style={{ background: '#16181b', overflow: 'hidden' }}>
      <Aravalli3D h={h} pos={cam.pos} look={cam.look} fov={cam.fov} width={width} height={height} rise={1} hl={1} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(5,8,12,0.92) 0%, rgba(5,8,12,0.55) 55%, rgba(5,8,12,0))' }} />
      <div style={{ position: 'absolute', left: 540 - 400, top: 1060, width: 800 }}>
        <div style={{ position: 'absolute', left: 60, right: 60, top: 800 / ASPECT.r_raisina_rock * 0.82, height: 110, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.65), rgba(0,0,0,0) 70%)' }} />
        <Img src={staticFile('aravalli/img/r_raisina_rock.png')} style={{ position: 'absolute', left: 0, top: 120, width: 800 }} />
        <Img src={staticFile('aravalli/img/r_rashtrapati_bhavan.png')} style={{ position: 'absolute', left: 110, top: 0, width: 580 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', lineHeight: 1.0 }}>
        <Big text="ये दीवार" size={170} color="#fff" /><br />
        <Big text="टूट रही है!" size={170} color="#5BE07F" />
      </div>
      <div style={{ position: 'absolute', right: 26, top: 1620, padding: '2px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.55)', fontFamily: LABEL, fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>3D: SRTM terrain, exaggerated</div>
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="ArCover" component={ArCover} durationInFrames={1} fps={30} width={1080} height={1920} />);
