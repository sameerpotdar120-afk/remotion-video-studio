"""Maps and vectors for the Spain hidden-neighbours video.

    python3 -I tools/build_spain_maps.py <tile_cache> <ne_dir>

Satellite plates: EOX "Sentinel-2 cloudless 2024" (CC BY 4.0, credited on screen), Web Mercator, stitched by
fetch_mumbai_tiles.stitch. Country shapes and borders: Natural Earth 1:10m (public domain): Spain's parts include
Llívia, Ceuta, Melilla and the Peñón de Vélez de la Gomera; Gibraltar is its own territory. Pheasant Island is too
small for Natural Earth, so it is drawn from its coordinates (about 200 m long, in the Bidasoa).
"""
import json
import math
import sys
from pathlib import Path

import shapefile
from shapely.geometry import LineString, MultiLineString, Point, Polygon, box, shape
from shapely.ops import linemerge, unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "spain" / "maps"
R = 6378137.0


def mx(lon: float) -> float:
    return R * math.radians(lon)


def my(lat: float) -> float:
    return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("europe", 6, -16.0, 34.0, 16.0, 61.0),
    ("iberia", 8, -10.5, 5.5, 34.0, 44.8),
    ("cerdanya", 12, 1.30, 2.25, 42.30, 42.72),
    ("bidasoa", 15, -1.86, -1.68, 43.30, 43.40),
    ("strait", 11, -6.30, -4.80, 35.65, 36.45),
    ("gibraltar", 14, -5.43, -5.29, 36.07, 36.18),
    ("alboran", 10, -5.60, -2.60, 34.85, 36.10),
    ("penon", 16, -4.318, -4.284, 35.162, 35.182),
]
PLACES = {
    "llivia": (1.981, 42.464), "puigcerda": (1.928, 42.432), "pheasant": (-1.7661, 43.3428), "andorra": (1.55, 42.55),
    "gibraltar": (-5.353, 36.135), "ceuta": (-5.318, 35.889), "melilla": (-2.938, 35.292), "penon": (-4.3003, 35.1724),
    "london": (-0.12, 51.5), "madrid": (-3.70, 40.42), "lisbon": (-9.14, 38.72), "paris": (2.35, 48.86),
}


def to_m(g):
    if g.geom_type == "Polygon":
        return Polygon([(mx(x), my(y)) for x, y in g.exterior.coords], [[(mx(x), my(y)) for x, y in h.coords] for h in g.interiors])
    if g.geom_type in ("MultiPolygon", "GeometryCollection"):
        return unary_union([to_m(p) for p in g.geoms if p.geom_type in ("Polygon", "MultiPolygon")])
    if g.geom_type == "LineString":
        return LineString([(mx(x), my(y)) for x, y in g.coords])
    if g.geom_type == "MultiLineString":
        return MultiLineString([[(mx(x), my(y)) for x, y in l.coords] for l in g.geoms])
    raise ValueError(g.geom_type)


def rings(g, tol):
    out = []
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type != "Polygon":
            continue
        s = p.simplify(tol, preserve_topology=True)
        out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.exterior.coords])
    return out


def lines(g, tol):
    if g.is_empty:
        return []
    g = linemerge(g) if g.geom_type == "MultiLineString" else g
    out = []
    for l in (g.geoms if hasattr(g, "geoms") else [g]):
        if l.geom_type != "LineString" or l.length < tol * 3:
            continue
        s = l.simplify(tol)
        out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.coords])
    return out


