"""Satellite plates and vectors for the Thailand video, sized for the 4K 60 fps render (2160×3840).

    python3 -I tools/build_thailand_maps.py <tile_cache> <ne_dir> [plate names, or "none" for vectors only]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat Web Mercator plates.
Borders: Natural Earth (public domain; India point-of-view edition, so India keeps its official boundary everywhere,
including inside "British India"). The 1890s shapes are built from modern borders and provinces and are approximate:
Siam before its losses = Thailand + Laos + western Cambodia (Battambang, Siem Reap, Sisophon) + the four northern Malay
states; the Chao Phraya core = the central-plain and lower-north provinces; the 1904 spheres split the rest at 100.5°E.
"""
import glob
import json
import math
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import shapefile
from PIL import Image
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, R, fetch, tile_xy  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "thailand" / "maps"
CAP = 8192
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 — about one zoom finer than the 2K videos, for 4K
    ("world", 6, -180.0, 180.0, -72.0, 80.0),
    ("asia", 7, 64.0, 128.0, -12.0, 38.0),
    ("indochina", 8, 90.0, 112.0, 2.0, 26.0),
    ("siam", 9, 96.5, 106.5, 5.0, 21.0),
    ("bangkok", 11, 99.9, 101.3, 13.0, 14.4),
]
PLACES = {
    "delhi": (77.21, 28.61), "calcutta": (88.36, 22.57), "rangoon": (96.16, 16.84), "mandalay": (96.08, 21.97), "bangkok": (100.50, 13.75),
    "paknam": (100.59, 13.60), "hanoi": (105.85, 21.03), "saigon": (106.70, 10.78), "phnompenh": (104.92, 11.56), "vientiane": (102.63, 17.98),
    "luangprabang": (102.13, 19.89), "battambang": (103.20, 13.10), "kualalumpur": (101.69, 3.14), "kedah": (100.50, 6.10), "singapore": (103.82, 1.35),
    "batavia": (106.85, -6.21), "manila": (120.98, 14.60), "dili": (125.57, -8.56), "siam_mid": (100.8, 15.6), "chao_mid": (100.3, 15.2),
    "london": (-0.13, 51.51), "paris": (2.35, 48.86),
}
COUNTRIES = ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Myanmar", "Thailand", "Laos", "Cambodia", "Vietnam", "Malaysia", "Indonesia",
             "Philippines", "East Timor", "Singapore", "Brunei", "China", "Nepal", "Bhutan", "United Kingdom", "France", "Papua New Guinea"]
CORE = ["Bangkok Metropolis", "Nonthaburi", "Pathum Thani", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Phra Nakhon Si Ayutthaya", "Ang Thong",
        "Sing Buri", "Chai Nat", "Lop Buri", "Saraburi", "Suphan Buri", "Nakhon Pathom", "Uthai Thani", "Nakhon Sawan", "Phichit", "Phitsanulok",
        "Kamphaeng Phet", "Sukhothai", "Uttaradit", "Nakhon Nayok"]
CAMBODIA_1907 = ["Batdâmbâng", "Siemréab", "Bântéay Méanchey", "Otdar Mean Chey", "Krong Pailin"]
MALAY_1909 = ["Kedah", "Kelantan", "Terengganu", "Perlis"]


def mx(lon: float) -> float:
    return R * math.radians(lon)


def my(lat: float) -> float:
    return R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def stitch(z: int, lon0: float, lon1: float, lat0: float, lat1: float, cache: Path):
    fx0, fy0 = tile_xy(lon0, lat1, z)
    fx1, fy1 = tile_xy(lon1, lat0, z)
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(min(fx1, 2**z - 1e-9)), int(fy1)
    cache.mkdir(parents=True, exist_ok=True)
    big = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    jobs = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)]

    def get(j):
        tx, ty = j
        return j, fetch(EOX.format(z=z, x=tx % 2**z, y=ty), cache / f"eox_{z}_{tx % 2**z}_{ty}")

    with ThreadPoolExecutor(12) as ex:
        for (tx, ty), im in ex.map(get, jobs):
            big.paste(im.convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
    crop = big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))
    return crop, [mx(lon0), my(lat0), mx(lon1), my(lat1)]


