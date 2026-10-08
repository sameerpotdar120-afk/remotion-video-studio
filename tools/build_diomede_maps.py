"""Build the Web Mercator map plates for the Diomede Islands video.

    python3 tools/build_diomede_maps.py <pack_img_dir> <ne_10m_land.geojson> <out_dir>

All plates share one coordinate system: Web Mercator metres with longitudes
unwrapped around the date line (east longitudes stay positive, west longitudes
get +360), so the Bering Strait sits near x = 21.0e6 m instead of straddling ±180°.

world_merc.jpg    NASA BMNG July topo+bathy, lon 105..255 (unwrapped), lat 80..-60
bering_merc.jpg   EOX Sentinel-2 2016 land + NASA ocean, the pack's Bering bounds
islands_merc.jpg  EOX Sentinel-2 2016 islands (OSM coastline mask) + smoothed ocean
plates.json       bounds of each plate in unwrapped Mercator metres
"""
import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
R = 6378137.0
WRAP = 2 * math.pi * R

src_dir, land_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)
meta = json.load(open(src_dir / "map_metadata.json"))


def mx(lon):
    lon = np.where(np.asarray(lon) < 0, np.asarray(lon) + 360.0, lon)
    return R * np.radians(lon)


def my(lat):
    return R * np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))


def inv(x, y):
    lon = np.degrees(x / R)
    lat = np.degrees(2 * np.arctan(np.exp(y / R)) - np.pi / 2)
    return lon, lat


world = np.asarray(Image.open(src_dir / "map_world.jpg").convert("RGB"))
WH, WW = world.shape[:2]


def sample_world(x0, y1, mpp, w, h):
    """Reproject the equirectangular NASA mosaic into a Mercator grid."""
    xs = x0 + (np.arange(w) + 0.5) * mpp
    ys = y1 - (np.arange(h) + 0.5) * mpp
    lon, _ = inv(xs, 0)
    _, lat = inv(0, ys)
    lon = (lon + 180) % 360 - 180
    mapx = np.tile(((lon + 180) / 360 * WW).astype(np.float32), (h, 1))
    mapy = np.tile(((90 - lat) / 180 * WH).astype(np.float32)[:, None], (1, w))
    return cv2.remap(world, mapx, mapy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_WRAP)


def grade(a, sat=0.9, contrast=1.05, cool=0.0):
    f = a.astype(np.float32) / 255
    lum = (0.299 * f[..., 0] + 0.587 * f[..., 1] + 0.114 * f[..., 2])[..., None]
    f = lum + (f - lum) * sat
    f = (f - 0.5) * contrast + 0.5
    f[..., 2] += cool
    f[..., 0] -= cool * 0.5
    return np.clip(f * 255, 0, 255).astype(np.uint8)


plates = {}

