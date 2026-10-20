"""Satellite, atlas and parchment plates and vectors for the Whisky War video (4K 60 fps).

    python3 -I tools/build_whiskywar_maps.py <tile_cache> <ne_dir> [plate names, or "none" for vectors only]

Satellite: EOX Sentinel-2 cloudless 2024, and the 2022 mosaic for the Nares Strait close-ups (CC BY 4.0, credited on
screen), flat Web Mercator plates. The reference's two
cartographic looks are rebuilt from Natural Earth (public domain): a pale grey "atlas" (light land, grey-blue sea, faint
pink borders) and an old parchment map (tan land toned from the satellite relief, slate sea). Borders: Natural Earth's
India point-of-view edition. The Canada–Greenland line in the Nares Strait is drawn as the strait's centre line (the 1973
treaty's line runs down the middle of the strait); it is approximate.
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_hundredyears_maps import parchment  # noqa: E402
import build_thailand_maps as btm  # noqa: E402
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "whiskywar" / "maps"
CAP = 8192
# above about 79°N the 2024 mosaic is clipped white and speckled; the 2022 mosaic shows the strait and the island's rock
EOX24 = btm.EOX
EOX22 = EOX24.replace("s2cloudless-2024_3857", "s2cloudless-2022_3857")
YEAR = {"nares": 2022, "hans": 2022}
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("world", 5, -140.0, 45.0, 15.0, 84.0),
    ("nares", 10, -76.0, -58.0, 78.2, 82.6),
    ("hans", 14, -67.1, -65.8, 80.72, 80.93),
]
HANS = (-66.459, 80.826)
# the middle of the Kennedy Channel / Nares Strait, south to north (approximate)
STRAIT = [(-73.5, 78.3), (-72.0, 78.9), (-70.5, 79.4), (-68.8, 79.9), (-67.6, 80.4), (-66.46, 80.826), (-65.0, 81.25), (-63.6, 81.6), (-62.0, 81.95), (-60.0, 82.25)]
PLACES = {"hans": HANS, "ottawa": (-75.70, 45.42), "copenhagen": (12.57, 55.68), "nuuk": (-51.72, 64.18), "canada_mid": (-100.0, 58.0),
          "denmark_mid": (9.5, 56.0), "greenland_mid": (-41.0, 72.0), "atlantic": (-35.0, 50.0), "ellesmere": (-75.0, 80.0), "nares_mid": (-66.0, 80.6)}


def flat_map(land_rings: list, border_lines: list, b: list, w: int, h: int, land: tuple, sea: tuple, line: tuple, dst: Path) -> None:
    im = Image.new("RGB", (w, h), sea)
    d = ImageDraw.Draw(im)
    P = lambda x, y: ((x - b[0]) / (b[2] - b[0]) * w, (b[3] - y) / (b[3] - b[1]) * h)
    for r in land_rings:
        d.polygon([P(x, y) for x, y in r], fill=land)
    for r in border_lines:
        d.line([P(x, y) for x, y in r], fill=line, width=max(1, w // 2500))
    # a soft paper grain and a gentle relief so it isn't flat colour
    a = np.asarray(im).astype(np.float32)
    g = np.random.default_rng(5).normal(0, 2.2, a.shape[:2])[..., None]
    Image.fromarray(np.clip(a + g, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save(dst, quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "whiskywar" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    clip = box(-150, 10, 55, 84.5)
    land = unary_union([g for g in C.values() if g.intersects(clip)]).intersection(clip)
    for name, z, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        btm.EOX = EOX22 if YEAR.get(name) == 2022 else EOX24  # stitch() formats this module-level template
        im, b = stitch(z, lo0, lo1, la0, la1, cache / ("eox22" if YEAR.get(name) == 2022 else "eox"))
        f = min(1.0, CAP / max(im.size))
        if f < 1:
            im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        if YEAR.get(name) == 2022:
            regrade(OUT / f"{name}_sat.jpg")
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        if name == "world":
            lr = rings(land, 0.02, 0.002)
            borders = []
            for g in C.values():
                if g.intersects(clip):
                    for p in (g.geoms if hasattr(g, "geoms") else [g]):
                        if p.area > 0.5:
                            borders.append([(mx(x), my(y)) for x, y in p.simplify(0.05).exterior.coords])
            flat_map(lr, borders, b, im.width, im.height, (238, 237, 234), (150, 165, 174), (226, 170, 178), OUT / "world_atlas.jpg")
            parchment(OUT / "world_sat.jpg", lr, b, OUT / "world_parch.jpg")
            for k in ("world_atlas", "world_parch"):
                geo["plates"][k] = geo["plates"]["world"]
        print(name, im.size, flush=True)

    can, grl, dnk = C["Canada"], C["Greenland"], C["Denmark"]
    geo["canada"] = rings(can.intersection(clip), 0.02, 0.02)
    geo["greenland"] = rings(grl, 0.02, 0.02)
    geo["denmark"] = rings(dnk, 0.005, 0.005)
    geo["canada_nares"] = rings(can.intersection(box(-82, 76, -55, 83.5)), 0.005, 0.0005)
    geo["greenland_nares"] = rings(grl.intersection(box(-82, 76, -55, 83.5)), 0.005, 0.0005)
    geo["strait"] = [[[round(mx(x), 1), round(my(y), 1)] for x, y in STRAIT]]
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024)


if __name__ == "__main__" and (len(sys.argv) < 2 or sys.argv[1] != "--regrade"):
    main()


def regrade(path: Path) -> None:
    """The far-north mosaic is overexposed: pull the highlights down (snow to light grey, so the relief reads), deepen the
    sea, and calm the magenta/cyan speckle in the clipped areas."""
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255
    lum = a.mean(axis=2, keepdims=True)
    sat = a.max(axis=2, keepdims=True) - a.min(axis=2, keepdims=True)
    # speckle: bright and oddly saturated → pull toward its own luminance
    k = np.clip((lum - 0.6) * 3, 0, 1) * np.clip(sat * 3, 0, 1)
    a = a * (1 - k * 0.85) + lum * k * 0.85
    a = np.power(a, 1.5) * 0.92
    a[..., 2:3] += 0.025
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(path, quality=90)


if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "--regrade":
    for n in sys.argv[2:]:
        regrade(OUT / f"{n}_sat.jpg")
