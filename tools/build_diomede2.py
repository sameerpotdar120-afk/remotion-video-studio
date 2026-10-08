"""Data for Diomede v2: a wide world plate and country shapes.

    python3 tools/build_diomede2.py <nasa_world.jpg> <ne_dir>

Longitudes west of -130 are unwrapped (+360) so the US lower 48, the Atlantic,
Russia and Alaska lie on one continuous strip (-135..235). This matches the v1
plates (bering/islands), which use the same convention near the date line.
Writes public/diomede/v2/maps/world2.jpg (+ small) and src/diomede2/geo2.json.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
R = 6378137.0
LON0, LON1, LAT0, LAT1 = -135.0, 235.0, 82.0, -12.0
PPD = 24  # output pixels per degree of longitude


def unwrap(lon: float) -> float:
    return lon + 360 if lon < -130 else lon


def merc(lon: float, lat: float) -> list[float]:
    lat = max(-85, min(85, lat))
    return [round(R * math.radians(unwrap(lon)), 1), round(R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)), 1)]


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    if n == 0:
        h = len(pts) // 2
        return simplify(pts[: h + 1], tol)[:-1] + simplify(pts[h:], tol)
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x1 * y0 - y1 * x0) / n
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[: i + 1], tol)[:-1] + simplify(pts[i:], tol)


def country(sf, name, tol, keep=lambda lon, lat: True, min_area=0.0):
    out = []
    for rec, shp in zip(sf.records(), sf.shapes()):
        if rec["ADMIN"] != name:
            continue
        idx = list(shp.parts) + [len(shp.points)]
        for a, b in zip(idx, idx[1:]):
            ring = shp.points[a:b]
            cx = sum(p[0] for p in ring) / len(ring)
            cy = sum(p[1] for p in ring) / len(ring)
            if not keep(cx, cy):
                continue
            # rings crossing the antimeridian are split by Natural Earth already; unwrap per point
            pts = [merc(lo, la) for lo, la in ring]
            area = abs(sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))) / 2
            if area < min_area:
                continue
            s = simplify(pts, tol)
            if len(s) >= 4:
                out.append(s)
    return out


def main() -> None:
    nasa, ne = Path(sys.argv[1]), Path(sys.argv[2])
    # ---- world plate
    src = Image.open(nasa)
    W, H = src.size  # 21600 x 10800, 60 px/deg
    x0, x1 = R * math.radians(LON0), R * math.radians(LON1)  # plate bounds are already in the unwrapped frame
    y1, y0 = merc(0, LAT0)[1], merc(0, LAT1)[1]
    w = int((LON1 - LON0) * PPD)
    h = int(round(w * (y1 - y0) / (x1 - x0)))
    # equirectangular strip at PPD, columns wrapped across the antimeridian
    lat_top, lat_bot = LAT0, LAT1
    rows = (int((90 - lat_top) * 60), int((90 - lat_bot) * 60))
    left = src.crop((int((LON0 + 180) * 60), rows[0], W, rows[1]))
    right = src.crop((0, rows[0], int((LON1 - 180) * 60), rows[1]))
    strip = Image.new("RGB", (left.width + right.width, rows[1] - rows[0]))
    strip.paste(left, (0, 0))
    strip.paste(right, (left.width, 0))
    strip = strip.resize((w, int((lat_top - lat_bot) * PPD)), Image.LANCZOS)
    eq = np.asarray(strip)
    # reproject rows to Mercator
    ys = y1 - (np.arange(h) + 0.5) / h * (y1 - y0)
    lat = np.degrees(2 * np.arctan(np.exp(ys / R)) - np.pi / 2)
    src_rows = np.clip(((lat_top - lat) * PPD).astype(int), 0, eq.shape[0] - 1)
    out = Image.fromarray(eq[src_rows])
    od = ROOT / "public" / "diomede" / "v2" / "maps"
    od.mkdir(parents=True, exist_ok=True)
    out.save(od / "world2.jpg", quality=90)
    out.resize((w // 3, h // 3), Image.LANCZOS).save(od / "world2_small.jpg", quality=88)
    print("world2", w, h)

    # ---- countries
    sf50 = shapefile.Reader(str(ne / "z50" / "ne_50m_admin_0_countries.shp"))
    sf10 = shapefile.Reader(str(ne / "z10" / "ne_10m_admin_0_countries.shp"))
    geo = {
        "plate": {"bounds": [x0, y0, x1, y1], "w": w, "h": h},
        "usa48": country(sf50, "United States of America", 8000, lambda lo, la: -126 < lo < -66 and 24 < la < 50, 1e10),
        "alaska": country(sf10, "United States of America", 1800, lambda lo, la: la > 51 and (lo < -129 or lo > 170), 4e8),
        "russia": country(sf50, "Russia", 9000, min_area=3e10),
        "chukotka": country(sf10, "Russia", 1500, lambda lo, la: la > 60 and (lo > 160 or lo < -160), 3e8),
        "canada": country(sf50, "Canada", 12000, min_area=5e10),
    }
    (ROOT / "src" / "diomede2" / "geo2.json").write_text(json.dumps(geo, separators=(",", ":")))
    for k, v in geo.items():
        if k != "plate":
            print(k, len(v), "rings", sum(len(r) for r in v), "pts")


if __name__ == "__main__":
    main()
