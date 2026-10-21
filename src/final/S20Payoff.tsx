import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONTS, H, W } from '../lib/constants';
import { ease, popScale, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, NeonOutline, Territory, colonyPath } from '../lib/map/layers';
import { COLONY_IDS, colonies, country } from '../lib/map/data';
import { centroidLonLat, featurePath, project } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { PopIn, Shake } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { Flash } from '../lib/fx/transitions';
import { BourbonFrance, GrandUnion, UnionFlag1707 } from '../lib/fx/flags';
import { MapCharacter, greatBritain1763 } from '../lib/character/MapCharacter';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { HindiTitle } from './fx';
import { HomeHidden, Label } from './kit';

/**
 * S20 — THE ANSWER + PART 2 (27228 → 29520, 38.2 s). Frames LOCAL.
 *  "तो सत्रह सौ तिरसठ में"       recap: one card per law pops along a 1763 → 1776 timeline (20 f apart)
 *  "किसी एक tax से नहीं"         the cards fade; one word in the centre: फ़ैसला
 *  "फ़ैसला कौन करेगा"            tug-of-war: Britain (crown) vs three colonists on one rope
 *  "और क़रीब आ गईं"              the colonies slide together and the neon outline wraps them as one
 *  "Franklin का साँप"            the 1754 snake's eight pieces snap into one body
 *  "जीतना नहीं"                  war map: colonies blue vs British-held red; small flags pop
 *  "France इस जंग में"           the Bourbon flag pops over France
 *  "अगले part में"               Part 2 card
 *  "subscribe कर लो"             subscribe button + end card
 */

const RECAP: { year: string; label: string; src?: string }[] = [
  { year: '1763', label: 'Proclamation' },
  { year: '1764', label: 'Sugar Act', src: 'docs/doc_sugar_act_1764.png' },
  { year: '1765', label: 'Stamp Act', src: 'docs/doc_stamp_act_1765.png' },
  { year: '1766', label: 'Declaratory Act', src: 'docs/doc_declaratory_act_1766.png' },
  { year: '1767', label: 'Townshend', src: 'docs/doc_townshend_list.png' },
  { year: '1770', label: 'Massacre', src: 'props/candle_lit.png' },
  { year: '1773', label: 'Tea Party', src: 'props/tea_chest.png' },
  { year: '1774', label: 'Intolerable Acts', src: 'docs/doc_intolerable_acts.png' },
  { year: '1775', label: 'Lexington', src: 'props/musket_militia.png' },
];

const Recap: React.FC<{ start: number; exit: number }> = ({ start, exit }) => {
  const frame = useCurrentFrame();
  if (frame > exit + 14) return null;
  const out = 1 - ramp(frame, exit, 14, ease.in);
  const n = RECAP.length;
  const x0 = W * 0.08;
  const dx = (W * 0.84) / (n - 1);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: x0, top: H * 0.66, height: 8, width: W * 0.84 * ramp(frame, start, 30, ease.out), background: '#fff', boxShadow: '0 0 20px #fff' }} />
      {RECAP.map((r, i) => {
        const at = start + i * 20;
        const x = x0 + i * dx;
        return (
          <React.Fragment key={r.year}>
            <PopIn start={at} x={x} y={H * 0.48} w={340} h={340} rotate={(i % 2 ? 5 : -5)}>
              {r.src ? (
                <Img src={staticFile(`assets/${r.src}`)} style={{ width: 340, height: 340, objectFit: 'contain', filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.45))' }} />
              ) : (
                <svg width={340} height={340} viewBox="0 0 100 100"><path d="M10 80 C 30 60, 50 70, 60 45 S 85 25, 92 12" stroke={C.stampRed} strokeWidth={6} strokeDasharray="10 7" fill="none" /></svg>
              )}
            </PopIn>
            <Label x={x} y={H * 0.72} text={r.year} start={at + 4} size={80} color={C.dateYellow} />
            <Label x={x} y={H * 0.79} text={r.label} start={at + 6} size={50} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Tug-of-war: Britain on the right pulls against three colonists on the left. */
const TugOfWar: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const sway = Math.sin(t / 14) * 70 + Math.sin(t / 5) * 10;
  const gb = useMemo(() => greatBritain1763(), []);
  const y = H * 0.62;
  return (
    <AbsoluteFill style={{ transform: `translateX(${sway}px)` }}>
      <Img src={staticFile('assets/props/rope_tug.png')} style={{ position: 'absolute', left: W * 0.18, top: y - 420, width: W * 0.64, height: 840, objectFit: 'fill' }} />
      {[0, 1, 2].map((i) => (
        <Puppet key={i} rig={[RIGS.colonist, RIGS.militia, RIGS.colonistBearded][i]} x={W * (0.12 + i * 0.09)} y={H * 0.92} height={820} start={start + i * 6} seed={`tw${i}`}
          moods={[[0, 'angry']]} idle={0} />
      ))}
      <MapCharacter feature={gb} height={1000} start={start + 4} path={[{ at: 0, x: W * 0.86, y: H * 0.56 }]} moods={[[0, 'furious']]} look={[[0, -1]]}
        glove={[{ at: start + 10, pose: 'fist', angle: 180, reach: 0.8 }]} />
      <Img src={staticFile('assets/props/crown_gold.png')} style={{ position: 'absolute', left: W * 0.86 - 110, top: H * 0.56 - 680, width: 300, transform: `scale(${popScale(frame, start + 10)}) rotate(8deg)` }} />
      <Label x={W * 0.86} y={H * 0.12} text="Crown" start={start + 8} size={110} />
      <Label x={W * 0.22} y={H * 0.12} text="Colonies" start={start + 14} size={110} color={C.dateYellow} />
    </AbsoluteFill>
  );
};

/** The colonies drift in from apart and lock together. */
const Together: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const ds = useMemo(() => COLONY_IDS.map((k) => colonyPath(k)), []);
  const p = ramp(frame, start, 50, ease.out);
  return (
    <>
      {ds.map((d, i) => {
        const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === COLONY_IDS[i])!);
        const [x, y] = project(lon, lat);
        const [cx, cy] = project(-76, 39);
        const k = (1 - p) * 0.55;
        return <path key={i} d={d} fill="#4579AD" stroke="#fff" strokeWidth={1.4} vectorEffect="non-scaling-stroke" transform={`translate(${(x - cx) * k} ${(y - cy) * k})`} />;
      })}
    </>
  );
};

