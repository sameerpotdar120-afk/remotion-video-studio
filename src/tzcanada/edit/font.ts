import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/tzcanada/fonts: Anton for the big labels and numbers, Jost for small caps, Baloo 2
// for Hindi.
export const TITLE = "'TZAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'TZJost', 'Jost', sans-serif";
export const UI = "'TZBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('tz fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['TZAnton', 'Anton.ttf', '400'], ['TZJost', 'Jost.ttf', '100 900'], ['TZBaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`tzcanada/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
