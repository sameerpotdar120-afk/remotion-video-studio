import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/siliguri2/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, DM Serif Display for the old-map titles.
export const TITLE = "'SGAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'SGJost', 'Jost', sans-serif";
export const SERIF = "'SGSerif', 'DM Serif Display', serif";
export const UI = "'SGBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('sg2 fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['SGAnton', 'Anton.ttf', '400'], ['SGJost', 'Jost.ttf', '100 900'],
        ['SGSerif', 'DMSerifDisplay.ttf', '400'], ['SGBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`siliguri2/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
