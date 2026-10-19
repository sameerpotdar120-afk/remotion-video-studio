import { staticFile } from 'remotion';
import type { Rig } from './Puppet';

/**
 * Character registry. File names MUST match the asset doc (docs/ASSET_PROMPTS.md, section 3).
 * Every PNG: transparent background, character standing, FULL BODY, BLANK FACE (no eyes,
 * no mouth, no brows), arms tucked inside the coat. Canvas 2048×2048, feet touching the
 * bottom edge, body centred.
 * After generating, open each PNG once and fine-tune face/shoulder fractions if needed.
 */
const r = (file: string, over: Partial<Rig> = {}): Rig => ({
  src: staticFile(`assets/chars/${file}`),
  aspect: 1,
  face: { x: 0.5, y: 0.3, w: 0.26 },
  shoulderL: [0.36, 0.52],
  shoulderR: [0.64, 0.52],
  ...over,
});

export const RIGS = {
  colonist: r('colonist_brown_coat.png'),
  colonistBearded: r('colonist_bearded.png'),
  colonistYoung: r('colonist_young_waistcoat.png'),
  merchant: r('merchant_green_coat.png'),
  printer: r('printer_apron.png'),
  clerk: r('stamp_clerk.png'),
  judge: r('judge_white_wig.png', { face: { x: 0.5, y: 0.33, w: 0.22 } }),
  redcoat: r('redcoat_soldier.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  redcoatOfficer: r('redcoat_officer.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  militia: r('militia_minuteman.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  continental: r('continental_soldier.png', { face: { x: 0.5, y: 0.34, w: 0.24 } }),
  washingtonYoung: r('washington_1754_virginia_officer.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  washington: r('washington_1775_general.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  franklin: r('benjamin_franklin.png', { face: { x: 0.5, y: 0.32, w: 0.24 } }),
  jefferson: r('thomas_jefferson.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  johnAdams: r('john_adams.png', { face: { x: 0.5, y: 0.31, w: 0.24 } }),
  paulRevere: r('paul_revere.png'),
  paine: r('thomas_paine.png'),
  kingGeorge: r('king_george_iii.png', { face: { x: 0.5, y: 0.36, w: 0.22 } }),
  lordNorth: r('lord_north.png', { face: { x: 0.5, y: 0.32, w: 0.24 } }),
  attucks: r('crispus_attucks.png', { skin: '#8A5A3C' }),
  marthaJefferson: r('martha_jefferson.png'),
  patsyJefferson: r('patsy_jefferson_child.png', { face: { x: 0.5, y: 0.34, w: 0.3 } }),
  enslavedWorkerMan: r('enslaved_worker_man.png', { skin: '#6B4430' }),
  enslavedWorkerWoman: r('enslaved_worker_woman.png', { skin: '#7A4E36' }),
  teaPartyDisguised: r('tea_party_disguised_colonist.png'),
} satisfies Record<string, Rig>;
