import React, {CSSProperties, ReactNode} from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const FPS = 30;
const f = (seconds: number) => Math.round(seconds * FPS);

const C = {
  ink: '#07111f',
  navy: '#081522',
  paper: '#f4f0e8',
  white: '#f7fbff',
  cyan: '#31d7ff',
  blue: '#356df3',
  amber: '#ffbd54',
  coral: '#ff655e',
  lime: '#b6f15b',
  muted: '#a8b9c7',
};

const font = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const mono = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const enter = (frame: number, distance = 24) => {
  const p = spring({frame, fps: FPS, config: {damping: 16, stiffness: 170, mass: 0.75}});
  return {
    opacity: interpolate(p, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)`,
  };
};

const pop = (frame: number, delay = 0) =>
  spring({frame: frame - delay, fps: FPS, config: {damping: 13, stiffness: 180, mass: 0.65}});

const panel: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'linear-gradient(145deg, rgba(10,25,40,0.96), rgba(7,15,26,0.9))',
  boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
  borderRadius: 34,
};

const Kicker: React.FC<{children: ReactNode; color?: string}> = ({children, color = C.cyan}) => (
  <div style={{color, fontFamily: mono, fontSize: 24, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase'}}>
    {children}
  </div>
);

const Source: React.FC<{children: ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 58, right: 58, bottom: 48, color: 'rgba(234,244,250,0.72)', fontFamily: mono, fontSize: 18, lineHeight: 1.35, letterSpacing: 0.4}}>
    SOURCE • {children}
  </div>
);

const StudioBackdrop: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#19070a'}}>
    <Img
      src={staticFile('assets/studio-bg-warm.jpg')}
      style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.965) saturate(0.94)'}}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 53% 38%, transparent 18%, rgba(8,3,8,0.08) 62%, rgba(4,2,7,0.35) 100%), linear-gradient(180deg, rgba(8,3,8,0.02) 0%, rgba(8,3,8,0.03) 54%, rgba(3,2,7,0.46) 100%)',
      }}
    />
  </AbsoluteFill>
);

const NarrationSlice: React.FC<{trimBefore: number; outputStart: number}> = ({trimBefore, outputStart}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = localFrame + outputStart;
  const shiftLeft = globalFrame >= f(1.2) && globalFrame < f(3.9) ? -155 : 0;
  return (
    <>
      <Video
        src={staticFile('assets/ira-keyed-silent.webm')}
        trimBefore={trimBefore}
        muted
        objectFit="contain"
        style={{
          position: 'absolute',
          height: 1770,
          width: 996,
          left: '50%',
          bottom: -8,
          transform: `translateX(calc(-50% + ${shiftLeft}px))`,
          filter:
            'contrast(1.055) brightness(0.988) saturate(0.94) sepia(0.04) hue-rotate(-3deg) drop-shadow(12px 0 28px rgba(255,72,22,0.28)) drop-shadow(-12px 0 28px rgba(30,85,180,0.22)) drop-shadow(0 28px 36px rgba(0,0,0,0.48))',
        }}
      />
      <Audio src={staticFile('assets/ira-narration.m4a')} trimBefore={trimBefore} volume={0.82} />
    </>
  );
};

const NarrationTimeline: React.FC = () => (
  <>
    <Sequence name="Ira cut 01" from={0} durationInFrames={118}><NarrationSlice trimBefore={0} outputStart={0} /></Sequence>
    <Sequence name="Ira cut 02" from={118} durationInFrames={37}><NarrationSlice trimBefore={126} outputStart={118} /></Sequence>
    <Sequence name="Ira cut 03" from={155} durationInFrames={112}><NarrationSlice trimBefore={173} outputStart={155} /></Sequence>
    <Sequence name="Ira cut 04" from={267} durationInFrames={64}><NarrationSlice trimBefore={311} outputStart={267} /></Sequence>
    <Sequence name="Ira cut 05" from={331} durationInFrames={146}><NarrationSlice trimBefore={385} outputStart={331} /></Sequence>
    <Sequence name="Ira cut 06" from={477} durationInFrames={43}><NarrationSlice trimBefore={544} outputStart={477} /></Sequence>
    <Sequence name="Ira cut 07" from={520} durationInFrames={70}><NarrationSlice trimBefore={607} outputStart={520} /></Sequence>
    <Sequence name="Ira cut 08" from={590} durationInFrames={71}><NarrationSlice trimBefore={688} outputStart={590} /></Sequence>
    <Sequence name="Ira cut 09" from={661} durationInFrames={128}><NarrationSlice trimBefore={769} outputStart={661} /></Sequence>
    <Sequence name="Ira cut 10" from={789} durationInFrames={178}><NarrationSlice trimBefore={907} outputStart={789} /></Sequence>
    <Sequence name="Ira cut 11" from={967} durationInFrames={94}><NarrationSlice trimBefore={1096} outputStart={967} /></Sequence>
    <Sequence name="Ira cut 12" from={1061} durationInFrames={33}><NarrationSlice trimBefore={1203} outputStart={1061} /></Sequence>
    <Sequence name="Ira cut 13" from={1094} durationInFrames={137}><NarrationSlice trimBefore={1248} outputStart={1094} /></Sequence>
    <Sequence name="Ira cut 14" from={1231} durationInFrames={165}><NarrationSlice trimBefore={1392} outputStart={1231} /></Sequence>
    <Sequence name="Ira cut 15" from={1396} durationInFrames={59}><NarrationSlice trimBefore={1576} outputStart={1396} /></Sequence>
    <Sequence name="Ira cut 16" from={1455} durationInFrames={145}><NarrationSlice trimBefore={1644} outputStart={1455} /></Sequence>
    <Sequence name="Ira cut 17" from={1600} durationInFrames={157}><NarrationSlice trimBefore={1802} outputStart={1600} /></Sequence>
    <Sequence name="Ira cut 18" from={1757} durationInFrames={49}><NarrationSlice trimBefore={1968} outputStart={1757} /></Sequence>
    <Sequence name="Ira cut 19" from={1806} durationInFrames={73}><NarrationSlice trimBefore={2025} outputStart={1806} /></Sequence>
    <Sequence name="Ira cut 20" from={1879} durationInFrames={65}><NarrationSlice trimBefore={2114} outputStart={1879} /></Sequence>
    <Sequence name="Ira cut 21" from={1944} durationInFrames={67}><NarrationSlice trimBefore={2188} outputStart={1944} /></Sequence>
    <Sequence name="Ira cut 22" from={2011} durationInFrames={133}><NarrationSlice trimBefore={2265} outputStart={2011} /></Sequence>
    <Sequence name="Ira cut 23" from={2144} durationInFrames={33}><NarrationSlice trimBefore={2408} outputStart={2144} /></Sequence>
    <Sequence name="Ira cut 24" from={2177} durationInFrames={245}><NarrationSlice trimBefore={2450} outputStart={2177} /></Sequence>
    <Sequence name="Ira cut 25" from={2422} durationInFrames={130}><NarrationSlice trimBefore={2704} outputStart={2422} /></Sequence>
    <Sequence name="Ira cut 26" from={2552} durationInFrames={92}><NarrationSlice trimBefore={2843} outputStart={2552} /></Sequence>
    <Sequence name="Ira cut 27" from={2644} durationInFrames={55}><NarrationSlice trimBefore={2946} outputStart={2644} /></Sequence>
  </>
);

const OpeningData: React.FC = () => {
  const frame = useCurrentFrame();
  const value = Math.round(interpolate(frame, [0, 24], [0, 2], {extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{padding: '92px 62px'}}>
      <div style={{...enter(frame), width: 430}}>
        <Kicker>Aaj ka normal</Kicker>
        <div style={{color: C.white, fontSize: 112, fontWeight: 950, lineHeight: 0.93, marginTop: 14}}>{value}GB</div>
        <div style={{color: C.muted, fontSize: 29, fontWeight: 700, marginTop: 16}}>har din</div>
      </div>
      <div style={{position: 'absolute', left: 62, bottom: 78, color: C.white, fontSize: 31, fontWeight: 850, padding: '16px 24px', borderLeft: `5px solid ${C.cyan}`, background: 'rgba(4,13,22,0.74)'}}>
        bina soche-samjhe
      </div>
    </AbsoluteFill>
  );
};

const DataDrain: React.FC = () => {
  const frame = useCurrentFrame();
  const used = interpolate(frame, [0, f(2.2)], [7, 96], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div style={{...panel, ...enter(frame), position: 'absolute', right: 58, top: 232, width: 430, padding: 28}}>
        <Kicker>Today</Kicker>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18}}>
          <span style={{fontSize: 38, color: C.white, fontWeight: 900}}>Daily data</span>
          <span style={{fontFamily: mono, color: C.cyan, fontSize: 27}}>{Math.round(used)}%</span>
        </div>
        <div style={{height: 18, borderRadius: 20, background: '#17293a', overflow: 'hidden', marginTop: 26}}>
          <div style={{height: '100%', width: `${used}%`, borderRadius: 20, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, boxShadow: `0 0 20px ${C.cyan}`}} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24}}>
          <div style={{color: C.white, fontSize: 25}}>▰ Video</div><div style={{color: C.white, fontSize: 25}}>⌁ Social</div>
          <div style={{color: C.white, fontSize: 25}}>⌖ Maps</div><div style={{color: C.white, fontSize: 25}}>◉ Calls</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Rewind: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, f(2.2)], [0, 1], {extrapolateRight: 'clamp'});
  const year = Math.round(interpolate(p, [0, 1], [2026, 2014]));
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at 50% 48%, rgba(49,215,255,0.15), rgba(4,12,20,0.9) 58%)'}}>
      <div style={{fontFamily: mono, color: C.cyan, fontSize: 25, letterSpacing: 5}}>REWINDING INDIA</div>
      <div style={{fontSize: 205, color: C.white, fontWeight: 950, lineHeight: 1, marginTop: 22}}>{year}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 46, width: 760}}>
        <div style={{color: C.cyan, fontSize: 48}}>◀◀</div>
        <div style={{height: 8, flex: 1, borderRadius: 9, background: '#1f3445', overflow: 'hidden'}}><div style={{height: '100%', width: `${p * 100}%`, background: C.cyan}} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Price2014: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Img src={staticFile('assets/ai-2014-data.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + frame / 2200})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,9,14,0.12), rgba(3,9,14,0.88) 78%)'}} />
      <div style={{position: 'absolute', left: 62, right: 62, bottom: 210, ...enter(frame)}}>
        <Kicker color={C.amber}>2014 • Average cost per GB</Kicker>
        <div style={{fontSize: 126, color: C.white, fontWeight: 950, letterSpacing: -6}}>₹268.97</div>
        <div style={{fontSize: 28, color: C.muted, fontWeight: 700}}>≈ ₹269 per GB</div>
      </div>
      <Source>TRAI, Wireless Data Services in India (2019), Chart 3.5</Source>
    </AbsoluteFill>
  );
};

const JioDate: React.FC = () => {
  const frame = useCurrentFrame();
  const p = pop(frame);
  return (
    <AbsoluteFill style={{padding: '86px 58px'}}>
      <div style={{...panel, position: 'absolute', right: 56, top: 236, width: 410, padding: '32px 34px', transform: `scale(${p}) rotate(-1.5deg)`, transformOrigin: 'center'}}>
        <Kicker>Entry date</Kicker>
        <div style={{color: C.white, fontSize: 96, lineHeight: 0.92, fontWeight: 950, marginTop: 24}}>05</div>
        <div style={{color: C.cyan, fontSize: 48, fontWeight: 900}}>SEP 2016</div>
        <div style={{height: 5, width: 110, background: C.amber, marginTop: 24}} />
        <div style={{color: C.muted, fontSize: 23, marginTop: 18}}>Jio services begin</div>
      </div>
    </AbsoluteFill>
  );
};

const ArchivalOffer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#03080d', padding: '98px 48px'}}>
      <div style={{...enter(frame), textAlign: 'center'}}><Kicker>Archival • 2016 launch</Kicker><div style={{fontSize: 58, color: C.white, fontWeight: 950, marginTop: 15}}>WELCOME OFFER</div></div>
      <div style={{...panel, position: 'absolute', left: 48, right: 48, top: 360, height: 690, overflow: 'hidden', borderRadius: 28}}>
        <Video src={staticFile('assets/jio-agm-free-voice-v2.mp4')} muted objectFit="cover" style={{width: '100%', height: '100%'}} />
        <div style={{position: 'absolute', left: 24, bottom: 22, ...panel, borderRadius: 14, padding: '10px 16px'}}><span style={{fontFamily: mono, color: C.white, fontSize: 17}}>SOURCE AUDIO MUTED</span></div>
      </div>
      <div style={{position: 'absolute', left: 78, right: 78, bottom: 170, color: C.white, fontSize: 33, lineHeight: 1.25, fontWeight: 820, textAlign: 'center'}}>Voice, data, video &amp; Jio apps — free through December 2016</div>
      <Source>Reliance Jio launch announcement, 1 Sep 2016</Source>
    </AbsoluteFill>
  );
};

const FreeCards: React.FC = () => {
  const frame = useCurrentFrame();
  const Card = ({title, sub, color, delay}: {title: string; sub: string; color: string; delay: number}) => {
    const p = pop(frame, delay);
    return <div style={{...panel, width: 296, height: 430, padding: 28, transform: `scale(${p}) translateY(${(1 - p) * 60}px)`, borderTop: `7px solid ${color}`}}>
      <div style={{fontFamily: mono, color, fontSize: 24}}>₹0</div><div style={{fontSize: 50, color: C.white, fontWeight: 950, marginTop: 120}}>{title}</div><div style={{fontSize: 23, color: C.muted, marginTop: 14}}>{sub}</div>
    </div>;
  };
  return <AbsoluteFill style={{background: 'linear-gradient(155deg, #06101b, #0b1e31)', padding: '160px 64px'}}>
    <Kicker>Welcome Offer</Kicker><div style={{color: C.white, fontSize: 61, fontWeight: 950, marginTop: 18}}>Everything felt free.</div>
    <div style={{display: 'flex', gap: 22, marginTop: 190}}><Card title="VOICE" sub="Unlimited calls" color={C.cyan} delay={0} /><Card title="DATA" sub="LTE internet" color={C.amber} delay={8} /><Card title="VIDEO" sub="Apps & content" color={C.coral} delay={16} /></div>
    <div style={{color: C.muted, fontSize: 27, marginTop: 62}}>Welcome Offer • through 31 December 2016</div>
  </AbsoluteFill>;
};

const NotOnlyCheap: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{padding: '92px 60px'}}><div style={{...enter(frame), width: 420}}><Kicker>The bigger shift</Kicker><div style={{fontSize: 61, color: C.white, fontWeight: 950, lineHeight: 1.04, marginTop: 20}}>Sirf sasta data nahi.</div><div style={{fontSize: 28, color: C.muted, lineHeight: 1.4, marginTop: 24}}>Jio removed three everyday fears.</div></div></AbsoluteFill>;
};

const FearCards: React.FC = () => {
  const frame = useCurrentFrame();
  const Fear = ({n, title, detail, color, delay}: {n: string; title: string; detail: string; color: string; delay: number}) => {
    const p = pop(frame, delay);
    return <div style={{...panel, opacity: p, transform: `translateX(${interpolate(p, [0, 1], [80, 0])}px)`, display: 'grid', gridTemplateColumns: '105px 1fr', gap: 20, alignItems: 'center', padding: '30px 34px', borderLeft: `7px solid ${color}`}}>
      <div style={{fontFamily: mono, color, fontSize: 56, fontWeight: 900}}>{n}</div><div><div style={{color: C.white, fontSize: 39, fontWeight: 900}}>{title}</div><div style={{color: C.muted, fontSize: 24, marginTop: 8}}>{detail}</div></div>
    </div>;
  };
  return <AbsoluteFill style={{background: 'linear-gradient(180deg, #081522, #030a11)', padding: '118px 60px'}}><Kicker>Three fears erased</Kicker><div style={{display: 'grid', gap: 28, marginTop: 135}}><Fear n="01" title="Mehenga bill" detail="Bill shock stopped deciding usage." color={C.coral} delay={0} /><Fear n="02" title="Data khatam" detail="The meter became less frightening." color={C.amber} delay={9} /><Fear n="03" title="Uljhe plans" detail="Simple bundles beat confusing choices." color={C.cyan} delay={18} /></div></AbsoluteFill>;
};

const AnnualReport: React.FC = () => {
  const frame = useCurrentFrame();
  const p = pop(frame);
  return <AbsoluteFill style={{background: '#06101a', padding: '110px 62px'}}><div style={{position: 'absolute', left: 76, right: 76, top: 170, bottom: 150, background: C.paper, color: '#111923', borderRadius: 18, padding: '68px 58px', boxShadow: '0 32px 90px rgba(0,0,0,0.52)', transform: `rotate(${interpolate(p, [0, 1], [-4, -1])}deg) scale(${interpolate(p, [0, 1], [0.9, 1])})`}}>
    <div style={{fontFamily: mono, color: '#356da8', fontWeight: 800, fontSize: 21}}>RELIANCE INDUSTRIES LIMITED</div><div style={{height: 4, background: '#356da8', margin: '24px 0 54px'}} /><div style={{fontSize: 31, color: '#68717b'}}>Annual Report 2016–17</div><div style={{fontSize: 58, lineHeight: 1.12, fontWeight: 950, marginTop: 42}}>100 million subscribers</div><div style={{fontSize: 37, lineHeight: 1.3, marginTop: 32}}>acquired in just <b>170 days</b></div><div style={{marginTop: 72, padding: '24px 26px', background: '#dfeaf2', fontSize: 28, lineHeight: 1.4}}>A record pace for a telecom service launch.</div><div style={{position: 'absolute', left: 58, bottom: 54, fontFamily: mono, fontSize: 18, color: '#53616d'}}>REPORTED BY RIL • 2016–17</div>
  </div></AbsoluteFill>;
};

const HundredMillion: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, f(3.5)], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #173d5a 0%, #07111c 62%)', alignItems: 'center', paddingTop: 160}}><Kicker>Launch velocity</Kicker><div style={{fontSize: 180, color: C.white, fontWeight: 950, lineHeight: 0.9, marginTop: 150}}>{Math.round(p * 100)}M</div><div style={{color: C.cyan, fontSize: 34, fontWeight: 900, letterSpacing: 4, marginTop: 24}}>USERS</div><div style={{width: 720, height: 12, background: '#183247', borderRadius: 20, marginTop: 92, overflow: 'hidden'}}><div style={{width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, boxShadow: `0 0 28px ${C.cyan}`}} /></div><div style={{fontFamily: mono, color: C.amber, fontSize: 65, fontWeight: 900, marginTop: 34}}>{Math.round(p * 170)} DAYS</div><div style={{position: 'absolute', bottom: 170, color: C.muted, fontSize: 26, textAlign: 'center', width: 820}}>100 million subscribers in 170 days</div><Source>Reliance Industries Annual Report 2016–17</Source></AbsoluteFill>;
};

const IndiaChanged: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{padding: '92px 60px'}}><div style={{...enter(frame), width: 430}}><Kicker>Then the habit changed</Kicker><div style={{fontSize: 70, color: C.white, fontWeight: 950, lineHeight: 1.04, marginTop: 22}}>Aur India badal gaya.</div></div></AbsoluteFill>;
};

const UsageChart: React.FC = () => {
  const frame = useCurrentFrame();
  const paperIn = pop(frame);
  const paperOpacity = interpolate(frame, [0, 38, 62], [1, 1, 0.14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chartIn = spring({frame: frame - 38, fps: FPS, config: {damping: 18, stiffness: 125, mass: 0.9}});
  const p = interpolate(frame, [38, f(6.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h2016 = interpolate(p, [0, 1], [0, 118]);
  const h2018 = interpolate(p, [0, 1], [0, 760]);
  return <AbsoluteFill style={{background: '#06101a', padding: '105px 58px'}}>
    <div style={{position: 'absolute', left: 82, right: 82, top: 230, height: 1165, background: C.paper, borderRadius: 13, overflow: 'hidden', opacity: paperOpacity, boxShadow: '0 35px 95px rgba(0,0,0,0.58)', transform: `rotate(${interpolate(paperIn, [0, 1], [-4.5, -1.2])}deg) scale(${interpolate(paperIn, [0, 1], [0.86, 1])})`}}>
      <Img src={staticFile('assets/trai-usage-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
      <div style={{position: 'absolute', left: 125, right: 95, bottom: 155, height: 420, border: `8px solid ${C.amber}`, borderRadius: 12}} />
      <div style={{position: 'absolute', width: 185, height: 38, top: -8, left: 340, background: 'rgba(224,205,159,0.76)', transform: 'rotate(2deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)'}} />
    </div>
    <div style={{opacity: chartIn, transform: `translateY(${interpolate(chartIn, [0, 1], [34, 0])}px)`}}>
      <Kicker>Monthly data per subscriber</Kicker><div style={{color: C.white, fontSize: 56, fontWeight: 950, marginTop: 22}}>1.14GB → 7.60GB</div>
    </div>
    <div style={{position: 'absolute', left: 95, right: 95, top: 430, height: 940, opacity: chartIn, borderLeft: '3px solid #395063', borderBottom: '3px solid #395063'}}>
    <div style={{position: 'absolute', left: 90, bottom: 0, width: 250, height: h2016, background: `linear-gradient(180deg, ${C.blue}, #214fc2)`, borderRadius: '22px 22px 0 0', boxShadow: '0 0 36px rgba(53,109,243,0.32)'}} /><div style={{position: 'absolute', right: 90, bottom: 0, width: 250, height: h2018, background: `linear-gradient(180deg, ${C.cyan}, #167b9c)`, borderRadius: '22px 22px 0 0', boxShadow: '0 0 42px rgba(49,215,255,0.34)'}} /><div style={{position: 'absolute', left: 112, bottom: h2016 + 28, fontSize: 45, color: C.white, fontWeight: 900}}>1.14</div><div style={{position: 'absolute', right: 108, bottom: h2018 + 28, fontSize: 45, color: C.white, fontWeight: 900}}>7.60</div><div style={{position: 'absolute', left: 165, bottom: -68, color: C.muted, fontFamily: mono, fontSize: 28}}>2016</div><div style={{position: 'absolute', right: 155, bottom: -68, color: C.muted, fontFamily: mono, fontSize: 28}}>2018</div>
    </div><div style={{position: 'absolute', left: 62, right: 62, bottom: 170, display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 25, opacity: chartIn}}><span>6.7× growth in two years</span><span style={{color: C.cyan, fontWeight: 900}}>GB / month</span></div><Source>TRAI, Wireless Data Services in India (2019), Chart 2.6</Source>
  </AbsoluteFill>;
};

const Competitors: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: '#f5f1e9', color: '#07111f', padding: '120px 60px'}}><Kicker color="#355060">Market pressure</Kicker><div style={{fontSize: 55, fontWeight: 950, marginTop: 18}}>Everyone had to react.</div><div style={{display: 'grid', gap: 26, marginTop: 175}}><div style={{...enter(frame), borderRadius: 24, background: '#e31b23', color: 'white', padding: '45px 40px', fontSize: 64, fontWeight: 950}}>AIRTEL</div><div style={{...enter(frame - 8), borderRadius: 24, background: '#d92762', color: 'white', padding: '45px 40px', fontSize: 64, fontWeight: 950}}>VODAFONE</div><div style={{...enter(frame - 16), borderRadius: 24, background: '#ffd727', color: '#151515', padding: '45px 40px', fontSize: 64, fontWeight: 950}}>IDEA</div></div><div style={{position: 'absolute', bottom: 128, left: 60, right: 60, color: '#45525d', fontSize: 27}}>Names shown as editorial typography — no recreated logos.</div></AbsoluteFill>;
};

