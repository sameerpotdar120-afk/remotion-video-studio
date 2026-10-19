import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/closestspace/fonts: Anton for the big numbers, Baloo 2 for labels (Hindi and Latin).
export const NUM = "'CSAnton', 'Anton', Impact, sans-serif";
export const UI = "'CSBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('cs fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['CSAnton', 'Anton.ttf', '400'], ['CSBaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`closestspace/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
