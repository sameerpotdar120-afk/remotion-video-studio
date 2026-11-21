import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import * as THREE from 'three';
import { clamp01, easeOut, inOut, lerp, linear, ramp, window4 } from '../../darien/anim';
import { camOf, CamK } from './cam';
import { Kind, Side } from './flags';
import { PXZ, V3, groundXZ } from './geo';
import { Breather, BigNum, Captions, Chapter, Clock, DateCard, Measure, NameCard, Portrait, Radio, Stamp, Stat, flagURL } from './overlay';
import { Arrow, Blast, Bracket, City, Label, Prop, Unit, UnitT, blastLight, shake } from './things';
import { Jet3D, Models, Pt, Ship3D, Squad, Tank, Tracers } from './models';
import timing from './timing.json';
import world from '../../../public/sixday/map/world_inset.json';
import { CamS, Ground, World, project } from './World';
import { CARDF, ENF, NUMF, UI } from './font';
import { Grade } from './post';

export const T = timing as unknown as {
  duration: number; vo_len: number; shifts: [number, number][]; cues: Record<string, number>;
  shorts: { name: string; t0: number; t1: number }[]; caps: [number, string, number][];
};
const C = new Proxy(T.cues, { get: (o, k: string) => { if (!(k in o)) throw new Error(`no cue ${k}`); return o[k]; } });
export const DURATION_S = T.duration;
export const IMGS = ['s_tanker', 's_cargo_ship', 's_yellow_freighter', 'j_delta_jet_top', 'j_delta_jet_side', 'j_swept_jet_parked', 'a_airfield_tile',
  'a_runway_crater_tile', 'p_port_eilat', 'p_coastal_post', 't_tank_desert', 't_tank_column', 't_halftrack', 'b_bunker_ridge', 'u_blue_helmet',
  'u_un_jeep', 'w_old_city_wall'];

// ------------------------------------------------------------------ palette and the map's state
type RGB = [number, number, number];
const EG: RGB = [0.42, 0.47, 0.27], IL: RGB = [0.21, 0.37, 0.44], JO: RGB = [0.69, 0.45, 0.27], SY: RGB = [0.6, 0.33, 0.34];
const LB: RGB = [0.68, 0.61, 0.33], SA: RGB = [0.52, 0.39, 0.27], OT: RGB = [0.47, 0.44, 0.39], CAP: RGB = [0.27, 0.45, 0.52], GZ: RGB = [0.55, 0.52, 0.4];
const mix3 = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** How far each captured region has gone over (0..1) at time t, on the long video's clock. */
const captured = (t: number) => {
  let gaza = ramp(t, C.uttar - 0.3, C.arish + 1.2), sinai = 0.33 * ramp(t, C.teendiv, C.dakshin + 1) + 0.33 * ramp(t, C.june6, C.phansi) + 0.34 * ramp(t, C.june8 - 0.5, C.suez + 1);
  let wb = ramp(t, C.nadi, C.hebron + 1), golan = ramp(t, C.june10 - 0.2, C.june10 + 1.4);
  let sinaiBack = 0, gazaBack = 0;
  // Short 5 tells it again: the payoff map, then "before", then each piece, then 1982 and 2005
  if (t >= C.s5 - 0.2 && t < C.bridge5) {
    const before = ramp(t, C.subah5 - 0.3, C.subah5 + 0.5) * (1 - ramp(t, C.shaam, C.shaam + 0.4));
    gaza = sinai = Math.max(1 - before, ramp(t, C.sinaigaza, C.sinaigaza + 0.9));
    wb = Math.max(1 - before, ramp(t, C.wbj, C.wbj + 0.9)); golan = Math.max(1 - before, ramp(t, C.golan5, C.golan5 + 0.9));
    sinaiBack = ramp(t, C.sinaiback - 0.6, C.sinaiback + 0.6); gazaBack = ramp(t, C.gazaout - 0.5, C.gazaout + 0.6);
  }
  if (t >= C.ch8) sinaiBack = ramp(t, C.n1982b, C.n1982b + 1.2);
  if (t >= C.close) { sinaiBack = 1; gazaBack = 1; }
  return { gaza, sinai, wb, golan, sinaiBack, gazaBack };
};

const groundAt = (t: number): Ground => {
  const k = captured(t);
  const col: RGB[] = [EG, EG, EG, EG, IL, JO, SY, JO, SY, LB, SA, OT];
  const hatch = new Array(12).fill(0), glow = new Array(12).fill(0);
  col[2] = mix3(mix3(EG, CAP, k.sinai), EG, k.sinaiBack); hatch[2] = k.sinai * (1 - k.sinaiBack);
  col[3] = mix3(mix3(EG, CAP, k.gaza), GZ, k.gazaBack); hatch[3] = k.gaza * (1 - k.gazaBack);
  col[5] = mix3(JO, CAP, k.wb); hatch[5] = k.wb;
  col[6] = mix3(SY, CAP, k.golan); hatch[6] = k.golan;
  const pulse = 0.75 + 0.25 * Math.sin(t * 4);
  const g3 = (a: number, b: number, c: number, d: number) => window4(t, a, b, c, d) * pulse;
  // the hook and the close: Gaza, Golan, West Bank glow (frame 0 = the last frames)
  const three = Math.max(t < C.israel0 ? 1 - ramp(t, C.june67, C.israel0) : 0, ramp(t, C.gaza9 - 0.4, C.gaza9 + 0.4));
  glow[3] = Math.max(three, g3(C.s3 - 0.2, C.s3, C.unef3, C.unef3 + 0.5), g3(C.bridge3, C.bharatki, C.s3 - 0.2, C.s3)) * pulse;
  glow[5] = Math.max(three, g3(C.wb1 - 0.2, C.wb1, C.syria1, C.syria1 + 0.4), g3(C.wbj, C.wbj + 0.3, C.golan5, C.golan5 + 0.3), g3(C.khula - 0.2, C.khula, C.bridge5, C.bridge5 + 0.4)) * pulse;
  glow[6] = Math.max(three, g3(C.golan1 - 0.2, C.golan1, C.n1948, C.n1948 + 0.4), g3(C.s4 - 0.2, C.s4, C.upar, C.upar + 0.4), g3(C.aajbhi, C.aajbhi + 0.3, C.unchai, C.unchai + 0.4),
    g3(C.khula - 0.2, C.khula, C.bridge5, C.bridge5 + 0.4)) * pulse;
  glow[4] = Math.max(g3(C.israel0, C.israel0 + 0.2, C.egypt0, C.egypt0 + 0.3), g3(C.patli1 - 0.2, C.patli1, C.tank1 + 1.5, C.egypt1)) * pulse;
  glow[1] = glow[2] = Math.max(g3(C.egypt0, C.egypt0 + 0.2, C.jordan0, C.jordan0 + 0.3), g3(C.egypt1, C.egypt1 + 0.2, C.jordan1, C.jordan1 + 0.3)) * pulse;
  glow[2] = Math.max(glow[2], g3(C.sinai3, C.sinai3 + 0.2, C.saudi, C.saudi + 0.3) * pulse, g3(C.teenguna, C.teenguna + 0.2, C.ch6 - 0.5, C.ch6) * pulse);
  glow[7] = Math.max(g3(C.jordan0, C.jordan0 + 0.2, C.syria0, C.syria0 + 0.3), g3(C.jordan1, C.jordan1 + 0.2, C.syria1, C.syria1 + 0.3)) * pulse;
  glow[8] = Math.max(g3(C.syria0, C.syria0 + 0.2, C.faisla0, C.faisla0 + 0.3), g3(C.syria1, C.syria1 + 0.2, C.n1948, C.n1948 + 0.3)) * pulse;
  glow[10] = g3(C.saudi, C.saudi + 0.2, C.eilat, C.eilat + 0.3) * pulse;
  // night (4 June) and the remembrance (Gaza): darken round a focus
  const night = window4(t, C.raat - 0.2, C.raat + 0.6, C.bridge2 + 1.5, C.s2 - 0.3) * 0.55;
  const mourn = window4(t, C.kisi - 0.3, C.kisi + 1.2, C.ch5 - 0.8, C.ch5) * 0.5;
  const dim = Math.max(night, mourn);
  return { col, hatch, glow, post: 0, fine: 0.6, river: 1, dim, focus: mourn > night ? PXZ('gaza') : PXZ('tel_aviv'), focusR: mourn > night ? 30 : 2000, t };
};

