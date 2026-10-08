"""Turn the GeoJSON pack into compact SVG path data for the Remotion geo camera.

Paths are written in degree space with x = lon and y = -lat, so the camera only
needs translate/scale/rotate to place them.
"""
import json
import math
import random
import sys
from pathlib import Path

from shapely.geometry import LineString, Point, Polygon, mapping, shape
from shapely.ops import unary_union

assets, out_path = Path(sys.argv[1]), Path(sys.argv[2])
countries = json.load(open(assets / "geo_countries.json"))
darien = shape(json.load(open(assets / "geo_darien.json"))["features"][0]["geometry"])
highway = [f["geometry"]["coordinates"] for f in json.load(open(assets / "geo_panamerican.json"))["features"]]


def fmt(v: float) -> str:
    return f"{v:.3f}".rstrip("0").rstrip(".")


def ring_d(coords) -> str:
    pts = list(coords)
    return "M" + "L".join(f"{fmt(x)},{fmt(-y)}" for x, y in pts) + "Z"


def poly_d(geom) -> str:
    polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    out = []
    for p in polys:
        out.append(ring_d(p.exterior.coords))
        out.extend(ring_d(i.coords) for i in p.interiors)
    return "".join(out)


def smooth_line(pts, samples: int = 8):
    """Catmull-Rom through waypoints so the drawn road reads as a curve."""
    pts = [tuple(p) for p in pts]
    if len(pts) < 3:
        return pts
    out = []
    ext = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for s in range(samples):
            t = s / samples
            t2, t3 = t * t, t * t * t
            out.append(tuple(
                0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2
                       + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
                for k in range(2)
            ))
    out.append(pts[-1])
    return out


def line_d(pts) -> str:
    return "M" + "L".join(f"{fmt(x)},{fmt(-y)}" for x, y in pts)


by_name = {f["properties"]["name"]: shape(f["geometry"]) for f in countries["features"]}
by_cont = {}
for f in countries["features"]:
    by_cont.setdefault(f["properties"]["continent"], []).append(shape(f["geometry"]))

north = unary_union(by_cont["North America"]).simplify(0.08, preserve_topology=True)
south = unary_union(by_cont["South America"]).simplify(0.08, preserve_topology=True)
# keep only sizeable landmasses for the continent flashes
north = unary_union([g for g in getattr(north, "geoms", [north]) if g.area > 0.5])
south = unary_union([g for g in getattr(south, "geoms", [south]) if g.area > 0.5])

panama = by_name["Panama"].simplify(0.004, preserve_topology=True)
colombia = by_name["Colombia"].simplify(0.01, preserve_topology=True)
region = darien.simplify(0.003, preserve_topology=True)

# 160 km arrow along the region's long axis (minimum rotated rectangle)
rect = list(region.minimum_rotated_rectangle.exterior.coords)[:4]
edges = [(rect[i], rect[(i + 1) % 4]) for i in range(4)]
long_edge = max(edges, key=lambda e: math.dist(*e))
short_edge = min(edges, key=lambda e: math.dist(*e))
c = region.centroid
dx, dy = long_edge[1][0] - long_edge[0][0], long_edge[1][1] - long_edge[0][1]
L = math.hypot(dx, dy)
ux, uy = dx / L, dy / L
half = L * 0.40
arrow = [(c.x - ux * half, c.y - uy * half), (c.x + ux * half, c.y + uy * half)]
if arrow[0][1] < arrow[1][1]:
    arrow = arrow[::-1]  # start at the northern end