const PriceWar: React.FC = () => {
  const frame = useCurrentFrame();
  const down = interpolate(frame, [0, f(4.5)], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: 'linear-gradient(145deg, #07111d, #10253a)', padding: '105px 60px'}}><Kicker>Price war</Kicker><div style={{fontSize: 61, color: C.white, fontWeight: 950, marginTop: 18}}>Plans changed. Fast.</div><div style={{position: 'absolute', left: 80, right: 80, top: 430, height: 680}}><div style={{position: 'absolute', left: 40, top: 40, color: C.muted, fontFamily: mono, fontSize: 25}}>HIGH PRICE</div><div style={{position: 'absolute', right: 40, bottom: 35, color: C.cyan, fontFamily: mono, fontSize: 25}}>LOW PRICE</div><svg width="920" height="680" viewBox="0 0 920 680"><path d="M90 110 C280 120 300 260 440 295 C590 333 610 510 835 560" fill="none" stroke="#31d7ff" strokeWidth="18" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - down} /><circle cx={835} cy={560} r={22} fill="#ffbd54" opacity={down} /></svg></div><div style={{position: 'absolute', left: 70, right: 70, bottom: 210, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}><div style={{...panel, padding: 25, color: C.white, fontSize: 26}}>More data</div><div style={{...panel, padding: 25, color: C.white, fontSize: 26}}>Simpler plans</div><div style={{...panel, padding: 25, color: C.white, fontSize: 26}}>Lower recharge</div><div style={{...panel, padding: 25, color: C.white, fontSize: 26}}>Customer churn</div></div></AbsoluteFill>;
};