// ------------------------------------------------------------------ the camera
type Key = [number, number, number, number, number, number]; // t, lon, lat, d, pitch, head
const K = (t: number, lon: number, lat: number, d: number, pitch: number, head = 0): Key => [t, lon, lat, d, pitch, head];
const KEYS: Key[] = [
  // hook: frame 0 = over Israel with Gaza, Golan and the West Bank lit; pull out to the region
  K(0, 35.0, 31.95, 470, 50, 4), K(C.june67, 35.05, 31.9, 400, 50, 3), K(C.israel0 + 0.2, 34.9, 31.4, 620, 53, 0), K(C.faisla0, 34.5, 31.0, 900, 56, 0),
  K(C.teen0 + 0.6, 33.0, 30.6, 520, 50, -6), K(C.aaj0 + 0.4, 34.3, 30.8, 1050, 57, 0), K(C.ch1 - 0.6, 34.4, 30.9, 980, 57, 0),
  // ch 1: the map
  K(C.patli1, 35.0, 31.6, 420, 52, 0), K(C.patli2 + 0.2, 34.95, 32.25, 190, 47, -4), K(C.tank1 + 2.0, 34.95, 32.3, 165, 46, -6),
  K(C.egypt1 + 0.6, 32.6, 30.2, 820, 54, -4), K(C.fauj1 + 1.6, 32.9, 30.4, 700, 52, -2), K(C.jordan1 + 0.5, 35.8, 31.6, 520, 52, 6),
  K(C.jeru1 + 1.0, 35.35, 31.8, 320, 50, 4), K(C.syria1 + 0.6, 36.0, 33.0, 480, 52, 8), K(C.golan1 + 1.0, 35.85, 33.05, 300, 48, 10),
  K(C.n1948 + 0.6, 35.0, 31.8, 600, 54, 0), K(C.golabari1 + 1.0, 34.9, 31.5, 520, 52, 0), K(C.teeno1 + 1.2, 34.4, 31.0, 900, 56, 0), K(C.ch2 - 0.6, 34.2, 30.9, 980, 57, 0),
  // ch 2: May 1967
  K(C.report1, 33.2, 31.4, 900, 55, 0), K(C.syriab + 0.5, 35.8, 33.0, 480, 52, 6), K(C.galat + 1.2, 35.5, 32.6, 560, 53, 4),
  K(C.may14 + 0.4, 33.0, 30.4, 620, 52, -4), K(C.cairo + 0.5, 31.4, 30.1, 230, 46, -6), K(C.parade + 3.5, 31.35, 30.08, 200, 45, -8),
  K(C.unef1 + 0.6, 34.4, 30.9, 380, 50, 0), K(C.bharat1 + 1.0, 34.35, 31.15, 250, 47, -2), K(C.hatana1 + 1.5, 34.5, 30.7, 420, 50, 0),
  K(C.redsea1 + 0.6, 34.2, 28.4, 360, 50, -8), K(C.sharm + 0.5, 34.35, 27.98, 140, 44, -12), K(C.s1 - 0.5, 34.42, 28.0, 110, 42, -14),
  // Short 1: Tiran
  K(C.s1, 34.47, 28.0, 95, 40, -15), K(C.gali1 + 2, 34.48, 27.99, 85, 39, -10), K(C.straits + 0.4, 34.45, 27.98, 70, 38, -6),
  K(C.saudi + 1.0, 34.55, 28.05, 120, 43, -4), K(C.eilat + 0.6, 34.92, 29.4, 150, 44, 10), K(C.rasta + 0.4, 34.75, 28.8, 380, 52, 12),
  K(C.tanker + 1.5, 34.6, 28.4, 260, 48, 8), K(C.n1957b + 0.4, 34.6, 28.6, 420, 52, 4), K(C.may22 + 0.3, 34.45, 28.0, 120, 44, -8),
  K(C.nahi_guzrenge + 0.6, 34.46, 27.99, 80, 40, -10), K(C.ulti + 0.5, 34.2, 29.8, 900, 56, 0), K(C.pact + 0.6, 34.6, 30.6, 820, 55, 0),
  K(C.june4 + 0.4, 34.9, 31.8, 360, 50, 2), K(C.june5a + 0.6, 34.2, 30.8, 1000, 57, 0), K(C.jal + 1.5, 34.3, 30.9, 1080, 58, 0),
  // ch 3: the wait
  K(C.ch3 + 1, 34.9, 31.9, 360, 50, 0), K(C.ruk + 1, 34.85, 32.0, 300, 49, 2), K(C.dayan + 0.4, 34.85, 32.05, 200, 46, 0),
  K(C.vaar + 0.8, 34.6, 31.4, 520, 53, -4), K(C.raat + 1.0, 33.9, 31.6, 600, 54, -10), K(C.bridge2 + 1.4, 33.0, 31.7, 420, 40, -60),
  // Short 2: 3 hours (frame 0: a burning Egyptian airfield with the jets over it)
  K(C.s2, 32.15, 30.53, 120, 42, -10), K(C.teen2 + 1.2, 32.1, 30.55, 160, 44, -8), K(C.t745 + 0.5, 32.0, 30.5, 300, 48, -4),
  K(C.zameen1 + 0.6, 31.8, 30.4, 420, 50, -4), K(C.tabhi + 0.3, 33.8, 31.75, 220, 28, -70), K(C.neeche + 1.0, 32.6, 31.55, 180, 22, -75),
  K(C.radar + 1.2, 32.0, 31.0, 320, 40, -40), K(C.runway + 0.4, 32.1, 30.5, 260, 48, -10), K(C.ekek + 0.6, 31.6, 30.35, 420, 52, -4),
  K(C.n200 + 1.2, 32.2, 30.5, 700, 55, 0), K(C.dopahar + 0.4, 32.2, 30.5, 680, 55, 0), K(C.jordsyr + 0.6, 36.1, 32.6, 620, 54, 6),
  K(C.focus + 0.6, 34.2, 31.0, 1000, 57, 0), K(C.chhatri + 0.4, 33.5, 30.5, 520, 52, -2), K(C.nateeja + 1.4, 33.4, 30.6, 560, 53, 0),
  // Short 3: Gaza (frame 0: blue helmets with India's flag)
  K(C.bridge3, 34.4, 31.4, 260, 48, 4), K(C.s3, 34.38, 31.42, 95, 42, 8), K(C.unef3 + 0.4, 34.4, 31.3, 180, 46, 4),
  K(C.battalions + 0.3, 34.5, 30.9, 360, 50, 0), K(C.rokna + 0.6, 34.45, 31.2, 230, 47, 2), K(C.hatana3 + 0.5, 34.38, 31.4, 140, 44, 6),
  K(C.ghar + 0.8, 34.1, 31.55, 220, 46, -6), K(C.chhid + 0.3, 34.42, 31.42, 120, 43, 6), K(C.n14b + 0.5, 34.4, 31.45, 105, 42, 8),
  K(C.sachar + 0.3, 34.42, 31.47, 90, 41, 8), K(C.topi + 2.5, 34.44, 31.48, 80, 40, 10),
  // ch 5: Sinai
  K(C.ch5 + 0.4, 33.6, 30.6, 650, 54, -2), K(C.uttar + 0.5, 33.9, 31.1, 330, 49, -6), K(C.beech + 0.5, 34.1, 30.8, 230, 47, -2),
  K(C.toda + 1.0, 34.1, 30.82, 160, 45, 0), K(C.dakshin + 0.6, 33.8, 30.1, 420, 51, -2), K(C.june6 + 0.5, 32.6, 30.2, 600, 53, -6),
  K(C.phansi + 0.4, 33.0, 30.1, 240, 46, -8), K(C.mitla + 2.2, 32.98, 30.05, 170, 44, -10), K(C.june8 + 0.5, 32.6, 30.4, 420, 51, -6),
  K(C.teenguna + 0.6, 34.0, 30.5, 950, 57, 0), K(C.chardin + 1.5, 34.0, 30.6, 920, 57, 0),
  // ch 6: Jerusalem and the West Bank
  K(C.ch6 + 0.4, 35.1, 31.9, 300, 49, 4), K(C.koonch + 0.5, 35.2, 31.85, 240, 47, 4), K(C.banta + 0.4, 35.24, 31.78, 55, 42, 0),
  K(C.deewar + 0.4, 35.235, 31.778, 30, 40, 2), K(C.sadak + 0.8, 35.24, 31.78, 45, 42, 4), K(C.para + 1.2, 35.25, 31.8, 70, 44, 6),
  K(C.nadi + 0.6, 35.4, 31.95, 260, 48, 6), K(C.hebron + 0.8, 35.25, 31.95, 330, 50, 4), K(C.bahas + 2, 35.24, 31.8, 160, 46, 4),
  K(C.uparsy + 0.6, 35.7, 32.8, 260, 46, 10),
  // Short 4: Golan (frame 0: the escarpment from the lake, bunkers on top)
  K(C.s4, 35.58, 32.95, 95, 26, 72), K(C.maalik + 0.6, 35.62, 32.92, 85, 24, 75), K(C.pathaar + 0.5, 35.75, 33.0, 160, 42, 20),
  K(C.sagar + 0.6, 35.6, 32.82, 90, 40, 10), K(C.gaon + 0.6, 35.6, 32.95, 75, 32, 60), K(C.dhara + 0.6, 35.65, 33.2, 80, 40, 20),
  K(C.june9 + 0.5, 35.65, 33.1, 100, 30, 65), K(C.bunker + 0.6, 35.72, 33.1, 75, 28, 70), K(C.june10 + 0.6, 35.75, 33.05, 160, 44, 15),
  K(C.aajbhi + 0.5, 35.8, 33.0, 210, 48, 10), K(C.unchai + 0.6, 35.62, 32.93, 90, 24, 75), K(C.keemti + 2.0, 35.62, 32.93, 85, 23, 76),
  // Short 5: six days' map (frame 0: the whole region with the captured land hatched)
  K(C.s5, 34.3, 30.8, 960, 57, 0), K(C.subah5 + 0.4, 34.9, 31.6, 420, 52, 0), K(C.km15b + 0.4, 34.95, 32.28, 190, 47, -4),
  K(C.shaam + 0.4, 34.3, 30.8, 980, 57, 0), K(C.keemat, 34.4, 30.9, 1000, 57, 0), K(C.hamesha + 0.4, 33.8, 30.4, 900, 56, 0),
  K(C.gazaout + 0.6, 34.6, 31.2, 700, 55, 0), K(C.khula + 0.6, 35.4, 32.4, 420, 52, 6),
  // Short 6: the Yellow Fleet (frame 0: the Great Bitter Lake full of yellowed ships)
  K(C.bridge5 + 0.6, 32.5, 30.5, 400, 50, -4), K(C.s6, 32.4, 30.33, 52, 40, 0), K(C.aathsaal + 1, 32.4, 30.34, 60, 41, 0),
  K(C.beechraaste + 0.4, 32.35, 30.6, 260, 50, 0), K(C.duba + 0.8, 32.4, 30.6, 330, 51, 0), K(C.gbl + 0.5, 32.4, 30.35, 70, 42, 0),
  K(C.kinara_eg + 0.6, 32.4, 30.35, 110, 46, 0), K(C.mahine + 0.6, 32.4, 30.33, 55, 40, 4), K(C.yellow + 0.5, 32.4, 30.32, 48, 38, 8),
  K(C.khuli + 0.4, 32.38, 30.45, 150, 45, 0), K(C.ghar6 + 1.0, 32.35, 30.6, 190, 47, 0),
  // ch 8: after the war
  K(C.ch8 + 0.4, 34.3, 30.8, 950, 57, 0), K(C.khartoum + 0.6, 32.0, 29.5, 1000, 57, 0), K(C.n1973 + 0.5, 33.6, 31.0, 700, 54, 0),
  K(C.n1979 + 0.6, 33.5, 30.4, 760, 55, 0), K(C.n1982b + 1.2, 33.8, 30.0, 820, 56, 0),
  // close: back to the hook's picture (frame 0)
  K(C.close + 0.6, 34.3, 30.8, 1050, 57, 0), K(C.teenghante + 1.0, 33.5, 30.6, 900, 56, -2), K(C.nayanaqsha + 1.0, 34.4, 30.9, 1000, 57, 0),
  K(C.agli, 34.9, 31.5, 640, 54, 2), K(C.gaza9 + 1.0, 35.0, 31.9, 480, 50, 4), K(DURATION_S, 35.0, 31.95, 470, 50, 4),
];
KEYS.sort((a, b) => a[0] - b[0]);

export const camKey = (t: number, portrait: boolean): CamK => {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const span = b[0] - a[0];
  // short hops ease in and out; long holds glide almost linearly (the map never stops)
  const raw = clamp01((t - a[0]) / Math.max(0.001, span));
  const e = span > 6 ? lerp(linear(raw), inOut(raw), 0.35) : inOut(raw);
  const lg = (x: number, y: number) => Math.exp(lerp(Math.log(x), Math.log(y), e));
  return { lon: lerp(a[1], b[1], e), lat: lerp(a[2], b[2], e), d: lg(a[3], b[3]) * (portrait ? 1.75 : 1), pitch: lerp(a[4], b[4], e) + (portrait ? 4 : 0), head: lerp(a[5], b[5], e), fov: 30 };
};

// ------------------------------------------------------------------ units
type Track = { side: Side; kind: Kind; from: number; to: number; path: [number, number, number][] }; // [t, lon, lat]
const tr = (side: Side, kind: Kind, from: number, to: number, ...path: [number, number, number][]): Track => ({ side, kind, from, to, path });
const st = (side: Side, kind: Kind, from: number, to: number, lon: number, lat: number) => tr(side, kind, from, to, [from, lon, lat]);
const END = 1e9;
const TRACKS: Track[] = [
  // ch 1: the three fronts fill up
  st('eg', 'arm', C.fauj1, C.ch2 - 0.3, 33.6, 30.9), st('eg', 'inf', C.fauj1 + 0.3, C.ch2 - 0.3, 32.6, 30.0), st('eg', 'air', C.fauj1 + 0.6, C.ch2 - 0.3, 31.6, 30.4),
  st('jo', 'inf', C.jordan1 + 0.4, C.ch2 - 0.3, 35.5, 31.9), st('jo', 'arm', C.jordan1 + 0.7, C.ch2 - 0.3, 35.8, 31.4),
  st('sy', 'inf', C.syria1 + 0.4, C.ch2 - 0.3, 35.95, 33.1), st('sy', 'art', C.golan1 + 0.4, C.ch2 - 0.3, 36.2, 32.9),
  st('il', 'inf', C.teeno1 - 0.6, C.ch2 - 0.3, 34.85, 31.4), st('il', 'arm', C.teeno1 - 0.3, C.ch2 - 0.3, 34.6, 31.0), st('il', 'inf', C.teeno1, C.ch2 - 0.3, 35.3, 32.9),
  // ch 2: Egypt pours into Sinai from 14 May
  tr('eg', 'arm', C.may14, C.redsea1, [C.may14, 32.5, 30.3], [C.sinai2 + 2.5, 34.0, 30.7]), tr('eg', 'inf', C.may14 + 0.4, C.redsea1, [C.may14 + 0.4, 32.4, 30.6], [C.sinai2 + 3, 33.9, 31.05]),
  tr('eg', 'arm', C.may14 + 0.8, C.redsea1, [C.may14 + 0.8, 32.6, 29.9], [C.sinai2 + 3.4, 34.3, 30.25]), tr('eg', 'inf', C.may14 + 1.2, C.redsea1, [C.may14 + 1.2, 32.5, 30.1], [C.sinai2 + 3.8, 33.6, 30.45]),
  st('il', 'inf', C.syriab - 0.2, C.galat + 1.5, 35.55, 33.05), st('il', 'arm', C.syriab, C.galat + 1.5, 35.45, 32.8),
  st('un', 'inf', C.unef1, C.hatana1 + 1.2, 34.5, 30.95), st('un', 'inf', C.unef1 + 0.3, C.hatana1 + 1.6, 34.75, 30.3), st('un', 'inf', C.unef1 + 0.6, C.hatana1 + 2.0, 34.35, 31.3),
  // Short 1: the countdown
  st('jo', 'inf', C.may30, C.june5a + 1, 35.5, 31.9), st('eg', 'arm', C.ulti, C.ch3, 34.0, 30.7), st('eg', 'inf', C.ulti + 0.2, C.ch3, 33.9, 31.05), st('eg', 'arm', C.ulti + 0.4, C.ch3, 34.3, 30.25),
  st('il', 'arm', C.june4, C.ch3, 34.65, 31.15), st('sy', 'inf', C.ulti + 0.6, C.ch3, 35.95, 33.1),
  // ch 3: mobilisation (Israeli tiles multiply)
  ...[[34.85, 31.95], [34.75, 31.6], [35.1, 32.6], [34.6, 31.2], [34.9, 31.3], [35.4, 33.0], [34.95, 32.3], [34.5, 30.9]].map(([lo, la], i) =>
    st('il', i % 3 === 1 ? 'arm' : 'inf', C.aam + i * 0.35, C.bridge2 + 1, lo, la)),
  // Short 2: Egypt's air force on the ground
  ...[[30.92, 30.12], [31.45, 30.35], [32.1, 30.56], [32.32, 30.33], [32.48, 30.24], [33.13, 30.41]].map(([lo, la], i) => st('eg', 'air', C.airbase + i * 0.2, C.runway + 0.4 + i * 0.6, lo, la)),
  ...[[33.9, 30.95], [33.7, 30.55], [33.4, 30.2]].map(([lo, la], i) => st('eg', 'arm', C.aasman - 0.4 + i * 0.25, C.bridge3, lo, la)),
  // Short 3: UNEF in Gaza and along the line
  ...[[34.3, 31.31], [34.37, 31.39], [34.45, 31.48], [34.4, 31.05], [34.55, 30.6], [34.75, 30.1]].map(([lo, la], i) => st('un', 'inf', C.unef3 + i * 0.3, i < 3 ? C.ch5 - 0.4 : C.hatana3 + i * 0.3, lo, la)),
  st('eg', 'inf', C.rokna - 1, C.ch5, 34.2, 31.2), st('il', 'inf', C.rokna - 0.8, C.ch5, 34.55, 31.4),
  // ch 5: three divisions, three routes
  tr('il', 'arm', C.teendiv, C.chardin + 2, [C.teendiv, 34.3, 31.28], [C.arish, 33.8, 31.1], [C.june8, 32.45, 31.0]),
  tr('il', 'arm', C.teendiv + 0.3, C.chardin + 2, [C.teendiv + 0.3, 34.45, 30.85], [C.toda, 34.12, 30.83], [C.june8, 32.55, 30.45]),
  tr('il', 'arm', C.teendiv + 0.6, C.chardin + 2, [C.teendiv + 0.6, 34.6, 30.3], [C.dakshin + 2, 33.75, 29.95], [C.pehle_pahunch, 33.02, 30.0], [C.june8 + 1, 32.65, 29.95]),
  tr('eg', 'arm', C.uttar, C.june8 + 1, [C.uttar, 33.9, 31.08], [C.june6 + 1, 33.4, 30.6], [C.phansi + 1, 33.02, 30.03]),
  tr('eg', 'inf', C.beech, C.june8 + 1, [C.beech, 34.0, 30.8], [C.june6 + 1, 33.5, 30.3], [C.phansi + 1, 33.12, 30.2]),
  tr('eg', 'arm', C.dakshin, C.june8 + 1, [C.dakshin, 33.6, 29.9], [C.phansi + 1, 32.98, 29.98]),
  // ch 6: Jerusalem and the West Bank
  tr('il', 'inf', C.koonch, C.bahas + 2, [C.koonch, 34.98, 31.84], [C.para, 35.23, 31.79]),
  tr('il', 'arm', C.koonch + 0.3, C.bahas + 2, [C.koonch + 0.3, 35.15, 32.5], [C.jenin + 1, 35.3, 32.3]),
  tr('jo', 'inf', C.topen - 0.6, C.hebron + 1.5, [C.topen - 0.6, 35.27, 31.82], [C.nadi, 35.3, 31.85], [C.nadi + 2.2, 35.65, 31.9]),
  tr('jo', 'arm', C.topen - 0.3, C.hebron + 1.5, [C.topen - 0.3, 35.15, 31.55], [C.nadi + 0.3, 35.2, 31.6], [C.nadi + 2.5, 35.7, 31.65]),
  // Short 4: Golan
  st('sy', 'art', C.upar, C.june10 + 0.6, 35.75, 33.0), st('sy', 'inf', C.upar + 0.3, C.june10 + 0.6, 35.72, 33.15), st('sy', 'art', C.golabari4 - 0.4, C.june10 + 0.6, 35.78, 32.85),
  tr('il', 'arm', C.june9, C.keemti + 3, [C.june9, 35.62, 33.22], [C.bunker + 2, 35.8, 33.12]),
  tr('il', 'inf', C.june9 + 0.4, C.keemti + 3, [C.june9 + 0.4, 35.64, 32.86], [C.bunker + 2.4, 35.78, 32.9]),
  // Short 6: the two banks of the canal
  st('il', 'inf', C.kinara_il, C.mahine + 1, 32.55, 30.4), st('il', 'arm', C.kinara_il + 0.3, C.mahine + 1, 32.62, 30.25),
  st('eg', 'inf', C.kinara_eg, C.mahine + 1, 32.22, 30.4), st('eg', 'arm', C.kinara_eg + 0.3, C.mahine + 1, 32.18, 30.25),
  // ch 8: 1973
  tr('eg', 'arm', C.n1973, C.baatcheet + 1, [C.n1973, 32.25, 30.4], [C.n1973 + 2.5, 32.75, 30.4]), tr('sy', 'arm', C.n1973 + 0.3, C.baatcheet + 1, [C.n1973 + 0.3, 36.0, 33.1], [C.n1973 + 2.8, 35.75, 33.0]),
];
const unitsAt = (t: number, head: number, s: number): UnitT[] => {
  const out: UnitT[] = [];
  for (const k of TRACKS) {
    if (t < k.from - 0.01 || t > k.to + 0.5) continue;
    const pop = Math.min(easeOut(ramp(t, k.from, k.from + 0.45)), 1 - ramp(t, k.to - 0.05, k.to + 0.4));
    let lon = k.path[0][1], lat = k.path[0][2];
    for (let i = 0; i < k.path.length - 1; i++) {
      const [ta, la, pa] = k.path[i], [tb, lb, pb] = k.path[i + 1];
      if (t >= ta) { const e = inOut(ramp(t, ta, tb)); lon = lerp(la, lb, e); lat = lerp(pa, pb, e); }
    }
    out.push({ side: k.side, kind: k.kind, at: PXZ([lon, lat]), s, head, pop });
  }
  return out;
};

