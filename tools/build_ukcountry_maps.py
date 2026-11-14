"""Plates and vectors for the "UK: one country or four?" video (free data only).

    python3 -I tools/build_ukcountry_maps.py <ne_dir>

Plates: the UK weather video's satellite plates (tools/build_ukweather_maps.py: EOX Sentinel-2 cloudless 2024, CC BY 4.0,
with AWS terrarium relief), copied here softened slightly (they were sharpened, which makes fine texture crawl at 4K).
Countries: Natural Earth. England, Scotland, Wales and Northern Ireland are dissolved from the admin-1 units by their
"geonunit"; Ireland and India from admin-0, India point-of-view edition (India's official boundary). The partition lines
are the shared borders: Northern Ireland-Ireland, and India-Pakistan / India-Bangladesh. Places are lon/lat points.
"""
import glob
import json
import math
import sys
from pathlib import Path

import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ukcountry" / "maps"
PLATES = ["world", "atlantic", "isles", "england", "india"]
PLACES = {"london": (-0.128, 51.507), "edinburgh": (-3.188, 55.953), "cardiff": (-3.179, 51.481), "belfast": (-5.930, 54.597),
          "dublin": (-6.260, 53.350), "panama": (-77.6, 8.9), "delhi": (77.21, 28.61)}
# Edward I's castles in Wales (the "Iron Ring" and its partners)
CASTLES = {"Flint": (-3.132, 53.250), "Rhuddlan": (-3.466, 53.290), "Conwy": (-3.826, 53.280), "Beaumaris": (-4.090, 53.265),
           "Caernarfon": (-4.277, 53.139), "Harlech": (-4.109, 52.860), "Aberystwyth": (-4.090, 52.413), "Builth": (-3.400, 52.150)}


def ml(pts) -> list:
    return [[round(mx(x)), round(my(y))] for x, y in pts]


def lines(g) -> list:
    out = []
    for l in getattr(g, "geoms", [g]):
        if hasattr(l, "coords") and l.length > 0.02:
            out.append(ml(l.coords))
    return out


def main() -> None:
    ne = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    src = json.loads((ROOT / "src" / "ukweather" / "geo.json").read_text())
    geo = {"plates": {}}
    for n in PLATES:
        im = Image.open(ROOT / "public" / "ukweather" / "maps" / f"{n}_geo.jpg")
        im.filter(ImageFilter.GaussianBlur(0.6)).save(OUT / f"{n}_geo.jpg", quality=92)
        geo["plates"][n] = src["plates"][n]
        print(n, src["plates"][n])
    a1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))[0])
    parts: dict = {}
    for r, s in zip(a1.records(), a1.shapes()):
        if r["adm0_a3"] == "GBR":
            parts.setdefault(r["geonunit"], []).append(shape(s.__geo_interface__).buffer(0))
    four = {k: unary_union(v) for k, v in parts.items()}
    print("geonunits", list(four))
    a0 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(a0.records(), a0.shapes())}
    geo["countries"] = {
        "England": rings(four["England"], 0.004, 0.0006), "Scotland": rings(four["Scotland"], 0.004, 0.0006),
        "Wales": rings(four["Wales"], 0.003, 0.0004), "NorthernIreland": rings(four["Northern Ireland"], 0.003, 0.0004),
        "Ireland": rings(C["Ireland"], 0.004, 0.0006), "India": rings(C["India"], 0.01, 0.003),
        "UK": rings(unary_union(list(four.values())), 0.004, 0.0006),
    }
    geo["nib"] = lines(four["Northern Ireland"].boundary.intersection(C["Ireland"].buffer(0.02)).simplify(0.002))
    geo["inb"] = lines(C["India"].boundary.intersection(unary_union([C["Pakistan"], C["Bangladesh"]]).buffer(0.05)).simplify(0.01))
    geo["borders"] = lines(unary_union([g.boundary for g in C.values()]).intersection(box(-30, 30, 100, 72)).simplify(0.02))
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    geo["castles"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in CASTLES.items()}
    geo["centroids"] = {k: [round(mx(v.representative_point().x)), round(my(v.representative_point().y))] for k, v in
                        {"England": four["England"], "Scotland": four["Scotland"], "Wales": four["Wales"],
                         "NorthernIreland": four["Northern Ireland"], "Ireland": C["Ireland"], "India": C["India"]}.items()}
    out = ROOT / "src" / "ukcountry" / "geo.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", out.stat().st_size // 1024, "nib", len(geo["nib"]), "inb", len(geo["inb"]))


if __name__ == "__main__":
    main()
