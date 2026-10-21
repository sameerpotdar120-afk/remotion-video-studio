import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import type { Feature, Geometry } from 'geojson';
import { C, H, W } from '../lib/constants';
import { clamp, ease, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, DrawLine, MapPin } from '../lib/map/layers';
import { PLACES, country, rivers } from '../lib/map/data';
import { featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, MuzzleSmoke, Sfx } from '../lib/fx/particles';
import { PopIn, Shake } from '../lib/fx/motion';
import { ArrowLabel, MapTitle } from '../lib/fx/text';
import { ParallaxPlate } from '../lib/fx/depth';
import { Flash, ZoomBlurIn, ZoomBlurOut } from '../lib/fx/transitions';
import { UnionFlag1707 } from '../lib/fx/flags';
import { Puppet, musketMount, mountTip } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { AssetImg } from '../lib/assets';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';

/**
 * S04 — JUMONVILLE GLEN 1754 → A WORLD WAR (5333 → 7620, 38.1 s). Frames LOCAL to the scene.
 *  "अट्ठाईस May"                       push from S03's wide map into western Pennsylvania ; pin + date
 *  "Ohio नदी"                          the Allegheny + Monongahela + Ohio draw on, glowing blue
 *  "Britain और France, दोनों का दावा"   the Ohio country hatched red and blue, both pulsing (overlapping claims)
 *  "बाईस साल का एक लड़का"               zoom-blur into the dawn forest plate; young Washington slides in, "22"
 *  "French camp पर हमला"               his Virginians raise muskets (staggered) and fire across the glen
 *  "पंद्रह minute"                      the 15-minute watch pops over the smoke
 *  "Jumonville मारा जाता है"            the French officer tips over
 *  "George Washington."                name + arrow on him, held in silence (music drops out)
 *  "British की तरफ़ से"                 the 1707 Union Flag pops beside him
 *  "World War बन गई"                   smash-cut to the world: embers fly from the glen to Europe, the Caribbean, India
 *  "Seven Years' War"                  title slam
 */

const ohioRivers = rivers.features.filter((f) => ['Allegheny', 'Monongahela', 'Ohio'].includes(f.properties?.name));
// (ring wound clockwise on screen, as d3-geo expects, or it fills the whole globe minus the area)
// The Ohio country claimed by both crowns in 1754: south of Lake Erie, north/west of the Ohio, west of the Alleghenies
const OHIO_COUNTRY: Feature<Geometry> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-78.9, 42.0], [-78.6, 40.2], [-79.9, 40.4], [-80.6, 40.6], [-81.6, 39.2], [-82.6, 38.6], [-84.4, 39.1], [-85.8, 37.9], [-88.1, 37.1], [-87.6, 41.7], [-84.8, 41.7], [-82.7, 41.6], [-80.5, 42.1], [-78.9, 42.0],
    ]],
  },
};

const EUROPE = ['United Kingdom', 'France', 'Germany', 'Austria', 'Czechia', 'Poland', 'Spain', 'Portugal', 'Sweden', 'Netherlands', 'Belgium'];
const CARIBBEAN = ['Cuba', 'Jamaica', 'Haiti', 'Dominican Rep.', 'Puerto Rico', 'Bahamas'];
const EMBER = '#FF7A2E';

/** Red and blue diagonal hatching, offset so both colours show: two empires claiming the same land. */
const ContestedClaim: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  const { scale } = useMap();
  const d = useMemo(() => featurePath(OHIO_COUNTRY), []);
  if (frame < start) return null;
  const a = ramp(frame, start, 14, ease.out) * (1 - ramp(frame, exit, 12, ease.in));
  const pulse = 0.72 + 0.28 * Math.sin((frame - start) / 9);
  const s = 46 / scale; // stripe pitch: constant on screen
  return (
    <g opacity={a}>
      <defs>
        <pattern id="claim" width={s * 2} height={s * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width={s} height={s * 2} fill={C.britainRed} opacity={pulse} />
          <rect x={s} width={s} height={s * 2} fill={C.franceBlue} opacity={1.72 - pulse} />
        </pattern>
      </defs>
      <path d={d} fill="url(#claim)" opacity={0.78} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={6 / scale} strokeDasharray={`${28 / scale} ${18 / scale}`} />
    </g>
  );
};

