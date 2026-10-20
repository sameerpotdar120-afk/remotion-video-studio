import { staticFile } from 'remotion';
import type { Rig } from './Puppet';
import GEN from './rigs.generated.json';

/**
 * Character registry. File names MUST match the asset doc (docs/ASSET_PROMPTS.md, section 3).
 * Every PNG: transparent background, character standing, FULL BODY, BLANK FACE (no eyes,
 * no mouth, no brows), arms tucked inside the coat. Canvas 2048×2048, feet touching the
 * bottom edge, body centred.
 * After generating, open each PNG once and fine-tune face/shoulder fractions if needed.
 */
// Measured by scripts/prep_assets.py (alpha-cropped: feet = bottom edge; face = blank skin area).
const r = (file: string, over: Partial<Rig> = {}): Rig => {
  const g = (GEN as Record<string, Pick<Rig, 'aspect' | 'face' | 'shoulderL' | 'shoulderR'>>)[file];
  return {
    src: staticFile(`assets/chars/${file}`),
    aspect: g?.aspect ?? 1,
    face: g?.face ?? { x: 0.5, y: 0.3, w: 0.26 },
    shoulderL: g?.shoulderL ?? [0.36, 0.52],
    shoulderR: g?.shoulderR ?? [0.64, 0.52],
    ...over,
  };
};

export const RIGS = {
  colonist: r('colonist_brown_coat.png'),
  colonistBearded: r('colonist_bearded.png'),
  colonistYoung: r('colonist_young_waistcoat.png'),
  merchant: r('merchant_green_coat.png'),
  printer: r('printer_apron.png'),
  clerk: r('stamp_clerk.png'),
  judge: r('judge_white_wig.png'),
  redcoat: r('redcoat_soldier.png'),
  redcoatOfficer: r('redcoat_officer.png'),
  militia: r('militia_minuteman.png'),
  continental: r('continental_soldier.png'),
  washingtonYoung: r('washington_1754_virginia_officer.png', { face: { x: 0.555, y: 0.264, w: 0.4 } }),
  washington: r('washington_1775_general.png'),
  franklin: r('benjamin_franklin.png'),
  jefferson: r('thomas_jefferson.png'),
  johnAdams: r('john_adams.png'),
  paulRevere: r('paul_revere.png'),
  paine: r('thomas_paine.png'),
  kingGeorge: r('king_george_iii.png'),
  lordNorth: r('lord_north.png'),
  attucks: r('crispus_attucks.png', { skin: '#8A5A3C' }),
  marthaJefferson: r('martha_jefferson.png'),
  patsyJefferson: r('patsy_jefferson_child.png'),
  enslavedWorkerMan: r('enslaved_worker_man.png', { skin: '#6B4430' }),
  enslavedWorkerWoman: r('enslaved_worker_woman.png', { skin: '#7A4E36' }),
  teaPartyDisguised: r('tea_party_disguised_colonist.png'),
} satisfies Record<string, Rig>;
