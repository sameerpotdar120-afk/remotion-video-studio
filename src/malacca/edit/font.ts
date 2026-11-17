import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/malacca/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, DM Serif Display for the old-map titles.
export const TITLE = "'MLAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'MLJost', 'Jost', sans-serif";
export const SERIF = "'MLSerif', 'DM Serif Display', serif";
export const UI = "'MLBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('ml fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['MLAnton', 'Anton.ttf', '400'], ['MLJost', 'Jost.ttf', '100 900'],
        ['MLSerif', 'DMSerifDisplay.ttf', '400'], ['MLBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`malacca/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
