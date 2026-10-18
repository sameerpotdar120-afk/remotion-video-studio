"""Satellite plates and vectors for the time zones video, sized for the 4K 60 fps render (2160×3840).

    python3 -I tools/build_timezones_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat Web Mercator plates.
Borders: Natural Earth (public domain; India point-of-view edition). Time zones: Natural Earth 10m time zones (public
domain; the zone lines are approximate and follow its 2012-era data, which the video only uses for shapes).
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
OUT = ROOT / "public" / "timezones" / "maps"
CAP = 8192
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 — about one zoom finer than the 2K videos, for 4K
    ("world", 6, -180.0, 180.0, -72.0, 80.0),
    ("europe", 8, -15.0, 25.0, 35.0, 60.0),
    ("india", 8, 66.0, 99.0, 5.0, 38.0),
    ("china", 7, 70.0, 137.0, 15.0, 55.0),
    ("ne_india", 9, 88.0, 98.0, 22.0, 30.0),
    ("nepal", 9, 79.5, 89.0, 26.0, 31.0),
    ("gujarat", 9, 67.5, 75.0, 20.0, 25.5),
    ("mirzapur_mid", 11, 81.6, 83.6, 24.4, 25.9),
    ("mirzapur", 14, 82.47, 82.67, 25.07, 25.23),
    ("kashgar", 11, 75.5, 76.5, 39.15, 39.8),
]
PLACES = {
    "greenwich": (-0.0015, 51.4779), "london": (-0.1276, 51.5072), "paris": (2.3522, 48.8566),
    "mirzapur": (82.5650, 25.1460), "mirzapur_tower": (82.5711, 25.1495), "vindhyachal": (82.5077, 25.1663), "prayagraj": (81.8463, 25.4358), "varanasi": (83.0107, 25.3176),
    "kashgar": (75.9898, 39.4704), "beijing": (116.4074, 39.9042), "urumqi": (87.6168, 43.8256),
    "dong": (97.0167, 28.1900), "itanagar": (93.6053, 27.0844), "guhar_moti": (68.0300, 23.7100), "ahmedabad": (72.5714, 23.0225),
    "dibrugarh": (94.9120, 27.4728), "guwahati": (91.7362, 26.1445), "kathmandu": (85.3240, 27.7172), "gaurishankar": (86.3361, 27.9536),
    "delhi": (77.2090, 28.6139), "india_mid": (80.0, 22.5), "china_mid": (103.0, 35.0), "moscow": (37.6173, 55.7558), "washington": (-77.0369, 38.9072),
}
# France's 12 time zones (13 with its Antarctic claim, not shown): one place for each
FRANCE_ZONES = [
    ("Tahiti", -149.43, -17.65, -10), ("Marquesas", -140.07, -8.91, -9.5), ("Gambier", -134.97, -23.12, -9), ("Clipperton", -109.22, 10.30, -8),
    ("Guadeloupe", -61.55, 16.25, -4), ("French Guiana", -53.13, 3.93, -3), ("Paris", 2.35, 48.86, 1), ("Mayotte", 45.17, -12.83, 3),
    ("Réunion", 55.54, -21.12, 4), ("Kerguelen", 70.22, -49.35, 5), ("New Caledonia", 166.46, -22.27, 11), ("Wallis and Futuna", -176.20, -13.77, 12),
]
WORLD_NAMES = ["India", "China", "Nepal", "France", "Russia", "United States of America", "United Kingdom", "Pakistan", "Bangladesh", "Bhutan", "Myanmar"]


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
    gj = ROOT / "src" / "timezones" / "geo.json"
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
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    # every border, thin, for the "lines bend to the borders" beat; named countries in more detail for fills
    geo["borders"] = [r for g in C.values() for r in rings(g, 0.08, 0.3)]
    geo["countries"] = {n: rings(C[n], 0.03, 0.02) for n in WORLD_NAMES}
    geo["countries"]["France_metro"] = rings(C["France"].intersection(box(-6, 41, 10, 52)), 0.02, 0.05)
    st = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    S = {r["name"]: shape(s.__geo_interface__) for r, s in zip(st.records(), st.shapes()) if r["adm0_a3"] == "IND"}
    geo["states"] = {n: rings(S[n], 0.01, 0.002) for n in ["Assam", "Arunachal Pradesh", "Gujarat", "Uttar Pradesh"] if n in S}

    # time zones: one merged shape per offset; an offset's rings carry the zone value
    tz = shapefile.Reader(glob.glob(str(ne / "ne_10m_time_zones" / "*.shp"))[0])
    by = {}
    for r, s in zip(tz.records(), tz.shapes()):
        by.setdefault(float(r["zone"]), []).append(shape(s.__geo_interface__).buffer(0))
    # India in its official boundary (India POV) is one zone, UTC+5:30: Natural Earth's zone shapes follow the de facto
    # lines (PoK inside UTC+5, Aksai Chin inside UTC+8), so India is cut out of every other zone and added whole to +5:30
    ind = C["India"].buffer(0)
    zs = {z: unary_union(gs) for z, gs in by.items()}
    zs = {z: (g.union(ind) if z == 5.5 else g.difference(ind)) for z, g in zs.items()}
    geo["zones"] = [{"zone": z, "rings": rings(g, 0.05, 0.01)} for z, g in sorted(zs.items())]
    # China's single zone: Beijing time over the whole country (the country shape, India POV borders)
    geo["china_zone"] = rings(C["China"], 0.03, 0.05)
    # the two-zone proposal for India (CSIR-NPL, 2018): IST-II for the east of 89°52'E
    geo["india_split"] = {"west": rings(C["India"].intersection(box(60, 0, 89.8667, 40)), 0.03, 0.02),
                          "east": rings(C["India"].intersection(box(89.8667, 0, 100, 40)), 0.02, 0.01)}

    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    geo["france_zones"] = [{"name": n, "at": [round(mx(a), 1), round(my(b), 1)], "zone": z} for n, a, b, z in FRANCE_ZONES]
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024, "zones", len(geo["zones"]))


if __name__ == "__main__":
    main()
