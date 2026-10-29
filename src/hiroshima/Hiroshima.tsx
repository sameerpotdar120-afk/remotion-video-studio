import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import {
  Art, CountCard, FITS, HH, HW, Layer, Plate, Rig, Shot, SpinWatch, Captions, WhipBlur,
  ease, keys, meta, ramp, rigPoint, rnd, src,
} from './kit';

/** Shot list, frame-exact from the reference (docs/hiroshima/ref_shots.json, ANALYSIS.md §2). */
export const TOTAL = 3901;
const CARDS: [number, number, number][] = [
  [50, 749, 806], [40, 1227, 1294], [30, 1703, 1761], [20, 2148, 2218], [10, 2719, 2781], [5, 3187, 3228], [2, 3411, 3437],
];

/** Renders children only on frames [a, b) — keyframes inside stay in global frames, so they line up with the VO words. */
const Seg: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => {
  const f = useCurrentFrame();
  return f >= a && f < b ? <>{children}</> : null;
};
const wave = (f: number, period: number, phase = 0) => Math.sin(((f / period) + phase) * Math.PI * 2);
/** Puppet walk: a hop every half period. */
const hop = (f: number, period: number, amp: number) => -Math.abs(Math.sin((f / period) * Math.PI)) * amp;

/* ───────────── 1 · breakfast (0–283) ───────────── */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  // chopsticks: bowl (-15°) ↔ mouth (+10°), a bite every ~70 frames, slowing as the camera pulls away
  const bite = (1 - Math.cos((f / 70) * Math.PI * 2)) / 2;
  const rK = -15 + 25 * ease.inOut(bite);
  const chew = f % 70 > 35 ? Math.sin(f * 0.9) * 4 : 0;
  // Hana sips on "FINISHING BREAKFAST"
  const rH = keys(f, [[195, 0], [222, 27], [250, 27], [276, 2]]);
  return (
    <Shot z={[[0, 1.55], [55, 1.55], [283, 1]]} x={[[0, -230], [55, -230], [283, 0]]} y={[[0, -170], [55, -170], [283, 40]]}>
      <Layer depth={0.55}><Plate p="bg/bg_breakfast_window.jpg" scale={1.08} oy={-60} /></Layer>
      <Layer depth={0.9}><Rig body="chars/hana_tea_body.png" fit={FITS.hanaTea} r={rH} x={HW * 0.84} y={HH * 0.97} h={HH * 0.48} /></Layer>
      <Layer depth={1}><Rig body="chars/kenji_eat_body.png" fit={FITS.kenjiEat} r={rK} x={HW * 0.4} y={HH * 1.0} h={HH * 0.6} bob={chew} /></Layer>
      <Layer depth={1.2}><Art p="props/newspaper_open.png" x={HW * 0.18} y={HH * 1.06} h={HH * 0.16} rot={-8} /></Layer>
      <SpinWatch n={60} inAt={6} outAt={65} />
    </Shot>
  );
};

/* ───────────── 2 · the siren (284–482) ───────────── */
const SOLDIER = { x: HW * 0.62, y: HH * 0.94, h: HH * 0.56 };
const ARM_TIP: [number, number] = [0.96, 0.86]; // end of the crank shaft in the soldier's arm drawing
const SIREN_H = HH * 0.19;
const HUB: [number, number] = [0.745, 0.35]; // the siren's crank hub (fraction of its canvas)
/** Siren (its own crank cut away: the soldier's arm carries the crank) with its grill spinning in place.
 *  The grill ellipse is cut out of the drawing and turned in un-squashed space. */
