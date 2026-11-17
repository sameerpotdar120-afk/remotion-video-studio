# Grade rendered frames to the reference look (zone-wise colour transfer in Lab: sky and ground matched separately).
#   python3 grade.py ref_frame.png in_dir out_dir [strength]
# The reference frame stays private; only its statistics (mean/std per zone in Lab) are used.
import sys, os, glob, numpy as np
from PIL import Image, ImageFilter
def srgb2lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lin2srgb(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); Mi = np.linalg.inv(M); WP = np.array([0.95047, 1.0, 1.08883])
def f(t): return np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
def fi(t): return np.where(t > 0.2069, t ** 3, (t - 16 / 116) / 7.787)
def rgb2lab(a):
    xyz = srgb2lin(a) @ M.T / WP; fx, fy, fz = f(xyz[..., 0]), f(xyz[..., 1]), f(xyz[..., 2])
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], -1)
def lab2rgb(l):
    fy = (l[..., 0] + 16) / 116; fx = fy + l[..., 1] / 500; fz = fy - l[..., 2] / 200
    xyz = np.stack([fi(fx), fi(fy), fi(fz)], -1) * WP; return np.clip(lin2srgb(xyz @ Mi.T), 0, 1)
def sky_mask(a):
    H = a.shape[0]; r, g, b = a[..., 0], a[..., 1], a[..., 2]; lum = a @ [0.2126, 0.7152, 0.0722]
    yy = np.linspace(0, 1, H)[:, None] * np.ones(a.shape[:2])
    m = ((b >= r - 0.02) & (lum > 0.35) & (yy < 0.62)) | (yy < 0.08)
    img = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)); return np.asarray(img) / 255.0
def stats(lab, w):
    w = w[..., None]; s = w.sum() + 1e-6; mu = (lab * w).sum((0, 1)) / s; sd = np.sqrt(((lab - mu) ** 2 * w).sum((0, 1)) / s); return mu, sd
def transfer(lab, w, src, dst, k):
    (ms, ss), (md, sd_) = src, dst; t = (lab - ms) / (ss + 1e-6) * sd_ + md; return lab + (t - lab) * (w[..., None] * k)
def grade(img, ref, k=0.8):
    a = np.asarray(img.convert('RGB')).astype(np.float64) / 255; r = np.asarray(ref.convert('RGB').resize(img.size)).astype(np.float64) / 255
    la, lr = rgb2lab(a), rgb2lab(r); sa, sr = sky_mask(a), sky_mask(r)
    out = transfer(la, sa, stats(la, sa), stats(lr, sr), k)
    out = transfer(out, 1 - sa, stats(la, 1 - sa), stats(lr, 1 - sr), k)
    rgb = lab2rgb(out)
    # gentle filmic toe/shoulder, keep shadows open like the reference (black point ~0.12)
    rgb = 0.1 + 0.9 * rgb; rgb = rgb - 0.06 * np.sin(np.pi * rgb) * (rgb - 0.5)
    return Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8))
if __name__ == '__main__':
    ref = Image.open(sys.argv[1]); ind, outd = sys.argv[2], sys.argv[3]; k = float(sys.argv[4]) if len(sys.argv) > 4 else 0.8; os.makedirs(outd, exist_ok=True)
    for p in sorted(glob.glob(os.path.join(ind, '*.png'))): grade(Image.open(p), ref, k).save(os.path.join(outd, os.path.basename(p)))
