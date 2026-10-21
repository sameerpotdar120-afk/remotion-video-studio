import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, MapPin, colonyPath } from '../lib/map/layers';
import { PLACES } from '../lib/map/data';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { Fling, PopIn, Shake, StampSlam } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Paper3D } from '../lib/fx/depth';
import { Flash } from '../lib/fx/transitions';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { Label, NeonPng, Plate, Punch } from './kit';

/**
 * S08 — STAMP ACT 1765 (11690 → 13485, 29.9 s). Fast plate cuts → Liberty Tree → map. Frames LOCAL.
 *  "असली बवाल"               the Stamp Act document spins in; punch-in on it
 *  "अख़बार / contract / license / ताश के पत्तों"   hard cuts: print shop, lawyer, court, tavern — TAXED slams on each
 *  "ये हर किसी को चुभा"        the colonist flips the card table: table and cards fly
 *  "पुतला एक पेड़ पर"          the Liberty Tree: an effigy swings from the branch
 *  "Liberty Tree"             title
 *  "नौ colonies"              nine colonies light up one by one
 *  "New York में एक साथ मिले"  delegates converge on New York; pin "Stamp Act Congress / October 1765"
 *  "No taxation without representation"  slogan + neon Parliament ✕ and coins ✓
 */

// the nine colonies that sent delegates to the Stamp Act Congress
const NINE = ['massachusetts', 'rhode-island', 'connecticut', 'new-york', 'new-jersey', 'pennsylvania', 'delaware', 'maryland', 'south-carolina'];
const DELEGATE_FROM: [number, number][] = [[-71.8, 42.3], [-71.5, 41.7], [-72.7, 41.6], [-75.5, 42.8], [-74.5, 40.1], [-77.5, 40.9], [-75.5, 39.0], [-76.8, 39.2], [-80.9, 33.8]];

const taxed = staticFile('assets/props/stamp_taxed.png');

/** One fast plate: background + a prop/character + TAXED slam. */
const StampedPlate: React.FC<{ bg: string; children?: React.ReactNode; stampAt: number; sx?: number; sy?: number; label: string }> = ({ bg, children, stampAt, sx = W * 0.62, sy = H * 0.42, label }) => (
  <Shake hits={[stampAt]} amp={14} dur={8}>
    <Grade look="relief">
      <Plate bg={bg} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.04 }, { frame: 80, x: -40, y: 0, zoom: 1.1 }]} blur={3}>
        {children}
      </Plate>
    </Grade>
    <Label x={W * 0.2} y={H * 0.12} text={label} start={0} size={120} />
    <StampSlam x={sx} y={sy} w={1100} h={500} start={stampAt} src={taxed} rotate={-9} />
  </Shake>
);

/** The card table goes over: tips up, then flings off with the cards. */
const TableFlip: React.FC<{ flipAt: number }> = ({ flipAt }) => {
  const frame = useCurrentFrame();
  const tx = W * 0.56;
  const ty = H * 0.72;
  const t = ramp(frame, flipAt, 14, ease.in);
  const fly = Math.max(0, frame - flipAt - 10);
  const rot = -t * 70 - fly * 9;
  const x = tx + fly * 30;
  const y = ty - t * 90 - fly * 26 + 0.5 * 2.4 * fly * fly;
  return (
    <>
      {frame < flipAt + 60 && (
        <Img src={staticFile('assets/props/card_table_round.png')} style={{ position: 'absolute', left: x - 560, top: y - 520, width: 1120, height: 1120,
          transform: `rotate(${rot}deg)`, transformOrigin: '20% 90%' }} />
      )}
      {frame < flipAt + 6 && (
        <Img src={staticFile('assets/props/playing_cards_fan.png')} style={{ position: 'absolute', left: tx - 380, top: ty - 640, width: 760, transform: 'rotate(-8deg)' }} />
      )}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Fling key={i} start={flipAt + 4} src={staticFile('assets/props/playing_card_single.png')} x={tx - 200 + i * 80} y={ty - 520} w={300}
          vx={-14 + i * 7} vy={-38 - (i % 3) * 8} g={2.2} spin={i % 2 ? 22 : -18} life={60} rotate={i * 20} />
      ))}
    </>
  );
};

/** The effigy hangs from the Liberty Tree's branch and swings. */
const Effigy: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const drop = interpolate(t, [0, 10], [-900, 0], { ...clamp, easing: ease.out });
  const swing = 9 * Math.exp(-t / 120) * Math.sin(t / 13) + 2 * Math.sin(t / 31);
  const h = 1500;
  return (
    <Img src={staticFile('assets/props/effigy_hanging.png')} style={{ position: 'absolute', left: W * 0.6 - (h * 1024) / 1536 / 2, top: H * 0.1 + drop, height: h,
      transform: `rotate(${swing}deg)`, transformOrigin: '50% 0%', filter: 'drop-shadow(0 30px 30px rgba(0,0,0,0.35))' }} />
  );
};

