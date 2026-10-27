import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/garbagepatch/fonts: Anton for big numbers, Baloo 2 for labels (Hindi and Latin),
// Kalam for handwritten notes.
export const NUM = "'GPAnton', 'Anton', Impact, sans-serif";
export const UI = "'GPBaloo', 'Baloo 2', sans-serif";
export const HAND = "'GPKalam', 'Kalam', cursive";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('gp fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['GPAnton', 'Anton.ttf', '400'], ['GPBaloo', 'Baloo2.ttf', '400 800'], ['GPKalam', 'Kalam.ttf', '700']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`garbagepatch/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
