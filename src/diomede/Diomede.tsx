import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, linear, ramp, window4 } from '../darien/anim';
import { useDevanagariFont } from '../darien/DarienGap';
import { PLANE, camAt, camSpeed } from './cam';
import { MapCanvas } from './Map';
import { Overlays } from './Overlays';
import { ScreenFX, ScreenLayer, shake } from './Screen';

export const DIOMEDE_DURATION = Math.ceil(59.4 * FPS);

/** Caption chunks: text from the creator's SRT, starts from the voiceover's word timings. */
const CAPS: [number, string][] = [
  [0.0, 'ये दो टापू'], [1.02, 'सिर्फ 3.8 किलोमीटर'], [3.1, 'दूर हैं,'], [4.04, 'पर एक पर आज है'], [5.58, 'और दूसरे पर कल।'],
  [7.16, 'ये हैं डायोमीडी आइलैंड्स,'], [9.38, 'छोटा टापू अमेरिका का'], [11.1, 'और बड़ा रशिया का,'],
  [12.9, 'और इनके बीच से'], [13.94, 'गुजरती है'], [14.94, 'इंटरनेशनल डेट लाइन।'],
  [16.5, 'इसीलिए जब'], [17.38, 'अमेरिका वाले टापू पर'], [18.7, 'सोमवार की सुबह होती है,'],
  [20.58, 'तब रशिया वाले पर'], [21.74, 'मंगलवार लग चुका होता है।'],
  [23.5, 'पर इतने पास होकर भी'], [25.3, 'ये दो अलग देशों में'], [26.52, 'क्यों हैं?'],
  [27.36, '1867 में'], [28.94, 'अमेरिका ने'], [29.62, 'रशिया से अलास्का खरीदा,'],
  [31.64, 'और सरहद खींची गई'], [32.9, 'ठीक इन दोनों के बीच।'],
  [34.78, 'फिर कोल्ड वार में'], [35.98, 'यही समंदर'], [36.78, 'बन गया दोनों देशों की सरहद,'], [39.04, 'आइस कर्टन।'],
  [40.16, 'सोवियत यूनियन ने'], [41.22, 'बड़े टापू पर'], [42.2, 'मिलिट्री बेस बनाया,'], [43.64, 'और आज वहाँ'], [44.74, 'सिर्फ फौज रहती है।'],
  [46.24, 'सर्दियों में'], [47.04, 'बीच का समंदर जमकर'], [48.68, 'बर्फ का पुल बन जाता है।'],
  [50.5, 'फिर भी एक तरफ आज'], [52.46, 'और दूसरी तरफ कल।'],
  [53.92, 'आप किस टापू पर जाओगे?'], [55.92, 'आज वाले या कल वाले?'], [57.92, 'कॉमेंट करो।'],
];
const CAP_END = 58.7;

const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let j = 0; j < CAPS.length; j++) if (CAPS[j][0] <= t) i = j;
  if (i < 0 || t > CAP_END) return null;
  const [t0, text] = CAPS[i];
  const t1 = i + 1 < CAPS.length ? CAPS[i + 1][0] : CAP_END;
  const a = (i === 0 ? 1 : ramp(t, t0, t0 + 0.12, linear)) * (1 - ramp(t, t1 - 0.02, t1, linear));
  return (
    <div style={{
      position: 'absolute', left: 60, right: 60, top: 1560, textAlign: 'center',
      fontFamily: "'NotoDeva', 'Noto Sans Devanagari', sans-serif", fontWeight: 700, fontSize: 54, lineHeight: 1.25, color: '#fff',
      opacity: a, transform: `translateY(${(1 - ramp(t, t0, t0 + 0.16)) * 10}px)`,
      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.45)',
    }}>{text}</div>
  );
};

export const Diomede: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const t = useCurrentFrame() / FPS;
  useDevanagariFont();
  const cam = camAt(t);
  const blur = Math.min(22, Math.max(0, (camSpeed(t) - 1.2) * 2.2));
  const cold = ramp(t, 34.75, 35.6) * (1 - ramp(t, 40.0, 40.8));
  const winter = ramp(t, 46.2, 47.4);
  const mapFilter = `saturate(${1 - 0.45 * cold - 0.15 * winter}) brightness(${1 - 0.12 * cold + 0.06 * winter}) contrast(${1 + 0.08 * cold})`;
  const [sx, sy] = shake(t);
  const credit = window4(t, 0, 0.3, 58.9, 59.3);

  return (
    <AbsoluteFill style={{ background: '#04101f', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ perspective: '1700px', perspectiveOrigin: '540px 960px' }}>
            <div style={{
              position: 'absolute', left: 540 - PLANE.ox, top: 960 - PLANE.oy, width: PLANE.w, height: PLANE.h,
              transformOrigin: `${PLANE.ox}px ${PLANE.oy}px`, transform: `rotateX(${cam.tilt}deg) rotate(${cam.rot}deg)`, transformStyle: 'preserve-3d',
            }}>
              <MapCanvas cam={cam} style={{ filter: mapFilter }} />
              <Overlays t={t} c={cam} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
        <ScreenLayer t={t} c={cam} />
        <ScreenFX t={t} />
      </AbsoluteFill>
      {captions && <Subtitles t={t} />}
      {captions && <div style={{ position: 'absolute', right: 26, bottom: 22, fontFamily: 'sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.55)',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'right', opacity: credit }}>
        Imagery: NASA Blue Marble · Sentinel-2 cloudless by EOX (Copernicus data 2016–2017) · Coastlines © OpenStreetMap contributors
      </div>}
      {captions && <Audio src={staticFile('diomede/audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