const MergerDate: React.FC = () => {
  const frame = useCurrentFrame();
  const p = pop(frame);
  return <AbsoluteFill style={{background: '#07121e', alignItems: 'center', justifyContent: 'center'}}><Kicker>Telecom consolidation</Kicker><div style={{fontSize: 172, color: C.white, lineHeight: 0.9, fontWeight: 950, marginTop: 42, transform: `scale(${p})`}}>31</div><div style={{fontFamily: mono, color: C.amber, fontSize: 58, fontWeight: 900, marginTop: 18}}>AUG 2018</div><div style={{width: 650, height: 2, background: '#315068', marginTop: 48}} /><div style={{color: C.muted, fontSize: 31, marginTop: 34}}>Vodafone India + Idea Cellular</div></AbsoluteFill>;
};

const MergerDocument: React.FC = () => {
  const frame = useCurrentFrame();
  const paperIn = pop(frame);
  const zoom = interpolate(frame, [0, f(6.5)], [1.02, 1.13]);
  return <AbsoluteFill style={{background: '#05101a', padding: '76px 52px'}}><div style={{...enter(frame), textAlign: 'center'}}><Kicker>Primary document • 31 Aug 2018</Kicker><div style={{color: C.white, fontSize: 48, fontWeight: 950, marginTop: 16}}>The merger becomes operational</div></div><div style={{position: 'absolute', left: 60, right: 60, top: 270, height: 1300, background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 90px rgba(0,0,0,0.55)', transform: `translateY(${interpolate(paperIn, [0, 1], [70, 0])}px) rotate(${interpolate(paperIn, [0, 1], [3.8, -0.7])}deg) scale(${interpolate(paperIn, [0, 1], [0.9, 1])})`}}><Img src={staticFile('assets/vi-merger-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transform: `scale(${zoom})`, transformOrigin: 'top center'}} /><div style={{position: 'absolute', left: 52, right: 52, top: 180, height: 230, border: `7px solid ${C.amber}`, borderRadius: 14, boxShadow: '0 0 0 999px rgba(0,0,0,0.03)'}} /><div style={{position: 'absolute', width: 190, height: 38, top: -8, left: 355, background: 'rgba(224,205,159,0.78)', transform: 'rotate(-2deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.16)'}} /></div><div style={{position: 'absolute', left: 82, right: 82, bottom: 90, ...panel, padding: '24px 28px', color: C.white, fontSize: 25, lineHeight: 1.35}}>Not caused by Jio alone — but the era’s biggest telecom consolidation.</div></AbsoluteFill>;
};

