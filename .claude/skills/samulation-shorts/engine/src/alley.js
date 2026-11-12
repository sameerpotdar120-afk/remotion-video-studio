// SET 1: a narrow back alley at night. A lit hatch window with no sign at the far end, the hall's side wall on the left.
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK, blur } from './kit.js';
import { HERO, LOOKS } from './char.js';

const J = "'IPAGothic', sans-serif";
function acUnit(g, x, y, s) {   // wall air-conditioner drawn in ink
  F(rectD(x, y, 150 * s, 100 * s, 8 * s), '#8e93b8', { line: 5, seed: x | 0, shadow: 0.3, shadowCol: '#1b1c40' });
  F(ellD(x + 55 * s, y + 50 * s, 34 * s, 34 * s), '#6f7499', { line: 4, seed: 3, shadow: 0.35, shadowCol: '#12122e' });
  for (let i = 0; i < 4; i++) Ln(`M ${x + 105 * s} ${y + (22 + i * 18) * s} L ${x + 138 * s} ${y + (22 + i * 18) * s}`, 3, i, INK);
}
function pipesAndSeams(g, W, H, seed) {
  for (let i = 1; i < 6; i++) { const x = W * i / 6 + (rnd(i + seed) - 0.5) * 60; Ln(`M ${x} 0 L ${x} ${H}`, 5, i + seed, 'rgba(15,12,45,0.8)'); }
  for (let i = 1; i < 4; i++) { const y = H * i / 4; Ln(`M 0 ${y} L ${W} ${y}`, 4, i + 9 + seed, 'rgba(15,12,45,0.6)'); }
}

