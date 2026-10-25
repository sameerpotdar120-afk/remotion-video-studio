import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/greenland/fonts: Anton for the big names and numbers, Baloo 2 for labels (Hindi and
// Latin), Kalam for the handwritten notes (Hindi and Latin), Cinzel for the 9th-century "IX".
export const NUM = "'GLAnton', 'Anton', Impact, sans-serif";
export const UI = "'GLBaloo', 'Baloo 2', sans-serif";
export const HAND = "'GLKalam', 'Kalam', cursive";
export const OLD = "'GLCinzel', 'Cinzel', serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('gl fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['GLAnton', 'Anton.ttf', '400'], ['GLBaloo', 'Baloo2.ttf', '400 800'], ['GLKalam', 'Kalam.ttf', '700'], ['GLCinzel', 'Cinzel.ttf', '400 900']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`greenland/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