def rings(g, tol, min_area=0.0):
    out = []
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type != "Polygon" or p.area < min_area:
            continue
        s = p.simplify(tol, preserve_topology=True)
        if s.is_empty or len(s.exterior.coords) < 4:
            continue
        out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.exterior.coords])
    return out


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "thailand" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, z, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        im, b = stitch(z, lo0, lo1, la0, la1, cache / "eox")
        f = min(1.0, CAP / max(im.size))
        if f < 1:
            im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size, flush=True)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    st = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    A = {(r["adm0_a3"], r["name"]): shape(s.__geo_interface__).buffer(0) for r, s in zip(st.records(), st.shapes())}
    a1 = lambda a3, names: unary_union([A[(a3, n)] for n in names])
    geo["countries"] = {n: rings(C[n], 0.02, 0.003) for n in COUNTRIES}
    # the colonial shapes around 1900
    geo["british_india"] = rings(unary_union([C["India"], C["Pakistan"], C["Bangladesh"]]), 0.02, 0.02)
    geo["burma"] = rings(C["Myanmar"], 0.02, 0.003)
    geo["french_indochina"] = rings(unary_union([C["Vietnam"], C["Laos"], C["Cambodia"]]), 0.02, 0.003)
    malay4 = a1("MYS", MALAY_1909)
    cam7 = a1("KHM", CAMBODIA_1907)
    siam1890 = unary_union([C["Thailand"], C["Laos"], cam7, malay4])
    geo["siam_1890"] = rings(siam1890, 0.015, 0.003)
    geo["siam_today"] = rings(C["Thailand"], 0.015, 0.003)
    geo["laos"] = rings(C["Laos"], 0.015, 0.003)
    geo["cambodia_1907"] = rings(cam7, 0.01, 0.003)
    geo["cambodia_rest"] = rings(C["Cambodia"].difference(cam7), 0.015, 0.003)
    geo["malay4"] = rings(malay4, 0.01, 0.003)
    geo["malaya_british"] = rings(C["Malaysia"].intersection(box(99, 0.5, 105, 7.5)).difference(malay4), 0.01, 0.003)
    geo["vietnam"] = rings(C["Vietnam"], 0.015, 0.003)
    core = a1("THA", CORE)
    geo["chao_phraya_core"] = rings(core, 0.01, 0.003)
    rest = C["Thailand"].difference(core)
    geo["sphere_west"] = rings(rest.intersection(box(90, 0, 100.5, 25)), 0.01, 0.003)
    geo["sphere_east"] = rings(rest.intersection(box(100.5, 0, 110, 25)), 0.01, 0.003)
    geo["dutch_east_indies"] = rings(C["Indonesia"], 0.03, 0.02)
    geo["philippines"] = rings(C["Philippines"], 0.03, 0.02)
    geo["timor"] = rings(C["East Timor"], 0.01, 0.003)
    # the shared border if one empire had taken Siam: Burma/Malaya against Indochina, through Siam
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    # country outlines in degrees for the cartoon characters (local, unprojected, simplified)
    def deg(g, tol):
        p = max(g.geoms, key=lambda q: q.area) if hasattr(g, "geoms") else g
        return [[round(x, 3), round(y, 3)] for x, y in p.simplify(tol, preserve_topology=True).exterior.coords]
    geo["char"] = {"britain": deg(C["United Kingdom"].intersection(box(-8.7, 49.8, 2, 59)), 0.05),
                   "france": deg(C["France"].intersection(box(-5.5, 41.3, 9.8, 51.2)), 0.05),
                   "siam": deg(siam1890, 0.06)}
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024)


if __name__ == "__main__":
    main()
