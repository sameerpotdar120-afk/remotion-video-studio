"""Satellite plates and vectors for the Märket video.

    python3 -I tools/build_market_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Countries: Natural Earth 1:10m (public domain).
Märket itself (about 350 × 150 m) is far below Natural Earth's detail, so its outline and both border lines (the straight
1809 line and the 1985 zig-zag) are drawn by hand over the z17 satellite plate.
"""
import json
import math
import sys
from pathlib import Path

import shapefile
from shapely.geometry import Point, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import border, lines, mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "market" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("nordic", 5, -2.0, 42.0, 50.0, 72.5),
    ("baltic", 8, 13.0, 27.0, 57.5, 66.5),
    ("aland", 11, 17.9, 21.4, 59.6, 60.8),
    ("skerry", 14, 18.95, 19.32, 60.24, 60.36),
    ("market", 17, 19.120, 19.142, 60.297, 60.305),
]
MARKET = (19.1308, 60.3011)


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
    sf = shapefile.Reader(str(ne / "z10" / "ne_10m_admin_0_countries.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    clip = box(-5, 50, 45, 72)
    big = lambda g: unary_union([p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 0.0005]).intersection(clip)
    se, fi, ru, no = big(C["Sweden"]), big(C["Finland"]), big(C["Russia"]), big(C["Norway"])
    geo.update({
        "sweden": rings(se, 0.004), "finland": rings(fi, 0.004), "russia": rings(ru.intersection(box(25, 50, 45, 72)), 0.01), "norway": rings(no, 0.006),
        "b_land": border(se, fi, 0.002),
        "places": {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in {
            "market": MARKET, "stockholm": (18.07, 59.33), "helsinki": (24.94, 60.17), "mariehamn": (19.94, 60.10),
            "sweden_c": (15.5, 63.0), "finland_c": (26.0, 63.5), "petersburg": (30.3, 59.94)}.items()},
    })
    (ROOT / "src" / "market").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "market" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k: sum(len(r) for r in v) for k, v in geo.items() if isinstance(v, list) and v and isinstance(v[0], list) and isinstance(v[0][0], list)})


if __name__ == "__main__":
    main()