export function buildAlley() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b0d2a'); scene.fog = new THREE.Fog('#141644', 14, 40);
  const g = new THREE.Group(); scene.add(g);
  // ── floor: wet dark asphalt with a painted kerb line; low roughness so the lights streak on it ──
  const floorT = tex(1024, 2048, (c, W, H) => { fill(c, W, H, '#4a4da0', '#34367c'); grain(c, W, H, 0.07);
    for (let i = 0; i < 9; i++) Ln(`M 0 ${H * i / 9} L ${W} ${H * i / 9}`, 2.5, i, 'rgba(10,8,40,0.5)');
    c.fillStyle = 'rgba(214,160,60,0.55)'; c.fillRect(0, H * 0.83, W, 26); });
  g.add(plane(14, 26, lit(floorT, { roughness: 0.32, metalness: 0.05 }), [0, 0, -3], [-Math.PI / 2, 0, 0]));

  // ── left wall (the hall's flank): tall magenta poster panel near us, vents, a barred window ──
  const leftT = tex(2048, 1152, (c, W, H) => { fill(c, W, H, '#7479c8', '#5a5eb0'); grain(c, W, H, 0.05, 2); pipesAndSeams(c, W, H, 1);
    F(rectD(560, 360, 330, 700, 6), '#3a2a52', { line: 8, seed: 5, shadow: 0.2 });            // poster frame (glowing panel sits in front)
    acUnit(c, 1050, 330, 1.1); acUnit(c, 1350, 250, 0.9); acUnit(c, 260, 420, 1.2);
    F(rectD(980, 120, 150, 110, 4), '#23254f', { line: 6, seed: 7, shadow: 0 }); for (let i = 1; i < 5; i++) Ln(`M ${980 + i * 30} 120 L ${980 + i * 30} 230`, 3, i, INK);
    Ln(sm([[700, 0], [720, 500], [690, 1152]], false), 7, 11, '#22234e'); Ln(sm([[1500, 0], [1490, 1152]], false), 9, 12, '#22234e');
    F(rectD(1600, 520, 230, 60, 4), '#b2553c', { line: 5, seed: 13, shadow: 0.3 });           // rust-red awning strip
    frame(c, W, H, 5); });
  g.add(plane(18, 9, lit(leftT), [-2.3, 4.5, -2], [0, Math.PI / 2, 0]));
  const posterT = tex(330, 760, (c, W, H) => { fill(c, W, H, '#7a2a6a', '#4a1650');
    c.fillStyle = '#ffd98a'; c.font = '900 150px Mont'; c.textAlign = 'center'; c.fillText('7', W / 2, 250);
    c.font = `700 54px ${J}`; c.fillText('ラッキー', W / 2, 400); c.font = '800 30px Mont'; c.fillText('LUCKY SEVEN', W / 2, 460);
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(255,190,220,0.8)'; c.beginPath(); c.arc(40 + rnd(i) * 250, 500 + rnd(i * 3) * 220, 10 + rnd(i * 5) * 8, 0, 6.3); c.fill(); }
    frame(c, W, H, 9, '#f2c36a'); });
  g.add(plane(0.9, 2.1, glowMat(posterT, 1.3), [-2.26, 2.3, -7.0], [0, Math.PI / 2, 0]));
  g.add(point('#d44ae0', 6, [-1.5, 2.4, -7.0], 8));

  // ── right wall: shuttered shop, blue sign board, red lantern ──
  const rightT = tex(2048, 1152, (c, W, H) => { fill(c, W, H, '#6a6fc0', '#5256a8'); grain(c, W, H, 0.05, 4); pipesAndSeams(c, W, H, 5);
    F(rectD(1380, 470, 520, 620, 4), '#2a2b55', { line: 8, seed: 20, shadow: 0.2 }); for (let i = 1; i < 12; i++) Ln(`M 1380 ${470 + i * 52} L 1900 ${470 + i * 52}`, 3, i + 20, 'rgba(10,8,35,0.7)');
    acUnit(c, 520, 380, 1.0); F(rectD(250, 150, 140, 190, 4), '#22244c', { line: 6, seed: 22, shadow: 0 }); Ln('M 320 150 L 320 340 M 250 245 L 390 245', 3, 23, INK);
    Ln(sm([[900, 0], [910, 600], [890, 1152]], false), 8, 24, '#1f2049'); frame(c, W, H, 5); });
  g.add(plane(18, 9, lit(rightT), [2.3, 4.5, -2], [0, -Math.PI / 2, 0]));
  const signT = tex(512, 160, (c, W, H) => { fill(c, W, H, '#3d6fd0', '#2a4fa8'); c.fillStyle = '#eaf2ff'; c.font = '900 92px Mont'; c.textAlign = 'center'; c.fillText('KARAOKE', W / 2, 112); frame(c, W, H, 8); });
  g.add(box(0.08, 0.55, 1.7, [lit(signT), glowMat(signT, 1.2), flat('#223'), flat('#223'), flat('#223'), flat('#223')], [2.05, 3.5, 0.9]));
  const lanT = tex(160, 220, (c, W, H) => { F(ellD(80, 110, 70, 96), '#e2452c', { line: 6, seed: 30, shadow: 0.25, shadowCol: '#5a0c05' }); c.fillStyle = '#2a0a06'; c.font = `700 84px ${J}`; c.textAlign = 'center'; c.fillText('酒', 80, 140);
    for (let i = -2; i <= 2; i++) Ln(`M 14 ${110 + i * 34} L 146 ${110 + i * 34}`, 2, i, 'rgba(60,8,4,0.5)'); });
  g.add(plane(0.5, 0.7, new THREE.MeshStandardMaterial({ map: lanT, emissiveMap: lanT, emissive: 0xffffff, emissiveIntensity: 1.3, transparent: true, alphaTest: 0.4 }), [1.75, 2.75, -0.6]));
  g.add(point('#ff5a2a', 4, [1.6, 2.6, -0.5], 6)); g.add(glow('#ff5a2a', 1.6, [1.72, 2.75, -0.55], 0.25));

  // ── back wall with the hatch window ──
  const backT = tex(1024, 2048, (c, W, H) => { fill(c, W, H, '#7a7fd0', '#6468ba'); grain(c, W, H, 0.05, 6); pipesAndSeams(c, W, H, 9);
    acUnit(c, 180, 520, 1.2); F(rectD(650, 300, 190, 190, 4), '#22244c', { line: 6, seed: 41, shadow: 0 }); for (let i = 1; i < 5; i++) Ln(`M ${650 + i * 38} 300 L ${650 + i * 38} 490`, 3, i, INK);
    for (let i = 0; i < 3; i++) Ln(sm([[0, 200 + i * 60], [500, 260 + i * 70], [1024, 180 + i * 50]], false), 3, i + 50, 'rgba(8,6,30,0.8)');   // cables
    F(rectD(120, 1120, 780, 70, 4), '#b2553c', { line: 6, seed: 43, shadow: 0.3 }); for (let i = 1; i < 26; i++) Ln(`M ${120 + i * 30} 1120 L ${120 + i * 30} 1190`, 2, i, 'rgba(60,20,10,0.6)');
    F(rectD(760, 1500, 110, 150, 4), '#f2ead8', { line: 5, seed: 45, shadow: 0.1 }); c.fillStyle = '#b33'; c.font = '800 20px Mont'; c.textAlign = 'center'; c.fillText('LICENSE', 815, 1535); for (let i = 0; i < 4; i++) Ln(`M 778 ${1560 + i * 20} L 852 ${1560 + i * 20}`, 2, i, 'rgba(0,0,0,0.5)');
    frame(c, W, H, 5); });
  g.add(plane(4.6, 9.2, lit(backT), [0, 4.6, -10]));
  const hatchT = tex(640, 440, (c, W, H) => { fill(c, W, H, '#fff3c4', '#ffd27a');                    // warm room behind glass
    F(rectD(60, 250, 170, 190, 4), '#d9a85a', { line: 5, seed: 60, shadow: 0.2 }); F(rectD(400, 60, 150, 110, 4), '#f6f0de', { line: 5, seed: 61, shadow: 0.1 });
    for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { c.fillStyle = 'rgba(190,60,50,0.7)'; c.fillRect(412 + q * 22, 74 + r * 22, 12, 12); }
    F(rectD(270, 290, 110, 150, 6), '#c97a3a', { line: 5, seed: 62, shadow: 0.25 }); Ln(`M 320 0 L 320 ${H}`, 7, 63, INK); frame(c, W, H, 10); });
  g.add(plane(1.5, 1.03, glowMat(hatchT, 1.25), [0.15, 1.55, -9.97]));
  g.add(inkBox(1.9, 0.09, 0.42, '#e8a33c', [0.15, 0.98, -9.78], { col2: '#c9822a' }));                // counter shelf
  g.add(inkBox(1.7, 0.3, 0.3, '#d8d6e6', [0.15, 2.28, -9.85], { detail: (c, W, H) => { for (let i = 1; i < 8; i++) Ln(`M 0 ${H * i / 8} L ${W} ${H * i / 8}`, 2, i, 'rgba(0,0,0,0.4)'); } }));   // rolled shutter
  g.add(point('#ffd27a', 16, [0.15, 1.7, -8.6], 12, 1.4)); g.add(glow('#ffdc8a', 3.4, [0.15, 1.6, -9.7], 0.22));
  g.add(inkBox(0.32, 0.24, 0.2, '#d8362c', [1.25, 1.2, -9.88]));                                       // red mail box

  // ── props: crates, vending machine, plant, AC box with bracket, cat ──
  const crate = (x, y, z, col) => g.add(inkBox(0.62, 0.42, 0.45, col, [x, y, z], { detail: (c, W, H) => { for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(W * (0.12 + i * 0.3), H * 0.3, W * 0.18, H * 0.38); } } }));
  crate(1.55, 0.21, -8.6, '#e2b72e'); crate(1.55, 0.63, -8.6, '#d8402e'); crate(1.55, 1.05, -8.6, '#e2b72e');
  const bottlesT = tex(256, 128, (c, W, H) => { for (let i = 0; i < 6; i++) F(sm([[20 + i * 38, 128], [20 + i * 38, 60], [30 + i * 38, 40], [30 + i * 38, 10], [40 + i * 38, 10], [40 + i * 38, 40], [50 + i * 38, 60], [50 + i * 38, 128]]), '#8a4a1e', { line: 4, seed: i, shadow: 0.3 }); });
  g.add(plane(0.6, 0.3, new THREE.MeshStandardMaterial({ map: bottlesT, transparent: true, alphaTest: 0.4 }), [1.55, 1.4, -8.5]));
  const vendT = tex(256, 512, (c, W, H) => { fill(c, W, H, '#2f6fd8', '#1f4fae'); F(rectD(24, 30, 208, 250, 6), '#dff1ff', { line: 6, seed: 70, shadow: 0 });
    for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) F(rectD(36 + q * 39, 44 + r * 78, 26, 58, 5), ['#e44', '#3b6', '#fc3', '#39f', '#f7a'][(q + r) % 5], { line: 3, seed: q + r * 5, shadow: 0.15 });
    F(rectD(60, 330, 136, 40, 4), '#16306e', { line: 4, seed: 71, shadow: 0 }); F(rectD(40, 410, 176, 60, 6), '#12265a', { line: 5, seed: 72, shadow: 0 }); frame(c, W, H, 9); });
  g.add(box(0.85, 1.85, 0.6, [flat('#1f4fae'), flat('#1f4fae'), flat('#2f6fd8'), flat('#2f6fd8'), glowMat(vendT, 0.55), flat('#1f4fae')], [-1.7, 0.925, -6.4]));
  g.add(point('#7ab8ff', 3, [-1.4, 1.2, -5.7], 5));
  const plantT = tex(256, 320, (c) => { for (let i = 0; i < 9; i++) { const a = -1.3 + i * 0.32; F(sm([[128, 250], [128 + Math.cos(a - 1.57) * 60 - 8, 250 + Math.sin(a - 1.57) * 110], [128 + Math.cos(a - 1.57) * 120, 250 + Math.sin(a - 1.57) * 230], [128 + Math.cos(a - 1.57) * 60 + 10, 250 + Math.sin(a - 1.57) * 110]]), i % 2 ? '#3f9a5e' : '#2f7d4c', { line: 4, seed: i, shadow: 0.3, shadowCol: '#0a2a1a' }); }
    F(sm([[78, 245], [178, 245], [166, 318], [90, 318]]), '#c9622e', { line: 5, seed: 80, shadow: 0.3 }); });
  g.add(plane(0.8, 1.0, new THREE.MeshStandardMaterial({ map: plantT, transparent: true, alphaTest: 0.4 }), [-1.3, 0.5, -8.9]));
  const catT = tex(200, 220, (c) => { F(sm([[50, 215], [44, 120], [70, 70], [130, 70], [156, 120], [150, 215]]), '#f4efe6', { line: 5, seed: 90, shadow: 0.25 });
    F(sm([[62, 84], [58, 36], [92, 66]]), '#e08a2e', { line: 4, seed: 91, shadow: 0 }); F(sm([[138, 84], [142, 36], [108, 66]]), '#2b2622', { line: 4, seed: 92, shadow: 0 });
    F(sm([[100, 70], [150, 76], [156, 130], [120, 120]]), '#e08a2e', { line: 0, ink: false, shadow: 0, soft: 0 });
    Ln(sm([[78, 112], [86, 106], [94, 112]], false), 4, 93); Ln(sm([[108, 112], [116, 106], [124, 112]], false), 4, 94); Ln(sm([[94, 130], [101, 136], [108, 130]], false), 3, 95);
    Ln(sm([[150, 200], [185, 180], [180, 140]], false), 10, 96, INK); });
  g.add(plane(0.36, 0.4, new THREE.MeshStandardMaterial({ map: catT, transparent: true, alphaTest: 0.4 }), [1.0, 0.2, -8.2]));
  // overhead cables + wall AC with bracket
  for (let i = 0; i < 3; i++) { const cv = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.3, 6.5 - i * 0.5, -4 - i), new THREE.Vector3(0, 5.6 - i * 0.4, -5 - i), new THREE.Vector3(2.3, 6.3 - i * 0.5, -6 - i)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 20, 0.018, 5), flat('#0a0a22'))); }
  g.add(inkBox(0.7, 0.55, 0.4, '#cfd2ea', [1.95, 3.1, -7.6], { detail: (c, W, H) => { F(ellD(W * 0.4, H * 0.5, H * 0.3, H * 0.3), '#9da2c8', { line: 4, seed: 1, shadow: 0.3 }); } }));

  // ── light: deep blue night, moon rim from above ──
  scene.add(new THREE.HemisphereLight('#6a74ff', '#2a2260', 1.7));
  const moon = new THREE.DirectionalLight('#8fa2ff', 0.9); moon.position.set(2, 8, 4); scene.add(moon);

  // ── people ──
  const hero = new Actor(HERO).addTo(scene);
  const a = new Actor({ ...LOOKS.B, body: '#7a4fd0', sh: '#1d0f48' }).addTo(scene);      // at the hatch
  const b = new Actor({ ...LOOKS.C, body: '#2f8f6a', sh: '#0a2a1e' }).addTo(scene);      // sitting on a crate, waiting
  const seat = inkBox(0.5, 0.42, 0.45, '#3f9a5e', [-0.75, 0.21, -8.5]); g.add(seat);
  return { scene, hero, a, b };
}
