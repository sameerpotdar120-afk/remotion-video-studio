// HOW STITCHES HEAL: one continuous 3D shot (src/scene.js) with a film look that deepens as we go macro.
import { L, Wd, T as TM } from './core/timing.js';
import { buildScene } from './scene.js';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

export function buildShots(E) {
  const S = [], CUES = [], cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const W = (w, l) => Wd(w, l);
  const X = buildScene(E, W), T = X.T;
  S.push({ id: 'S01', at: 0, note: 'one continuous shot: stitch, snip, swell, cells, collagen, vessels, heal, pull back', draw(lt, d, t, blit) {
    const r = X.update(t);
    const macro = clamp((0.4 - r.d) / 0.32);                  // 0 wide .. 1 extreme close
    E.render(X.scene, X.cam, {
      focus: r.focus, aperture: location.search.includes('nodof') ? 0 : lerp(0.0009, 0.018, macro), maxblur: lerp(0.006, 0.014, macro),
      bloom: 0.22 + 0.1 * macro, bloomThreshold: 0.82, exposure: lerp(1.0, 0.95, macro),
      vignette: lerp(0.25, 0.62, macro), grain: 0.018, warm: lerp(0.02, 0.06, macro), t,
    });
    blit();
  } });
  // sound: soft whooshes on the big camera moves, a snip, a swell, a shimmer for the cells, a pop as stitches come out
  cue(0.0, 'whoosh', { gain: 0.35, dur: 0.6 });
  cue(T.tight, 'zip', { gain: 0.35 });
  cue(T.snip - 0.02, 'tock', { gain: 0.5 });
  cue(T.glow, 'sparkle', { gain: 0.25 });
  cue(T.swell, 'slide', { gain: 0.35, dur: 1.2 });
  cue(T.cells, 'bubbles', { gain: 0.3, dur: 1.4 });
  cue(T.weave, 'sparkle', { gain: 0.22 });
  cue(T.ves, 'slide', { gain: 0.3, dur: 1.0 });
  cue(T.vesFade + 0.2, 'whoosh', { gain: 0.5, dur: 0.9 });
  cue(T.out, 'pop', { gain: 0.35 });
  return { shots: S, cues: CUES };
}
