import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/ukweather/fonts: Anton for the big numbers, Baloo 2 for labels (Hindi and Latin).
export const NUM = "'UKAnton', 'Anton', Impact, sans-serif";
export const UI = "'UKBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('uk fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['UKAnton', 'Anton.ttf', '400'], ['UKBaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`ukweather/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
