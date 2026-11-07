"""Plates and vectors for the Dingo Fence video (free data only).

    python3 -I tools/build_dingofence_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py; close-ups via build_canadalakes_maps.closeup). The fence: OpenStreetMap relation 3776543
"Wild Dog Barrier Fence" (© OpenStreetMap contributors, ODbL; saved in public/dingofence/osm_dingo_fence_3776543.json),
its 16 ways chained west to east. Countries: Natural Earth, India point-of-view edition; Australian states: Natural Earth
admin-1; land for the parchment map: Natural Earth 10 m land (all public domain).
"""
import glob
import json
import math
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_canadalakes_maps as cl  # noqa: E402
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "dingofence" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("indopac", 5, 4, 60.0, 179.9, -82.0, 45.0),
    ("aus", 6, 5, 108.0, 158.0, -47.0, -6.0),
    ("fence", 13, 10, 134.30, 134.70, -29.05, -28.45),
    ("atlantic", 5, 4, -95.0, 20.0, 15.0, 70.0),
]
POINTS = {
    "London": (-0.1276, 51.5072), "New York": (-74.0060, 40.7128), "Coober Pedy fence": (134.5002, -28.7533),
    "Australia": (134.0, -25.5), "Sydney": (151.2093, -33.8688), "Botany Bay": (151.20, -34.00),
}
STATES = ["South Australia", "New South Wales", "Queensland", "Western Australia", "Northern Territory", "Victoria", "Tasmania"]


def chain(osm: dict) -> list:
    """The fence's ways chained into one west-to-east line (small gaps between ways are bridged)."""
    nodes = {e["id"]: (e["lon"], e["lat"]) for e in osm["elements"] if e["type"] == "node"}
    ways = [[nodes[n] for n in e["nodes"] if n in nodes] for e in osm["elements"] if e["type"] == "way"]
    ways = [w for w in ways if len(w) > 1]
    start = min(range(len(ways)), key=lambda i: min(ways[i][0][0], ways[i][-1][0]))
    w = ways.pop(start)
    line = w if w[0][0] <= w[-1][0] else w[::-1]
    while ways:
        end = line[-1]
        best, rev, dist = None, False, 1e9
        for i, w in enumerate(ways):
            for r, p in ((False, w[0]), (True, w[-1])):
                d = math.hypot(p[0] - end[0], p[1] - end[1])
                if d < dist:
                    best, rev, dist = i, r, d
        w = ways.pop(best)
        line += (w[::-1] if rev else w)[1:]
    return line


def great_circle(a, b, n=80):
    la1, lo1, la2, lo2 = map(math.radians, (a[1], a[0], b[1], b[0]))
    d = 2 * math.asin(math.sqrt(math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2))
    out = []
    for i in range(n + 1):
        f = i / n
        A, B = math.sin((1 - f) * d) / math.sin(d), math.sin(f * d) / math.sin(d)
        x = A * math.cos(la1) * math.cos(lo1) + B * math.cos(la2) * math.cos(lo2)
        y = A * math.cos(la1) * math.sin(lo1) + B * math.cos(la2) * math.sin(lo2)
        z = A * math.sin(la1) + B * math.sin(la2)
        out.append((math.degrees(math.atan2(y, x)), math.degrees(math.atan2(z, math.hypot(x, y)))))
    return out


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    cl.OUT = OUT
    gj = ROOT / "src" / "dingofence" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        fn = cl.closeup if name == "fence" else uk.build
        geo["plates"][name] = fn(name, zs, zd, lo0, lo1, la0, la1, cache, **({"sat_water": True} if fn is uk.build else {}))
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)

    osm = json.loads((ROOT / "public" / "dingofence" / "osm_dingo_fence_3776543.json").read_text())
    line = chain(osm)
    # keep every point that moves the line by more than ~300 m, so the drawn path stays smooth but light
    slim = [line[0]]
    for p in line[1:]:
        if math.hypot(p[0] - slim[-1][0], (p[1] - slim[-1][1])) > 0.003:
            slim.append(p)
    slim.append(line[-1])
    geo["fence"] = [[round(mx(lon), 1), round(my(lat), 1)] for lon, lat in slim]
    # the two sides of the fence: the mainland split along the fence, extended out to sea at both ends
    from shapely.geometry import LineString
    from shapely.ops import split
    ext = [(slim[0][0] - 0.5, slim[0][1] - 1.5)] + slim + [(slim[-1][0] + 3.0, slim[-1][1])]
    geo["_ext"] = 1
    sides = None
    geo["fenceLonLat"] = [[round(lon, 4), round(lat, 4)] for lon, lat in slim[:: max(1, len(slim) // 400)]]

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {"Australia": rings(C["Australia"], 0.02, 0.05)}
    mainland = max(C["Australia"].geoms, key=lambda g: g.area)
    parts = split(mainland, LineString(ext))
    pieces = sorted(parts.geoms, key=lambda g: g.area, reverse=True)[:2]
    se = min(pieces, key=lambda g: g.representative_point().y)  # the south-east (sheep) side lies further south
    nw = [g for g in pieces if g is not se][0]
    geo["sides"] = {"sheep": rings(se, 0.02, 0.05), "dingo": rings(nw, 0.02, 0.05)}
    print("sides km2-ish", round(se.area), round(nw.area))
    geo.pop("_ext", None)
    sp = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes*.shp"))[0])
    S = {r["name"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sp.records(), sp.shapes()) if r["admin"] == "Australia"}
    geo["states"] = {n: rings(S[n], 0.01, 0.02) for n in STATES if n in S}
    geo["statePts"] = {n: [round(mx(S[n].representative_point().x)), round(my(S[n].representative_point().y))] for n in STATES if n in S}
    # the parchment map: land of the Indian and Pacific Ocean rims, simplified
    sl = shapefile.Reader(glob.glob(str(ne / "ne_10m_land*.shp"))[0])
    land = unary_union([shape(s.__geo_interface__).buffer(0) for s in sl.shapes()]).intersection(box(60, -60, 200, 50))
    geo["land"] = rings(land, 0.05, 0.5)
    geo["londonNY"] = [[round(mx(lon), 1), round(my(lat), 1)] for lon, lat in great_circle(POINTS["London"], POINTS["New York"])]
    geo["points"] = {k: [round(mx(lon)), round(my(lat))] for k, (lon, lat) in POINTS.items()}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "fence pts", len(geo["fence"]), "states", list(geo["states"]))


if __name__ == "__main__":
    main()
