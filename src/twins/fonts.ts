import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'TWBaloo', 'Baloo 2', sans-serif";
export const SUB = "'TWMukta', 'Mukta', sans-serif";
export const NUM = "'TWAnton', 'Anton', sans-serif";
export const COND = "'TWTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['TWBaloo', 'twins/fonts/Baloo2.ttf', '400 800'],
  ['TWMukta', 'twins/fonts/Mukta-ExtraBold.ttf', '800'],
  ['TWAnton', 'twins/fonts/Anton.ttf', '400'],
  ['TWTeko', 'twins/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useTWFonts = () => {
  const [handle] = useState(() => delayRender('twins fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