/** Blue river glow: a wide soft stroke under a crisp one. */
const RiverGlow: React.FC<{ start: number }> = ({ start }) => {
  const paths = useMemo(() => ohioRivers.map((f) => featurePath(f as Feature<Geometry>)), []);
  return (
    <>
      {paths.map((d, i) => (
        <g key={i} style={{ filter: 'drop-shadow(0 0 10px #8FD3FF)' }}>
          <DrawLine d={d} start={start + i * 10} duration={50} color="#9ED8FF" width={22} />
          <DrawLine d={d} start={start + i * 10} duration={50} color="#E9F7FF" width={8} />
        </g>
      ))}
    </>
  );
};

/** Embers fly in arcs from the glen to each theatre, then the theatre glows (screen space). */
const EmberArc: React.FC<{ to: [number, number]; start: number }> = ({ to, start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x0, y0] = toScreen(...PLACES.jumonvilleGlen);
  const [x1, y1] = toScreen(...to);
  const p = ramp(frame, start, 26, ease.inOut);
  const lift = -Math.hypot(x1 - x0, y1 - y0) * 0.28;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + lift;
  const d = `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`;
  const len = 1;
  const pt = (t: number) => [
    (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1,
    (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1,
  ];
  const [hx, hy] = pt(p);
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width={W} height={H}>
      <path d={d} fill="none" stroke={EMBER} strokeWidth={9} strokeLinecap="round" pathLength={len} strokeDasharray={`${p} 1`} opacity={0.85}
        style={{ filter: `drop-shadow(0 0 14px ${EMBER})` }} />
      {p < 1 && <circle cx={hx} cy={hy} r={22} fill="#FFE2A8" style={{ filter: `drop-shadow(0 0 24px ${EMBER})` }} />}
    </svg>
  );
};

/** A theatre of war catches fire: countries flash ember-orange and keep a slow burning pulse. */
const Burn: React.FC<{ names: string[]; start: number }> = ({ names, start }) => {
  const frame = useCurrentFrame();
  const ds = useMemo(() => names.map((n) => featurePath(country(n))), [names]);
  if (frame < start) return null;
  const t = frame - start;
  const o = interpolate(t, [0, 4, 24], [0, 1, 0.62], clamp) + 0.12 * Math.sin(t / 8);
  return (
    <g style={{ filter: `drop-shadow(0 0 18px ${EMBER})` }}>
      {ds.map((d, i) => (
        <path key={i} d={d} fill={t < 4 ? '#FFE2A8' : EMBER} opacity={o} />
      ))}
    </g>
  );
};

/** The glen catches first: pulsing ember rings from the pin. */
const FireRings: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(...PLACES.jumonvilleGlen);
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame - start + i * 22) % 66) / 66;
        return (
          <div key={i} style={{ position: 'absolute', left: x - 260 * t, top: y - 260 * t, width: 520 * t, height: 520 * t, borderRadius: '50%', border: `10px solid ${EMBER}`, opacity: (1 - t) * 0.9 }} />
        );
      })}
      <div style={{ position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: '50%', background: '#FFE2A8', boxShadow: `0 0 60px 30px ${EMBER}` }} />
    </>
  );
};

/* ───────────────────────────── the forest at dawn ───────────────────────────── */

