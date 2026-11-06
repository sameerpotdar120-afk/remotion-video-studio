"""Plates and vectors for the House vs Senate video (free data only).

    python3 -I tools/build_uscongress_maps.py <tile_cache> <ne_dir> <cd_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py; close-ups via build_canadalakes_maps.closeup). Washington DC close-up: USGS The National
Map orthoimagery (USGSImageryOnly, US government work, public domain), lightly graded to sit with the Sentinel plates.
Countries: Natural Earth, India point-of-view edition; states: Natural Earth admin-1 (public domain). New York's 26
congressional districts: US Census Bureau cartographic boundaries, 118th Congress (cb_2023_us_cd118_5m, public domain).
"""
import glob
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_canadalakes_maps as cl  # noqa: E402
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402
from fetch_mumbai_tiles import fetch, tile_xy  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "uscongress" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("namerica", 5, 4, -172.0, -10.0, -10.0, 83.5),
    ("usa", 6, 5, -128.0, -64.0, 21.0, 51.5),
    ("ny", 8, 7, -81.0, -71.0, 38.3, 47.3),
    ("wy", 8, 7, -112.5, -102.5, 38.5, 47.5),
    ("dcarea", 12, 10, -77.3, -76.75, 38.68, 39.12),
]
USGS = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
DC_CLOSE = ("dc", 16, -77.062, -76.996, 38.866, 38.918)
POINTS = {
    "White House": (-77.0365, 38.8977), "Capitol": (-77.0091, 38.8899), "Washington": (-77.0369, 38.9072),
    "Wyoming": (-107.55, 43.0), "New York": (-75.5, 42.9), "NYC": (-73.95, 40.72),
}


def usgs_plate(name, z, lo0, lo1, la0, la1, cache):
    fx0, fy0 = tile_xy(lo0, la1, z)
    fx1, fy1 = tile_xy(lo1, la0, z)
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(fx1), int(fy1)
    big = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    c = cache / "usgs"
    c.mkdir(parents=True, exist_ok=True)
    jobs = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)]
    with ThreadPoolExecutor(8) as ex:
        for (tx, ty), im in ex.map(lambda j: (j, fetch(USGS.format(z=z, x=j[0], y=j[1]), c / f"usgs_{z}_{j[0]}_{j[1]}")), jobs):
            big.paste(im.convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
    sat = big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))
    a = np.asarray(sat).astype(np.float32) / 255
    a = uk.grade(a, np.ones(a.shape[:2], np.float32))
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=40, threshold=2)).save(OUT / f"{name}_geo.jpg", quality=88)
    W, H = sat.size
    return {"bounds": [round(v, 1) for v in (mx(lo0), my(la0), mx(lo1), my(la1))], "w": W, "h": H}


def main() -> None:
    cache, ne, cd = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    only = set(sys.argv[4:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    cl.OUT = OUT
    gj = ROOT / "src" / "uscongress" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        fn = uk.build if name in ("namerica", "usa") else cl.closeup
        geo["plates"][name] = fn(name, zs, zd, lo0, lo1, la0, la1, cache, **({"sat_water": True} if fn is uk.build else {}))
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    if not only or "dc" in only:
        n, z, lo0, lo1, la0, la1 = DC_CLOSE
        geo["plates"][n] = usgs_plate(n, z, lo0, lo1, la0, la1, cache)
        print(n, geo["plates"][n]["w"], geo["plates"][n]["h"], flush=True)

    west = box(-180, 15, -50, 84)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    usa = C["United States of America"].intersection(west)
    geo["countries"] = {"USA": rings(usa, 0.02, 0.02), "Canada": rings(C["Canada"], 0.05, 0.05), "Mexico": rings(C["Mexico"], 0.05, 0.05)}
    sp = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes*.shp"))[0])
    S = {}
    for r, s in zip(sp.records(), sp.shapes()):
        if r["admin"] == "United States of America":
            S[r["name"]] = shape(s.__geo_interface__).buffer(0).intersection(west)
    geo["states"] = {n: rings(g, 0.01, 0.003) for n, g in S.items()}
    geo["statePts"] = {n: [round(mx(g.representative_point().x)), round(my(g.representative_point().y))] for n, g in S.items()}
    geo["dcRing"] = rings(S["District of Columbia"], 0.0005)
    cf = shapefile.Reader(glob.glob(str(cd / "cb_2023_us_cd118_5m.shp"))[0])
    dist = {}
    for r, s in zip(cf.records(), cf.shapes()):
        if r["STATEFP"] == "36":
            dist[int(r["CD118FP"])] = shape(s.__geo_interface__).buffer(0)
    assert len(dist) == 26, len(dist)
    geo["nyDistricts"] = {str(k): rings(g, 0.004, 0.0) for k, g in sorted(dist.items())}
    geo["nyDistrictPts"] = {str(k): [round(mx(g.representative_point().x)), round(my(g.representative_point().y))] for k, g in sorted(dist.items())}
    geo["points"] = {k: [round(mx(lon)), round(my(lat))] for k, (lon, lat) in POINTS.items()}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "states", len(S), "ny districts", len(dist))


if __name__ == "__main__":
    main()
