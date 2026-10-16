import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'SGBaloo', 'Baloo 2', sans-serif";
export const SUB = "'SGMukta', 'Mukta', sans-serif";
export const NUM = "'SGAnton', 'Anton', sans-serif";
export const COND = "'SGTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['SGBaloo', 'siliguri/fonts/Baloo2.ttf', '400 800'],
  ['SGMukta', 'siliguri/fonts/Mukta-ExtraBold.ttf', '800'],
  ['SGAnton', 'siliguri/fonts/Anton.ttf', '400'],
  ['SGTeko', 'siliguri/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useSGFonts = () => {
  const [handle] = useState(() => delayRender('siliguri fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
