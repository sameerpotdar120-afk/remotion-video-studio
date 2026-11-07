import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/dingofence/fonts and the brand Montserrat: Anton for the big numbers and labels, Jost for
// small caps, Caveat for the handwritten notes, DM Serif Display for the place titles, Montserrat for the captions.
export const TITLE = "'DGAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'DGJost', 'Jost', sans-serif";
export const HAND = "'DGCaveat', 'Caveat', cursive";
export const SERIF = "'DGSerif', 'DM Serif Display', serif";
export const UI = "'DGMont', 'Montserrat', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('dg fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['DGAnton', 'dingofence/fonts/Anton.ttf', '400'], ['DGJost', 'dingofence/fonts/Jost.ttf', '100 900'],
        ['DGCaveat', 'dingofence/fonts/Caveat.ttf', '400 700'], ['DGSerif', 'dingofence/fonts/DMSerifDisplay.ttf', '400'], ['DGMont', 'brand/Montserrat.ttf', '100 900']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(file)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
