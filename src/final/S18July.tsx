import React, { useMemo } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FONTS, H, W } from '../lib/constants';
import { ease, popScale, ramp } from '../lib/easing';
import { MapStage, useMap, type CamKey } from '../lib/map/MapStage';
import { ColonyFill, FlagFill } from '../lib/map/layers';
import { COLONY_IDS, colonies } from '../lib/map/data';
import { centroidLonLat, featurePath } from '../lib/map/geo';
import { reliefRaster } from '../lib/map/rasters';
import { Grade, Sfx } from '../lib/fx/particles';
import { PopIn } from '../lib/fx/motion';
import { Highlighter, MapTitle, TimelineRuler } from '../lib/fx/text';
import { ZoomBlurIn } from '../lib/fx/transitions';
import { Puppet } from '../lib/character/Puppet';
import { RIGS } from '../lib/character/rigs';
import { scene } from '../vo/cues';
import { Bubble, Plate } from './kit';

/**
 * S18 — 2 JULY VOTE, 4 JULY DECLARATION (24998 → 26572, 26.2 s). Frames LOCAL.
 *  "दो July"                       timeline ruler Jul 1 · Jul 2 · Jul 3
 *  "बारह colonies ने हाँ"           a raised-fist ballot pops on twelve colonies (New York abstained)
 *  "John Adams ने अपनी पत्नी"       Adams writing to Abigail (lawyer's office plate)
 *  "दो July को जश्न"                speech bubble: "2 July!"
 *  "दो दिन से चूक गए"               the ruler slides on to Jul 4; Adams shrugs (gag)
 *  "Declaration of Independence"   the Grand Union cloth spreads over the colonies again; the Declaration drops in
 *  "तैंतीस साल के Thomas Jefferson"  Jefferson peeks out from behind it
 *  "All men are created equal"     zoom into the text; the phrase is highlighted
 */

const DECL_TEXT = 'When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another…';

/** The Declaration, typeset from the 1776 text (public domain). */
const Declaration: React.FC<{ w: number }> = ({ w }) => (
  <div style={{ width: w, height: w * 1.25, background: 'radial-gradient(ellipse at 50% 45%, #F1E2BE 0%, #E0CB9C 78%, #C7AB76 100%)', padding: w * 0.07, boxSizing: 'border-box',
    boxShadow: '0 40px 80px rgba(0,0,0,0.55)', fontFamily: FONTS.serif, color: '#2A1A0E', textAlign: 'center' }}>
    <div style={{ fontSize: w * 0.05, fontWeight: 700 }}>IN CONGRESS, July 4, 1776.</div>
    <div style={{ fontSize: w * 0.035, fontStyle: 'italic', marginTop: w * 0.02 }}>The unanimous Declaration of the thirteen united States of America,</div>
    <div style={{ fontSize: w * 0.03, textAlign: 'justify', marginTop: w * 0.05, lineHeight: 1.4 }}>{DECL_TEXT}</div>
    <div style={{ fontSize: w * 0.03, textAlign: 'justify', marginTop: w * 0.03, lineHeight: 1.4 }}>
      We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.
    </div>
    <div style={{ marginTop: w * 0.08, fontSize: w * 0.06, fontStyle: 'italic', fontWeight: 600 }}>John Hancock</div>
  </div>
);

const Ballots: React.FC<{ start: number }> = ({ start }) => {
  const { toScreen } = useMap();
  return (
    <>
      {COLONY_IDS.filter((k) => k !== 'new-york').map((k, i) => {
        const [lon, lat] = centroidLonLat(colonies.features.find((f) => f.properties?.id === k)!);
        const [x, y] = toScreen(lon, lat);
        const s = ['rhode-island', 'delaware', 'connecticut', 'new-jersey'].includes(k) ? 300 : 420;
        return (
          <PopIn key={k} start={start + i * 5} x={x} y={y} w={s} h={s}>
            <Img src={staticFile('assets/props/ballot_raised_fist.png')} style={{ width: s, height: s, objectFit: 'contain' }} />
          </PopIn>
        );
      })}
    </>
  );
};

