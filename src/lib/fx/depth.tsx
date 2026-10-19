import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { H, T, W } from '../constants';
import { ease, wobble } from '../easing';

/**
 * 2.5D depth tools — this is what makes flat assets feel 3D like the reference:
 * parallax between background layers, depth-of-field blur, contact shadows under feet,
 * and real CSS-3D rotation (with moving light) on paper props.
 */

export type PlateKey = { frame: number; x: number; y: number; zoom: number }; // x/y = pan in px at depth 1

/**
 * ParallaxPlate — one background split into layers (far sky → mid buildings → near floor).
 * A camera move shifts near layers more than far layers = depth. `blur` on far layers = depth of field.
 * Generate the layers with the "LAYERED PLATE" prompts in docs/ASSET_PROMPTS.md §7.2.
 */
export const ParallaxPlate: React.FC<{
  layers: { src: string; depth: number; blur?: number }[]; // depth 0 = infinitely far, 1 = foreground
  camera: PlateKey[];
  children?: React.ReactNode; // characters go between layers: pass them here, rendered at depth 0.8
  charactersDepth?: number;
}> = ({ layers, camera, children, charactersDepth = 0.8 }) => {
  const frame = useCurrentFrame();
  let k = camera[0];
  let x = k.x;
  let y = k.y;
  let zoom = k.zoom;
  for (let i = 1; i < camera.length; i++) {
    const b = camera[i];
    const a = camera[i - 1];
    if (frame >= a.frame) {
      const t = ease.inOut(Math.min(1, (frame - a.frame) / Math.max(1, b.frame - a.frame)));
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
      zoom = a.zoom + (b.zoom - a.zoom) * t;
      k = b;
    }
  }
  const last = camera[camera.length - 1];
  if (frame > last.frame) zoom *= 1 + T.driftPerSec * ((frame - last.frame) / 60); // never stops
  const layerStyle = (depth: number, blur = 0): React.CSSProperties => {
    const z = 1 + (zoom - 1) * (0.35 + depth * 0.65);
    return {
      position: 'absolute',
      inset: 0,
      transform: `translate(${x * depth}px, ${y * depth}px) scale(${z * (1.04 + depth * 0.04)})`,
      transformOrigin: '50% 60%',
      filter: blur ? `blur(${blur}px)` : undefined,
    };
  };
  const sorted = [...layers].sort((a, b) => a.depth - b.depth);
  const front = sorted.filter((l) => l.depth > charactersDepth);
  const back = sorted.filter((l) => l.depth <= charactersDepth);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {back.map((l) => (
        <Img key={l.src} src={l.src} style={{ ...layerStyle(l.depth, l.blur), width: W, height: H, objectFit: 'cover' }} />
      ))}
      <div style={layerStyle(charactersDepth)}>{children}</div>
      {front.map((l) => (
        <Img key={l.src} src={l.src} style={{ ...layerStyle(l.depth, l.blur), width: W, height: H, objectFit: 'cover' }} />
      ))}
    </AbsoluteFill>
  );
};

/** Soft contact shadow under a character's feet (x, y = feet). Grounds cut-outs on photo plates. */
export const ContactShadow: React.FC<{ x: number; y: number; width: number; opacity?: number }> = ({ x, y, width, opacity = 0.38 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - width / 2,
      top: y - width * 0.06,
      width,
      height: width * 0.12,
      borderRadius: '50%',
      background: `radial-gradient(ellipse at center, rgba(20,12,6,${opacity}) 0%, rgba(20,12,6,0) 70%)`,
      filter: 'blur(6px)',
    }}
  />
);

/**
 * Paper3D — a document/print that floats in real 3D: perspective tilt that slowly swings,
 * a moving specular sheen and a soft shadow that shifts with the tilt
 * (the reference's Revere engraving / Declaration shots).
 */
export const Paper3D: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  baseTilt?: [number, number, number]; // rotateX, rotateY, rotateZ in degrees
  swing?: number; // degrees of slow swing
}> = ({ src, x, y, w, h, start, baseTilt = [8, -14, -4], swing = 5 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const rx = baseTilt[0] + wobble('p3x', frame, swing, 0.015);
  const ry = baseTilt[1] + wobble('p3y', frame, swing, 0.012);
  const rz = baseTilt[2] + wobble('p3z', frame, swing * 0.4, 0.01);
  const enter = Math.min(1, t / 14);
  const sheen = 50 + ry * 3;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, perspective: 2600 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateZ(${(1 - ease.out(enter)) * -900}px) rotateX(${rx}deg) rotateY(${ry + (1 - enter) * 60}deg) rotateZ(${rz}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: `${-ry * 2.4}px ${18 + rx * 2}px 60px rgba(0,0,0,0.45)`,
        }}
      >
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen - 18}%, rgba(255,255,255,0.22) ${sheen}%, rgba(255,255,255,0) ${sheen + 18}%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  );
};
