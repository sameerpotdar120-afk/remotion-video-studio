// Renderer + film look for the 4K build: ACES, soft shadows, GTAO ambient occlusion, depth of field, bloom, grade.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const W = 2160, H = 3840;
const Q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const RES = +(Q.get('res') || 1), AA = +(Q.get('aa') ?? 4), SHADOW = +(Q.get('shadow') || 4096), AO = +(Q.get('ao') ?? 1);
const GRADE = {
  uniforms: { tDiffuse: { value: null }, uVig: { value: 0.25 }, uGrain: { value: 0.012 }, uTime: { value: 0 }, uWarm: { value: 0.02 },
    uTex: { value: new THREE.Vector2(1 / W, 1 / H) }, uSharp: { value: 0.28 }, uSat: { value: 1.1 }, uCon: { value: 0.1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uVig, uGrain, uTime, uWarm, uSharp, uSat, uCon; uniform vec2 uTex; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 7.13) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5; float r = length(d * vec2(0.5625, 1.0)) * 1.6;
      vec2 ca = d * 0.0009 * r * r;
      vec3 c = vec3(texture2D(tDiffuse, vUv + ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - ca).b);
      vec3 bl = (texture2D(tDiffuse, vUv + vec2(uTex.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(uTex.x, 0.0)).rgb + texture2D(tDiffuse, vUv + vec2(0.0, uTex.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, uTex.y)).rgb) * 0.25;
      c += (c - bl) * uSharp;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, uSat);
      c = clamp(c, 0.0, 1.0); c = mix(c, c * c * (3.0 - 2.0 * c), uCon);
      float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c += vec3(0.028, 0.012, -0.022) * smoothstep(0.5, 1.0, lum) * (1.0 + uWarm * 8.0);
      c += vec3(-0.01, 0.0, 0.016) * (1.0 - smoothstep(0.0, 0.32, lum));
      c *= 1.0 - uVig * smoothstep(0.35, 0.95, r);
      c += (h(vUv * 2400.0) - 0.5) * uGrain;
      gl_FragColor = vec4(c, 1.0); }`,
};
export function makeEngine(canvas, { w = W, h = H, samples = 4 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h, false); renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples });
  const composer = new EffectComposer(renderer, rt); composer.setSize(w, h);
  const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()); composer.addPass(rp);
  let gtao = null;
  if (AO) { gtao = new GTAOPass(rp.scene, rp.camera, w, h); gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 1.0; composer.addPass(gtao); }
  const bokeh = new BokehPass(rp.scene, rp.camera, { focus: 10, aperture: 0.0005, maxblur: 0.006 }); composer.addPass(bokeh);
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.2, 0.5, 0.9); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GRADE); composer.addPass(grade);
  return {
    renderer, composer,
    render(scene, camera, look = {}) {
      rp.scene = scene; rp.camera = camera; bokeh.scene = scene; bokeh.camera = camera;
      if (gtao) { gtao.scene = scene; gtao.camera = camera; gtao.updateGtaoMaterial({ radius: look.aoRadius ?? 0.6, distanceExponent: 1.5, thickness: look.aoThick ?? 1.0, scale: 1.0, samples: 16 }); gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); gtao.blendIntensity = look.ao ?? 1.0; }
      bokeh.enabled = (look.aperture ?? 0) > 0;
      bokeh.uniforms.focus.value = look.focus ?? 10; bokeh.uniforms.aperture.value = look.aperture ?? 0; bokeh.uniforms.maxblur.value = look.maxblur ?? 0.006;
      bloom.strength = look.bloom ?? 0.18; bloom.threshold = look.bloomThreshold ?? 0.9; bloom.radius = 0.5;
      renderer.toneMappingExposure = look.exposure ?? 1.0;
      Object.assign(grade.uniforms.uVig, { value: look.vignette ?? 0.25 }); grade.uniforms.uGrain.value = look.grain ?? 0.012; grade.uniforms.uWarm.value = look.warm ?? 0.02; grade.uniforms.uTime.value = look.t ?? 0;
      composer.render();
    },
  };
}
