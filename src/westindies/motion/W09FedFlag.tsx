import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { clamp } from './theme';

// w09_fed_flag (line 8, "अपना झंडा": the flag of the West Indies Federation, 1958–1962, drawn in code: a blue field,
// four white wavy bands across it and an orange sun disc in the middle). It is hoisted up its pole in 30 frames with
// an ease-out, then waves: the cloth is cut into 24 vertical strips, each displaced and shaded by a travelling sine
// wave that grows toward the fly end. Transparent, 520×640, 60 fps; the pole's foot is at (60, 630).
const BLUE = '#1F4E9C';
export const W09FedFlag: React.FC<{ hoist?: boolean }> = ({ hoist = true }) => {
  const f = useCurrentFrame();
  const h = hoist ? interpolate(f, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const top = 40 + (1 - h) * 380;
  const W = 420, H = 270, N = 24;
  const cloth = (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill={BLUE} />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M 0 ${62 + k * 46} Q ${W * 0.25} ${46 + k * 46} ${W * 0.5} ${62 + k * 46} T ${W} ${62 + k * 46}`} stroke="#fff" strokeWidth={14} fill="none" />)}
      <circle cx={W / 2} cy={H / 2} r={52} fill="#F7941D" />
    </svg>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 52, top: 20, width: 12, height: 612, borderRadius: 6, background: 'linear-gradient(90deg, #8A8E94, #E6E8EB, #7A7E84)' }} />
      <div style={{ position: 'absolute', left: 48, top: 10, width: 20, height: 20, borderRadius: '50%', background: '#E8C35A' }} />
      {Array.from({ length: N }, (_, i) => {
        const x = (i / N) * W, k = i / N;
        const wave = Math.sin(f / 7 - k * 6) * 16 * k;
        const shade = 0.82 + 0.18 * Math.cos(f / 7 - k * 6);
        return (
          <div key={i} style={{ position: 'absolute', left: 64 + x, top: top + wave, width: W / N + 1, height: H, overflow: 'hidden', filter: `brightness(${shade})` }}>
            <div style={{ position: 'absolute', left: -x, top: 0 }}>{cloth}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
