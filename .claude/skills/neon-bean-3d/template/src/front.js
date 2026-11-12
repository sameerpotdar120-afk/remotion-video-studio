// SET 4: the hall's street entrance at night: gold sign, glass auto-doors glowing warm, posters, a policeman strolling past.
import { THREE, tex, fill, frame, grain, lit, glowMat, flat, plane, box, inkBox, glow, point, Actor, rnd } from './core.js';
import { F, Ln, sm, ellD, rectD, INK } from './kit.js';
import { HERO, LOOKS } from './char.js';
const J = "'IPAGothic', sans-serif";

export function buildFront() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0b0d2a'); scene.fog = new THREE.Fog('#141644', 16, 46);
  const g = new THREE.Group(); scene.add(g);
  const floorT = tex(1024, 1024, (c, W, H) => { fill(c, W, H, '#3a3d86', '#262862'); grain(c, W, H, 0.07); for (let i = 0; i < 8; i++) { Ln(`M 0 ${i * 128} L ${W} ${i * 128}`, 3, i, 'rgba(10,8,40,0.5)'); Ln(`M ${i * 128} 0 L ${i * 128} ${H}`, 3, i + 9, 'rgba(10,8,40,0.35)'); }
    c.fillStyle = 'rgba(214,160,60,0.6)'; c.fillRect(0, H * 0.7, W, 22); });
  g.add(plane(30, 22, lit(floorT, { roughness: 0.25, metalness: 0.08 }), [0, 0, 3], [-Math.PI / 2, 0, 0]));
  // facade wall
  const wallT = tex(2048, 1536, (c, W, H) => { fill(c, W, H, '#6468ba', '#4a4e9c'); grain(c, W, H, 0.05, 3);
    for (let i = 1; i < 9; i++) Ln(`M ${i * W / 9} 0 L ${i * W / 9} ${H}`, 4, i, 'rgba(15,12,45,0.7)'); for (let i = 1; i < 5; i++) Ln(`M 0 ${i * H / 5} L ${W} ${i * H / 5}`, 3.5, i + 9, 'rgba(15,12,45,0.5)');
    F(rectD(1500, 380, 190, 130, 8), '#8e93b8', { line: 6, seed: 5, shadow: 0.3, shadowCol: '#1b1c40' }); F(ellD(1570, 445, 42, 42), '#6f7499', { line: 5, seed: 6, shadow: 0.35 });
    F(rectD(1760, 250, 150, 200, 4), '#22244c', { line: 6, seed: 7, shadow: 0 }); Ln('M 1835 250 L 1835 450 M 1760 350 L 1910 350', 3, 8, INK);
    Ln(sm([[1700, 0], [1690, 800], [1705, 1536]], false), 9, 9, '#22234e'); frame(c, W, H, 5); });
  g.add(plane(16, 12, lit(wallT), [0, 6, -3]));
  // big sign: our own hall name, gold serif on dark, lit
  const signT = tex(1024, 420, (c, W, H) => { fill(c, W, H, '#3a2418', '#23140c'); c.textAlign = 'center';
    c.fillStyle = '#f6d98a'; c.font = "700 150px Caladea, Georgia, serif"; c.fillText('STAR HALL', W / 2, 210); c.fillRect(250, 250, W - 500, 5);
    c.font = '800 50px Mont'; c.fillStyle = '#e8c878'; c.fillText('P A C H I N K O   ·   S L O T S', W / 2, 330); frame(c, W, H, 12, '#d9a94a'); });
  g.add(box(4.6, 1.9, 0.25, [flat('#23140c'), flat('#23140c'), flat('#23140c'), flat('#23140c'), glowMat(signT, 0.9), flat('#23140c')], [-0.4, 4.75, -2.8]));
  const topT = tex(1024, 360, (c, W, H) => { fill(c, W, H, '#7a2a8a', '#4a165a'); c.textAlign = 'center'; c.fillStyle = '#ffe6f6'; c.font = `700 120px ${J}`; c.fillText('新台入替', W / 2, 150); c.font = '900 84px Mont'; c.fillText('NEW MACHINES', W / 2, 280); frame(c, W, H, 12, '#f2a8e0'); });
  g.add(box(4.2, 1.5, 0.2, [flat('#2a0f33'), flat('#2a0f33'), flat('#2a0f33'), flat('#2a0f33'), glowMat(topT, 0.9), flat('#2a0f33')], [-0.4, 6.75, -2.82]));
  g.add(point('#d85ae0', 16, [-0.4, 6.4, -1.2], 12)); g.add(glow('#d85ae0', 6, [-0.4, 6.6, -2.5], 0.16));
  // glass doors with the warm hall visible inside
  const doorT = tex(1024, 820, (c, W, H) => { fill(c, W, H, '#fff1c8', '#ffc66a');
    c.fillStyle = '#8f1f24'; c.fillRect(0, H * 0.72, W, H * 0.28); for (let i = 0; i < 12; i++) { c.strokeStyle = '#d99a3a'; c.lineWidth = 4; c.strokeRect(40 + i * 84, H * 0.8, 36, 36); }
    for (const sx of [0, 1]) for (let i = 0; i < 5; i++) { const x = sx ? W - 90 - i * 78 : 30 + i * 78; F(rectD(x, H * 0.3 + i * 22, 60, H * 0.42 - i * 22, 10), '#c9ccd8', { line: 5, seed: i + sx * 9, shadow: 0.25 }); c.fillStyle = ['#ffcf4a', '#5ad0ff', '#ffe08a'][i % 3]; c.fillRect(x + 10, H * 0.33 + i * 22, 40, 90 - i * 10); }
    for (let i = 0; i < 4; i++) { c.fillStyle = '#c81f2a'; c.beginPath(); c.ellipse(W * 0.36 + i * 90, H * 0.74 - i * 6, 34 - i * 4, 12, 0, 0, 6.3); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(W / 2 - 40, 30, 80, H * 0.5);
    Ln(`M ${W / 2} 0 L ${W / 2} ${H}`, 10, 1, INK); Ln(`M ${W * 0.25} 0 L ${W * 0.25} ${H} M ${W * 0.75} 0 L ${W * 0.75} ${H}`, 5, 2, 'rgba(40,30,20,0.6)');
    c.fillStyle = 'rgba(60,40,20,0.6)'; c.font = '800 30px Mont'; c.textAlign = 'center'; c.fillText('AUTO DOOR', W * 0.37, H * 0.5); frame(c, W, H, 14); });
  g.add(plane(3.6, 2.9, glowMat(doorT, 0.8), [-0.4, 1.45, -2.96]));
  g.add(inkBox(3.9, 0.3, 0.5, '#2a2c5a', [-0.4, 3.05, -2.8]));
  g.add(point('#ffd27a', 12, [-0.4, 1.6, -1.4], 10, 1.4)); g.add(glow('#ffd88a', 5, [-0.4, 1.5, -2.6], 0.1));
  const refl = plane(3.2, 5, new THREE.MeshBasicMaterial({ color: '#ffcf7a', blending: THREE.AdditiveBlending, transparent: true, opacity: 0.22, depthWrite: false }), [-0.4, 0.02, -0.3], [-Math.PI / 2, 0, 0]); g.add(refl);
  // side posters (glowing panels)
  const poster = (txt, sub, c0, c1, art) => tex(240, 720, (c, W, H) => { fill(c, W, H, c0, c1); c.textAlign = 'center'; c.fillStyle = '#fff3d0'; c.font = '900 110px Mont'; c.fillText(art, W / 2, 200);
    c.font = `700 56px ${J}`; [...txt].forEach((ch, i) => c.fillText(ch, W / 2, 330 + i * 70)); c.font = '800 22px Mont'; c.fillText(sub, W / 2, H - 40); frame(c, W, H, 9, '#f2c36a'); });
  g.add(plane(0.75, 2.25, glowMat(poster('海の夢', 'OCEAN DREAM', '#1f4fa8', '#0f2a66', '~'), 1.1), [-2.85, 1.6, -2.94]));
  g.add(plane(0.75, 2.25, glowMat(poster('ラッキー', 'LUCKY SEVEN', '#8a2a6a', '#4a1240', '7'), 1.1), [2.05, 1.6, -2.94]));
  // props: vending machine, bike, planter, kerb
  g.add(inkBox(0.9, 1.9, 0.6, '#2f6fd8', [3.4, 0.95, -2.55], { col2: '#1f4fae', detail: (c, W, H, fw) => { if (fw > 0.8) { F(rectD(W * 0.1, H * 0.06, W * 0.8, H * 0.5, 6), '#dff1ff', { line: 5, seed: 1, shadow: 0 }); for (let i = 0; i < 12; i++) { c.fillStyle = ['#e44', '#3b6', '#fc3', '#39f'][i % 4]; c.fillRect(W * (0.16 + (i % 4) * 0.18), H * (0.1 + Math.floor(i / 4) * 0.15), W * 0.1, H * 0.1); } } } }));
  g.add(inkBox(14, 0.14, 0.5, '#5a5f9f', [0, 0.07, 2.4], { px: 128 }));
  scene.add(new THREE.HemisphereLight('#6a74ff', '#2a2260', 1.5)); const moon = new THREE.DirectionalLight('#8fa2ff', 0.8); moon.position.set(3, 8, 6); scene.add(moon);
  g.add(point('#4a8aff', 6, [3.2, 1.4, -1.6], 6));
  const cop = new Actor({ name: 'cop', body: '#2f55b8', sh: '#0a1848', shoe: '#15161f', hat: 'police' }).addTo(scene);
  const hero = new Actor(HERO).addTo(scene);
  const exitA = new Actor({ ...LOOKS.A, body: '#e8a23a', sh: '#5a3505', hair: 'mop', hairCol: '#d8d2c8', hairSh: '#6a645c', trim: 'none' }).addTo(scene);
  return { scene, cop, hero, exitA };
}
