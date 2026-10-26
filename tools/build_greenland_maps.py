"""Bright plates, a vintage paper plate and vectors for the Greenland and Iceland video (free data only).

    python3 -I tools/build_greenland_maps.py <tile_cache> <ne_dir> [plate names]

The reference's bright, light-graded satellite map, rebuilt from free sources: EOX Sentinel-2 cloudless 2024
(CC BY 4.0) with AWS terrarium relief (SRTM/NASA on land, ETOPO1/NOAA bathymetry), graded the UK weather way, then
lifted (shadows opened, a cleaner white on the ice). The "paper" plate is the 9th-century map drawn from the same
land mask: parchment land with an ink coastline, a pale sea with ripple lines, all in code.
Countries from Natural Earth's India point-of-view edition (public domain).
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from scipy import ndimage
from shapely.geometry import box, shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "greenland" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("atlantic", 6, 4, -80.0, 40.0, 38.0, 83.6),
    ("iceland", 8, 7, -29.0, -9.0, 61.0, 69.5),
]
COUNTRIES = ["Greenland", "Iceland", "Norway", "Denmark"]


def lift(name: str, zd: int, box: tuple, cache: Path) -> None:
    p = OUT / f"{name}_geo.jpg"
    a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255
    H, W = a.shape[:2]
    # the ice sheet comes out flat white from the satellite: shade it with its own (strongly exaggerated) relief and a
    # cool blue in the hollows, so the dome, the outlet glaciers and the edge read like the reference's ice
    h = uk.dem(zd, *box, cache)
    h = np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC))
    h = ndimage.gaussian_filter(h, 3.0)
    px_m = (box[1] - box[0]) * 111320 * 0.3 / W
    hs = uk.hillshade(np.maximum(h, 0), px_m, exag=40)
    hs = ndimage.gaussian_filter(hs, 1.0)
    det = np.clip((hs - ndimage.gaussian_filter(hs, 25)) * 2.4, -0.13, 0.07)[..., None]
    lum = a.mean(axis=2, keepdims=True)
    a = a + (1 - a) * np.clip(0.55 - lum, 0, 1) * 0.35  # open the shadows
    a = np.clip(a * 1.06 + 0.02, 0, 1)
    ice = np.clip((a.mean(axis=2, keepdims=True) - 0.8) * 6, 0, 1) * (h[..., None] > 30)
    # height tint: brighter on the high dome, a cooler blue toward the edge
    up = np.clip(h / 3000, 0, 1)[..., None]
    base = np.array([0.80, 0.88, 0.95]) + (np.array([0.95, 0.97, 0.99]) - np.array([0.80, 0.88, 0.95])) * up
    a = a * (1 - ice) + np.clip(base + det * np.array([0.9, 0.8, 0.6]), 0, 1) * ice
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(p, quality=91)


def green(name: str, zd: int, box: tuple, cache: Path) -> None:
    """Greenland as if it were green (line 8, "यानी हरी-भरी ज़मीन"): its own relief, from the same DEM, coloured as lush
    land (deep green low down, yellow-green higher, a little rock on the peaks), shaded with the same hillshade."""
    src = np.asarray(Image.open(OUT / f"{name}_geo.jpg").convert("RGB")).astype(np.float32) / 255
    H, W = src.shape[:2]
    h = uk.dem(zd, *box, cache)
    h = ndimage.gaussian_filter(np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC)), 2.0)
    px_m = (box[1] - box[0]) * 111320 * 0.3 / W
    hs = uk.hillshade(np.maximum(h, 0), px_m, exag=30)
    det = np.clip((hs - ndimage.gaussian_filter(hs, 25)) * 2.2 + 0.5, 0, 1)[..., None]
    e = np.clip(h / 3000, 0, 1)[..., None]
    low, mid, top = np.array([0.16, 0.46, 0.12]), np.array([0.40, 0.62, 0.18]), np.array([0.62, 0.66, 0.40])
    col = np.where(e < 0.5, low + (mid - low) * (e / 0.5), mid + (top - mid) * ((e - 0.5) / 0.5))
    rng = np.random.default_rng(3)
    patch = ndimage.gaussian_filter(rng.random((H // 6, W // 6)).astype(np.float32), 3)
    patch = np.asarray(Image.fromarray(patch).resize((W, H), Image.BICUBIC))[..., None]
    col = col * (0.88 + 0.3 * (patch - 0.5) * 4)  # meadows and darker moss in patches
    out = np.clip(col * (0.55 + 0.75 * det), 0, 1)
    land = (h > 1)[..., None]
    out = np.where(land, out, src)
    Image.fromarray((out * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=50, threshold=2)).save(OUT / f"{name}_green.jpg", quality=88)


def paper(name: str) -> None:
    src = Image.open(OUT / f"{name}_geo.jpg").convert("RGB")
    W, H = src.size
    a = np.asarray(src).astype(np.float32) / 255
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    land = ~((b_ > r_ + 0.04) & (b_ > g_ - 0.02) & (a.mean(axis=2) < 0.75))
    land = ndimage.binary_opening(ndimage.binary_closing(land, iterations=2), iterations=2)
    landf = ndimage.gaussian_filter(land.astype(np.float32), 1.2)
    rng = np.random.default_rng(9)
    fib = ndimage.gaussian_filter(rng.random((H // 8, W // 8)).astype(np.float32), 2)
    fib = np.asarray(Image.fromarray(fib).resize((W, H), Image.BICUBIC))
    fib = (fib - fib.mean()) / (fib.std() + 1e-6)
    parch = np.array([0.91, 0.84, 0.69]) + fib[..., None] * 0.018
    sea = np.array([0.80, 0.80, 0.72]) + fib[..., None] * 0.015
    # ripple lines offshore: rings of distance from the coast
    dist = ndimage.distance_transform_edt(~land)
    rip = (np.abs(((dist / 14) % 1) - 0.5) < 0.06) & (dist < 70) & (dist > 6)
    sea = sea - rip[..., None] * 0.12 * np.clip(1 - dist / 70, 0, 1)[..., None]
    out = parch * landf[..., None] + sea * (1 - landf[..., None])
    coast = ndimage.morphological_gradient(land.astype(np.uint8), size=3).astype(np.float32)
    coast = ndimage.gaussian_filter(coast, 0.8)
    out = out * (1 - coast[..., None] * 0.85) + np.array([0.28, 0.2, 0.13]) * coast[..., None] * 0.85
    yy, xx = np.mgrid[0:H, 0:W]
    vig = np.clip(((xx / W - 0.5) ** 2 + (yy / H - 0.5) ** 2) * 1.6, 0, 1)[..., None]
    out = out * (1 - vig * 0.35) + np.array([0.45, 0.32, 0.18]) * vig * 0.35
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.SMOOTH).save(OUT / f"{name}_paper.jpg", quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "greenland" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        lift(name, zd, (lo0, lo1, la0, la1), cache)
        if name == "atlantic":
            paper(name)
            green(name, zd, (lo0, lo1, la0, la1), cache)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    C["Norway"] = C["Norway"].intersection(box(4, 55, 35, 72))  # mainland Norway only (no Svalbard, no Jan Mayen)
    geo["countries"] = {n: rings(C[n], 0.02, 0.01) for n in COUNTRIES}
    geo["centroids"] = {n: [round(mx(C[n].representative_point().x)), round(my(C[n].representative_point().y))] for n in COUNTRIES}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