const Siren: React.FC<{ hx: number; hy: number; angle: number; blur: number }> = ({ hx, hy, angle, blur }) => {
  const p = 'props/hand_siren.png'; const m = meta(p); const b = m.box!;
  const k = SIREN_H / ((b[3] - b[1]) * m.h), W = m.w * k, H = m.h * k;
  const left = hx - HUB[0] * W, top = hy - HUB[1] * H;
  const cx = 0.21 * W, cy = 0.36 * H, rx = 0.128 * W, ry = 0.215 * H, sq = rx / ry;
  const noCrank = 'polygon(0 0, 100% 0, 100% 27%, 72% 27%, 72% 62%, 100% 62%, 100% 100%, 0 100%)';
  const crateW = W * 0.62, crateTop = top + 0.905 * H;
  return (
    <>
      <Crate x={left + 0.43 * W - crateW / 2} y={crateTop} w={crateW} h={HH * 0.94 - crateTop} />
      <div style={{ position: 'absolute', left, top, width: W, height: H, clipPath: noCrank }}>
        <Img src={src(p)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
        <div style={{ position: 'absolute', inset: 0, clipPath: `ellipse(${rx}px ${ry}px at ${cx}px ${cy}px)` }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scaleX(${sq}) rotate(${angle}deg) scaleX(${1 / sq})`, filter: blur ? `blur(${blur}px)` : undefined }}>
            <Img src={src(p)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
          </div>
        </div>
      </div>
    </>
  );
};
/** Wooden crate the siren stands on, drawn in the art's style: dark ink outline, warm planks, soft contact shadows. */
const Crate: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const lip = h * 0.13, pl = (h - lip) / 3;
  return (
    <svg style={{ position: 'absolute', left: x - 60, top: y - 20, overflow: 'visible' }} width={w + 120} height={h + 80}>
      <defs>
        <linearGradient id="crW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a4b28" /><stop offset="0.45" stopColor="#a8723f" /><stop offset="1" stopColor="#6b4022" /></linearGradient>
        <linearGradient id="crT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c48d55" /><stop offset="1" stopColor="#9a6535" /></linearGradient>
        <filter id="crS"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>
      <ellipse cx={60 + w / 2 + 40} cy={20 + h + 6} rx={w * 0.62} ry={34} fill="#3a2410" opacity={0.45} filter="url(#crS)" />
      <g transform="translate(60 20)">
        <rect x={0} y={lip} width={w} height={h - lip} rx={8} fill="url(#crW)" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M14 ${lip + pl * i + pl * 0.35} C ${w * 0.3} ${lip + pl * i + pl * 0.25}, ${w * 0.6} ${lip + pl * i + pl * 0.5}, ${w - 14} ${lip + pl * i + pl * 0.4}`} stroke="#5a3519" strokeWidth={4} fill="none" opacity={0.5} />
            <path d={`M30 ${lip + pl * i + pl * 0.7} C ${w * 0.4} ${lip + pl * i + pl * 0.62}, ${w * 0.7} ${lip + pl * i + pl * 0.8}, ${w - 40} ${lip + pl * i + pl * 0.72}`} stroke="#5a3519" strokeWidth={3} fill="none" opacity={0.35} />
            {i > 0 && <line x1={6} x2={w - 6} y1={lip + pl * i} y2={lip + pl * i} stroke="#2a1a10" strokeWidth={9} />}
          </g>
        ))}
        <rect x={w * 0.06} y={lip} width={w * 0.1} height={h - lip} fill="#5e3a1e" opacity={0.55} />
        <rect x={w * 0.84} y={lip} width={w * 0.1} height={h - lip} fill="#5e3a1e" opacity={0.55} />
        <rect x={0} y={lip} width={w} height={h - lip} rx={8} fill="none" stroke="#21140b" strokeWidth={12} />
        <rect x={-10} y={0} width={w + 20} height={lip} rx={8} fill="url(#crT)" stroke="#21140b" strokeWidth={12} />
        <ellipse cx={w * 0.47} cy={lip * 0.55} rx={w * 0.33} ry={lip * 0.32} fill="#3a2410" opacity={0.35} filter="url(#crS)" />
        <rect x={0} y={lip + 6} width={w} height={26} fill="#2a1a10" opacity={0.3} />
      </g>
    </svg>
  );
};
const S2: React.FC = () => {
  const f = useCurrentFrame();
  // crank speed: full until "BUT" (414), winds down to a stop on "STOPPED" (444)
  const speed = 1 - ramp(f, 414, 34, ease.out);
  let ang = 0;
  for (let i = 284; i < f; i++) ang += 22 * (1 - ramp(i, 414, 34, ease.out));
  const crank = wave(ang / 22, 16) * 12 * (0.25 + 0.75 * speed);
  const [hx, hy] = rigPoint('chars/soldier_siren_body.png', FITS.soldierCrank, SOLDIER.x, SOLDIER.y, SOLDIER.h, 0, ARM_TIP);
  const rig = (only: 'body' | 'arm') => <Rig only={only} body="chars/soldier_siren_body.png" fit={FITS.soldierCrank} r={crank} {...SOLDIER} />;
  return (
    <Shot z={[[284, 1.23], [482, 1]]} x={[[284, -40], [482, 30]]} y={[[284, -30], [482, 20]]} e={ease.soft}>
      <Layer depth={0.6}><Plate p="bg/bg_street_building.jpg" scale={1.06} /></Layer>
      <Layer depth={0.95}>
        {rig('body')}
        <Siren hx={hx} hy={hy} angle={ang} blur={speed * 3} />
        {rig('arm')}
      </Layer>
      <Layer depth={1.3}><Art p="chars/soldier_fg_blur.png" x={HW * 0.02} y={HH * 1.04} h={HH * 0.82} filter="blur(16px)" /></Layer>
    </Shot>
  );
};

