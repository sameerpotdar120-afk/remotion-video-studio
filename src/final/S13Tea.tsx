import React, { useMemo } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, H, W } from '../lib/constants';
import { ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill } from '../lib/map/layers';
import { PLACES, country } from '../lib/map/data';
import { featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { DropIn, Fling, PopIn } from '../lib/fx/motion';
import { MapTitle, MarkerLoop, StrikeThrough } from '../lib/fx/text';
import { ZoomBlurIn } from '../lib/fx/transitions';
import { Puppet, hop } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { Counter, DateCard, Label, Plate, PriceTag, Splash } from './kit';

/**
 * S13 — TEA ACT → BOSTON TEA PARTY (18006 → 19806, 30.0 s). Frames LOCAL.
 *  "Tea Act"                 the Townshend list again: Glass/Lead/Paint/Paper struck out, a marker loop on Tea
 *  "East India Company"      swing to India: Bengal pulses (the Company's tea)
 *  "चाय बिक नहीं रही"         London: tea chests pile up at the Company warehouse
 *  "चाय सस्ती भी हो गई"       price tag drops
 *  "उसूल की है"               a Boston colonist crosses his arms (smug): it's the principle
 *  "सोलह December"           date card → Griffin's Wharf at night
 *  "भेस बदलकर"               three disguised colonists pop in (blanket + soot, no feathers)
 *  "तीन जहाज़ों पर चढ़े"       they hop up the gangway
 *  "Dartmouth / Eleanor / Beaver"  ship labels
 *  "तीन सौ बयालीस पेटियाँ"    counter to 342 as chests fly into the harbour, splash after splash
 *  "समुद्र में फेंक दीं"       title: Boston Tea Party / 16 December 1773
 */

const S = 1700; // Townshend doc size
const WATER = H * 0.68; // harbour surface on the wharf plate (right half)
const ROWS = { glass: 0.446, lead: 0.514, paint: 0.586, paper: 0.657, tea: 0.726 };

const TeaOnly: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  if (frame > exit + 12) return null;
  const out = ramp(frame, exit, 12, ease.in);
  const x0 = W / 2 - S / 2;
  const y0 = H / 2 - S / 2;
  const row = (r: number) => y0 + r * S;
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Img src={staticFile('assets/docs/doc_townshend_list.png')} style={{ position: 'absolute', left: x0, top: y0, width: S, height: S, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.45))' }} />
      {[ROWS.glass, ROWS.lead, ROWS.paint, ROWS.paper].map((r, i) => (
        <StrikeThrough key={i} x={x0 + S * 0.4} y={row(r)} w={S * 0.2} start={start + 6 + i * 6} width={16} />
      ))}
      <MarkerLoop cx={x0 + S * 0.5} cy={row(ROWS.tea)} rx={S * 0.12} ry={S * 0.045} start={start + 34} />
    </AbsoluteFill>
  );
};

const Bengal: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  const d = useMemo(() => featurePath(country('Bangladesh')), []);
  if (frame < start || frame > exit) return null;
  const o = 0.5 + 0.35 * Math.sin((frame - start) / 7);
  return <path d={d} fill={C.congressOrange} opacity={o} />;
};

/** Tea chests stack up beside the warehouse icon in London. */
const Warehouse: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start || frame > exit + 10) return null;
  const [lx, ly] = toScreen(...PLACES.london);
  const o = 1 - ramp(frame, exit, 10, ease.in);
  const spots: [number, number][] = [[-260, 220], [20, 230], [300, 220], [-120, 0], [160, 10], [20, -210]];
  return (
    <div style={{ opacity: o }}>
      <PopIn start={start} x={lx - 520} y={ly - 60} w={700} h={700}>
        <Img src={staticFile('assets/icons/warehouse_icon.png')} style={{ width: 700, height: 700 }} />
      </PopIn>
      {spots.map(([dx, dy], i) => (
        <DropIn key={i} start={start + 14 + i * 9} src={staticFile('assets/props/tea_chest.png')} x={lx + 380 + dx} y={ly + 80 + dy} w={300} h={300} />
      ))}
      <Label x={lx + 380} y={ly - 380} text="East India Company" start={start + 10} size={90} />
    </div>
  );
};

