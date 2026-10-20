import React from 'react';
import { AbsoluteFill, Easing, Img, useCurrentFrame } from 'remotion';
import { CanadaFlag, DenmarkFlag } from './Flags';
import { NUM, useFonts } from './font';
import { C, pop, ramp } from './theme';

// w19_island_split (line 10, "2022 में दोनों ने टापू बाँट लिया: करीब 60 प्रतिशत Denmark को, 40 प्रतिशत Canada को";
// the reference's 55.8–58.2 s): the island (the creator's 3D model image, or a drawn stand-in) slowly turns; a dashed
// yellow line draws along its ridge, then the Danish flag paints over the bigger (east) side and the Canadian flag over
// the west side, multiplied onto the rock so its texture shows; two yellow tags tick 0% → 60% and 0% → 40%.
// Transparent, 1080×1080, 60 fps. `img` is the island image (w×h) and `outline` its silhouette as an SVG path in a
// 1000×560 box; `ridge` the split line in the same box.
const DEMO_OUTLINE = 'M 60 300 Q 80 150 260 110 Q 420 70 560 100 Q 760 90 900 180 Q 980 260 930 380 Q 860 480 640 490 Q 420 520 240 470 Q 80 430 60 300 Z';
const DEMO_RIDGE = 'M 470 80 Q 440 200 520 300 Q 560 400 500 520';
export const W19IslandSplit: React.FC<{ img?: { src: string; w: number; h: number }; outline?: string; ridge?: string; dk?: number; ca?: number }> = ({
  img, outline = DEMO_OUTLINE, ridge = DEMO_RIDGE, dk = 60, ca = 40,
}) => {
  useFonts();
  const f = useCurrentFrame();
  const line = ramp(f, 10, 40, Easing.inOut(Easing.cubic));
  const paint = ramp(f, 36, 60);
  const n1 = Math.round(dk * ramp(f, 40, 100)), n2 = Math.round(ca * ramp(f, 40, 100));
  const tag = pop(f, 38, 48, 2);
  const turn = Math.sin(f / 70) * 4;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 1000, height: 560, transform: `rotate(${turn}deg) scale(${1 + f * 0.0006})` }}>
        {img ? <Img src={img.src} style={{ position: 'absolute', inset: 0, width: 1000, height: 560, objectFit: 'contain' }} /> : (
          <svg width={1000} height={560} style={{ position: 'absolute', inset: 0 }}>
            <defs><linearGradient id="rockS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9A196" /><stop offset="1" stopColor="#5E564C" /></linearGradient></defs>
            <path d={outline} fill="url(#rockS)" stroke="#E6EEF2" strokeWidth={10} />
          </svg>
        )}
        {img && (
          // with the model image, its own alpha is the mask, so the flags follow the real coastline
          <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: paint, WebkitMaskImage: `url(${img.src})`, maskImage: `url(${img.src})`,
            WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}>
            <svg width={1000} height={560}>
              <defs>
                <clipPath id="isEi"><path d={`${ridge} L 1000 560 L 1000 0 Z`} /></clipPath>
                <clipPath id="isWi"><path d={`${ridge} L 0 560 L 0 0 Z`} /></clipPath>
              </defs>
              <g clipPath="url(#isEi)"><g transform="translate(380 0)"><DenmarkFlag w={740} h={560} f={f} wave={0.6} uid="isdki" /></g></g>
              <g clipPath="url(#isWi)"><g transform="translate(-120 0)"><CanadaFlag w={740} h={560} f={f} wave={0.6} uid="iscai" /></g></g>
            </svg>
          </div>
        )}
        <svg width={1000} height={560} style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: img ? 0 : paint }}>
          <defs>
            <clipPath id="isC"><path d={outline} /></clipPath>
            <clipPath id="isE"><path d={`${ridge} L 1000 560 L 1000 0 Z`} /></clipPath>
            <clipPath id="isW"><path d={`${ridge} L 0 560 L 0 0 Z`} /></clipPath>
          </defs>
          <g clipPath="url(#isC)">
            <g clipPath="url(#isE)"><g transform="translate(380 0)"><DenmarkFlag w={740} h={560} f={f} wave={0.6} uid="isdk" /></g></g>
            <g clipPath="url(#isW)"><g transform="translate(-120 0)"><CanadaFlag w={740} h={560} f={f} wave={0.6} uid="isca" /></g></g>
          </g>
        </svg>
        <svg width={1000} height={560} style={{ position: 'absolute', inset: 0 }}>
          <path d={ridge} stroke={C.yellow} strokeWidth={9} strokeDasharray="22 14" fill="none" pathLength={1} style={{ strokeDasharray: `${line} 1` }} />
          <path d={ridge} stroke={C.yellow} strokeWidth={9} strokeDasharray="22 14" fill="none" opacity={line > 0.99 ? 1 : 0} />
        </svg>
        {tag > 0 && [[720, n1], [250, n2]].map(([x, n], i) => (
          <div key={i} style={{ position: 'absolute', left: x as number, top: 200, transform: `translate(-50%,-50%) scale(${tag})`, background: C.yellow, padding: '0 18px', fontFamily: NUM, fontSize: 70, color: C.ink }}>{n}%</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
