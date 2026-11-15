"""Measure colour boxes in a reference frame and ours, report the per-channel gap (target: within ~8 units).
usage: python3 colormatch.py ref.png ours.png --box sky 40,40,300,300 --box ground 100,2300,1300,2500 [--size 1440x2560]
Boxes are x0,y0,x1,y1 in the --size frame (both images are resized to it first)."""
import argparse
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('ref'); ap.add_argument('ours')
ap.add_argument('--box', nargs=2, action='append', metavar=('NAME', 'X0,Y0,X1,Y1'), required=True)
ap.add_argument('--size', default='1440x2560'); a = ap.parse_args()
W, H = map(int, a.size.split('x'))
def load(p): return np.asarray(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)).astype(float)
R, O = load(a.ref), load(a.ours); worst = 0
for name, b in a.box:
    x0, y0, x1, y1 = map(int, b.split(','))
    r = R[y0:y1, x0:x1].reshape(-1, 3).mean(0).round().astype(int); o = O[y0:y1, x0:x1].reshape(-1, 3).mean(0).round().astype(int)
    d = o - r; worst = max(worst, np.abs(d).max())
    print(f'{name:14s} ref {r.tolist()}  ours {o.tolist()}  diff {d.tolist()}  {"OK" if np.abs(d).max() <= 8 else "FIX"}')
print(f'worst channel gap: {worst} -> colour score ~{max(0, 10 - max(0, worst - 8) / 4):.1f}/10')
