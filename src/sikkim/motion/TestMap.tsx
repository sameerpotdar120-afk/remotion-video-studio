import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { G, MapView, merc, Vignette } from './MapView';
import { S01RailWeb } from './S01RailWeb';
import { S02StateGlow } from './S02StateGlow';
import { S03Title3D } from './S03Title3D';
import { S04Track } from './S04Track';
import { Pin, Road } from './S05Pins';
import { S06Himalaya } from './S06Himalaya';
import { S07Slope } from './S07Slope';
import { S08Hex } from './S08Hex';
import { S09Route } from './S09Route';
import { Counter, S10Gauge } from './S10Gauge';
import { S11Storm } from './S11Storm';
import { S12Card } from './S12Card';
import { S13Pulse } from './S13Pulse';
import { S14Portal } from './S14Portal';
import { DateStamp, S15FactCard } from './S15FactCard';
import { S16TunnelRush } from './S16TunnelRush';

// Test shots of every map piece, 120 frames each (stills review).
const cam = (lon: number, lat: number, mpp: number) => { const [x, y] = merc(lon, lat); return { x, y, mpp }; };
const INDIA = cam(81, 23, 3600), NE = cam(88.45, 27.45, 260), SIK = cam(88.5, 27.2, 420), TEE = cam(88.47, 27.03, 30);
const Shot: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => <Sequence from={i * 120} durationInFrames={120}><AbsoluteFill>{children}</AbsoluteFill></Sequence>;
export const TestMap: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Shot i={0}><MapView c={INDIA} /><S02StateGlow c={INDIA} india={[0, 200]} /><S01RailWeb c={INDIA} out={100} /><Counter x={540} y={1560} to={7000} t0={20} dur={50} plus caption="RAILWAY STATIONS" /><Vignette /></Shot>
    <Shot i={1}><MapView c={NE} /><S02StateGlow c={NE} lit={0} borders={10} /><AbsoluteFill style={{ top: -560 }}><S03Title3D text="SIKKIM" size={170} /></AbsoluteFill><Vignette /></Shot>
    <Shot i={2}><MapView c={SIK} /><S02StateGlow c={SIK} lit={-30} /><S04Track c={SIK} from={merc(88.25, 25.9)} to={G.towns.Rangpo} stopAt={0.72} q={60} /><Vignette /></Shot>
    <Shot i={3}><MapView c={SIK} /><S02StateGlow c={SIK} lit={-30} /><Pin c={SIK} at={G.towns.Siliguri} text="Siliguri" t0={0} side="l" /><Pin c={SIK} at={G.towns['New Jalpaiguri']} text="New Jalpaiguri" t0={10} /><Road c={SIK} pts={G.nh10} t0={20} /><Vignette /></Shot>
    <Shot i={4}><MapView c={SIK} /><S06Himalaya c={SIK} /><Vignette /></Shot>
    <Shot i={5}><MapView c={SIK} /><S07Slope steep={40} /></Shot>
    <Shot i={6}><MapView c={SIK} /><S08Hex x={300} y={600} label="PEAKS" /><S08Hex x={780} y={980} label="VALLEYS" t0={8} /><S10Gauge x={540} y={1450} steps={[[10, 86, 'IN TUNNELS']]} /></Shot>
    <Shot i={7}><MapView c={TEE} /><S09Route c={TEE} draw={[0, 50]} tunnels={50} tstep={2} bridges={80} longest={95} /><Vignette /></Shot>
    <Shot i={8}><MapView c={TEE} /><S09Route c={TEE} draw={[-10, -5]} tunnels={-60} highlight={0} /><S11Storm bolts={[[30, 600, 1100], [80, 400, 900]]} /><S12Card x={540} y={560} title="LANDSLIDE" sub="TUNNEL 7 · AUG 2025" t0={20}><div style={{ width: '100%', height: '100%', background: '#3a4a3a' }} /></S12Card><Vignette /></Shot>
    <Shot i={9}><MapView c={SIK} /><S02StateGlow c={SIK} lit={-30} /><S13Pulse x={560} y={900} tag={20} /><Vignette /></Shot>
    <Shot i={10}><S14Portal labels={[10, 20, 30, 40]} strip={50} /></Shot>
    <Shot i={11}><MapView c={SIK} dark={1.3} /><S15FactCard kicker="SEVOKE–RANGPO RAIL LINK" lines={['काम लगभग 85% पूरा', 'दिसंबर 2027 तक रंगपो में सिक्किम का पहला स्टेशन', 'NFR का लक्ष्य']} hl={20} /><DateStamp text="DEC 2027" t0={60} y={1500} /></Shot>
    <Shot i={12}><S16TunnelRush /></Shot>
  </AbsoluteFill>
);
