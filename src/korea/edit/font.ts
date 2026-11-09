import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/korea/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, Caveat for handwritten notes, DM Serif Display for the old-map titles.
export const TITLE = "'MSAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'MSJost', 'Jost', sans-serif";
export const HAND = "'MSCaveat', 'Caveat', cursive";
export const SERIF = "'MSSerif', 'DM Serif Display', serif";
export const UI = "'MSBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('ko fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['MSAnton', 'Anton.ttf', '400'], ['MSJost', 'Jost.ttf', '100 900'], ['MSCaveat', 'Caveat.ttf', '400 700'],
        ['MSSerif', 'DMSerifDisplay.ttf', '400'], ['MSBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`korea/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
