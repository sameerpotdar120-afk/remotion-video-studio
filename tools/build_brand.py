"""Backgrounds for the channel branding, from the NASA BMNG July topo+bathy world mosaic.

    python3 tools/build_brand.py world.topo.bathy.200407.3x21600x10800.jpg

banner_world.jpg: equirectangular, lon -100..140, lat 72..-63, 2560x1440
globe.png:        orthographic globe centred on lon 30, lat 15, 1000x1000 with alpha
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
src = Image.open(sys.argv[1]).convert("RGB")
out = Path(__file__).resolve().parent.parent / "public" / "brand"
out.mkdir(parents=True, exist_ok=True)
PPD = src.width / 360

W, E, N, S = -100, 140, 72, -63
crop = src.crop((int((W + 180) * PPD), int((90 - N) * PPD), int((E + 180) * PPD), int((90 - S) * PPD)))
crop.resize((2560, 1440), Image.LANCZOS).save(out / "banner_world.jpg", quality=92)

# orthographic globe
small = np.asarray(src.resize((8640, 4320), Image.LANCZOS)).astype(np.float32)
size, lon0, lat0 = 1000, np.radians(30), np.radians(15)
r = size / 2
yy, xx = np.mgrid[0:size, 0:size]
x = (xx - r + 0.5) / r
y = (r - yy - 0.5) / r
rho = np.sqrt(x * x + y * y)
inside = rho <= 1
c = np.arcsin(np.clip(rho, 0, 1))
lat = np.arcsin(np.clip(np.cos(c) * np.sin(lat0) + np.where(rho > 0, y * np.sin(c) * np.cos(lat0) / np.maximum(rho, 1e-9), 0), -1, 1))
lon = lon0 + np.arctan2(x * np.sin(c), rho * np.cos(c) * np.cos(lat0) - y * np.sin(c) * np.sin(lat0))
px = ((np.degrees(lon) + 180) % 360) / 360 * (small.shape[1] - 1)
py = (90 - np.degrees(lat)) / 180 * (small.shape[0] - 1)
rgb = small[py.astype(int), px.astype(int)]
shade = (0.35 + 0.65 * np.sqrt(np.clip(1 - rho * rho, 0, 1)))[..., None]  # limb darkening
rgb = rgb * shade
alpha = np.clip((1 - rho) * r * 1.5, 0, 1) * inside
img = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
Image.fromarray(img, "RGBA").save(out / "globe.png")
print("ok")
