"""Geometry for the North Sentinel video, in Web Mercator metres.

    python3 tools/build_sentinel_geo.py      # writes src/sentinel/geo.json

Inputs (public/sentinel/geo/): OSM coastlines (ODbL), Natural Earth India
(public domain), comparison shapes in true metres (OSM-derived).
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEO = ROOT / "public" / "sentinel" / "geo"
R = 6378137.0


def merc(lon: float, lat: float) -> list[float]:
    return [round(R * math.radians(lon), 1), round(R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)), 1)]


def simplify(pts: list[list[float]], tol: float) -> list[list[float]]:
    """Ramer-Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x1 * y0 - y1 * x0) / n
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[: i + 1], tol)[:-1] + simplify(pts[i:], tol)


def rings(path: Path, tol: float, min_pts: int = 4) -> list[list[list[float]]]:
    out = []
    for f in json.load(open(path))["features"]:
        g = f["geometry"]
        parts = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for p in parts:
            pts = [merc(lo, la) for lo, la in p[0]]
            h = len(pts) // 2  # closed ring: simplify two halves so the end points differ
            r = simplify(pts[: h + 1], tol)[:-1] + simplify(pts[h:], tol)
            if len(r) >= min_pts:
                out.append(r)
    return out


def main() -> None:
    sent = rings(GEO / "geo_sentinel.json", 12)[0]
    xs, ys = [p[0] for p in sent], [p[1] for p in sent]
    # area-weighted centroid
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(sent, sent[1:] + sent[:1]):
        c = x0 * y1 - x1 * y0
        a += c
        cx += (x0 + x1) * c
        cy += (y0 + y1) * c
    center = [round(cx / (3 * a), 1), round(cy / (3 * a), 1)]
    lat = math.degrees(2 * math.atan(math.exp(center[1] / R)) - math.pi / 2)
    k = 1 / math.cos(math.radians(lat))  # true metres -> Mercator metres here
    comp = {f["properties"]["name"]: f["geometry"]["coordinates"][0] for f in json.load(open(GEO / "comparison_shapes_meters.json"))["features"]}
    mp = [[round(x * k, 1), round(y * k, 1)] for x, y in comp["Manhattan Island"]]
    manhattan = simplify(mp[: len(mp) // 2 + 1], 15)[:-1] + simplify(mp[len(mp) // 2:], 15)
    pb = json.load(open(GEO / "geo_places.json"))["features"][0]["geometry"]["coordinates"]
    out = {
        "sentinel": sent,
        "center": center,
        "bounds": [min(xs), min(ys), max(xs), max(ys)],
        "lat": round(lat, 4),
        "mercScale": round(k, 5),
        "southAndaman": rings(GEO / "geo_south_andaman.json", 60),
        "andaman": rings(GEO / "geo_andaman.json", 120),
        "india": rings(GEO / "geo_india.json", 2500, 6),
        "manhattan": manhattan,  # Mercator metres relative to its own centroid (true scale at the island's latitude)
        "portBlair": merc(*pb),
    }
    (ROOT / "src" / "sentinel" / "geo.json").write_text(json.dumps(out, separators=(",", ":")))
    print("sentinel pts", len(sent), "center", center, "lat", round(lat, 3), "india rings", len(out["india"]),
          "india pts", sum(len(r) for r in out["india"]), "manhattan pts", len(manhattan))
    dx = (out["portBlair"][0] - center[0]) / k
    dy = (out["portBlair"][1] - center[1]) / k
    print("centre -> Port Blair straight line %.1f km" % (math.hypot(dx, dy) / 1000))


if __name__ == "__main__":
    main()
