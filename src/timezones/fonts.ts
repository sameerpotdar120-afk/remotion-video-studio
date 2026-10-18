import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/** Google Fonts (OFL): Baloo 2 for Hindi headlines, Mukta for subtitles, Anton and Teko for numbers and Latin caps. */
export const HEAD = "'TZBaloo', 'Baloo 2', sans-serif";
export const SUB = "'TZMukta', 'Mukta', sans-serif";
export const NUM = "'TZAnton', 'Anton', sans-serif";
export const COND = "'TZTeko', 'Teko', sans-serif";

const FACES: [string, string, string][] = [
  ['TZBaloo', 'timezones/fonts/Baloo2.ttf', '400 800'],
  ['TZMukta', 'timezones/fonts/Mukta-ExtraBold.ttf', '800'],
  ['TZAnton', 'timezones/fonts/Anton.ttf', '400'],
  ['TZTeko', 'timezones/fonts/Teko.ttf', '300 700'],
];
let loading: Promise<unknown> | null = null;

export const useTZFonts = () => {
  const [handle] = useState(() => delayRender('timezones fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all(FACES.map(([name, file, weight]) =>
        new FontFace(name, `url(${staticFile(file)})`, { weight }).load().then((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f))));
    }
    loading.then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
