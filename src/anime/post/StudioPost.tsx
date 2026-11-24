// "Studio" picture pipeline for the anime Western: what turns a raw 3D render into a finished anime frame.
//  1. supersampled beauty render (HDR, with a depth texture)
//  2. a normal pass (opaque geometry only, no ink hulls / sprites / sky) for line detection
//  3. composite: hand-drawn style ink lines from depth + normal discontinuities (inner lines too: face, folds, fingers),
//     coloured line tint (lines take a dark version of the colour under them, like cel animation), depth-of-field (circle of confusion
//     from real camera depth), colour grade (violet shadows, warm highlights, saturation, gentle S-curve)
//  4. bloom from the brightest parts (sun, lamps, muzzle flashes), at quarter resolution
//  5. final: tone map (Neutral), film grain, vignette, sRGB out.
// Everything is a pure function of the scene + camera, so any frame renders identically on its own.
import React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

export type PostOpts = {
  ss?: number;                       // supersampling factor for the beauty + normal renders
  line?: number;                     // ink line strength 0..1
  lineWidth?: number;                // in output pixels
  dof?: { focus: number; range: number; maxPx: number } | null;   // focus distance (m), depth range that stays sharp (m), max blur radius (px)
  bloom?: number; bloomThreshold?: number;
  exposure?: number; saturation?: number; shadowTint?: [number, number, number]; highlightTint?: [number, number, number]; contrast?: number;
  grain?: number; vignette?: number; seed?: number;
  drawn?: number;                    // 0..1: 2D illustration look (flat colour bands, pen hatching in shadows, bold outer lines, line boil, paper)
  hatch?: number; outerWidth?: number;
};
const DEF: Required<Omit<PostOpts, "dof">> & { dof: PostOpts["dof"] } = {
  ss: 1.5, line: 0.9, lineWidth: 1.6, dof: null, bloom: 0.55, bloomThreshold: 0.92, exposure: 1.0, saturation: 1.12,
  shadowTint: [0.46, 0.38, 0.66], highlightTint: [1.0, 0.94, 0.84], contrast: 1.06, grain: 0.035, vignette: 0.32, seed: 0, drawn: 0, hatch: 0.6, outerWidth: 2.6,
};

const quadVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const COMPOSITE = `
precision highp float; varying vec2 vUv;
uniform sampler2D tColor, tDepth, tNormal; uniform vec2 texel; uniform float near, far, lineW, lineK;
uniform float dofOn, focus, range, maxPx; uniform vec2 outTexel; uniform float drawn, hatchK, outerW, seed;
uniform float exposure, saturation, contrast; uniform vec3 shadowTint, highlightTint;
float linDepth(vec2 uv){ float d = texture2D(tDepth, uv).x; return near * far / (far - d * (far - near)); }
vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }
const vec2 PD[16] = vec2[16](vec2(-0.613,0.617),vec2(0.170,-0.040),vec2(-0.299,0.791),vec2(0.645,0.493),vec2(-0.651,-0.717),vec2(0.421,-0.027),vec2(-0.817,-0.271),vec2(-0.705,0.081),
  vec2(0.977,-0.108),vec2(0.063,-0.229),vec2(0.493,-0.592),vec2(-0.153,-0.996),vec2(0.229,0.868),vec2(-0.341,-0.430),vec2(0.758,0.880),vec2(-0.054,0.414));
void main(){
  float zc = linDepth(vUv);
  // ---- depth of field: gather inside a disc whose radius follows the circle of confusion ----
  vec3 col = texture2D(tColor, vUv).rgb;
  if (dofOn > 0.5) {
    float coc = clamp(abs(zc - focus) / range - 0.15, 0.0, 1.0) * maxPx;
    if (coc > 0.6) { vec3 acc = col; float wsum = 1.0;
      for (int i = 0; i < 16; i++) { vec2 o = PD[i] * coc * outTexel; float zs = linDepth(vUv + o); float cs = clamp(abs(zs - focus) / range - 0.15, 0.0, 1.0) * maxPx;
        float w = (zs < zc - 0.3) ? smoothstep(0.0, 1.0, cs / max(coc, 1e-3)) : 1.0; acc += texture2D(tColor, vUv + o).rgb * w; wsum += w; }
      col = acc / wsum; }
  }
  // ---- ink lines from depth + normal edges (sampled at the line width), weaker for far things and blurred areas ----
  // line boil: the line-sampling grid wobbles a little every other frame, like redrawn ink
  vec2 boil = drawn * (vec2(fract(sin(dot(floor(vUv * 90.0), vec2(12.9898, 78.233)) + seed) * 43758.5) , fract(sin(dot(floor(vUv * 90.0), vec2(39.3468, 11.135)) + seed * 1.7) * 23421.6)) - 0.5) * texel * 1.2;
  vec2 o = texel * lineW; float de = 0.0, ne = 0.0; vec3 nc = nrm(vUv + boil);
  vec2 offs[4] = vec2[4](vec2(o.x, 0.0), vec2(-o.x, 0.0), vec2(0.0, o.y), vec2(0.0, -o.y));
  float zmin = zc;
  for (int i = 0; i < 4; i++) { float zi = linDepth(vUv + boil + offs[i]); zmin = min(zmin, zi); ne = max(ne, 1.0 - dot(nc, nrm(vUv + boil + offs[i]))); }
  // outer (silhouette) lines are drawn thicker than the inner ones
  vec2 oo = texel * lineW * mix(1.0, outerW, drawn);
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398; float zi = linDepth(vUv + boil + vec2(cos(a), sin(a)) * oo); zmin = min(zmin, zi); de = max(de, (zc - zi) / zi); }
  float depthLine = smoothstep(0.035, 0.09, de);
  float normLine = smoothstep(0.32, 0.6, ne) * step(zmin, 60.0);
  float fade = 1.0 - smoothstep(25.0, 140.0, zmin);
  float blurFade = dofOn > 0.5 ? 1.0 - clamp(abs(zmin - focus) / range - 0.15, 0.0, 1.0) * 0.85 : 1.0;
  float ink = clamp(max(depthLine, normLine * 0.85), 0.0, 1.0) * lineK * fade * blurFade;
  vec3 lineCol = mix(col * vec3(0.22, 0.17, 0.26) + vec3(0.03, 0.02, 0.05), vec3(0.05, 0.03, 0.06), drawn * 0.7);
  // 2D illustration: flatten the shading into bands, keep hue; pen hatching where it's dark
  if (drawn > 0.0 && zc < 150.0) {
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float band = lum < 0.06 ? 0.035 : lum < 0.2 ? 0.12 : lum < 0.5 ? 0.33 : 0.72 + floor((lum - 0.5) * 3.0) * 0.22;
    vec3 flatC = col * (band / max(lum, 1e-3));
    col = mix(col, flatC, drawn * 0.65 * (1.0 - clamp(abs(zc - focus) / max(range, 1e-3) * 0.2 * dofOn, 0.0, 0.6)));
    vec2 px = vUv / outTexel; float wob = sin(px.y * 0.05 + seed) * 2.0;
    float h1 = smoothstep(0.55, 0.8, abs(fract((px.x + px.y + wob) / 7.0) - 0.5) * 2.0);
    float h2 = smoothstep(0.6, 0.85, abs(fract((px.x - px.y - wob) / 8.0) - 0.5) * 2.0);
    float dark = 1.0 - smoothstep(0.08, 0.3, lum);
    float hatch = (h1 * smoothstep(0.0, 0.5, dark) + h2 * smoothstep(0.5, 1.0, dark)) * hatchK * drawn * fade * (zc < 30.0 ? 1.0 : 0.0);
    col = mix(col, col * vec3(0.45, 0.3, 0.35), hatch * 0.55);
    // paper: soft large-scale mottling
    float paper = fract(sin(dot(floor(px / 3.0), vec2(12.9898, 78.233))) * 43758.5);
    col *= 1.0 + (paper - 0.5) * 0.035 * drawn;
  }
  col = mix(col, lineCol, ink);
  // ---- grade ----
  col *= exposure;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, saturation);
  float sh = 1.0 - smoothstep(0.0, 0.45, l), hi = smoothstep(0.55, 1.2, l);
  col *= mix(vec3(1.0), shadowTint * 1.6, sh * 0.35); col *= mix(vec3(1.0), highlightTint, hi * 0.6);
  col = mix(col, col * col * (3.0 - 2.0 * col), (contrast - 1.0) * 2.0 * step(col, vec3(1.0)));
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;
const BRIGHT = `precision highp float; varying vec2 vUv; uniform sampler2D tIn; uniform float thr; void main(){ vec3 c = texture2D(tIn, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(thr, thr + 0.35, l), 1.0); }`;
const BLUR = `precision highp float; varying vec2 vUv; uniform sampler2D tIn; uniform vec2 dir;
  void main(){ vec3 c = texture2D(tIn, vUv).rgb * 0.227; c += (texture2D(tIn, vUv + dir * 1.385).rgb + texture2D(tIn, vUv - dir * 1.385).rgb) * 0.316; c += (texture2D(tIn, vUv + dir * 3.23).rgb + texture2D(tIn, vUv - dir * 3.23).rgb) * 0.07; gl_FragColor = vec4(c, 1.0); }`;
const FINAL = `precision highp float; varying vec2 vUv; uniform sampler2D tIn, tBloom, tBloom2; uniform float bloom, grain, vig, seed; uniform vec2 res;
  vec3 neutral(vec3 color){ const float startCompression = 0.8 - 0.04; const float desaturation = 0.15; float x = min(color.r, min(color.g, color.b)); float offset = x < 0.08 ? x - 6.25 * x * x : 0.04; color -= offset;
    float peak = max(color.r, max(color.g, color.b)); if (peak < startCompression) return color; float d = 1.0 - startCompression; float newPeak = 1.0 - d * d / (peak + d - startCompression); color *= newPeak / peak; float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0); return mix(color, vec3(newPeak), g); }
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32 + seed); return fract(p.x * p.y); }
  vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
  void main(){ vec3 c = texture2D(tIn, vUv).rgb + (texture2D(tBloom, vUv).rgb * 0.65 + texture2D(tBloom2, vUv).rgb * 0.55) * bloom;
    c = neutral(c); vec2 q = vUv - 0.5; q.x *= res.x / res.y; c *= 1.0 - vig * smoothstep(0.35, 0.95, length(q) * 1.25);
    vec3 s = toSRGB(clamp(c, 0.0, 1.0)); s += (hash(vUv * res) - 0.5) * grain; gl_FragColor = vec4(s, 1.0); }`;

const mat = (fs: string, uniforms: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({ vertexShader: quadVS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false });
type Pipe = { rtMain: THREE.WebGLRenderTarget; rtNorm: THREE.WebGLRenderTarget; rtComp: THREE.WebGLRenderTarget; b1: THREE.WebGLRenderTarget; b2: THREE.WebGLRenderTarget; c1: THREE.WebGLRenderTarget; c2: THREE.WebGLRenderTarget;
  comp: THREE.ShaderMaterial; bright: THREE.ShaderMaterial; blur: THREE.ShaderMaterial; fin: THREE.ShaderMaterial; quad: THREE.Mesh; qScene: THREE.Scene; qCam: THREE.OrthographicCamera; normalMat: THREE.MeshNormalMaterial };

export const StudioPost: React.FC<{ opts?: () => PostOpts }> = ({ opts }) => {
  const { gl, scene, camera, size } = useThree();
  const pipe = React.useMemo<Pipe>(() => {
    const o = { ...DEF, ...(opts?.() ?? {}) }; const W = Math.round(size.width * o.ss), H = Math.round(size.height * o.ss);
    const hdr = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    const rtMain = new THREE.WebGLRenderTarget(W, H, { ...hdr, depthTexture: new THREE.DepthTexture(W, H, THREE.FloatType) });
    const rtNorm = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const rtComp = new THREE.WebGLRenderTarget(size.width, size.height, hdr);
    const b1 = new THREE.WebGLRenderTarget(size.width / 4, size.height / 4, hdr), b2 = new THREE.WebGLRenderTarget(size.width / 4, size.height / 4, hdr);
    const c1 = new THREE.WebGLRenderTarget(size.width / 16, size.height / 16, hdr), c2 = new THREE.WebGLRenderTarget(size.width / 16, size.height / 16, hdr);
    const U = (v: unknown) => ({ value: v });
    const comp = mat(COMPOSITE, { tColor: U(rtMain.texture), tDepth: U(rtMain.depthTexture), tNormal: U(rtNorm.texture), drawn: U(0), hatchK: U(0.6), outerW: U(2.6), seed: U(0), texel: U(new THREE.Vector2(1 / W, 1 / H)), outTexel: U(new THREE.Vector2(1 / size.width, 1 / size.height)),
      near: U(0.1), far: U(1000), lineW: U(1), lineK: U(1), dofOn: U(0), focus: U(5), range: U(3), maxPx: U(8), exposure: U(1), saturation: U(1), contrast: U(1), shadowTint: U(new THREE.Vector3()), highlightTint: U(new THREE.Vector3()) });
    const bright = mat(BRIGHT, { tIn: U(rtComp.texture), thr: U(1) }), blur = mat(BLUR, { tIn: U(b1.texture), dir: U(new THREE.Vector2()) });
    const fin = mat(FINAL, { tIn: U(rtComp.texture), tBloom: U(b1.texture), tBloom2: U(c1.texture), bloom: U(0.5), grain: U(0.03), vig: U(0.3), seed: U(0), res: U(new THREE.Vector2(size.width, size.height)) });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp); quad.frustumCulled = false; const qScene = new THREE.Scene(); qScene.add(quad); const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { rtMain, rtNorm, rtComp, b1, b2, c1, c2, comp, bright, blur, fin, quad, qScene, qCam, normalMat: new THREE.MeshNormalMaterial() };
  }, [size.width, size.height]);

  useFrame(() => {
    const o = { ...DEF, ...(opts?.() ?? {}) }; const p = pipe; const cam = camera as THREE.PerspectiveCamera;
    const prevTM = gl.toneMapping; gl.toneMapping = THREE.NoToneMapping;
    // 1. beauty
    gl.setRenderTarget(p.rtMain); gl.clear(); gl.render(scene, cam);
    // 2. normals of opaque geometry only
    const hidden: THREE.Object3D[] = [];
    scene.traverse((ob) => { if (!ob.visible) return; const m = (ob as THREE.Mesh).material as THREE.Material | undefined; const isSprite = (ob as THREE.Sprite).isSprite || (ob as THREE.Points).isPoints;
      if (isSprite || (m && (m.transparent || m.depthWrite === false || (m.side === THREE.BackSide && (m as THREE.MeshBasicMaterial).isMeshBasicMaterial)))) { ob.visible = false; hidden.push(ob); } });
    const bg = scene.background; scene.background = null; scene.overrideMaterial = p.normalMat; const fog = scene.fog; scene.fog = null;
    gl.setRenderTarget(p.rtNorm); gl.setClearColor(0x8080ff, 1); gl.clear(); gl.render(scene, cam);
    scene.overrideMaterial = null; scene.background = bg; scene.fog = fog; for (const ob of hidden) ob.visible = true; gl.setClearColor(0x000000, 0);
    // 3. composite
    const u = p.comp.uniforms; u.near.value = cam.near; u.far.value = cam.far; u.lineW.value = o.lineWidth * o.ss; u.lineK.value = o.line;
    u.dofOn.value = o.dof ? 1 : 0; if (o.dof) { u.focus.value = o.dof.focus; u.range.value = o.dof.range; u.maxPx.value = o.dof.maxPx; }
    u.drawn.value = o.drawn; u.hatchK.value = o.hatch; u.outerW.value = o.outerWidth; u.seed.value = Math.floor(o.seed / 2) * 1.37;
    u.exposure.value = o.exposure; u.saturation.value = o.saturation; u.contrast.value = o.contrast; (u.shadowTint.value as THREE.Vector3).set(...o.shadowTint); (u.highlightTint.value as THREE.Vector3).set(...o.highlightTint);
    const pass = (m: THREE.ShaderMaterial, rt: THREE.WebGLRenderTarget | null) => { p.quad.material = m; gl.setRenderTarget(rt); gl.render(p.qScene, p.qCam); };
    pass(p.comp, p.rtComp);
    // 4. bloom (quarter + sixteenth res)
    p.bright.uniforms.thr.value = o.bloomThreshold; p.bright.uniforms.tIn.value = p.rtComp.texture; pass(p.bright, p.b1);
    for (let i = 0; i < 2; i++) { p.blur.uniforms.tIn.value = p.b1.texture; (p.blur.uniforms.dir.value as THREE.Vector2).set(1 / p.b1.width, 0); pass(p.blur, p.b2); p.blur.uniforms.tIn.value = p.b2.texture; (p.blur.uniforms.dir.value as THREE.Vector2).set(0, 1 / p.b1.height); pass(p.blur, p.b1); }
    p.blur.uniforms.tIn.value = p.b1.texture; (p.blur.uniforms.dir.value as THREE.Vector2).set(1 / p.b1.width, 0); pass(p.blur, p.c1);
    for (let i = 0; i < 2; i++) { p.blur.uniforms.tIn.value = p.c1.texture; (p.blur.uniforms.dir.value as THREE.Vector2).set(1 / p.c1.width, 0); pass(p.blur, p.c2); p.blur.uniforms.tIn.value = p.c2.texture; (p.blur.uniforms.dir.value as THREE.Vector2).set(0, 1 / p.c1.height); pass(p.blur, p.c1); }
    // 5. final to screen
    const f = p.fin.uniforms; f.bloom.value = o.bloom; f.grain.value = o.grain; f.vig.value = o.vignette; f.seed.value = o.seed;
    pass(p.fin, null);
    gl.toneMapping = prevTM;
  }, 1);
  return null;
};