const PsychologyIntro: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{padding: '92px 60px'}}><div style={{...enter(frame), width: 420}}><Kicker>Human psychology</Kicker><div style={{fontSize: 62, color: C.white, lineHeight: 1.04, fontWeight: 950, marginTop: 20}}>Free cheez ko hum ginte nahi.</div></div></AbsoluteFill>;
};

const FreePsychology: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, f(2.7)], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#050c13'}}><Img src={staticFile('assets/ai-daily-habit.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.03 + p * 0.05})`}} /><AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,7,12,0.18), rgba(1,7,12,0.85) 82%)'}} /><div style={{position: 'absolute', left: 60, top: 100, ...enter(frame)}}><Kicker>Zero-price effect</Kicker><div style={{fontSize: 112, color: C.white, fontWeight: 950, marginTop: 18}}>FREE</div></div><div style={{position: 'absolute', left: 62, right: 62, bottom: 170, ...panel, padding: 28}}><div style={{display: 'flex', justifyContent: 'space-between', color: C.white, fontSize: 27, fontWeight: 850}}><span>Usage meter</span><span style={{fontFamily: mono, color: C.cyan}}>ignored</span></div><div style={{height: 16, borderRadius: 20, background: '#203345', marginTop: 24, overflow: 'hidden'}}><div style={{height: '100%', width: `${15 + p * 85}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan}, ${C.amber})`}} /></div></div></AbsoluteFill>;
};

const HabitIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const Icon = ({symbol, label, color, delay}: {symbol: string; label: string; color: string; delay: number}) => {
    const p = pop(frame, delay);
    return <div style={{...panel, height: 310, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: p, transform: `scale(${p})`}}><div style={{width: 110, height: 110, borderRadius: 30, background: `${color}22`, border: `2px solid ${color}`, display: 'grid', placeItems: 'center', color, fontSize: 55}}>{symbol}</div><div style={{fontSize: 34, color: C.white, fontWeight: 900}}>{label}</div></div>;
  };
  return <AbsoluteFill style={{background: 'linear-gradient(150deg, #07111e, #0b2033)', padding: '115px 60px'}}><Kicker>Daily defaults</Kicker><div style={{fontSize: 56, color: C.white, fontWeight: 950, marginTop: 20}}>Data became routine.</div><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 150}}><Icon symbol="◉" label="Video calls" color={C.cyan} delay={0} /><Icon symbol="▶" label="OTT" color={C.coral} delay={7} /><Icon symbol="⌖" label="Maps" color={C.amber} delay={14} /><Icon symbol="↗" label="Sharing" color={C.lime} delay={21} /></div></AbsoluteFill>;
};

const TraiProof: React.FC = () => {
  const frame = useCurrentFrame();
  const paperIn = pop(frame);
  const zoom = interpolate(frame, [0, f(3)], [1.15, 1.38]);
  return <AbsoluteFill style={{background: '#06101a', padding: '86px 54px'}}><Kicker>Attached TRAI report</Kicker><div style={{color: C.white, fontSize: 46, fontWeight: 950, marginTop: 16}}>The cost curve collapsed.</div><div style={{position: 'absolute', left: 58, right: 58, top: 270, bottom: 120, background: '#f4f0e8', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 90px rgba(0,0,0,0.5)', transform: `translateY(${interpolate(paperIn, [0, 1], [82, 0])}px) rotate(${interpolate(paperIn, [0, 1], [-5, 0.8])}deg) scale(${interpolate(paperIn, [0, 1], [0.88, 1])})`}}><Img src={staticFile('assets/trai-cost-page.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom', transform: `scale(${zoom})`, transformOrigin: 'bottom center'}} /><div style={{position: 'absolute', left: 90, right: 80, bottom: 180, height: 560, border: `7px solid ${C.amber}`, borderRadius: 14}} /><div style={{position: 'absolute', width: 180, height: 38, top: -8, left: 360, background: 'rgba(224,205,159,0.78)', transform: 'rotate(2deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.16)'}} /></div></AbsoluteFill>;
};

const CostChart: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, f(4.7)], [0, 1], {extrapolateRight: 'clamp'});
  const current = interpolate(p, [0, 1], [268.97, 11.78]);
  return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #163349, #06101a 66%)', padding: '102px 58px'}}><Kicker color={C.amber}>TRAI verified series</Kicker><div style={{color: C.white, fontSize: 52, fontWeight: 950, lineHeight: 1.08, marginTop: 18}}>Average wireless data cost per GB</div><div style={{position: 'absolute', left: 72, right: 72, top: 490, display: 'grid', gridTemplateColumns: '1fr 130px 1fr', alignItems: 'center'}}><div style={{...panel, padding: '38px 28px', textAlign: 'center', borderTop: `7px solid ${C.coral}`}}><div style={{fontFamily: mono, color: C.muted, fontSize: 26}}>2014</div><div style={{color: C.white, fontSize: 70, fontWeight: 950, marginTop: 18}}>₹268.97</div></div><div style={{textAlign: 'center', color: C.cyan, fontSize: 66, fontWeight: 950}}>→</div><div style={{...panel, padding: '38px 22px', textAlign: 'center', borderTop: `7px solid ${C.cyan}`}}><div style={{fontFamily: mono, color: C.muted, fontSize: 26}}>2018</div><div style={{color: C.white, fontSize: 70, fontWeight: 950, marginTop: 18}}>₹{current.toFixed(2)}</div></div></div><div style={{position: 'absolute', left: 70, right: 70, top: 910}}><svg width="940" height="360" viewBox="0 0 940 360"><path d="M35 55 C220 68 300 110 430 155 C590 210 705 278 905 316" fill="none" stroke="#31d7ff" strokeWidth="20" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} /><circle cx="35" cy="55" r="22" fill="#ff655e" /><circle cx="905" cy="316" r="22" fill="#31d7ff" opacity={p} /></svg></div><div style={{position: 'absolute', left: 64, right: 64, bottom: 180, ...panel, padding: '24px 28px', color: C.white, fontSize: 25, lineHeight: 1.38}}><b style={{color: C.amber}}>On-screen source note:</b> the attached TRAI report’s comparable series runs through 2018.</div><Source>TRAI, Wireless Data Services in India (2019), Chart 3.5</Source></AbsoluteFill>;
};

