import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'CBBaloo', 'Baloo 2', sans-serif";
export const SUB = "'CBMukta', 'Mukta', sans-serif";
export const NUM = "'CBAnton', 'Anton', sans-serif";
export const COND = "'CBTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['CBBaloo', 'coochbehar/fonts/Baloo2.ttf', '400 800'],
  ['CBMukta', 'coochbehar/fonts/Mukta-ExtraBold.ttf', '800'],
  ['CBAnton', 'coochbehar/fonts/Anton.ttf', '400'],
  ['CBTeko', 'coochbehar/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useCBFonts = () => {
  const [handle] = useState(() => delayRender('coochbehar fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