/* ───────────── 3 · the plane, tilt down to the soldiers (483–748) ───────────── */
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = ramp(f, 576, 48, ease.inOut); // the full frame height in ~0.8 s
  const z = keys(f, [[483, 1.11], [748, 1]], ease.soft);
  const wav = f > 600 ? wave(f, 26) * 4 * ramp(f, 600, 10) : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#7fb6ea' }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: '50% 50%' }}>
        {/* sky panel */}
        <AbsoluteFill style={{ transform: `translateY(${-tilt * HH}px)` }}>
          <Plate p="bg/bg_sky_plain.jpg" scale={1.02} />
          {/* mirrored sky below the panel, so the crossfade into the soldiers never shows an edge */}
          <AbsoluteFill style={{ top: HH, transform: 'scaleY(-1)' }}><Plate p="bg/bg_sky_plain.jpg" scale={1.02} /></AbsoluteFill>
          <Art p="props/b29_side.png" x={HW * (0.42 + (f - 483) * 0.0009)} y={HH * 0.3} h={HH * 0.095} anchor={[0.5, 0.5]} rot={-4} />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateY(${-tilt * HH * 1.35 + HH * 0.06}px)` }}>
          <Art p="props/pine_trees_fg.png" x={HW * 0.5} y={HH * 1.08} h={HH * 0.4} sx={1.3}
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)' }} />
        </AbsoluteFill>
        {/* soldiers panel, one frame height below */}
        <AbsoluteFill style={{ transform: `translateY(${(1 - tilt) * HH}px)`, WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, #000 ${HH * 0.28}px)` }}>
          <Plate p="bg/bg_watch_post.jpg" scale={1.04} />
          <Art p="chars/soldier_thinking.png" x={HW * 0.3} y={HH * 1.02} h={HH * 0.66} rot={wave(f, 90) * 0.8} pivot={[0.5, 1]} />
          <Art p="chars/soldier_dismiss.png" x={HW * 0.74} y={HH * 1.03} h={HH * 0.68} rot={wav} pivot={[0.5, 1]} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── 5 · the newspaper, Hana walks in (806–1026) ───────────── */
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const walkT = ramp(f, 900, 92, ease.soft);
  const walking = f >= 900 && f < 992;
  const step = walking ? hop(f, 14, 18) : 0;
  return (
    <Shot z={[[806, 1.14], [1026, 1]]} x={[[806, -60], [1026, 50]]} e={ease.soft}>
      <Layer depth={0.7}><Plate p="bg/bg_room_lowtable.jpg" scale={1.05} /></Layer>
      <Layer depth={1}>
        <Art p={f < 841 ? 'chars/kenji_read.png' : 'chars/kenji_fold.png'} x={HW * 0.7} y={HH * 0.84} h={HH * (f < 841 ? 0.4 : 0.38)} />
        {f >= 900 && (
          <Art p={f < 992 ? 'chars/hana_walk_tray_a.png' : 'chars/hana_walk_tray_b.png'} x={HW * (-0.18 + 0.5 * walkT)} y={HH * 0.97 + step} h={HH * 0.52}
            rot={walking ? wave(f, 28) * 2 : 0} pivot={[0.5, 1]} />
        )}
      </Layer>
    </Shot>
  );
};

