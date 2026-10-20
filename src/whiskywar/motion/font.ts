import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/whiskywar/fonts: Anton for numbers and big labels, Baloo 2 for UI text (Hindi and
// Latin), Dancing Script for the handwritten notes.
export const NUM = "'WKAnton', 'Anton', Impact, sans-serif";
export const UI = "'WKBaloo', 'Baloo 2', sans-serif";
export const SCRIPT = "'WKScript', 'Dancing Script', cursive";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('wk fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['WKAnton', 'Anton.ttf', '400'], ['WKBaloo', 'Baloo2.ttf', '400 800'], ['WKScript', 'DancingScript.ttf', '400 700']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`whiskywar/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
