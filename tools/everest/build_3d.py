"""The 3D world for the Everest Short (free data only).

    python3 -I tools/everest/build_3d.py <tile_cache> <ne_dir> [layer names]

Four nested terrain layers in one scene (km; x east, z south, origin at Everest), each a regular grid in Web Mercator:
  india   64-100E, 4-38N    DEM z6,  satellite z7   (the whole subcontinent and Tibet)
  himal   74.5-89.5E, 26-34N DEM z9, satellite z10  (the Himalaya from Himachal to Sikkim)
  everest 86.80-87.06E, 27.89-28.08N DEM z12, satellite z14 (about 30 m a vertex)
  langza  77.85-78.35E, 32.08-32.42N DEM z12, satellite z14 (Spiti)
Heights: AWS Terrain Tiles, terrarium (SRTM/NASA, ETOPO1; open data). Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0),
graded to the West Indies "Midnight" look (land pulled down and cooled, deep sea near-black navy, snow near-white).
A coarser layer is lowered a little inside each finer box (feathered) and each finer layer's edge is blended into the
coarser heights, so the finer mesh always wins without cracks.
Region masks (india, himal): reg_a RGB = India fill, Himachal fill, the land north of India (the old-sea illustration);
reg_b RGB = India outline, Himachal outline, Nepal outline. Borders: Natural Earth, India point-of-view edition.
Writes public/everest/3d/{layer}_tex.jpg, {layer}_h.bin (float32 metres, rows north to south), {layer}_reg_a.png,
{layer}_reg_b.png, meta.json.
"""
import glob
import json
import math
import os
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from shapely.geometry import box, shape

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
OUT = ROOT / "public" / "everest" / "3d"
R = 6378137.0
LAYERS = {  # name: (lon0, lon1, lat0, lat1, dem z, sat z, grid cols, tex cap, parent)
    "india": (64.0, 100.0, 4.0, 38.0, 6, 7, 760, 4096, None),
    "himal": (74.5, 89.5, 26.0, 34.0, 9, 10, 1150, 8192, "india"),
    "everest": (86.80, 87.06, 27.89, 28.08, 12, 14, 880, 6144, "himal"),
    "langza": (77.85, 78.35, 32.08, 32.42, 12, 14, 620, 6144, "himal"),
}
ORIGIN = (86.9250, 27.9881)  # Everest summit
PLACES = {
    "everest": (86.9250, 27.9881), "langza": (78.0742, 32.2697), "kaza": (78.0711, 32.2276), "delhi": (77.21, 28.61),
    "shimla": (77.17, 31.10), "kathmandu": (85.32, 27.70), "lhotse": (86.9336, 27.9617), "spiti_mid": (78.0, 32.2),
}


def mx(lon): return R * math.radians(lon)
def my(lat): return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


SCALE = math.cos(math.radians(ORIGIN[1])) / 1000  # mercator metres -> km near Everest
OX, OY = mx(ORIGIN[0]), my(ORIGIN[1])


def raster(geoms, b, W, H, blur=0.0, line=0):
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)

    def P(x, y): return ((mx(x) - b[0]) / (b[2] - b[0]) * W, (b[3] - my(y)) / (b[3] - b[1]) * H)
    for g in geoms:
        for p in (g.geoms if hasattr(g, "geoms") else [g]):
            if p.geom_type != "Polygon":
                continue
            if line:
                d.line([P(x, y) for x, y in p.exterior.coords], fill=255, width=line, joint="curve")
            else:
                d.polygon([P(x, y) for x, y in p.exterior.coords], fill=255)
                for r in p.interiors:
                    d.polygon([P(x, y) for x, y in r.coords], fill=0)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im).astype(np.float32) / 255


