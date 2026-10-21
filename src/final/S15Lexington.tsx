import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, DrawLine } from '../lib/map/layers';
import { PLACES } from '../lib/map/data';
import { pathGen } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, MuzzleSmoke, Sfx } from '../lib/fx/particles';
import { PopIn, Shake } from '../lib/fx/motion';
import { WordReveal } from '../lib/fx/text';
import { BlackHold, ZoomBlurIn } from '../lib/fx/transitions';
import { Puppet, musketMount } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';
import { NeonMark, Plate, PlaceDot } from './kit';

/**
 * S15 — LEXINGTON & CONCORD, 19 APRIL 1775 (20649 → 22533, 31.4 s). Night map → dawn plate → black. Frames LOCAL.
 *  "अठारह April"                 night map of Boston; two lanterns pop in the Old North Church steeple
 *  "Concord में रखे हथियार"        the route Boston → Lexington → Concord draws on
 *  "Paul Revere घोड़े पर"          Revere gallops along the route
 *  "myth भी तोड़ दो"               myth card: "The British are coming!"
 *  "अंग्रेज़ ही मानते थे"            neon X over it; what he really said: "The Regulars are coming out."
 *  "उन्नीस April की सुबह"           dawn on Lexington Green: militia (left) facing redcoats (right), long hold
 *  "एक गोली चली"                  ONE puff of smoke between the lines, one shake; the music cuts
 *  "आज तक कोई नहीं जानता"          a question mark fades over the smoke
 *  "आठ लोग मारे गए"               eight small markers fade in on the green
 *  "The shot heard round the world"  the quote, word by word, then the one black hold
 */

// Boston → Charlestown → Menotomy → Lexington → Concord (the 1775 road, approximate)
const ROUTE: [number, number][] = [[-71.06, 42.37], [-71.12, 42.39], [-71.16, 42.415], [-71.2295, 42.4473], [-71.29, 42.455], [-71.3489, 42.4604]];

const Lanterns: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(...PLACES.boston);
  const flick = 0.85 + 0.15 * Math.sin(frame / 3);
  return (
    <>
      <div style={{ position: 'absolute', left: x - 320, top: y - 640, width: 640, height: 640, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,190,90,0.55), rgba(255,160,60,0) 65%)', opacity: flick * ramp(frame, start, 10, ease.out) }} />
      <PopIn start={start} x={x} y={y - 330} w={440} h={440}>
        <Img src={staticFile('assets/props/lantern_pair.png')} style={{ width: 440, height: 440, filter: `brightness(${1 + 0.2 * flick})` }} />
      </PopIn>
    </>
  );
};

/** Revere on horseback along the route (screen-space follow of the lon/lat polyline). */
const Ride: React.FC<{ start: number; dur: number }> = ({ start, dur }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const p = Math.min(1, (frame - start) / dur);
  const seg = p * (ROUTE.length - 1);
  const i = Math.min(ROUTE.length - 2, Math.floor(seg));
  const f = seg - i;
  const [a, b] = [toScreen(...ROUTE[i]), toScreen(...ROUTE[i + 1])];
  const x = a[0] + (b[0] - a[0]) * f;
  const y = a[1] + (b[1] - a[1]) * f - Math.abs(Math.sin(frame / 4)) * 26;
  const w = 760;
  // the PNG gallops LEFT: the route runs west, so no flip
  return <Img src={staticFile('assets/chars/paul_revere_on_horse.png')} style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.6, width: w, transform: `rotate(${Math.sin(frame / 4) * 3}deg) scale(${popScale(frame, start)})` }} />;
};

