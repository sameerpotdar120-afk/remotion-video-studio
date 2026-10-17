"""Satellite plates, an Andes mask and vectors for the Chile video, sized for the 2K 60 fps render (1440×2560).

    python3 -I tools/build_chile_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat Web Mercator plates.
The Andes band is a mask of land above 1,500 m (700 m in the far south) from AWS Terrain Tiles (terrarium; SRTM and other open data).
Borders: Natural Earth (public domain; India point-of-view edition). Historical shapes (early Chile in 1818, the
colonial split, Bolivia's lost coast) are cut from modern borders and regions with boxes: approximate.
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from scipy import ndimage
from shapely.geometry import Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, R, fetch, tile_xy  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "chile" / "maps"
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 — one zoom finer than the 1080p videos, for 2K
    ("world", 5, -180.0, 180.0, -60.0, 75.0),
    ("samerica", 6, -95.0, -28.0, -58.0, 16.0),
    ("chile_n", 8, -77.0, -64.0, -34.0, -16.0),
    ("chile_s", 7, -80.0, -62.0, -56.5, -32.0),
    ("valley", 10, -72.4, -69.6, -34.6, -32.4),
    ("india", 6, 62.0, 100.0, 4.0, 38.0),
    ("titicaca", 10, -70.3, -68.3, -17.0, -15.0),
]
PLACES = {
    "santiago": (-70.65, -33.45), "kashmir": (75.0, 35.5), "kanyakumari": (77.54, 8.08), "delhi": (77.21, 28.61), "agra": (78.01, 27.18),
    "arica": (-70.31, -18.48), "antofagasta": (-70.40, -23.65), "capehorn": (-67.27, -55.98), "puntaarenas": (-70.91, -53.16),
    "titicaca": (-69.35, -15.85), "lapaz": (-68.15, -16.50), "lima": (-77.04, -12.05), "valdivia": (-73.24, -39.81), "chile_mid": (-71.0, -30.5),
}
SA = ["Chile", "Argentina", "Peru", "Bolivia", "Brazil", "Paraguay", "Uruguay", "Colombia", "Venezuela", "Ecuador", "Guyana", "Suriname", "Panama"]


def mx(lon: float) -> float:
    return R * math.radians(lon)


def my(lat: float) -> float:
    return R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def stitch(tpl: str, z: int, lon0: float, lon1: float, lat0: float, lat1: float, cache: Path, tag: str, mode="RGB"):
    fx0, fy0 = tile_xy(lon0, lat1, z)
    fx1, fy1 = tile_xy(lon1, lat0, z)
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(fx1), int(fy1)
    cache.mkdir(parents=True, exist_ok=True)
    big = Image.new(mode, ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            im = fetch(tpl.format(z=z, x=tx % 2**z, y=ty), cache / f"{tag}_{z}_{tx % 2**z}_{ty}")
            big.paste(im.convert(mode), ((tx - tx0) * 256, (ty - ty0) * 256))
    crop = big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))
    return crop, [mx(lon0), my(lat0), mx(lon1), my(lat1)]


def rings(g, tol, min_area=0.02):
    out = []
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type != "Polygon" or p.area < min_area:
            continue
        s = p.simplify(tol, preserve_topology=True)
        out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.exterior.coords])
    return out


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        for side in (0, 1):
            if im.size[side] > 4096:
                f = 4096 / im.size[side]
                im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size, flush=True)

    # the Andes: land above 1,500 m (700 m in the far south) on the South America plate's grid, as a soft white mask (tinted in code)
    t, b = stitch(TERRARIUM, 6, -95.0, -28.0, -58.0, 16.0, cache / "terrarium", "terr")
    a = np.asarray(t).astype(np.float32)
    h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    # the southern Andes are lower: the threshold falls from 1,500 m (north of 33°S) to 700 m (south of 44°S)
    rows = np.linspace(0, 1, h.shape[0])
    y0, y1 = my(16.0), my(-58.0)
    lat = np.degrees(2 * np.arctan(np.exp((y0 + (y1 - y0) * rows) / R)) - np.pi / 2)
    thr = np.interp(-lat, [33, 44], [1500, 700])[:, None]
    m = ndimage.gaussian_filter((h > thr).astype(np.float32), 1.2)
    m = ndimage.binary_opening(m > 0.5, iterations=2)
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(np.ones_like(h), lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes > 400)[0])
    w, hh = geo["plates"]["samerica"]["w"], geo["plates"]["samerica"]["h"]
    alpha = Image.fromarray((ndimage.gaussian_filter(keep.astype(np.float32), 1.0) * 255).astype(np.uint8)).resize((w, hh), Image.BILINEAR)
    Image.merge("LA", (Image.new("L", (w, hh), 255), alpha)).save(OUT / "andes_mask.png")
    print("andes mask", (w, hh), flush=True)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    st = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    CL = {r["name"]: shape(s.__geo_interface__) for r, s in zip(st.records(), st.shapes()) if r["adm0_a3"] == "CHL"}
    geo["countries"] = {n: rings(C[n], 0.01 if n == "Chile" else 0.03, 0.003 if n == "Chile" else 0.05) for n in SA}
    geo["countries"]["India"] = rings(C["India"], 0.03, 0.05)
    chile = C["Chile"].intersection(box(-80, -56.5, -66, -17))
    main = max(chile.geoms, key=lambda p: p.area) if hasattr(chile, "geoms") else chile
    geo["chile_main"] = rings(main, 0.01, 0.003)
    # Chile's own shape in degrees, for laying it over India (moved and rotated in code, true-size by latitude)
    s = main.simplify(0.03, preserve_topology=True)
    geo["chile_deg"] = [[round(x, 3), round(y, 3)] for x, y in s.exterior.coords]
    # early Chile (1818): roughly the central part, Copiapó to the Biobío (approximate)
    geo["chile_1818"] = rings(C["Chile"].intersection(box(-75, -37.6, -68, -26.5)), 0.01, 0.01)
    # the north Chile took in the War of the Pacific: Bolivia's coast (Antofagasta) and Peru's south (Tarapacá, Arica)
    geo["bolivia_coast"] = rings(CL["Antofagasta"], 0.01, 0.01)
    geo["peru_south"] = rings(unary_union([CL["Tarapacá"], CL["Arica y Parinacota"]]), 0.01, 0.01)
    # the colonial split around 1600, approximate: Portugal east of the Tordesillas line (46°37'W), Spain the rest,
    # the Mapuche south of the Biobío and Patagonia outside both
    land = unary_union([C[n] for n in SA])
    south = box(-80, -56.5, -60, -37.6)
    geo["portugal"] = rings(land.intersection(box(-46.6, -35, -28, 6)), 0.05, 0.2)
    geo["spain"] = rings(land.difference(box(-46.6, -35, -28, 6)).difference(south), 0.05, 0.2)
    geo["mapuche"] = rings(land.intersection(south), 0.05, 0.2)
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    (ROOT / "src" / "chile").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "chile" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", len(json.dumps(geo)) // 1024)


if __name__ == "__main__":
    main()