/* ───────────── 6 · kids walk to school (1027–1226) ───────────── */
const S6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shot z={[[1027, 1.11], [1226, 1]]} x={[[1027, -30], [1226, 40]]} e={ease.soft}>
      <Layer depth={0.5}><Plate p="bg/bg_hill_path.jpg" scale={1.06} /></Layer>
      <Layer depth={0.85}><Art p="chars/kids_group_b.png" x={HW * (0.66 + (f - 1027) * 0.0003)} y={HH * 0.72 + hop(f, 18, 8)} h={HH * 0.17} /></Layer>
      <Layer depth={1.1}><Art p="chars/kids_group_a.png" x={HW * (0.42 + (f - 1027) * 0.0006)} y={HH * 1.0 + hop(f, 20, 22)} h={HH * 0.46} rot={wave(f, 40) * 1.2} pivot={[0.5, 1]} /></Layer>
    </Shot>
  );
};

/* ───────────── 8 · the map (1294–1447) ───────────── */
const Reticle: React.FC<{ f: number }> = ({ f }) => {
  const r = 150 + Math.sin(f * 0.15) * 6;
  return (
    <svg width={HW} height={HH} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${HW / 2} ${HH * 0.5})`} fill="none" strokeLinecap="round">
        <circle r={r} stroke="#000" strokeWidth={34} opacity={0.55} />
        <circle r={r} stroke="#fff" strokeWidth={18} />
        <circle r={r * 0.42} stroke="#fff" strokeWidth={12} />
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1={r * 0.15} y1={0} x2={r * 1.25} y2={0} stroke="#000" strokeWidth={26} opacity={0.55} />
            <line x1={r * 0.15} y1={0} x2={r * 1.25} y2={0} stroke="#fff" strokeWidth={12} />
          </g>
        ))}
      </g>
    </svg>
  );
};
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f - 1294) / 60;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${-t * 156}px, ${-t * 54}px)` }}>
        <Plate p="bg/bg_city_map.jpg" scale={1.2} ox={200} oy={70} />
      </AbsoluteFill>
      <Reticle f={f} />
    </AbsoluteFill>
  );
};

/* ───────────── 9 · he pauses, listens (1448–1702) ───────────── */
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const front = f >= 1522;
  return (
    <Shot z={[[1448, 1.03], [1702, 1]]} x={[[1448, -20], [1702, 10]]}>
      <Layer depth={0.7}><Plate p="bg/bg_room_clock.jpg" scale={1.04} /></Layer>
      <Layer depth={0.85}><Art p="chars/hana_walk_tray_b.png" x={HW * 0.82} y={HH * 0.64} h={HH * 0.25} /></Layer>
      <Layer depth={1}>
        {front
          ? <Art p="chars/kenji_listen.png" x={HW * 0.44} y={HH * 1.02} h={HH * 0.62} rot={wave(f, 120) * 0.6} pivot={[0.5, 1]} />
          : <Art p="chars/kenji_back.png" x={HW * 0.42} y={HH * 1.04} h={HH * 0.66} />}
      </Layer>
    </Shot>
  );
};

/* ───────────── 11 · he walks to the window (1761–1872) ───────────── */
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const t = ramp(f, 1761, 111, ease.soft);
  return (
    <Shot z={[[1761, 1.48], [1872, 1]]} x={[[1761, 230], [1872, 0]]} y={[[1761, -170], [1872, 0]]} e={ease.out}>
      <Layer depth={0.75}><Plate p="bg/bg_window_wall.jpg" scale={1.05} /></Layer>
      <Layer depth={1}>
        <Art p="chars/kenji_stand_paper.png" x={HW * (0.78 - 0.22 * t)} y={HH * 0.99 + hop(f, 16, 20)} h={HH * 0.6} flip rot={wave(f, 32) * 1.5} pivot={[0.5, 1]} />
      </Layer>
    </Shot>
  );
};

/* ───────────── 12 · he peers out (1873–1933) ───────────── */
const S12: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shot z={[[1873, 1.32], [1933, 1.3]]} x={[[1873, -260], [1933, -262]]} y={[[1873, -80], [1933, -80]]}>
      <Layer depth={0.8}><Plate p="bg/bg_window_wall.jpg" scale={1.05} /></Layer>
      <Layer depth={1}><Art p="chars/kenji_peer.png" x={HW * 0.34} y={HH * 1.02} h={HH * 0.68} flip rot={wave(f, 60) * 0.5} pivot={[0.5, 1]} /></Layer>
    </Shot>
  );
};

