import React from 'react';
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame, useVideoConfig } from 'remotion';
import { World, Ground } from './World';
import { PXZ, useHeights } from './geo';
import { camOf, CamK } from './cam';
import { useFonts } from './font';
import { Grade } from './post';
import { Arrow, Blast, Bracket, City, Jet, Label, Prop, Unit, useImgs } from './things';

/** A look-dev entry: fixed camera poses, one per second, with the kit laid out. */
const POSES: CamK[] = [
  { lon: 34.2, lat: 30.9, d: 1250, pitch: 55, head: 0 },
  { lon: 35.0, lat: 31.7, d: 330, pitch: 46, head: 6 },
  { lon: 34.45, lat: 27.98, d: 85, pitch: 40, head: -10 },
  { lon: 35.72, lat: 33.0, d: 120, pitch: 36, head: 15 },
  { lon: 32.3, lat: 30.35, d: 260, pitch: 44, head: 0 },
];
export const PAL: [number, number, number][] = [
  [0.1, 0.2, 0.3], [0.42, 0.47, 0.27], [0.42, 0.47, 0.27], [0.42, 0.47, 0.27], [0.21, 0.37, 0.44], [0.69, 0.45, 0.27],
  [0.6, 0.33, 0.34], [0.69, 0.45, 0.27], [0.6, 0.33, 0.34], [0.68, 0.61, 0.33], [0.52, 0.39, 0.27], [0.47, 0.44, 0.39],
];
const IMGS = ['s_tanker', 'j_delta_jet_top', 'a_airfield_tile', 'p_port_eilat', 't_tank_desert', 'b_bunker_ridge'];
const Test: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const h = useHeights();
  const fonts = useFonts();
  const im = useImgs(IMGS);
  if (!h || !fonts || !im) return null;
  const i = Math.min(POSES.length - 1, Math.floor(f / fps));
  const t = f / fps, lt = t - i;
  const P = POSES[i];
  const g: Ground = { col: PAL, hatch: [], glow: i === 1 ? [0, 0, 0, 0, 0.6] : [], post: 0, fine: 0.8, river: 1, dim: 0, focus: [0, 0], focusR: 100, t };
  const lab = (at: string, text: string, s: number) => <Label key={at + text} h={h} at={at} text={text} size={s} head={P.head} />;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Grade width={width}>
        <World h={h} cam={camOf(h, P)} width={width} height={height} g={g}>
          {i === 0 && [lab('cairo', 'काहिरा', 22), lab('damascus', 'दमिश्क', 22), lab('amman', 'अम्मान', 20)]}
          {i === 0 && <Label h={h} at={[32.2, 33.6]} text="भूमध्य सागर" size={26} head={0} color="rgba(210,230,255,0.55)" />}
          {i === 1 && <>
            {lab('jerusalem', 'यरुशलम', 6.5)}{lab('tel_aviv', 'तेल अवीव', 6.5)}{lab('amman', 'अम्मान', 6.5)}{lab('gaza', 'ग़ाज़ा', 6)}
            <City h={h} at="jerusalem" size={12} seed={2} /><City h={h} at="tel_aviv" size={13} seed={3} /><City h={h} at="amman" size={12} seed={4} />
            <Unit h={h} u={{ side: 'il', kind: 'arm', at: PXZ([34.85, 31.45]), s: 16, head: P.head }} />
            <Unit h={h} u={{ side: 'il', kind: 'inf', at: PXZ([35.0, 31.95]), s: 16, head: P.head }} />
            <Unit h={h} u={{ side: 'jo', kind: 'inf', at: PXZ([35.35, 31.65]), s: 16, head: P.head }} />
            <Unit h={h} u={{ side: 'eg', kind: 'arm', at: PXZ([34.3, 31.05]), s: 16, head: P.head }} />
            <Arrow h={h} path={[[34.75, 31.75], [35.05, 31.82], [35.25, 31.85]]} w={7} p={0.9} />
          </>}
          {i === 2 && <>
            <Prop tex={im.s_tanker} h={h} at={[34.47, 28.1]} w={13} head={P.head} />
            <Label h={h} at={[34.62, 27.86]} text="तिरान" size={3.6} head={P.head} />
            <Label h={h} at={[34.20, 27.86]} text="शर्म अल-शेख़" size={3} head={P.head} />
          </>}
          {i === 3 && <>
            <Blast h={h} at={[35.75, 33.05]} size={2.6} age={1.2 + lt} seed={3} />
            <Blast h={h} at={[35.68, 32.93]} size={2} age={0.25 + lt} seed={5} />
            <Prop tex={im.b_bunker_ridge} h={h} at={[35.82, 33.12]} w={14} head={P.head} />
            <Label h={h} at="kuneitra" text="क़ुनैत्रा" size={3.6} head={P.head} dz={2.5} />
          </>}
          {i === 4 && <>
            <Prop tex={im.a_airfield_tile} h={h} at="abu_suweir" w={30} head={P.head} />
            <Bracket h={h} at="abu_suweir" size={34} lock={1} t={t} />
            <Bracket h={h} at="fayid" size={34} lock={0.7} t={t} />
            <Blast h={h} at="fayid" size={5} age={0.6 + lt} seed={8} />
            <Jet h={h} tex={im.j_delta_jet_top} path={[[31.6, 30.9], [32.1, 30.6], [32.6, 30.2]]} p={0.45 + lt * 0.2} w={16} alt={8} />
            <Label h={h} at="suez" text="स्वेज़" size={10} head={0} />
          </>}
        </World>
      </Grade>
    </AbsoluteFill>
  );
};
registerRoot(() => (
  <>
    <Composition id="SDTest" component={Test} durationInFrames={POSES.length * 30} fps={30} width={1920} height={1080} />
    <Composition id="SDTest4K" component={Test} durationInFrames={POSES.length * 30} fps={30} width={3840} height={2160} />
  </>
));
