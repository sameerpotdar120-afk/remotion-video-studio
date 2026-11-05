import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, Cam, merc } from './cam';
import { Clock, ZoneMap } from './TzCanada';
import { TITLE, UI, useFonts } from './font';
import { MapLayers } from './Map';

/**
 * The cover for YouTube Shorts and Instagram Reels: the US and Canada with the winter 2026 zones (the weird map), the wall
 * clock, and the hook: "जाना 3 घंटे" / "आना 5 घंटे?". Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
export const TzCover: React.FC = () => {
  useFonts();
  const [x, y] = merc(-100, 47);
  const c: Cam = { x, y, mpp: 8200 };
  const t = C.aise7 + 1.5; // the zones fully on, in their new colours
  const stroke = { WebkitTextStroke: '14px #0A0F16', paintOrder: 'stroke fill' } as const;
  return (
    <AbsoluteFill style={{ background: '#05080d', overflow: 'hidden' }}>
      <MapLayers c={c} />
      <ZoneMap t={t} c={c} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 90%)' }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center' }}>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 132, lineHeight: 1.05, color: '#3DDC84', ...stroke }}>जाना 3 घंटे</div>
        <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 132, lineHeight: 1.05, color: '#FF4D5E', ...stroke }}>आना 5 घंटे?</div>
      </div>
      <Clock size={430} hour={45} minute={0} style={{ left: 600, top: 1090, transform: 'rotate(8deg)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }} />
      <div style={{ position: 'absolute', left: 60, top: 1300, transform: 'rotate(-4deg)' }}>
        <div style={{ display: 'inline-block', padding: '4px 34px 0', background: 'linear-gradient(180deg, #E2333A, #A8161D)', border: '8px solid #fff', borderRadius: 22, boxShadow: '0 14px 30px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: TITLE, fontSize: 112, lineHeight: 1.15, color: '#fff', letterSpacing: 2 }}>CANADA vs USA</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
