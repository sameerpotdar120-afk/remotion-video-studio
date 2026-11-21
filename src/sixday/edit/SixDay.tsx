import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ramp, linear } from '../../darien/anim';
import { useFonts, ENF } from './font';
import { useHeights } from './geo';
import { IMGS, Scene, T, DURATION_S } from './story';
import { useImgs } from './things';
import { useModels } from './models';

export { DURATION_S };
export const SHORTS = T.shorts;
const LOOP_XF = 0.45;

const Credit: React.FC<{ u: number }> = ({ u }) => (
  <div style={{ position: 'absolute', right: 18 * u, bottom: 10 * u, fontFamily: ENF, fontSize: 11 * u, color: 'rgba(255,255,255,0.55)', textAlign: 'right', lineHeight: 1.3 }}>
    Map: Natural Earth (India's official boundary) · Relief: AWS Terrain Tiles / SRTM · Illustrations: AI
  </div>
);

/** The long video (16:9). Props: audio (a file under public/), or '' for none. */
export const SixDayLong: React.FC<{ audio: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const h = useHeights(); const fonts = useFonts(); const im = useImgs(IMGS); const md = useModels();
  if (!h || !fonts || !im || !md) return null;
  const t = f / fps;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Scene t={t} W={W} H={H} portrait={false} h={h} im={im} md={md} long />
      <Credit u={H / 1080} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

/** Short n (9:16): a continuous stretch of the long video's timeline, with captions, looping into its own hook. */
export const SixDayShort: React.FC<{ n: number; audio: string }> = ({ n, audio }) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const h = useHeights(); const fonts = useFonts(); const im = useImgs(IMGS); const md = useModels();
  if (!h || !fonts || !im || !md) return null;
  const s = SHORTS[n];
  const t = s.t0 + f / fps;
  const xf = ramp(t, s.t1 - LOOP_XF, s.t1, linear);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Scene t={t} W={W} H={H} portrait h={h} im={im} md={md} caps={[s.t0, s.t1 - 0.3]} gid={`g${n}a`} />
      {xf > 0 && (
        <AbsoluteFill style={{ opacity: xf }}>
          <Scene t={s.t0 - (s.t1 - t)} W={W} H={H} portrait h={h} im={im} md={md} caps={null} gid={`g${n}b`} />
        </AbsoluteFill>
      )}
      <Credit u={W / 1080} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
