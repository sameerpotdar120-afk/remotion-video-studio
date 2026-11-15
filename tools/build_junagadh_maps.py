"""Plates and vectors for the Junagadh video (free data only).

    python3 -I tools/build_junagadh_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), graded the house way with AWS terrarium relief
and a depth-tinted sea (tools/build_ukweather_maps.py), softened very slightly instead of sharpened (no "ants").
"india" is the UK weather video's India plate, copied softened. "west" covers Gujarat, Sindh (Karachi) and Mumbai;
"saurashtra" is the close plate of the old Junagadh state.
Countries: Natural Earth admin-0, India point-of-view edition (India's official boundary); Gujarat from admin-1.
The Junagadh state outline is APPROXIMATE: a hand-drawn inland outline of the former state (Junagadh, Gir Somnath and
the coast from Mangrol to Una) clipped to Natural Earth's coastline. Manavadar (shown on Pakistan's 2020 map) the same.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "junagadh" / "maps"
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]

PLATES = [("west", 9, 7, 64.5, 75.5, 17.5, 26.5), ("saurashtra", 12, 10, 69.3, 71.7, 20.45, 22.1)]
PLACES = {  # lon, lat
    "junagadh": (70.457, 21.522), "somnath": (70.401, 20.888), "veraval": (70.367, 20.907), "keshod": (70.248, 21.303),
    "kutiyana": (69.983, 21.624), "visavadar": (70.749, 21.338), "una": (71.040, 20.822), "talala": (70.533, 21.050),
    "mendarda": (70.440, 21.322), "mangrol": (70.116, 21.122), "manavadar": (70.137, 21.497),
    "karachi": (67.010, 24.861), "mumbai": (72.835, 18.940), "delhi": (77.21, 28.61), "ahmedabad": (72.571, 23.022),
}
# hand-drawn inland edge of the former Junagadh state (approximate), closed over the sea and clipped to the coastline
JUNAGADH = [(69.88, 21.42), (69.95, 21.70), (70.20, 21.78), (70.42, 21.70), (70.62, 21.62), (70.86, 21.48), (71.02, 21.28),
            (71.20, 21.05), (71.30, 20.85), (71.30, 20.40), (69.80, 20.40), (69.80, 21.20)]
MANAVADAR = [(70.02, 21.44), (70.06, 21.58), (70.22, 21.58), (70.26, 21.46), (70.16, 21.40)]


def ml(pts) -> list:
    return [[round(mx(x)), round(my(y))] for x, y in pts]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "junagadh" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    if not only or "india" in only:
        im = Image.open(ROOT / "public" / "ukweather" / "maps" / "india_geo.jpg")
        im.filter(ImageFilter.GaussianBlur(0.6)).save(OUT / "india_geo.jpg", quality=92)
        geo["plates"]["india"] = json.loads((ROOT / "src" / "ukweather" / "geo.json").read_text())["plates"]["india"]
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    a1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))[0])
    guj = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in zip(a1.records(), a1.shapes())
                       if r["adm0_a3"] == "IND" and r["name"] == "Gujarat"])
    jg = Polygon(JUNAGADH).intersection(C["India"])
    mv = Polygon(MANAVADAR).intersection(C["India"])
    geo["countries"] = {"India": rings(C["India"], 0.01, 0.003), "Pakistan": rings(C["Pakistan"], 0.01, 0.003),
                        "Gujarat": rings(guj, 0.003, 0.0005)}
    geo["junagadh"] = rings(jg, 0.002, 0.0005)
    geo["manavadar"] = rings(mv, 0.002, 0.0001)
    allc = unary_union([g.boundary for g in C.values()]).intersection(box(55, 0, 100, 40)).simplify(0.01)
    geo["borders"] = [ml(l.coords) for l in getattr(allc, "geoms", [allc]) if l.length > 0.05]
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    c = jg.representative_point()
    geo["jg_center"] = [round(mx(c.x)), round(my(c.y))]
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "jg area deg2", round(jg.area, 3), "rings", len(geo["junagadh"]))


if __name__ == "__main__":
    main()