const RealWin: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{padding: '92px 60px'}}><div style={{...enter(frame), width: 430}}><Kicker>Jio’s real win</Kicker><div style={{fontSize: 59, color: C.white, fontWeight: 950, lineHeight: 1.04, marginTop: 20}}>Internet sasta hua. Soch usse bhi zyada badli.</div></div></AbsoluteFill>;
};

const Utility: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, f(2.4)], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#06101a', alignItems: 'center', justifyContent: 'center'}}><svg width="930" height="1000" viewBox="0 0 930 1000"><g stroke="#31d7ff" strokeWidth="5" opacity="0.75"><line x1="465" y1="490" x2="190" y2="220" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} /><line x1="465" y1="490" x2="730" y2="220" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} /><line x1="465" y1="490" x2="170" y2="760" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} /><line x1="465" y1="490" x2="760" y2="760" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} /></g><g fill="#071522" stroke="#31d7ff" strokeWidth="7"><circle cx="465" cy="490" r="130" /><circle cx="190" cy="220" r="80" /><circle cx="730" cy="220" r="80" /><circle cx="170" cy="760" r="80" /><circle cx="760" cy="760" r="80" /></g><g fill="#f7fbff" fontFamily={font} fontWeight="900" textAnchor="middle"><text x="465" y="510" fontSize="58">DATA</text><text x="190" y="235" fontSize="38">CALL</text><text x="730" y="235" fontSize="38">MAP</text><text x="170" y="775" fontSize="38">OTT</text><text x="760" y="775" fontSize="38">PAY</text></g></svg><div style={{position: 'absolute', bottom: 155, color: C.white, textAlign: 'center', fontSize: 42, fontWeight: 900}}>Show-off nahi. Utility.</div></AbsoluteFill>;
};

