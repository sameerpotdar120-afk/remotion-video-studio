import React from 'react';
import { Composition } from 'remotion';
import { U01TouristPop } from './U01TouristPop';
import { U02WeatherMontage } from './U02WeatherMontage';
import { U03WindBlow } from './U03WindBlow';
import { U04NeonSlam } from './U04NeonSlam';
import { U05Lightning } from './U05Lightning';
import { U06FillDevelop } from './U06FillDevelop';
import { U07Calendar } from './U07Calendar';
import { U08EllipseTitle } from './U08EllipseTitle';
import { U09TiltWorld } from './U09TiltWorld';
import { U10GiantWord } from './U10GiantWord';
import { U11GlowLabel } from './U11GlowLabel';
import { U12RibbonGrow } from './U12RibbonGrow';
import { U13HatchHalo } from './U13HatchHalo';
import { U14DashArrow } from './U14DashArrow';
import { U15FlyAtCamera } from './U15FlyAtCamera';
import { U16WindCurls } from './U16WindCurls';
import { U17AirTag } from './U17AirTag';
import { U18SendUmbrella } from './U18SendUmbrella';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="u01-tourist-pop" component={U01TouristPop} width={800} height={1000} fps={60} durationInFrames={120} />
    <Composition id="u02-weather-montage" component={U02WeatherMontage} width={1080} height={1920} fps={60} durationInFrames={300} />
    <Composition id="u03-wind-blow" component={U03WindBlow} width={1080} height={1920} fps={60} durationInFrames={90} />
    <Composition id="u04-neon-slam" component={U04NeonSlam} width={1080} height={1080} fps={60} durationInFrames={140} />
    <Composition id="u05-lightning" component={U05Lightning} width={1080} height={1920} fps={60} durationInFrames={30} />
    <Composition id="u06-fill-develop" component={U06FillDevelop} width={1080} height={1080} fps={60} durationInFrames={60} />
    <Composition id="u07-calendar" component={U07Calendar} width={1080} height={700} fps={60} durationInFrames={150} />
    <Composition id="u08-ellipse-title" component={U08EllipseTitle} width={1080} height={1080} fps={60} durationInFrames={150} />
    <Composition id="u09-tilt-world" component={U09TiltWorld} width={1080} height={1920} fps={60} durationInFrames={240} />
    <Composition id="u10-giant-word" component={U10GiantWord} width={1080} height={1920} fps={60} durationInFrames={120} />
    <Composition id="u11-glow-label" component={U11GlowLabel} width={800} height={400} fps={60} durationInFrames={90} />
    <Composition id="u12-ribbon-grow" component={U12RibbonGrow} width={1080} height={1080} fps={60} durationInFrames={60} />
    <Composition id="u13-hatch-halo" component={U13HatchHalo} width={1080} height={1080} fps={60} durationInFrames={120} />
    <Composition id="u14-dash-arrow" component={U14DashArrow} width={1080} height={1920} fps={60} durationInFrames={60} />
    <Composition id="u15-fly-at-camera" component={U15FlyAtCamera} width={1080} height={1080} fps={60} durationInFrames={110} />
    <Composition id="u16-wind-curls" component={U16WindCurls} width={1080} height={1920} fps={60} durationInFrames={180} />
    <Composition id="u17-air-tag" component={U17AirTag} width={600} height={300} fps={60} durationInFrames={90} />
    <Composition id="u18-send-umbrella" component={U18SendUmbrella} width={600} height={700} fps={60} durationInFrames={120} />
  </>
);
