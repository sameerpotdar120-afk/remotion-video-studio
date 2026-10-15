import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'KKBaloo', 'Baloo 2', sans-serif";
export const SUB = "'KKMukta', 'Mukta', sans-serif";
export const NUM = "'KKAnton', 'Anton', sans-serif";
export const COND = "'KKTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['KKBaloo', 'kolkata/fonts/Baloo2.ttf', '400 800'],
  ['KKMukta', 'kolkata/fonts/Mukta-ExtraBold.ttf', '800'],
  ['KKAnton', 'kolkata/fonts/Anton.ttf', '400'],
  ['KKTeko', 'kolkata/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useKKFonts = () => {
  const [handle] = useState(() => delayRender('kolkata fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