/* ───────────── sky light: glow, rays, hex flares ───────────── */
const Flares: React.FC<{ sx: number; sy: number; o?: number }> = ({ sx, sy, o = 1 }) => {
  const dx = HW / 2 - sx, dy = HH * 0.5 - sy;
  const hex = (s: number) => `polygon(${[0, 1, 2, 3, 4, 5].map((i) => `${50 + 50 * Math.cos((i * Math.PI) / 3)}% ${50 + 50 * Math.sin((i * Math.PI) / 3)}%`).join(',')})`;
  const fl = [[0.55, 90, 'rgba(255,240,200,0.20)'], [0.9, 150, 'rgba(190,230,255,0.16)'], [1.35, 60, 'rgba(255,200,230,0.22)'], [1.7, 230, 'rgba(200,255,230,0.10)']] as const;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, mixBlendMode: 'screen' }}>
      <div style={{ position: 'absolute', left: sx - 700, top: sy - 700, width: 1400, height: 1400, background: 'radial-gradient(circle, rgba(255,255,240,0.9) 0%, rgba(255,250,220,0.35) 25%, rgba(255,250,220,0) 70%)' }} />
      {fl.map(([t, s, c], i) => (
        <div key={i} style={{ position: 'absolute', left: sx + dx * t * 2 - s, top: sy + dy * t * 2 - s, width: s * 2, height: s * 2, background: c, clipPath: hex(s) }} />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── 13 · a single B-29 (1934–2147) ───────────── */
const S13: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f - 1934) / 213;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Plate p="bg/bg_sky_plain.jpg" scale={1.05} ox={-t * 40} />
      <Art p="props/clouds_set.png" x={HW * (0.55 - t * 0.12)} y={HH * 0.95} h={HH * 0.3} opacity={0.85} filter="blur(2px)" />
      <Art p="props/b29_side.png" x={HW * (0.24 + t * 0.5)} y={HH * (0.44 - t * 0.06)} h={HH * 0.17} anchor={[0.5, 0.5]} rot={-9 + wave(f, 150) * 0.6} />
      <Art p="props/clouds_set.png" x={HW * (0.35 - t * 0.3)} y={HH * 0.22} h={HH * 0.14} opacity={0.7} filter="blur(3px)" />
      <Flares sx={HW * 0.92} sy={HH * 0.08} />
    </AbsoluteFill>
  );
};

/* ───────────── 15 · arms crossed, she says sit (2218–2718) ───────────── */
const S15: React.FC = () => {
  const f = useCurrentFrame();
  const inT = ramp(f, 2422, 30, ease.out);
  const pat = f >= 2477 ? -14 * Math.abs(Math.sin(((f - 2477) / 18) * Math.PI)) * (1 - ramp(f, 2513, 12)) : 0;
  const bub = f - 2605;
  const POPB = [0.5, 0.8, 1.08, 1.12, 1.06, 1.02, 1];
  const bs = bub < 0 ? 0 : POPB[Math.min(bub, POPB.length - 1)];
  return (
    <Shot z={[[2218, 1.15], [2400, 1.12], [2580, 1]]} x={[[2218, 30], [2580, -20]]} y={[[2218, -60], [2580, 20]]}>
      <Layer depth={0.7}><Plate p="bg/bg_room_wide.jpg" scale={1.05} /></Layer>
      <Layer depth={1}>
        <Art p="chars/kenji_armscrossed.png" x={HW * 0.42} y={HH * 0.93} h={HH * 0.5} rot={wave(f, 140) * 0.7} pivot={[0.5, 1]} />
        {f >= 2422 && <Rig body="chars/hana_sit_body.png" fit={FITS.hanaSit} r={pat} x={HW * (1.25 - 0.5 * inT)} y={HH * 0.95} h={HH * 0.44} />}
      </Layer>
      {bs > 0 && (
        <Layer depth={1}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: `${HW * 0.3}px ${HH * 0.43}px`, transform: `scale(${bs})` }}>
            <Art p="props/thought_bubble.png" x={HW * 0.28} y={HH * 0.43} h={HH * 0.2} anchor={[0.5, 0.5]} />
            <Art p="props/icon_siren.png" x={HW * 0.29} y={HH * 0.415} h={HH * 0.095} anchor={[0.5, 0.5]} rot={wave(f, 8) * 3} />
          </div>
        </Layer>
      )}
    </Shot>
  );
};

