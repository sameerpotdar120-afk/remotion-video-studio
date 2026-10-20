"""Trim the transparent margin around stamp impressions so their art fills the box StampSlam draws.

GPT returns stamps on a square 2048² canvas with the ink only in the middle ~37% of the height; drawn into a
wide box (e.g. 900×360) the square canvas was squashed. Cropping to the ink (+3% pad) keeps the art's own
proportions. Idempotent: an already-trimmed file is left as is.
usage: python3 scripts/prep_props.py public/assets/props/stamp_*.png
"""
import sys
import numpy as np
from PIL import Image

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    ys, xs = np.nonzero(a[:, :, 3] > 20)
    if not len(xs): print('empty', path); continue
    pad = int(0.03 * max(xs.max() - xs.min(), ys.max() - ys.min()))
    box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(a.shape[1], xs.max() + pad + 1), min(a.shape[0], ys.max() + pad + 1))
    if box == (0, 0, a.shape[1], a.shape[0]): print('already trimmed', path); continue
    im.crop(box).save(path, optimize=True)
    print(f"{path}: {a.shape[1]}x{a.shape[0]} -> {box[2]-box[0]}x{box[3]-box[1]}")
