import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'WWBaloo', 'Baloo 2', sans-serif";
export const SUB = "'WWMukta', 'Mukta', sans-serif";
export const NUM = "'WWAnton', 'Anton', sans-serif";
export const COND = "'WWTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['WWBaloo', 'ww3safe/fonts/Baloo2.ttf', '400 800'],
  ['WWMukta', 'ww3safe/fonts/Mukta-ExtraBold.ttf', '800'],
  ['WWAnton', 'ww3safe/fonts/Anton.ttf', '400'],
  ['WWTeko', 'ww3safe/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useWWFonts = () => {
  const [handle] = useState(() => delayRender('ww3safe fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