const Forest: React.FC<{ len: number; volleyAt: number; clockAt: number; deathAt: number; nameAt: number; flagAt: number }> = ({
  len, volleyAt, clockAt, deathAt, nameAt, flagAt,
}) => {
  const frame = useCurrentFrame();
  const musket = staticFile('assets/props/musket_militia.png');
  const rig = RIGS.militia;
  const wash = { x: W * 0.3, y: H * 0.94, height: 1300 };
  // Virginians behind Washington, staged back → front, raising one after another (ref volley: 8–12 f apart)
  const squad = [
    { x: W * 0.12, y: H * 0.82, height: 950, raise: volleyAt + 6 },
    { x: W * 0.48, y: H * 0.86, height: 1050, raise: volleyAt + 14 },
  ];
  const fire = volleyAt + 44;
  const mounts = squad.map((p, i) => musketMount(rig, p.raise, musket, { recoilAt: [fire + i * 4] }));
  const french = { x: W * 0.78, y: H * 0.76, height: 820 };
  const washX = interpolate(ramp(frame, 0, 18, ease.out), [0, 1], [-700, wash.x]);
  // camera: slow push, punch toward Washington on his name, settle
  const camera = [
    { frame: 0, x: 0, y: 0, zoom: 1.0 },
    { frame: nameAt - 4, x: 0, y: 0, zoom: 1.06 },
    { frame: nameAt + 10, x: 520, y: -60, zoom: 1.32 },
    { frame: flagAt + 120, x: 560, y: -60, zoom: 1.36 },
  ];
  return (
    <Shake hits={[fire, fire + 4]} amp={18} dur={10}>
      <ParallaxPlate
        camera={camera}
        layers={[
          { src: staticFile('assets/bg/bg_forest_ohio_1754_dawn.jpg'), depth: 0.25, blur: 5 },
          { src: staticFile('assets/bg/bg_forest_ohio_1754_dawn_fg.png'), depth: 1 },
        ]}
      >
        <AbsoluteFill>
          <Puppet rig={RIGS.frenchOfficer} x={french.x} y={french.y} height={french.height} start={volleyAt - 30} flip seed="jumonville"
            moods={[[volleyAt - 30, 'neutral'], [fire, 'shocked']]} fallAt={deathAt} />
          {squad.map((p, i) => (
            <Puppet key={i} rig={rig} x={p.x} y={p.y} height={p.height} start={volleyAt - 50 + i * 6} seed={`va${i}`}
              moods={[[0, 'neutral'], [p.raise - 8, 'angry']]} mount={mounts[i]} />
          ))}
          {squad.map((p, i) => {
            const [mx, my] = mountTip(mounts[i], fire + i * 4, { ...p, aspect: rig.aspect });
            return <MuzzleSmoke key={`m${i}`} x={mx} y={my} start={fire + i * 4} size={260} dir={1} />;
          })}
          <Puppet rig={RIGS.washingtonYoung} x={washX} y={wash.y} height={wash.height} start={0} seed="gw"
            moods={[[0, 'neutral'], [volleyAt, 'angry'], [deathAt + 10, 'shocked'], [nameAt + 30, 'neutral']]} look={1} />
        </AbsoluteFill>
      </ParallaxPlate>
      <AbsoluteFill>
        <HindiTitle x={W * 0.3} y={H * 0.16} text="22 साल" start={20} exit={volleyAt - 20} size={160} />
        <PopIn start={clockAt} exit={deathAt - 6} x={W * 0.62} y={H * 0.16} w={460} h={460}>
          <AssetImg path="icons/clock_15min.png" w={460} h={460} />
        </PopIn>
        <HindiTitle x={W * 0.62} y={H * 0.36} text="15 minute" start={clockAt + 6} exit={deathAt - 6} size={130} />
        <MapTitle x={W * 0.56} y={H * 0.12} text="George Washington" date="1754" start={nameAt} size={150} exit={len - 30} />
        <ArrowLabel x={W * 0.56} y={H * 0.12} text="" to={[W * 0.36, H * 0.3]} start={nameAt + 6} />
        <PopIn start={flagAt} x={W * 0.05 + 350} y={H * 0.2 + 175} w={700} h={350} rotate={-4} exit={len - 20}>
          <div style={{ width: 700, height: 350, boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}>
            <UnionFlag1707 width={700} />
          </div>
        </PopIn>
        <MapTitle x={W * 0.05 + 350} y={H * 0.2 + 420} text="British side" start={flagAt + 8} size={64} mode="fade" exit={len - 20} />
      </AbsoluteFill>
    </Shake>
  );
};

export const S04FirstShot: React.FC = () => {
  const c = scene('S04_first_shot');
  const dateAt = c.at('अट्ठाईस May');
  const riverAt = c.at('Ohio नदी');
  const claimAt = c.at('Britain और France, दोनों का दावा');
  const boyAt = c.at('बाईस साल का एक लड़का');
  const volleyAt = c.at('French camp पर हमला');
  const clockAt = c.at('पंद्रह minute');
  const deathAt = c.at('Jumonville मारा जाता है');
  const nameAt = c.at('George Washington.');
  const flagAt = c.at('British की तरफ़ से');
  const worldAt = c.at('World War बन गई');
  const europeAt = c.at('Europe');
  const caribAt = c.at('Caribbean');
  const indiaAt = c.at('हमारे भारत तक');
  const titleAt = c.at("Seven Years' War");
  const len = c.duration;

  const camera: CamKey[] = [
    { frame: 0, lon: -72.0, lat: 38.6, span: 40 }, // S03's last framing
    { frame: 34, lon: -80.2, lat: 40.1, span: 10 }, // punch-in sandwich into western PA
    { frame: riverAt - 10, lon: -81.6, lat: 39.9, span: 14 },
    { frame: claimAt + 6, lon: -82.8, lat: 39.7, span: 17 },
    { frame: boyAt, lon: -80.0, lat: 39.9, span: 9 },
  ];
  const worldCam: CamKey[] = [
    { frame: 0, lon: -15, lat: 28, span: 205 },
    { frame: indiaAt - worldAt - 4, lon: -5, lat: 27, span: 200 },
    { frame: indiaAt - worldAt + 10, lon: 20, lat: 25, span: 182 }, // nudge toward India
    { frame: len - worldAt, lon: 18, lat: 25, span: 176 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · the map: pin, rivers, the contested Ohio country */}
      <Sequence durationInFrames={boyAt + 6} layout="none">
        <ZoomBlurOut at={boyAt - 6} dur={6}>
          <Grade look="parchment">
            <MapStage
              style="parchment"
              camera={camera}
              above={[reliefRaster('appalachians'), reliefRaster('na3d', 0.35)]}
              world={
                <>
                  <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.9} />
                  <ContestedClaim start={claimAt} exit={boyAt + 20} />
                  <RiverGlow start={riverAt} />
                </>
              }
              overlay={<MapPin lon={PLACES.jumonvilleGlen[0]} lat={PLACES.jumonvilleGlen[1]} start={dateAt + 30} label="Jumonville Glen" date="28 May 1754" />}
            />
          </Grade>
        </ZoomBlurOut>
      </Sequence>

      {/* 2 · the forest at dawn */}
      <Sequence from={boyAt} durationInFrames={worldAt - boyAt} layout="none">
        <ZoomBlurIn dur={6}>
          <Grade look="relief">
            <Forest len={worldAt - boyAt} volleyAt={volleyAt - boyAt} clockAt={clockAt - boyAt} deathAt={deathAt - boyAt} nameAt={nameAt - boyAt} flagAt={flagAt - boyAt} />
          </Grade>
        </ZoomBlurIn>
      </Sequence>

      {/* 3 · smash-cut to the world: the fire spreads */}
      <Sequence from={worldAt} layout="none">
        <Grade look="parchment">
          <MapStage
            style="parchment"
            camera={worldCam}
            above={[reliefRaster('world', 0.4)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.9} />
                <Burn names={EUROPE} start={europeAt - worldAt + 24} />
                <Burn names={CARIBBEAN} start={caribAt - worldAt + 24} />
                <Burn names={['India']} start={indiaAt - worldAt + 24} />
              </>
            }
            overlay={
              <>
                <FireRings start={0} />
                <EmberArc to={[10, 50]} start={europeAt - worldAt} />
                <EmberArc to={[-75, 19.5]} start={caribAt - worldAt} />
                <EmberArc to={[79, 22]} start={indiaAt - worldAt} />
                <MapTitle x={W * 0.36} y={H * 0.74} text="Seven Years' War" date="1756–1763" start={titleAt - worldAt} size={190} />
              </>
            }
          />
        </Grade>
        <Flash at={0} dur={6} />
      </Sequence>

      {/* ── SFX: ~0.25–0.6 under VO; the name beat is left silent ── */}
      <Sfx at={0} file="whoosh_down.wav" volume={0.45} />
      <Sfx at={dateAt + 30} file="pop.wav" volume={0.45} />
      <Sfx at={riverAt} file="sting_shimmer.wav" volume={0.32} />
      <Sfx at={claimAt} file="pluck_up.wav" volume={0.35} />
      <Sfx at={claimAt + 14} file="pluck_down.wav" volume={0.35} />
      <Sfx at={boyAt - 6} file="whoosh_big.wav" volume={0.45} />
      <Sfx at={volleyAt - 4} file="musket_cock.wav" volume={0.4} />
      <Sfx at={volleyAt + 44} file="musket_shot.wav" volume={0.55} />
      <Sfx at={volleyAt + 48} file="musket_shot.wav" volume={0.5} />
      <Sfx at={volleyAt + 56} file="musket_volley.wav" volume={0.4} />
      <Sfx at={clockAt} file="tick.wav" volume={0.35} />
      <Sfx at={clockAt + 20} file="tick.wav" volume={0.3} />
      <Sfx at={deathAt + 6} file="thud_soft.wav" volume={0.45} />
      <Sfx at={flagAt} file="pop_high.wav" volume={0.4} />
      <Sfx at={worldAt} file="impact_boom.wav" volume={0.5} />
      <Sfx at={europeAt} file="whoosh_fast.wav" volume={0.35} />
      <Sfx at={caribAt} file="whoosh_fast.wav" volume={0.35} />
      <Sfx at={indiaAt} file="whoosh_fast.wav" volume={0.38} />
      <Sfx at={titleAt} file="timpani_hit.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
