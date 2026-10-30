import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Backdrop, Fence, Ground, Hay, House, Path, Shelter, Tower, Tree, Wall, mats } from './world';
import { Bench, Broom, Flag, Jar, Lanterns, StrawHat, Table, Trough } from './props';
import { rep, sandTex } from './tex';

/** A big smooth sand dune (squashed sphere cap) the road climbs over. */
export const Dune: React.FC<{ p: [number, number, number]; s: [number, number, number]; tint?: string }> = ({ p, s, tint = '#ead5a4' }) => {
  const map = useMemo(() => rep(sandTex(tint), 8, 8), [tint]);
  return (
    <mesh position={p} scale={s} receiveShadow castShadow>
      <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshLambertMaterial map={map} />
    </mesh>
  );
};

/**
 * The village street (opening, neighbours, "few weeks later", "back come the neighbours").
 * Road runs from the camera side (+z) away up a dune to the left (-x, -z). The old man's corner: a timber
 * shelter at the right; courtyard walls on the left.
 */
export const StreetSet: React.FC<{ tint?: string }> = ({ tint }) => (
  <group>
    <Ground tint={tint} />
    <Backdrop seed={1.3} />
    <Dune p={[-7, -1.4, -30]} s={[20, 9.5, 13]} />
    <Dune p={[14, -2, -44]} s={[26, 8, 14]} />
    <Path pts={[[1.2, 16], [0.6, 6], [-0.4, -4], [-2.6, -13], [-5.5, -21]]} width={3.0} />
    {/* right: the old man's corner - an open timber shelter with a plank side wall, a house behind */}
    <Shelter p={[5.0, 0, 1.6]} w={2.8} d={2.6} h={2.95} ry={-0.08} back={false} sides />
    <House p={[7.6, 0, -4.5]} w={5} d={4} h={2.9} ry={-0.12} door={-0.8} win={1.4} />
    <House p={[6.8, 0, -12]} w={6} d={4.5} h={2.7} ry={-0.2} door={null} win={0.5} />
    <Wall p={[4.2, 0, -8.5]} len={3.5} ry={-0.3} />
    {/* left: courtyard walls and roofs */}
    <Wall p={[-4.6, 0, 0.5]} len={6} ry={0.06} />
    <Wall p={[-4.2, 0, -6.5]} len={5} ry={0.18} />
    <House p={[-9.2, 0, -3.2]} w={6} d={4} h={2.6} ry={0.12} door={1.2} win={-1.4} />
    <House p={[-8.4, 0, -11]} w={5} d={4} h={2.6} ry={0.25} door={null} win={0} />
    <Tree p={[9.5, 0, -9]} s={1.2} />
    <Tree p={[-13, 0, -9]} s={1.1} />
    <Tree p={[3.6, 0, -15]} s={1.0} />
    <Tower p={[15, 0, -26]} h={12} />
    <Hay p={[3.0, 0, -1.2]} s={0.6} />
    <Broom p={[3.68, 0, 2.95]} tilt={-0.2} />
    <Jar p={[-1.3, 0, 3.4]} />
    <Jar p={[4.3, 0, 3.6]} s={0.8} />
  </group>
);

/** Stable yard (horse returns, two horses, party, riding, the fall). Looking north (-z). */
export const StableSet: React.FC<{ tint?: string }> = ({ tint }) => (
  <group>
    <Ground tint={tint} />
    <Backdrop seed={2.1} />
    <Dune p={[-6, -1.5, -40]} s={[24, 8, 12]} />
    <Shelter p={[-1.2, 0, -5]} w={4.6} d={3} h={2.8} back sides />
    <House p={[5.2, 0, -8.5]} w={5.5} d={4.2} h={2.9} door={0} win={1.9} />
    <House p={[-7.5, 0, -10]} w={5} d={4} h={2.7} door={null} win={0} />
    <Fence p={[3.4, 0, -2.6]} len={4.8} />
    <Fence p={[5.8, 0, -0.2]} len={4.8} ry={Math.PI / 2} />
    <Hay p={[1.8, 0, -3.8]} s={0.75} />
    <Tower p={[10, 0, -18]} h={12} />
    <Tree p={[3, 0, -14]} s={1.2} />
  </group>
);

