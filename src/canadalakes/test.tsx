import React from 'react';
import { AbsoluteFill, Composition, registerRoot, Sequence } from 'remotion';
import { PeopleCrowd } from './motion/PeopleCrowd';
import { PinDrop } from './motion/PinDrop';
import { QuestionStorm } from './motion/QuestionStorm';
import { ThoughtBubble } from './motion/ThoughtBubble';
import { TypeOn } from './motion/TypeOn';
import { WhipCard } from './motion/WhipCard';

const bg: React.CSSProperties = { background: 'linear-gradient(160deg,#2d4a2f,#1d3a4a)' };
const Label: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <div style={{ background: 'rgba(10,14,18,0.85)', padding: '8px 18px', borderRadius: 10, fontFamily: 'sans-serif', fontWeight: 800, fontSize: 40, color: '#fff', whiteSpace: 'nowrap' }}>{a} <span style={{ color: '#FFD23F' }}>{b}</span></div>
);
const Test: React.FC = () => (
  <AbsoluteFill style={bg}>
    <Sequence from={0} durationInFrames={120}><QuestionStorm /></Sequence>
    <Sequence from={120} durationInFrames={90}><ThoughtBubble x={600} y={900} /></Sequence>
    <Sequence from={210} durationInFrames={90}><PeopleCrowd x={540} y={1100} /></Sequence>
    <Sequence from={300} durationInFrames={90}><PinDrop x={420} y={1000} size={110}><Label a="Lake" b="Athabasca" /></PinDrop></Sequence>
    <Sequence from={390} durationInFrames={90}>
      <WhipCard at={0} out={45}><AbsoluteFill style={{ background: 'linear-gradient(#9ec7e8,#2f8f9a 55%,#1f5130)' }} /></WhipCard>
      <WhipCard at={45}><AbsoluteFill style={{ background: 'linear-gradient(#cfd9e0,#3fb0b8 50%,#4b5a2a)' }} /></WhipCard>
    </Sequence>
    <Sequence from={480} durationInFrames={120}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <TypeOn text="Pekwachnamaykoskwaskwaypinwanik" every={2} accent="#FFD23F" accentFrom={20} style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: 52, color: '#fff' }} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);
registerRoot(() => <Composition id="CaMotionTest" component={Test} durationInFrames={600} fps={60} width={1080} height={1920} />);
