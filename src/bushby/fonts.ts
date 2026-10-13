import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'BBBaloo', 'Baloo 2', sans-serif";
export const SUB = "'BBMukta', 'Mukta', sans-serif";
export const NUM = "'BBAnton', 'Anton', sans-serif";
export const COND = "'BBTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['BBBaloo', 'bushby/fonts/Baloo2.ttf', '400 800'],
  ['BBMukta', 'bushby/fonts/Mukta-ExtraBold.ttf', '800'],
  ['BBAnton', 'bushby/fonts/Anton.ttf', '400'],
  ['BBTeko', 'bushby/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useBBFonts = () => {
  const [handle] = useState(() => delayRender('bushby fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
