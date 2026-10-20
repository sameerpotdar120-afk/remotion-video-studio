import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';

/** QA sheet: every rig with its animated face, to check eye/mouth placement after new art arrives. */
export const RigSheet: React.FC = () => {
  const keys = Object.keys(RIGS) as (keyof typeof RIGS)[];
  const cols = 9;
  return (
    <AbsoluteFill style={{ background: '#8C9AA3' }}>
      {keys.map((k, i) => (
        <div key={k}>
          <Puppet rig={RIGS[k]} x={220 + (i % cols) * 420} y={700 + Math.floor(i / cols) * 720} height={620} start={0} seed={k} look={1} />
          <div style={{ position: 'absolute', left: 60 + (i % cols) * 420, top: 710 + Math.floor(i / cols) * 720, width: 320, textAlign: 'center', font: '600 30px sans-serif', color: '#111' }}>{k}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
