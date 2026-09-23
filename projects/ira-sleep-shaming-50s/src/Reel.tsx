import '@fontsource-variable/noto-sans-devanagari';
import React from 'react';
import {Audio} from '@remotion/media';
import {TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {IllustrationShot, IraShot} from './scenes/EditorialShot';

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#101219'}}>
      <TransitionSeries name="21-shot visual timeline">
        <TransitionSeries.Sequence name="SHOT001 · Ira hook" durationInFrames={36}>
          <IraShot source="keyed/S01_on_user_background.mp4" trimBefore={0} label="SLEEP SHAMING?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT002 · Sleeping" durationInFrames={60}>
          <IllustrationShot source="illustrations/V01_sleeping.svg" label="कोई सो रहा है?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT003 · Curtains light noise" durationInFrames={54}>
          <IllustrationShot source="illustrations/V02_curtains_light.svg" label="CURTAINS. LIGHT. NOISE." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT004 · Taunt" durationInFrames={54}>
          <IllustrationShot source="illustrations/V03_taunt.svg" label="कितना सोएगा तू?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT005 · Ira hook close" durationInFrames={36}>
          <IraShot source="keyed/S01_on_user_background.mp4" trimBefore={204} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence name="SHOT006 · Six AM" durationInFrames={60}>
          <IllustrationShot source="illustrations/V04_alarm6.svg" label="6 AM = ACHIEVEMENT?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT007 · Ira body clock" durationInFrames={48}>
          <IraShot source="keyed/S02_on_user_background.mp4" trimBefore={60} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT008 · Chronotypes" durationInFrames={72}>
          <IllustrationShot source="illustrations/V05_chronotypes.svg" label="BODY CLOCKS DIFFER" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT009 · Late not lazy" durationInFrames={60}>
          <IllustrationShot source="illustrations/V06_late_not_lazy.svg" label="LATE ≠ LAZY" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence name="SHOT010 · Sleep debt" durationInFrames={60}>
          <IllustrationShot source="illustrations/V07_sleep_debt.svg" label="नींद पूरी नहीं हुई" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT011 · Ira evidence" durationInFrames={36}>
          <IraShot source="keyed/S03_on_user_background.mp4" trimBefore={60} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT012 · Seven hours" durationInFrames={84}>
          <IllustrationShot source="illustrations/V08_seven_hours.svg" label="MOST ADULTS: 7+ HOURS" accent="#E9C35D" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT013 · Recovery" durationInFrames={60}>
          <IllustrationShot source="illustrations/V09_recovery.svg" label="RECOVERY MATTERS" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence name="SHOT014 · Seminar" durationInFrames={60}>
          <IllustrationShot source="illustrations/V10_seminar.svg" label="SEMINAR में नींद?" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT015 · Ira joke" durationInFrames={48}>
          <IraShot source="keyed/S04_on_user_background.mp4" trimBefore={60} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT016 · Judgement tag" durationInFrames={60}>
          <IllustrationShot source="illustrations/V11_judgement_tag.svg" label="LAZY? UNINTERESTED?" accent="#D7836A" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT017 · Ask why" durationInFrames={72}>
          <IllustrationShot source="illustrations/V12_why_sleepy.svg" label="पहले कारण पूछो" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence name="SHOT018 · Morning habit" durationInFrames={60}>
          <IllustrationShot source="illustrations/V13_morning_habit.svg" label="EARLY RISING? FINE." />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT019 · Ira less sleep" durationInFrames={48}>
          <IraShot source="keyed/S05_on_user_background.mp4" trimBefore={60} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT020 · Balance" durationInFrames={60}>
          <IllustrationShot source="illustrations/V14_balance.svg" label="PRODUCTIVITY + RECOVERY" accent="#E9C35D" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="SHOT021 · Ira close" durationInFrames={72}>
          <IraShot source="keyed/S05_on_user_background.mp4" trimBefore={168} label="RESPECT RECOVERY" />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence name="Narration S01" from={0} durationInFrames={240} layout="none">
        <Audio src={staticFile('audio/S01.wav')} volume={1} />
      </Sequence>
      <Sequence name="Narration S02" from={240} durationInFrames={240} layout="none">
        <Audio src={staticFile('audio/S02.wav')} volume={1} />
      </Sequence>
      <Sequence name="Narration S03" from={480} durationInFrames={240} layout="none">
        <Audio src={staticFile('audio/S03.wav')} volume={1} />
      </Sequence>
      <Sequence name="Narration S04" from={720} durationInFrames={240} layout="none">
        <Audio src={staticFile('audio/S04.wav')} volume={1} />
      </Sequence>
      <Sequence name="Narration S05" from={960} durationInFrames={240} layout="none">
        <Audio src={staticFile('audio/S05.wav')} volume={1} />
      </Sequence>

      <Sequence name="SFX · curtains and light" from={96} durationInFrames={20} layout="none">
        <Audio src={staticFile('sfx/soft_switch.wav')} volume={0.085} />
      </Sequence>
      <Sequence name="SFX · six AM" from={240} durationInFrames={20} layout="none">
        <Audio src={staticFile('sfx/soft_tick.wav')} volume={0.1} />
      </Sequence>
      <Sequence name="SFX · seven hours" from={576} durationInFrames={20} layout="none">
        <Audio src={staticFile('sfx/soft_tick.wav')} volume={0.085} />
      </Sequence>
      <Sequence name="SFX · judgement tag" from={828} durationInFrames={20} layout="none">
        <Audio src={staticFile('sfx/soft_pop.wav')} volume={0.085} />
      </Sequence>
      <Sequence name="SFX · balance payoff" from={1068} durationInFrames={20} layout="none">
        <Audio src={staticFile('sfx/soft_chime.wav')} volume={0.07} />
      </Sequence>
    </AbsoluteFill>
  );
};
