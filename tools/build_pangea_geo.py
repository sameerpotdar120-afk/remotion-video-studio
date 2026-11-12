"""Continent shapes for the Pangea video (free data only).

    python3 -I tools/build_pangea_geo.py <ne_dir>

Natural Earth admin-0, India point-of-view edition (public domain; India's official boundary), grouped into the pieces
that drift in the video. Each piece is projected on its own Lambert azimuthal equal-area plane (km, north up), centred
on the piece, so the edit can slide and turn it like a cut-out. The past and future layouts are keyed by hand in the
edit after published reconstructions (Pangea about 250 million years ago; Pangaea Ultima after Scotese's model); they are
illustrative, not plate-model output. The satellite plate is the India plate built for the map-sizes video.
"""
import glob
import json
import math
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape, Polygon, MultiPolygon
from shapely.ops import unary_union, transform

ROOT = Path(__file__).resolve().parent.parent
R = 6371.0
ARABIA = {"Saudi Arabia", "Yemen", "Oman", "United Arab Emirates", "Qatar", "Bahrain", "Kuwait"}
INDIA = {"India", "Pakistan", "Nepal", "Bhutan", "Bangladesh", "Sri Lanka"}
CENTRES = {"india": (79, 22), "africa": (20, 3), "madagascar": (46.8, -19), "samerica": (-60, -17), "namerica": (-98, 48),
           "eurasia": (85, 52), "australia": (140, -26), "antarctica": (0, -90)}
HIMALAYA = [(73.5, 35.6), (75.5, 34.6), (77.5, 33.4), (79.5, 31.0), (81.5, 29.9), (84.0, 28.6), (86.9, 27.99), (89.0, 27.8),
            (91.5, 27.9), (94.0, 28.6), (95.5, 28.9)]


def laea(lon0: float, lat0: float):
    l0, p0 = math.radians(lon0), math.radians(lat0)

    def f(lon, lat, z=None):
        l, p = math.radians(lon), math.radians(lat)
        k = math.sqrt(2 / max(1e-9, 1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
        x = R * k * math.cos(p) * math.sin(l - l0)
        y = R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
        return x, y
    return f


def proj_rings(g, fn, tol: float, min_area: float) -> list:
    g = transform(lambda xs, ys, z=None: tuple(zip(*[fn(x, y) for x, y in zip(xs, ys)])), g).buffer(0).simplify(tol)
    out = []
    for p in getattr(g, "geoms", [g]):
        if isinstance(p, Polygon) and p.area > min_area:
            out.append([[round(x), round(-y)] for x, y in p.exterior.coords])
    return out


def main() -> None:
    ne = Path(sys.argv[1])
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    recs = [(r, shape(s.__geo_interface__).buffer(0)) for r, s in zip(sf.records(), sf.shapes())]
    by = lambda pred: unary_union([g for r, g in recs if pred(r)])  # noqa: E731
    grp = {
        "india": by(lambda r: r["ADMIN"] in INDIA),
        "africa": by(lambda r: (r["CONTINENT"] == "Africa" and r["ADMIN"] != "Madagascar") or r["ADMIN"] in ARABIA),
        "madagascar": by(lambda r: r["ADMIN"] == "Madagascar"),
        "samerica": by(lambda r: r["CONTINENT"] == "South America"),
        "namerica": by(lambda r: r["CONTINENT"] == "North America").intersection(box(-170, 5, -10, 84)),
        "eurasia": by(lambda r: r["CONTINENT"] in ("Europe", "Asia") and r["ADMIN"] not in INDIA | ARABIA).intersection(box(-25, 0, 180, 84)),
        "australia": by(lambda r: r["ADMIN"] in ("Australia", "Papua New Guinea", "New Zealand")),
        "antarctica": by(lambda r: r["CONTINENT"] == "Antarctica"),
    }
    geo = {"pieces": {}, "india_country": [], "himalaya": []}
    for k, g in grp.items():
        fn = laea(*CENTRES[k])
        geo["pieces"][k] = proj_rings(g, fn, 12, 20000 if k not in ("india", "madagascar") else 3000)
        print(k, len(geo["pieces"][k]), sum(len(r) for r in geo["pieces"][k]))
    fi = laea(*CENTRES["india"])
    C = {r["ADMIN"]: g for r, g in recs}
    geo["india_country"] = proj_rings(C["India"], fi, 6, 3000)
    geo["himalaya"] = [[round(x), round(-y)] for x, y in (fi(a, b) for a, b in HIMALAYA)]
    geo["everest"] = [round(v) for v in fi(86.925, 27.988)]
    geo["everest"][1] *= -1
    out = ROOT / "src" / "pangea" / "geo.json"
    out.write_text(json.dumps(geo, separators=(",", ":")))
    print("kB", out.stat().st_size // 1024)


if __name__ == "__main__":
    main()
