import React from 'react';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, Sequence, interpolate, staticFile} from 'remotion';
import {DevotionalText} from './DevotionalText';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {Scene04} from './scenes/Scene04';
import {Scene05} from './scenes/Scene05';
import {Scene06} from './scenes/Scene06';
import {Scene07} from './scenes/Scene07';
import {Scene08} from './scenes/Scene08';
import {Scene09} from './scenes/Scene09';
import {Scene10} from './scenes/Scene10';
import {Scene11} from './scenes/Scene11';
import {Scene12} from './scenes/Scene12';
import {Scene13} from './scenes/Scene13';
import {Scene14} from './scenes/Scene14';
import {Scene15} from './scenes/Scene15';
import {Scene16} from './scenes/Scene16';
import {Scene17} from './scenes/Scene17';
import {Scene18} from './scenes/Scene18';

loadFont({family: 'Mukta', url: staticFile('fonts/Mukta-Bold.ttf'), weight: '700'});

export const GanpatiReel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#120100'}}>
    <Sequence name="01 Character reveal" from={0} durationInFrames={78}><Scene01 /></Sequence>
    <Sequence name="02 Idol close-up" from={78} durationInFrames={80}><Scene02 /></Sequence>
    <Sequence name="03 Flower preparation slow-mo" from={158} durationInFrames={88}><Scene03 /></Sequence>
    <Sequence name="04 Idol pan" from={246} durationInFrames={73}><Scene04 /></Sequence>
    <Sequence name="05 Offering plate slow-mo" from={319} durationInFrames={74}><Scene05 /></Sequence>
    <Sequence name="06 Idol portrait" from={393} durationInFrames={73}><Scene06 /></Sequence>
    <Sequence name="07 Aarti slow-mo" from={466} durationInFrames={73}><Scene07 /></Sequence>
    <Sequence name="08 Idol reveal" from={539} durationInFrames={67}><Scene08 /></Sequence>
    <Sequence name="09 Character blessing slow-mo" from={606} durationInFrames={80}><Scene09 /></Sequence>
    <Sequence name="10 Festive altar pan" from={686} durationInFrames={66}><Scene10 /></Sequence>
    <Sequence name="11 Character devotion slow-mo" from={752} durationInFrames={80}><Scene11 /></Sequence>
    <Sequence name="12 Idol wide" from={832} durationInFrames={73}><Scene12 /></Sequence>
    <Sequence name="13 Character portrait" from={905} durationInFrames={33}><Scene13 /></Sequence>
    <Sequence name="14 Audio loop idol beat" from={938} durationInFrames={78}><Scene14 /></Sequence>
    <Sequence name="15 Flower details slow-mo" from={1016} durationInFrames={80}><Scene15 /></Sequence>
    <Sequence name="16 Ganpati hero still" from={1096} durationInFrames={88}><Scene16 /></Sequence>
    <Sequence name="17 Character hero slow-mo" from={1184} durationInFrames={73}><Scene17 /></Sequence>
    <Sequence name="18 Namaste finish" from={1257} durationInFrames={66}><Scene18 /></Sequence>

    <Sequence name="Title 1" from={0} durationInFrames={113}>
      <DevotionalText line="गणपती बाप्पा मोरया" durationInFrames={113} />
    </Sequence>
    <Sequence name="Final title" from={1239} durationInFrames={84}>
      <DevotionalText line="गणपती बाप्पा मोरया" durationInFrames={84} />
    </Sequence>

    <Audio
      src={staticFile('assets/music.mp3')}
      loop
      loopVolumeCurveBehavior="repeat"
      volume={(frame) =>
        interpolate(frame, [0, 10, 1317, 1322], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
  </AbsoluteFill>
);