/** Party square: the street corner dressed with lantern strings, a feast table and jars. */
export const PartySet: React.FC = () => (
  <group>
    <StreetSet />
    <Shelter p={[0.2, 0, -3.2]} w={3.4} d={2.2} h={2.9} back sides={false} />
    <Table p={[0.3, 0, -0.6]} w={2.6} />
    <Lanterns a={[-4, 3.6, 1]} b={[5, 3.4, -1.5]} n={7} sag={0.7} />
    <Lanterns a={[-3, 3.9, -4]} b={[6, 3.7, -4.5]} n={7} sag={0.6} />
    <Lanterns a={[-2, 3.4, 3.5]} b={[4.5, 3.3, 2]} n={5} sag={0.5} />
    {[[-4, 1], [5, -1.5], [-3, -4], [6, -4.5], [-2, 3.5], [4.5, 2]].map(([x, z], i) => (
      <mesh key={i} position={[x, 1.8, z]} material={mats.post()} castShadow><cylinderGeometry args={[0.07, 0.08, 3.6, 8]} /></mesh>
    ))}
  </group>
);

/** Corral for the riding scene: fence close to camera (+z), stallion inside, tower + red flag beyond. */
export const CorralSet: React.FC<{ tint?: string }> = ({ tint }) => (
  <group>
    <StableSet tint={tint} />
    <Fence p={[1, 0, 2.2]} len={12} gap={1.5} h={1.35} />
    <Fence p={[-5, 0, -0.5]} len={5.4} ry={Math.PI / 2} h={1.35} />
    <Flag p={[8.4, 0, -12]} h={6.5} />
    <Trough p={[-2.5, 0, -3.2]} />
    <Bench p={[-1.5, 0, -4.4]} w={2} />
  </group>
);

/** The village gate square at war (sunset): open shelters, tower, flags, a fence line. */
export const GateSet: React.FC = () => (
  <group>
    <Ground tint="#e6c6a0" />
    <Backdrop seed={3.3} colors={['#b98a78', '#cf9f86', '#e2b994']} band="#5a2e2a" />
    <Shelter p={[-4.5, 0, -6]} w={5} d={3} h={2.9} back sides />
    <House p={[2.5, 0, -9]} w={6} d={4.2} h={2.9} door={0} win={1.9} />
    <House p={[-11, 0, -10]} w={5} d={4} h={2.7} door={null} win={0} />
    <Tower p={[7.5, 0, -14]} h={12} />
    <Flag p={[5.2, 0, -10.5]} h={5.2} /><Flag p={[-0.8, 0, -10.8]} h={4.6} />
    <Fence p={[9, 0, -4]} len={6} />
    <Tree p={[-1, 0, -16]} s={1.3} />
  </group>
);

/** Sunset street, empty: the dune road between a house corner and a wall, a dropped straw hat. */
export const EmptyStreetSet: React.FC = () => (
  <group>
    <StreetSet tint="#e8c8a2" />
    <StrawHat p={[0.6, 0.08, 4.5]} />
  </group>
);