def border(a, b, tol):
    """The shared boundary of two touching countries (Natural Earth edges coincide to within a few metres)."""
    return lines(a.boundary.intersection(b.buffer(0.002)), tol)


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
    C, africa = {}, []
    for r, s in zip(sf.records(), sf.shapes()):
        g = shape(s.__geo_interface__)
        C[r["ADMIN"]] = g
        if r["CONTINENT"] == "Africa":
            africa.append(g)
    parts = lambda g: list(g.geoms) if hasattr(g, "geoms") else [g]
    spain = C["Spain"]
    near = lambda lo, la: next(p for p in parts(spain) if p.buffer(0.003).contains(Point(lo, la)))
    spain_main = max(parts(spain), key=lambda p: p.area)
    llivia, ceuta, melilla, penon = near(*PLACES["llivia"]), near(*PLACES["ceuta"]), near(*PLACES["melilla"]), near(*PLACES["penon"])
    france = max(parts(C["France"]), key=lambda p: p.area)
    portugal = max(parts(C["Portugal"]), key=lambda p: p.area)
    andorra, gib, morocco = C["Andorra"], C["Gibraltar"], C["Morocco"]
    uk = unary_union([p for p in parts(C["United Kingdom"]) if p.intersects(box(-11, 49.5, 2.5, 61))])
    afr = unary_union(africa).intersection(box(-20, -36, 55, 38))
    europe_box = box(-25, 34, 45, 72)
    europe = unary_union([g for k, g in C.items() if g.intersects(europe_box) and k not in ("Morocco", "Algeria", "Tunisia", "Libya", "Egypt", "Russia", "Turkey", "Kazakhstan", "Syria", "Iraq", "Iran")]).intersection(box(-25, 34, 40, 72))

    # Pheasant Island: ~200 m long, ~40 m wide, lying along the river (WSW–ENE)
    cx, cy, ang = mx(PLACES["pheasant"][0]), my(PLACES["pheasant"][1]), math.radians(18)
    k = 1 / math.cos(math.radians(PLACES["pheasant"][1]))  # Mercator metres per metre
    ph = [[round(cx + (100 * math.cos(t) * math.cos(ang) - 22 * math.sin(t) * math.sin(ang)) * k, 1),
           round(cy + (100 * math.cos(t) * math.sin(ang) + 22 * math.sin(t) * math.cos(ang)) * k, 1)] for t in [i * math.pi / 24 for i in range(49)]]

    geo.update({
        "spain": rings(spain_main, 0.006), "france": rings(france, 0.008), "portugal": rings(portugal, 0.006),
        "andorra": rings(andorra, 0.001), "uk": rings(uk, 0.01), "gibraltar": rings(gib, 0.0002),
        "morocco": rings(morocco, 0.008), "africa": rings(afr, 0.05), "europe": rings(europe, 0.05),
        "llivia": rings(llivia, 0.0002), "ceuta": rings(ceuta, 0.0002), "melilla": rings(melilla, 0.0002),
        "penon": rings(penon, 0.00001), "pheasant": [ph],
        "b_france": border(spain_main, france, 0.002), "b_portugal": border(spain_main, portugal, 0.002),
        "b_andorra": lines(andorra.boundary, 0.0008), "b_llivia": lines(llivia.boundary, 0.0002),
        "b_gibraltar": border(spain_main, gib, 0.00005), "b_ceuta": border(ceuta, morocco, 0.0001),
        "b_melilla": border(melilla, morocco, 0.0001), "b_penon": border(penon, morocco, 0.000005),
        "places": {k2: [round(mx(a), 1), round(my(b), 1)] for k2, (a, b) in PLACES.items()},
    })
    # Llívia's gap to Spain: the shortest line between the two
    from shapely.ops import nearest_points
    pa, pb = nearest_points(llivia, spain_main)
    geo["llivia_gap"] = [[round(mx(pa.x), 1), round(my(pa.y), 1)], [round(mx(pb.x), 1), round(my(pb.y), 1)]]
    gap_km = math.dist((pa.x * 111.32 * math.cos(math.radians(42.45)), pa.y * 110.57), (pb.x * 111.32 * math.cos(math.radians(42.45)), pb.y * 110.57))
    pen_m = sum(l.length for l in [to_m(LineString(c)) for c in []]) if False else None
    print(f"Llívia gap {gap_km:.2f} km; Peñón border segments {len(geo['b_penon'])}")
    for k2 in ["b_penon", "b_gibraltar", "b_ceuta", "b_melilla"]:
        L = 0.0
        for ln in geo[k2]:
            for (x0, y0), (x1, y1) in zip(ln, ln[1:]):
                lat = math.degrees(2 * math.atan(math.exp(y0 / R)) - math.pi / 2)
                L += math.hypot(x1 - x0, y1 - y0) * math.cos(math.radians(lat))
        print(f"  {k2}: {L:.0f} m")
    (ROOT / "src" / "spain").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "spain" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k2: sum(len(r) for r in v) for k2, v in geo.items() if isinstance(v, list) and v and isinstance(v[0], list) and isinstance(v[0][0], list)})


if __name__ == "__main__":
    main()