def grade(sat: Image.Image, h: np.ndarray, px_m: float) -> Image.Image:
    """The Midnight look (as tools/build_westindies_maps.py), plus snow kept bright for the Himalaya."""
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    W, H = sat.size
    h = np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC))
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    lum = (r_ + g_ + b_) / 3
    wet = (b_ > r_ + 0.015) & (b_ >= g_ - 0.03) & (lum < 0.42) & (h < 30)
    land = (h > 0.5) & ~wet
    land = ndimage.binary_opening(land, iterations=1)
    landf = np.asarray(Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255
    exag = max(1.0, min(5.0, px_m / 120))
    hs = uk.hillshade(np.maximum(h, 0), px_m, exag=exag)
    land_rgb = uk.soft_light(a, (0.45 + 0.55 * hs)[..., None] * 0.85 + 0.08)  # light bake: the 3D lighting does the rest
    llum = land_rgb.mean(axis=2, keepdims=True)
    land_rgb = llum + (land_rgb - llum) * 0.8
    land_rgb = land_rgb * 0.76 + np.array([-0.01, 0.0, 0.02])
    land_rgb = land_rgb + np.clip(0.35 - llum, 0, 1) * np.array([-0.03, 0.0, 0.05])
    d = np.clip(-h, 0, 6000)
    t = np.clip(np.log1p(d / 30) / np.log1p(6000 / 30), 0, 1)[..., None]
    near, far = np.array([0.05, 0.16, 0.22]), np.array([0.016, 0.055, 0.09])
    sea = near + (far - near) * t
    hs_sea = uk.hillshade(np.minimum(h, 0), px_m, alt=35, exag=exag * 4)[..., None]
    sea = sea * (0.75 + 0.55 * hs_sea)
    out = land_rgb * landf[..., None] + sea * (1 - landf[..., None])
    snow = (np.clip((lum - 0.55) * 4, 0, 1) * np.clip((h - 3800) / 900, 0, 1))[..., None] * landf[..., None]
    out = out * (1 - snow) + np.clip(a * 0.95 + np.array([0.0, 0.01, 0.04]), 0, 1) * snow
    lake = (wet & (h >= 30))[..., None] * 1.0
    out = out * (1 - lake * 0.6) + np.array([0.06, 0.25, 0.33]) * lake * 0.6
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=50, threshold=2))


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    big = box(60, 0, 104, 42)
    countries = {}
    for r, s_ in zip(sf.records(), sf.shapes()):
        g = shape(s_.__geo_interface__).buffer(0)
        if g.intersects(big):
            countries[r["ADMIN"]] = g.intersection(big)
    india, nepal = countries["India"], countries["Nepal"]
    s1 = shapefile.Reader(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))
    hp = None
    for r, s_ in zip(s1.records(), s1.shapes()):
        if r["admin"] == "India" and r["name"] == "Himachal Pradesh":
            hp = shape(s_.__geo_interface__).buffer(0).intersection(india)
    assert hp is not None
    north = [g for n, g in countries.items() if n in ("China", "Nepal", "Bhutan")]

    # heights first (all layers), so the parents can be lowered under their children
    meta = {"origin": ORIGIN, "scale": SCALE, "places": PLACES, "layers": {}}
    grids, boxes = {}, {}
    for name, (lo0, lo1, la0, la1, zd, zs, cols, cap, parent) in LAYERS.items():
        b = [mx(lo0), my(la0), mx(lo1), my(la1)]
        rows = round(cols * (b[3] - b[1]) / (b[2] - b[0]))
        dem = uk.dem(zd, lo0, lo1, la0, la1, cache).astype(np.float32)
        dem = ndimage.median_filter(dem, 3)
        xs = np.linspace(b[0], b[2], cols)
        ys = np.linspace(b[3], b[1], rows)
        X, Y = np.meshgrid(xs, ys)
        gx = (X - b[0]) / (b[2] - b[0]) * (dem.shape[1] - 1)
        gy = (b[3] - Y) / (b[3] - b[1]) * (dem.shape[0] - 1)
        hg = ndimage.map_coordinates(ndimage.gaussian_filter(dem, 0.5), [gy, gx], order=1, mode="nearest")
        grids[name] = [hg, X, Y, dem]
        boxes[name] = b
        print(name, "dem", dem.shape, "grid", cols, rows, "max", round(float(hg.max())))

    def sample_layer(n, X, Y):
        b, dem = boxes[n], grids[n][3]
        gx = (X - b[0]) / (b[2] - b[0]) * (dem.shape[1] - 1)
        gy = (b[3] - Y) / (b[3] - b[1]) * (dem.shape[0] - 1)
        return ndimage.map_coordinates(ndimage.gaussian_filter(dem, 0.5), [gy, gx], order=1, mode="nearest")

    def inside(b, X, Y, f):  # 1 deep inside box b, 0 outside, feather f (fraction of the box)
        fx = np.clip(np.minimum(X - b[0], b[2] - X) / (b[2] - b[0]) / f, 0, 1)
        fy = np.clip(np.minimum(Y - b[1], b[3] - Y) / (b[3] - b[1]) / f, 0, 1)
        return fx * fy

    for name, spec in LAYERS.items():
        hg, X, Y, _ = grids[name]
        parent = spec[8]
        if parent:  # blend my rim into my parent's heights
            w = inside(boxes[name], X, Y, 0.06)
            hg = sample_layer(parent, X, Y) * (1 - w) + hg * w
        for child, cs in LAYERS.items():  # sink under my children
            if cs[8] == name:
                cb = boxes[child]
                w = inside(cb, X, Y, 0.02) * ((X > cb[0]) & (X < cb[2]) & (Y > cb[1]) & (Y < cb[3]))
                hg = hg - w * 120.0 - inside(cb, X, Y, 0.08) * 3000.0  # deep inside: well under the finer mesh's valleys
        grids[name][0] = hg

    for name, (lo0, lo1, la0, la1, zd, zs, cols, cap, parent) in LAYERS.items():
        hg, X, Y, dem = grids[name]
        b = boxes[name]
        rows = hg.shape[0]
        sc = [(b[0] - OX) * SCALE, -(b[3] - OY) * SCALE, (b[2] - OX) * SCALE, -(b[1] - OY) * SCALE]  # x0, z0 (north), x1, z1
        L = {"lonlat": [lo0, lo1, la0, la1], "merc": b, "scene": sc, "cols": cols, "rows": rows, "parent": parent}
        if only and name not in only:
            old = json.loads((OUT / "meta.json").read_text())["layers"].get(name, {})
            L.update({k: v for k, v in old.items() if k in ("tex", "reg")})
            meta["layers"][name] = L
            continue
        hg.astype(np.float32).tofile(OUT / f"{name}_h.bin")
        if os.environ.get("HONLY"):  # heights only: keep the textures and masks already built
            old = json.loads((OUT / "meta.json").read_text())["layers"].get(name, {})
            L.update({k: v for k, v in old.items() if k in ("tex", "reg")})
            meta["layers"][name] = L
            continue
        sat, sb = stitch(zs, lo0, lo1, la0, la1, cache / "eox")
        k = min(1.0, cap / max(sat.size))
        if k < 1:
            sat = sat.resize((round(sat.width * k), round(sat.height * k)), Image.LANCZOS)
        px_m = (lo1 - lo0) * 111320 * math.cos(math.radians((la0 + la1) / 2)) / sat.width
        tex = grade(sat, dem, px_m)
        tex.save(OUT / f"{name}_tex.jpg", quality=92)
        L["tex"] = list(tex.size)
        if name in ("india", "himal"):
            W = 4096 if name == "himal" else 2048
            Hh = round(W * (b[3] - b[1]) / (b[2] - b[0]))
            lw = 5 if name == "himal" else 4
            reg_a = np.stack([raster([india], b, W, Hh, 0.8), raster([hp], b, W, Hh, 0.8), raster(north, b, W, Hh, 0.8)], -1)
            reg_b = np.stack([raster([india], b, W, Hh, 0.7, line=lw), raster([hp], b, W, Hh, 0.7, line=lw),
                              raster([nepal], b, W, Hh, 0.7, line=lw)], -1)
            Image.fromarray((reg_a * 255).astype(np.uint8)).save(OUT / f"{name}_reg_a.png")
            Image.fromarray((reg_b * 255).astype(np.uint8)).save(OUT / f"{name}_reg_b.png")
            L["reg"] = [W, Hh]
        meta["layers"][name] = L
        print(name, "tex", tex.size)
    meta["india_c"] = [india.representative_point().x, india.representative_point().y]
    meta["hp_c"] = [hp.centroid.x, hp.centroid.y]
    (OUT / "meta.json").write_text(json.dumps(meta))


if __name__ == "__main__":
    main()
