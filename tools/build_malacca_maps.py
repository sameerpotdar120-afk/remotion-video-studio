"""Plates and vectors for the Malacca video (free data only).

    python3 -I tools/build_malacca_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), graded the house way with AWS terrarium relief
and a depth-tinted sea (tools/build_ukweather_maps.py), softened very slightly (no "ants"). The edit turns them into the
documentary black-and-white look. Plates: "ocean" (the Indian Ocean, Djibouti to the South China Sea), "malacca" (the
Andaman Sea, the strait, Sumatra), "nicobar" (Great Nicobar, Indira Point, the Six Degree Channel; the hook).
Countries: Natural Earth admin-0, India point-of-view edition (India's official boundary). The Andaman & Nicobar outline
is India's polygon clipped to the islands' box. Ports and routes are lon/lat points (the routes are drawn, not tracked).
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "malacca" / "maps"
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]
PLATES = [("ocean", 6, 4, 38.0, 125.0, -12.0, 42.0), ("malacca", 8, 6, 88.0, 107.0, -2.0, 16.0), ("nicobar", 10, 8, 92.3, 96.3, 5.2, 9.7)]
PLACES = {  # lon, lat
    "gwadar": (62.33, 25.12), "hambantota": (81.11, 6.12), "kyaukpyu": (93.55, 19.43), "djibouti": (43.15, 11.59),
    "chabahar": (60.62, 25.29), "duqm": (57.72, 19.66), "sabang": (95.32, 5.89), "port_blair": (92.73, 11.62),
    "indira_point": (93.84, 6.75), "rondo": (95.11, 6.07), "singapore": (103.82, 1.30), "six_degree": (94.4, 6.25),
    "havelock": (93.00, 11.97), "hormuz": (56.4, 26.5), "guangzhou": (113.3, 22.6), "beijing": (116.4, 39.9), "delhi": (77.21, 28.61),
    "china_c": (104.0, 33.5), "india_c": (78.5, 22.0),
}
ROUTE = [(56.4, 26.3), (58.5, 23.5), (62.0, 19.0), (68.0, 14.0), (76.0, 8.6), (85.0, 6.3), (92.5, 6.1), (94.4, 6.25),
         (97.0, 5.6), (99.6, 3.8), (101.8, 2.3), (103.6, 1.2), (105.5, 2.6), (109.0, 8.0), (112.0, 14.0), (113.3, 20.5)]
PEARLS = [(43.15, 11.59), (52.0, 13.5), (62.33, 25.12), (68.0, 16.0), (75.0, 7.0), (81.11, 6.12), (87.5, 12.5), (93.55, 19.43),
          (96.5, 12.0), (99.5, 5.0), (104.5, 4.5), (110.0, 14.0), (113.0, 20.0)]
DIAMONDS = [(60.62, 25.29), (57.72, 19.66), (66.0, 12.5), (80.0, 2.5), (92.73, 11.62), (95.32, 5.89)]


def ml(pts) -> list:
    return [[round(mx(x)), round(my(y))] for x, y in pts]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "malacca" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    want = {"India": "India", "China": "China", "Pakistan": "Pakistan", "SriLanka": "Sri Lanka", "Myanmar": "Myanmar",
            "Bangladesh": "Bangladesh", "Iran": "Iran", "Oman": "Oman", "Indonesia": "Indonesia", "Djibouti": "Djibouti",
            "Malaysia": "Malaysia", "Thailand": "Thailand", "Singapore": "Singapore"}
    geo["countries"] = {k: rings(C[v], 0.02, 0.002) for k, v in want.items()}
    an = C["India"].intersection(box(91.5, 6.4, 94.5, 14.0))
    geo["andaman"] = rings(an, 0.003, 0.00005)
    geo["mainland"] = rings(C["India"].difference(box(91.5, 6.4, 94.5, 14.0)), 0.02, 0.002)
    allc = unary_union([g.boundary for g in C.values()]).intersection(box(35, -15, 130, 45)).simplify(0.02)
    geo["borders"] = [ml(l.coords) for l in getattr(allc, "geoms", [allc]) if l.length > 0.05]
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    geo["route"], geo["pearls"], geo["diamonds"] = ml(ROUTE), ml(PEARLS), ml(DIAMONDS)
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "andaman rings", len(geo["andaman"]))


if __name__ == "__main__":
    main()
