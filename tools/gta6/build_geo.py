#!/usr/bin/env python3
"""GTA 6 Short: project the world (Natural Earth 10m, India's point-of-view edition), the US states (us-atlas)
and three Indian states into one equirectangular world (lat0 30, K world px per radian), simplified at three
levels of detail. Writes geo.json for the film's WorldMap item.

  python3 -I tools/gta6/build_geo.py <ne_admin0_ind.geojson> <us-atlas states-10m.json> <ne_admin1.geojson> <out.json>
"""
import json, math, sys
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import transform

K = 100000.0
C30 = math.cos(math.radians(30))
def proj(lon, lat):
    return (math.radians(lon) * C30 * K, -math.radians(lat - 30) * K)
def P(geom):
    return transform(lambda xs, ys, zs=None: tuple(zip(*[proj(x, y) for x, y in zip(xs, ys)])) if False else
                     ([proj(x, y)[0] for x, y in zip(xs, ys)], [proj(x, y)[1] for x, y in zip(xs, ys)]), geom)

TOL = [25.0, 250.0, 2500.0]
def rings(geom, tol):
    g = geom.simplify(tol, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else list(g.geoms) if isinstance(g, MultiPolygon) else []
    out = []
    for p in polys:
        if p.is_empty or p.area < (tol * 3) ** 2:
            continue
        for r in [p.exterior, *p.interiors]:
            cs = [[round(x), round(y)] for x, y in r.coords]
            if len(cs) >= 4:
                out.append(cs)
    return out

def topo_features(d, obj):
    tr = d.get("transform"); arcs = []
    for arc in d["arcs"]:
        x = y = 0; pts = []
        for p in arc:
            if tr:
                x += p[0]; y += p[1]; pts.append((x * tr["scale"][0] + tr["translate"][0], y * tr["scale"][1] + tr["translate"][1]))
            else:
                pts.append((p[0], p[1]))
        arcs.append(pts)
    def ring(idx):
        pts = []
        for i in idx:
            a = arcs[i] if i >= 0 else arcs[~i][::-1]
            pts.extend(a if not pts else a[1:])
        return pts
    for g in d["objects"][obj]["geometries"]:
        polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]] if g["type"] == "Polygon" else []
        yield g["properties"]["name"], MultiPolygon([Polygon(ring(p[0]), [ring(h) for h in p[1:]]) for p in polys]).buffer(0)

out = {"K": K, "lat0": 30, "countries": {}, "states": {}, "in_states": {}, "places": {}}
for f in json.load(open(sys.argv[1]))["features"]:
    g = P(shape(f["geometry"]).buffer(0))
    out["countries"][f["properties"]["ADMIN"]] = [rings(g, t) for t in TOL]
for name, g in topo_features(json.load(open(sys.argv[2])), "states"):
    out["states"][name] = [rings(P(g), t) for t in TOL]
for f in json.load(open(sys.argv[3]))["features"]:
    pr = f["properties"]
    if pr.get("admin") == "India" and pr.get("name") in ("Uttar Pradesh", "Karnataka", "Maharashtra"):
        out["in_states"][pr["name"]] = [rings(P(shape(f["geometry"]).buffer(0)), t) for t in TOL]
places = {"Miami": (25.76, -80.19), "Vice Beach": (25.79, -80.13), "Los Angeles": (34.05, -118.24),
          "San Francisco": (37.77, -122.42), "Las Vegas": (36.17, -115.14), "New York": (40.71, -74.01),
          "Bengaluru": (12.97, 77.59), "Mumbai": (19.08, 72.88)}
out["places"] = {k: [round(c) for c in proj(lon, lat)] for k, (lat, lon) in places.items()}
json.dump(out, open(sys.argv[4], "w"), separators=(",", ":"))
print("countries", len(out["countries"]), "states", len(out["states"]), "in_states", list(out["in_states"]))