// ------------------------------------------------------------------ labels
type Lab = { at: string | [number, number]; text: string; k: number; from: number; to: number; sub?: string; color?: string };
const L = (at: Lab['at'], text: string, k: number, from: number, to: number, sub?: string, color?: string): Lab => ({ at, text, k, from, to, sub, color });
const SEA = 'rgba(205,225,250,0.6)';
const LABELS: Lab[] = [
  L('gaza', 'ग़ाज़ा', 0.034, -1, C.israel0, 'GAZA'), L([35.75, 33.03], 'गोलान', 0.034, -1, C.israel0, 'GOLAN'), L([35.3, 32.05], 'वेस्ट बैंक', 0.034, -1, C.israel0, 'WEST BANK'),
  L([34.85, 30.9], 'इज़राइल', 0.03, C.israel0, C.ch2), L([31.5, 29.2], 'इजिप्ट', 0.03, C.egypt0, C.ch2), L([36.6, 31.2], 'जॉर्डन', 0.03, C.jordan0, C.ch2),
  L([37.3, 33.4], 'सीरिया', 0.03, C.syria0, C.ch2), L([33.8, 29.6], 'सिनाई', 0.028, C.sinai1, C.ch2), L([31.5, 33.2], 'भूमध्य सागर', 0.03, C.ch1, C.ch2, undefined, SEA),
  L('jerusalem', 'यरूशलम', 0.02, C.jeru1, C.syria1 + 2), L([35.3, 32.05], 'वेस्ट बैंक', 0.02, C.wb1, C.syria1 + 2), L([35.78, 33.03], 'गोलान', 0.02, C.golan1, C.n1948 + 1.5),
  L('tel_aviv', 'तेल अवीव', 0.02, C.patli1, C.km15 - 0.5),
  L('cairo', 'काहिरा', 0.022, C.cairo, C.unef1), L('gaza', 'ग़ाज़ा', 0.02, C.unef1, C.redsea1), L('sharm', 'शर्म अल-शेख़', 0.024, C.sharm, C.ch3),
  L([34.62, 27.86], 'तिरान', 0.026, C.straits, C.eilat, 'STRAITS OF TIRAN'), L([34.0, 28.6], 'सिनाई', 0.03, C.sinai3, C.eilat), L([35.3, 28.3], 'सऊदी अरब', 0.03, C.saudi, C.eilat + 1),
  L('eilat', 'ईलात', 0.03, C.rasta + 0.6, C.n1957b + 2), L([34.6, 27.6], 'लाल सागर', 0.028, C.rasta, C.n1957b, undefined, SEA),
  L('cairo', 'काहिरा', 0.024, C.pact, C.june4), L('amman', 'अम्मान', 0.024, C.pact, C.june4), L('tel_aviv', 'तेल अवीव', 0.024, C.june4, C.jal),
  L('tel_aviv', 'तेल अवीव', 0.022, C.june1, C.raat), L([32.4, 32.1], 'भूमध्य सागर', 0.03, C.tabhi, C.runway, undefined, SEA),
  L('cairo', 'काहिरा', 0.02, C.zameen1, C.runway - 0.8), L('suez', 'स्वेज़', 0.02, C.zameen1, C.runway - 0.8), L('amman', 'अम्मान', 0.022, C.jordsyr, C.focus), L('damascus', 'दमिश्क', 0.022, C.jordsyr, C.focus),
  L([34.27, 31.6], 'ग़ाज़ा', 0.03, C.s3, C.ch5, 'GAZA'),
  L('el_arish', 'अल-अरीश', 0.02, C.uttar, C.chardin), L('rafah', 'रफ़ा', 0.02, C.uttar, C.toda), L('abu_ageila', 'अबू अगेला', 0.022, C.beech, C.june8),
  L('mitla', 'मितला', 0.024, C.mitla, C.june8 + 1), L('giddi', 'गिद्दी', 0.024, C.mitla, C.june8 + 1), L('suez', 'स्वेज़ नहर', 0.022, C.june8, C.teenguna - 0.3, 'SUEZ CANAL'), L('cairo', 'काहिरा', 0.022, C.june6, C.phansi),
  L('jerusalem', 'यरूशलम', 0.026, C.ch6, C.banta), L('tel_aviv', 'तेल अवीव', 0.022, C.topen, C.banta), L('latrun', 'लातरून', 0.02, C.koonch, C.banta), L('ramallah', 'रामल्ला', 0.02, C.koonch, C.banta),
  L([35.218, 31.787], 'नया शहर', 0.05, C.naya, C.sadak + 1), L([35.245, 31.772], 'पुराना शहर', 0.05, C.purana, C.sadak + 1, 'OLD CITY'),
  L('jenin', 'जेनिन', 0.022, C.jenin, C.bahas), L('hebron', 'हेब्रोन', 0.022, C.hebron, C.bahas), L('nablus', 'नाबलस', 0.02, C.jenin, C.bahas), L('jerusalem', 'यरूशलम', 0.026, C.bahas, C.bridge4 + 1),
  L([35.82, 33.05], 'गोलान हाइट्स', 0.032, C.s4, C.galil, 'GOLAN HEIGHTS'), L('galilee', 'गलील का सागर', 0.03, C.sagar, C.dhara, undefined, SEA),
  L('kuneitra', 'क़ुनैत्रा', 0.028, C.june9, C.aajbhi), L('dan', 'दान', 0.026, C.dhara, C.june9), L('hermon', 'हेरमोन', 0.026, C.dhara, C.june9),
  L([33.8, 29.6], 'सिनाई', 0.028, C.sinaigaza, C.bridge5), L('gaza', 'ग़ाज़ा', 0.024, C.sinaigaza, C.bridge5), L([35.3, 32.05], 'वेस्ट बैंक', 0.024, C.wbj, C.bridge5), L([35.78, 33.03], 'गोलान', 0.024, C.golan5, C.bridge5),
  L([32.18, 30.33], 'ग्रेट बिटर लेक', 0.032, C.gbl, C.kinara_eg + 1, 'GREAT BITTER LAKE', SEA), L([32.18, 30.57], 'लेक तिमसाह', 0.026, C.timsah, C.kinara_eg + 1, undefined, SEA),
  L('port_said', 'पोर्ट सईद', 0.03, C.band, C.n15b), L('suez', 'स्वेज़', 0.03, C.band, C.n15b), L([32.4, 30.43], 'येलो फ़्लीट', 0.036, C.yellow, C.bharat6, 'YELLOW FLEET'),
  L('gaza', 'ग़ाज़ा', 0.034, C.gaza9 - 0.3, END, 'GAZA'), L([35.75, 33.03], 'गोलान', 0.034, C.gaza9, END, 'GOLAN'), L([35.3, 32.05], 'वेस्ट बैंक', 0.034, C.gaza9 + 0.3, END, 'WEST BANK'),
];

// ------------------------------------------------------------------ cities
const CITIES: [string, number, number][] = [
  ['jerusalem', -1, END], ['tel_aviv', -1, END], ['cairo', -1, END], ['amman', -1, END], ['damascus', -1, END], ['gaza', -1, END], ['haifa', -1, END],
  ['beirut', -1, END], ['el_arish', C.ch5 - 2, END], ['ismailia', -1, END], ['suez', -1, END], ['port_said', -1, END], ['eilat', -1, END], ['sharm', -1, END],
  ['hebron', C.ch6 - 2, C.bridge4 + 2], ['jenin', C.ch6 - 2, C.bridge4 + 2], ['ramallah', C.ch6 - 2, C.bridge4 + 2], ['bethlehem', C.ch6 - 2, C.bridge4 + 2], ['nablus', C.ch6 - 2, C.bridge4 + 2],
  ['kuneitra', C.bridge4, C.s5], ['tiberias', C.bridge4, C.s5], ['khan_yunis', C.s3 - 2, C.ch5 + 3], ['rafah', C.s3 - 2, C.ch5 + 3],
];

// ------------------------------------------------------------------ blasts (time, place, size factor of the view)
type BlastT = [number, string | [number, number], number, number?];
const AIRFIELDS = ['cairo_west', 'inshas', 'abu_suweir', 'fayid', 'kabrit', 'bir_gifgafa', 'bir_thamada', 'el_arish_af', 'beni_suef', 'mansoura', 'cairo_intl'];
const BLASTS: BlastT[] = [
  // frame 0 of Short 2 = a burning airfield: these blasts started before the Short and are still rolling
  [C.s2 - 2.2, 'abu_suweir', 0.0195], [C.s2 - 1.4, [32.13, 30.55], 0.0143], [C.s2 - 0.6, [32.08, 30.57], 0.013],
  [C.golabari1 - 0.2, [35.62, 33.0], 0.0078], [C.golabari1 + 0.4, [34.42, 31.32], 0.0078], [C.golabari1 + 0.9, [35.0, 32.45], 0.0065],
  [C.jal - 2.6, [34.0, 30.8], 0.0117], [C.jal - 2.0, [32.3, 30.4], 0.0117], [C.jal - 1.5, [35.25, 31.8], 0.0104], [C.jal - 1.1, [35.7, 33.05], 0.0104], [C.jal - 0.6, [31.4, 30.3], 0.0117], [C.jal - 0.2, [33.1, 30.4], 0.0104],
  ...AIRFIELDS.slice(0, 7).map((a, i): BlastT => [C.runway + 0.5 + i * 0.42, a, 0.0182]),
  ...AIRFIELDS.slice(3).map((a, i): BlastT => [C.khade2 + 0.3 + i * 0.35, a, 0.0143]),
  ...['amman_af', 'mafraq_af', 'damascus_af', 'dumayr', 'seikal', 'marj_ruhayyil'].map((a, i): BlastT => [C.jordsyr + 0.5 + i * 0.35, a, 0.013]),
  [C.chhid + 0.1, [34.42, 31.44], 0.0292], [C.chhid + 0.6, [34.36, 31.38], 0.026], [C.phans + 0.2, [34.46, 31.5], 0.026], [C.phans + 0.9, [34.4, 31.42], 0.0228],
  [C.toda - 1.2, 'abu_ageila', 0.026], [C.toda - 0.5, [34.13, 30.85], 0.0228], [C.toda + 0.2, [34.08, 30.8], 0.0228],
  [C.pehle_pahunch - 0.5, 'mitla', 0.026], [C.pehle_pahunch + 0.2, [32.97, 30.02], 0.0228], [C.pehle_pahunch + 0.8, 'giddi', 0.0228],
  [C.topen + 0.2, [35.2, 31.82], 0.013], [C.topen + 0.7, [34.85, 32.05], 0.013], [C.telaviv + 0.3, [34.95, 31.9], 0.013],
  [C.para - 0.4, [35.233, 31.778], 0.039], [C.para + 0.3, [35.228, 31.781], 0.0325],
  [C.golabari4 - 0.2, [35.6, 32.95], 0.026], [C.golabari4 + 0.4, [35.58, 33.05], 0.0228],
  [C.chadhai + 3.0, [35.72, 33.13], 0.0292], [C.bunker + 0.2, [35.76, 33.1], 0.0325], [C.bunker + 0.9, [35.75, 32.92], 0.0292],
  [C.band + 0.3, 'port_said', 0.039], [C.band + 1.0, 'suez', 0.039],
];

