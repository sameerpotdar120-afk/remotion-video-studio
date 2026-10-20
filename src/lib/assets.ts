import React from 'react';
import { Img, staticFile } from 'remotion';
import FILES from './assets.generated.json';
import { C, FONTS } from './constants';

/** Files present under public/assets (scripts/asset_manifest.py — re-run after adding assets). */
const PRESENT = new Set<string>(FILES as string[]);
export const hasAsset = (path: string) => PRESENT.has(path);
export const asset = (path: string) => staticFile(`assets/${path}`);

/**
 * The asset if it exists, otherwise a clearly labelled PENDING card of the same box — never a broken image,
 * never a stand-in that could pass for the real thing.
 */
export const AssetImg: React.FC<{ path: string; style?: React.CSSProperties; w: number; h?: number }> = ({ path, style, w, h }) =>
  hasAsset(path)
    ? React.createElement(Img, { src: asset(path), style: { width: w, height: h, objectFit: 'contain', ...style } })
    : React.createElement(
        'div',
        {
          style: {
            width: w,
            height: h ?? w * 0.75,
            border: `${Math.max(4, w * 0.012)}px dashed ${C.stampRed}`,
            background: 'rgba(255,255,255,0.55)',
            color: C.stampRed,
            fontFamily: FONTS.sans,
            fontSize: Math.max(28, w * 0.07),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1.15,
            ...style,
          },
        },
        'ASSET PENDING',
        React.createElement('div', { style: { fontSize: Math.max(20, w * 0.04), fontFamily: 'monospace' } }, path),
      );
