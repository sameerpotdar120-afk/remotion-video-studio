import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/sikkim/fonts: Anton for the bold condensed titles and numbers (the reference's
// "SIKKIM"), Jost for small caps labels, Baloo 2 for Hindi.
export const TITLE = "'SKAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'SKJost', 'Jost', sans-serif";
export const UI = "'SKBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('sk fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['SKAnton', 'Anton.ttf', '400'], ['SKJost', 'Jost.ttf', '100 900'], ['SKBaloo', 'Baloo2.ttf', '400 800']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`sikkim/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
