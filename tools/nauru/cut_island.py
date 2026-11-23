#!/usr/bin/env python3
"""Nauru Short: cut the island (with its reef ring) out of the z15 EOX plate onto transparency, and trace its real
coastline into world coordinates, both in place and at true size over Delhi airport (scaled by 1/cos(lat))."""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from skimage import measure
from shapely.geometry import Polygon

P = Path(__file__).resolve().parents[2] / "public/nauru/film/assets/prep"
geo = json.loads((P / "geo.json").read_text())
im = Image.open(P / "maps/nauru.jpg").convert("RGB"); a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.3 * r + 0.59 * g + 0.11 * b
land = (lum > 62) | ((g > r + 4) & (g > 58))
land = ndimage.binary_closing(ndimage.binary_opening(land, iterations=2), iterations=6)
lab, n = ndimage.label(land); sizes = ndimage.sum(land, lab, range(1, n + 1))
keep = ndimage.binary_fill_holes(lab == (1 + int(np.argmax(sizes))))
alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
rgba = im.convert("RGBA"); rgba.putalpha(alpha)
ys, xs = np.nonzero(keep); pad = 40
x0p, x1p, y0p, y1p = max(0, xs.min() - pad), min(im.width, xs.max() + pad), max(0, ys.min() - pad), min(im.height, ys.max() + pad)
rgba.crop((x0p, y0p, x1p, y1p)).save(P / "maps/nauru_island.png")
X0, Y0, X1, Y1 = geo["plates"]["nauru"]["rect"]; w, h = im.size
px = lambda c, rr: (X0 + c / w * (X1 - X0), Y0 + rr / h * (Y1 - Y0))
geo["plates"]["nauru_island"] = {"rect": [round(v, 1) for v in (*px(x0p, y0p), *px(x1p, y1p))], "w": int(x1p - x0p), "h": int(y1p - y0p)}
cs = max(measure.find_contours(keep.astype(np.float32), 0.5), key=len)
poly = Polygon([px(c, rr) for rr, c in cs]).simplify(6)
ring = [[round(x, 1), round(y, 1)] for x, y in poly.exterior.coords]
geo["nauru"] = [ring]
cx, cy = poly.centroid.x, poly.centroid.y
ax, ay = geo["places"]["delhi_airport"]
k = math.cos(math.radians(-0.52)) / math.cos(math.radians(28.556))   # Mercator metres per true metre, Delhi vs Nauru
geo["nauru_on_delhi"] = [[[round(ax + (x - cx) * k, 1), round(ay + (y - cy) * k, 1)] for x, y in ring]]
geo["places"]["nauru"] = [round(cx, 1), round(cy, 1)]
(P / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
print("island", rgba.size, "->", (x1p - x0p, y1p - y0p), "coast points", len(ring), "width m", round(poly.bounds[2] - poly.bounds[0]))
