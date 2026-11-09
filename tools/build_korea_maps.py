"""Plates and vectors for the Korea ("still at war") video (free data only).

    python3 -I tools/build_korea_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py). Countries: Natural Earth admin-0, India point-of-view edition (India's official
boundary wherever India is on screen). The DMZ is Natural Earth's North/South Korea border (the Military Demarcation
Line). The war's front lines are approximate, drawn from the usual campaign maps:
  - June 1950: the 38th parallel;
  - September 1950: the Pusan (Busan) Perimeter, along the Naktong River to the coast north of Pohang;
  - late November 1950: UN forces near the Yalu (drawn about 0.35° south of the Chinese/Russian border);
  - January 1951: the Chinese push south of Seoul, about 37° N;
  - July 1953: the armistice line (the DMZ).
Each front runs from the Yellow Sea to the Sea of Japan and is resampled to the same number of points, so the edit can
morph one into the next.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import LineString, box, shape
from shapely.ops import linemerge, unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "korea" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("asia", 6, 5, 55.0, 158.0, -35.0, 72.0),
    ("eastasia", 7, 6, 112.0, 146.0, 27.0, 50.0),
    ("korea", 9, 8, 123.5, 131.5, 33.0, 43.2),
    ("dmz", 11, 9, 126.2, 127.6, 37.55, 38.45),
]
N = 64  # points per front


def resample(pts: list, n: int = N) -> list:
    ln = LineString(pts)
    return [list(ln.interpolate(ln.length * i / (n - 1)).coords[0]) for i in range(n)]


def merc_line(pts: list) -> list:
    return [[round(mx(x), 0), round(my(y), 0)] for x, y in pts]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "korea" / "geo.json"
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
    nk, sk = C["North Korea"], C["South Korea"]
    korea = unary_union([nk, sk])
    view = box(55, -12, 160, 75)
    geo["countries"] = {
        "NK": rings(nk, 0.004, 0.0004), "SK": rings(sk, 0.004, 0.0004), "Korea": rings(korea, 0.004, 0.0004),
        "Japan": rings(C["Japan"], 0.01, 0.002), "Taiwan": rings(C["Taiwan"], 0.01, 0.002),
        "China": rings(C["China"].intersection(view), 0.03, 0.05), "Russia": rings(C["Russia"].intersection(view), 0.04, 0.2),
        "Mongolia": rings(C["Mongolia"], 0.03, 0.05), "India": rings(C["India"], 0.01, 0.02),
    }
    allc = unary_union([g.boundary for g in C.values()]).intersection(view).simplify(0.02)
    lines = [list(l.coords) for l in getattr(allc, "geoms", [allc]) if l.length > 0.1]
    geo["borders"] = [merc_line(l) for l in lines]
    # the DMZ (Military Demarcation Line): the shared border of the two Koreas, west to east
    mdl = linemerge(nk.boundary.intersection(sk.boundary.buffer(0.002)))
    mdl = max(getattr(mdl, "geoms", [mdl]), key=lambda g: g.length)
    m = list(mdl.simplify(0.003).coords)
    if m[0][0] > m[-1][0]:
        m = m[::-1]
    geo["dmz"] = merc_line(m)
    # North Korea's border with China and Russia (the Yalu and Tumen rivers)
    north = nk.boundary.intersection(unary_union([C["China"], C["Russia"]]).buffer(0.01))
    north = linemerge(north) if north.geom_type == "MultiLineString" else north
    north = max(getattr(north, "geoms", [north]), key=lambda g: g.length)
    yb = list(north.simplify(0.01).coords)
    if yb[0][0] > yb[-1][0]:
        yb = yb[::-1]
    geo["yalu"] = merc_line(yb)
    # the fronts (lon/lat), each from the Yellow Sea to the Sea of Japan
    yalu_front = [(124.0, 39.55)] + [(x, y - 0.35) for x, y in yb if x > 124.5] + [(131.5, yb[-1][1] - 0.35)]
    fronts = {
        "p38": [(123.6, 38.0), (131.6, 38.0)],
        "pusan": [(123.6, 34.2), (127.6, 34.55), (128.25, 35.05), (128.35, 35.45), (128.42, 35.85), (128.45, 36.15),
                  (128.6, 36.35), (129.0, 36.4), (129.4, 36.35), (131.6, 36.35)],
        "yalu": yalu_front,
        "jan51": [(123.6, 36.95), (126.6, 37.0), (127.3, 37.05), (127.9, 37.15), (128.6, 37.35), (129.2, 37.3), (131.6, 37.3)],
        "mdl": [(123.6, m[0][1] - 0.05)] + m + [(131.6, m[-1][1] + 0.05)],
    }
    geo["fronts"] = {k: merc_line(resample(v)) for k, v in fronts.items()}
    geo["centroids"] = {n: [round(g.centroid.x, 3), round(g.centroid.y, 3)] for n, g in
                        (("NK", nk), ("SK", sk), ("Japan", C["Japan"]), ("India", C["India"]), ("China", C["China"]))}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "borders", len(geo["borders"]), "dmz pts", len(m), "yalu pts", len(yb))


if __name__ == "__main__":
    main()
