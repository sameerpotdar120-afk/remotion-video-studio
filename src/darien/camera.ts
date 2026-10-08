import { Ease, easeIn, easeOut, inOut, lerp, linear } from './anim';
import { GEO } from './geo';

/**
 * One continuous virtual camera over an equirectangular world.
 * span = degrees of latitude visible over the 1920px frame height.
 */
export type Cam = { lon: number; lat: number; span: number; rot: number; tilt: number };
type Key = Partial<Cam> & { t: number; e?: Ease };

/** The world plane is larger than the frame so rotation and tilt never show its edges. */
export const PLANE = { w: 1700, h: 3200, ox: 850, oy: 1900 };

const [rlon, rlat] = GEO.regionCenter;
const arrowMid: [number, number] = [
  (GEO.arrow[0][0] + GEO.arrow[1][0]) / 2,
  (GEO.arrow[0][1] + GEO.arrow[1][1]) / 2,
];

const KEYS: Key[] = [
  // Hook: Alaska, follow the highway south, whole continent
  { t: 0, lon: -148, lat: 63.5, span: 26, rot: -6, tilt: 0 },
  { t: 1.7, lon: -122, lat: 47, span: 52, rot: -3, e: inOut },
  { t: 3.5, lon: -96, lat: 18, span: 96, rot: 0, e: inOut },
  { t: 4.7, lon: -93, lat: 15, span: 88, e: linear },
  // "पर एक जंगल" push toward the gap
  { t: 5.6, lon: -78.8, lat: 8.6, span: 24, rot: 5, e: inOut },
  { t: 7.9, lon: -78.4, lat: 8.4, span: 19, rot: 6, e: linear },
  // North / South America flashes
  { t: 8.7, lon: -88, lat: 12, span: 112, rot: 0, e: inOut },
  { t: 12.8, lon: -87, lat: 11, span: 98, e: linear },
  // dive onto the Darién
  { t: 14.4, lon: rlon, lat: rlat, span: 4.3, rot: 14, e: inOut },
  { t: 20.3, lon: rlon, lat: rlat, span: 3.7, rot: 16, e: linear },
  // world's longest road
  { t: 21.3, lon: -84, lat: 12, span: 72, rot: 0, e: inOut },
  { t: 22.4, lon: -84.5, lat: 12.5, span: 66, e: linear },
  { t: 23.3, lon: -77.1, lat: 8.2, span: 9, rot: -4, e: inOut },
  { t: 26.4, lon: -77.1, lat: 8.2, span: 7.6, rot: -6, e: linear },
  // dark mood push, then zoom-through back to daylight
  { t: 27.9, lon: rlon, lat: rlat, span: 6.0, rot: -6, e: linear },
  { t: 28.15, lon: rlon, lat: rlat, span: 0.9, rot: -2, e: easeIn },
  { t: 28.6, lon: rlon, lat: rlat, span: 4.4, rot: 0, e: easeOut },
  { t: 30.3, lon: rlon, lat: rlat, span: 3.9, e: linear },
  // dive into the 160 km arrow → B-roll
  { t: 30.9, lon: arrowMid[0], lat: arrowMid[1], span: 0.3, rot: 8, e: easeIn },
  { t: 34.05, lon: rlon + 0.1, lat: rlat - 0.05, span: 0.7, rot: -6, e: linear },
  // pull out of the mountains to Panama + Colombia
  { t: 34.9, lon: -77.6, lat: 7.6, span: 10.5, rot: 0, e: easeOut },
  { t: 36.7, lon: -77.6, lat: 7.7, span: 9.6, e: linear },
  // terrain, humidity, rain
  { t: 37.5, lon: rlon, lat: rlat, span: 4.2, rot: -8, e: inOut },
  { t: 40.6, lon: rlon, lat: rlat, span: 3.5, rot: -10, e: linear },
  // (paper map scene covers 40.5–49.0)
  { t: 49.0, lon: rlon, lat: rlat, span: 4.4, rot: 0, e: linear },
  { t: 49.8, lon: rlon, lat: rlat, span: 4.2, e: linear },
  // migrant routes
  { t: 51.2, lon: -74, lat: 2, span: 42, rot: 0, e: inOut },
  { t: 52.4, lon: -74.5, lat: 2.5, span: 40, e: linear },
  { t: 54.1, lon: -88, lat: 15, span: 46, e: inOut },
  { t: 55.2, lon: rlon, lat: rlat, span: 3.9, rot: 10, e: inOut },
  { t: 59.5, lon: rlon, lat: rlat, span: 3.4, rot: 12, e: linear },
  // terrain + wildlife
  { t: 60.3, lon: rlon, lat: rlat - 0.05, span: 3.6, rot: -4, e: inOut },
  { t: 62.6, lon: rlon, lat: rlat - 0.05, span: 3.3, rot: -6, e: linear },
  // lack of government control
  { t: 63.3, lon: rlon + 0.1, lat: rlat + 0.55, span: 6.5, rot: 0, e: inOut },
  { t: 64.8, lon: rlon + 0.1, lat: rlat + 0.45, span: 6.0, e: linear },
  // criminals, smugglers, gangs
  { t: 65.4, lon: rlon, lat: rlat, span: 3.7, rot: 8, e: inOut },
  { t: 69.3, lon: rlon, lat: rlat, span: 3.2, rot: 10, e: linear },
  // kidnapping: tilt into 3D with growing trees
  { t: 70.4, lon: rlon - 0.05, lat: rlat - 0.25, span: 2.7, rot: 4, tilt: 40, e: inOut },
  { t: 72.9, lon: rlon - 0.05, lat: rlat - 0.2, span: 2.4, rot: 2, tilt: 44, e: linear },
];

// carry unspecified fields forward
const FULL: (Cam & { t: number; e: Ease })[] = [];
for (const k of KEYS) {
  const prev = FULL[FULL.length - 1];
  FULL.push({
    t: k.t,
    lon: k.lon ?? prev.lon,
    lat: k.lat ?? prev.lat,
    span: k.span ?? prev.span,
    rot: k.rot ?? prev.rot,
    tilt: k.tilt ?? prev?.tilt ?? 0,
    e: k.e ?? linear,
  });
}

export const camAt = (t: number): Cam => {
  if (t <= FULL[0].t) return FULL[0];
  for (let i = 1; i < FULL.length; i++) {
    const b = FULL[i];
    if (t <= b.t) {
      const a = FULL[i - 1];
      const p = b.e((t - a.t) / (b.t - a.t));
      return {
        lon: lerp(a.lon, b.lon, p),
        lat: lerp(a.lat, b.lat, p),
        span: Math.exp(lerp(Math.log(a.span), Math.log(b.span), p)),
        rot: lerp(a.rot, b.rot, p),
        tilt: lerp(a.tilt, b.tilt, p),
      };
    }
  }
  return FULL[FULL.length - 1];
};

export const ppdOf = (c: Cam) => 1920 / c.span;

/** Camera speed in "screens per second", used to fake motion blur. */
export const camSpeed = (t: number) => {
  const dt = 1 / 30;
  const a = camAt(t);
  const b = camAt(t + dt);
  const zoom = Math.abs(Math.log(b.span / a.span)) / dt;
  const pan = Math.hypot(b.lon - a.lon, b.lat - a.lat) / a.span / dt;
  return zoom + pan * 1.6;
};

/** World → plane pixel coordinates (before the plane's CSS rotate/tilt). */
export const project = (c: Cam, lon: number, lat: number): [number, number] => {
  const k = ppdOf(c);
  return [PLANE.ox + (lon - c.lon) * k, PLANE.oy + (c.lat - lat) * k];
};