/** A modern city bus stop (the epilogue): tiled pavement, glass shelter with a yellow bench and a "12路" sign. */
export const BusStopSet: React.FC<{ busX: number }> = ({ busX }) => {
  const tiles = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d')!;
    g.fillStyle = '#c9ccd0'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#d3d6da' : '#c4c8cc'; g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); return t;
  }, []);
  const sign = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d')!;
    g.fillStyle = '#f7f8f9'; g.fillRect(0, 0, 512, 1024);
    g.fillStyle = '#c8202a'; g.font = '400 170px "Ma Shan Zheng", serif'; g.textAlign = 'center'; g.fillText('12路', 256, 220);
    g.strokeStyle = '#1f6f78'; g.lineWidth = 14; g.beginPath(); g.moveTo(40, 560); g.lineTo(200, 380); g.lineTo(470, 520); g.stroke();
    for (const [x, y] of [[40, 560], [200, 380], [470, 520]]) { g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill(); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const bus = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d')!;
    g.fillStyle = '#f4f5f2'; g.fillRect(0, 0, 1024, 256);
    g.fillStyle = '#1b6f62'; g.fillRect(0, 150, 1024, 34); g.fillStyle = '#ffffff'; g.fillRect(0, 140, 1024, 8);
    g.fillStyle = '#1d2733'; for (let i = 0; i < 6; i++) g.fillRect(30 + i * 165, 30, 140, 90);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const pole = mats.ink();
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[200, 200]} /><meshLambertMaterial map={tiles} /></mesh>
      <mesh position={[0, 0.06, -3.5]} receiveShadow><boxGeometry args={[60, 0.12, 0.3]} /><meshLambertMaterial color="#9a9ea3" /></mesh>
      <mesh position={[0, -0.02, -9]} rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[60, 11]} /><meshLambertMaterial color="#6e7277" /></mesh>
      {/* buildings across the road */}
      {[-14, -4, 6, 16].map((x, i) => <mesh key={i} position={[x, 7, -20]} receiveShadow castShadow><boxGeometry args={[9.5, 14, 4]} /><meshLambertMaterial color={['#e9e5dc', '#dfe6ea', '#ece2d2', '#e3e6e0'][i]} /></mesh>)}
      {/* the bus, driving off to the left */}
      <group position={[busX, 0, -6.2]}>
        <mesh position={[0, 1.75, 0]} castShadow><boxGeometry args={[11, 2.9, 2.5]} /><meshLambertMaterial attach="material-0" color="#f4f5f2" /><meshLambertMaterial attach="material-1" color="#f4f5f2" /><meshLambertMaterial attach="material-2" color="#e6e8e4" /><meshLambertMaterial attach="material-3" color="#f4f5f2" /><meshLambertMaterial attach="material-4" map={bus} /><meshLambertMaterial attach="material-5" map={bus} /></mesh>
        {[-3.6, 3.4].map((x) => [-1.26, 1.26].map((z) => <mesh key={`${x}${z}`} position={[x, 0.5, z]} rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[0.5, 0.5, 0.3, 24]} /><meshLambertMaterial color="#1a1a1c" /></mesh>))}
      </group>
      {/* shelter */}
      <group position={[0.5, 0, -2.4]}>
        {[-1.8, 1.8].map((x) => <mesh key={x} position={[x, 1.45, 0]} material={pole} castShadow><boxGeometry args={[0.1, 2.9, 0.1]} /></mesh>)}
        <mesh position={[0, 2.95, 0.4]} castShadow receiveShadow><boxGeometry args={[4.6, 0.12, 1.6]} /><meshLambertMaterial color="#f2f3f4" /></mesh>
        <mesh position={[0, 1.6, -0.05]}><boxGeometry args={[3.5, 2.2, 0.04]} /><meshLambertMaterial color="#cfe3ea" transparent opacity={0.35} /></mesh>
        <mesh position={[2.35, 1.6, 0.1]} castShadow><boxGeometry args={[1.0, 2.1, 0.08]} /><meshLambertMaterial attach="material-4" map={sign} /><meshLambertMaterial attach="material-0" color="#e8e9ea" /><meshLambertMaterial attach="material-1" color="#e8e9ea" /><meshLambertMaterial attach="material-2" color="#e8e9ea" /><meshLambertMaterial attach="material-3" color="#e8e9ea" /><meshLambertMaterial attach="material-5" color="#e8e9ea" /></mesh>
        <mesh position={[0.6, 0.48, 0.25]} castShadow><boxGeometry args={[2.4, 0.08, 0.45]} /><meshLambertMaterial color="#efb52c" /></mesh>
        {[-0.4, 1.6].map((x) => <mesh key={x} position={[x, 0.24, 0.25]} material={pole}><boxGeometry args={[0.06, 0.48, 0.3]} /></mesh>)}
      </group>
    </group>
  );
};

export const _unused = THREE;
