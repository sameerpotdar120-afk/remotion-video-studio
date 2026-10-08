"""Vector overlays for the Diomede video, in unwrapped Web Mercator metres.

    python3 tools/build_diomede_geo.py <pack_img_dir> src/diomede/geo.json
"""
import json
import math
import sys
from pathlib import Path

from shapely.geometry import LineString, MultiLineString, Point, Polygon, shape
from shapely.ops import nearest_points, transform

R = 6378137.0
src, out = Path(sys.argv[1]), Path(sys.argv[2])


def merc(lon, lat, z=None):
    lon = lon + 360 if lon < 0 else lon
    return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def to_m(geom):
    return transform(lambda x, y, z=None: tuple(zip(*[merc(a, b) for a, b in zip(x, y)])), geom)


def rings(poly, tol):
    p = poly.simplify(tol, preserve_topology=True)
    polys = [p] if p.geom_type == "Polygon" else list(p.geoms)
    return [[[round(x), round(y)] for x, y in q.exterior.coords] for q in polys]


def lines(geom, tol=0):
    g = geom.simplify(tol) if tol else geom
    parts = [g] if g.geom_type == "LineString" else list(g.geoms)
    return [[[round(x), round(y)] for x, y in q.coords] for q in parts]


isl = {f["properties"]["name"]: to_m(shape(f["geometry"])) for f in json.load(open(src / "geo_islands.json"))["features"]}
big, little = isl["Big Diomede"], isl["Little Diomede"]

border = to_m(shape(json.load(open(src / "geo_border.json"))["features"][0]["geometry"]))

dl = shape(json.load(open(src / "geo_dateline.json"))["features"][0]["geometry"])
# the date line is stored in 0..360-ish longitudes already; unwrap any negative parts
dl_parts = []
for part in (dl.geoms if dl.geom_type == "MultiLineString" else [dl]):
    pts = [merc(x, y) for x, y in part.coords]
    dl_parts.append(LineString(pts))
dateline = MultiLineString(dl_parts)
# order the parts north -> south (each part also north -> south) so the line can draw on top-down
parts = []
for p in dl_parts:
    c = list(p.coords)
    if c[0][1] < c[-1][1]:
        c = c[::-1]
    parts.append(c)
parts.sort(key=lambda c: -c[0][1])

alaska = to_m(shape(json.load(open(src / "geo_alaska.json"))["features"][0]["geometry"]))

# closest points between the islands for the 3.8 km arrow
pa, pb = nearest_points(little, big)
lat_mid = math.degrees(2 * math.atan(math.exp(((pa.y + pb.y) / 2) / R)) - math.pi / 2)
ground_km = pa.distance(pb) * math.cos(math.radians(lat_mid)) / 1000

# a walking path across the ice: from Little's west coast to Big's east coast, a little south of the gap
walk_a = nearest_points(little, Point(pa.x - 300, pa.y - 2600))[0]
walk_b = nearest_points(big, Point(pb.x + 300, pb.y - 2600))[0]

out.write_text(json.dumps({
    "big": rings(big, 15),
    "little": rings(little, 8),
    "bigCenter": [round(big.centroid.x), round(big.centroid.y)],
    "littleCenter": [round(little.centroid.x), round(little.centroid.y)],
    "bigBounds": [round(v) for v in big.bounds],
    "littleBounds": [round(v) for v in little.bounds],
    "gapA": [round(pa.x), round(pa.y)],
    "gapB": [round(pb.x), round(pb.y)],
    "gapKm": round(ground_km, 2),
    "walk": [[round(walk_a.x), round(walk_a.y)], [round(walk_b.x), round(walk_b.y)]],
    "border": lines(border),
    "dateline": [[[round(x), round(y)] for x, y in c] for c in parts],
    "alaska": rings(alaska, 2500),
}, separators=(",", ":")))
print("gap km", round(ground_km, 2), "big pts", len(rings(big, 15)[0]), "alaska rings", len(rings(alaska, 2500)), "dateline parts", [(len(c), round(c[0][1]), round(c[-1][1])) for c in parts])
