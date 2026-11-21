import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Google Fonts (OFL) from public/sixday/fonts: Rozha One for the gold map labels (Devanagari serif), Martel for card
// names, Cinzel for small English lines, Baloo 2 for captions, Anton for big numbers, Jost for small UI text.
export const MAPF = "'SDRozha', 'Rozha One', serif";
export const CARDF = "'SDMartel', 'Martel', serif";
export const ENF = "'SDCinzel', 'Cinzel', serif";
export const UI = "'SDBaloo', 'Baloo 2', sans-serif";
export const NUMF = "'SDAnton', 'Anton', Impact, sans-serif";
export const LABEL = "'SDJost', 'Jost', sans-serif";
let loading: Promise<unknown> | null = null;
export const useFonts = () => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('sd fonts'));
  useEffect(() => {
    if (!loading) {
      const f: [string, string, string][] = [['SDRozha', 'RozhaOne-Regular.ttf', '400'], ['SDMartel', 'Martel-ExtraBold.ttf', '800'],
        ['SDCinzel', 'Cinzel.ttf', '400 900'], ['SDBaloo', 'Baloo2.ttf', '400 800'], ['SDAnton', 'Anton.ttf', '400'], ['SDJost', 'Jost.ttf', '100 900']];
      loading = Promise.all(f.map(([n, file, w]) => new FontFace(n, `url(${staticFile(`sixday/fonts/${file}`)})`, { weight: w }).load()
        .then((x) => (document.fonts as unknown as { add: (y: FontFace) => void }).add(x))));
    }
    loading.then(() => { setOk(true); continueRender(h); }).catch(() => { setOk(true); continueRender(h); });
  }, [h]);
  return ok;
};
