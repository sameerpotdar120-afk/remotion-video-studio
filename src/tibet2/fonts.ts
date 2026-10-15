import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'T2Baloo', 'Baloo 2', sans-serif";
export const SUB = "'T2Mukta', 'Mukta', sans-serif";
export const NUM = "'T2Anton', 'Anton', sans-serif";
export const COND = "'T2Teko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['T2Baloo', 'tibet2/fonts/Baloo2.ttf', '400 800'],
  ['T2Mukta', 'tibet2/fonts/Mukta-ExtraBold.ttf', '800'],
  ['T2Anton', 'tibet2/fonts/Anton.ttf', '400'],
  ['T2Teko', 'tibet2/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useT2Fonts = () => {
  const [handle] = useState(() => delayRender('tibet2 fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
