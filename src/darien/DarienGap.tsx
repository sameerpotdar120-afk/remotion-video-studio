import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FPS, kick, ramp, window4 } from './anim';
import { PLANE, camAt, camSpeed } from './camera';
import { MapCanvas } from './MapCanvas';
import { Overlays } from './Overlays';
import { BRoll, PaperScene } from './Scenes';
import { ScreenFX, ScreenTitles } from './Screen';
import { Subtitles } from './Subtitles';

export const DARIEN_DURATION = Math.ceil(72.8 * FPS);

let fontPromise: Promise<void> | null = null;
const loadFont = () => {
  if (!fontPromise) {
    const face = new FontFace('NotoDeva', `url(${staticFile('darien/fonts/NotoSansDevanagari-Variable.ttf')})`, {
      weight: '100 900',
    });
    fontPromise = face.load().then((f) => {
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
    });
  }
  return fontPromise;
};

const IMPACTS: [number, number][] = [
  [5.0, 5],
  [11.68, 7],
  [15.6, 9],
  [18.12, 5],
  [22.9, 7],
  [57.7, 5],
  [68.1, 5],
  [70.38, 7],
];

export const useDevanagariFont = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    loadFont().then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

export const DarienGap: React.FC = () => {
  const frame = useCurrentFrame();
  useDevanagariFont();
  return <DarienFrame t={frame / FPS} />;
};

/** One moment of the video. `still` drops captions, credit and audio for covers. */
export const DarienFrame: React.FC<{ t: number; still?: boolean }> = ({ t, still = false }) => {
  const cam = camAt(t);
  const showMap = t < 30.95 || (t >= 34.05 && t < 40.95) || t >= 48.95;
  const showBroll = t >= 30.85 && t < 34.3;
  const showPaper = t >= 40.55 && t < 49.15;

  // fake motion blur from camera speed
  const blur = Math.min(22, Math.max(0, (camSpeed(t) - 1.2) * 2.2));
  // map grade: dark mood, terrain contrast
  const dark = ramp(t, 26.35, 26.9) * (1 - ramp(t, 27.95, 28.2));
  const terrain = window4(t, 36.7, 37.2, 38.0, 38.8);
  const mapFilter = `brightness(${1 - 0.55 * dark}) saturate(${1 - 0.45 * dark + 0.1 * terrain}) contrast(${1 + 0.2 * terrain})`;

  let sx = 0;
  let sy = 0;
  for (const [t0, amp] of IMPACTS) {
    sx += kick(t, t0, amp, 38, 9);
    sy += kick(t, t0, amp * 0.8, 31, 9);
  }

  return (
    <AbsoluteFill style={{ background: '#04101f', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {showMap && (
          <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
            <AbsoluteFill style={{ perspective: '1700px', perspectiveOrigin: '540px 960px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 540 - PLANE.ox,
                  top: 960 - PLANE.oy,
                  width: PLANE.w,
                  height: PLANE.h,
                  transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`,
                  transform: `rotateX(${cam.tilt}deg) rotate(${cam.rot}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <MapCanvas cam={cam} style={{ filter: mapFilter }} />
                <Overlays t={t} c={cam} />
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        )}
        {showMap && <ScreenTitles t={t} />}
        {showBroll && <BRoll t={t} />}
        {showPaper && <PaperScene t={t} />}
        <ScreenFX t={t} />
      </AbsoluteFill>
      {!still && <Subtitles t={t} />}
      {!still && showMap && (
        <div style={{
          position: 'absolute', right: 26, bottom: 22, fontFamily: 'sans-serif', fontSize: 17, color: 'rgba(255,255,255,0.55)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right',
        }}>
          Imagery: NASA Blue Marble · Sentinel-2 cloudless by EOX (Copernicus data 2016–2017)
        </div>
      )}
      {!still && <Audio src={staticFile('darien/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