/* ───────────── 17 · into the sun, a speck drops (2781–3062) ───────────── */
const S17: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f - 2781) / 280;
  const px = HW * (0.36 + t * 0.06), py = HH * 0.19;
  const d = Math.max(0, f - 2837);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Plate p="bg/bg_sky_sun.jpg" scale={1.06} oy={-t * 30} />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.35 }}>
        <div style={{ position: 'absolute', left: HW * 0.52 - 2400, top: HH * 0.12 - 2400, width: 4800, height: 4800, transform: `rotate(${f * 0.05}deg)`,
          background: 'repeating-conic-gradient(rgba(255,255,235,0.55) 0deg 2deg, rgba(255,255,235,0) 2deg 14deg)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.5) 25%, transparent 60%)' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: -400, top: HH * 0.2, width: HW + 800, height: 26, transform: 'rotate(-28deg)', background: 'linear-gradient(90deg, rgba(255,120,190,0), rgba(255,120,190,0.55), rgba(255,120,190,0))', mixBlendMode: 'screen' }} />
      <Art p="props/b29_silhouette.png" x={px} y={py} h={HH * 0.03} anchor={[0.5, 0.5]} rot={14} />
      {f >= 2837 && <div style={{ position: 'absolute', left: px - 12 + Math.sin(d * 0.07) * 6, top: py + 30 + d * 1.35 + d * d * 0.0008, width: 24, height: 24, borderRadius: 12, background: '#1c1612' }} />}
      <Flares sx={HW * 0.52} sy={HH * 0.12} o={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 19 · he squints up (3044–3186) ───────────── */
const S19: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: ramp(f, 3044, 18, ease.soft) }}>
      <Shot z={[[3044, 1.06], [3186, 1.0]]} x={[[3044, 20], [3186, -20]]} y={[[3044, 30], [3186, -10]]} e={ease.soft}>
        <Layer depth={0.8}><Plate p="bg/bg_house_from_above.jpg" scale={1.05} /></Layer>
        <Layer depth={1}><Art p="chars/kenji_squint.png" x={HW * 0.55} y={HH * 1.02} h={HH * 0.66} rot={wave(f, 50) * 0.8} pivot={[0.5, 1]} /></Layer>
      </Shot>
    </AbsoluteFill>
  );
};

/* ───────────── 21 · the bomb falls (3228–3322), whip into 22 ───────────── */
const CloudStream: React.FC<{ f: number; speed: number }> = ({ f, speed }) => (
  <>
    {[0, 1, 2, 3, 4].map((i) => {
      const yy = ((HH * 1.3 + i * HH * 0.42 - (f * speed + i * 300)) % (HH * 2.1)) - HH * 0.4;
      return <Art key={i} p="props/clouds_set.png" x={HW * (0.15 + rnd(i + 3) * 0.7)} y={yy} h={HH * (0.08 + rnd(i) * 0.1)} anchor={[0.5, 0.5]} opacity={0.9} />;
    })}
  </>
);
const S21: React.FC = () => {
  const f = useCurrentFrame();
  const w = ramp(f, 3296, 27, ease.in);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#9fd0ff' }}>
      <WhipBlur amount={w * 1.6}>
        <AbsoluteFill style={{ transform: `translateY(${-w * HH * 0.6}px)` }}>
          <Plate p="bg/bg_sky_plain.jpg" scale={1.15} oy={-(f - 3228) * 1.5} />
          <CloudStream f={f - 3228} speed={34} />
          <Art p="props/bomb_falling.png" x={HW * 0.5 + wave(f, 70) * 20} y={HH * (0.42 + (f - 3228) * 0.0004)} h={HH * 0.5} anchor={[0.5, 0.5]} rot={wave(f, 46) * 3} />
        </AbsoluteFill>
      </WhipBlur>
    </AbsoluteFill>
  );
};

