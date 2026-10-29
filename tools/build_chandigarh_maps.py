"""Warm relief plates and vectors for the Chandigarh video (free data only).

    python3 -I tools/build_chandigarh_maps.py <tile_cache> <ne_dir> [plate names]

The reference's warm satellite relief map (sand-beige Tibet, green plains, white snow, deep teal sea, strong terrain),
rebuilt from EOX Sentinel-2 cloudless 2024 (CC BY 4.0) with AWS terrarium relief (SRTM/NASA, ETOPO1/NOAA), graded the
UK weather way with the relief pushed harder and a warm lift. Plates: South Asia (India, partition), Punjab (Lahore,
the Shivalik foothills, the site) and the Chandigarh tricity (the UT shape).
Vectors from Natural Earth's India point-of-view edition (public domain): India (official boundary), Pakistan,
Punjab (India), Punjab (Pakistan), Chandigarh UT; the Shivalik foothill line and the towns are hand-placed points.
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from shapely.geometry import Point, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "chandigarh" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("southasia", 7, 6, 56.0, 104.0, -6.0, 46.0),
    ("punjab", 9, 8, 70.5, 79.0, 28.0, 34.8),
    ("city", 13, 11, 76.55, 77.0, 30.55, 30.95),
]
# the Shivalik (Siwalik) foothills, north-west to south-east, along the first ridge above the plains
SHIVALIK = [(73.6, 33.25), (74.4, 32.95), (75.2, 32.55), (75.75, 32.1), (76.2, 31.65), (76.75, 31.3), (77.15, 31.0), (77.5, 30.75), (77.9, 30.5), (78.35, 30.2), (78.9, 29.65)]
TOWNS = {"Lahore": (74.34, 31.55), "Chandigarh": (76.78, 30.73), "Kalka": (76.94, 30.84), "Ambala": (76.78, 30.38), "Patiala": (76.39, 30.34),
         "Mullanpur": (76.66, 30.79), "Amritsar": (74.87, 31.63), "Delhi": (77.21, 28.61)}


def lift(name: str) -> None:
    """The reference's warm, slightly lifted look: shadows opened a little, a warm tint, a touch more saturation."""
    p = OUT / f"{name}_geo.jpg"
    a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255
    lum = a.mean(axis=2, keepdims=True)
    a = a + (1 - a) * np.clip(0.45 - lum, 0, 1) * 0.25
    a = lum + (a - lum) * 1.12
    a = a * np.array([1.04, 1.0, 0.93]) + 0.01
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(p, quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "chandigarh" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        lift(name)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    sf1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    S = {(r["admin"], r["name"]): shape(s.__geo_interface__).buffer(0) for r, s in zip(sf1.records(), sf1.shapes()) if r["admin"] in ("India", "Pakistan")}
    pb_in, pb_pk = S[("India", "Punjab")], S[("Pakistan", "Punjab")]
    geo["countries"] = {"India": rings(C["India"], 0.03, 0.02), "Pakistan": rings(C["Pakistan"].difference(C["India"]), 0.03, 0.02)}
    geo["states"] = {"PunjabIN": rings(pb_in, 0.005, 0.001), "PunjabPK": rings(pb_pk, 0.005, 0.001),
                     "PunjabUndivided": rings(unary_union([pb_in, pb_pk]).buffer(0.01).buffer(-0.01), 0.005, 0.001),
                     "Chandigarh": rings(S[("India", "Chandigarh")], 0.0005, 0.00001)}
    geo["shivalik"] = [[round(mx(x)), round(my(y))] for x, y in SHIVALIK]
    geo["towns"] = {n: [round(mx(x)), round(my(y))] for n, (x, y) in TOWNS.items()}
    # India's official boundary, point-tested (a dataset drawn on de facto lines would fail these)
    tests = {"Gilgit": (74.31, 35.92), "Muzaffarabad": (73.47, 34.37), "AksaiChin": (79.3, 35.2), "Shaksgam": (76.6, 36.0), "Tawang": (91.86, 27.59)}
    bad = [n for n, p in tests.items() if not C["India"].contains(Point(*p))]
    if bad:
        raise SystemExit(f"India boundary fails point tests: {bad}")
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, {k: sum(len(r) for r in v) for k, v in geo["states"].items()})


if __name__ == "__main__":
    main()
