"""Plates and vectors for the Hormuz video (free data only).

    python3 -I tools/build_hormuz_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py); the edit adds a desaturated "atlas" grade on top for the wide shots. Countries: Natural
Earth admin-0, India point-of-view edition (India's official boundary). The Hajar range is traced from the AWS terrain
tiles (land above 700 m inside Oman and the UAE). The tanker lane, the canal line, the strait gauge and the two pipeline
routes are drawn approximately from public maps (Saudi East-West pipeline Abqaiq-Yanbu; UAE Habshan-Fujairah).
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from scipy import ndimage
from shapely.geometry import LineString, Polygon, box, shape
from shapely.ops import unary_union
from skimage import measure

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402
from fetch_mumbai_tiles import stitch as stitch_tpl  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hormuz" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("wide", 6, 5, 28.0, 96.0, -4.0, 44.0),
    ("gulf", 8, 7, 43.0, 63.0, 19.0, 33.0),
    ("musandam", 11, 9, 54.9, 57.7, 24.5, 27.2),
]
LANE = [(62.5, 24.6), (59.5, 25.0), (57.9, 25.5), (57.2, 25.95), (56.85, 26.28), (56.62, 26.58), (56.38, 26.69), (56.1, 26.66),
        (55.6, 26.5), (54.6, 26.3), (53.2, 26.55), (51.8, 27.0), (50.6, 27.6), (49.6, 28.4)]
TO_INDIA = [(57.6, 25.45), (60.5, 24.4), (64.0, 23.4), (67.0, 22.9), (69.6, 22.55)]  # Gulf of Oman to Jamnagar (Gujarat)
GAUGE = [(56.53, 26.50), (56.36, 26.82)]  # the Quoin islands (Oman) to Larak (Iran): the narrowest part, about 39 km (21 nmi)
CANAL = [(55.93, 25.80), (56.03, 25.72), (56.15, 25.66), (56.27, 25.63), (56.37, 25.61)]  # Ras Al Khaimah to Dibba
PIPE_SA = [(49.67, 25.94), (47.6, 25.4), (45.6, 24.9), (43.6, 24.55), (41.4, 24.3), (39.5, 24.1), (38.06, 24.09)]  # Abqaiq to Yanbu
PIPE_AE = [(53.73, 23.84), (54.4, 24.05), (55.2, 24.3), (55.75, 24.62), (56.05, 24.9), (56.33, 25.12)]  # Habshan to Fujairah
PLACES = {"yanbu": (38.06, 24.09), "abqaiq": (49.67, 25.94), "fujairah": (56.33, 25.12), "habshan": (53.73, 23.84),
          "jamnagar": (69.6, 22.55), "bandarabbas": (56.27, 27.18), "jebelshams": (57.26, 23.24), "strait": (56.35, 26.55)}


def ml(pts: list) -> list:
    return [[round(mx(x), 0), round(my(y), 0)] for x, y in pts]


def hajar(cache: Path, land) -> list:
    """The Hajar range: terrain above 700 m inside Oman + UAE, smoothed, the big pieces only."""
    lo0, lo1, la0, la1 = 55.6, 60.0, 22.0, 26.5
    im, b = stitch_tpl(uk.TERRARIUM, 8, lo0, lo1, la0, la1, cache / "terrarium", "terr")
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    h = ndimage.gaussian_filter(h, 3)
    mask = ndimage.binary_closing(h > 700, iterations=4)
    mask = ndimage.binary_opening(mask, iterations=2)
    H, W = mask.shape
    polys = []
    for c in measure.find_contours(mask.astype(float), 0.5):
        if len(c) < 60:
            continue
        pts = [(b[0] + (x / W) * (b[2] - b[0]), b[3] - (y / H) * (b[3] - b[1])) for y, x in c]
        p = Polygon(pts).buffer(0)
        if p.area > 4e8:  # merc m^2
            polys.append(p)
    g = unary_union(polys).simplify(1500)
    out = sorted(getattr(g, "geoms", [g]), key=lambda p: p.area, reverse=True)
    print("hajar pieces", len(out), "peak m", round(float(h.max())))
    return [[[round(x, 0), round(y, 0)] for x, y in p.exterior.coords] for p in out[:6]]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "hormuz" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    view = box(20, -15, 105, 50)
    names = {"Iran": 0.004, "Oman": 0.003, "United Arab Emirates": 0.003, "Saudi Arabia": 0.01, "Qatar": 0.003, "Bahrain": 0.002,
             "Kuwait": 0.003, "Iraq": 0.01, "India": 0.01, "Pakistan": 0.01, "Yemen": 0.01}
    geo["countries"] = {n: rings(C[n], tol, tol * tol * 4) for n, tol in names.items()}
    allc = unary_union([g.boundary for g in C.values()]).intersection(view).simplify(0.01)
    geo["borders"] = [ml(list(l.coords)) for l in getattr(allc, "geoms", [allc]) if l.length > 0.05]
    geo["hajar"] = hajar(cache, unary_union([C["Oman"], C["United Arab Emirates"]]))
    geo["lane"] = ml(list(LineString(LANE).simplify(0).coords))
    geo["toIndia"] = ml(TO_INDIA)
    geo["gauge"] = ml(GAUGE)
    geo["canal"] = ml(CANAL)
    geo["pipeSA"] = ml(PIPE_SA)
    geo["pipeAE"] = ml(PIPE_AE)
    geo["places"] = {k: [round(mx(x), 0), round(my(y), 0)] for k, (x, y) in PLACES.items()}
    geo["centroids"] = {n: [round(mx(C[n].centroid.x), 0), round(my(C[n].centroid.y), 0)] for n in names}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "borders", len(geo["borders"]))


if __name__ == "__main__":
    main()
