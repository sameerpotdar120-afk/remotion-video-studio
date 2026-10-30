import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Backdrop, Fence, Ground, Hay, House, Path, Shelter, Tower, Tree, Wall } from './world';
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
    <Dune p={[-9, -1.2, -34]} s={[22, 9, 14]} />
    <Dune p={[14, -2, -48]} s={[26, 8, 14]} />
    <Path pts={[[1.5, 14], [0.5, 4], [-1.2, -6], [-4, -16], [-7.5, -24]]} width={3.4} />
    {/* right: the old man's corner */}
    <Shelter p={[5.2, 0, -1.2]} w={3.2} d={2.6} h={2.9} ry={-0.12} back sides={false} />
    <House p={[7.8, 0, -7]} w={5} d={4} h={2.9} ry={-0.15} door={-0.8} win={1.4} />
    <House p={[6.5, 0, -15]} w={6} d={4.5} h={2.7} ry={-0.2} door={null} win={0.5} />
    {/* left: courtyard walls and roofs */}
    <Wall p={[-6.5, 0, -2]} len={7} ry={0.08} />
    <House p={[-9.5, 0, -7.5]} w={6} d={4} h={2.6} ry={0.15} door={1.2} win={-1.4} />
    <Wall p={[-6, 0, -12]} len={6} ry={0.25} />
    <Tree p={[9.5, 0, -11]} s={1.2} />
    <Tree p={[-13, 0, -12]} s={1.1} />
    <Tower p={[16, 0, -30]} h={12} />
    <Hay p={[3.6, 0, -3.2]} s={0.6} />
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

export const _unused = THREE;
