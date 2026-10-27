"""
Installs the generated Russia images into public/russia/assets/<folder>/ at the sizes the video needs, and
measures every character's rig (face box + shoulders) for the Peg doll.

    python3 scripts/russia/prep_assets.py <dir that contains chars/ horses/ cards/ bg/ props/ docs/ (any depth)>

- chars:  cropped to the alpha box (bottom = bottom of the body), 1600 px tall, PNG  → rigs.generated.json
- horses: cropped to the alpha box, then padded to 3:2 with the hooves on the bottom edge, 2048 px wide
- props/docs: cropped to the alpha box, longest side 1600 px, PNG
- cards:  1280 px wide JPG; bg: 3840 px wide JPG (the code asks for the .png name, core.ts resolves the .jpg)
Writes src/russia/kit/assets.generated.json (every installed file, as the code names it) and rigs.generated.json.
"""
import glob, json, os, sys
from collections import deque
import numpy as np
from PIL import Image

SRC = sys.argv[1]
DST = 'public/russia/assets'
JPG = {'bg': 3840, 'cards': 1280}

def crop_alpha(im):
    a = np.array(im)[:, :, 3]
    ys, xs = np.nonzero(a > 20)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def fit(im, longest):
    s = longest / max(im.size)
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS) if s < 1 else im

def rig(im):
    """face = the biggest flat skin-coloured area in the top 60 %; shoulders just below it."""
    a = np.array(im).astype(int)
    h, w = a.shape[:2]
    top = a[: int(h * 0.6)]
    mask = top[:, :, 3] > 200
    cols = top[:, :, :3][mask] // 8
    vals, counts = np.unique(cols[:, 0] * 1024 + cols[:, 1] * 32 + cols[:, 2], return_counts=True)
    best = None
    step = 4
    for v in vals[np.argsort(-counts)][:40]:
        tgt = np.array([v // 1024, (v // 32) % 32, v % 32]) * 8 + 4
        if not (tgt[0] > 170 and tgt[0] > tgt[2] + 20 and tgt[0] - tgt[1] < 70):  # skin-ish: bright and warm, not gold
            continue
        close = (np.abs(top[:, :, :3] - tgt).sum(axis=2) < 48) & mask
        g = close[::step, ::step]
        seen = np.zeros_like(g, bool)
        for sy, sx in zip(*np.nonzero(g)):
            if seen[sy, sx]:
                continue
            q = deque([(sy, sx)]); seen[sy, sx] = True; pts = []
            while q:
                y, x = q.popleft(); pts.append((y, x))
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= ny < g.shape[0] and 0 <= nx < g.shape[1] and g[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; q.append((ny, nx))
            if best is None or len(pts) > len(best):
                best = pts
    py = np.array([p[0] for p in best]) * step; px = np.array([p[1] for p in best]) * step
    fx0, fx1, fy0, fy1 = px.min(), px.max(), py.min(), py.max()
    if fy1 - fy0 > (fx1 - fx0) * 1.05:  # bald head / buzz cut: the skin runs up the scalp, keep the lower part
        fy0 = fy1 - (fx1 - fx0) * 0.95
    face = {'x': round((fx0 + fx1) / 2 / w, 4), 'y': round((fy0 + fy1) / 2 / h, 4), 'w': round((fx1 - fx0) / w * 0.78, 4)}
    # shoulders: just below the chin/beard line, 12 % inside the body's silhouette at that height
    sy = min(0.62, fy1 / h + 0.13)
    row = np.nonzero(a[int(sy * h), :, 3] > 128)[0]
    bx0, bx1 = (row.min(), row.max()) if len(row) else (fx0, fx1)
    inset = (bx1 - bx0) * 0.12
    return {'aspect': round(w / h, 4), 'face': face, 'faceBox': [round(fx0 / w, 4), round(fy0 / h, 4), round(fx1 / w, 4), round(fy1 / h, 4)],
            'shoulderL': [round((bx0 + inset) / w, 4), round(sy, 4)], 'shoulderR': [round((bx1 - inset) / w, 4), round(sy, 4)]}

files, rigs = [], {}
for p in sorted(glob.glob(f'{SRC}/**/*.png', recursive=True)):
    folder, name = p.split('/')[-2], os.path.basename(p)
    if folder not in ('chars', 'horses', 'cards', 'bg', 'props', 'docs'):
        continue
    os.makedirs(f'{DST}/{folder}', exist_ok=True)
    im = Image.open(p)
    if folder in JPG:
        im = im.convert('RGB')
        s = JPG[folder] / im.width
        if s < 1:
            im = im.resize((JPG[folder], round(im.height * s)), Image.LANCZOS)
        im.save(f'{DST}/{folder}/{name[:-4]}.jpg', quality=90, optimize=True, progressive=True)
        files.append(f'{folder}/{name[:-4]}.jpg')
        continue
    im = im.convert('RGBA')
    if name.startswith('_'):
        fit(im, 1536).save(f'{DST}/{folder}/{name}', optimize=True)
    elif folder == 'chars':
        im = crop_alpha(im)
        im = im.resize((round(im.width * 1600 / im.height), 1600), Image.LANCZOS)
        im.save(f'{DST}/{folder}/{name}', optimize=True)
        rigs[name] = rig(im)
    elif folder == 'horses':
        im = crop_alpha(im)
        W = max(im.width, round(im.height * 1.5)); H = round(W / 1.5)
        can = Image.new('RGBA', (W, H)); can.paste(im, ((W - im.width) // 2, H - im.height))
        fit(can, 2048).save(f'{DST}/{folder}/{name}', optimize=True)
    else:
        fit(crop_alpha(im), 1600).save(f'{DST}/{folder}/{name}', optimize=True)
    files.append(f'{folder}/{name}')

json.dump(sorted(files), open('src/russia/kit/assets.generated.json', 'w'), indent=0)
json.dump(rigs, open('src/russia/kit/rigs.generated.json', 'w'), indent=1)
print('installed', len(files), 'files,', len(rigs), 'rigs')
