import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/madeira/fonts: Anton for big numbers, Baloo 2 for labels (Hindi and Latin), Kalam for
// handwritten notes.
export const NUM = "'MDAnton', 'Anton', Impact, sans-serif";
export const UI = "'MDBaloo', 'Baloo 2', sans-serif";
export const HAND = "'MDKalam', 'Kalam', cursive";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('md fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['MDAnton', 'Anton.ttf', '400'], ['MDBaloo', 'Baloo2.ttf', '400 800'], ['MDKalam', 'Kalam.ttf', '700']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`madeira/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