/* ───────────── 22 · "honey, I think it's better to go" (3323–3410) ───────────── */
const S22: React.FC = () => {
  const f = useCurrentFrame();
  const w = 1 - ramp(f, 3323, 6, ease.out);
  const talk = f >= 3303 && f < 3405 ? Math.abs(Math.sin(f * 0.55)) * 5 : 0;
  return (
    <WhipBlur amount={w * 1.6}>
      <AbsoluteFill style={{ transform: `translateY(${w * HH * 0.5}px)` }}>
        <Shot z={[[3323, 1], [3410, 1.05]]} e={ease.soft}>
          <Layer depth={0.6}><Plate p="bg/bg_window_wall.jpg" scale={1.1} filter="blur(6px)" /></Layer>
          <Layer depth={1}>
            <Art p="chars/kenji_speak_worried.png" x={HW * 0.38} y={HH * 1.22} h={HH * 1.02} rot={wave(f, 60) * 0.6} pivot={[0.5, 1]} sy={1 + talk * 0.001} />
          </Layer>
          <Layer depth={1.15}><Art p="chars/hana_closeup.png" x={HW * 0.92} y={HH * 1.32} h={HH * 1.0} flip /></Layer>
        </Shot>
      </AbsoluteFill>
    </WhipBlur>
  );
};

/* ───────────── 24 · he reaches for her hand (3437–3504) ───────────── */
const S24: React.FC = () => {
  const f = useCurrentFrame();
  const t = ramp(f, 3442, 40, ease.out);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Plate p="bg/bg_floor_close.jpg" scale={1.04} />
      <Art p="chars/hand_hana.png" x={HW * 0.62} y={-HH * 0.02} h={HH * 0.6} anchor={[0.5, 0]} rot={wave(f, 80) * 0.6} pivot={[0.5, 0]} />
      <Art p="chars/hand_kenji_reach.png" x={HW * (0.08 + 0.74 * t)} y={HH * 0.565} h={HH * 0.22} anchor={[1, 0.3]} rot={-14 + 4 * t} pivot={[0, 0.6]} />
    </AbsoluteFill>
  );
};

/* ───────────── 25 · they hurry, the light comes (3538–3653) ───────────── */
const S25: React.FC = () => {
  const f = useCurrentFrame();
  const t = ramp(f, 3538, 115, ease.soft);
  const glow = ramp(f, 3590, 44, ease.in);
  return (
    <AbsoluteFill style={{ filter: `brightness(${1 + glow * 1.6}) saturate(${1 - glow * 0.6})` }}>
      <Shot z={[[3538, 1.05], [3653, 1.12]]} e={ease.soft}>
        <Layer depth={0.7}><Plate p="bg/bg_room_wide.jpg" scale={1.05} /></Layer>
        <Layer depth={1}><Art p="chars/couple_hurry.png" x={HW * (0.36 + 0.24 * t)} y={HH * 0.96 + hop(f, 12, 22)} h={HH * 0.5} /></Layer>
      </Shot>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 15% 35%, rgba(255,250,235,${0.5 + glow * 0.5}) 0%, rgba(255,245,225,${glow}) ${20 + glow * 60}%, rgba(255,240,220,${glow * 0.8}) 100%)` }} />
    </AbsoluteFill>
  );
};

/* ───────────── 26 · the shadows (3634–3900) ───────────── */
const Hatch: React.FC = () => {
  const f = useCurrentFrame();
  const boil = Math.floor((f - 3634) / 5); // a new drawing every 5 frames (12 fps)
  const p = 'chars/couple_hurry.png'; const m = meta(p);
  const h = HH * 0.6, k = h / ((m.box![3] - m.box![1]) * m.h), W = m.w * k, H = m.h * k;
  const left = HW * 0.5 - W / 2, top = HH * 0.44 - H / 2;
  // short pencil strokes in three directions (two heavy, one light), re-drawn on every boil step
  const paths = [[-32, 2600, 6, 0.9], [28, 2600, 6, 0.9], [80, 1300, 4, 0.7]].map(([ang, n, sw, op], j) => {
    let d = '';
    const R = Math.hypot(W, H) / 2;
    for (let i = 0; i < n; i++) {
      const s = boil * 7919 + j * 104729 + i * 13;
      const u = (rnd(s) - 0.5) * 2 * R, v = (rnd(s + 1) - 0.5) * 2 * R, len = 120 + rnd(s + 2) * 380, bend = (rnd(s + 3) - 0.5) * 14;
      d += `M${(u - len / 2).toFixed(0)} ${v.toFixed(0)} L${(u + len / 2).toFixed(0)} ${(v + bend).toFixed(0)} `;
    }
    return <path key={j} d={d} transform={`translate(${W / 2} ${H / 2}) rotate(${ang + (rnd(boil + j) - 0.5) * 4})`} stroke="#0e0e0e" strokeWidth={sw} strokeOpacity={op} fill="none" strokeLinecap="round" />;
  });
  const o = 1 - ramp(f, 3660, 192, ease.soft);
  const id = `hm${boil}`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left, top, opacity: o, overflow: 'visible', transform: `skewX(${-6 + (rnd(boil) - 0.5) * 1.5}deg)` }}>
      <defs>
        {/* silhouette alpha → white, blurred and torn by noise so the edges are ragged and boil with the strokes */}
        <filter id={`${id}f`} x="-10%" y="-10%" width="120%" height="120%">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
          <feMorphology operator="dilate" radius={22} />
          <feGaussianBlur stdDeviation={14} result="m" />
          <feTurbulence type="fractalNoise" baseFrequency={0.012} numOctaves={2} seed={boil % 97} result="n" />
          <feDisplacementMap in="m" in2="n" scale={90} xChannelSelector="R" yChannelSelector="G" />
          <feComponentTransfer><feFuncA type="linear" slope={3} intercept={-1} /></feComponentTransfer>
        </filter>
        <mask id={id} maskUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}>
          <image href={src(p)} width={W} height={H} filter={`url(#${id}f)`} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{paths}</g>
    </svg>
  );
};
const S26: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#fbfaf7' }}>
      <Hatch />
      <AbsoluteFill style={{ background: '#000', opacity: ramp(f, 3860, 40, ease.soft) }} />
    </AbsoluteFill>
  );
};

