// Train #4 costume pieces drawn over our rig's head (our own Canvas2D art): hats + mustaches.
import { F, Ln, ellD, INK } from '/toon/kit.js';
const pts = (a) => 'M ' + a.map((p) => p.join(' ')).join(' L ') + ' Z';
export function extras(list, hx, hy, r) {
  for (const e of list || []) {
    if (e === 'tophat') {
      F(ellD(hx, hy - r * 0.86, r * 1.05, r * 0.2), '#1d1a22', { line: 5, seed: 601, shadow: 0.2, soft: 0, hi: 0.25 });
      F(pts([[hx - r * 0.62, hy - r * 0.9], [hx - r * 0.58, hy - r * 2.05], [hx + r * 0.58, hy - r * 2.05], [hx + r * 0.62, hy - r * 0.9]]), '#26222c', { line: 5, seed: 602, shadow: 0.35, soft: 0.2, hi: 0.35 });
      F(pts([[hx - r * 0.61, hy - r * 1.02], [hx + r * 0.61, hy - r * 1.02], [hx + r * 0.6, hy - r * 1.24], [hx - r * 0.6, hy - r * 1.24]]), '#a3262a', { line: 4, seed: 603, shadow: 0.2, soft: 0, hi: 0.2 });
    }
    if (e === 'cowboy' || e === 'straw') {
      const c = e === 'cowboy' ? '#8a5a32' : '#e6c46a', b = e === 'cowboy' ? '#5e3a1e' : '#b98d3a';
      F(ellD(hx, hy - r * 0.78, r * 1.45, r * 0.26), c, { line: 5, seed: 611, shadow: 0.3, soft: 0.1, hi: 0.2 });
      F(pts([[hx - r * 0.66, hy - r * 0.82], [hx - r * 0.55, hy - r * 1.45], [hx - r * 0.15, hy - r * 1.6], [hx, hy - r * 1.45], [hx + r * 0.15, hy - r * 1.6], [hx + r * 0.55, hy - r * 1.45], [hx + r * 0.66, hy - r * 0.82]]), c, { line: 5, seed: 612, shadow: 0.35, soft: 0.2, hi: 0.3 });
      F(pts([[hx - r * 0.65, hy - r * 0.86], [hx + r * 0.65, hy - r * 0.86], [hx + r * 0.63, hy - r * 1.02], [hx - r * 0.63, hy - r * 1.02]]), b, { line: 4, seed: 613, shadow: 0.2, soft: 0, hi: 0.1 });
    }
    if (e === 'bonnet') {
      F(pts([[hx - r * 1.08, hy + r * 0.15], [hx - r * 1.1, hy - r * 0.7], [hx - r * 0.6, hy - r * 1.18], [hx + r * 0.6, hy - r * 1.18], [hx + r * 1.1, hy - r * 0.7], [hx + r * 1.08, hy + r * 0.15], [hx + r * 0.86, hy + r * 0.1], [hx + r * 0.8, hy - r * 0.55], [hx, hy - r * 0.85], [hx - r * 0.8, hy - r * 0.55], [hx - r * 0.86, hy + r * 0.1]]),
        '#e98aa6', { line: 5, seed: 621, shadow: 0.35, soft: 0.2, hi: 0.2 });
    }
    if (e === 'cap') {
      F(pts([[hx - r * 0.95, hy - r * 0.5], [hx - r * 0.85, hy - r * 1.0], [hx, hy - r * 1.18], [hx + r * 0.85, hy - r * 1.0], [hx + r * 0.95, hy - r * 0.5]]), '#3d5aa8', { line: 5, seed: 631, shadow: 0.3, soft: 0.2, hi: 0.2 });
      F(pts([[hx + r * 0.2, hy - r * 0.55], [hx + r * 1.35, hy - r * 0.45], [hx + r * 1.3, hy - r * 0.35], [hx + r * 0.2, hy - r * 0.42]]), '#2a3f7a', { line: 4, seed: 632, shadow: 0, soft: 0, hi: 0.1 });
    }
    if (e === 'mustache') {   // big handlebar
      const y = hy + r * 0.3;
      F(pts([[hx, y - r * 0.05], [hx - r * 0.18, y - r * 0.1], [hx - r * 0.42, y - r * 0.02], [hx - r * 0.55, y - r * 0.16], [hx - r * 0.5, y + r * 0.06], [hx - r * 0.22, y + r * 0.1], [hx, y + r * 0.04],
        [hx + r * 0.22, y + r * 0.1], [hx + r * 0.5, y + r * 0.06], [hx + r * 0.55, y - r * 0.16], [hx + r * 0.42, y - r * 0.02], [hx + r * 0.18, y - r * 0.1]]), '#d9d4cc', { line: 4.5, seed: 641, shadow: 0.3, shadowCol: '#8f8a80', soft: 0.2, hi: 0.2 });
    }
    if (e === 'beard') {
      F(pts([[hx - r * 0.55, hy + r * 0.2], [hx - r * 0.4, hy + r * 0.75], [hx, hy + r * 0.95], [hx + r * 0.4, hy + r * 0.75], [hx + r * 0.55, hy + r * 0.2], [hx + r * 0.2, hy + r * 0.52], [hx - r * 0.2, hy + r * 0.52]]), '#cfc8bc', { line: 4.5, seed: 651, shadow: 0.3, soft: 0.2, hi: 0.1 });
    }
  }
}
