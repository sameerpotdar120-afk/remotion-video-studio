"""Plates and vectors for the map-sizes (Mercator) video (free data only).

    python3 -I tools/build_mapsizes_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py). Countries: Natural Earth admin-0, India point-of-view edition (India's official
boundary); land for the parchment map: Natural Earth 10 m land (public domain). The globe texture is the closestspace
EOX equirectangular (public/mapsizes/maps/globe_eq.jpg).

Shapes are stored twice: in Web Mercator metres (drawn on the map) and in lon/lat degrees (moved across latitudes with
their true size, the way thetruesize.com works: rotate on the sphere, then project).
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
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "mapsizes" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("world", 5, 4, -180.0, 179.999, -62.0, 84.0),
    ("greenland", 6, 4, -78.0, -6.0, 57.0, 84.0),
    ("india", 7, 6, 64.0, 100.0, 4.0, 39.0),
]


def deg_rings(g, tol: float) -> list:
    """Rings in lon/lat degrees (largest polygons first), simplified."""
    g = g.simplify(tol, preserve_topology=True)
    polys = sorted(getattr(g, "geoms", [g]), key=lambda p: p.area, reverse=True)
    return [[[round(x, 3), round(y, 3)] for x, y in p.exterior.coords] for p in polys if p.area > tol * tol * 4]


def extremes(g) -> dict:
    pts = list(g.exterior.coords)
    return {"n": max(pts, key=lambda p: p[1]), "s": min(pts, key=lambda p: p[1]), "w": min(pts, key=lambda p: p[0]), "e": max(pts, key=lambda p: p[0])}


def parallel_of_width(g, target_km: float, lat0: float, lat1: float) -> tuple:
    """The parallel (between lat0 and lat1) where the shape's east-west width on the ground is closest to target_km.

    Greenland's often-quoted east-west width is 1,050 km; on Natural Earth it is that wide around 74° N (at 77° N, across
    the north-west cape, it reaches ~1,330 km), so the line is drawn where the quoted figure is true."""
    best = (1e9, None, 0)
    for k in range(400):
        lat = lat0 + (lat1 - lat0) * k / 399
        cut = g.intersection(box(-180, lat - 1e-4, 180, lat + 1e-4))
        if cut.is_empty:
            continue
        x0, _, x1, _ = cut.bounds
        km = (x1 - x0) * 111.32 * math.cos(math.radians(lat))
        if abs(km - target_km) < best[0]:
            best = (abs(km - target_km), ((x0, lat), (x1, lat)), km)
    return best[2], best[1]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "mapsizes" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    recs = list(zip(sf.records(), sf.shapes()))
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in recs}
    africa = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in recs if r["CONTINENT"] == "Africa"])
    gl, ind = C["Greenland"], C["India"]
    gl_main = max(gl.geoms, key=lambda p: p.area) if hasattr(gl, "geoms") else gl
    in_main = max(ind.geoms, key=lambda p: p.area) if hasattr(ind, "geoms") else ind
    geo["countries"] = {"Greenland": rings(gl, 0.02, 0.08), "India": rings(ind, 0.01, 0.02), "Africa": rings(africa, 0.04, 0.3)}
    geo["deg"] = {"Greenland": deg_rings(gl, 0.05), "India": deg_rings(ind, 0.03), "Africa": deg_rings(africa, 0.08)}
    # thin borders of every country, for the map's GeoLayers look
    allc = unary_union([g.boundary for g in C.values()]).intersection(box(-180, -62, 180, 84)).simplify(0.06)
    lines = [list(l.coords) for l in getattr(allc, "geoms", [allc]) if l.length > 0.3]
    geo["borders"] = [[[round(mx(x), 0), round(my(y), 0)] for x, y in l] for l in lines]
    # the measuring lines (ends in lon/lat): north-south through the extreme tips, east-west on the widest parallel
    eg, ei = extremes(gl_main), extremes(in_main)
    km_gl, ew_gl = parallel_of_width(gl_main, 1050, 73.5, 75.5)
    geo["measure"] = {
        "glNS": [eg["n"], eg["s"]], "glEW": list(ew_gl), "inNS": [ei["n"], ei["s"]], "inEW": [ei["w"], ei["e"]],
    }
    print("greenland east-west line km", round(km_gl), ew_gl, "tips", eg["n"], eg["s"])
    print("india tips", ei)
    geo["centroids"] = {n: [round(g.centroid.x, 3), round(g.centroid.y, 3)] for n, g in (("Greenland", gl_main), ("India", in_main), ("Africa", africa))}
    # land for the parchment map (the Atlantic between Europe/Africa and the Americas) and the gores
    sl = shapefile.Reader(glob.glob(str(ne / "ne_10m_land*.shp"))[0])
    land = unary_union([shape(s.__geo_interface__).buffer(0) for s in sl.shapes()])
    geo["land"] = rings(land.intersection(box(-110, -45, 40, 72)), 0.06, 0.6)
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "borders", len(geo["borders"]))


if __name__ == "__main__":
    main()
