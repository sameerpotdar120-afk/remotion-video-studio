import React from 'react';
import {AbsoluteFill, CanvasImage, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Video} from '@remotion/media';

type BeatClipProps = {
  src: string;
  durationInFrames: number;
  kind?: 'video' | 'image';
  playbackRate?: number;
  trimBefore?: number;
  position?: string;
  warm?: boolean;
};

export const BeatClip: React.FC<BeatClipProps> = ({
  src,
  durationInFrames,
  kind = 'video',
  playbackRate = 1,
  trimBefore = 0,
  position = '50% 50%',
  warm = true,
}) => {
  const frame = useCurrentFrame();
  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: position,
    filter: warm
      ? 'saturate(1.12) contrast(1.05) brightness(0.98)'
      : 'saturate(1.04) contrast(1.03)',
    scale: interpolate(
      frame,
      [0, 8, durationInFrames - 1],
      [1.065, 1.01, 1.055],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
        output: 'perceptual-scale',
      },
    ),
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#150401'}}>
      {kind === 'video' ? (
        <Video
          src={staticFile(`assets/${src}`)}
          trimBefore={trimBefore}
          playbackRate={playbackRate}
          muted
          style={mediaStyle}
        />
      ) : (
        <CanvasImage src={staticFile(`assets/${src}`)} style={mediaStyle} />
      )}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 42%, transparent 40%, rgba(42,4,0,0.14) 72%, rgba(12,0,0,0.42) 100%), linear-gradient(to bottom, rgba(255,176,54,0.04), rgba(94,0,0,0.08))',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: '#ffd989',
          mixBlendMode: 'screen',
          opacity: interpolate(frame, [0, 2, 5], [0.32, 0.09, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </AbsoluteFill>
  );
};
