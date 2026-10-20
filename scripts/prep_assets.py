"""
Installs incoming assets into public/assets and measures character rigs automatically.

Characters: cropped to their alpha bounding box (+2% pad) so FEET = bottom edge exactly, then the
blank face is found by flood-filling the largest flat skin-coloured area in the upper body.
Writes src/lib/character/rigs.generated.json: {file: {aspect, face:{x,y,w}, shoulderL, shoulderR}}.
"""
import json, os, shutil, sys
from collections import deque
import numpy as np
from PIL import Image

src_root, dst_root = sys.argv[1], sys.argv[2]
rigs = {}
for folder in sorted(os.listdir(src_root)):
    os.makedirs(f'{dst_root}/{folder}', exist_ok=True)
    for f in sorted(os.listdir(f'{src_root}/{folder}')):
        s, d = f'{src_root}/{folder}/{f}', f'{dst_root}/{folder}/{f}'
        if folder != 'chars' or f.startswith('_') or 'crowd' in f or 'on_horse' in f:
            shutil.copyfile(s, d)
            continue
        im = Image.open(s).convert('RGBA')
        a = np.array(im)
        ys, xs = np.nonzero(a[:, :, 3] > 20)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pad = int(0.02 * (y1 - y0))
        box = (max(0, x0 - pad), max(0, y0 - pad), min(a.shape[1], x1 + pad), y1 + 1)  # feet = bottom edge
        im = im.crop(box)
        im.save(d, optimize=True)
        a = np.array(im).astype(int)
        h, w = a.shape[:2]
        # face = biggest flat region in the top 55%: seed at the most common opaque colour there
        top = a[: int(h * 0.55)]
        mask = top[:, :, 3] > 200
        cols = (top[:, :, :3][mask] // 8)
        vals, counts = np.unique(cols[:, 0] * 1024 + cols[:, 1] * 32 + cols[:, 2], return_counts=True)
        best = None
        for v in vals[np.argsort(-counts)][:6]:
            tgt = np.array([v // 1024, (v // 32) % 32, v % 32]) * 8 + 4
            close = (np.abs(top[:, :, :3] - tgt).sum(axis=2) < 36) & mask
            # largest 4-connected component via BFS on a downsampled grid
            step = 4
            g = close[::step, ::step]
            seen = np.zeros_like(g, bool)
            for sy, sx in zip(*np.nonzero(g)):
                if seen[sy, sx]: continue
                q = deque([(sy, sx)]); seen[sy, sx] = True; pts = []
                while q:
                    y, x = q.popleft(); pts.append((y, x))
                    for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                        if 0 <= ny < g.shape[0] and 0 <= nx < g.shape[1] and g[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if best is None or len(pts) > len(best):
                    best = pts
        py = np.array([p[0] for p in best]) * 4; px = np.array([p[1] for p in best]) * 4
        fx0, fx1, fy0, fy1 = px.min(), px.max(), py.min(), py.max()
        face = {'x': round((fx0 + fx1) / 2 / w, 4), 'y': round((fy0 + fy1) / 2 / h, 4), 'w': round((fx1 - fx0) / w * 0.78, 4)}
        sy = (fy1 + 0.05 * h) / h
        half = min(0.3, (fx1 - fx0) / w * 0.42)
        rigs[f] = {'aspect': round(w / h, 4), 'face': face, 'faceBox': [round(fx0/w,4), round(fy0/h,4), round(fx1/w,4), round(fy1/h,4)],
                   'shoulderL': [round(face['x'] - half, 4), round(sy, 4)], 'shoulderR': [round(face['x'] + half, 4), round(sy, 4)]}
json.dump(rigs, open('src/lib/character/rigs.generated.json', 'w'), indent=1)
print('chars measured:', len(rigs))
