"""Build the two map plates used by the Remotion geo camera.

americas: NASA BMNG July 2004 topo+bathy, cropped to lon -180..-30, lat -60..84 (60 px/deg).
darien:   EOX Sentinel-2 cloudless 2016 land, NASA bathymetry ocean, lon -84.5..-75.5, lat 3..11.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

nasa_path, s2_path, countries_path, out_dir = map(Path, sys.argv[1:5])
out_dir.mkdir(parents=True, exist_ok=True)

world = Image.open(nasa_path).convert("RGB")
PPD = 60  # source pixels per degree


def grade(arr: np.ndarray, sat: float, contrast: float, gamma: float) -> np.ndarray:
    f = arr.astype(np.float32) / 255.0
    f = np.power(f, gamma)
    lum = (0.299 * f[..., 0] + 0.587 * f[..., 1] + 0.114 * f[..., 2])[..., None]
    f = lum + (f - lum) * sat
    f = (f - 0.5) * contrast + 0.5
    return np.clip(f * 255.0, 0, 255).astype(np.uint8)


# ---- Americas plate --------------------------------------------------------
am = world.crop((0, (90 - 84) * PPD, 150 * PPD, (90 + 60) * PPD))
am_arr = grade(np.asarray(am), sat=0.92, contrast=1.06, gamma=1.0)
Image.fromarray(am_arr).save(out_dir / "map_americas.jpg", quality=90, subsampling=0)
Image.fromarray(am_arr).resize((4500, 4320), Image.LANCZOS).save(
    out_dir / "map_americas_half.jpg", quality=90, subsampling=0
)
print("americas", am.size)

# ---- Darien plate ----------------------------------------------------------
W_, S_, E_, N_ = -84.5, 3.0, -75.5, 11.0
s2 = np.asarray(Image.open(s2_path).convert("RGB")).astype(np.float32)
H, W = s2.shape[:2]

bm = world.crop((int((W_ + 180) * PPD), int((90 - N_) * PPD), int((E_ + 180) * PPD), int((90 - S_) * PPD)))
bm_up = np.asarray(bm.resize((W, H), Image.BICUBIC)).astype(np.float32)

# land mask from Natural Earth 1:10m polygons
mask = np.zeros((H, W), np.uint8)
geo = json.load(open(countries_path))


def to_px(ring):
    pts = np.array(ring, dtype=np.float64)
    x = (pts[:, 0] - W_) / (E_ - W_) * W
    y = (N_ - pts[:, 1]) / (N_ - S_) * H
    return np.round(np.stack([x, y], 1)).astype(np.int32)


for feat in geo["features"]:
    g = feat["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for poly in polys:
        ext = to_px(poly[0])
        if ext[:, 0].max() < 0 or ext[:, 0].min() > W or ext[:, 1].max() < 0 or ext[:, 1].min() > H:
            continue
        cv2.fillPoly(mask, [ext], 255)
        for hole in poly[1:]:
            cv2.fillPoly(mask, [to_px(hole)], 0)

mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
alpha = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), 3.0)[..., None]

# colour-match Sentinel land toward the NASA land so the plate edge blends
land = mask > 128
s2_lab = cv2.cvtColor(s2.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
bm_lab = cv2.cvtColor(bm_up.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
for c in range(3):
    sm, ss = s2_lab[..., c][land].mean(), s2_lab[..., c][land].std()
    bmn, bs = bm_lab[..., c][land].mean(), bm_lab[..., c][land].std()
    tm = sm * 0.35 + bmn * 0.65
    ts = ss * 0.75 + bs * 0.25
    s2_lab[..., c] = (s2_lab[..., c] - sm) / max(ss, 1e-3) * ts + tm
s2m = cv2.cvtColor(np.clip(s2_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)

out = s2m * alpha + bm_up * (1 - alpha)
out_arr = grade(np.clip(out, 0, 255).astype(np.uint8), sat=0.92, contrast=1.06, gamma=1.0)
Image.fromarray(out_arr).save(out_dir / "map_darien.jpg", quality=92, subsampling=0)
Image.fromarray(out_arr).resize((W // 4, H // 4), Image.LANCZOS).save(out_dir / "_preview_darien.jpg", quality=85)
Image.fromarray(am_arr).resize((900, 864), Image.LANCZOS).save(out_dir / "_preview_americas.jpg", quality=85)
print("darien", out_arr.shape)
