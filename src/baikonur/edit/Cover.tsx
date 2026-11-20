import React from 'react';
import { AbsoluteFill, Composition, registerRoot } from 'remotion';
import { Big, COL, MapPerson, MapVectors } from './Baikonur';
import { GEO, merc, toS } from './cam';
import { UI, useFonts } from './font';
import { MapLayers } from './Map';

/** The thumbnail (YouTube + Instagram): the steppe, Kazakhstan turquoise with the lease circle ringed red, Rakesh Sharma
 * rising beside it, and "$115M हर साल!" in the top third (inside the 3:4 crop). */
const BkCover: React.FC = () => {
  useFonts();
  const at = merc(63.7, 45.84);
  const c = { x: at[0], y: at[1], mpp: 150 };
  const [lx, ly] = toS(c, GEO.places.lease_c);
  return (
    <AbsoluteFill style={{ background: '#0E3A57' }}>
      <AbsoluteFill style={{ filter: 'saturate(1.15) contrast(1.06)' }}><MapLayers c={c} /></AbsoluteFill>
      <MapVectors t={0} c={c} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 32%)' }} />
      <MapPerson k="r_rakesh_sharma" hi="राकेश शर्मा" en="RAKESH SHARMA · 1984" bar="#FF8A1E" t={5} t0={0} x={lx + 290} bottom={ly + 230} h={640} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center' }}>
        <div><Big text="$115M" size={220} color="#FFE07A" glow={COL.gold} /></div>
        <div style={{ marginTop: -6 }}><Big text={<span style={{ fontFamily: UI }}>हर साल किराया!</span>} size={104} color="#fff" glow={COL.red} /></div>
      </div>
    </AbsoluteFill>
  );
};
const CoverRoot: React.FC = () => <Composition id="BkCover" component={BkCover} durationInFrames={1} fps={30} width={1080} height={1920} />;
registerRoot(CoverRoot);
