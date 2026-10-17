import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const muzzleX = 60;
const muzzleY = 250;

export const M10MusketFire: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 2, 7], [0, 1, 0], clamp);
  const cone = interpolate(frame, [0, 2, 9], [0, 1, 0], clamp);
  const ring = interpolate(frame, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const puffs = Array.from({length: 22}, (_, index) => {
    const start = random(`time-${index}`) * 6;
    const life = interpolate(frame, [start, start + 110], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.quad),
    });
    const distance = 40 + random(`distance-${index}`) * 380;
    const spread = (random(`spread-${index}`) - 0.5) * 120;
    return {
      x: muzzleX + distance * life + 18,
      y:
        muzzleY +
        spread * life -
        life * life * (70 + random(`rise-${index}`) * 90),
      radius: (18 + random(`radius-${index}`) * 26) * (0.4 + life * 1.9),
      opacity:
        frame < start
          ? 0
          : interpolate(life, [0, 0.08, 0.6, 1], [0, 0.85, 0.5, 0]),
      grey: 150 + Math.floor(random(`grey-${index}`) * 70),
    };
  });

  const sparks = Array.from({length: 12}, (_, index) => {
    const angle = (random(`angle-${index}`) - 0.5) * 0.9;
    const velocity = 220 + random(`velocity-${index}`) * 260;
    const progress = interpolate(frame, [0, 16], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.quad),
    });
    return {
      x: muzzleX + Math.cos(angle) * velocity * progress,
      y:
        muzzleY +
        Math.sin(angle) * velocity * progress +
        progress * progress * 40,
      opacity: interpolate(frame, [0, 3, 16], [0, 1, 0], clamp),
    };
  });

  return (
    <AbsoluteFill>
      <svg width={700} height={500}>
        <defs>
          <filter id="smoke" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.022"
              numOctaves={3}
              seed={5}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={34} />
            <feGaussianBlur stdDeviation={5} />
          </filter>
          <radialGradient id="flash-gradient">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.35" stopColor="#fff2b0" />
            <stop offset="0.7" stopColor="#ff9a2a" stopOpacity={0.6} />
            <stop offset="1" stopColor="#ff6a00" stopOpacity={0} />
          </radialGradient>
        </defs>

        <g filter="url(#smoke)">
          {puffs.map((puff, index) => (
            <circle
              key={index}
              cx={puff.x}
              cy={puff.y}
              r={puff.radius}
              fill={`rgb(${puff.grey},${puff.grey},${puff.grey - 6})`}
              opacity={puff.opacity}
            />
          ))}
        </g>

        <circle
          cx={muzzleX + 30}
          cy={muzzleY}
          r={40 + ring * 120}
          fill="none"
          stroke="#fff"
          strokeWidth={6 * (1 - ring)}
          opacity={(1 - ring) * 0.6}
        />
        <path
          d={`M ${muzzleX} ${muzzleY - 22} L ${muzzleX + 230 * cone} ${muzzleY} L ${muzzleX} ${muzzleY + 22} Z`}
          fill="#ffd36b"
          opacity={cone}
          style={{filter: 'blur(3px)'}}
        />
        <circle
          cx={muzzleX + 20}
          cy={muzzleY}
          r={90}
          fill="url(#flash-gradient)"
          opacity={flash}
        />
        {sparks.map((spark, index) => (
          <circle
            key={`spark-${index}`}
            cx={spark.x}
            cy={spark.y}
            r={3.5}
            fill="#ffe08a"
            opacity={spark.opacity}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
