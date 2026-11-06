import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/uscongress/fonts and the brand Montserrat: Anton for the big numbers and labels, Jost for
// small caps, Caveat for the handwritten notes, DM Serif Display for the place titles, Montserrat for the captions.
export const TITLE = "'USAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'USJost', 'Jost', sans-serif";
export const HAND = "'USCaveat', 'Caveat', cursive";
export const SERIF = "'USSerif', 'DM Serif Display', serif";
export const UI = "'USMont', 'Montserrat', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [h] = useState(() => delayRender('us fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['USAnton', 'uscongress/fonts/Anton.ttf', '400'], ['USJost', 'uscongress/fonts/Jost.ttf', '100 900'],
        ['USCaveat', 'uscongress/fonts/Caveat.ttf', '400 700'], ['USSerif', 'uscongress/fonts/DMSerifDisplay.ttf', '400'], ['USMont', 'brand/Montserrat.ttf', '100 900']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(file)})`, { weight: w }).load().then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};
