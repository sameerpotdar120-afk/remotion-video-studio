import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/pangea/fonts: Baloo 2 for the Hindi captions and titles, Anton for the big numbers,
// Jost for small labels, DM Serif Display for the old-map titles.
export const TITLE = "'PGAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'PGJost', 'Jost', sans-serif";
export const SERIF = "'PGSerif', 'DM Serif Display', serif";
export const UI = "'PGBaloo', 'Baloo 2', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('pg fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['PGAnton', 'Anton.ttf', '400'], ['PGJost', 'Jost.ttf', '100 900'],
        ['PGSerif', 'DMSerifDisplay.ttf', '400'], ['PGBaloo', 'Baloo2.ttf', '400 800']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`pangea/fonts/${file}`)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
