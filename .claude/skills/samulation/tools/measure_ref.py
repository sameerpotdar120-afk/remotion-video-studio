# Per-frame measurements of a reference short at 30 fps (numbers, not opinions):
#   colour: luma mean/std/p2/p98, HSV saturation mean, chroma; scene-cut score;
#   camera: 9-tile sub-pixel phase correlation vs previous frame -> similarity fit (dx, dy, zoom, roll), caption band masked.
# Output measure/<k>.json  (python3 measure.py 01 02 ...)
import sys, json, subprocess, numpy as np
W, H = 360, 640
BANDS = [(0.03, 0.29), (0.29, 0.56), (0.80, 0.97)]   # caption band (~56-80 %) excluded
def frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
def tiles():
    T = []; ts = 96
    for (a, b) in BANDS:
        cy = int((a + b) / 2 * H)
        for cx in (W * 0.2, W * 0.5, W * 0.8): T.append((int(cy - ts / 2), int(cx - ts / 2), ts))
    return T
TL = tiles(); win = np.outer(np.hanning(96), np.hanning(96))
def pc(a, b):
    A = np.fft.fft2(a * win); B = np.fft.fft2(b * win); R = A * np.conj(B); R /= np.abs(R) + 1e-9; r = np.real(np.fft.ifft2(R))
    i = np.unravel_index(np.argmax(r), r.shape); pk = r[i]
    def sub(v, ax):   # parabolic sub-pixel
        n = r.shape[ax]; im = list(i); ip = list(i); im[ax] = (i[ax] - 1) % n; ip[ax] = (i[ax] + 1) % n; l, c, rr = r[tuple(im)], r[i], r[tuple(ip)]; d = (l - rr) / (2 * (l - 2 * c + rr) + 1e-9); return v + d
    dy = sub(i[0], 0); dx = sub(i[1], 1); dy = dy - 96 if dy > 48 else dy; dx = dx - 96 if dx > 48 else dx
    return dx, dy, pk
def fit(prev, cur):
    rows = []
    for (y, x, s) in TL:
        dx, dy, pk = pc(cur[y:y + s, x:x + s], prev[y:y + s, x:x + s])
        if pk > 0.08: rows.append((x + s / 2 - W / 2, y + s / 2 - H / 2, dx, dy))
    if len(rows) < 4: return None
    R = np.array(rows); M = []; v = []
    for (cx, cy, dx, dy) in R: M += [[1, 0, cx, -cy], [0, 1, cy, cx]]; v += [dx, dy]
    M = np.array(M); v = np.array(v); p, *_ = np.linalg.lstsq(M, v, rcond=None); res = np.abs(M @ p - v).reshape(-1, 2).sum(1)
    keep = res < max(1.0, np.median(res) * 3)
    if keep.sum() >= 4:
        idx = np.repeat(keep, 2); p, *_ = np.linalg.lstsq(M[idx], v[idx], rcond=None)
    return [float(p[0]), float(p[1]), float(p[2]), float(np.degrees(p[3]))]
for k in sys.argv[1:]:
    import glob; path = glob.glob(f'vids/{k}.mp4')[0]; out = []; prev = None; prevh = None
    for f in frames(path):
        g = f.astype(np.float32) / 255; lum = 0.2126 * g[..., 0] + 0.7152 * g[..., 1] + 0.0722 * g[..., 2]
        mx = g.max(2); mn = g.min(2); sat = (mx - mn) / (mx + 1e-6)
        mask = np.ones(H, bool); mask[int(0.56 * H):int(0.80 * H)] = False; L = lum[mask]; S = sat[mask]
        h = np.histogram(lum, 32, (0, 1))[0] / lum.size; cut = float(np.abs(h - prevh).sum()) if prevh is not None else 0.0
        cam = fit(prev, lum) if prev is not None else None
        out.append({'lm': round(float(L.mean()), 4), 'ls': round(float(L.std()), 4), 'p2': round(float(np.percentile(L, 2)), 4), 'p98': round(float(np.percentile(L, 98)), 4),
                    'sat': round(float(S.mean()), 4), 'cut': round(cut, 4), 'cam': [round(c, 4) for c in cam] if cam else None})
        prev = lum; prevh = h
    json.dump(out, open(f'measure/{k}.json', 'w')); print(k, len(out), flush=True)