// ------------------------------------------------------------------ helpers for the overlays
const sideFlags: [Side, string, number, number][] = [['il', 'israel', C.israel0, C.egypt0], ['eg', 'egypt', C.egypt0, C.jordan0], ['jo', 'jordan', C.jordan0, C.syria0], ['sy', 'syria', C.syria0, C.faisla0]];
const FLAGAT: Record<string, [number, number]> = { israel: [34.95, 30.55], egypt: [32.3, 29.6], jordan: [36.4, 31.3], syria: [36.9, 33.3] };

const WorldInset: React.FC<{ u: number; W: number; H: number; p: number; t0: number; t: number; portrait: boolean }> = ({ u, W, H, p, t0, t, portrait }) => {
  if (p <= 0.001) return null;
  const w = portrait ? W * 0.9 : W * 0.56, hh = w * 0.82;
  const [x0, y0, x1, y1] = world.bbox as number[];
  const P = (lon: number, lat: number) => [((lon - x0) / (x1 - x0)) * w, ((y1 - lat) / (y1 - y0)) * hh];
  const path = (pts: number[][]) => pts.map(([lo, la], i) => { const [x, y] = P(lo, la); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ') + 'Z';
  const route = (pts: [number, number][]) => pts.map(([lo, la], i) => { const [x, y] = P(lo, la); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
  const suez: [number, number][] = [[72.8, 18.9], [58, 13], [43.3, 12.6], [38, 20], [32.5, 29.9], [32.3, 31.3], [20, 34], [5, 37.5], [-6, 36], [-9.5, 38.7]];
  const cape: [number, number][] = [[72.8, 18.9], [55, 0], [40, -25], [20, -36.5], [10, -30], [3, -5], [-10, 10], [-18, 25], [-12, 36], [-9.5, 38.7]];
  const k = easeOut(ramp(t, t0 + 1.2, t0 + 4.2));
  return (
    <div style={{ position: 'absolute', left: (W - w) / 2, top: (H - hh) / 2 - (portrait ? 80 * u : 0), width: w, height: hh, opacity: clamp01(p * 1.4), transform: `scale(${0.94 + 0.06 * easeOut(clamp01(p))})`,
      background: 'linear-gradient(#1d3550,#10233a)', border: `${4 * u}px solid #d9c99a`, borderRadius: 10 * u, boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.7)`, overflow: 'hidden' }}>
      <svg width={w} height={hh}>
        {(world.land as number[][][]).map((pl, i) => <path key={i} d={path(pl)} fill="#7f8a5c" stroke="#2b2b22" strokeWidth={1.5 * u} />)}
        {(world.india as number[][][]).map((pl, i) => <path key={`i${i}`} d={path(pl)} fill="#c98b3a" stroke="#2b2b22" strokeWidth={1.5 * u} />)}
        <path d={route(suez)} fill="none" stroke="#9fb0c4" strokeWidth={5 * u} strokeDasharray={`${12 * u} ${9 * u}`} opacity={0.75} />
        {(() => { const [x, y] = P(32.4, 30.5); return <g transform={`translate(${x},${y})`} opacity={clamp01(ramp(t, t0 + 0.3, t0 + 0.8))}><circle r={26 * u} fill="#c0392b" /><path d={`M${-12 * u},${-12 * u} L${12 * u},${12 * u} M${12 * u},${-12 * u} L${-12 * u},${12 * u}`} stroke="#fff" strokeWidth={6 * u} /></g>; })()}
        <path d={route(cape)} fill="none" stroke="#ffd23f" strokeWidth={7 * u} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} style={{ filter: `drop-shadow(0 0 ${6 * u}px #ffb000)` }} />
        {(() => { const [x, y] = P(73.5, 21.5); return <text x={x} y={y} fill="#fff" fontFamily={UI} fontWeight={800} fontSize={34 * u} textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 6 * u }}>भारत</text>; })()}
        {(() => { const [x, y] = P(8, 48); return <text x={x} y={y} fill="#fff" fontFamily={UI} fontWeight={800} fontSize={34 * u} textAnchor="middle" style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 6 * u }}>यूरोप</text>; })()}
        {(() => { const [x, y] = P(20, -33); return <text x={x} y={y + 48 * u} fill="#ffd23f" fontFamily={UI} fontWeight={800} fontSize={28 * u} textAnchor="middle" opacity={k} style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 6 * u }}>पूरे अफ़्रीका का चक्कर</text>; })()}
      </svg>
      <div style={{ position: 'absolute', left: 12 * u, bottom: 8 * u, fontFamily: ENF, fontSize: 12 * u, color: 'rgba(255,255,255,0.6)' }}>Natural Earth · India's official boundary</div>
    </div>
  );
};

const GolanProfile: React.FC<{ u: number; W: number; H: number; p: number; portrait: boolean }> = ({ u, W, H, p, portrait }) => {
  if (p <= 0.001) return null;
  const w = portrait ? W * 0.86 : W * 0.42, hh = w * 0.42, e = easeOut(clamp01(p));
  // a west-east section from the lake (-210 m) up the escarpment to the plateau (~ +500 to +1,000 m); heights are rounded
  const pts: [number, number][] = [[0, -210], [0.18, -210], [0.26, -150], [0.34, 120], [0.42, 360], [0.5, 480], [0.66, 560], [0.82, 700], [1, 900]];
  const X = (x: number) => 30 * u + x * (w - 60 * u), Y = (m: number) => hh - 40 * u - ((m + 300) / 1300) * (hh - 80 * u);
  const d = pts.map(([x, m], i) => `${i ? 'L' : 'M'}${X(x * e)},${Y(m)}`).join(' ');
  return (
    <div style={{ position: 'absolute', left: portrait ? (W - w) / 2 : W - w - 90 * u, top: portrait ? H * 0.12 : 110 * u, width: w, height: hh, opacity: clamp01(p * 1.5),
      background: 'rgba(12,18,24,0.82)', border: `${2 * u}px solid rgba(233,196,106,0.7)`, borderRadius: 10 * u, boxShadow: `0 ${12 * u}px ${30 * u}px rgba(0,0,0,0.6)` }}>
      <svg width={w} height={hh}>
        <rect x={X(0)} y={Y(-210)} width={X(0.2) - X(0)} height={Y(-300) - Y(-210)} fill="#2f6ea3" />
        <path d={`${d} L${X(e)},${Y(-300)} L${X(0)},${Y(-300)} Z`} fill="rgba(160,90,90,0.55)" stroke="#f0d79a" strokeWidth={4 * u} />
        <text x={X(0.03)} y={Y(-210) - 12 * u} fill="#cfe3ff" fontFamily={UI} fontWeight={700} fontSize={22 * u}>गलील −210 मी</text>
        <text x={X(0.6)} y={Y(700) - 16 * u} fill="#ffd23f" fontFamily={UI} fontWeight={800} fontSize={24 * u} opacity={clamp01(p * 2 - 1)}>गोलान +500 से +1,000 मी</text>
      </svg>
    </div>
  );
};

// ------------------------------------------------------------------ the scene
export type SceneP = { t: number; W: number; H: number; portrait: boolean; h: Float32Array; im: Record<string, THREE.Texture>; caps?: [number, number] | null; long?: boolean; gid?: string; md: Models };

