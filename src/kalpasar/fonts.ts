import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'KPBaloo', 'Baloo 2', sans-serif";
export const SUB = "'KPMukta', 'Mukta', sans-serif";
export const NUM = "'KPAnton', 'Anton', sans-serif";
export const COND = "'KPTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['KPBaloo', 'kalpasar/fonts/Baloo2.ttf', '400 800'],
  ['KPMukta', 'kalpasar/fonts/Mukta-ExtraBold.ttf', '800'],
  ['KPAnton', 'kalpasar/fonts/Anton.ttf', '400'],
  ['KPTeko', 'kalpasar/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useKPFonts = () => {
  const [handle] = useState(() => delayRender('kalpasar fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