const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill><div style={{position: 'absolute', left: 56, right: 56, top: 105, ...enter(frame), textAlign: 'center'}}><Kicker>India’s new default</Kicker><div style={{fontSize: 72, color: C.white, fontWeight: 950, lineHeight: 1, marginTop: 20}}>DATA = DEFAULT UTILITY</div></div><div style={{position: 'absolute', left: 130, right: 130, bottom: 90, height: 7, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`}} /></AbsoluteFill>;
};

export const JioVideo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.navy, fontFamily: font, overflow: 'hidden'}}>
    <StudioBackdrop />
    <NarrationTimeline />
    <Sequence name="S1 • 2GB today" from={0} durationInFrames={36}><OpeningData /></Sequence>
    <Sequence name="S1 • Daily drain" from={36} durationInFrames={81}><DataDrain /></Sequence>
    <Sequence name="S1 • Rewind to 2014" from={117} durationInFrames={69}><Rewind /></Sequence>
    <Sequence name="S1 • ₹269 per GB" from={186} durationInFrames={81}><Price2014 /></Sequence>
    <Sequence name="S2 • Jio launch date" from={267} durationInFrames={66}><JioDate /></Sequence>
    <Sequence name="S2 • Muted launch archive" from={333} durationInFrames={114}><ArchivalOffer /></Sequence>
    <Sequence name="S2 • Welcome Offer" from={447} durationInFrames={73}><FreeCards /></Sequence>
    <Sequence name="S3 • Bigger shift" from={520} durationInFrames={86}><NotOnlyCheap /></Sequence>
    <Sequence name="S3 • Three fears" from={606} durationInFrames={183}><FearCards /></Sequence>
    <Sequence name="S4 • Annual report" from={789} durationInFrames={105}><AnnualReport /></Sequence>
    <Sequence name="S4 • 100 million" from={894} durationInFrames={200}><HundredMillion /></Sequence>
    <Sequence name="S5 • India changed" from={1094} durationInFrames={67}><IndiaChanged /></Sequence>
    <Sequence name="S5 • Usage evidence" from={1161} durationInFrames={235}><UsageChart /></Sequence>
    <Sequence name="S6 • Competitors" from={1396} durationInFrames={83}><Competitors /></Sequence>
    <Sequence name="S6 • Price war" from={1479} durationInFrames={121}><PriceWar /></Sequence>
    <Sequence name="S7 • Merger date" from={1600} durationInFrames={74}><MergerDate /></Sequence>
    <Sequence name="S7 • Merger document" from={1674} durationInFrames={205}><MergerDocument /></Sequence>
    <Sequence name="S8 • Psychology" from={1879} durationInFrames={89}><PsychologyIntro /></Sequence>
    <Sequence name="S8 • Zero-price effect" from={1968} durationInFrames={99}><FreePsychology /></Sequence>
    <Sequence name="S8 • Daily habits" from={2067} durationInFrames={110}><HabitIcons /></Sequence>
    <Sequence name="S9 • TRAI paper" from={2177} durationInFrames={88}><TraiProof /></Sequence>
    <Sequence name="S9 • Verified data" from={2265} durationInFrames={157}><CostChart /></Sequence>
    <Sequence name="S10 • Real win" from={2422} durationInFrames={98}><RealWin /></Sequence>
    <Sequence name="S10 • Utility" from={2520} durationInFrames={93}><Utility /></Sequence>
    <Sequence name="S10 • Finale" from={2613} durationInFrames={86}><Finale /></Sequence>
  </AbsoluteFill>
);
