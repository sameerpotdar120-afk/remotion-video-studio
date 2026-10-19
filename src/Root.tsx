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
import { SpainCover } from './spain/Cover';
import { Market, MARKET_DURATION } from './market/Market';
import { Sugar, SUGAR_DURATION } from './sugar/Sugar';
import { SugarCover } from './sugar/Cover';
import { Tibet, TIBET_DURATION } from './tibet/Tibet';
import { TibetCover } from './tibet/Cover';
import { CoochBehar, COOCHBEHAR_DURATION } from './coochbehar/CoochBehar';
import { CoochBeharCover } from './coochbehar/Cover';
import { Bushby, BUSHBY_DURATION } from './bushby/Bushby';
import { BushbyCover } from './bushby/Cover';
import { Twins, TWINS_DURATION, TWINS_DURATION_60 } from './twins/Twins';
import { TwinsCover } from './twins/Cover';
import { Kalpasar, KALPASAR_DURATION, KALPASAR_DURATION_60 } from './kalpasar/Kalpasar';
import { KalpasarCover } from './kalpasar/Cover';
import { Kolkata, KOLKATA_DURATION, KOLKATA_DURATION_60 } from './kolkata/Kolkata';
import { KolkataCover } from './kolkata/Cover';
import { Siliguri, SILIGURI_DURATION, SILIGURI_DURATION_60 } from './siliguri/Siliguri';
import { SiliguriCover } from './siliguri/Cover';
import { WW3, WW3_DURATION_60 } from './ww3safe/WW3';
import { WW3Cover } from './ww3safe/Cover';
import { TimeZones, TZ_DURATION_60 } from './timezones/TimeZones';
import { TZCover } from './timezones/Cover';
import { Thailand, TH_DURATION_60 } from './thailand/edit/Thailand';
import { ThCover } from './thailand/edit/Cover';
import { HyCover } from './hundredyears/edit/Cover';
import { Closest, CS_DURATION_60 } from './closestspace/edit/Closest';
import { CsCover } from './closestspace/edit/Cover';
import { Hundred, HY_DURATION_60 } from './hundredyears/edit/Hundred';
import { Chile, CHILE_DURATION_60 } from './chile/Chile';
import { ChileCover } from './chile/Cover';
import { Tibet2, TIBET2_DURATION, TIBET2_DURATION_60 } from './tibet2/Tibet2';
import { Tibet2Cover } from './tibet2/Cover';

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
      <Composition id="SpainCover" component={SpainCover} durationInFrames={SPAIN_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Market" component={Market} durationInFrames={MARKET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Sugar" component={Sugar} durationInFrames={SUGAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="SugarCover" component={SugarCover} durationInFrames={SUGAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Tibet" component={Tibet} durationInFrames={TIBET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="TibetCover" component={TibetCover} durationInFrames={TIBET_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="CoochBehar" component={CoochBehar} durationInFrames={COOCHBEHAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Bushby" component={Bushby} durationInFrames={BUSHBY_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Twins" component={Twins} durationInFrames={TWINS_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Kalpasar" component={Kalpasar} durationInFrames={KALPASAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="KalpasarCover" component={KalpasarCover} durationInFrames={KALPASAR_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Kolkata" component={Kolkata} durationInFrames={KOLKATA_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="KolkataCover" component={KolkataCover} durationInFrames={KOLKATA_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true, res: 2 }} />
      <Composition id="Siliguri" component={Siliguri} durationInFrames={SILIGURI_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="SiliguriCover" component={SiliguriCover} durationInFrames={SILIGURI_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Siliguri2K60" component={Siliguri} durationInFrames={SILIGURI_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 4 / 3 }} />
      <Composition id="ChileCover" component={ChileCover} durationInFrames={CHILE_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ text: true, res: 1 }} />
      <Composition id="WW3Safe60" component={WW3} durationInFrames={WW3_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 1 }} />
      <Composition id="TZCover" component={TZCover} durationInFrames={TZ_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ text: true, res: 1 }} />
      <Composition id="ThCover" component={ThCover} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="HyCover" component={HyCover} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Hundred4K60" component={Hundred} durationInFrames={HY_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, audio: '' }} />
      <Composition id="Closest4K60" component={Closest} durationInFrames={CS_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, audio: "" }} />
      <Composition id="CsCover" component={CsCover} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Thailand4K60" component={Thailand} durationInFrames={TH_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, audio: '' }} />
      <Composition id="TimeZones4K60" component={TimeZones} durationInFrames={TZ_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2, nullReady: false }} />
      <Composition id="WW3Cover" component={WW3Cover} durationInFrames={WW3_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ text: true, res: 1 }} />
      <Composition id="Chile2K60" component={Chile} durationInFrames={CHILE_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 4 / 3 }} />
      <Composition id="Kolkata60" component={Kolkata} durationInFrames={KOLKATA_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, cut3d: true, veo: true }} />
      <Composition id="Kolkata4K60" component={Kolkata} durationInFrames={KOLKATA_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2 }} />
      <Composition id="Tibet2" component={Tibet2} durationInFrames={TIBET2_DURATION} fps={30} width={1080} height={1920} defaultProps={{ captions: true }} />
      <Composition id="Tibet2-2K60" component={Tibet2} durationInFrames={TIBET2_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 4 / 3 }} />
      <Composition id="Tibet2Cover" component={Tibet2Cover} durationInFrames={TIBET2_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true, res: 2 }} />
      <Composition id="Kalpasar4K60" component={Kalpasar} durationInFrames={KALPASAR_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2 }} />
      <Composition id="TwinsCover" component={TwinsCover} durationInFrames={TWINS_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
      <Composition id="Twins4K60" component={Twins} durationInFrames={TWINS_DURATION_60} fps={60} width={1080} height={1920} defaultProps={{ captions: true, res: 2 }} />
      <Composition id="BushbyCover" component={BushbyCover} durationInFrames={BUSHBY_DURATION} fps={30} width={1080} height={1920} defaultProps={{ text: true }} />
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
