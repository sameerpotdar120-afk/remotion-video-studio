import React from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FONTS, H, W } from '../lib/constants';
import { clamp, ease, popScale, ramp } from '../lib/easing';
import { MapStage, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, MapPin } from '../lib/map/layers';
import { PLACES } from '../lib/map/data';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, ImpactPuff, MuzzleSmoke, Sfx } from '../lib/fx/particles';
import { Fling, Shake } from '../lib/fx/motion';
import { MapTitle } from '../lib/fx/text';
import { IrisBlob, ZoomBlurIn } from '../lib/fx/transitions';
import { Puppet, musketMount, mountTip } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { FloatHearts, HindiTitle } from './fx';
import { Label, Plate } from './kit';

/**
 * S11 — BOSTON MASSACRE, 5 MARCH 1770 (15355 → 17487, 35.5 s). Frames LOCAL.
 *  "पाँच March"                  iris → Boston pin, 5 March 1770
 *  "ठंडी रात"                    zoom-blur into King Street at night, snow
 *  "धक्का-मुक्की"                 the crowd (backs of heads in the foreground) faces a line of redcoats
 *  "बर्फ़ के गोले"                a snowball hits a soldier
 *  "गोली चल गई"                  staggered raise → volley, smoke, shake
 *  "पाँच लोग मारे गए"             five candles light one by one, with the five names; music drops (memorial grade)
 *  "Crispus Attucks"             Attucks, respectful hold, name card
 *  "पहला शहीद"                   slow push-in, no SFX
 *  "Paul Revere ने इसकी एक तस्वीर" Revere's engraving spins in (an engraving-style stand-in built from our plate)
 *  "असल घटना इतनी सीधी नहीं"      split: the tidy engraving vs the chaotic street
 *  "viral post"                  hearts and shares burst off the engraving (gag)
 */

const VICTIMS = ['Crispus Attucks', 'Samuel Gray', 'James Caldwell', 'Samuel Maverick', 'Patrick Carr'];
const musket = staticFile('assets/props/musket_brown_bess.png');

/** King Street: the redcoats (right, facing left) and the crowd (left, facing right). */
const KingStreet: React.FC<{ snowAt: number; fireAt: number; chaos?: boolean; staticFrame?: number }> = ({ snowAt, fireAt, chaos = false, staticFrame }) => {
  const live = useCurrentFrame();
  const frame = staticFrame ?? live;
  const rig = RIGS.redcoat;
  const squad = [
    { x: W * 0.62, y: H * 0.86, height: 1100, raise: fireAt - 40 },
    { x: W * 0.74, y: H * 0.9, height: 1200, raise: fireAt - 32 },
    { x: W * 0.87, y: H * 0.95, height: 1300, raise: fireAt - 24 },
  ];
  const mounts = squad.map((p, i) => musketMount(rig, p.raise, musket, { recoilAt: [fireAt + i * 3] }));
  const crowd = [
    { rig: RIGS.colonistBearded, x: W * 0.36, y: H * 0.9, h: 1050, m: 'angry' as const },
    { rig: RIGS.attucks, x: W * 0.22, y: H * 0.95, h: 1250, m: 'angry' as const },
    { rig: RIGS.colonist, x: W * 0.08, y: H * 0.92, h: 1100, m: 'angry' as const },
  ];
  return (
    <AbsoluteFill style={chaos ? { transform: 'rotate(-3deg) scale(1.06)' } : undefined}>
      {crowd.map((p, i) => (
        <Puppet key={i} rig={p.rig} x={p.x + (chaos ? (i - 1) * 90 : 0)} y={p.y} height={p.h} seed={`cr${i}`}
          moods={[[0, p.m], [fireAt, 'shocked']]} look={1} talk={frame < fireAt ? [[0, fireAt]] : []} />
      ))}
      {squad.map((p, i) => (
        <Puppet key={`r${i}`} rig={rig} x={p.x} y={p.y} height={p.height} flip seed={`kr${i}`}
          moods={[[0, 'worried'], [snowAt + 16, 'angry'], [fireAt + 20, 'shocked']]} mount={mounts[i]} />
      ))}
      {squad.map((p, i) => {
        const [mx, my] = mountTip(mounts[i], fireAt + i * 3, { ...p, flip: true, aspect: rig.aspect });
        return <MuzzleSmoke key={`m${i}`} x={mx} y={my} start={fireAt + i * 3} size={340} />;
      })}
    </AbsoluteFill>
  );
};

