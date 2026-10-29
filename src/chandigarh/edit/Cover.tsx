import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import SIZES from '../../../public/chandigarh/img_sizes.json';
import { BODY, C09LineMorph } from '../motion/C09LineMorph';
import { C12SectorPlan, planGeom } from '../motion/C12SectorPlan';
import { SERIF, UI, useFonts } from '../motion/font';

// The thumbnail (1080×1920; everything that matters inside the middle 3:4 crop, y 240–1680): the paper plan in jute
// with the glowing body drawn over it, the creator's brain, heart and lungs on the body, and the title.
const SZ = SIZES as Record<string, { ext?: string }>;
const IMG = (k: string) => staticFile(`chandigarh/img/${k}.${SZ[k]?.ext ?? 'png'}`);
const BOX: [number, number, number, number] = [110, 560, 860, 1120];
export const ChandigarhCover: React.FC = () => {
  useFonts();
  const g = planGeom(BOX);
  const mb: [number, number, number, number] = [g.ox - 24, g.oy - 24, g.gw + 48, g.gh + 48];
  const head: [number, number] = [mb[0] + mb[2] * 0.5, mb[1] + mb[3] * 0.08], chest: [number, number] = [mb[0] + mb[2] * 0.53, mb[1] + mb[3] * 0.27];
  const organ = (k: string, [x, y]: [number, number], s: number, clip = 0) => (
    <Img src={IMG(k)} style={{ clipPath: `inset(0 0 ${clip}% 0)`, position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, objectFit: 'contain', filter: 'drop-shadow(0 0 18px rgba(255,220,120,0.9)) drop-shadow(0 10px 12px rgba(0,0,0,0.5))' }} />
  );
  const stroke = { WebkitTextStroke: '10px #000', paintOrder: 'stroke fill' as const, textShadow: '0 8px 16px rgba(0,0,0,0.7)' };
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, #FBF8F1 40%, #CFC8BB 100%)', overflow: 'hidden' }}>
      <Img src={IMG('cg21_paper_texture')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, objectFit: 'cover', opacity: 0.9, mixBlendMode: 'multiply' }} />
      <C12SectorPlan box={BOX} jute={IMG('cg19_jute_texture')} heart={IMG('cg17_heart')} reveal={-300} revealDur={100} capitol={-300} s17={-300} valley={-300} gardens={-300} />
      <C09LineMorph shapes={[BODY]} keys={[[-300, 0]]} box={mb} width={9} color="#C8102E" glow={14} />
      {/* the brain's soft contact shadow is clipped off */}
      {organ('cg16_brain', [head[0], head[1] + 10], 190, 14)}
      {organ('cg17_heart', chest, 200)}
      {organ('cg18_lungs', [chest[0] - 150, chest[1] + 60], 170)}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(20,8,0,0.7), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 80%, rgba(20,8,0,0.55))' }} />
      <div style={{ position: 'absolute', left: 30, right: 30, top: 250, textAlign: 'center', fontFamily: UI, fontWeight: 800, lineHeight: 1.1 }}>
        <div style={{ fontSize: 112, color: '#FFD84D', ...stroke }}>ज़िंदा शरीर जैसा शहर</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 405, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 92, letterSpacing: 6, color: '#fff', ...stroke }}>CHANDIGARH</div>
    </AbsoluteFill>
  );
};
