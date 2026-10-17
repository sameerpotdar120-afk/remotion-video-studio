import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, useCurrentFrame } from 'remotion';

// m01_title_banner: black box title that slams in from the top-left (3x, -12deg) and settles level.
// 1080x560, 60 fps, 150 frames. Transparent.

const useBaloo = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=block';
    document.head.appendChild(css);
    css.onload = () => document.fonts.load('800 80px "Baloo 2"', 'कहाँ').then(() => continueRender(handle));
    css.onerror = () => continueRender(handle);
  }, [handle]);
};

export const M01TitleBanner: React.FC = () => {
  useBaloo();
  const f = useCurrentFrame();
  const slam = interpolate(f, [0, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const settle = interpolate(f, [36, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const scale = interpolate(slam, [0, 1], [3, 1.1]) * interpolate(settle, [0, 1], [1, 1 / 1.1]);
  const rot = interpolate(slam, [0, 1], [-12, -4]) * (1 - settle);
  const x = interpolate(slam, [0, 1], [-520, 0]);
  const y = interpolate(slam, [0, 1], [-380, 0]);
  // fake motion blur: strongest while it is moving fast
  const speed = f < 36 ? (1 - slam) : 0;
  const blur = 10 * speed;
  // tiny landing bump and idle breathing
  const bump = f >= 30 && f < 44 ? Math.sin(((f - 30) / 14) * Math.PI) * 0.025 : 0;
  const breathe = f > 80 ? Math.sin((f - 80) / 22) * 0.006 : 0;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale + bump + breathe})`,
          filter: `blur(${blur}px) drop-shadow(0 14px 24px rgba(0,0,0,0.45))`,
          background: '#0b0b0d',
          padding: '14px 48px 6px',
          borderRadius: 10,
          fontFamily: '"Baloo 2", sans-serif',
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.0,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#ffffff' }}>WORLD WAR 3 में</div>
        <div style={{ color: '#ff4d6d' }}>SAFE कहाँ?</div>
      </div>
    </AbsoluteFill>
  );
};
