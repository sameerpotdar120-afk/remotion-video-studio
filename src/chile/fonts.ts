import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'CHBaloo', 'Baloo 2', sans-serif";
export const SUB = "'CHMukta', 'Mukta', sans-serif";
export const NUM = "'CHAnton', 'Anton', sans-serif";
export const COND = "'CHTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['CHBaloo', 'chile/fonts/Baloo2.ttf', '400 800'],
  ['CHMukta', 'chile/fonts/Mukta-ExtraBold.ttf', '800'],
  ['CHAnton', 'chile/fonts/Anton.ttf', '400'],
  ['CHTeko', 'chile/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useCHFonts = () => {
  const [handle] = useState(() => delayRender('chile fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
