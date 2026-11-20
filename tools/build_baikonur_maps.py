"""Plates and vectors for the Baikonur video (free data only), in the reference's look: a natural-colour satellite map.

    python3 -I tools/build_baikonur_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), graded with AWS terrarium relief and a
depth-tinted sea (tools/build_ukweather_maps.py), softened very slightly. Plates: "world" (copied from Malacca), "asia"
(Europe to the Pacific, the whole USSR), "kz" (Kazakhstan), "bk" (the Baikonur lease area), "site" (the launch
complex around Gagarin's Start, for the close-up). Countries: Natural Earth admin-0, India point-of-view edition. The
USSR is the union of its 15 former republics. The lease area is drawn as an ellipse about 90 x 92 km round the
cosmodrome (illustrative; the real boundary is close to this shape, about 6,700 km^2).
"""
import glob
import json
import math
import shutil
import sys
from pathlib import Path

import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "baikonur" / "maps"
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]
PLATES = [("asia", 6, 4, 22.0, 145.0, 0.0, 74.0), ("kz", 8, 6, 44.0, 90.0, 37.0, 57.0), ("bk", 11, 9, 62.2, 64.6, 45.1, 46.7),
          ("site", 14, 12, 63.22, 63.46, 45.84, 46.0)]
PLACES = {  # lon, lat
    "gagarin_start": (63.342, 45.920), "site31": (63.564, 45.996), "baikonur_city": (63.315, 45.620), "lease_c": (63.33, 45.93),
    "moscow": (37.62, 55.75), "plesetsk": (40.57, 62.93), "vostochny": (128.33, 51.88), "astana": (71.45, 51.17),
    "delhi": (77.21, 28.61), "kz_c": (67.5, 48.3), "russia_c": (95.0, 61.0), "ussr_c": (80.0, 58.0), "almaty": (76.89, 43.24),
}
USSR = ["Russia", "Ukraine", "Belarus", "Moldova", "Lithuania", "Latvia", "Estonia", "Georgia", "Armenia", "Azerbaijan",
        "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan"]


def ml(pts) -> list:
    return [[round(mx(x)), round(my(y))] for x, y in pts]


def ellipse(lon, lat, ax_km, ay_km, n=180):
    k = 111.32 * math.cos(math.radians(lat))
    return [(lon + ax_km / k * math.cos(2 * math.pi * i / n), lat + ay_km / 110.57 * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "baikonur" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    if not (OUT / "world_geo.jpg").exists():
        shutil.copy(ROOT / "public" / "malacca" / "maps" / "world_geo.jpg", OUT / "world_geo.jpg")
    geo["plates"]["world"] = json.loads((ROOT / "src" / "malacca" / "geo.json").read_text())["plates"]["world"]
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {"kazakhstan": rings(C["Kazakhstan"], 0.01, 0.002), "russia": rings(C["Russia"], 0.03, 0.02),
                        "india": rings(C["India"], 0.02, 0.002)}
    ussr = unary_union([C[n] for n in USSR])
    geo["ussr"] = rings(ussr, 0.03, 0.02)
    geo["ussr_parts"] = {n: rings(C[n], 0.03, 0.01) for n in USSR}
    allc = unary_union([g.boundary for g in C.values()]).simplify(0.03)
    geo["borders"] = [ml(l.coords) for l in getattr(allc, "geoms", [allc]) if l.length > 0.2]
    geo["lease"] = ml(ellipse(63.33, 45.93, 45.0, 46.0))
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
