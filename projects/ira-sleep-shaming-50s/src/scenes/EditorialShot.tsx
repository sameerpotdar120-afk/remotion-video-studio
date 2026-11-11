import React from 'react';
import {Video} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type LabelProps = {
  label?: string;
  mode: 'ira' | 'illustration';
  accent?: string;
};

const EditorialLabel: React.FC<LabelProps> = ({label, mode, accent = '#99B7A5'}) => {
  const frame = useCurrentFrame();

  if (!label) {
    return null;
  }

  return (
    <Interactive.Div
      name={mode === 'ira' ? 'Lower editorial label' : 'Upper editorial label'}
      style={{
        position: 'absolute',
        left: 110,
        top: mode === 'ira' ? 1190 : 280,
        width: 830,
        minHeight: mode === 'ira' ? 126 : 142,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 30px 18px',
        borderRadius: 28,
        border: mode === 'ira' ? `3px solid ${accent}` : '3px solid rgba(39,51,65,0.15)',
        backgroundColor: mode === 'ira' ? 'rgba(15,19,25,0.82)' : 'rgba(255,253,250,0.92)',
        boxShadow: mode === 'ira' ? '0 18px 45px rgba(0,0,0,0.34)' : '0 18px 40px rgba(39,51,65,0.15)',
        color: mode === 'ira' ? '#FCF9F2' : '#273341',
        textAlign: 'center',
        fontFamily: '"Noto Sans Devanagari Variable", "Noto Sans Devanagari", system-ui, sans-serif',
        fontSize: mode === 'ira' ? 66 : 72,
        lineHeight: 1.08,
        fontWeight: 760,
        letterSpacing: 0.2,
        opacity: interpolate(frame, [0, 5], [0.86, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: interpolate(frame, [0, 7], [0.94, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          output: 'perceptual-scale',
        }),
        translate: interpolate(frame, [0, 7], ['0px 28px', '0px 0px'], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {label}
    </Interactive.Div>
  );
};

type IraShotProps = {
  source: string;
  trimBefore: number;
  label?: string;
};

export const IraShot: React.FC<IraShotProps> = ({source, trimBefore, label}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#101219', overflow: 'hidden'}}>
      <Video
        name="Ira presenter · keyed composite"
        src={staticFile(source)}
        trimBefore={trimBefore}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(5,7,10,0.08) 0%, rgba(5,7,10,0) 46%, rgba(5,7,10,0.16) 100%)',
        }}
      />
      <EditorialLabel label={label} mode="ira" />
    </AbsoluteFill>
  );
};

type IllustrationShotProps = {
  source: string;
  label: string;
  accent?: string;
};

export const IllustrationShot: React.FC<IllustrationShotProps> = ({source, label, accent}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: '#F4F0E8', overflow: 'hidden'}}>
      <Img
        name="Full-screen educational illustration"
        src={staticFile(source)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          scale: interpolate(frame, [0, durationInFrames - 1], [1, 1.035], {
            easing: Easing.bezier(0.33, 0, 0.2, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            output: 'perceptual-scale',
          }),
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(244,240,232,0.26) 0%, rgba(244,240,232,0) 33%, rgba(39,51,65,0.06) 100%)',
        }}
      />
      <EditorialLabel label={label} mode="illustration" accent={accent} />
    </AbsoluteFill>
  );
};
