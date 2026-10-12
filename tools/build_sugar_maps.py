"""Satellite plates and vectors for the sugar-journey video.

    python3 -I tools/build_sugar_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Countries: Natural Earth 1:10m (public domain).
Borders come from Natural Earth's India point-of-view edition (ne_10m_admin_0_countries_ind), so India is drawn with its
official boundary: all of Jammu & Kashmir and Ladakh (including PoK and Aksai Chin) and Arunachal Pradesh.
The story spans England to China, so the plates go from a wide z4 "world" view down to z6 over India.
"""
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sugar" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("world", 4, -30.0, 145.0, -35.0, 74.0),
    ("west", 5, -12.0, 66.0, 10.0, 58.0),
    ("east", 5, 66.0, 125.0, 0.0, 45.0),
    ("india", 6, 62.0, 96.0, 5.0, 36.0),
]
COUNTRIES = {  # key: (Natural Earth ADMIN, simplify tolerance in degrees)
    "india": ("India", 0.015), "china": ("China", 0.04), "iran": ("Iran", 0.03), "saudi": ("Saudi Arabia", 0.03), "egypt": ("Egypt", 0.03),
    "italy": ("Italy", 0.02), "france": ("France", 0.02), "uk": ("United Kingdom", 0.02),
}
PLACES = {
    "india_c": (78.5, 22.5), "gujarat": (71.5, 22.0), "bengal": (88.0, 22.8), "persia": (53.5, 32.5), "arabia": (44.5, 24.0),
    "egypt": (31.0, 27.0), "italy": (12.5, 42.8), "france": (2.4, 46.6), "england": (-1.5, 52.6), "china": (104.0, 33.0),
    "canton": (113.3, 23.1), "europe": (12.0, 48.0),
}


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        if im.width > 3200:
            im = im.resize((3200, round(im.height * 3200 / im.width)))
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    clip = box(-30, -35, 145, 74)
    for key, (admin, tol) in COUNTRIES.items():
        g = C[admin]
        parts = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > (0.004 if key == "india" else 0.05)]
        geo[key] = rings(unary_union(parts).intersection(clip), tol)
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    (ROOT / "src" / "sugar").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "sugar" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k: sum(len(r) for r in v) for k, v in geo.items() if isinstance(v, list)})


if __name__ == "__main__":
    main()