const MythCard: React.FC<{ start: number; xAt: number; exit: number }> = ({ start, xAt, exit }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > exit + 10) return null;
  const out = 1 - ramp(frame, exit, 10, ease.in);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <PopIn start={start} x={W * 0.5} y={H * 0.42} w={2300} h={520} rotate={-3}>
        <div style={{ width: 2300, height: 520, background: '#F3E6C4', borderRadius: 26, boxShadow: '0 30px 60px rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONTS.serif, fontWeight: 700, fontSize: 170, color: '#3A2616' }}>“The British are coming!”</div>
      </PopIn>
      <NeonMark x={W * 0.5} y={H * 0.42} size={720} start={xAt} />
      {frame >= xAt + 30 && (
        <div style={{ position: 'absolute', left: W * 0.5, top: H * 0.74, transform: `translate(-50%, -50%) scale(${popScale(frame, xAt + 30)})`, fontFamily: FONTS.serif, fontWeight: 700,
          fontSize: 120, color: '#fff', textShadow: '0 6px 20px rgba(0,0,0,0.6)', whiteSpace: 'nowrap', textAlign: 'center' }}>
          “The Regulars are coming out.”
          <div style={{ fontFamily: FONTS.label, fontSize: 60, color: C.dateYellow }}>1775: they were all British</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Lexington Green at dawn: two lines face each other; one shot; eight markers. */
const Green: React.FC<{ shotAt: number; unknownAt: number; deadAt: number; quoteAt: number }> = ({ shotAt, unknownAt, deadAt, quoteAt }) => {
  const frame = useCurrentFrame();
  const musketM = staticFile('assets/props/musket_militia.png');
  const musketR = staticFile('assets/props/musket_brown_bess.png');
  const militia = [0, 1, 2, 3, 4];
  const regulars = [0, 1, 2, 3, 4, 5];
  const q = ramp(frame, unknownAt, 20, ease.out) * (1 - ramp(frame, quoteAt - 10, 10, ease.in));
  return (
    <>
      {militia.map((i) => {
        const h = 560 - i * 25;
        return <Puppet key={`m${i}`} rig={i === 2 ? RIGS.colonistBearded : RIGS.militia} x={W * (0.1 + i * 0.07)} y={H * (0.9 - i * 0.03)} height={h} seed={`mil${i}`}
          moods={[[0, 'worried'], [shotAt, 'shocked']]} mount={musketMount(i === 2 ? RIGS.colonistBearded : RIGS.militia, 99999, musketM)} />;
      })}
      {regulars.map((i) => {
        const h = 600 - i * 22;
        return <Puppet key={`r${i}`} rig={RIGS.redcoat} x={W * (0.9 - i * 0.065)} y={H * (0.92 - i * 0.03)} height={h} flip seed={`reg${i}`}
          moods={[[0, 'angry'], [shotAt, 'shocked']]} mount={musketMount(RIGS.redcoat, 40 + i * 6, musketR)} />;
      })}
      <MuzzleSmoke x={W * 0.6} y={H * 0.6} start={shotAt} size={420} dir={1} />
      {frame >= unknownAt && (
        <div style={{ position: 'absolute', left: W * 0.5, top: H * 0.42, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * q})`, opacity: q * 0.92,
          fontFamily: FONTS.serif, fontWeight: 700, fontSize: 520, color: '#fff', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>?</div>
      )}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = frame - (deadAt + i * 10);
        if (t < 0) return null;
        const o = interpolate(t, [0, 16], [0, 0.95], clamp);
        return (
          <div key={i} style={{ position: 'absolute', left: W * (0.12 + (i % 4) * 0.09), top: H * (0.78 + Math.floor(i / 4) * 0.08), width: 70, height: 70, borderRadius: '50%',
            background: C.stampRed, border: '8px solid #fff', opacity: o, boxShadow: '0 0 30px rgba(200,30,43,0.7)' }} />
        );
      })}
    </>
  );
};

export const S15Lexington: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S15_lexington');
  const aprilAt = c.at('अठारह April');
  const routeAt = c.at('Concord में रखे हथियार');
  const rideAt = c.at('Paul Revere घोड़े पर');
  const mythAt = c.at('myth भी तोड़ दो');
  const xAt = c.at('अंग्रेज़ ही मानते थे');
  const dawnAt = c.at('उन्नीस April की सुबह');
  const shotAt = c.at('एक गोली चली');
  const unknownAt = c.at('आज तक कोई नहीं जानता');
  const deadAt = c.at('आठ लोग मारे गए');
  const quoteAt = c.at('The shot heard round the world');
  const len = c.duration;
  const routeD = useMemo(() => pathGen({ type: 'LineString', coordinates: ROUTE } as never) ?? '', []);

  const camera: CamKey[] = [
    { frame: 0, lon: -75.3, lat: 39.4, span: 18 },
    { frame: 30, lon: -71.08, lat: 42.37, span: 0.9 },
    { frame: routeAt - 10, lon: -71.1, lat: 42.38, span: 1.0 },
    { frame: routeAt + 20, lon: -71.2, lat: 42.41, span: 0.55 },
    { frame: rideAt + 220, lon: -71.25, lat: 42.43, span: 0.5 },
  ];
  const words = 'The shot heard round the world'.split(' ').map((w, i) => ({ w, at: quoteAt - dawnAt + 6 + i * 14 }));

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence durationInFrames={dawnAt + 6} layout="none">
        <Grade look="night" brightness={0.75}>
          <MapStage style="parchment" camera={camera} above={[reliefRaster('massachusetts', 0.7)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <DrawLine d={routeD} start={routeAt} duration={80} color="#FFD36A" width={14} dash={30} />
              </>
            }
            overlay={
              <>
                <Lanterns start={aprilAt + 30} />
                <PlaceDot lon={PLACES.boston[0]} lat={PLACES.boston[1]} label="Boston" start={aprilAt + 10} side="r" size={90} />
                <PlaceDot lon={PLACES.lexington[0]} lat={PLACES.lexington[1]} label="Lexington" start={routeAt + 40} side="l" size={90} />
                <PlaceDot lon={PLACES.concord[0]} lat={PLACES.concord[1]} label="Concord" start={routeAt + 70} side="l" size={90} />
                <Ride start={rideAt} dur={mythAt - rideAt + 30} />
              </>
            }
          />
        </Grade>
        <HindiTitle x={W * 0.5} y={H * 0.12} text="18 April 1775" start={aprilAt} exit={routeAt} size={140} />
        <MythCard start={mythAt} xAt={xAt} exit={dawnAt - 12} />
      </Sequence>

      <Sequence from={dawnAt} layout="none">
        <ZoomBlurIn dur={8}>
          <Shake hits={[shotAt - dawnAt]} amp={20} dur={10}>
            <Grade look="relief">
              <Plate bg="bg_lexington_green_1775_dawn.png" blur={3}
                camera={[{ frame: 0, x: 0, y: 0, zoom: 1.02 }, { frame: shotAt - dawnAt, x: 0, y: 0, zoom: 1.08 }, { frame: shotAt - dawnAt + 10, x: 0, y: -20, zoom: 1.22 }, { frame: len - dawnAt, x: 0, y: -20, zoom: 1.26 }]}>
                <Green shotAt={shotAt - dawnAt} unknownAt={unknownAt - dawnAt} deadAt={deadAt - dawnAt} quoteAt={quoteAt - dawnAt} />
              </Plate>
            </Grade>
          </Shake>
          <HindiTitle x={W * 0.5} y={H * 0.1} text="Lexington · 19 April 1775" start={10} exit={shotAt - dawnAt - 20} size={120} />
          <HindiTitle x={W * 0.3} y={H * 0.22} text="8" sub="militiamen killed" start={deadAt - dawnAt + 20} exit={quoteAt - dawnAt} size={200} />
          {frame >= quoteAt && (
            <AbsoluteFill style={{ background: `rgba(0,0,0,${0.6 * ramp(frame, quoteAt, 14, ease.out)})` }}>
              <WordReveal x={W / 2} y={H * 0.48} words={words} attribution="Ralph Waldo Emerson, 1837" size={170} color="#fff" />
            </AbsoluteFill>
          )}
        </ZoomBlurIn>
        <BlackHold at={len - dawnAt - 62} />
      </Sequence>

      <Sfx at={aprilAt} file="bell_ding.wav" volume={0.4} />
      <Sfx at={aprilAt + 30} file="pop.wav" volume={0.4} />
      <Sfx at={routeAt} file="pen_draw.wav" volume={0.45} />
      {Array.from({ length: 24 }).map((_, i) => <Sfx key={i} at={rideAt + i * 8} file="click_soft.wav" volume={0.22} />)}
      <Sfx at={mythAt} file="pop.wav" volume={0.45} />
      <Sfx at={xAt} file="sting_hit.wav" volume={0.45} />
      <Sfx at={dawnAt} file="whoosh_soft.wav" volume={0.35} />
      <Sfx at={shotAt} file="musket_shot.wav" volume={0.7} />
      {Array.from({ length: 8 }).map((_, i) => <Sfx key={`d${i}`} at={deadAt + i * 10} file="bell_ding.wav" volume={0.12} />)}
      <Sfx at={quoteAt} file="timpani_roll.wav" volume={0.35} />
      <Sfx at={len - 62} file="sub_drop.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
