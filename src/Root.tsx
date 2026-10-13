import React from 'react';
import { Composition } from 'remotion';
import { MainComposition } from './Video';
import { DarienGap, DARIEN_DURATION } from './darien/DarienGap';
import { DarienCover } from './darien/Cover';
import { DarienCoverWide } from './darien/CoverWide';
import { Banner, ProfilePic } from './darien/Brand';
import { Diomede, DIOMEDE_DURATION } from './diomede/Diomede';
import { DiomedeCover } from './diomede/Cover';
import { Sentinel, SENTINEL_DURATION } from './sentinel/Sentinel';
import { SentinelCover } from './sentinel/Cover';
import { Diomede2, DIOMEDE2_DURATION } from './diomede2/Diomede2';
import { ElNino, ELNINO_DURATION } from './elnino/ElNino';
import { Louisiana, LOUISIANA_DURATION } from './louisiana/Louisiana';
import { Mumbai, MUMBAI_DURATION } from './mumbai/Mumbai';
import { MumbaiCover } from './mumbai/Cover';
import { Spain, SPAIN_DURATION } from './spain/Spain';
import { Market, MARKET_DURATION } from './market/Market';
import { Sugar, SUGAR_DURATION } from './sugar/Sugar';
import { SugarCover } from './sugar/Cover';
import { Tibet, TIBET_DURATION } from './tibet/Tibet';
import { TibetCover } from './tibet/Cover';
import { CoochBehar, COOCHBEHAR_DURATION } from './coochbehar/CoochBehar';
import { CoochBeharCover } from './coochbehar/Cover';
import { Bushby, BUSHBY_DURATION } from './bushby/Bushby';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DarienGap"
        component={DarienGap}
        durationInFrames={DARIEN_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="Diomede" component={Diomede} durationInFrames={DIOMEDE_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="Sentinel" component={Sentinel} durationInFrames={SENTINEL_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Louisiana" component={Louisiana} durationInFrames={LOUISIANA_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="MumbaiCover" component={MumbaiCover} durationInFrames={MUMBAI_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Mumbai" component={Mumbai} durationInFrames={MUMBAI_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Spain" component={Spain} durationInFrames={SPAIN_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Market" component={Market} durationInFrames={MARKET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Sugar" component={Sugar} durationInFrames={SUGAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="SugarCover" component={SugarCover} durationInFrames={SUGAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Tibet" component={Tibet} durationInFrames={TIBET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="TibetCover" component={TibetCover} durationInFrames={TIBET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="CoochBehar" component={CoochBehar} durationInFrames={COOCHBEHAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Bushby" component={Bushby} durationInFrames={BUSHBY_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="CoochBeharCover" component={CoochBeharCover} durationInFrames={COOCHBEHAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="ElNino" component={ElNino} durationInFrames={ELNINO_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Diomede2" component={Diomede2} durationInFrames={DIOMEDE2_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="SentinelCover" component={SentinelCover} durationInFrames={SENTINEL_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="DiomedeCover" component={DiomedeCover} durationInFrames={DIOMEDE_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="DarienCover" component={DarienCover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="ProfilePic" component={ProfilePic} durationInFrames={1} fps={30} width={800} height={800} />
      <Composition id="Banner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="DarienCoverWide" component={DarienCoverWide} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'Documentary Video',
        }}
      />
    </>
  );
};
