"""Satellite plates and vectors for the Cooch Behar enclaves video.

    python3 -I tools/build_coochbehar_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen).
Borders: Natural Earth's India point-of-view edition (public domain), so India has its official boundary.
Natural Earth has no pre-2015 enclaves, and no open dataset has all 162 of them, so the enclave dots are drawn in code:
111 Indian ones placed in the real border band inside Bangladesh, 51 Bangladeshi ones inside India (Cooch Behar side).
Their spread is illustrative; the counts are real. Dahala Khagrabari sits at its real coordinates (26°9'0.18"N
88°45'44.85"E), and its three nested rings are a schematic of the real nesting.
"""
import json
import math
import random
import sys
from pathlib import Path

import shapefile
from shapely.geometry import Point, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import border, mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "coochbehar" / "maps"
DAHALA = (88.76246, 26.15005)
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("asia", 6, 62.0, 100.0, 5.0, 36.0),
    ("bengal", 8, 84.0, 94.0, 21.0, 28.5),
    ("border", 11, 88.2, 90.1, 25.6, 26.8),
    ("mid", 13, 88.55, 89.0, 26.0, 26.3),
    ("local", 15, 88.70, 88.83, 26.11, 26.19),
]
PLACES = {
    "india_c": (78.5, 22.5), "bangladesh_c": (90.3, 23.8), "coochbehar": (89.45, 26.32), "dahala": DAHALA,
    "rangpur": (89.25, 25.75), "delhi": (77.2, 28.6), "dhaka": (90.41, 23.81),
}


def enclave_dots(india, bd, seed: int = 1947) -> tuple[list, list]:
    """111 points inside Bangladesh and 51 inside India, all within the real enclave belt along the Cooch Behar border."""
    rnd = random.Random(seed)
    belt = box(88.45, 25.85, 89.9, 26.55)
    line = india.boundary.intersection(bd.buffer(0.002))
    out = {"in_bd": [], "in_in": []}
    want = {"in_bd": (111, bd, 0.30), "in_in": (51, india, 0.22)}
    for key, (n, host, reach) in want.items():
        pts = []
        while len(pts) < n:
            p = Point(rnd.uniform(belt.bounds[0], belt.bounds[2]), rnd.uniform(belt.bounds[1], belt.bounds[3]))
            if not host.contains(p) or line.distance(p) > reach or line.distance(p) < 0.02:
                continue
            if any(p.distance(q) < 0.028 for q in pts):
                continue
            pts.append(p)
        out[key] = [[round(mx(p.x), 1), round(my(p.y), 1), round(rnd.uniform(0.6, 1.4), 2)] for p in pts]
    return out["in_bd"], out["in_in"]


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
    clip = box(55, 0, 110, 40)
    india = unary_union([p for p in C["India"].geoms if p.area > 0.004])
    bd = unary_union([p for p in C["Bangladesh"].geoms if p.area > 0.002]) if hasattr(C["Bangladesh"], "geoms") else C["Bangladesh"]
    geo["india"] = rings(india.intersection(clip), 0.01)
    geo["bangladesh"] = rings(bd, 0.004)
    geo["india_fine"] = rings(india, 0.002)
    geo["border"] = border(india, bd, 0.0015)
    geo["dots_bd"], geo["dots_in"] = enclave_dots(india, bd)
    # the walk to a doctor: from the enclave dot nearest the border, across the line, 3 km into India
    from shapely.ops import nearest_points
    line = india.boundary.intersection(bd.buffer(0.002))
    best = None
    for x, y, _ in geo["dots_bd"]:
        lon = x / 6378137 * 180 / 3.141592653589793
        lat = math.degrees(2 * math.atan(math.exp(y / 6378137)) - math.pi / 2)
        q = Point(lon, lat)
        dd = line.distance(q)
        if 0.04 < dd < 0.08 and (best is None or q.x > 89.0 and best[1] > dd):
            best = (q, dd)
    q = best[0]
    b0 = nearest_points(q, line)[1]
    vx, vy = b0.x - q.x, b0.y - q.y
    walk = [(q.x, q.y), (q.x + vx * 0.4 + vy * 0.15, q.y + vy * 0.4 - vx * 0.15), (b0.x, b0.y), (b0.x + vx * 0.5, b0.y + vy * 0.5)]
    geo["walk"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in walk]
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    (ROOT / "src" / "coochbehar").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "coochbehar" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k: (len(v) if not isinstance(v, dict) else len(v)) for k, v in geo.items()})


if __name__ == "__main__":
    main()
