"""Relief plates and vectors for the Sikkim video (free data only).

    python3 -I tools/build_sikkim_maps.py <tile_cache> <ne_dir> [plate names]

The reference's map is a dark Esri relief; ours is EOX Sentinel-2 cloudless 2024 (CC BY 4.0) with AWS terrarium relief
(SRTM/NASA, ETOPO1/NOAA), built the UK weather way and darkened in code. Plates: India (frame 0), the north-east around
Sikkim, and the Teesta valley (Siliguri to Rangpo, for the route). A 16-bit heightmap and a texture of the valley feed
the three.js flyovers.
Vectors from Natural Earth's India point-of-view edition (public domain): India (official boundary), Nepal, Bhutan,
China, Bangladesh, Pakistan, the states of Sikkim and West Bengal, and the Teesta (Tista). Stations, towns and the
cities of the opening rail web are hand-placed points.
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from shapely.geometry import LineString, Point, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sikkim" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("india", 7, 6, 56.0, 104.0, -6.0, 46.0),
    ("ne", 10, 9, 86.4, 90.6, 25.4, 29.0),
    ("teesta", 13, 12, 88.25, 88.75, 26.60, 27.40),
]
# the 3D terrain: a heightmap and a texture of the valley from Sevoke up to Rangpo and the hills around it
TERRAIN = ("valley", 14, 13, 88.36, 88.62, 26.86, 27.22)
# the opening rail web: big junctions across India (lon, lat)
CITIES = {"Delhi": (77.21, 28.61), "Mumbai": (72.88, 19.08), "Kolkata": (88.36, 22.57), "Chennai": (80.27, 13.08), "Bengaluru": (77.59, 12.97),
          "Hyderabad": (78.49, 17.39), "Ahmedabad": (72.57, 23.02), "Pune": (73.86, 18.52), "Jaipur": (75.79, 26.91), "Lucknow": (80.95, 26.85),
          "Patna": (85.14, 25.59), "Bhopal": (77.41, 23.26), "Nagpur": (79.09, 21.15), "Guwahati": (91.74, 26.14), "Bhubaneswar": (85.82, 20.30),
          "Thiruvananthapuram": (76.94, 8.52), "Amritsar": (74.87, 31.63), "Jammu": (74.86, 32.73), "Varanasi": (82.97, 25.32), "Raipur": (81.63, 21.25),
          "Visakhapatnam": (83.22, 17.69), "Madurai": (78.12, 9.93), "Kanpur": (80.33, 26.45), "Jodhpur": (73.02, 26.24), "Surat": (72.83, 21.17),
          "Ranchi": (85.31, 23.34), "Dehradun": (78.03, 30.32), "Agartala": (91.28, 23.83), "Dimapur": (93.73, 25.91), "Siliguri": (88.40, 26.73),
          "Mangaluru": (74.86, 12.91), "Vijayawada": (80.65, 16.51), "Indore": (75.86, 22.72), "Gorakhpur": (83.37, 26.76), "Dibrugarh": (94.91, 27.47)}
# the line's five stations (Wikipedia, NFR) and the places the VO names
STATIONS = {"Sevoke": (88.4686, 26.8917), "Riyang": (88.4480, 26.9560), "Teesta Bazar": (88.4366, 27.0503), "Melli": (88.4486, 27.0875),
            "Rangpo": (88.5050, 27.1650)}
TOWNS = {"Siliguri": (88.3953, 26.7271), "New Jalpaiguri": (88.4422, 26.6833), "Gangtok": (88.6138, 27.3389), "Rangpo": (88.5311, 27.1773)}
# NH10 up the valley: Siliguri, Sevoke, along the Teesta to Rangpo and on to Gangtok (hand-placed)
NH10 = [(88.3953, 26.7271), (88.4686, 26.8917), (88.4620, 26.9300), (88.4460, 26.9800), (88.4300, 27.0200), (88.4366, 27.0503), (88.4486, 27.0875),
        (88.4800, 27.1300), (88.5311, 27.1773), (88.5700, 27.2400), (88.6138, 27.3389)]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "sikkim" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    if not only or "terrain" in only:
        name, zs, zd, lo0, lo1, la0, la1 = TERRAIN
        sat, b = uk.stitch(zs, lo0, lo1, la0, la1, cache / "eox")
        sat = sat.convert("RGB")
        sat.thumbnail((4096, 4096), Image.LANCZOS)
        sat.save(OUT / "valley_tex.jpg", quality=90)
        h = uk.dem(zd, lo0, lo1, la0, la1, cache).astype(np.float32)
        hi = Image.fromarray(h, mode="F").resize((1024, round(1024 * sat.height / sat.width)), Image.BICUBIC)
        a = np.asarray(hi)
        lo, top = float(a.min()), float(a.max())
        q = np.clip((a - lo) / (top - lo) * 65535, 0, 65535).astype(np.uint32)
        rg = np.zeros(q.shape + (3,), np.uint8)
        rg[..., 0], rg[..., 1] = q >> 8, q & 255  # 16-bit height packed in red (high) and green (low): browsers read PNGs as 8-bit
        Image.fromarray(rg).save(OUT / "valley_hrg.png")
        mid = math.radians((la0 + la1) / 2)
        geo["terrain"] = {"bounds": [mx(lo0), my(la0), mx(lo1), my(la1)], "ll": [lo0, la0, lo1, la1], "hmin": lo, "hmax": top,
                          "w_m": (lo1 - lo0) * 111320 * math.cos(mid), "h_m": (la1 - la0) * 111320, "size": [hi.width, hi.height]}
        print("terrain", sat.size, hi.size, round(lo), round(top), flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    sf1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    S = {(r["admin"], r["name"]): shape(s.__geo_interface__).buffer(0) for r, s in zip(sf1.records(), sf1.shapes()) if r["admin"] == "India"}
    india = C["India"]
    geo["countries"] = {"India": rings(india, 0.03, 0.02)}
    for n in ("Nepal", "Bhutan", "China", "Bangladesh", "Pakistan"):
        geo["countries"][n] = rings(C[n].difference(india), 0.01, 0.002)
    geo["states"] = {"Sikkim": rings(S[("India", "Sikkim")], 0.001, 0.0001), "WestBengal": rings(S[("India", "West Bengal")], 0.003, 0.0005)}
    rv = shapefile.Reader(glob.glob(str(ne / "ne_10m_rivers_lake_centerlines" / "*.shp"))[0])
    names = [f[0] for f in rv.fields[1:]]
    tista = [s for r, s in zip(rv.records(), rv.shapes()) if r[names.index("name")] == "Tista"][0]
    geo["teesta"] = [[round(mx(x)), round(my(y))] for x, y in tista.points]
    # the route: the Teesta's line between Sevoke and Rangpo, snapped through the stations in order
    river = LineString(tista.points)
    st = list(STATIONS.values())
    d0, d1 = river.project(Point(st[-1])), river.project(Point(st[0]))
    seg = [river.interpolate(d0 + (d1 - d0) * k / 120) for k in range(121)][::-1]
    geo["route"] = [[round(mx(p.x)), round(my(p.y))] for p in seg]
    geo["route_ll"] = [[round(p.x, 5), round(p.y, 5)] for p in seg]
    geo["stations"] = {n: [round(mx(x)), round(my(y))] for n, (x, y) in STATIONS.items()}
    geo["towns"] = {n: [round(mx(x)), round(my(y))] for n, (x, y) in TOWNS.items()}
    geo["cities"] = {n: [round(mx(x)), round(my(y))] for n, (x, y) in CITIES.items()}
    geo["nh10"] = [[round(mx(x)), round(my(y))] for x, y in NH10]
    # India's official boundary, point-tested (a dataset drawn on de facto lines would fail these)
    tests = {"Gilgit": (74.31, 35.92), "Muzaffarabad": (73.47, 34.37), "AksaiChin": (79.3, 35.2), "Shaksgam": (76.6, 36.0), "Tawang": (91.86, 27.59)}
    bad = [n for n, p in tests.items() if not india.contains(Point(*p))]
    if bad:
        raise SystemExit(f"India boundary fails point tests: {bad}")
    if not S[("India", "Sikkim")].contains(Point(88.61, 27.33)):
        raise SystemExit("Sikkim polygon misses Gangtok")
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "route pts", len(geo["route"]))


if __name__ == "__main__":
    main()
