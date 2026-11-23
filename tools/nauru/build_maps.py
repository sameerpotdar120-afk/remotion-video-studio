#!/usr/bin/env python3
"""Nauru Short: satellite plates (EOX Sentinel-2 cloudless 2024, CC BY 4.0) and outlines, in Web Mercator metres
(world x = mx(lon), y = -my(lat), y down). India from Natural Earth's India point-of-view edition (official boundary).
Nauru's outline is also given at Delhi's latitude scale, so it can sit over Delhi airport at true size.

  python3 -I tools/nauru/build_maps.py <tile cache dir> <ne_10m_admin_0_countries_ind.geojson>
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image
from shapely.geometry import shape

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fetch_mumbai_tiles import EOX, R, fetch, tile_xy  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/nauru/film/assets/prep"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("world", 4, -180.0, 180.0, -70.0, 75.0),
    ("asiapac", 6, 65.0, 179.9, -25.0, 40.0),
    ("auspac", 6, 135.0, 179.9, -40.0, 8.0),
    ("delhi_region", 11, 76.55, 77.65, 28.15, 29.0),
    ("delhi", 15, 77.02, 77.17, 28.50, 28.62),
    ("nauru_region", 10, 164.9, 169.0, -2.6, 1.5),
    ("nauru", 15, 166.875, 166.985, -0.585, -0.465),
]
PLACES = {"delhi_airport": (77.10, 28.556), "delhi": (77.21, 28.61), "nauru": (166.931, -0.5228), "patna": (85.14, 25.59),
          "saudi": (45.0, 24.0), "usa": (-98.0, 39.0), "australia": (134.0, -25.0), "canberra": (149.13, -35.28),
          "brisbane": (153.03, -27.47), "india": (78.9, 22.5), "japan": (139.7, 35.7), "nz": (174.8, -41.3)}


def mx(lon):
    return R * math.radians(lon)


def my(lat):
    return R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def W(lon, lat):
    return [round(mx(lon), 1), round(-my(lat), 1)]


def stitch(z, lon0, lon1, lat0, lat1, cache):
    fx0, fy0 = tile_xy(lon0, lat1, z); fx1, fy1 = tile_xy(lon1, lat0, z)
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(fx1), int(fy1)
    big = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            big.paste(fetch(EOX.format(z=z, x=tx % 2 ** z, y=ty), cache / f"eox_{z}_{tx % 2 ** z}_{ty}"), ((tx - tx0) * 256, (ty - ty0) * 256))
    return big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))


def rings(geom, tol_deg, f=lambda lo, la: W(lo, la)):
    g = geom.simplify(tol_deg, preserve_topology=True)
    out = []
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type == "Polygon" and p.area > tol_deg ** 2 * 4:
            out.append([f(x, y) for x, y in p.exterior.coords])
    return out


def main():
    cache = Path(sys.argv[1]); cache.mkdir(parents=True, exist_ok=True)
    (OUT / "maps").mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}, "places": {k: W(*v) for k, v in PLACES.items()}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im = stitch(z, lo0, lo1, la0, la1, cache)
        if max(im.size) > 4096:
            f = 4096 / max(im.size); im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / "maps" / f"{name}.jpg", quality=92)
        x0, y0 = W(lo0, la1); x1, y1 = W(lo1, la0)
        geo["plates"][name] = {"rect": [x0, y0, x1, y1], "w": im.width, "h": im.height}
        print(name, im.size, flush=True)
    feats = {f["properties"]["ADMIN"]: shape(f["geometry"]) for f in json.load(open(sys.argv[2]))["features"]}
    geo["india"] = rings(feats["India"], 0.02)
    na = feats["Nauru"]
    geo["nauru"] = rings(na, 0.0005)
    # Nauru's true shape centred on Delhi airport: metres east/north from Nauru's centre, scaled by 1/cos(lat) at Delhi
    c = na.centroid; k = 1 / math.cos(math.radians(28.556)); ax, ay = W(*PLACES["delhi_airport"])
    geo["nauru_on_delhi"] = rings(na, 0.0005, lambda lo, la: [round(ax + math.radians(lo - c.x) * R * math.cos(math.radians(c.y)) * k, 1),
                                                                  round(ay - math.radians(la - c.y) * R * k, 1)])
    (OUT / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print("rings: india", sum(len(r) for r in geo["india"]), "nauru", sum(len(r) for r in geo["nauru"]))


if __name__ == "__main__":
    main()
