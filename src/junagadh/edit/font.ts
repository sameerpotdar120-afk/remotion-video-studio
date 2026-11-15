import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/junagadh/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, DM Serif Display for the old-map titles.
export const TITLE = "'JGAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'JGJost', 'Jost', sans-serif";
export const SERIF = "'JGSerif', 'DM Serif Display', serif";
export const UI = "'JGBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('jg fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['JGAnton', 'Anton.ttf', '400'], ['JGJost', 'Jost.ttf', '100 900'],
        ['JGSerif', 'DMSerifDisplay.ttf', '400'], ['JGBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`junagadh/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