# Illustrative migrant routes (schematic, like the reference): converge on Necocli/Turbo,
# cross the region to Lajas Blancas, then continue north.
routes_south = [
    [(-66.9, 10.5), (-70.5, 8.9), (-73.2, 8.3), (-75.5, 8.4), (-76.73, 8.41)],
    [(-78.5, -0.2), (-77.3, 1.2), (-76.2, 3.6), (-75.6, 6.2), (-76.73, 8.41)],
    [(-60.0, -3.1), (-67.0, -1.0), (-72.0, 2.5), (-75.2, 6.0), (-76.73, 8.41)],
    [(-77.04, -12.05), (-79.0, -8.1), (-80.3, -3.6), (-78.5, 0.4), (-76.9, 4.5), (-76.73, 8.41)],
]
route_cross = [(-76.73, 8.41), (-77.05, 8.15), (-77.45, 7.95), (-77.75, 8.05), (-77.95, 8.33), (-78.2, 8.75)]
routes_north = [
    [(-78.2, 8.75), (-79.5, 9.0), (-82.9, 8.5), (-84.1, 9.9), (-86.3, 12.1), (-89.2, 13.7), (-92.3, 14.9),
     (-96.7, 17.1), (-99.1, 19.4), (-101.0, 22.5), (-103.8, 26.5), (-106.4, 31.7)],
    [(-78.2, 8.75), (-79.5, 9.0), (-82.9, 8.5), (-84.1, 9.9), (-86.3, 12.1), (-88.0, 14.0), (-90.5, 14.6),
     (-93.1, 16.7), (-96.0, 19.0), (-97.6, 22.5), (-98.3, 26.0), (-97.5, 25.9)],
]

# moving people dots: start near the Colombian side, travel NW across the region
random.seed(7)
minx, miny, maxx, maxy = region.bounds
inner = region.buffer(-0.05)
dots = []
while len(dots) < 26:
    p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
    if inner.contains(p):
        dots.append(p)
dots.sort(key=lambda p: -(p.x * -0.6 + p.y * 0.8))
dot_data = []
for i, p in enumerate(dots):
    q = Point(p.x - 0.32 + random.uniform(-0.05, 0.05), p.y + 0.22 + random.uniform(-0.05, 0.05))
    if not inner.contains(q):
        q = Point(p.x - 0.12, p.y + 0.08)
    dot_data.append({"x0": round(p.x, 4), "y0": round(p.y, 4), "x1": round(q.x, 4), "y1": round(q.y, 4),
                     "dies": i % 3 == 1, "delay": round(random.uniform(0, 0.8), 3)})

# danger points (criminals/gangs): spread over the region
random.seed(11)
danger = []
while len(danger) < 7:
    p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
    if inner.contains(p) and all(math.dist((p.x, p.y), (d["x"], d["y"])) > 0.28 for d in danger):
        danger.append({"x": round(p.x, 4), "y": round(p.y, 4), "r": round(random.uniform(0.7, 1.3), 2)})

# tree positions for the ending (south-west half of region visible from the tilted camera)
random.seed(3)
trees = []
while len(trees) < 14:
    p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
    if inner.contains(p) and all(math.dist((p.x, p.y), (t["x"], t["y"])) > 0.2 for t in trees):
        trees.append({"x": round(p.x, 4), "y": round(p.y, 4), "k": len(trees) % 6 + 1,
                      "s": round(random.uniform(0.85, 1.25), 2)})
trees.sort(key=lambda t: -t["y"])  # back-to-front draw order

out = {
    "region": poly_d(region),
    "regionCenter": [round(c.x, 4), round(c.y, 4)],
    "regionBounds": [round(v, 4) for v in region.bounds],
    "panama": poly_d(panama),
    "colombia": poly_d(colombia),
    "north": poly_d(north),
    "south": poly_d(south),
    "hwNorth": line_d(smooth_line(highway[0])),
    "hwSouth": line_d(smooth_line(highway[1])),
    "hwGap": [highway[0][-1], highway[1][0]],
    "arrow": [[round(x, 4), round(y, 4)] for x, y in arrow],
    "arrowAngle": round(math.degrees(math.atan2(-(arrow[1][1] - arrow[0][1]), arrow[1][0] - arrow[0][0])), 2),
    "routesSouth": [line_d(smooth_line(r, 10)) for r in routes_south],
    "routeCross": line_d(smooth_line(route_cross, 10)),
    "routesNorth": [line_d(smooth_line(r, 10)) for r in routes_north],
    "dots": dot_data,
    "danger": danger,
    "trees": trees,
    "panamaLabel": [-80.6, 8.55],
    "colombiaLabel": [-75.9, 6.6],
}
out_path.write_text(json.dumps(out, separators=(",", ":")))
print({k: (len(v) if isinstance(v, (str, list)) else v) for k, v in out.items()})