/** Join, or Die: eight snake pieces (S.C. tail → N.E. head) snap into one body. */
const Snake: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const labels = ['S.C.', 'N.C.', 'V.', 'M.', 'P.', 'N.J.', 'N.Y.', 'N.E.'];
  const snap = ramp(frame, start + 50, 16, ease.snap);
  const n = labels.length;
  const seg = 300;
  const x0 = W * 0.5 - (n * seg) / 2;
  const yAt = (x: number) => H * 0.52 + Math.sin(x / 260) * 120;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {labels.map((l, i) => {
          const a = x0 + i * seg;
          const b = a + seg;
          const gap = (1 - snap) * 70 * (i - (n - 1) / 2);
          const dy = (1 - snap) * (i % 2 ? -60 : 60);
          const pts = Array.from({ length: 11 }).map((_, k) => {
            const x = a + ((b - a) * k) / 10;
            return `${x + gap},${yAt(x) + dy}`;
          });
          const appear = ramp(frame, start + i * 5, 10, ease.out);
          return (
            <g key={l} opacity={appear}>
              <polyline points={pts.join(' ')} fill="none" stroke="#1E140C" strokeWidth={70} strokeLinecap={snap > 0.95 ? 'round' : 'butt'} />
              <polyline points={pts.join(' ')} fill="none" stroke="#6E8A3A" strokeWidth={54} strokeLinecap={snap > 0.95 ? 'round' : 'butt'} />
              <text x={(a + b) / 2 + gap} y={yAt((a + b) / 2) + dy + 120} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={76} fill="#fff"
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 8 }}>{l}</text>
              {i === n - 1 && (
                <g transform={`translate(${b + gap} ${yAt(b) + dy})`}>
                  <ellipse cx={40} cy={0} rx={80} ry={56} fill="#6E8A3A" stroke="#1E140C" strokeWidth={10} />
                  <circle cx={66} cy={-18} r={10} fill="#1E140C" />
                  <path d="M 116 6 L 160 0 M 116 6 L 158 18" stroke={C.stampRed} strokeWidth={8} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <MapTitle x={W / 2} y={H * 0.18} text="JOIN, or DIE." date="Benjamin Franklin · 1754" start={start + 10} size={170} />
      <Flash at={start + 64} dur={6} />
    </AbsoluteFill>
  );
};

/** Small flag that pops in at a lon/lat (screen layer). */
const MiniFlag: React.FC<{ lon: number; lat: number; start: number; kind: 'gu' | 'uk' | 'fr'; w?: number }> = ({ lon, lat, start, kind, w = 360 }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(lon, lat);
  const s = popScale(frame, start);
  const wave = Math.sin(frame / 8) * 3;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.6 - 120, transform: `scale(${s}) rotate(${wave}deg)`, transformOrigin: '0% 100%' }}>
      <div style={{ position: 'absolute', left: -8, top: 0, width: 14, height: w * 0.6 + 120, background: '#3A2616' }} />
      <div style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>
        {kind === 'gu' ? <GrandUnion width={w} /> : kind === 'uk' ? <UnionFlag1707 width={w} /> : <BourbonFrance width={w} />}
      </div>
    </div>
  );
};

