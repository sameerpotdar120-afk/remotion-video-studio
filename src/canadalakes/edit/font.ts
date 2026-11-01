import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/canadalakes/fonts: Anton for the big labels and numbers, Jost for small caps, Baloo 2
// for Hindi.
export const TITLE = "'CAAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'CAJost', 'Jost', sans-serif";
export const UI = "'CABaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('ca fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['CAAnton', 'Anton.ttf', '400'], ['CAJost', 'Jost.ttf', '100 900'], ['CABaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`canadalakes/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
