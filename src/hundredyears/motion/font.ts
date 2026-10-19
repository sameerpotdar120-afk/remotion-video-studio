import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/hundredyears/fonts: Anton for the big numbers, Baloo 2 for UI text (Hindi and Latin).
export const NUM = "'HYAnton', 'Anton', Impact, sans-serif";
export const UI = "'HYBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useAnton = () => {
  const [h] = useState(() => delayRender('hy fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['HYAnton', 'Anton.ttf', '400'], ['HYBaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`hundredyears/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
