"""Bright plates and vectors for the Great Pacific Garbage Patch video (free data only).

    python3 -I tools/build_garbagepatch_maps.py <tile_cache> <ne_dir> [plate names]

The reference's bright, natural satellite map (green land, white ice, teal shelves, deep blue ocean), rebuilt from
EOX Sentinel-2 cloudless 2024 (CC BY 4.0) with AWS terrarium relief (SRTM/NASA, ETOPO1/NOAA), graded the UK weather
way and lifted a little. Plates: the world (the five gyres) and the north-east Pacific (Alaska to Hawaii, California,
the patch). Outlines from Natural Earth's India point-of-view edition (public domain): India (the size comparison),
California and Hawaii.
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from shapely.geometry import shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "garbagepatch" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("world", 4, 3, -180.0, 179.99, -62.0, 78.0),
    ("pacific", 6, 5, -176.0, -100.0, 8.0, 64.0),
]


def lift(name: str) -> None:
    p = OUT / f"{name}_geo.jpg"
    a = np.asarray(Image.open(p).convert("RGB")).astype(np.float32) / 255
    lum = a.mean(axis=2, keepdims=True)
    a = a + (1 - a) * np.clip(0.5 - lum, 0, 1) * 0.3  # open the shadows, like the reference's bright map
    a = np.clip(a * 1.05 + 0.015, 0, 1)
    Image.fromarray((a * 255).astype(np.uint8)).save(p, quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "garbagepatch" / "geo.json"
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
    india = C["India"]
    # India as lon/lat rings (the official boundary); the edit lays it at true size beside the patch
    geo["india"] = [[[round(x, 3), round(y, 3)] for x, y in r] for r in
                    [p.simplify(0.03, preserve_topology=True).exterior.coords for p in (india.geoms if hasattr(india, "geoms") else [india]) if p.area > 0.05]]
    geo["indiaCentroid"] = [round(india.centroid.x, 3), round(india.centroid.y, 3)]
    sf1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    S = {r["name"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf1.records(), sf1.shapes()) if r["admin"] == "United States of America"}
    geo["states"] = {"California": rings(S["California"], 0.02, 0.01), "Hawaii": rings(S["Hawaii"], 0.005, 0.0005)}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "india rings", len(geo["india"]), "pts", sum(len(r) for r in geo["india"]))


if __name__ == "__main__":
    main()