/** On the wharf: disguised colonists hop up to the deck, chests fly off into the water. */
const Wharf: React.FC<{ len: number; disguiseAt: number; climbAt: number; dartAt: number; eleAt: number; beavAt: number; chestAt: number; titleAt: number }> = ({
  len, disguiseAt, climbAt, dartAt, eleAt, beavAt, chestAt, titleAt,
}) => {
  const frame = useCurrentFrame();
  const crew = [0, 1, 2];
  const deck: [number, number] = [W * 0.36, H * 0.5];
  const chestStarts = Array.from({ length: 12 }).map((_, i) => chestAt + i * 9);
  return (
    <>
      <Grade look="night" brightness={0.9}>
        <Plate bg="bg_griffins_wharf_1773_night.jpg" camera={[{ frame: 0, x: 0, y: 0, zoom: 1.0 }, { frame: chestAt, x: -120, y: 30, zoom: 1.12 }, { frame: len, x: -160, y: 30, zoom: 1.16 }]} blur={3}>
          {crew.map((i) => {
            const climb = ramp(frame, climbAt + i * 10, 46, ease.inOut);
            const x0 = W * (0.12 + i * 0.13);
            const y0 = H * (0.98 - i * 0.02);
            const x = x0 + (deck[0] - 120 + i * 140 - x0) * climb;
            const y = y0 + (deck[1] + 40 - y0) * climb + (climb > 0 && climb < 1 ? hop(frame, climbAt + i * 10, 18, 40) : 0);
            const h = 900 - climb * 280;
            return <Puppet key={i} rig={RIGS.teaPartyDisguised} x={x} y={y} height={h} start={disguiseAt + i * 6} seed={`tp${i}`} look={1}
              moods={[[0, 'smug'], [chestAt, 'grin']]} />;
          })}
          {chestStarts.map((f, i) => {
            // each chest flies on a gravity arc from the rail and lands on the harbour surface (y = WATER)
            const vx = 32 + (i % 4) * 6;
            const vy = -18 - (i % 3) * 3;
            const g = 1.8;
            const x0 = deck[0] + 120;
            const y0 = deck[1] - 60;
            const tHit = (-vy + Math.sqrt(vy * vy + 2 * g * (WATER - y0))) / g;
            return (
              <React.Fragment key={i}>
                <Fling start={f} src={staticFile('assets/props/tea_chest.png')} x={x0} y={y0} w={190} vx={vx} vy={vy} g={g} spin={i % 2 ? 14 : -12} life={Math.ceil(tHit)} />
                <Splash x={x0 + vx * tHit} y={WATER} start={f + Math.ceil(tHit)} n={14} size={1.3} />
              </React.Fragment>
            );
          })}
        </Plate>
      </Grade>
      <Label x={W * 0.33} y={H * 0.1} text="Dartmouth" start={dartAt} size={96} />
      <Label x={W * 0.56} y={H * 0.15} text="Eleanor" start={eleAt} size={96} />
      <Label x={W * 0.72} y={H * 0.33} text="Beaver" start={beavAt} size={96} />
      <Counter x={W * 0.86} y={H * 0.16} to={342} start={chestAt} dur={100} size={240} sub="chests of tea" exit={titleAt - 6} />
      <MapTitle x={W * 0.5} y={H * 0.78} text="Boston Tea Party" date="16 December 1773" start={titleAt} size={190} />
    </>
  );
};

