import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { FONTS } from '../lib/constants';

/**
 * YouTube thumbnail (render a still at frame 40, then downscale to 1280x720):
 *   npx remotion still src/index.ts Thumb-4K out/thumb/thumb_4k.png --frame=40
 * Pairs with the title "America आज़ाद कैसे हुआ? 13 साल में राजा से बग़ावत तक" — the thumbnail carries only
 * the two years, so title and thumbnail never repeat each other.
 */
const W = 3840;
const H = 2160;

const Heart: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <svg viewBox="0 0 100 90" style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s * 0.9, transform: `rotate(${r}deg)`, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.35))' }}>
    <path d="M50 86 C20 62 2 44 2 24 C2 10 13 2 26 2 C37 2 45 9 50 18 C55 9 63 2 74 2 C87 2 98 10 98 24 C98 44 80 62 50 86 Z" fill="#E8333F" stroke="#fff" strokeWidth="5" />
  </svg>
);

const Year: React.FC<{ text: string; x: number; color: string }> = ({ text, x, color }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 90,
      width: 1500,
      textAlign: 'center',
      fontFamily: FONTS.sans,
      fontSize: 520,
      lineHeight: 1,
      color,
      WebkitTextStroke: '26px #15110d',
      paintOrder: 'stroke fill',
      letterSpacing: 6,
      filter: 'drop-shadow(0 22px 0 rgba(0,0,0,0.45))',
    }}
  >
    {text}
  </div>
);

/** Hook line in a black banner across the seam (Hindi, ≤ 3 words, never the title's words). */
const Banner: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: 1500,
      transform: 'translateX(-50%) rotate(-3deg)',
      padding: '40px 110px 60px',
      background: '#15110d',
      border: '14px solid #FFD23F',
      borderRadius: 40,
      fontFamily: FONTS.display,
      fontSize: 300,
      lineHeight: 1.15,
      color: '#FFD23F',
      whiteSpace: 'nowrap',
      boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
    }}
  >
    {text}
  </div>
);

export const Thumbnail: React.FC<{ banner?: string }> = ({ banner = '' }) => (
  <AbsoluteFill style={{ background: '#1a120c', overflow: 'hidden' }}>
    {/* left half: warm, loyal 1763 — right half: smoke and fire, 1776; the seam is a slash */}
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 25% 60%, #FFE3A3 0%, #F1B24A 38%, #B86B1E 100%)', clipPath: 'polygon(0 0, 54% 0, 46% 100%, 0 100%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 78% 70%, #FF6A2B 0%, #B3121F 40%, #3A0709 100%)', clipPath: 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(100deg, transparent 49.2%, #fff 49.6%, #fff 50.4%, transparent 50.8%)', opacity: 0.9 }} />

    {/* 1763: colonist in love with the crown */}
    <Img src={staticFile('assets/props/crown_gold.png')} style={{ position: 'absolute', left: 860, top: 700, width: 760, transform: 'rotate(-10deg)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.45))' }} />
    <Heart x={1760} y={1260} s={200} r={-14} />
    <Heart x={1640} y={700} s={170} r={12} />
    <Heart x={1520} y={1080} s={130} r={-6} />
    <Puppet rig={RIGS.colonist} x={560} y={H + 140} height={1700} moods={[[0, 'grin']]} look={1} seed="thumbL" idle={0} />

    {/* 1776: the same kind of man, now a furious militiaman with a musket */}
    <Puppet rig={RIGS.militia} x={3180} y={H + 140} height={1760} moods={[[0, 'furious']]} look={-1} seed="thumbR" idle={0} />
    <Img src={staticFile('assets/props/musket_militia.png')} style={{ position: 'absolute', left: 1900, top: 760, width: 2100, transform: 'rotate(-38deg)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.55))' }} />
    <Img src={staticFile('assets/props/tea_chest.png')} style={{ position: 'absolute', left: 2080, top: 1560, width: 620, transform: 'rotate(8deg)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.5))' }} />

    {/* the only words: two years and an arrow */}
    <Year text="1763" x={150} color="#FFF4D6" />
    <Year text="1776" x={2190} color="#FFD23F" />
    <svg viewBox="0 0 120 80" style={{ position: 'absolute', left: 1620, top: 250, width: 600, height: 400, filter: 'drop-shadow(0 18px 0 rgba(0,0,0,0.45))' }}>
      <path d="M4 26 H70 V6 L116 40 L70 74 V54 H4 Z" fill="#fff" stroke="#15110d" strokeWidth="6" strokeLinejoin="round" />
    </svg>
    {banner && <Banner text={banner} />}
  </AbsoluteFill>
);

export const THUMB = { W, H };
