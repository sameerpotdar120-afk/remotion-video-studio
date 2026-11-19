import React from 'react';
import { AbsoluteFill, Composition, registerRoot } from 'remotion';
import { camS } from './cam';
import { Big, COL, FOCAL, Prop, TerritoryTag } from './Kit';
import { UI, useFonts } from './font';
import { M, P3, Terrain, groundXZ, project, useHeights, xz } from './Terrain';

/** The thumbnail (YouTube + Instagram): the 3D map, China red above, the corridor glowing between Nepal and Bangladesh,
 * China's army in the Chumbi Valley, the 22 km bar, and "सिर्फ़ 22 KM" in the top third (inside the 3:4 crop). */
const SgCover: React.FC = () => {
  useFonts();
  const h = useHeights();
  if (!h) return <AbsoluteFill style={{ background: '#0d1a22' }} />;
  const ck = { lon: 88.62, lat: 27.0, d: 760, pitch: 60, head: 3 };
  const [lx, lz] = xz(ck.lon, ck.lat);
  const cs = camS(ck, Math.min(1.5, Math.max(0, groundXZ(h, lx, lz))));
  const pr = (lon: number, lat: number, up = 0) => project(cs, 1080, 1920, P3(h, lon, lat, up));
  const g0 = pr(M.gap[0][0], M.gap[0][1], 0.3), g1 = pr(M.gap[1][0], M.gap[1][1], 0.3);
  const ch = pr(89.4, 28.1, 1), bd = pr(89.25, 25.75, 0.5), am = pr(88.93, 27.47);
  return (
    <AbsoluteFill style={{ background: '#0d1a22' }}>
      <AbsoluteFill style={{ filter: 'saturate(1.12) contrast(1.08)' }}>
        <Terrain h={h} cam={cs} width={1080} height={1920} hl={{ corr: 1, corrRed: 0.7, corrLine: 1, chumbi: 0.9, pulse: 1 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 30%)' }} />
      {am[2] && <Prop k="a_china_armour" x={am[0]} y={am[1]} w={(90 * FOCAL) / am[3]} ring={COL.red} />}
      {ch[2] && <TerritoryTag x={250} y={600} flag="china" hi="चीन" en="CHINA" s={1.05} />}
      {bd[2] && <TerritoryTag x={bd[0]} y={bd[1]} flag="bangladesh" hi="बांग्लादेश" en="BANGLADESH" s={1.0} />}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]} stroke="#000" strokeOpacity={0.5} strokeWidth={18} />
        <line x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]} stroke="#fff" strokeWidth={9} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
        <div><Big text={<span style={{ fontFamily: UI }}>सिर्फ़</span>} size={130} color="#fff" glow={COL.orange} /></div>
        <div style={{ marginTop: -10 }}><Big text="22 KM!" size={250} color="#FFD23A" glow={COL.orange} /></div>
      </div>
    </AbsoluteFill>
  );
};

const CoverRoot: React.FC = () => <Composition id="SgCover" component={SgCover} durationInFrames={1} fps={30} width={1080} height={1920} />;
registerRoot(CoverRoot);