const EndCard: React.FC<{ partAt: number; subAt: number }> = ({ partAt, subAt }) => {
  const frame = useCurrentFrame();
  if (frame < partAt) return null;
  const a = ramp(frame, partAt, 16, ease.out);
  const click = subAt + 30;
  const clicked = frame >= click;
  const cursorP = ramp(frame, subAt + 6, 22, ease.inOut);
  return (
    <AbsoluteFill style={{ background: `rgba(12,9,6,${0.86 * a})` }}>
      <div style={{ position: 'absolute', left: W / 2, top: H * 0.32, transform: `translate(-50%, -50%) scale(${popScale(frame, partAt)})`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 300, color: C.dateYellow, letterSpacing: 10 }}>PART 2</div>
        <div style={{ fontFamily: FONTS.display, fontSize: 130, color: '#fff' }}>जंग · 1776–1783</div>
      </div>
      {frame >= subAt && (
        <div style={{ position: 'absolute', left: W / 2, top: H * 0.72, transform: `translate(-50%, -50%) scale(${popScale(frame, subAt) * (clicked && frame < click + 6 ? 0.92 : 1)})`,
          background: clicked ? '#555' : '#CC0000', color: '#fff', borderRadius: 30, padding: '40px 110px', fontFamily: FONTS.label, fontWeight: 700, fontSize: 120, letterSpacing: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{clicked ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}</div>
      )}
      {frame >= subAt + 6 && (
        <svg width={120} height={160} viewBox="0 0 24 32" style={{ position: 'absolute', left: interpolate(cursorP, [0, 1], [W * 0.85, W * 0.56]), top: interpolate(cursorP, [0, 1], [H * 0.95, H * 0.74]) }}>
          <path d="M2 2 L2 26 L8 20 L12 30 L16 28 L12 18 L20 18 Z" fill="#fff" stroke="#000" strokeWidth={1.6} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const S20Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S20_payoff_close');
  const recapAt = c.at('तो सत्रह सौ तिरसठ में');
  const wordAt = c.at('किसी एक tax से नहीं');
  const tugAt = c.at('फ़ैसला कौन करेगा');
  const closerAt = c.at('और क़रीब आ गईं');
  const snakeAt = c.at('Franklin का साँप');
  const warAt = c.at('जीतना नहीं');
  const franceAt = c.at('France इस जंग में');
  const partAt = c.at('अगले part में');
  const subAt = c.at('subscribe कर लो');
  const len = c.duration;
  const allCol = useMemo(() => featurePath({ type: 'FeatureCollection', features: colonies.features } as never), []);
  const canada = useMemo(() => country('Canada'), []);
  const gb = useMemo(() => greatBritain1763(), []);

  const mapCam: CamKey[] = [
    { frame: 0, lon: -76, lat: 39, span: 34 },
    { frame: snakeAt - closerAt, lon: -76, lat: 39, span: 30 },
  ];
  const warCam: CamKey[] = [
    { frame: 0, lon: -68, lat: 44, span: 52 },
    { frame: franceAt - warAt - 10, lon: -66, lat: 44, span: 50 },
    { frame: franceAt - warAt + 24, lon: -36, lat: 44, span: 82 },
    { frame: len - warAt, lon: -34, lat: 44, span: 80 },
  ];

  return (
    <AbsoluteFill style={{ background: '#16110C' }}>
      {/* 1 · recap and the one word */}
      <Sequence durationInFrames={tugAt + 4} layout="none">
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #3A2B1C 0%, #120D08 75%)' }}>
          <Recap start={recapAt + 6} exit={wordAt} />
          <HindiTitle x={W / 2} y={H * 0.48} text="फ़ैसला" sub="कौन करेगा?" start={wordAt + 16} size={380} />
        </AbsoluteFill>
      </Sequence>
      {/* 2 · tug of war */}
      <Sequence from={tugAt} durationInFrames={closerAt - tugAt} layout="none">
        <Grade look="relief">
          <AbsoluteFill style={{ background: 'linear-gradient(#4B6E86, #A9B9B5 60%, #8A7A55 61%, #6C5B3C)' }} />
          <Shake hits={[40, 120, 200, 280]} amp={8} dur={8}>
            <TugOfWar start={6} />
          </Shake>
        </Grade>
      </Sequence>
      {/* 3 · together, then the snake */}
      <Sequence from={closerAt} durationInFrames={warAt - closerAt} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={mapCam} above={[reliefRaster('eastcoast', 0.5)]}
            world={
              <>
                {frame < snakeAt && <Together start={0} />}
                {frame >= snakeAt && <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />}
                <NeonOutline d={allCol} start={60} hold={snakeAt - closerAt - 60} />
              </>
            }
          />
        </Grade>
        {frame >= snakeAt && (
          <AbsoluteFill style={{ background: `rgba(16,12,8,${0.72 * ramp(frame, snakeAt, 12, ease.out)})` }}>
            <Snake start={snakeAt - closerAt} />
          </AbsoluteFill>
        )}
      </Sequence>
      {/* 4 · the war map, France */}
      <Sequence from={warAt} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={warCam} above={[reliefRaster('atlantic', 0.45)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#3C6FB4" flash="#3C6FB4" opacity={0.95} />
                <Territory feature={canada} start={10} to={C.britainRed} mode="smash" opacity={0.85} />
                <HomeHidden feature={gb} start={-999} />
                <path d={featurePath(gb)} fill={C.britainRed} />
                <Territory feature={country('France')} start={franceAt - warAt} to={C.franceBlue} mode="fade" opacity={0.85} />
              </>
            }
            overlay={
              <>
                <MiniFlag lon={-77} lat={38.5} start={30} kind="gu" />
                <MiniFlag lon={-72.5} lat={43.2} start={42} kind="gu" w={280} />
                <MiniFlag lon={-80} lat={34.5} start={54} kind="gu" w={280} />
                <MiniFlag lon={-73} lat={48.5} start={66} kind="uk" />
                <MiniFlag lon={-1.8} lat={53} start={78} kind="uk" w={280} />
                <MiniFlag lon={2.4} lat={46.6} start={franceAt - warAt + 30} kind="fr" w={520} />
                <Label x={W * 0.5} y={H * 0.1} text="War" start={20} exit={franceAt - warAt} size={150} />
                {frame >= franceAt + 40 && <FranceLabel />}
              </>
            }
          />
        </Grade>
        <EndCard partAt={partAt - warAt} subAt={subAt - warAt} />
      </Sequence>

      <Sfx at={recapAt} file="riser.wav" volume={0.3} />
      {RECAP.map((_, i) => <Sfx key={i} at={recapAt + 6 + i * 20} file="pop.wav" volume={0.3} />)}
      <Sfx at={wordAt + 16} file="timpani_hit.wav" volume={0.45} />
      <Sfx at={tugAt} file="whoosh_fast.wav" volume={0.4} />
      {[40, 120, 200, 280].map((d) => <Sfx key={d} at={tugAt + d} file="thud_soft.wav" volume={0.3} />)}
      <Sfx at={closerAt} file="whoosh_soft.wav" volume={0.35} />
      <Sfx at={closerAt + 50} file="thud_soft.wav" volume={0.45} />
      <Sfx at={closerAt + 60} file="sting_shimmer.wav" volume={0.35} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Sfx key={`sn${i}`} at={snakeAt + i * 5} file="click_soft.wav" volume={0.25} />)}
      <Sfx at={snakeAt + 50} file="impact_boom.wav" volume={0.45} />
      <Sfx at={warAt} file="snare_roll.wav" volume={0.35} />
      {[30, 42, 54, 66, 78].map((d) => <Sfx key={`f${d}`} at={warAt + d} file="pop.wav" volume={0.3} />)}
      <Sfx at={franceAt + 30} file="sting_crown.wav" volume={0.45} />
      <Sfx at={partAt} file="whoosh_big.wav" volume={0.45} />
      <Sfx at={partAt + 6} file="timpani_hit.wav" volume={0.45} />
      <Sfx at={subAt} file="pop_high.wav" volume={0.45} />
      <Sfx at={subAt + 30} file="click_soft.wav" volume={0.6} />
      <Sfx at={subAt + 34} file="bell_ding.wav" volume={0.45} />
    </AbsoluteFill>
  );
};

const FranceLabel: React.FC = () => {
  const { toScreen } = useMap();
  const [x, y] = toScreen(2.4, 46.6);
  return <Label x={x} y={y + 160} text="France · 1778" start={0} size={100} />;
};
