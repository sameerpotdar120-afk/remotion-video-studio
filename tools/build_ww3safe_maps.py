"""Satellite plates, a globe texture and vectors for the World War 3 safe-countries video.

    python3 -I tools/build_ww3safe_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat (no relief), Web Mercator plates.
The globe texture is the same imagery reprojected to equirectangular (the poles past 85° are filled from the edge).
Borders: Natural Earth (public domain; India point-of-view edition). Places are point locations; the South Pacific
nuclear-free zone is drawn as an approximate area.
"""
import glob
import io
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from shapely.geometry import box, shape
from shapely.ops import unary_union
from shapely import affinity

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, R, fetch, tile_xy  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ww3safe" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 (lon1 may pass 180: the Pacific plates wrap)
    ("world", 4, -180.0, 180.0, -62.0, 80.0),
    ("pac", 4, 95.0, 265.0, -66.0, 40.0),
    ("natl", 6, -110.0, 45.0, 12.0, 72.0),
    ("oceania", 6, 110.0, 192.0, -50.0, -6.0),
    ("fiji", 9, 176.4, 181.6, -19.6, -15.4),
    ("nz", 8, 165.5, 179.5, -47.8, -33.8),
    ("iceland", 8, -25.5, -12.5, 62.9, 67.0),
]
PLACES = {
    "suva": (178.44, -18.14), "nadi": (177.44, -17.78), "brisbane": (153.03, -27.47), "auckland": (174.76, -36.85),
    "wellington": (174.78, -41.29), "reykjavik": (-21.94, 64.15), "fiji": (178.1, -17.8), "nz": (172.5, -41.5),
    "iceland": (-18.6, 64.9), "australia": (134.0, -25.5),
}
GROUPS = {
    "nuclear": ["United States of America", "Russia", "China", "France", "United Kingdom", "India", "Pakistan", "Israel", "North Korea"],
    "hit": ["France", "Germany", "Poland", "Ukraine", "Belarus", "Spain", "Italy", "United Kingdom", "Finland", "Norway", "Sweden",
            "Romania", "Czechia", "Austria", "Netherlands", "Belgium", "Portugal", "Hungary", "Greece", "Turkey"],
    "americas": ["United States of America", "Canada", "Mexico", "Brazil", "Argentina", "Colombia", "Venezuela", "Peru", "Chile", "Bolivia", "Cuba"],
    "safe": ["Fiji", "New Zealand", "Iceland"],
    "teaser": ["Australia", "China", "Brazil", "Canada", "Saudi Arabia", "India", "Indonesia", "South Africa", "Argentina", "Norway",
               "Japan", "Chile", "Switzerland", "Ireland", "Portugal", "Egypt", "Kazakhstan", "Mongolia", "Algeria", "Sweden", "Finland",
               "Austria", "Thailand", "Iran", "Nigeria"],
    "other": ["Australia", "Papua New Guinea", "Indonesia"],
}
# South Pacific Nuclear Free Zone (Treaty of Rarotonga), drawn approximately as a soft area
SPNFZ = [(115, -60), (115, -30), (130, -10), (141, 0), (163, 0), (163, 4), (171, 4), (171, 0), (200, 0), (200, -5), (229, -5), (229, -60)]


def mx(lon: float) -> float:
    return R * math.radians(lon)


def my(lat: float) -> float:
    return R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def stitch_wrap(z: int, lon0: float, lon1: float, lat0: float, lat1: float, cache: Path):
    fx0, fy0 = tile_xy(lon0, lat1, z)
    fx1, fy1 = (lon1 + 180) / 360 * 2**z, tile_xy(0, lat0, z)[1]
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(math.ceil(fx1) - 1), int(fy1)
    n = 2**z
    cache.mkdir(parents=True, exist_ok=True)
    big = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            x = tx % n
            big.paste(fetch(EOX.format(z=z, x=x, y=ty), cache / f"eox_{z}_{x}_{ty}"), ((tx - tx0) * 256, (ty - ty0) * 256))
    crop = big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))
    return crop, [mx(lon0), my(lat0), mx(lon1), my(lat1)]


def globe_texture(cache: Path) -> None:
    """Equirectangular 4096×2048 from the z4 Mercator world (lat ±85)."""
    im, _ = stitch_wrap(4, -180, 180, -85, 85, cache)
    a = np.asarray(im)
    H, W = 2048, 4096
    lat = 90 - (np.arange(H) + 0.5) / H * 180
    la = np.clip(lat, -84.99, 84.99)
    yy = (1 - np.log(np.tan(np.pi / 4 + np.radians(la) / 2)) / math.log(math.tan(math.pi / 4 + math.radians(85) / 2))) / 2 * (a.shape[0] - 1)
    xx = (np.arange(W) + 0.5) / W * (a.shape[1] - 1)
    out = a[np.round(yy).astype(int)][:, np.round(xx).astype(int)]
    # past 85°: blend towards ice white
    for i, l in enumerate(lat):
        if abs(l) > 82:
            k = min(1, (abs(l) - 82) / 8)
            out[i] = (out[i] * (1 - k) + np.array([236, 240, 244]) * k).astype(np.uint8)
    Image.fromarray(out).save(OUT / "globe_eq.jpg", quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]) / "eox", Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch_wrap(z, lo0, lo1, la0, la1, cache)
        for side in (0, 1):
            if im.size[side] > 4096:
                f = 4096 / im.size[side]
                im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    globe_texture(cache)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    names = sorted({n for g in GROUPS.values() for n in g})
    missing = [n for n in names if n not in C]
    if missing:
        raise SystemExit(f"missing in Natural Earth: {missing}")

    def parts(g, min_area):
        ps = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > min_area]
        return ps

    def merc_rings(g, tol, shift=False, min_area=0.02):
        out = []
        for p in parts(g, min_area):
            if shift and p.bounds[2] < 0:
                p = affinity.translate(p, 360)
            s = p.simplify(tol, preserve_topology=True)
            out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.exterior.coords])
        return out

    def deg_rings(g, tol, min_area=0.05):
        return [[[round(x, 2), round(y, 2)] for x, y in p.simplify(tol, preserve_topology=True).exterior.coords] for p in parts(g, min_area)]

    clip = box(-180, -60, 180, 84)
    geo["countries"] = {}
    geo["deg"] = {}
    for n in names:
        g = C[n].intersection(clip)
        small = n in ("Fiji", "Switzerland", "Israel", "Iceland", "New Zealand")
        geo["countries"][n] = merc_rings(g, 0.002 if n == "Fiji" else (0.01 if small else 0.04), shift=n in ("Fiji", "New Zealand"),
                                         min_area=0.0004 if n == "Fiji" else (0.003 if small else 0.05))
        geo["deg"][n] = deg_rings(g, 0.05 if small else 0.15, min_area=0.001 if small else 0.2)
    geo["groups"] = GROUPS
    geo["places"] = {k: [round(mx(a if a > 0 or k not in ("fiji",) else a + 360), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    geo["spnfz"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in SPNFZ]
    (ROOT / "src" / "ww3safe").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "ww3safe" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print("countries", len(names), "geo.json kB", len(json.dumps(geo)) // 1024)


if __name__ == "__main__":
    main()