const AbstainNY: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { toScreen } = useMap();
  if (frame < start) return null;
  const [x, y] = toScreen(-75.5, 42.9);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${popScale(frame, start)})`, background: '#fff', borderRadius: 40, padding: '14px 36px',
      fontFamily: FONTS.label, fontWeight: 700, fontSize: 60, color: '#555', whiteSpace: 'nowrap' }}>New York: abstained</div>
  );
};

export const S18July: React.FC = () => {
  const frame = useCurrentFrame();
  const c = scene('S18_july');
  const jul2At = c.at('दो July');
  const voteAt = c.at('बारह colonies ने हाँ');
  const adamsAt = c.at('John Adams ने अपनी पत्नी');
  const partyAt = c.at('दो July को जश्न');
  const missAt = c.at('दो दिन से चूक गए');
  const declAt = c.at('Declaration of Independence');
  const tjAt = c.at('तैंतीस साल के Thomas Jefferson');
  const equalAt = c.at('All men are created equal');
  const len = c.duration;
  const allCol = useMemo(() => featurePath({ type: 'FeatureCollection', features: colonies.features } as never), []);

  const camera: CamKey[] = [
    { frame: 0, lon: -75.5, lat: 39, span: 24 },
    { frame: adamsAt, lon: -75.2, lat: 39.4, span: 20 },
  ];
  const cam2: CamKey[] = [
    { frame: 0, lon: -76, lat: 38.6, span: 30 },
    { frame: equalAt - declAt, lon: -75.5, lat: 38.8, span: 26 },
  ];

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* 1 · the vote */}
      <Sequence durationInFrames={adamsAt + 4} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={camera} above={[reliefRaster('eastcoast', 0.5)]}
            world={<ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />}
            overlay={<><Ballots start={voteAt + 6} /><AbstainNY start={voteAt + 70} /></>} />
        </Grade>
      </Sequence>

      {/* 2 · Adams writes home */}
      <Sequence from={adamsAt} durationInFrames={declAt - adamsAt} layout="none">
        <Grade look="relief">
          <Plate bg="bg_lawyer_office_1765.png" blur={5} camera={[{ frame: 0, x: 0, y: 0, zoom: 1.03 }, { frame: declAt - adamsAt, x: -40, y: 0, zoom: 1.12 }]}>
            <Puppet rig={RIGS.johnAdams} x={W * 0.34} y={H * 1.03} height={1550} seed="ja2" look={1}
              moods={[[0, 'smile'], [partyAt - adamsAt, 'grin'], [missAt - adamsAt, 'worried'], [missAt - adamsAt + 50, 'sad']]}
              talk={[[partyAt - adamsAt, partyAt - adamsAt + 70]]} />
            <PopIn start={10} x={W * 0.62} y={H * 0.72} w={700} h={700}>
              <Img src={staticFile('assets/props/quill_inkwell.png')} style={{ width: 700, height: 700 }} />
            </PopIn>
          </Plate>
        </Grade>
        <MapTitle x={W * 0.66} y={H * 0.34} text="To Abigail Adams" date="3 July 1776" start={14} exit={partyAt - adamsAt} size={110} mode="type" />
        <Bubble x={W * 0.58} y={H * 0.3} text="2 July!" start={partyAt - adamsAt} exit={missAt - adamsAt + 20} size={150} />
      </Sequence>

      {/* the ruler: Jul 1–3, then slides on to Jul 4 */}
      <TimelineRuler x={W / 2} y={H * 0.06} start={jul2At}
        steps={[{ at: jul2At, labels: ['Jul 1', 'Jul 2', 'Jul 3'] }, { at: missAt, labels: ['Jul 2', 'Jul 3', 'Jul 4'] }, { at: missAt + 22, labels: ['Jul 3', 'Jul 4', 'Jul 5'] }]}
        header="1776" exit={declAt - 6} />

      {/* 3 · the Declaration */}
      <Sequence from={declAt} durationInFrames={equalAt - declAt + 4} layout="none">
        <Grade look="parchment">
          <MapStage style="parchment" camera={cam2} above={[reliefRaster('eastcoast', 0.5)]}
            world={
              <>
                <ColonyFill start={-999} per={0} color="#4579AD" flash="#4579AD" opacity={0.92} />
                <FlagFill d={allCol} href={staticFile('assets/flags/grand_union_1775.png')} seed={[-75.2, 40]} start={4} duration={40} bbox={[[-85, 31], [-66, 47.5]]} />
              </>
            }
          />
        </Grade>
        <DeclDrop start={30} />
        {frame >= tjAt && (
          <Puppet rig={RIGS.jefferson} x={W * 0.3} y={H * 1.04} height={1500} start={tjAt - declAt} seed="tj" look={1}
            moods={[[0, 'smile'], [tjAt - declAt + 40, 'grin']]} />
        )}
        <MapTitle x={W * 0.3} y={H * 0.12} text="Thomas Jefferson" date="33 years old" start={tjAt - declAt + 10} size={120} />
        <MapTitle x={W * 0.66} y={H * 0.9} text="Declaration of Independence" date="4 July 1776" start={50} size={100} />
      </Sequence>
      <Sequence from={equalAt} layout="none">
        <ZoomBlurIn dur={8}>
          <AbsoluteFill style={{ background: '#E6D3A6' }}>
            <div style={{ position: 'absolute', left: W / 2, top: H / 2, transform: `translate(-50%, -50%) scale(${1.05 + 0.04 * ramp(frame - equalAt, 0, len - equalAt, ease.linear)})`, width: W * 0.86,
              fontFamily: FONTS.serif, fontSize: 112, lineHeight: 1.5, color: '#2A1A0E', textAlign: 'center' }}>
              We hold these truths to be self-evident, that{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <Highlighter x={-8} y={22} w={1360} h={128} start={12} chars={25} />
                <span style={{ position: 'relative', fontWeight: 700 }}>all men are created equal</span>
              </span>
              , that they are endowed by their Creator with certain unalienable Rights…
            </div>
          </AbsoluteFill>
        </ZoomBlurIn>
      </Sequence>

      <Sfx at={jul2At} file="whoosh_soft.wav" volume={0.35} />
      {Array.from({ length: 12 }).map((_, i) => <Sfx key={i} at={voteAt + 6 + i * 5} file="pop_high.wav" volume={0.22} />)}
      <Sfx at={voteAt + 70} file="pluck_down.wav" volume={0.3} />
      <Sfx at={adamsAt} file="whoosh_fast.wav" volume={0.4} />
      <Sfx at={adamsAt + 14} file="pen_draw.wav" volume={0.45} />
      <Sfx at={partyAt} file="firework.wav" volume={0.3} />
      <Sfx at={missAt} file="rewind_tape.wav" volume={0.3} />
      <Sfx at={missAt + 50} file="pluck_down.wav" volume={0.4} />
      <Sfx at={declAt} file="sting_crown.wav" volume={0.45} />
      <Sfx at={declAt + 30} file="paper_swish.wav" volume={0.5} />
      <Sfx at={tjAt} file="pop.wav" volume={0.4} />
      <Sfx at={equalAt} file="whoosh_big.wav" volume={0.35} />
      <Sfx at={equalAt + 12} file="pen_draw.wav" volume={0.4} />
    </AbsoluteFill>
  );
};

const DeclDrop: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = ramp(frame, start, 14, ease.in);
  const land = frame - start - 14;
  const squash = land >= 0 ? 1 - 0.1 * Math.exp(-land / 3) * Math.cos(land / 1.5) : 1;
  return (
    <div style={{ position: 'absolute', left: W * 0.64, top: H * 0.48 - (1 - t) * H, transform: `translate(-50%, -50%) rotate(${-3 + (1 - t) * 10}deg) scale(${2 - squash}, ${squash})` }}>
      <Declaration w={1150} />
    </div>
  );
};
