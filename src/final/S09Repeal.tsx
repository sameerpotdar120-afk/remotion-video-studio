import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, W } from '../lib/constants';
import { ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { PLACES } from '../lib/map/data';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, PaperTear, Sfx } from '../lib/fx/particles';
import { DropIn } from '../lib/fx/motion';
import { Highlighter, MapTitle } from '../lib/fx/text';
import { Paper3D } from '../lib/fx/depth';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { scene } from '../vo/cues';
import { DateCard, HomeHidden, Label } from './kit';

/**
 * S09 — REPEAL + DECLARATORY ACT (13485 → 14698, 20.2 s). Parchment, London. Frames LOCAL.
 *  "Boycott हुआ"               unsold goods pile up on the London docks (crates, bolts, sacks)
 *  "अठारह March"               date card 18 March 1766
 *  "वापस ले लिया गया"           the Stamp Act tears in two and flies off
 *  "एक और क़ानून आया"           Britain (standing up out of the map) smirks
 *  "Declaratory Act"           the Declaratory Act spins in beside it
 *  "in all cases whatsoever"   the phrase, typeset large, gets highlighted
 */

const GOODS = ['props/tea_chest.png', 'props/fabric_bolt.png', 'props/coffee_sack.png', 'props/tea_chest.png', 'props/molasses_barrel.png', 'props/fabric_bolt.png', 'props/tea_chest.png'];

const DockPile: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame > exit + 10) return null;
  const [lx, ly] = toScreen(...PLACES.london);
  const o = 1 - ramp(frame, exit, 10, ease.in);
  const spots: [number, number][] = [[-330, 80], [-60, 90], [210, 80], [-200, -140], [70, -150], [-70, -360], [180, -330]];
  return (
    <div style={{ opacity: o }}>
      {spots.map(([dx, dy], i) => (
        <DropIn key={i} start={start + i * 7} src={staticFile(`assets/${GOODS[i]}`)} x={lx + 520 + dx} y={ly + 120 + dy} w={330} h={330} rotate={(i % 3) - 1} />
      ))}
    </div>
  );
};

export const S09Repeal: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S09_repeal');
  const boycottAt = c.at('Boycott हुआ');
  const dateAt = c.at('अठारह March');
  const repealAt = c.at('वापस ले लिया गया');
  const smirkAt = c.at('एक और क़ानून आया');
  const declAt = c.at('Declaratory Act');
  const phraseAt = c.at('in all cases whatsoever');
  const len = c.duration;
  const gb = useMemo(() => greatBritain1763(), []);
  const gbAt: [number, number] = [W * 0.32, H * 0.52];

  const camera: CamKey[] = [
    { frame: 0, lon: -40, lat: 45, span: 60 },
    { frame: 30, lon: 2.5, lat: 51.5, span: 14 },
    { frame: smirkAt - 10, lon: 1.0, lat: 52.5, span: 16 },
    { frame: smirkAt + 10, lon: 6.0, lat: 53.0, span: 26 },
    { frame: len, lon: 6.5, lat: 53.0, span: 24 },
  ];

  return (
    <AbsoluteFill>
      <Grade look="parchment">
        <MapStage style="parchment" camera={camera} above={[reliefRaster('europe', 0.45)]}
          world={<HomeHidden feature={gb} start={smirkAt} />}
          overlay={
            <>
              <DockPile start={boycottAt + 6} exit={repealAt + 80} />
              {frame < smirkAt + 4 && <LondonDot />}
              <Label x={W * 0.7} y={H * 0.16} text="Boycott" start={boycottAt + 10} exit={dateAt + 60} size={130} color={C.dateYellow} />
              {frame >= smirkAt && (
                <MapCharacter feature={gb} height={1200} start={smirkAt} path={[{ at: 0, x: gbAt[0], y: gbAt[1] }]}
                  moods={[[smirkAt, 'smug'], [declAt + 20, 'grin']]} look={[[0, 1]]} talk={[[declAt, declAt + 80]]}
                  glove={[{ at: declAt + 4, pose: 'point', angle: -10, reach: 1 }]} />
              )}
            </>
          }
        />
      </Grade>
      <DateCard x={W * 0.5} y={H * 0.16} text="18 March 1766" start={dateAt} exit={smirkAt} />
      <Sequence from={repealAt - 30} durationInFrames={smirkAt - repealAt + 30} layout="none">
        <PaperTear x={W * 0.5} y={H * 0.56} w={900} h={1260} src={staticFile('assets/docs/doc_stamp_act_1765.png')} tearAt={30} flingAt={44} />
        <MapTitle x={W * 0.5} y={H * 0.9} text="Stamp Act repealed" start={34} size={110} />
      </Sequence>
      {frame >= declAt && (
        <Paper3D src={staticFile('assets/docs/doc_declaratory_act_1766.png')} x={W * 0.68} y={H * 0.5} w={1300} h={1300} start={declAt} baseTilt={[5, -12, 3]} swing={3} />
      )}
      {frame >= phraseAt && <Whatsoever start={phraseAt} />}

      <Sfx at={boycottAt} file="sting_hit.wav" volume={0.35} />
      {GOODS.map((_, i) => <Sfx key={i} at={boycottAt + 6 + i * 7 + 12} file="thud_soft.wav" volume={0.3} />)}
      <Sfx at={dateAt} file="pop.wav" volume={0.45} />
      <Sfx at={repealAt} file="paper_tear.wav" volume={0.6} />
      <Sfx at={repealAt + 14} file="whoosh_fast.wav" volume={0.4} />
      <Sfx at={smirkAt} file="pop_low.wav" volume={0.45} />
      <Sfx at={declAt} file="paper_swish.wav" volume={0.5} />
      <Sfx at={phraseAt} file="timpani_hit.wav" volume={0.4} />
      <Sfx at={phraseAt + 10} file="pen_draw.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

const LondonDot: React.FC = () => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(...PLACES.london);
  return (
    <>
      <div style={{ position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: '50%', background: C.stampRed, border: '7px solid #fff' }} />
      <div style={{ position: 'absolute', left: x - 420, top: y - 150, fontFamily: FONTS.serif, fontWeight: 700, fontSize: 110, color: '#fff', textShadow: '0 6px 20px rgba(0,0,0,0.6)' }}>London</div>
    </>
  );
};

/** The phrase, set as a strip of the Act's own wording, highlighted. */
const Whatsoever: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, start, 12, ease.out);
  const w = 2700;
  return (
    <AbsoluteFill style={{ background: `rgba(10,8,6,${0.5 * a})` }}>
      <div style={{ position: 'absolute', left: W / 2 - w / 2, top: H * 0.38, width: w, padding: '70px 0', background: '#F1E3BE', opacity: a,
        transform: `rotate(-1.5deg) scale(${0.9 + 0.1 * a})`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 80, color: '#5B4026' }}>…to bind the colonies and people of America…</div>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 20 }}>
          <Highlighter x={-20} y={14} w={1850} h={170} start={start + 10} chars={26} />
          <div style={{ position: 'relative', fontFamily: FONTS.serif, fontWeight: 700, fontSize: 150, color: '#2A1A0E' }}>in all cases whatsoever</div>
        </div>
        <div style={{ fontFamily: FONTS.label, fontWeight: 700, fontSize: 60, color: '#8A6A40', marginTop: 20 }}>Declaratory Act · 18 March 1766</div>
      </div>
    </AbsoluteFill>
  );
};