# ---- world plate -----------------------------------------------------------
x0, x1 = mx(105.0), mx(255.0 - 360.0)
y1, y0 = my(80.0), my(-60.0)
W = 7200
mpp = (x1 - x0) / W
H = int(round((y1 - y0) / mpp))
wplate = grade(sample_world(x0, y1, mpp, W, H), sat=0.9, contrast=1.06, cool=0.015)
Image.fromarray(wplate).save(out_dir / "world_merc.jpg", quality=90, subsampling=0)
Image.fromarray(wplate).resize((W // 2, H // 2), Image.LANCZOS).save(out_dir / "world_merc_half.jpg", quality=90, subsampling=0)
plates["world"] = {"x0": float(x0), "x1": float(x1), "y0": float(y0), "y1": float(y1), "w": W, "h": H}
print("world", W, H)

# ---- land mask helper --------------------------------------------------------
land = json.load(open(land_path))
extra = json.load(open(src_dir / "geo_islands.json"))


def land_mask(bx0, by0, bx1, by1, w, h, use_ne=True):
    m = np.zeros((h, w), np.uint8)
    feats = (land["features"] if use_ne else []) + extra["features"]
    for f in feats:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            rings = []
            for ring in poly:
                pts = np.asarray(ring, dtype=np.float64)
                X = mx(pts[:, 0])
                Y = my(np.clip(pts[:, 1], -85, 85))
                px = (X - bx0) / (bx1 - bx0) * w
                py = (by1 - Y) / (by1 - by0) * h
                rings.append(np.stack([px, py], 1))
            ext = rings[0]
            # Natural Earth's generalized Diomede polygons are larger than the real islands;
            # the islands come from the detailed OpenStreetMap outlines instead
            raw = np.asarray(poly[0])
            if f in land["features"] and raw[:, 0].min() > -169.3 and raw[:, 0].max() < -168.7 and raw[:, 1].min() > 65.6 and raw[:, 1].max() < 65.9:
                continue
            if ext[:, 0].max() < -50 or ext[:, 0].min() > w + 50 or ext[:, 1].max() < -50 or ext[:, 1].min() > h + 50:
                continue
            cv2.fillPoly(m, [np.round(ext * 4).astype(np.int32)], 255, lineType=cv2.LINE_AA, shift=2)
            for hole in rings[1:]:
                cv2.fillPoly(m, [np.round(hole * 4).astype(np.int32)], 0, lineType=cv2.LINE_AA, shift=2)
    return m


def match_land(src, ref, mask, k=0.6):
    """Pull Sentinel land colours toward the NASA land so plates blend."""
    a = cv2.cvtColor(src, cv2.COLOR_RGB2LAB).astype(np.float32)
    b = cv2.cvtColor(ref, cv2.COLOR_RGB2LAB).astype(np.float32)
    sel = mask > 128
    for c in range(3):
        sm, ss = a[..., c][sel].mean(), a[..., c][sel].std()
        bm, bs = b[..., c][sel].mean(), b[..., c][sel].std()
        a[..., c] = (a[..., c] - sm) / max(ss, 1e-3) * (ss * (1 - k * 0.4) + bs * k * 0.4) + (sm * (1 - k) + bm * k)
    return cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)


# ---- Bering plate --------------------------------------------------------------
mb = meta["map_bering"]
bx0, by0, bx1, by1 = mb["bounds_meters"]
bx0 += WRAP
bx1 += WRAP
s2 = np.asarray(Image.open(src_dir.parent.parent.parent / "masters" / "map_bering_master.png").convert("RGB"))
bh, bw = s2.shape[:2]
bmpp = (bx1 - bx0) / bw
nasa_b = sample_world(bx0, by1, bmpp, bw, bh)
# NASA renders the two islands as a few dark 500 m pixels; replace them with surrounding ocean
isl_only = land_mask(bx0, by0, bx1, by1, bw, bh, use_ne=False)
nasa_b = cv2.inpaint(nasa_b, cv2.dilate(isl_only, np.ones((151, 151), np.uint8)), 25, cv2.INPAINT_TELEA)
nasa_b = cv2.GaussianBlur(nasa_b, (0, 0), 1.5)
m = land_mask(bx0, by0, bx1, by1, bw, bh)
m = cv2.dilate(m, np.ones((5, 5), np.uint8))
alpha = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 2.5)[..., None]
landc = match_land(s2, nasa_b, m)
bering = (landc * alpha + nasa_b.astype(np.float32) * (1 - alpha)).astype(np.uint8)
bering = grade(bering, sat=0.9, contrast=1.06, cool=0.015)
Image.fromarray(bering).save(out_dir / "bering_merc.jpg", quality=92, subsampling=0)
plates["bering"] = {"x0": bx0, "x1": bx1, "y0": by0, "y1": by1, "w": bw, "h": bh}
print("bering", bw, bh)

# ---- islands plate ---------------------------------------------------------------
mi = meta["map_islands"]
ix0, iy0, ix1, iy1 = mi["bounds_meters"]
ix0 += WRAP
ix1 += WRAP
s2i = np.asarray(Image.open(src_dir.parent.parent.parent / "masters" / "map_islands_master.png").convert("RGB")).astype(np.float32)
ih, iw = s2i.shape[:2]
mi_mask = land_mask(ix0, iy0, ix1, iy1, iw, ih, use_ne=False)
mi_mask = cv2.dilate(mi_mask, np.ones((3, 3), np.uint8))
ia = cv2.GaussianBlur(mi_mask.astype(np.float32) / 255, (0, 0), 2.0)[..., None]
# ocean: the Bering plate's ocean resampled to this window, so the two plates blend seamlessly
u = (ix0 - bx0) / (bx1 - bx0) * bw
v = (by1 - iy1) / (by1 - by0) * bh
uw = (ix1 - ix0) / (bx1 - bx0) * bw
vh = (iy1 - iy0) / (by1 - by0) * bh
crop = bering[int(v):int(v + vh) + 1, int(u):int(u + uw) + 1]
# the Bering plate holds Sentinel islands too; flood them with surrounding ocean first
small = land_mask(ix0, iy0, ix1, iy1, crop.shape[1], crop.shape[0], use_ne=False)
crop = cv2.inpaint(crop, cv2.dilate(small, np.ones((7, 7), np.uint8)), 9, cv2.INPAINT_TELEA)
ocean = cv2.GaussianBlur(cv2.resize(crop, (iw, ih), interpolation=cv2.INTER_CUBIC), (0, 0), 45).astype(np.float32)
isl_land = match_land(s2i.astype(np.uint8), ocean.astype(np.uint8), mi_mask, k=0.15).astype(np.float32)
islands = isl_land * ia + ocean * (1 - ia)
islands = grade(np.clip(islands, 0, 255).astype(np.uint8), sat=0.92, contrast=1.08, cool=0.01)
Image.fromarray(islands).save(out_dir / "islands_merc.jpg", quality=93, subsampling=0)
plates["islands"] = {"x0": ix0, "x1": ix1, "y0": iy0, "y1": iy1, "w": iw, "h": ih}
print("islands", iw, ih)

json.dump(plates, open(out_dir / "plates.json", "w"), indent=1)
for name in ["world_merc", "bering_merc", "islands_merc"]:
    im = Image.open(out_dir / f"{name}.jpg")
    im.thumbnail((900, 900))
    im.save(out_dir / f"_prev_{name}.jpg", quality=85)