export const S13Tea: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S13_tea');
  const actAt = c.at('Tea Act');
  const eicAt = c.at('East India Company');
  const unsoldAt = c.at('चाय बिक नहीं रही');
  const cheapAt = c.at('चाय सस्ती भी हो गई');
  const principleAt = c.at('उसूल की है');
  const dateAt = c.at('सोलह December');
  const disguiseAt = c.at('भेस बदलकर');
  const climbAt = c.at('तीन जहाज़ों पर चढ़े');
  const dartAt = c.at('Dartmouth');
  const eleAt = c.at('Eleanor');
  const beavAt = c.at('Beaver');
  const chestAt = c.at('तीन सौ बयालीस पेटियाँ');
  const titleAt = c.at('समुद्र में फेंक दीं');
  const len = c.duration;
  const wharfAt = dateAt + 60;

  const camera: CamKey[] = [
    { frame: 0, lon: -40, lat: 35, span: 120 },
    { frame: eicAt, lon: -20, lat: 30, span: 150 },
    { frame: eicAt + 30, lon: 82, lat: 22, span: 34 }, // swing to India
    { frame: unsoldAt - 10, lon: 75, lat: 30, span: 60 },
    { frame: unsoldAt + 20, lon: 0, lat: 51.5, span: 12 }, // London
    { frame: principleAt - 10, lon: -1, lat: 51.4, span: 12 },
    { frame: principleAt + 20, lon: -71.0, lat: 42.3, span: 6 }, // Boston
    { frame: wharfAt, lon: -71.05, lat: 42.36, span: 3 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence durationInFrames={wharfAt + 4} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={camera} above={[reliefRaster('world', 0.35)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <Bengal start={eicAt + 30} exit={unsoldAt} />
              </>
            }
            overlay={
              <>
                <Warehouse start={unsoldAt + 20} exit={principleAt - 10} />
                {frame >= eicAt + 30 && frame < unsoldAt && <BengalLabel />}
              </>
            }
          />
        </Grade>
        <Sequence durationInFrames={eicAt + 10} layout="none"><TeaOnly start={actAt} exit={eicAt - 6} /></Sequence>
        <MapTitle x={W * 0.5} y={H * 0.07} text="Tea Act" date="1773" start={actAt + 4} exit={eicAt - 6} size={120} />
        {frame >= cheapAt && frame < principleAt && (
          <>
            <PriceTag x={W * 0.3} y={H * 0.3} text="Tea" start={cheapAt} size={150} />
            <PriceTag x={W * 0.3} y={H * 0.3 + 300 * ramp(frame, cheapAt + 30, 20, ease.in)} text="↓ सस्ती" start={cheapAt + 30} size={120} rotate={6} />
          </>
        )}
        {frame >= principleAt + 10 && (
          <Puppet rig={RIGS.colonist} x={W * 0.3} y={H * 1.02} height={1400} start={principleAt + 10} seed="pp" look={1}
            moods={[[0, 'smug']]} armL={[{ at: principleAt + 18, angle: 20, reach: 0.5 }]} armR={[{ at: principleAt + 18, angle: 160, reach: 0.5 }]} />
        )}
        <Label x={W * 0.3} y={H * 0.2} text="Principle." start={principleAt + 24} exit={dateAt} size={120} color={C.dateYellow} />
        <DateCard x={W * 0.7} y={H * 0.2} text="16 December 1773" start={dateAt} />
      </Sequence>
      <Sequence from={wharfAt} layout="none">
        <ZoomBlurIn dur={8}>
          <Wharf len={len - wharfAt} disguiseAt={disguiseAt - wharfAt} climbAt={climbAt - wharfAt} dartAt={dartAt - wharfAt} eleAt={eleAt - wharfAt}
            beavAt={beavAt - wharfAt} chestAt={chestAt - wharfAt} titleAt={titleAt - wharfAt} />
        </ZoomBlurIn>
      </Sequence>

      <Sfx at={actAt} file="paper_slide.wav" volume={0.45} />
      {[0, 1, 2, 3].map((i) => <Sfx key={i} at={actAt + 6 + i * 6} file="pen_draw.wav" volume={0.28} />)}
      <Sfx at={actAt + 34} file="pen_draw.wav" volume={0.4} />
      <Sfx at={eicAt} file="whoosh_big.wav" volume={0.45} />
      <Sfx at={unsoldAt} file="whoosh_fast.wav" volume={0.4} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Sfx key={`c${i}`} at={unsoldAt + 34 + i * 9 + 12} file="thud_soft.wav" volume={0.28} />)}
      <Sfx at={cheapAt + 30} file="whoosh_down.wav" volume={0.4} />
      <Sfx at={principleAt + 10} file="pop_low.wav" volume={0.4} />
      <Sfx at={dateAt} file="pop.wav" volume={0.45} />
      <Sfx at={wharfAt} file="whoosh_big.wav" volume={0.4} />
      <Sfx at={disguiseAt} file="pop.wav" volume={0.35} />
      {[0, 1, 2].map((i) => <Sfx key={`h${i}`} at={climbAt + i * 10} file="click_soft.wav" volume={0.25} />)}
      {[dartAt, eleAt, beavAt].map((f) => <Sfx key={f} at={f} file="pop_high.wav" volume={0.35} />)}
      {Array.from({ length: 12 }).map((_, i) => <Sfx key={`s${i}`} at={chestAt + i * 9 + 34} file="thud_soft.wav" volume={0.22} />)}
      <Sfx at={titleAt} file="timpani_hit.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

const BengalLabel: React.FC = () => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(90.3, 23.8);
  return <Label x={x + 420} y={y - 120} text="Bengal" start={0} size={120} />;
};