/** Five memorial candles, lit one after another, each with a name. */
const Candles: React.FC<{ start: number; per: number }> = ({ start, per }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 70%, #2A1C12 0%, #0B0806 70%)' }}>
      {VICTIMS.map((name, i) => {
        const t = frame - (start + i * per);
        const x = W * (0.14 + i * 0.18);
        const lit = t >= 0;
        const glow = lit ? interpolate(t, [0, 12], [0, 1], clamp) * (0.9 + 0.1 * Math.sin(frame / 5 + i)) : 0;
        return (
          <div key={name}>
            <div style={{ position: 'absolute', left: x - 380, top: H * 0.3 - 380, width: 760, height: 760, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,190,110,0.45), rgba(255,160,80,0) 65%)', opacity: glow }} />
            <Img src={staticFile('assets/props/candle_lit.png')} style={{ position: 'absolute', left: x - 330, top: H * 0.22, width: 660, height: 660,
              filter: lit ? `brightness(${0.6 + 0.4 * glow})` : 'brightness(0.25) saturate(0.4)' }} />
            {!lit && <div style={{ position: 'absolute', left: x - 70, top: H * 0.22, width: 140, height: 200, background: '#0B0806' }} />}
            <div style={{ position: 'absolute', left: x, top: H * 0.78, transform: 'translateX(-50%)', fontFamily: FONTS.serif, fontWeight: 600, fontSize: 74,
              color: '#F3E3C4', opacity: lit ? interpolate(t, [6, 22], [0, 1], clamp) : 0, whiteSpace: 'nowrap' }}>{name}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Engraving-style stand-in for Revere's print: our King Street frame, frozen at the volley, in sepia line-hatch,
 * inside a plate frame with Revere's own caption (the 1770 title is public domain).
 */
const Engraving: React.FC<{ w: number; h: number; fireAt: number }> = ({ w, h, fireAt }) => (
  <div style={{ width: w, height: h, background: '#EFE2C4', padding: w * 0.035, boxSizing: 'border-box', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '10px solid #3A2A1A' }}>
    <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: w * 0.034, color: '#2A1A0E', textAlign: 'center', lineHeight: 1.15 }}>
      The BLOODY MASSACRE perpetrated in King Street BOSTON on March 5th 1770
    </div>
    <div style={{ position: 'relative', marginTop: w * 0.02, width: '100%', height: (w * 0.93 * 9) / 16, overflow: 'hidden', border: '6px solid #3A2A1A' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${(w * 0.93) / W})`, transformOrigin: '0 0',
        filter: 'grayscale(1) sepia(0.85) contrast(1.5) brightness(1.15)' }}>
        <Img src={staticFile('assets/bg/bg_king_street_boston_1770_night.jpg')} style={{ position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', filter: 'brightness(1.8)' }} />
        <KingStreet snowAt={-999} fireAt={fireAt} staticFrame={fireAt + 4} />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, rgba(40,25,10,0.22) 0 2px, transparent 2px 7px)', mixBlendMode: 'multiply' }} />
    </div>
    <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: w * 0.022, color: '#5B4026', textAlign: 'center', marginTop: w * 0.015 }}>Engrav'd, Printed &amp; Sold by PAUL REVERE, BOSTON</div>
  </div>
);

const Tilted: React.FC<{ start: number; x: number; y: number; scale?: number; children: React.ReactNode }> = ({ start, x, y, scale = 1, children }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, 16, ease.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, perspective: 2600 }}>
      <div style={{ transform: `translate(-50%, -50%) rotateY(${(1 - t) * 70 - 8}deg) rotateX(4deg) rotateZ(-2deg) scale(${(0.6 + 0.4 * t) * scale})`, opacity: t }}>{children}</div>
    </div>
  );
};

export const S11Massacre: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S11_massacre');
  const dateAt = c.at('पाँच March');
  const nightAt = c.at('ठंडी रात');
  const pushAt = c.at('धक्का-मुक्की');
  const snowAt = c.at('बर्फ़ के गोले');
  const fireAt = c.at('गोली चल गई');
  const deadAt = c.at('पाँच लोग मारे गए');
  const attucksAt = c.at('Crispus Attucks');
  const martyrAt = c.at('पहला शहीद');
  const revereAt = c.at('Paul Revere ने इसकी एक तस्वीर');
  const splitAt = c.at('असल घटना इतनी सीधी नहीं');
  const viralAt = c.at('viral post');
  const len = c.duration;
  const fire = fireAt + 30;

  const mapCam: CamKey[] = [
    { frame: 0, lon: -70.95, lat: 42.3, span: 3.9 },
    { frame: nightAt, lon: -71.03, lat: 42.36, span: 1.6 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · Boston pin */}
      <Sequence durationInFrames={nightAt + 4} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={mapCam} above={[reliefRaster('massachusetts', 0.6)]}
            world={<ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />}
            overlay={<MapPin lon={PLACES.boston[0]} lat={PLACES.boston[1]} start={dateAt + 14} label="Boston" date="5 March 1770" />} />
        </Grade>
        <IrisBlob at={0} />
      </Sequence>

      {/* 2 · King Street at night */}
      <Sequence from={nightAt} durationInFrames={deadAt - nightAt} layout="none">
        <ZoomBlurIn dur={8}>
          <Shake hits={[fire - nightAt, fire - nightAt + 3]} amp={22} dur={10}>
            <Grade look="night" brightness={0.8}>
              <Plate bg="bg_king_street_boston_1770_night.jpg" fg="bg_king_street_boston_1770_night_fg.png"
                camera={[{ frame: 0, x: 0, y: 0, zoom: 1.0 }, { frame: fire - nightAt, x: 0, y: 0, zoom: 1.1 }, { frame: fire - nightAt + 8, x: -80, y: 0, zoom: 1.18 }]} blur={4}>
                <KingStreet snowAt={snowAt - nightAt} fireAt={fire - nightAt} />
                <Fling start={snowAt - nightAt} src={staticFile('assets/props/snowball.png')} x={W * 0.3} y={H * 0.5} w={150} vx={52} vy={-22} g={1.6} spin={20} life={22} />
                <ImpactPuff x={W * 0.63} y={H * 0.43} start={snowAt - nightAt + 21} color="#F4F8FF" />
              </Plate>
            </Grade>
            <Img src={staticFile('assets/chars/crowd_boston_back_heads.png')} style={{ position: 'absolute', left: -160, top: H * 0.5, width: W * 0.66,
              filter: 'brightness(0.55) saturate(0.8)', opacity: interpolate(frame, [pushAt, pushAt + 14], [0, 1], clamp) }} />
          </Shake>
          <Label x={W * 0.5} y={H * 0.1} text="King Street" start={10} exit={pushAt} size={120} />
        </ZoomBlurIn>
      </Sequence>

      {/* 3 · five candles, then Attucks */}
      <Sequence from={deadAt} durationInFrames={attucksAt - deadAt} layout="none">
        <Grade look="parchment" mood="memorial">
          <Candles start={16} per={22} />
        </Grade>
      </Sequence>
      <Sequence from={attucksAt} durationInFrames={revereAt - attucksAt} layout="none">
        <Grade look="night" mood="memorial" brightness={0.85}>
          <Plate bg="bg_king_street_boston_1770_night.jpg" camera={[{ frame: 0, x: 0, y: 0, zoom: 1.02 }, { frame: revereAt - attucksAt, x: 120, y: -40, zoom: 1.22 }]} blur={10}>
            <Puppet rig={RIGS.attucks} x={W * 0.4} y={H * 1.02} height={1650} seed="att" moods={[[0, 'neutral']]} look={1} idle={2} />
          </Plate>
        </Grade>
        <MapTitle x={W * 0.7} y={H * 0.4} text="Crispus Attucks" date="Boston · 1770" start={8} size={150} />
        <HindiTitle x={W * 0.7} y={H * 0.62} text="पहला शहीद" start={martyrAt - attucksAt} size={150} color="#F3E3C4" />
      </Sequence>

      {/* 4 · the engraving, the split, the "viral post" */}
      <Sequence from={revereAt} layout="none">
        <AbsoluteFill style={{ background: '#1B1510' }}>
          {frame < splitAt + 10 ? (
            <Tilted start={0} x={W / 2} y={H * 0.5}>
              <Engraving w={2200} h={1600} fireAt={fire} />
            </Tilted>
          ) : (
            <>
              <div style={{ position: 'absolute', left: W * 0.25, top: H * 0.52, transform: 'translate(-50%, -50%) scale(0.86)' }}>
                <Engraving w={1760} h={1300} fireAt={fire} />
              </div>
              <div style={{ position: 'absolute', left: W * 0.5 + 30, top: H * 0.52 - (W * 0.47 * 9) / 32, width: W * 0.47, height: (W * 0.47 * 9) / 16, overflow: 'hidden', border: '10px solid #F3E3C4', boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                transform: `scale(${popScale(frame, splitAt + 10)})` }}>
                <div style={{ width: W, height: H, transform: `scale(${(W * 0.47) / W})`, transformOrigin: '0 0' }}>
                  <Grade look="night" brightness={0.85}>
                    <Img src={staticFile('assets/bg/bg_king_street_boston_1770_night.jpg')} style={{ position: 'absolute', inset: 0, width: W, height: H, objectFit: 'cover', filter: 'blur(4px)' }} />
                    <KingStreet snowAt={-999} fireAt={-999} chaos staticFrame={60} />
                    <MuzzleSmoke x={W * 0.55} y={H * 0.4} start={frame - 30} size={500} />
                  </Grade>
                </div>
              </div>
              <Label x={W * 0.25} y={H * 0.12} text="Revere's print" start={splitAt + 14} size={100} />
              <Label x={W * 0.735} y={H * 0.12} text="That night" start={splitAt + 22} size={100} />
            </>
          )}
          {frame >= viralAt && (
            <>
              <FloatHearts x={W * 0.25} y={H * 0.6} start={viralAt - revereAt} count={26} />
              <ShareBurst x={W * 0.25} y={H * 0.5} start={viralAt - revereAt + 10} />
            </>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* ── SFX ── music drops on the deaths; the martyr beat is silent */}
      <Sfx at={dateAt + 14} file="pop.wav" volume={0.45} />
      <Sfx at={nightAt} file="whoosh_big.wav" volume={0.4} />
      <Sfx at={pushAt} file="heartbeat_low.wav" volume={0.35} />
      <Sfx at={snowAt} file="whoosh_fast.wav" volume={0.35} />
      <Sfx at={snowAt + 21} file="thud_soft.wav" volume={0.5} />
      <Sfx at={fireAt + 6} file="musket_cock.wav" volume={0.4} />
      <Sfx at={fire} file="musket_volley.wav" volume={0.6} />
      {VICTIMS.map((_, i) => <Sfx key={i} at={deadAt + 16 + i * 22} file="bell_ding.wav" volume={0.16} />)}
      <Sfx at={revereAt} file="paper_swish.wav" volume={0.5} />
      <Sfx at={splitAt + 10} file="whoosh_fast.wav" volume={0.4} />
      <Sfx at={viralAt} file="pop_high.wav" volume={0.45} />
      <Sfx at={viralAt + 10} file="firework.wav" volume={0.25} />
    </AbsoluteFill>
  );
};

/** Share arrows and like counts popping off the print (the "viral post" gag). */
const ShareBurst: React.FC<{ x: number; y: number; start: number }> = ({ x, y, start }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const items = [
    { dx: -700, dy: -520, text: '↗ 10,000 shares' },
    { dx: 520, dy: -620, text: '♥ 25,000' },
    { dx: 620, dy: 380, text: '↗ Boston → London' },
  ];
  return (
    <>
      {items.map((it, i) => {
        const p = ramp(frame, start + i * 10, 18, ease.out);
        return (
          <div key={i} style={{ position: 'absolute', left: x + it.dx * p, top: y + it.dy * p, transform: `translate(-50%, -50%) scale(${popScale(frame, start + i * 10)})`,
            background: '#fff', borderRadius: 60, padding: '22px 46px', fontFamily: FONTS.label, fontWeight: 700, fontSize: 70, color: '#C8202E', whiteSpace: 'nowrap', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
            {it.text}
          </div>
        );
      })}
    </>
  );
};