/* ───────────── the whole short ───────────── */
export const Hiroshima: React.FC<{ noAudio?: boolean }> = ({ noAudio }) => {
  const f = useCurrentFrame();
  // card "1" → couple: a two-stage dissolve (opacity ~0.6 held 3556–3574), measured on the reference
  const oneFade = keys(f, [[3538, 1], [3556, 0.6], [3574, 0.6], [3600, 0]]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Seg a={0} b={284}><S1 /></Seg>
      <Seg a={284} b={483}><S2 /></Seg>
      <Seg a={483} b={749}><S3 /></Seg>
      <Seg a={806} b={1027}><S5 /></Seg>
      <Seg a={1027} b={1227}><S6 /></Seg>
      <Seg a={1294} b={1448}><S8 /></Seg>
      <Seg a={1448} b={1703}><S9 /></Seg>
      <Seg a={1761} b={1873}><S11 /></Seg>
      <Seg a={1873} b={1934}><S12 /></Seg>
      <Seg a={1934} b={2148}><S13 /></Seg>
      <Seg a={2218} b={2719}><S15 /></Seg>
      <Seg a={2781} b={3062}><S17 /></Seg>
      <Seg a={3044} b={3187}><S19 /></Seg>
      <Seg a={3228} b={3323}><S21 /></Seg>
      <Seg a={3323} b={3411}><S22 /></Seg>
      <Seg a={3437} b={3505}><S24 /></Seg>
      <Seg a={3538} b={3634}><S25 /></Seg>
      <Seg a={3634} b={TOTAL}><S26 /></Seg>
      {CARDS.map(([n, a, b]) => <Seg key={n} a={a} b={b}><CardAt n={n} a={a} /></Seg>)}
      <Seg a={3505} b={3600}><CardAt n={1} a={3505} o={oneFade} /></Seg>
      <Captions />
      {!noAudio && <Audio src={staticFile('hiroshima/soundtrack.wav')} />}
    </AbsoluteFill>
  );
};
const CardAt: React.FC<{ n: number; a: number; o?: number }> = ({ n, a, o = 1 }) => (
  <AbsoluteFill style={{ opacity: o }}><CountCard n={n} at={a} /></AbsoluteFill>
);
