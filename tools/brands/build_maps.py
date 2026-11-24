"""Plates and vectors for the Brands Short (free data only).

    python3 -I tools/brands/build_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), graded the house way with AWS terrarium relief
(tools/build_ukweather_maps.py) and softened slightly (no sharpening "ants"); the edit turns it black and white.
Countries: Natural Earth admin-0, India point-of-view edition (India's official boundary); Indian states from admin-1.
All coordinates are Web Mercator metres; the plates are coarse to fine, so the camera can fly from the USA to Kolkata.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from PIL import ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "brands" / "maps"
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]

PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1 (coarse to fine)
    ("world", 5, 3, -135.0, 108.0, -38.0, 76.0),
    ("us", 6, 5, -126.0, -65.0, 22.0, 51.0),
    ("europe", 7, 5, -11.0, 26.0, 40.0, 60.0),
    ("india", 7, 5, 64.0, 99.0, 5.0, 37.5),
    ("uk", 8, 7, -9.0, 3.0, 49.5, 59.5),
    ("france", 8, 7, -5.5, 9.8, 41.2, 51.4),
    ("central", 9, 8, 11.8, 19.4, 48.2, 51.3),
    ("swiss", 9, 8, 5.6, 10.8, 45.6, 48.0),
    ("north", 9, 8, 73.4, 82.0, 25.2, 32.8),
    ("east", 9, 8, 85.5, 90.5, 20.8, 25.0),
    ("west", 9, 8, 71.0, 76.0, 16.8, 21.0),
    ("riviera", 11, 10, 6.6, 8.2, 43.35, 44.15),
    ("monaco", 13, 12, 7.33, 7.52, 43.68, 43.80),
]
PLACES = {  # lon, lat
    "zlin": (17.667, 49.226), "kolkata": (88.36, 22.57), "konnagar": (88.35, 22.70), "ludhiana": (75.857, 30.901),
    "kanpur": (80.332, 26.449), "mumbai": (72.835, 18.940), "london": (-0.128, 51.507), "paris": (2.352, 48.857),
    "monaco": (7.420, 43.738), "vevey": (6.84, 46.46), "newyork": (-74.0, 40.71), "delhi": (77.21, 28.61),
    "bengaluru": (77.59, 12.97), "india_c": (79.0, 22.5), "czech_c": (15.4, 49.8), "swiss_c": (8.2, 46.8),
    "us_c": (-98.5, 39.0), "uk_c": (-2.0, 53.6), "france_c": (2.4, 46.6),
}
COUNTRIES = {"India": 0.01, "Czechia": 0.004, "Switzerland": 0.003, "United States of America": 0.02, "United Kingdom": 0.006,
             "France": 0.006, "Monaco": 0.0, "Italy": 0.01, "Germany": 0.01, "Pakistan": 0.01, "China": 0.03, "Nepal": 0.01,
             "Bangladesh": 0.01}
STATES = {"Punjab": 0.003, "Uttar Pradesh": 0.004, "Maharashtra": 0.004, "West Bengal": 0.003}


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "brands" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))
    geo["order"] = [p[0] for p in PLATES]
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    us = C["United States of America"].intersection(box(-126, 23, -65, 50))  # the lower 48
    fr = C["France"].intersection(box(-6, 41, 10, 52))  # metropolitan France
    geo["countries"] = {}
    for k, tol in COUNTRIES.items():
        g = us if k.startswith("United States") else fr if k == "France" else C[k]
        geo["countries"][k] = rings(g, tol, 0.0 if k == "Monaco" else tol * tol * 4)
    a1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))[0])
    geo["states"] = {}
    for k, tol in STATES.items():
        g = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in zip(a1.records(), a1.shapes()) if r["adm0_a3"] == "IND" and r["name"] == k])
        geo["states"][k] = rings(g, tol, tol * tol * 4)
    lines = unary_union([g.boundary for g in C.values()]).intersection(box(-130, 0, 105, 66)).simplify(0.01)
    geo["borders"] = [[[round(mx(x)), round(my(y))] for x, y in l.coords] for l in getattr(lines, "geoms", [lines]) if l.length > 0.08]
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    geo["centers"] = {}
    for k in COUNTRIES:
        g = us if k.startswith("United States") else fr if k == "France" else C[k]
        c = g.representative_point() if k != "India" else None
        geo["centers"][k] = [round(mx(c.x)), round(my(c.y))] if c is not None else geo["places"]["india_c"]
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
