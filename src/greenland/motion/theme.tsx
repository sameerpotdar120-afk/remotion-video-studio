// Shared look for the Greenland and Iceland motion pieces: the reference's bright satellite map with a yellow
// highlighter, a lush green for "Green Land", an icy blue for "Ice Land", ink brown for the 9th-century paper map and
// a stamp red. The timing helpers are the West Indies ones (same channel, same feel).
export { clamp, graphemes, idle, inOut, lerp, mblur, pop, ramp, wobble } from '../../westindies/motion/theme';

export const C = {
  hi: '#FFE234',
  hiDeep: '#F5C400',
  ink: '#111111',
  green: '#3FD35A',
  greenDeep: '#13802E',
  greenGlow: '#B6FF8A',
  ice: '#8FE3FF',
  iceDeep: '#2C8FD8',
  iceGlow: '#E6FAFF',
  paper: '#EAD9B0',
  sepia: '#4A3220',
  red: '#E5262B',
  redDeep: '#9E1015',
  white: '#FFFFFF',
} as const;