/** Delegates (red dots with trails) converge on New York. */
const Converge: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [nx, ny] = toScreen(...PLACES.newYork);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {DELEGATE_FROM.map(([lon, lat], i) => {
        const p = ramp(frame, start + i * 4, 40, ease.inOut);
        const [x0, y0] = toScreen(lon, lat);
        const x = x0 + (nx - x0) * p;
        const y = y0 + (ny - y0) * p;
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={x} y2={y} stroke="#fff" strokeWidth={6} strokeDasharray="18 12" opacity={0.8} />
            <circle cx={x} cy={y} r={22} fill={C.stampRed} stroke="#fff" strokeWidth={6} opacity={p < 1 ? 1 : 0} />
          </g>
        );
      })}
    </svg>
  );
};

const NineLight: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const ds = useMemo(() => NINE.map((k) => colonyPath(k)), []);
  return (
    <>
      {ds.map((d, i) => {
        const t = frame - (start + i * 8);
        if (t < 0) return null;
        const o = interpolate(t, [0, 3, 20], [0, 1, 0.75], clamp);
        return <path key={i} d={d} fill={t < 4 ? '#FFF4D6' : C.congressOrange} opacity={o} />;
      })}
    </>
  );
};

export const S08Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S08_stamp');
  const actAt = c.at('असली बवाल');
  const paperAt = c.at('अख़बार');
  const contractAt = c.at('contract');
  const licenseAt = c.at('license');
  const cardsAt = c.at('ताश के पत्तों');
  const flipAt = c.at('ये हर किसी को चुभा');
  const effigyAt = c.at('पुतला एक पेड़ पर');
  const treeAt = c.at('Liberty Tree');
  const nineAt = c.at('नौ colonies');
  const nyAt = c.at('New York में एक साथ मिले');
  const sloganAt = c.at('No taxation without representation');
  const len = c.duration;

  const mapCam: CamKey[] = [
    { frame: 0, lon: -76.5, lat: 39.5, span: 26 },
    { frame: nyAt - nineAt, lon: -75.0, lat: 40.0, span: 20 },
    { frame: sloganAt - nineAt, lon: -74.6, lat: 40.4, span: 16 },
    { frame: len - nineAt, lon: -74.4, lat: 40.5, span: 14 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · the Act itself, over the Atlantic map */}
      <Sequence durationInFrames={paperAt} layout="none">
        <Punch start={actAt + 60} end={paperAt + 40} to={1.7} focus={[W / 2, H * 0.46]}>
          <Grade look="parchment">
            <MapStage style="parchment" camera={[{ frame: 0, lon: -44, lat: 43, span: 76 }, { frame: paperAt, lon: -48, lat: 42, span: 66 }]}
              above={[reliefRaster('atlantic', 0.45)]}
              world={<ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />} />
          </Grade>
          <Paper3D src={staticFile('assets/docs/doc_stamp_act_1765.png')} x={W / 2} y={H * 0.48} w={1050} h={1480} start={actAt + 10} baseTilt={[6, -10, 3]} swing={3} />
          <MapTitle x={W / 2} y={H * 0.92} text="Stamp Act" date="22 March 1765" start={actAt + 30} size={130} />
        </Punch>
      </Sequence>

      {/* 2 · fast cuts: every paper taxed */}
      <Sequence from={paperAt} durationInFrames={contractAt - paperAt} layout="none">
        <StampedPlate bg="bg_print_shop_1765.jpg" stampAt={8} label="Newspapers" sx={W * 0.6} sy={H * 0.5}>
          <Puppet rig={RIGS.printer} x={W * 0.25} y={H * 1.02} height={1500} seed="pr" moods={[[0, 'neutral'], [8, 'shocked']]} look={1} />
          <PopIn start={0} x={W * 0.6} y={H * 0.6} w={1300} h={1300} rotate={-4}>
            <Img src={staticFile('assets/props/newspaper_1765.png')} style={{ width: 1300, height: 1300, objectFit: 'contain' }} />
          </PopIn>
        </StampedPlate>
      </Sequence>
      <Sequence from={contractAt} durationInFrames={licenseAt - contractAt} layout="none">
        <StampedPlate bg="bg_lawyer_office_1765.png" stampAt={6} label="Contracts" sx={W * 0.55} sy={H * 0.55}>
          <PopIn start={0} x={W * 0.55} y={H * 0.62} w={1100} h={1100}>
            <Img src={staticFile('assets/props/quill_inkwell.png')} style={{ width: 1100, height: 1100, objectFit: 'contain' }} />
          </PopIn>
        </StampedPlate>
      </Sequence>
      <Sequence from={licenseAt} durationInFrames={cardsAt - licenseAt} layout="none">
        <StampedPlate bg="bg_courtroom_1765.png" stampAt={6} label="Licenses" sx={W * 0.55} sy={H * 0.45}>
          <Puppet rig={RIGS.judge} x={W * 0.3} y={H * 1.0} height={1450} seed="jd" moods={[[0, 'neutral'], [6, 'worried']]} look={1} />
          <PopIn start={0} x={W * 0.6} y={H * 0.55} w={900} h={1260} rotate={3}>
            <Img src={staticFile('assets/docs/doc_stamp_act_1765.png')} style={{ width: 900, height: 1260, objectFit: 'contain' }} />
          </PopIn>
        </StampedPlate>
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={effigyAt - cardsAt} layout="none">
        <Shake hits={[10, flipAt - cardsAt + 12]} amp={16} dur={8}>
          <Grade look="relief">
            <Plate bg="bg_tavern_1765.png" camera={[{ frame: 0, x: 0, y: 0, zoom: 1.04 }, { frame: 300, x: 40, y: 0, zoom: 1.1 }]} blur={3}>
              <Puppet rig={RIGS.colonistBearded} x={W * 0.24} y={H * 1.04} height={1500} seed="tv"
                moods={[[0, 'neutral'], [12, 'shocked'], [flipAt - cardsAt - 30, 'angry'], [flipAt - cardsAt, 'furious']]} look={1} />
              <TableFlip flipAt={flipAt - cardsAt} />
            </Plate>
          </Grade>
          <Label x={W * 0.2} y={H * 0.12} text="Playing cards" start={0} size={120} exit={flipAt - cardsAt} />
          <StampSlam x={W * 0.56} y={H * 0.36} w={1000} h={460} start={10} src={taxed} rotate={-9} exit={flipAt - cardsAt + 4} />
        </Shake>
      </Sequence>

      {/* 3 · the Liberty Tree */}
      <Sequence from={effigyAt} durationInFrames={nineAt - effigyAt} layout="none">
        <Grade look="relief">
          <Plate bg="bg_liberty_tree_1765.png" camera={[{ frame: 0, x: 0, y: 0, zoom: 1.03 }, { frame: nineAt - effigyAt, x: -60, y: 30, zoom: 1.14 }]} blur={2}>
            <Effigy start={10} />
          </Plate>
        </Grade>
        <MapTitle x={W * 0.32} y={H * 0.8} text="Liberty Tree" date="Boston · 14 August 1765" start={treeAt - effigyAt} size={150} />
      </Sequence>

      {/* 4 · the map: nine colonies, New York, the slogan */}
      <Sequence from={nineAt} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={mapCam} above={[reliefRaster('eastcoast', 0.5)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <NineLight start={0} />
              </>
            }
            overlay={
              <>
                <Converge start={nyAt - nineAt} />
                <MapPin lon={PLACES.newYork[0]} lat={PLACES.newYork[1]} start={nyAt - nineAt + 44} label="Stamp Act Congress" date="October 1765" />
              </>
            }
          />
        </Grade>
        <Label x={W * 0.22} y={H * 0.14} text="9 colonies" start={8} size={120} exit={nyAt - nineAt + 40} />
        {frame >= sloganAt && (
          <AbsoluteFill style={{ background: `rgba(10,8,6,${0.55 * ramp(frame, sloganAt, 12, ease.out)})` }}>
            <MapTitle x={W / 2} y={H * 0.22} text={'No taxation\nwithout representation'} start={sloganAt - nineAt} size={170} />
            <NeonPng x={W * 0.34} y={H * 0.66} size={760} start={sloganAt - nineAt + 40} path="icons/neon_parliament_x.png" />
            <NeonPng x={W * 0.66} y={H * 0.66} size={760} start={sloganAt - nineAt + 56} path="icons/neon_coins_check.png" />
          </AbsoluteFill>
        )}
      </Sequence>
      <Sequence from={paperAt} durationInFrames={4} layout="none"><Flash at={0} dur={4} /></Sequence>

      {/* ── SFX ── */}
      <Sfx at={actAt + 10} file="paper_swish.wav" volume={0.5} />
      <Sfx at={actAt + 60} file="whoosh_fast.wav" volume={0.4} />
      {[paperAt + 8, contractAt + 6, licenseAt + 6, cardsAt + 10].map((f) => <Sfx key={f} at={f} file="stamp_slam.wav" volume={0.55} />)}
      <Sfx at={flipAt} file="impact_boom.wav" volume={0.45} />
      <Sfx at={flipAt + 4} file="paper_swish.wav" volume={0.4} />
      <Sfx at={effigyAt + 10} file="whoosh_down.wav" volume={0.4} />
      <Sfx at={treeAt} file="sting_shimmer.wav" volume={0.35} />
      {NINE.map((_, i) => <Sfx key={`n${i}`} at={nineAt + i * 8} file="click_soft.wav" volume={0.3} />)}
      <Sfx at={nyAt} file="whoosh_soft.wav" volume={0.4} />
      <Sfx at={nyAt + 44} file="pop.wav" volume={0.45} />
      <Sfx at={sloganAt} file="timpani_hit.wav" volume={0.45} />
      <Sfx at={sloganAt + 40} file="sting_hit.wav" volume={0.35} />
      <Sfx at={sloganAt + 56} file="bell_ding.wav" volume={0.3} />
    </AbsoluteFill>
  );
};
