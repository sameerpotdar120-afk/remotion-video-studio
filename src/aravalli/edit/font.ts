import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/aravalli/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, DM Serif Display for the old-map titles.
export const TITLE = "'ARAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'ARJost', 'Jost', sans-serif";
export const SERIF = "'ARSerif', 'DM Serif Display', serif";
export const UI = "'ARBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('ar fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['ARAnton', 'Anton.ttf', '400'], ['ARJost', 'Jost.ttf', '100 900'],
        ['ARSerif', 'DMSerifDisplay.ttf', '400'], ['ARBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`aravalli/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
