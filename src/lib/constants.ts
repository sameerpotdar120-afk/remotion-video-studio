// Global constants for 4K @ 60 fps.
// Every timing below comes from the frame-by-frame analysis of the reference
// (analysis/reference-framelog.md, measured at 30 fps) and is doubled for 60 fps.

export const W = 3840;
export const H = 2160;
export const FPS = 60;

/** Convert seconds to frames at 60 fps. */
export const sec = (s: number) => Math.round(s * FPS);

/** Motion grammar, in frames @60fps. */
export const T = {
  popIn: 8, // prop / icon pop: 0 → 110% → 100%   (ref 2–6 f @30)
  popSettle: 6,
  stampAppear: 1, // stamp shows at 150% for 1 frame
  stampSlam: 6, // 150% → 100%                     (ref 3 f @30)
  stampShake: 8, // micro-shake after landing       (ref 3–4 f @30)
  stampAfterCut: 20, // stamp lands ~20 f after a cut (ref ~10 f @30)
  windUp: 16, // shrink/rise before a slam
  whip: 8, // whip-pan blur transition           (ref 3–5 f @30)
  zoomBlur: 10, // radial zoom-blur transition        (ref 3–9 f @30)
  zoomPunch: 10, // punch-in to read a document       (ref 3–6 f @30)
  slideFast: 7, // comic slide-in with motion blur    (ref 3–4 f @30)
  slideTravel: 34, // character travelling across a map (ref 15–18 f @30)
  stagger: 3, // between repeated items             (ref 1–3 f @30)
  musketRaise: 12, // per soldier                        (ref ~6 f @30)
  musketOffset: 8, // offset between soldiers            (ref 3–5 f @30)
  mouthCycle: 10, // lip-flap open/close                (ref 4–6 f @30)
  gestureCycle: 16, // glove point / pump loop            (ref ~8 f @30)
  blink: 5, // eyes closed                        (ref 2–3 f @30)
  blinkEvery: 160, // ~every 2.7 s
  strike: 14, // strike-through draw                (ref 6–7 f @30)
  highlightPerChar: 0.9, // highlighter frames per character
  listGap: 44, // spoken list item spacing           (ref 18–25 f @30)
  titleIn: 12, // title scale-down / fade entry      (ref 4–8 f @30)
  typePerChar: 2, // typewriter                         (ref 1 char/f @30)
  holdShort: 60,
  holdLand: 200, // "let it land" hold                 (ref 84–150 f @30)
  blackHold: 62, // the one black beat                 (ref 31 f @30)
  fillPerState: 14, // colony fill: white flash → blue    (ref 6–8 f @30)
  neonOn: 44, // neon outline hold                  (ref 22 f @30)
  pinGrow: 20, // pin dot → full with overshoot      (ref 10 f @30)
  ripple: 24,
  labelWipe: 16,
  driftPerSec: 0.012, // camera never stops: +1.2% zoom per second during holds
} as const;

/** Palette measured from the reference frames. */
export const C = {
  // satellite style
  colonyBlue: '#5B9BE0',
  colonyBlueLight: '#CFE3FA',
  neonWhite: '#EAF6FF',
  // parchment style
  parchLand: '#C9B48A',
  parchSea: '#5E8C8E',
  parchColony: '#4F7099',
  britainRed: '#D62935',
  britainRedDark: '#A81F2A',
  franceBlue: '#2B3FA0',
  spainOrange: '#E3862D',
  congressOrange: '#F08A24',
  // flat political style
  flatLand: '#3D86C6',
  flatSea: '#1B2B38',
  // UI
  dateYellow: '#FFD84A',
  highlighter: 'rgba(255, 222, 0, 0.78)',
  stampRed: '#C81E2B',
  strikeRed: '#B3121F',
  markerGreen: '#35B84A',
  neonRed: '#FF4D5E',
  neonGreen: '#3DFF8B',
  ink: '#1A1410',
  outline: '#2A211B',
  skin: '#F6D9BF',
} as const;

export const FONTS = {
  // Loaded in src/lib/fonts.ts via @remotion/google-fonts
  serif: '"Playfair Display", "Times New Roman", serif',
  sans: '"Anton", "Impact", sans-serif',
  hand: '"Kalam", cursive', // handwritten notes / labels (supports Devanagari)
  hindi: '"Tiro Devanagari Hindi", "Noto Serif Devanagari", serif',
  display: '"Rozha One", "Tiro Devanagari Hindi", serif', // big Hindi titles
  label: '"Hind", "Kalam", sans-serif', // bold Hindi/English labels
} as const;
