import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { Paper } from './Paper';
import { T01TugOfWar } from './T01TugOfWar';
import { T02Flex } from './T02Flex';
import { T03Balance } from './T03Balance';
import { T04Electric } from './T04Electric';
import { T05Clash } from './T05Clash';
import { T06Diplomats } from './T06Diplomats';
import { T07Gloves } from './T07Gloves';
import { T08Padlock } from './T08Padlock';
import { T09Chevrons } from './T09Chevrons';
import { T10Gunboat } from './T10Gunboat';
import { T11Question } from './T11Question';
import { T12FlagBalls } from './T12FlagBalls';
import { T13Soldiers } from './T13Soldiers';
import { T14King } from './T14King';
import { T15Heart } from './T15Heart';
import { T16Dodge } from './T16Dodge';
import { T17Send } from './T17Send';

// t99_reel: a preview of every motion piece back to back, for the creator to review. The transparent pieces sit on a
// plain dark map-blue stand-in; the skit, battle and King sit on paper in place of their GPT backgrounds. Not used in the edit.
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #2C5466 0%, #142A35 75%)' }}>{children}</AbsoluteFill>
);
const Center: React.FC<{ w: number; h: number; s?: number; children: React.ReactNode }> = ({ w, h, s = 1, children }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: w, height: h, transform: `scale(${s})`, position: 'relative' }}>{children}</div>
  </AbsoluteFill>
);

export const T99Reel: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={120}><Dark><Center w={600} h={800}><T11Question /></Center></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={150}><Dark><Center w={1080} h={1080}><T16Dodge /></Center></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={240}><T01TugOfWar /></Series.Sequence>
    <Series.Sequence durationInFrames={240}><Dark><T13Soldiers /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={150}><Dark><T12FlagBalls /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={120}><Dark><T09Chevrons /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={240}><T02Flex /></Series.Sequence>
    <Series.Sequence durationInFrames={210}><T03Balance /></Series.Sequence>
    <Series.Sequence durationInFrames={90}><Dark><T04Electric /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={150}><Dark><T05Clash /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={840}><Paper floor={1780} /><T06Diplomats /></Series.Sequence>
    <Series.Sequence durationInFrames={170}><Dark><T07Gloves /></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={110}><Dark><Center w={600} h={700}><T08Padlock /></Center></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={200}><Dark><Center w={1200} h={700} s={0.85}><T10Gunboat /></Center></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={330}><Paper floor={1760} /><T14King /></Series.Sequence>
    <Series.Sequence durationInFrames={150}><Dark><Center w={600} h={600}><T15Heart /></Center></Dark></Series.Sequence>
    <Series.Sequence durationInFrames={130}><Dark><Center w={700} h={700}><T17Send /></Center></Dark></Series.Sequence>
  </Series>
);
