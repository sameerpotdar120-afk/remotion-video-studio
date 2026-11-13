"""Plates and vectors for the Ram Setu video (free data only).

    python3 -I tools/build_ramsetu_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). The "south" plate (south India and Sri Lanka)
is graded the house way with AWS terrarium relief and a depth-tinted sea (tools/build_ukweather_maps.py). The close
"setu" plate keeps the real Sentinel-2 sea, because the shoals of Ram Setu only show in the satellite's own water colour
(a DEM depth tint would wipe them out); it gets the house colour grade only. Both are softened very slightly instead of
sharpened, so fine texture can't shimmer when the camera moves (the "ants").
Countries: Natural Earth admin-0, India point-of-view edition (India's official boundary). The Setu line, Pamban island
and the place points are traced by hand on the Sentinel-2 plate; the close-up outlines of Pamban island and Mannar
(pamban_sat, mannar_sat) are traced from the same plate's land mask (they match the picture; Natural Earth is too coarse there).
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ramsetu" / "maps"
# no sharpening anywhere (it makes satellite texture crawl at 4K); a touch of softening instead
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]


def setu_plate(cache: Path, z: int, lo0: float, lo1: float, la0: float, la1: float) -> dict:
    sat, b = uk.stitch(z, lo0, lo1, la0, la1, cache / "eox")
    f = min(1.0, uk.CAP / max(sat.size))
    if f < 1:
        sat = sat.resize((round(sat.width * f), round(sat.height * f)), Image.LANCZOS)
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    land = ((a.mean(axis=2) > 0.2) & (a[..., 2] < a[..., 0] + 0.12)).astype(np.float32)
    out = uk.grade(a, land)
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
    img.save(OUT / "setu_geo.jpg", quality=92)
    return {"bounds": [round(v, 1) for v in b], "w": img.width, "h": img.height}


PLATES = [("south", 9, 7, 75.5, 83.0, 5.5, 12.5)]
SETU = (13, 79.0, 80.05, 8.78, 9.52)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "ramsetu" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name], flush=True)
        gj.write_text(json.dumps(geo, separators=(",", ":")))
    if not only or "setu" in only:
        geo["plates"]["setu"] = setu_plate(cache, *SETU)
        print("setu", geo["plates"]["setu"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {"India": rings(C["India"], 0.01, 0.0004), "SriLanka": rings(C["Sri Lanka"], 0.004, 0.0002)}
    near = box(78.9, 8.9, 80.1, 9.5)
    geo["pamban"] = rings(C["India"].intersection(box(79.12, 9.13, 79.47, 9.33)), 0.0006, 0.000001)
    geo["near"] = {"India": rings(C["India"].intersection(near), 0.0008, 0.000002), "SriLanka": rings(C["Sri Lanka"].intersection(near), 0.0008, 0.000002)}
    allc = unary_union([g.boundary for g in C.values()]).intersection(box(60, -5, 100, 40)).simplify(0.01)
    geo["borders"] = [[[round(mx(x), 0), round(my(y), 0)] for x, y in l.coords] for l in getattr(allc, "geoms", [allc]) if l.length > 0.05]
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
