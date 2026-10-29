import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/chandigarh/fonts: Cinzel for the engraved map labels (the reference's "INDIA",
// "PUNJAB", "SHIVALIK HILLS"), Jost for the plan map's geometric labels, Baloo 2 for Hindi, Anton for big numbers.
export const SERIF = "'CGCinzel', 'Cinzel', serif";
export const GEO = "'CGJost', 'Jost', sans-serif";
export const UI = "'CGBaloo', 'Baloo 2', sans-serif";
export const NUM = "'CGAnton', 'Anton', Impact, sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('cg fonts'));
  useEffect(() => {
    if (!loading) {
      loading = Promise.all([['CGCinzel', 'Cinzel.ttf', '400 900'], ['CGJost', 'Jost.ttf', '100 900'], ['CGBaloo', 'Baloo2.ttf', '400 800'], ['CGAnton', 'Anton.ttf', '400']].map(([n, file, w]) =>
        new FontFace(n, `url(${staticFile(`chandigarh/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
