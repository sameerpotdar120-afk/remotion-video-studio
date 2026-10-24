import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { HEAD, useTZFonts } from '../../timezones/fonts';
import { Cam, GEO, PLANE, merc } from './cam';
import { MapCanvas } from './Map';
import { Shapes } from './Shapes';
import { Grade, MAP_GRADE } from './Fx';
import { useFonts, NUM } from '../motion/font';

/**
 * The cover for YouTube Shorts and Instagram Reels: the dark Caribbean with the islands lit in their fills, the white
 * outline round them, the magnifier over the sea finding nothing, the cricketer in maroon, and the hook on top:
 * "WEST INDIES / कहाँ है?". Everything that matters sits inside the 3:4 crop (y 240–1680).
 */
const FILLS: [string, string][] = [['Cuba', '#E8383D'], ['Jamaica', '#3FE0CF'], ['Haiti', '#46E04F'], ['Dominican Republic', '#F28A24'], ['The Bahamas', '#36B6F2'],
  ['Barbados', '#3FE0CF'], ['Trinidad and Tobago', '#E2333A'], ['Grenada', '#C9D62B'], ['Saint Lucia', '#3FE0CF'], ['Antigua and Barbuda', '#E2333A'], ['Dominica', '#46E04F'],
  ['Saint Kitts and Nevis', '#3B5BF0'], ['Saint Vincent and the Grenadines', '#E8C52E']];
export const WiCover: React.FC<{ text?: boolean; res?: number }> = ({ text = true, res = 1 }) => {
  useTZFonts();
  useFonts();
  const [x, y] = merc(-71, 17.5);
  const cam: Cam = { x, y, span: 4.2e6, rot: 0 };
  const big: React.CSSProperties = { fontFamily: HEAD, fontWeight: 800, lineHeight: 1.06, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.7)' };
  return (
    <AbsoluteFill style={{ background: '#030b12', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h, filter: MAP_GRADE }}>
        <MapCanvas cam={cam} res={res} />
        <Shapes c={cam} t={10} regions={FILLS.map(([n, col]) => ({ key: `cv${n}`, rings: GEO.countries[n], color: col, t0: 0, dur: 0.01 }))} />
      </div>
      <Grade t={20} />
      <Img src={staticFile('westindies/img/wi03_magnifying_glass.png')} style={{ position: 'absolute', left: 540, top: 940, width: 420, height: 429, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 16px 22px rgba(0,0,0,0.7))' }} />
      <Img src={staticFile('westindies/img/wi02_cricketer_body.png')} style={{ position: 'absolute', left: 60, top: 980, width: 280, height: 808, filter: 'drop-shadow(0 16px 22px rgba(0,0,0,0.7))' }} />
      {text && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center' }}>
          <div style={{ fontFamily: NUM, fontSize: 168, color: '#fff', letterSpacing: 4, WebkitTextStroke: '12px #0A0F16', paintOrder: 'stroke fill', textShadow: '0 0 40px rgba(47,230,208,0.45), 0 10px 26px rgba(0,0,0,0.6)' }}>WEST INDIES</div>
          <div style={{ display: 'inline-block', marginTop: 6, padding: '6px 46px 0', background: 'linear-gradient(180deg, #A8335A, #7A1F3D)', border: '7px solid #fff', borderRadius: 20, transform: 'rotate(-3deg)', boxShadow: '0 12px 26px rgba(0,0,0,0.5)' }}>
            <div style={{ ...big, fontSize: 120, color: '#fff', WebkitTextStroke: '0px', textShadow: '0 4px 0 rgba(0,0,0,0.25)' }}>कहाँ है?</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
