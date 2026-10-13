"""Satellite plates and country shapes for the Twin countries video.

    python3 -I tools/build_twins_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Country shapes: Natural Earth
(public domain; India point-of-view edition).
"""
import json
import sys
from pathlib import Path

import shapefile
from PIL import Image
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "twins" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 (zooms sized for the 4K render)
    ("world", 5, -180.0, 179.9999, -66.0, 80.0),
    ("eurasia", 6, -12.0, 122.0, -2.0, 62.0),
    ("seasia", 8, 86.0, 112.0, 3.0, 30.0),
    ("wafrica", 9, -2.0, 5.5, 5.0, 13.2),
    ("italy", 8, 4.0, 21.0, 35.0, 48.0),
    ("vietnam", 8, 99.0, 113.0, 7.0, 24.5),
    ("norway", 7, -2.0, 36.0, 55.0, 72.5),
    ("chile", 7, -82.0, -60.0, -57.5, -15.5),
]
COUNTRIES = {"thailand": "Thailand", "myanmar": "Myanmar", "benin": "Benin", "togo": "Togo", "italy": "Italy",
             "vietnam": "Vietnam", "norway": "Norway", "chile": "Chile"}
CLIP = {"norway": box(-5, 55, 40, 72), "chile": box(-80, -60, -60, -15)}  # mainland only (no Svalbard, no Easter Island)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        if im.width > 6400:
            im = im.resize((6400, round(im.height * 6400 / im.width)), Image.LANCZOS)
        if im.height > 6400:
            im = im.resize((round(im.width * 6400 / im.height), 6400), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    geo["c"] = {}
    for key, admin in COUNTRIES.items():
        g = C[admin]
        if key in CLIP:
            g = g.intersection(CLIP[key])
        parts = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 0.02]
        g = unary_union(parts)
        main = max(parts, key=lambda p: p.area)
        c = main.centroid
        geo["c"][key] = {"rings": rings(g, 0.01), "main": rings(main, 0.01), "centre": [round(mx(c.x), 1), round(my(c.y), 1)],
                         "bbox": [round(mx(main.bounds[0]), 1), round(my(main.bounds[1]), 1), round(mx(main.bounds[2]), 1), round(my(main.bounds[3]), 1)]}
        print(key, len(parts), "parts")
    # Sicily, for the football
    it = C["Italy"]
    sic = max([p for p in it.geoms if p.centroid.y < 38.5], key=lambda p: p.area)
    geo["sicily"] = [round(mx(sic.centroid.x), 1), round(my(sic.centroid.y), 1)]
    (ROOT / "src" / "twins").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "twins" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))


if __name__ == "__main__":
    main()