export const Scene: React.FC<SceneP> = ({ t, W, H, portrait, h, im, caps, long, gid = 'sdgrade', md }) => {
  const ck = camKey(t, portrait);
  const blastTimes = BLASTS.filter(([b0]) => t >= b0 && t < b0 + 1).map(([b0]) => b0);
  let cam: CamS = camOf(h, ck);
  const D = ck.d / (portrait ? 1.75 : 1); // the view's scale (same objects in both formats)
  const sh = shake(t, blastTimes, D * 0.004);
  cam = { ...cam, pos: [cam.pos[0] + sh[0], cam.pos[1] + sh[1], cam.pos[2]], look: [cam.look[0] + sh[0] * 0.5, cam.look[1] + sh[1] * 0.5, cam.look[2]] };
  const u = portrait ? W / 1080 : H / 1080;
  const prj = (p: string | [number, number], up = 0): [number, number] => { const [x, z] = PXZ(p); const q = project(cam, W, H, [x, groundXZ(h, x, z) + up, z]); return [q[0], q[1]]; };
  const head = ck.head;
  const g = groundAt(t);
  const w = (a: number, b: number, c: number, d: number) => window4(t, a, b, c, d);
  /** A Short's frame-0 card: on from just before the Short starts (it fades in over the bridge) until it is dismissed. */
  const hookP = (s0: number, out0: number, out1: number) => (t < s0 - 0.7 || t > out1 ? 0 : Math.min(ramp(t, s0 - 0.7, s0 - 0.15), 1 - ramp(t, out0, out1)));

  // ---- 3D
  const units = unitsAt(t, head, D * 0.05);
  const labels = LABELS.filter((l) => t > l.from - 0.6 && t < l.to + 0.6).map((l, i) => (
    <Label key={`l${i}`} h={h} at={l.at} text={l.text} size={l.k * D * 0.85} head={head} op={w(l.from, l.from + 0.5, l.to, l.to + 0.5)} sub={l.sub} color={l.color ?? 'gold'} />
  ));
  const cities = CITIES.filter(([, a, b]) => t > a && t < b).map(([at, a], i) => <City key={`c${i}`} h={h} at={at} size={D * 0.02} seed={i + 1} grow={ramp(t, a, a + 0.8)} />);
  const blasts = BLASTS.filter(([b0]) => t >= b0 && t < b0 + 4.2).map(([b0, at, k, sd], i) => <Blast key={`b${i}`} h={h} at={at} size={D * k} age={t - b0} seed={sd ?? i + 3} />);
  const props: React.ReactNode[] = [];
  const P = (key: string, n: string, at: string | [number, number] | V3, wk: number, a: number, b: number, extra: Partial<React.ComponentProps<typeof Prop>> = {}) => {
    const op = w(a, a + 0.5, b, b + 0.5);
    if (op > 0) props.push(<Prop key={key} tex={im[n]} h={h} at={at} w={D * wk} head={head} op={op} {...extra} />);
  };
  // ch 1: a tank crossing the waist
  // ch 2: the parade, UNEF, Sharm el-Sheikh
  [[34.31, 31.31], [34.42, 31.1], [34.55, 30.75], [34.7, 30.3], [34.85, 29.8]].forEach(([lo, la], i) => P(`hel${i}`, 'u_blue_helmet', [lo, la], 0.05, C.unef1 + i * 0.25, C.hatana1 + 0.6 + i * 0.45));
  if (t > C.hatana1 && t < C.redsea1 + 1) { const e = inOut(ramp(t, C.hatana1 + 0.3, C.redsea1)); P('jeep', 'u_un_jeep', [lerp(34.45, 33.4, e), lerp(30.95, 30.6, e)], 0.07, C.hatana1, C.redsea1); }
  P('post', 'p_coastal_post', 'sharm', 0.17, C.chowki - 0.3, C.s1 + 0.2);
  // Short 1: Tiran
  P('eilat', 'p_port_eilat', [34.97, 29.5], 0.3, C.eilat - 0.3, C.rasta + 0.6);
  const ship = (key: string, n: string, a: number, b: number, from: [number, number], to: [number, number], wk: number, t0: number, t1: number) => {
    if (t < a - 0.6 || t > b + 0.6) return;
    const e = ramp(t, t0, t1, linear);
    P(key, n, [lerp(from[0], to[0], e), lerp(from[1], to[1], e)], wk, a, b);
  };
  // Short 2: airfields (tiles swap to craters as they are hit), parked jets, and the jets coming in low
  AIRFIELDS.slice(0, 7).forEach((a, i) => {
    const hit = C.runway + 0.5 + i * 0.42;
    const from = i === 2 ? C.s2 - 0.5 : C.airbase + i * 0.15;
    P(`af${i}`, t < hit + 0.15 ? 'a_airfield_tile' : 'a_runway_crater_tile', a, i === 2 && t < C.t745 ? 0.2 : 0.075, from, C.dopahar + 1, { flat: false });
  });
  const JETS: [number, [number, number][], number][] = [
    [C.s2 - 0.3, [[32.6, 30.9], [32.1, 30.56], [31.6, 30.2]], 3.2],
    ...[0, 1, 2, 3].map((i): [number, [number, number][], number] => [C.tabhi - 0.5 + i * 0.35, [[34.6, 31.8 - i * 0.05], [33.2, 31.65 - i * 0.04], [32.3, 31.35], [31.9 - i * 0.1, 30.8], [31.4 + i * 0.2, 30.3]], 9]),
    ...[0, 1, 2].map((i): [number, [number, number][], number] => [C.lehar2 - 0.3 + i * 0.3, [[34.5, 31.3], [33.3, 31.2], [32.5, 30.9], [32.2 - i * 0.2, 30.4]], 6]),
  ];
  const jets = JETS.map(([j0, path, dur], i) => <Jet3D key={`j${i}`} h={h} m={md} path={path} p={ramp(t, j0, j0 + dur, linear)} len={D * (t > C.tabhi && t < C.radar + 1 ? 0.1 : 0.08)} alt={D * (t < C.radar + 1 ? 0.018 : 0.045)} />);
  const brackets = AIRFIELDS.slice(0, 7).map((a, i) => {
    const t0 = C.runway - 0.6 + i * 0.25;
    return <Bracket key={`br${i}`} h={h} at={a} size={D * 0.09} lock={easeOut(ramp(t, t0, t0 + 0.4))} t={t} op={1 - ramp(t, C.n200, C.n200 + 0.6)} />;
  });
  // Short 3: blue helmets in Gaza
  [[34.33, 31.37], [34.4, 31.43], [34.27, 31.3]].forEach(([lo, la], i) => P(`gh${i}`, 'u_blue_helmet', [lo, la], 0.085, C.s3 - 1 + i * 0.2, C.ch5 - 0.5, { tint: t > C.kisi ? `rgb(${Math.round(255 - 110 * ramp(t, C.kisi, C.topi + 2))},${Math.round(255 - 100 * ramp(t, C.kisi, C.topi + 2))},${Math.round(255 - 80 * ramp(t, C.kisi, C.topi + 2))})` : '#ffffff' }));
  // ch 5: tanks into Sinai; ch 6: the walls; Short 4: bunkers on the ridge
  P('wall', 'w_old_city_wall', [35.236, 31.775], 0.22, C.purana - 0.2, C.para + 1.5);
  [[35.74, 33.12], [35.77, 32.98], [35.73, 32.86]].forEach(([lo, la], i) => P(`bk${i}`, 'b_bunker_ridge', [lo, la], 0.14, C.s4 - 0.6 + i * 0.2, C.june10 + 0.5));
  // ---- the 3D models (tools/blender/build_sixday_models.py)
  const m3: React.ReactNode[] = [];
  const wakes: [number, number, number, number][] = [];
  const TK = (key: string, side: string, path: Pt[], a: number, b: number, t0: number, t1: number, o: { k?: number; aim?: Pt; fire?: number[]; lag?: number } = {}) => {
    if (t < a - 0.5 || t > b + 0.6) return;
    const lag = o.lag ?? 0;
    m3.push(<Tank key={key} h={h} m={md} side={side} path={path} p={Math.max(0, inOut(ramp(t, t0, t1)) - lag)} len={D * 0.06 * (o.k ?? 1)} t={t} aim={o.aim} fire={o.fire} op={w(a, a + 0.4, b, b + 0.5)} />);
  };
  const SHIP = (key: string, kind: 'ship' | 'tanker', a: number, b: number, from: [number, number], to: [number, number], t0: number, t1: number, o: { k?: number; yellow?: number; sink?: number } = {}) => {
    if (t < a - 0.5 || t > b + 0.6) return;
    const e = ramp(t, t0, t1, linear);
    const [fx, fz] = PXZ(from), [tx, tz] = PXZ(to);
    const x = lerp(fx, tx, e), z = lerp(fz, tz, e);
    const head = (Math.atan2(tx - fx, -(tz - fz)) * 180) / Math.PI;
    const len = D * 0.07 * (o.k ?? 1);
    const moving = e > 0 && e < 1 && Math.hypot(tx - fx, tz - fz) > 0.01;
    if (moving) wakes.push([x, z, Math.PI / 2 - (head * Math.PI) / 180, len]);
    m3.push(<Ship3D key={key} h={h} m={md} kind={kind} at={[x, 0, z]} head={head} len={len} t={t} op={w(a, a + 0.4, b, b + 0.5)} yellow={o.yellow ?? 0} sink={o.sink ?? 0} />);
  };
  const SQ = (key: string, side: string, path: Pt[], a: number, b: number, t0: number, t1: number, o: { n?: number; run?: boolean; firing?: boolean } = {}) => {
    if (t < a - 0.5 || t > b + 0.6) return;
    m3.push(<Squad key={key} h={h} m={md} side={side} path={path} p={ramp(t, t0, t1, linear)} n={o.n ?? 6} tall={D * 0.032} spread={D * 0.05} t={t} run={o.run ?? true} firing={o.firing} op={w(a, a + 0.4, b, b + 0.5)} seed={key.length * 7} />);
  };
  const TR = (key: string, a0: Pt, b0: Pt, from: number, to: number, color?: string) => {
    if (t < from || t > to + 0.4) return;
    m3.push(<Tracers key={key} h={h} a={a0} b={b0} t={t} up={D * 0.006} op={w(from, from + 0.3, to, to + 0.4)} color={color} seed={key.length} />);
  };
  // ch 1: a tank crosses Israel's 15 km waist; ch 2: the Cairo parade
  TK('waist', 'il', [[35.02, 32.31], [34.95, 32.32], [34.88, 32.33]], C.tank1 - 0.3, C.egypt1, C.tank1, C.tank1 + 3.2, { k: 1.4 });
  for (let i = 0; i < 4; i++) TK(`par${i}`, 'eg', [[31.12, 30.0], [31.25, 30.05], [31.42, 30.1], [31.6, 30.14]], C.parade - 0.5, C.unef1, C.parade - 1, C.unef1 + 1, { lag: i * 0.07, k: 1.1 });
  // Short 1: ships through the Straits of Tiran
  SHIP('tk0', 'tanker', C.s1 - 1.2, C.gali1 + 3, [34.43, 27.9], [34.49, 28.06], C.s1 - 2, C.gali1 + 4, { k: 1.6 });
  SHIP('tk1', 'tanker', C.asia - 0.4, C.n1957b, [34.44, 27.95], [34.75, 28.6], C.asia - 1, C.n1957b + 2);
  SHIP('cs1', 'ship', C.asia, C.n1957b, [34.5, 28.1], [34.85, 29.0], C.asia - 1, C.n1957b + 2);
  SHIP('tk2', 'tanker', C.nahi_guzrenge - 2.5, C.ulti, [34.42, 27.88], [34.45, 27.95], C.nahi_guzrenge - 3, C.nahi_guzrenge + 0.2, { k: 1.4 });
  // ch 3: reservists heading for the fronts
  SQ('res1', 'il', [[34.8, 32.1], [34.88, 31.95], [34.95, 31.8]], C.aam - 0.3, C.ruk + 1, C.aam - 0.5, C.ruk + 2, { n: 7, run: false });
  SQ('res2', 'il', [[34.7, 31.7], [34.62, 31.5], [34.55, 31.3]], C.aam, C.ruk + 1, C.aam - 0.3, C.ruk + 2, { n: 6, run: false });
  // Short 2: MiGs parked on the airfields until the runways go
  ['abu_suweir', 'inshas', 'fayid'].forEach((af, i) => {
    const [x, z] = PXZ(af);
    for (let j = 0; j < 3; j++) {
      const hitT = C.runway + 0.5 + [2, 1, 3][i] * 0.42;
      if (t > hitT + 0.3 || t < C.s2 - 1) continue;
      m3.push(<Jet3D key={`mig${i}${j}`} h={h} m={md} kind="mig" path={[[0, 0], [0, 0]].map((_, q) => [34 + (x + D * 0.02 * (j - 1) + q * 0.01) / 95.62, 30.8 - (z + D * 0.012) / 111.32] as [number, number])} p={0.5} len={D * 0.055} alt={D * 0.002} trail={0} />);
    }
  });
  // Short 3: UN soldiers in Gaza; crossfire on 5 June
  SQ('un1', 'un', [[34.3, 31.33], [34.34, 31.36], [34.37, 31.39]], C.unef3, C.chhid + 0.5, C.unef3 - 1, C.chhid + 6, { n: 6, run: false });
  SHIP('wait', 'ship', C.jahaaz3 - 0.4, C.chhid + 1, [34.2, 31.6], [34.24, 31.585], C.jahaaz3, C.chhid + 3, { k: 1.3 });
  TR('xf1', [34.55, 31.36], [34.42, 31.43], C.chhid, C.n14b + 0.4, '#ffb347');
  TR('xf2', [34.25, 31.52], [34.39, 31.44], C.chhid + 0.3, C.n14b + 0.4, '#ffe08a');
  // ch 5: three columns into Sinai; Egypt's armour falls back to the passes; the race to Mitla and Giddi
  for (let i = 0; i < 3; i++) {
    TK(`n${i}`, 'il', [[34.3, 31.28], [33.8, 31.12], [33.2, 31.05], [32.45, 31.0]], C.teendiv, C.chardin, C.teendiv, C.june8 + 1, { lag: i * 0.05 });
    TK(`c${i}`, 'il', [[34.45, 30.85], [34.12, 30.83], [33.13, 30.41], [32.55, 30.45]], C.teendiv + 0.3, C.chardin, C.teendiv + 0.3, C.june8 + 1, { lag: i * 0.05, aim: 'abu_ageila', fire: [C.toda - 1.4 - i * 0.2, C.toda - 0.6 + i * 0.15] });
    TK(`s${i}`, 'il', [[34.6, 30.3], [33.75, 29.95], [33.02, 30.0], [32.65, 29.95]], C.teendiv + 0.6, C.chardin, C.dakshin, C.june8 + 1, { lag: i * 0.05, fire: [C.pehle_pahunch - 0.7 + i * 0.25] });
    TK(`e${i}`, 'eg', [[33.95, 31.0], [33.5, 30.6], [33.15, 30.25], [33.0, 30.05]], C.uttar, C.june8, C.june6 + 0.5, C.phansi + 1.5, { lag: i * 0.06 });
  }
  SQ('egr', 'eg', [[33.9, 30.8], [33.5, 30.5], [33.15, 30.2]], C.june6, C.june8, C.june6, C.phansi + 2, { n: 7 });
  // ch 6: paratroopers through the streets into the Old City
  SQ('para1', 'il', [[35.21, 31.786], [35.222, 31.783], [35.232, 31.779]], C.sadak - 0.4, C.nadi, C.sadak, C.para + 1.5, { n: 8, firing: true });
  SQ('para2', 'il', [[35.214, 31.795], [35.226, 31.79], [35.236, 31.783]], C.sadak, C.nadi, C.sadak + 0.3, C.para + 1.8, { n: 6, firing: true });
  TR('jx1', [35.236, 31.776], [35.222, 31.784], C.sadak, C.para + 1);
  SQ('jo6', 'jo', [[35.3, 31.85], [35.45, 31.87], [35.6, 31.9]], C.nadi - 0.3, C.hebron + 1, C.nadi, C.hebron + 2, { n: 6 });
  // Short 4: tanks and infantry up the Golan escarpment, firing at the bunkers
  for (let i = 0; i < 2; i++) {
    TK(`g${i}`, 'il', [[35.62, 33.22], [35.7, 33.21], [35.8, 33.13]], C.june9, C.keemti + 2, C.chadhai + 2.6, C.june10 + 1, { lag: i * 0.08, aim: [35.76, 33.1], fire: [C.bunker - 0.2 + i * 0.4] });
    TK(`h${i}`, 'il', [[35.64, 32.86], [35.72, 32.86], [35.8, 32.9]], C.june9 + 0.4, C.keemti + 2, C.chadhai + 2.8, C.june10 + 1.2, { lag: i * 0.08, aim: [35.75, 32.92], fire: [C.bunker + 0.5 + i * 0.4] });
  }
  SQ('gi1', 'il', [[35.63, 33.0], [35.69, 33.02], [35.75, 33.04]], C.june9 + 0.3, C.june10 + 1, C.chadhai + 2.6, C.june10 + 1.5, { n: 8, firing: true });
  TR('gx1', [35.76, 33.1], [35.68, 33.12], C.bunker - 0.5, C.june10, '#ff9a4a');
  // Short 6: the convoy, the scuttled ships, the 15 trapped, the 2 that sail home
  for (let i = 0; i < 3; i++) SHIP(`cv${i}`, 'ship', C.beechraaste - 0.4, C.band + 0.6, [32.31, 31.15 - i * 0.12], [32.33, 30.75 - i * 0.12], C.beechraaste - 1, C.band, { k: 0.9 });
  SHIP('sunkN', 'ship', C.band, C.n15b, [32.31, 31.2], [32.31, 31.2], 0, 1, { k: 0.9, sink: ramp(t, C.duba - 0.3, C.duba + 1.2) });
  SHIP('sunkS', 'ship', C.band + 0.4, C.n15b, [32.56, 29.97], [32.56, 29.97], 0, 1, { k: 0.9, sink: ramp(t, C.duba, C.duba + 1.4) });
  const yellowK = Math.max(t < C.beechraaste ? 1 : 0, ramp(t, C.mahine, C.yellow));
  const fleetPos: [number, number][] = [[32.33, 30.38], [32.36, 30.4], [32.39, 30.37], [32.35, 30.35], [32.42, 30.34], [32.38, 30.32], [32.45, 30.31], [32.41, 30.29],
    [32.34, 30.31], [32.44, 30.36], [32.4, 30.4], [32.37, 30.29], [32.47, 30.33], [32.32, 30.34], [32.295, 30.565]];
  if (t > C.s6 - 1 && t < C.ch8 + 0.5) {
    fleetPos.forEach(([lo, la], i) => {
      const going = i < 2 ? ramp(t, C.do6, C.ghar6 + 3, linear) : 0;
      SHIP(`fl${i}`, 'ship', C.s6 - 1 + i * 0.05, C.ch8, [lo, la], [lo + 0.12, la + 0.9], 1e9, 1e9 + 1, { k: 1.0, yellow: yellowK });
      if (going > 0) { m3.pop(); SHIP(`fl${i}`, 'ship', C.s6 - 1, C.ch8, [lo, la], [lo + 0.12, la + 0.9], C.do6, C.ghar6 + 3, { k: 0.75, yellow: yellowK * (1 - going * 0.3) }); }
    });
  }
  // ch 8: 1973, Egypt's armour across the canal
  for (let i = 0; i < 3; i++) TK(`y73${i}`, 'eg', [[32.25, 30.4 + i * 0.06], [32.5, 30.4 + i * 0.06], [32.8, 30.42 + i * 0.06]], C.n1973, C.baatcheet + 0.5, C.n1973, C.n1973 + 3, { lag: i * 0.05 });
  const arrows: React.ReactNode[] = [];
  const A = (key: string, path: (string | [number, number])[], a: number, b: number, end: number, wk = 0.018, color?: string) => {
    if (t < a || t > end + 0.6) return;
    arrows.push(<Arrow key={key} h={h} path={path} w={D * wk} p={easeOut(ramp(t, a, b))} op={1 - ramp(t, end, end + 0.6)} color={color} />);
  };
  A('route', ['eilat', [34.75, 28.6], [34.47, 27.98], [34.2, 27.5]], C.rasta, C.yahigali + 0.6, C.n1957b, 0.012, '#4fd1ff');
  A('a5n', [[34.3, 31.28], [33.8, 31.12], [32.4, 31.0]], C.uttar - 0.3, C.arish + 1.5, C.chardin);
  A('a5c', [[34.45, 30.85], [34.1, 30.83], [33.13, 30.41], [32.55, 30.45]], C.beech - 0.3, C.toda + 1.5, C.chardin);
  A('a5s', [[34.6, 30.3], [33.75, 29.95], [32.95, 29.98]], C.dakshin - 0.2, C.dakshin + 2.5, C.chardin);
  A('a6a', [[34.98, 31.84], [35.2, 31.9], [35.42, 31.87]], C.koonch - 0.2, C.koonch + 1.8, C.bahas);
  A('a6b', [[35.15, 32.55], [35.3, 32.46], [35.26, 32.22]], C.jenin - 1.2, C.jenin + 0.6, C.bahas);
  A('a6c', [[35.0, 31.6], [35.1, 31.53]], C.hebron - 1, C.hebron + 0.6, C.bahas);
  A('a4a', [[35.62, 33.22], [35.72, 33.2], [35.82, 33.13]], C.june9 + 0.2, C.chadhai + 3.5, C.june10 + 1.5, 0.03);
  A('a4b', [[35.64, 32.86], [35.74, 32.86], [35.82, 32.92]], C.june9 + 0.6, C.chadhai + 3.9, C.june10 + 1.5, 0.03);
  A('a8e', [[32.25, 30.4], [32.8, 30.4]], C.n1973, C.n1973 + 1.5, C.baatcheet, 0.02, '#ff7a3d');
  A('a8s', [[36.05, 33.1], [35.78, 33.02]], C.n1973 + 0.3, C.n1973 + 1.8, C.baatcheet, 0.02, '#ff7a3d');
  A('xfire1', [[34.55, 31.36], [34.43, 31.43]], C.chhid, C.chhid + 0.8, C.n14b, 0.012, '#ff5a4a');
  A('xfire2', [[34.25, 31.5], [34.39, 31.44]], C.chhid + 0.3, C.chhid + 1.1, C.n14b, 0.012, '#ff5a4a');
  A('barrier', [[34.38, 27.93], [34.53, 28.03]], C.nahi_guzrenge - 0.1, C.nahi_guzrenge + 0.25, C.ulti + 1, 0.01, '#e8322a');

  // ---- 2D overlays
  // Every card, date, number and stamp lives in a screen slot; a new item in a slot pushes the previous one out first,
  // so no two texts ever sit on top of each other.
  const SLOT: Record<string, [string, number]> = {
    stamp6: ['top', -9], june67: ['top', C.june67], y48: ['top', C.n1948], y56: ['top2', C.n1956], may14: ['top', C.may14], may18: ['top', C.may18],
    d1957: ['top', C.n1957b], dt0: ['top', C.may22], dt1: ['top', C.may30], dt2: ['top', C.june4], dt3: ['top', C.june5a], night: ['top', C.raat],
    d5j: ['topR', C.t745], d6j: ['top', C.june6], d8j: ['top', C.june8], d7j: ['top', C.june7 + 0.3], d9j: ['top', C.june9], d10j: ['top', C.june10],
    d10s: ['top', C.shaam], lossT: ['top', C.keemat], y82: ['top', C.n1982a], y05: ['top', C.n2005], yrs: ['topR', C.mahine], y75: ['top', C.khuli],
    d242: ['top', C.nov22], y73: ['top', C.n1973], y82b: ['top', C.n1982b], stampEnd: ['top', C.chhahdin9],
    '3h': ['mid', C.teen0], elaan: ['mid', C.elaan1], band: ['mid', C.nahi_guzrenge], '3h2': ['mid', C.s2 - 0.7], n200: ['mid', C.n200 - 0.4],
    focus: ['mid', C.focus], n14: ['mid', C.s3 - 0.7], brazil: ['mid', C.brazil], sachar: ['mid', C.sachar - 0.2], khali: ['mid', C.khali],
    x3: ['mid', C.teenguna], cease: ['mid', C.ceasefire], x3b: ['mid', C.s5 - 0.7], '8yr': ['mid', C.s6 - 0.7], n15: ['mid', C.n15b - 0.2],
    two: ['mid', C.do6], lfp: ['mid', C.lfp], q1: ['q', C.intezaar], q2: ['q2', C.vaar], galat: ['side', C.galat],
    radioset: ['card', C.report1], unef: ['card', C.battalions], doc: ['card', C.res242], inset: ['card', C.bharat6 - 0.2], profile: ['card', C.unchai - 0.2],
    treaty: ['card', C.n1979], lossIL: ['statL', C.il_loss], lossAR: ['statR', C.arab_loss],
  };
  const specs: { key: string; n: React.ReactNode; slot?: string; start?: number }[] = [];
  const O = (key: string, n: React.ReactNode) => {
    const sl = SLOT[key] ?? SLOT[key.replace(/\d+$/, '')];
    specs.push({ key, n, slot: sl?.[0], start: sl?.[1] });
  };
  const over: React.ReactNode[] = [];
  const cx = W / 2, top = portrait ? H * 0.16 : H * 0.14;
  // hook
  O('stamp6', <Stamp x={portrait ? cx : W * 0.27} y={portrait ? H * 0.62 : H * 0.8} u={u} p={t < C.june67 ? 1 : 1 - ramp(t, C.june67, C.june67 + 0.4)} text="सिर्फ़ 6 दिन" color="#ffd23f" rot={-6} />);
  O('june67', <DateCard x={cx - 130 * u} y={top - 40 * u} u={u} text="जून 1967" p={w(C.june67, C.june67 + 0.3, C.israel0 + 1.5, C.israel0 + 2)} flip={ramp(t, C.june67, C.june67 + 0.4)} />);
  sideFlags.forEach(([s, at, a, b]) => {
    const [x, y] = prj(FLAGAT[at]);
    const p = w(a, a + 0.3, Math.max(b, C.faisla0), C.faisla0 + 0.5);
    if (p > 0) O(`fl${s}`, <img src={flagURL(s)} style={{ position: 'absolute', left: x - 60 * u, top: y - 110 * u + (1 - easeOut(ramp(t, a, a + 0.35))) * -80 * u, width: 120 * u, height: 80 * u, border: `${3 * u}px solid #fff`, opacity: p, boxShadow: `0 ${10 * u}px ${20 * u}px rgba(0,0,0,0.6)` }} />);
  });
  O('3h', <BigNum x={cx} y={H * 0.45} u={u} p={w(C.teen0 - 0.1, C.teen0 + 0.2, C.aaj0, C.aaj0 + 0.4)} value="3 घंटे" />);
  // ch 1
  const [ax, ay] = prj('netanya'), [bx, by] = prj([35.01, 32.31]);
  O('m15', <Measure a={[ax, ay]} b={[bx, by]} u={u} p={w(C.km15 - 0.4, C.km15 + 0.5, C.egypt1 - 0.3, C.egypt1)} text="~15 किमी" />);
  O('y48', <DateCard x={cx - 220 * u} y={top} u={u} text="1948" p={w(C.n1948, C.n1948 + 0.3, C.golabari1, C.golabari1 + 0.4)} flip={ramp(t, C.n1948, C.n1948 + 0.4)} />);
  O('y56', <DateCard x={cx + 40 * u} y={top} u={u} text="1956" p={w(C.n1956, C.n1956 + 0.3, C.golabari1, C.golabari1 + 0.4)} flip={ramp(t, C.n1956, C.n1956 + 0.4)} />);
  // ch 2
  const cairoP = prj('cairo');
  O('radio1', <Radio a={[W * 0.88, -40 * u]} b={cairoP} u={u} p={w(C.report1, C.report1 + 0.4, C.galat, C.galat + 0.5)} t={t} color="#ff8a7a" />);
  if (t > C.report1 - 0.2 && t < C.galat + 1.5) O('ussr', <div style={{ position: 'absolute', right: 70 * u, top: 60 * u, opacity: w(C.report1, C.report1 + 0.4, C.galat + 1, C.galat + 1.5), textAlign: 'center' }}><img src={flagURL('su')} style={{ width: 120 * u, height: 80 * u, border: `${3 * u}px solid #fff` }} /><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 30 * u, color: '#fff', textShadow: '0 2px 8px #000' }}>मॉस्को</div></div>);
  if (t > C.report1 - 0.2 && t < C.galat + 1.5) O('radioset', <div style={{ position: 'absolute', left: portrait ? W * 0.1 : W * 0.06, top: portrait ? H * 0.58 : H * 0.5, width: (portrait ? 380 : 330) * u, opacity: w(C.report1, C.report1 + 0.4, C.galat + 1, C.galat + 1.5) }}><Img src={staticFile('sixday/img/r_radio_set.webp')} style={{ width: '100%', filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))' }} /></div>);
  O('galat', <Stamp x={portrait ? W * 0.33 : W * 0.17} y={portrait ? H * 0.64 : H * 0.62} u={u} p={w(C.galat, C.galat + 0.1, C.galat + 1.4, C.galat + 1.8)} text="ग़लत" />);
  O('may14', <DateCard x={cx - 110 * u} y={top} u={u} text="14 मई" p={w(C.may14, C.may14 + 0.3, C.cairo, C.cairo + 0.4)} flip={ramp(t, C.may14, C.may14 + 0.4)} />);
  O('may18', <DateCard x={cx - 110 * u} y={top} u={u} text="18 मई" p={w(C.may18, C.may18 + 0.3, C.redsea1, C.redsea1 + 0.4)} flip={ramp(t, C.may18, C.may18 + 0.4)} />);
  if (t > C.bharat1 - 0.3 && t < C.hatana1 + 1) { const [x, y] = prj([34.5, 31.0], D * 0.03); O('inunef', <img src={flagURL('in')} style={{ position: 'absolute', left: x - 50 * u, top: y - 100 * u, width: 100 * u, height: 66 * u, border: `${3 * u}px solid #fff`, opacity: w(C.bharat1, C.bharat1 + 0.3, C.hatana1 + 0.5, C.hatana1 + 1) }} />); }
  { const [x, y] = prj([34.7, 30.6]); O('uthant', <Portrait bounds={[W, H]} x={x} y={y} u={u} name="ऊ थांट" en="U THANT" role="UN महासचिव" pic="q_u_thant" p={w(C.may18 + 0.2, C.may18 + 0.7, C.redsea1, C.redsea1 + 0.4)} />); }
  // Short 1
  O('d1957', <DateCard x={cx - 110 * u} y={top} u={u} text="1957" sub="इज़राइल की चेतावनी" p={w(C.n1957b, C.n1957b + 0.3, C.may22 - 0.3, C.may22)} flip={ramp(t, C.n1957b, C.n1957b + 0.4)} />);
  O('elaan', <Stamp x={cx} y={portrait ? H * 0.56 : H * 0.78} u={u} p={w(C.elaan1, C.elaan1 + 0.1, C.may22 - 0.4, C.may22)} text="जंग का ऐलान" />);
  const dates: [number, string][] = [[C.may22, '22 मई 1967'], [C.may30, '30 मई'], [C.june4, '4 जून'], [C.june5a, '5 जून']];
  dates.forEach(([d0, txt], i) => { const d1 = i < 3 ? dates[i + 1][0] : C.jal + 1; O(`dt${i}`, <DateCard x={cx - 140 * u} y={top - 30 * u} u={u} text={txt} p={w(d0, d0 + 0.2, d1 - 0.05, d1 + 0.1)} flip={ramp(t, d0, d0 + 0.35)} />); });
  { const [x, y] = prj([34.0, 28.2]); O('nasser1', <Portrait bounds={[W, H]} x={x} y={y} u={u} name="नासिर" en="GAMAL ABDEL NASSER" role="राष्ट्रपति, इजिप्ट" pic="q_nasser" side="eg" p={w(C.nasser - 0.2, C.nasser + 0.3, C.ulti, C.ulti + 0.4)} />); }
  O('band', <Stamp x={cx} y={H * 0.36} u={u} p={w(C.nahi_guzrenge, C.nahi_guzrenge + 0.1, C.ulti - 0.2, C.ulti + 0.2)} text="बंद" />);
  { const [x1, y1] = prj('cairo'), [x2, y2] = prj('amman');
    O('pactR', <Radio a={[x2, y2]} b={[x1, y1]} u={u} p={w(C.may30 + 0.2, C.may30 + 0.6, C.june4 - 0.5, C.june4 - 0.1)} t={t} />);
    O('nasser2', <Portrait bounds={[W, H]} x={x1} y={y1} u={u} scale={0.8} name="नासिर" en="NASSER" role="इजिप्ट" pic="q_nasser" side="eg" p={w(C.may30, C.may30 + 0.5, C.june4 - 0.5, C.june4 - 0.1)} />);
    O('hussein', <Portrait bounds={[W, H]} x={x2} y={y2} u={u} scale={0.8} name="किंग हुसैन" en="KING HUSSEIN" role="जॉर्डन" pic="q_hussein" side="jo" p={w(C.may30 + 0.3, C.may30 + 0.8, C.june4 - 0.5, C.june4 - 0.1)} />); }
  { const [x, y] = prj('jerusalem'); O('eshkol', <Portrait bounds={[W, H]} x={x} y={y} u={u} name="लेवी एशकोल" en="LEVI ESHKOL" role="प्रधानमंत्री, इज़राइल" pic="q_eshkol" side="il" p={w(C.june4 + 0.1, C.june4 + 0.6, C.june5a, C.june5a + 0.3)} />); }
  // ch 3
  O('br_res', <Breather W={W} H={H} u={u} pic="h_reservists" p={w(C.reservists - 0.3, C.reservists + 0.4, C.ruk + 0.3, C.ruk + 0.9)} t={t - C.reservists} dur={8} portrait={portrait} />);
  { const [x, y] = prj('tel_aviv'); O('dayan', <Portrait bounds={[W, H]} x={x} y={y} u={u} name="मोशे दयान" en="MOSHE DAYAN" role="रक्षा मंत्री, इज़राइल" pic="q_dayan" side="il" p={w(C.dayan - 0.2, C.dayan + 0.3, C.vaar + 0.6, C.raat)} />); }
  O('q1', <Stamp x={W * 0.32} y={H * 0.3} u={u} size={0.6} rot={-4} color="#e8e2d0" p={w(C.intezaar, C.intezaar + 0.1, C.raat, C.raat + 0.3)} text="इंतज़ार?" />);
  O('q2', <Stamp x={W * 0.68} y={H * 0.3} u={u} size={0.6} rot={4} color="#ff5a4a" p={w(C.vaar, C.vaar + 0.1, C.raat, C.raat + 0.3)} text="पहला वार?" />);
  O('night', <DateCard x={cx - 140 * u} y={top} u={u} text="4 जून" sub="रात" p={w(C.raat, C.raat + 0.3, C.bridge2 + 2, C.bridge2 + 2.5)} flip={ramp(t, C.raat, C.raat + 0.4)} />);
  // Short 2
  O('3h2', <BigNum x={cx} y={portrait ? H * 0.32 : H * 0.3} u={u} p={hookP(C.s2, C.teen2 + 1.2, C.t745)} value="3 घंटे" label="और जंग का फ़ैसला" color="#ffd23f" />);
  const mm = 45 + Math.max(0, t - C.t745) * 0.9;
  O('clock', <Clock x={portrait ? W * 0.24 : W * 0.12} y={portrait ? H * 0.2 : H * 0.22} u={u} p={w(C.t745 - 0.2, C.t745 + 0.3, C.n200, C.n200 + 0.4)} hh={7 + Math.floor(mm / 60)} mm={mm % 60} label={`0${7 + Math.floor(mm / 60)}:${String(Math.floor(mm % 60)).padStart(2, '0')}`} />);
  O('d5j', <DateCard x={portrait ? W * 0.52 : W * 0.75} y={top - 40 * u} u={u} text="5 जून 1967" p={w(C.t745, C.t745 + 0.3, C.tabhi, C.tabhi + 0.4)} flip={ramp(t, C.t745, C.t745 + 0.4)} />);
  if (t > C.neeche - 0.3 && t < C.runway) {
    const [x, y] = prj([31.9, 31.15]);
    const p = w(C.neeche, C.neeche + 0.3, C.runway - 0.5, C.runway);
    O('radar', <div style={{ position: 'absolute', left: x - 180 * u, top: y - 180 * u, width: 360 * u, height: 360 * u, borderRadius: '50%', opacity: p * 0.9,
      background: `conic-gradient(from ${t * 220}deg, rgba(90,255,140,0.45), rgba(90,255,140,0) 25%)`, border: `${3 * u}px solid rgba(90,255,140,0.7)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360 * u, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 30 * u, color: '#9dffb3', textShadow: '0 2px 8px #000' }}>रडार: कुछ नहीं दिखा</div></div>);
  }

  const n200 = Math.round(200 * easeOut(ramp(t, C.n200 - 0.4, C.n200 + 1.6)));
  O('n200', <BigNum x={cx} y={H * 0.42} u={u} p={w(C.n200 - 0.4, C.n200, C.lehar2 + 0.6, C.lehar2 + 1)} value={`~${n200}`} label="इजिप्शियन जहाज़, ज़मीन पर ही" color="#ffd23f" />);
  O('br_smoke', <Breather W={W} H={H} u={u} pic="h_airfield_smoke" p={w(C.dopahar - 0.3, C.dopahar + 0.3, C.jordsyr - 0.3, C.jordsyr + 0.2)} t={t - C.dopahar} dur={4} portrait={portrait} />);
  O('focus', <Stamp x={cx} y={portrait ? H * 0.56 : H * 0.78} u={u} p={w(C.focus, C.focus + 0.1, C.aasman, C.aasman + 0.3)} text="OPERATION FOCUS" color="#ffd23f" />);
  // Short 3
  O('n14', <BigNum x={cx} y={portrait ? H * 0.3 : H * 0.28} u={u} p={Math.max(hookP(C.s3, C.lada + 0.8, C.lada + 1.4), w(C.n14b, C.n14b + 0.3, C.brazil + 1.4, C.brazil + 1.8))} value="14" label="भारतीय जवान शहीद" />);
  if (t > C.s3 - 0.2 && t < C.lada + 1.5) { const [x, y] = prj([34.38, 31.42], D * 0.03); O('inflag3', <img src={flagURL('in')} style={{ position: 'absolute', left: x - 45 * u, top: y - 95 * u, width: 90 * u, height: 60 * u, border: `${3 * u}px solid #fff`, opacity: hookP(C.s3, C.lada + 0.8, C.lada + 1.4) }} />); }
  if (t > C.battalions - 0.3 && t < C.hatana3 + 1) {
    const p = w(C.battalions, C.battalions + 0.3, C.hatana3 + 0.3, C.hatana3 + 0.8);
    O('unef', <div style={{ position: 'absolute', left: portrait ? W * 0.08 : W * 0.06, top: portrait ? H * 0.18 : H * 0.12, opacity: p, display: 'flex', gap: 14 * u, alignItems: 'center', background: 'rgba(10,20,35,0.75)', padding: `${12 * u}px ${18 * u}px`, borderRadius: 10 * u, border: `${2 * u}px solid #7fb2ff` }}>
      <img src={flagURL('un')} style={{ width: 90 * u, height: 60 * u }} /><img src={flagURL('in')} style={{ width: 90 * u, height: 60 * u, border: `${2 * u}px solid #fff` }} />
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 30 * u, color: '#fff' }}>UNEF<br /><span style={{ fontSize: 22 * u, color: '#bcd4ff' }}>1957 से, भारत की बटालियनें</span></div></div>);
  }
  if (t > C.ghar - 0.3 && t < C.chhid + 0.5) { const [x, y] = prj([33.5, 31.7]); O('ghar', <div style={{ position: 'absolute', left: x - 200 * u, top: y - 60 * u, width: 400 * u, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 40 * u, color: '#fff', textShadow: '0 2px 10px #000', opacity: w(C.ghar, C.ghar + 0.3, C.chhid, C.chhid + 0.3) }}>← घर, भारत</div>); }
  if (t > C.brazil - 0.2 && t < C.sachar + 0.5) O('brazil', <div style={{ position: 'absolute', left: cx - 160 * u, top: portrait ? H * 0.42 : H * 0.48, width: 320 * u, textAlign: 'center', opacity: w(C.brazil, C.brazil + 0.3, C.sachar - 0.2, C.sachar + 0.2) }}><img src={flagURL('br')} style={{ width: 84 * u, height: 56 * u, border: `${2 * u}px solid #fff` }} /><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 30 * u, color: '#fff', textShadow: '0 2px 8px #000' }}>+1 ब्राज़ील</div></div>);
  O('sachar', <NameCard x={cx} y={portrait ? H * 0.36 : H * 0.3} u={u} p={w(C.sachar - 0.2, C.sachar + 0.4, C.topi + 1.6, C.topi + 2.2)} lines={['कैप्टन विजय सचर', 'CAPT. VIJAY SACHAR', 'UNEF · ग़ाज़ा, जून 1967']} />);
  // ch 5
  O('br_tanks', <Breather W={W} H={H} u={u} pic="h_tanks_dust" p={w(C.teendiv - 0.3, C.teendiv + 0.2, C.uttar - 0.4, C.uttar)} t={t - C.teendiv} dur={2.5} portrait={portrait} />);
  { const [x, y] = prj('abu_ageila'); O('sharon', <Portrait bounds={[W, H]} x={x + 120 * u} y={y} u={u} name="एरियल शेरॉन" en="ARIEL SHARON" role="डिवीज़न कमांडर" pic="q_sharon" side="il" p={w(C.sharon - 0.2, C.sharon + 0.3, C.dakshin, C.dakshin + 0.4)} />); }
  O('d6j', <DateCard x={cx - 110 * u} y={top} u={u} text="6 जून" p={w(C.june6, C.june6 + 0.3, C.jaldi + 0.5, C.jaldi + 0.9)} flip={ramp(t, C.june6, C.june6 + 0.4)} />);
  { const [x1, y1] = prj('cairo'), [x2, y2] = prj([33.4, 30.4]); O('order', <Radio a={[x1, y1]} b={[x2, y2]} u={u} p={w(C.june6 + 0.2, C.june6 + 0.6, C.phansi, C.phansi + 0.4)} t={t} color="#ff8a7a" />); }
  O('khali', <Stamp x={portrait ? cx : W * 0.27} y={portrait ? H * 0.56 : H * 0.78} u={u} size={0.8} p={w(C.khali, C.khali + 0.1, C.jaldi + 1.2, C.jaldi + 1.6)} text="सिनाई ख़ाली करो" />);
  O('br_pass', <Breather W={W} H={H} u={u} pic="h_mountain_pass" p={w(C.phansi - 0.2, C.phansi + 0.3, C.mitla + 0.4, C.mitla + 0.9)} t={t - C.phansi} dur={3} portrait={portrait} />);
  O('d8j', <DateCard x={cx - 110 * u} y={top} u={u} text="8 जून" p={w(C.june8, C.june8 + 0.3, C.teenguna, C.teenguna + 0.4)} flip={ramp(t, C.june8, C.june8 + 0.4)} />);
  O('x3', <BigNum x={portrait ? cx : W * 0.78} y={portrait ? H * 0.3 : H * 0.32} u={u} p={w(C.teenguna, C.teenguna + 0.3, C.ch6 - 0.6, C.ch6)} value="~3×" label="सिनाई ≈ इज़राइल × 3" color="#ffd23f" />);
  // ch 6
  O('br_streets', <Breather W={W} H={H} u={u} pic="h_stone_streets" p={w(C.sadak - 0.3, C.sadak + 0.3, C.june7 + 0.5, C.june7 + 0.9)} t={t - C.sadak} dur={3} portrait={portrait} />);
  O('d7j', <DateCard x={cx - 110 * u} y={top} u={u} text="7 जून" p={w(C.june7 + 0.3, C.june7 + 0.6, C.nadi, C.nadi + 0.4)} flip={ramp(t, C.june7 + 0.3, C.june7 + 0.7)} />);
  // Short 4
  O('d9j', <DateCard x={cx - 110 * u} y={top} u={u} text="9 जून" p={w(C.june9, C.june9 + 0.3, C.chadhai, C.chadhai + 0.3)} flip={ramp(t, C.june9, C.june9 + 0.4)} />);
  O('br_golan', <Breather W={W} H={H} u={u} pic="h_golan_slope" p={w(C.chadhai - 0.1, C.chadhai + 0.4, C.chadhai + 2.6, C.chadhai + 3.0)} t={t - C.chadhai} dur={3} portrait={portrait} />);
  O('d10j', <DateCard x={cx - 110 * u} y={top} u={u} text="10 जून" p={w(C.june10, C.june10 + 0.3, C.aajbhi, C.aajbhi + 0.3)} flip={ramp(t, C.june10, C.june10 + 0.4)} />);
  O('cease', <Stamp x={cx} y={portrait ? H * 0.58 : H * 0.8} u={u} size={0.8} color="#ffffff" p={w(C.ceasefire, C.ceasefire + 0.1, C.aajbhi, C.aajbhi + 0.3)} text="युद्धविराम · CEASEFIRE" />);
  if (t > C.aajbhi - 0.2 && t < C.unchai) {
    const [x, y] = prj([35.78, 33.02], D * 0.02), p = w(C.aajbhi, C.aajbhi + 0.3, C.unchai - 0.4, C.unchai);
    O('golanflags', <div style={{ position: 'absolute', left: x - 140 * u, top: y - 140 * u, width: 280 * u, display: 'flex', justifyContent: 'space-between', opacity: p }}>
      <div style={{ textAlign: 'center' }}><img src={flagURL('il')} style={{ width: 110 * u, height: 74 * u, border: `${3 * u}px solid #fff` }} /><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 22 * u, color: '#fff', textShadow: '0 2px 6px #000' }}>क़ब्ज़ा</div></div>
      <div style={{ textAlign: 'center', opacity: ramp(t, C.apna - 0.2, C.apna + 0.3) }}><img src={flagURL('sy')} style={{ width: 110 * u, height: 74 * u, border: `${3 * u}px solid #fff` }} /><div style={{ fontFamily: UI, fontWeight: 800, fontSize: 22 * u, color: '#fff', textShadow: '0 2px 6px #000' }}>दावा</div></div></div>);
  }
  O('profile', <GolanProfile u={u} W={W} H={H} p={w(C.unchai - 0.2, C.unchai + 0.8, C.keemti + 2.5, C.keemti + 3)} portrait={portrait} />);
  // Short 5
  O('x3b', <BigNum x={cx} y={portrait ? H * 0.28 : H * 0.24} u={u} p={Math.max(hookP(C.s5, C.teenguna5 + 1.4, C.subah5), w(C.kabza, C.kabza + 0.3, C.keemat - 0.2, C.keemat + 0.2))} value="3× से ज़्यादा" label="6 दिन में इज़राइल के क़ब्ज़े का इलाक़ा" color="#ffd23f" size={0.8} />);
  const [ax2, ay2] = prj('netanya'), [bx2, by2] = prj([35.01, 32.31]);
  O('m15b', <Measure a={[ax2, ay2]} b={[bx2, by2]} u={u} p={w(C.km15b - 0.4, C.km15b + 0.4, C.shaam, C.shaam + 0.3)} text="~15 किमी" />);
  O('d10s', <DateCard x={cx - 140 * u} y={top - 30 * u} u={u} text="10 जून" sub="शाम" p={w(C.shaam, C.shaam + 0.3, C.kabza, C.kabza + 0.4)} flip={ramp(t, C.shaam, C.shaam + 0.4)} />);
  const lossP = w(C.keemat, C.keemat + 0.3, C.hamesha, C.hamesha + 0.4);
  if (lossP > 0) {
    const lx = portrait ? W * 0.08 : W * 0.12, rx = portrait ? W * 0.08 : W * 0.6, ly = portrait ? H * 0.2 : H * 0.3, ry = portrait ? H * 0.34 : H * 0.3;
    O('lossT', <div style={{ position: 'absolute', left: 0, right: 0, top: portrait ? H * 0.12 : H * 0.14, textAlign: 'center', opacity: lossP, fontFamily: CARDF, fontSize: 52 * u, color: '#fff', textShadow: '0 3px 12px #000' }}>क़ीमत</div>);
    O('lossIL', <Stat x={lx} y={ly} u={u} p={w(C.il_loss, C.il_loss + 0.4, C.hamesha, C.hamesha + 0.4)} value="~800–1,000" label="इज़राइल के सैनिक" side="il" />);
    O('lossAR', <Stat x={rx} y={ry} u={u} p={w(C.arab_loss, C.arab_loss + 0.4, C.hamesha, C.hamesha + 0.4)} value="15–20 हज़ार" label="अरब देशों के (अंदाज़ा)" side="eg" color="#ff9a7a" />);
    if (t > C.arab_loss) O('arabflags', <div style={{ position: 'absolute', left: rx + (portrait ? 0 : 0), top: ry + 130 * u, display: 'flex', gap: 10 * u, opacity: w(C.arab_loss + 0.3, C.arab_loss + 0.7, C.hamesha, C.hamesha + 0.4) }}><img src={flagURL('jo')} style={{ width: 66 * u, height: 44 * u }} /><img src={flagURL('sy')} style={{ width: 66 * u, height: 44 * u }} /></div>);
  }
  O('y82', <DateCard x={cx - 110 * u} y={top} u={u} text="1982" sub="सिनाई वापस इजिप्ट को" p={w(C.n1982a, C.n1982a + 0.3, C.n2005, C.n2005 + 0.3)} flip={ramp(t, C.n1982a, C.n1982a + 0.4)} />);
  O('y05', <DateCard x={cx - 110 * u} y={top} u={u} text="2005" sub="इज़राइल ग़ाज़ा से हटा" p={w(C.n2005, C.n2005 + 0.3, C.khula, C.khula + 0.3)} flip={ramp(t, C.n2005, C.n2005 + 0.4)} />);
  if (t > C.khula - 0.2 && t < C.bridge5 + 0.5) { for (const [k2, at] of [['qw', [35.3, 32.05]], ['qg', [35.78, 33.03]]] as [string, [number, number]][]) { const [x, y] = prj(at, D * 0.02); O(k2, <div style={{ position: 'absolute', left: x - 50 * u, top: y - 150 * u, width: 100 * u, textAlign: 'center', fontFamily: NUMF, fontSize: 110 * u, color: '#ffd23f', textShadow: '0 4px 14px #000', opacity: w(C.khula, C.khula + 0.3, C.bridge5, C.bridge5 + 0.4), transform: `translateY(${Math.sin(t * 3) * 6 * u}px)` }}>?</div>); } }
  // Short 6
  O('8yr', <BigNum x={cx} y={portrait ? H * 0.26 : H * 0.22} u={u} p={hookP(C.s6, C.aathsaal + 1.4, C.beechraaste)} value="8 साल" label="15 जहाज़, एक झील में फँसे" color="#ffd23f" size={0.85} />);
  const yr = 1967 + Math.floor(8 * ramp(t, C.mahine, C.yellow + 1, linear));
  O('yrs', <DateCard x={portrait ? W * 0.62 : W * 0.78} y={top - 30 * u} u={u} text={String(yr)} p={w(C.mahine, C.mahine + 0.3, C.bharat6, C.bharat6 + 0.4)} flip={1} />);
  O('n15', <BigNum x={portrait ? cx : W * 0.22} y={portrait ? H * 0.25 : H * 0.3} u={u} p={w(C.n15b - 0.2, C.n15b + 0.2, C.kinara_il, C.kinara_il + 0.4)} value="15" label="जहाज़ अंदर फँसे" size={0.8} />);
  O('br_party', <Breather W={W} H={H} u={u} pic="h_ships_party" p={w(C.club - 0.3, C.club + 0.3, C.reth - 0.2, C.reth + 0.3)} t={t - C.club} dur={5} caption="1968: Great Bitter Lake के अपने Olympics" portrait={portrait} />);
  O('inset', <WorldInset u={u} W={W} H={H} p={w(C.bharat6 - 0.2, C.bharat6 + 0.4, C.khuli - 0.3, C.khuli + 0.2)} t0={C.bharat6} t={t} portrait={portrait} />);
  O('y75', <DateCard x={cx - 140 * u} y={top - 30 * u} u={u} text="जून 1975" sub="नहर फिर खुली" p={w(C.khuli, C.khuli + 0.3, C.ghar6 + 1, C.ghar6 + 1.4)} flip={ramp(t, C.khuli, C.khuli + 0.4)} />);
  O('two', <BigNum x={portrait ? cx : W * 0.76} y={portrait ? H * 0.5 : H * 0.6} u={u} p={w(C.do6, C.do6 + 0.3, C.ghar6 + 1.2, C.ghar6 + 1.6)} value="15 में से 2" label="अपने इंजन से घर" size={0.7} />);
  // ch 8
  O('d242', <DateCard x={cx - 160 * u} y={top - 30 * u} u={u} text="22 नवंबर 1967" p={w(C.nov22, C.nov22 + 0.3, C.res242, C.res242 + 0.3)} flip={ramp(t, C.nov22, C.nov22 + 0.4)} />);
  if (t > C.res242 - 0.3 && t < C.khartoum + 0.4) {
    const p = w(C.res242, C.res242 + 0.4, C.khartoum - 0.3, C.khartoum + 0.2);
    O('doc', <div style={{ position: 'absolute', left: portrait ? W * 0.12 : W * 0.31, top: portrait ? H * 0.22 : H * 0.1, width: portrait ? W * 0.76 : W * 0.38, opacity: p, transform: `translateY(${(1 - easeOut(clamp01(p))) * 80 * u}px) rotate(-2deg)` }}>
      <Img src={staticFile('sixday/img/d_document_seal.webp')} style={{ width: '100%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }} />
      <div style={{ position: 'absolute', left: '22%', right: '22%', top: '18%', textAlign: 'center', fontFamily: ENF, fontWeight: 900, fontSize: 40 * u, color: '#2a2219' }}>UN RESOLUTION 242</div>
      <div style={{ position: 'absolute', left: '20%', right: '20%', top: '34%', textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 32 * u, color: '#3b2f22', opacity: ramp(t, C.lautao, C.lautao + 0.5) }}>ज़मीन लौटाओ ⇄ सुरक्षित सीमा</div></div>);
    O('lfp', <Stamp x={cx} y={portrait ? H * 0.6 : H * 0.72} u={u} size={0.75} color="#2f8f5b" p={w(C.lfp, C.lfp + 0.1, C.khartoum - 0.3, C.khartoum + 0.1)} text="LAND FOR PEACE" />);
  }
  O('radioK', <Radio a={[W * 0.25, H + 40 * u]} b={[W * 0.5, H * 0.55]} u={u} p={w(C.khartoum, C.khartoum + 0.4, C.teenna + 0.5, C.teenna + 1)} t={t} color="#ffb070" />);
  O('khlabel', <div style={{ position: 'absolute', left: W * 0.25 - 160 * u, top: H - 90 * u, width: 320 * u, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 34 * u, color: '#fff', textShadow: '0 2px 8px #000', opacity: w(C.khartoum, C.khartoum + 0.4, C.teenna + 0.5, C.teenna + 1) }}>↓ ख़ार्तूम, सितंबर 1967</div>);
  ([[C.na1, 'शांति', -0.25], [C.na2, 'मान्यता', 0], [C.na3, 'बातचीत', 0.25]] as [number, string, number][]).forEach(([n0, word, dx], i) =>
    O(`no${i}`, <Stamp x={cx + dx * (portrait ? W * 0.9 : W * 0.6)} y={portrait ? H * (0.34 + i * 0.09) : H * 0.4} u={u} size={0.55} rot={-6 + i * 5} p={w(n0, n0 + 0.1, C.n1973 - 0.3, C.n1973)} text={`न ${word}`} />));
  O('y73', <DateCard x={cx - 110 * u} y={top} u={u} text="1973" p={w(C.n1973, C.n1973 + 0.3, C.baatcheet + 0.5, C.baatcheet + 0.9)} flip={ramp(t, C.n1973, C.n1973 + 0.4)} />);
  if (t > C.n1979 - 0.3 && t < C.n1982b + 1.5) {
    const p = w(C.n1979, C.n1979 + 0.3, C.n1982b + 0.8, C.n1982b + 1.3), k = easeOut(ramp(t, C.n1979, C.n1979 + 1.2));
    O('treaty', <div style={{ position: 'absolute', left: cx - 260 * u, top: portrait ? H * 0.24 : H * 0.18, width: 520 * u, height: 140 * u, opacity: p }}>
      <img src={flagURL('eg')} style={{ position: 'absolute', left: lerp(0, 120, k) * u, top: 0, width: 150 * u, height: 100 * u, border: `${3 * u}px solid #fff` }} />
      <img src={flagURL('il')} style={{ position: 'absolute', right: lerp(0, 120, k) * u, top: 0, width: 150 * u, height: 100 * u, border: `${3 * u}px solid #fff` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110 * u, textAlign: 'center', fontFamily: UI, fontWeight: 800, fontSize: 30 * u, color: '#fff', textShadow: '0 2px 8px #000', opacity: k }}>1979: शांति समझौता</div></div>);
  }
  O('y82b', <DateCard x={cx - 110 * u} y={top + (portrait ? 0 : 160 * u)} u={u} text="1982" sub="पूरा सिनाई वापस" p={w(C.n1982b, C.n1982b + 0.3, C.close, C.close + 0.3)} flip={ramp(t, C.n1982b, C.n1982b + 0.4)} />);
  // close: back to frame 0's picture
  O('stampEnd', <Stamp x={portrait ? cx : W * 0.27} y={portrait ? H * 0.62 : H * 0.8} u={u} p={ramp(t, C.chhahdin9, C.chhahdin9 + 0.3)} text="सिर्फ़ 6 दिन" color="#ffd23f" rot={-6} />);

  // chapter titles (long video only)
  const CH: [number, string, string][] = [[C.ch1, 'अध्याय 1', 'नक़्शा'], [C.ch2, 'अध्याय 2', 'मई 1967'], [C.gali1 + 1.5, 'अध्याय 3', 'तिरान की गली'], [C.ch3, 'अध्याय 4', 'इंतज़ार'],
    [C.gasht, 'अध्याय 5', '3 घंटे'], [C.neeli, 'अध्याय 6', 'ग़ाज़ा के भारतीय जवान'], [C.ch5, 'अध्याय 7', 'सिनाई'], [C.ch6, 'अध्याय 8', 'यरूशलम और वेस्ट बैंक'],
    [C.maalik + 0.5, 'अध्याय 9', 'गोलान'], [C.subah5 + 0.6, 'अध्याय 10', '6 दिन का नक़्शा'], [C.beechraaste + 0.6, 'अध्याय 11', 'येलो फ़्लीट'], [C.ch8, 'अध्याय 12', 'जंग के बाद']];

  g.fire = BLASTS.map(([b0, at, k]) => blastLight(h, at, D * k, t - b0)).filter((x): x is [number, number, number, number] => !!x).sort((a, b) => b[3] - a[3]).slice(0, 8);
  g.wakes = wakes.slice(0, 16);
  for (const sp of specs) {
    let k = 1;
    if (sp.slot) {
      const nexts = specs.filter((q) => q.slot === sp.slot && (q.start ?? 0) > (sp.start ?? 0)).map((q) => q.start as number);
      if (nexts.length) { const nx = Math.min(...nexts); k = 1 - ramp(t, nx - 0.3, nx - 0.02); }
    }
    if (k > 0.001) over.push(<div key={sp.key} style={{ position: 'absolute', inset: 0, opacity: k }}>{sp.n}</div>);
  }
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Grade width={W} id={gid}>
        <World h={h} cam={cam} width={W} height={H} g={g}>
          {cities}{labels}{units.map((uu, i) => <Unit key={`u${i}`} h={h} u={uu} />)}{arrows}{props}{m3}{brackets}{jets}{blasts}
        </World>
      </Grade>
      <AbsoluteFill>{over}</AbsoluteFill>
      {long && CH.map(([c0, n, title]) => <Chapter key={n} u={u} n={n} title={title} p={window4(t, c0 + 0.3, c0 + 0.9, c0 + 3.0, c0 + 3.5)} W={W} H={H} />)}
      {/* the desk diorama opens chapter 1 */}
      {long && t > C.ch1 - 1.6 && t < C.ch1 + 3.4 && (
        <AbsoluteFill style={{ opacity: window4(t, C.ch1 - 1.5, C.ch1 - 0.9, C.ch1 + 2.4, C.ch1 + 3.3) }}>
          <Img src={staticFile('sixday/img/x_desk_diorama.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.12 * ramp(t, C.ch1 - 1.5, C.ch1 + 3.3, linear)})` }} />
          <div style={{ position: 'absolute', right: 16 * u, bottom: 12 * u, fontFamily: ENF, fontSize: 13 * u, color: 'rgba(255,255,255,0.7)' }}>AI illustration</div>
        </AbsoluteFill>
      )}
      {caps && <Captions caps={T.caps} t={t} W={W} H={H} u={u} from={caps[0]} to={caps[1]} />}
    </AbsoluteFill>
  );
};
