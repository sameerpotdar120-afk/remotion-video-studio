"""Satellite plates, elevation and vectors for the new Tibet video (tibet2, UE5 assets, 2K 60 fps).

    python3 -I tools/build_tibet2_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen).
Elevation: AWS Terrain Tiles, "terrarium" encoding (open data; sources include SRTM/NASA; credited on screen).
Borders: Natural Earth's India point-of-view edition (public domain), so India has its official boundary.
The Tibetan Plateau is a landform, not a country: its outline is the largest connected area above 3,000 m, smoothed.
Airport dots and the L888 airway line are approximate (positions from public descriptions, not charts).
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from scipy import ndimage
from shapely.geometry import Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch, tile_xy  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "tibet2" / "maps"
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("asia", 5, 30.0, 140.0, -12.0, 58.0),
    ("tibet", 7, 66.0, 112.0, 18.0, 44.0),
]
HIMA = (85.9, 88.1, 27.3, 28.9)  # the 3D fly-over box around Everest
PLACES = {"everest": (86.925, 27.988), "lhasa": (91.11, 29.65), "tibet_c": (88.0, 32.5), "delhi": (77.2, 28.6), "india_c": (78.5, 22.5)}
AIRPORTS = {  # a few civil airports on the plateau (approximate), drawn as dots: Lhasa Gonggar, Shigatse, Nyingchi, Qamdo Bamda, Ngari Gunsa
    "lhasa": (90.91, 29.30), "shigatse": (89.31, 29.35), "nyingchi": (94.34, 29.30), "qamdo": (97.11, 30.55), "ngari": (80.05, 32.10),
    "tingri": (87.26, 28.62), "burang": (81.25, 30.30), "daocheng": (100.05, 29.32),
}
# the L888 airway across the plateau, roughly Kunming → Kashgar (approximate)
L888 = [(102.7, 25.0), (100.2, 27.6), (97.4, 30.6), (93.6, 33.6), (89.0, 35.6), (84.0, 36.6), (79.9, 37.1), (76.0, 39.5)]


def dem(z: int, lon0: float, lon1: float, lat0: float, lat1: float, cache: Path) -> tuple[np.ndarray, list]:
    im, b = stitch(TERRARIUM, z, lon0, lon1, lat0, lat1, cache / "terrarium", "terr")
    a = np.asarray(im).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768, b


def my_(lat: float) -> float:
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def plateau(cache: Path) -> Polygon:
    lon0, lon1, lat0, lat1 = 70.0, 106.0, 24.0, 42.0
    h, b = dem(5, lon0, lon1, lat0, lat1, cache)
    m = ndimage.gaussian_filter(h, 2.0) > 3000
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    big = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    big = ndimage.binary_closing(big, iterations=4)
    H, W = big.shape
    # keep it south of ~39.5°N (the Kunlun edge), so the low Tarim Basin and the Tien Shan never join in
    ycut = H * (my_(lat1) - my_(39.5)) / (my_(lat1) - my_(lat0))
    big[: int(ycut)] = False
    lab, n = ndimage.label(big)
    big = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
    holes = ndimage.binary_fill_holes(big) & ~big  # fill only small holes (lakes, valleys), never a whole basin
    hl, hn = ndimage.label(holes)
    for k in range(1, hn + 1):
        if (hl == k).sum() < 300:
            big |= hl == k
    px = lambda i, j: (b[0] + (b[2] - b[0]) * j / W, b[3] - (b[3] - b[1]) * i / H)  # pixel → Mercator metres
    cells = [box(*px(i + 1, j), *px(i, j + 1)) for i, j in zip(*np.nonzero(big))]
    poly = unary_union(cells).buffer(20000).buffer(-20000).simplify(6000)
    if poly.geom_type != "Polygon":
        poly = max(poly.geoms, key=lambda p: p.area)
    return Polygon(poly.exterior)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        if im.width > 6400:
            im = im.resize((6400, round(im.height * 6400 / im.width)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)

    # the world texture for the 3D globe: EOX z4, reprojected from Web Mercator to equirectangular (4096 × 2048)
    wm, _ = stitch(EOX, 4, -180.0, 179.999, -85.0, 85.0, cache / "eox", "eox")
    wa = np.asarray(wm)
    eq = np.zeros((2048, 4096, 3), np.uint8)
    lat = 90 - (np.arange(2048) + 0.5) * 180 / 2048
    lat_c = np.clip(lat, -85, 85)
    ys = (1 - np.log(np.tan(np.radians(lat_c)) + 1 / np.cos(np.radians(lat_c))) / math.pi) / 2 * wa.shape[0]
    xs = (np.arange(4096) + 0.5) / 4096 * wa.shape[1]
    eq[:] = wa[np.clip(ys.astype(int), 0, wa.shape[0] - 1)][:, np.clip(xs.astype(int), 0, wa.shape[1] - 1)]
    eq[np.abs(lat) > 85] = (230, 236, 240)  # polar caps: ice
    Image.fromarray(eq).save(OUT / "globe_equirect.jpg", quality=90)

    # the 3D fly-over: satellite texture + height map over the same box
    lo0, lo1, la0, la1 = HIMA
    tex, tb = stitch(EOX, 12, lo0, lo1, la0, la1, cache / "eox", "eox")
    if tex.width > 4096:
        tex = tex.resize((4096, round(tex.height * 4096 / tex.width)), Image.LANCZOS)
    tex.save(OUT / "hima_sat.jpg", quality=92)
    h, hb = dem(11, lo0, lo1, la0, la1, cache)
    h = np.clip(h, 0, 9000)
    hs = Image.fromarray(((h / 9000) * 65535).astype(np.uint16))
    hs = hs.resize((640, round(640 * hs.height / hs.width)), Image.BILINEAR)
    small = np.asarray(hs).astype(np.float32) / 65535 * 9000
    geo["hima"] = {"bounds": [round(v, 1) for v in hb], "lonlat": [lo0, lo1, la0, la1], "w": int(small.shape[1]), "h": int(small.shape[0]),
                   "max": round(float(small.max())), "min": round(float(small.min()))}
    (OUT / "hima_dem.json").write_text(json.dumps([int(v) for v in small.ravel()], separators=(",", ":")))
    ev = PLACES["everest"]
    print("hima", tex.size, small.shape, "height range", small.min(), small.max())

    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    clip = box(30, -12, 140, 58)
    fr = C["France"]
    fr = max((fr.geoms if hasattr(fr, "geoms") else [fr]), key=lambda p: p.intersection(box(-6, 41, 10, 52)).area)  # metropolitan France
    geo["france"] = rings(fr, 0.02)
    geo["france_c"] = [round(mx(fr.centroid.x), 1), round(my(fr.centroid.y), 1)]
    geo["l888"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in L888]
    for key, admin, tol in [("india", "India", 0.015), ("china", "China", 0.04)]:
        g = C[admin]
        parts = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 0.004]
        geo[key] = rings(unary_union(parts).intersection(clip), tol)
    pl = plateau(cache)
    geo["plateau"] = [[[round(x, 1), round(y, 1)] for x, y in pl.exterior.coords]]
    km2 = 0.0
    for (x0, y0), (x1, y1) in zip(pl.exterior.coords, list(pl.exterior.coords)[1:]):
        km2 += (x0 * y1 - x1 * y0)
    lat_mid = math.degrees(2 * math.atan(math.exp(pl.centroid.y / 6378137)) - math.pi / 2)
    print(f"plateau ≈ {abs(km2) / 2 * math.cos(math.radians(lat_mid)) ** 2 / 1e6:,.0f} km² (Mercator-corrected at the centroid)")
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in {**PLACES, **{f"ap_{k}": v for k, v in AIRPORTS.items()}}.items()}
    (ROOT / "src" / "tibet2").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "tibet2" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k: len(v) for k, v in geo.items() if isinstance(v, list)}, ev)


if __name__ == "__main__":
    main()
