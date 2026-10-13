"""Satellite plates, route and vectors for the Karl Bushby walk video.

    python3 -I tools/build_bushby_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Borders and the Caspian Sea: Natural Earth
(public domain; India point-of-view edition for countries). The walk goes west from Chile to England across the date
line, so every longitude is "unwrapped": Asia and Europe sit at lon - 360 and the route is one continuous line.
The route is approximate (through the places reported for each stage), not his GPS track.
"""
import json
import math
import sys
from pathlib import Path

import shapefile
from PIL import Image
from shapely.affinity import translate
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "bushby" / "maps"
PLATES = [  # name, zoom, lon0, lon1 (unwrapped), lat0, lat1
    ("americas", 4, -170.0, -30.0, -56.0, 72.0),
    ("eurasia", 4, -370.0, -170.0, 28.0, 75.0),
    ("patagonia", 7, -78.0, -62.0, -56.0, -44.0),
    ("darien", 8, -81.0, -75.0, 6.5, 10.5),
    ("bering", 6, -190.0, -155.0, 60.0, 70.0),
    ("siberia", 5, -280.0, -170.0, 38.0, 72.0),
    ("asia", 6, -320.0, -275.0, 36.0, 50.0),
    ("europe", 6, -366.0, -316.0, 34.0, 57.0),
    ("uk", 8, -362.0, -356.0, 50.4, 54.5),
]
# the walk, west from Punta Arenas (approximate stage points; unwrapped longitudes)
ROUTE = [
    ("punta_arenas", -70.91, -53.16), ("puerto_montt", -72.94, -41.47), ("santiago", -70.65, -33.45), ("antofagasta", -70.40, -23.65),
    ("arica", -70.31, -18.48), ("lima", -77.04, -12.05), ("quito", -78.47, -0.18), ("medellin", -75.57, 6.25), ("turbo", -76.73, 8.09),
    ("darien_in", -77.35, 7.85), ("yaviza", -77.69, 8.16), ("meteti", -78.03, 8.50), ("panama_city", -79.52, 8.98), ("san_jose", -84.09, 9.93),
    ("managua", -86.25, 12.13), ("guatemala", -90.51, 14.63), ("mexico_city", -99.13, 19.43), ("chihuahua", -106.07, 28.63),
    ("phoenix", -112.07, 33.45), ("los_angeles", -118.24, 34.05), ("seattle", -122.33, 47.61), ("whitehorse", -135.06, 60.72),
    ("fairbanks", -147.72, 64.84), ("nome", -165.41, 64.50), ("wales", -168.09, 65.61), ("uelen", -169.81, 66.16),
    ("bilibino", 166.44 - 360, 68.05), ("srednekolymsk", 153.72 - 360, 67.45), ("yakutsk", 129.73 - 360, 62.03),
    ("irkutsk", 104.28 - 360, 52.29), ("ulaanbaatar", 106.92 - 360, 47.92), ("urumqi", 87.62 - 360, 43.83), ("almaty", 76.89 - 360, 43.24),
    ("tashkent", 69.24 - 360, 41.30), ("ashgabat", 58.38 - 360, 37.95), ("aktau", 51.17 - 360, 43.65), ("baku", 49.87 - 360, 40.41),
    ("tbilisi", 44.80 - 360, 41.72), ("erzurum", 41.27 - 360, 39.90), ("ankara", 32.86 - 360, 39.93), ("istanbul", 28.98 - 360, 41.01),
    ("sofia", 23.32 - 360, 42.70), ("bucharest", 26.10 - 360, 44.43), ("budapest", 19.04 - 360, 47.50), ("vienna", 16.37 - 360, 48.21),
    ("brussels", 4.35 - 360, 50.85), ("tournai", 3.39 - 360, 50.61), ("calais", 1.86 - 360, 50.95), ("dover", 1.31 - 360, 51.13),
    ("london", -0.13 - 360, 51.51), ("hull", -0.33 - 360, 53.74),
]
STAGES = {  # where each part of the story starts (index into ROUTE) — used for the draw-on timing in code
    "start": "punta_arenas", "darien": "darien_in", "panama": "meteti", "north": "panama_city", "alaska": "fairbanks", "strait": "wales",
    "russia": "uelen", "asia": "ulaanbaatar", "stall": "ashgabat", "caspian": "aktau", "baku": "baku", "europe": "istanbul",
    "channel": "calais", "dover": "dover", "home": "hull",
}
COUNTRIES = {"russia": "Russia", "iran": "Iran", "panama": "Panama", "chile": "Chile", "kazakhstan": "Kazakhstan", "turkmenistan": "Turkmenistan",
             "uk": "United Kingdom", "usa": "United States of America", "canada": "Canada", "turkey": "Turkey"}


def unwrap(g, east_shift: bool):
    """Shift a geometry's eastern-hemisphere parts by -360° so they join the westward walk."""
    if not east_shift:
        return g
    parts = list(g.geoms) if hasattr(g, "geoms") else [g]
    out = []
    for p in parts:
        c = p.centroid.x
        out.append(translate(p, xoff=-360) if c > -20 else p)
    return unary_union(out)


def plate(name: str, z: int, lo0: float, lo1: float, la0: float, la1: float, cache: Path):
    if lo1 <= -180.0001 or lo0 >= -180:  # entirely on one side of the date line
        shift = 360 if lo1 <= -180 else 0
        im, b = stitch(EOX, z, lo0 + shift, lo1 + shift, la0, la1, cache / "eox", "eox")
        if shift:
            b = [b[0] - 2 * math.pi * 6378137, b[1], b[2] - 2 * math.pi * 6378137, b[3]]
        return im, b
    a, ba = stitch(EOX, z, lo0 + 360, 179.9999, la0, la1, cache / "eox", "eox")
    c, bc = stitch(EOX, z, -180.0, lo1, la0, la1, cache / "eox", "eox")
    im = Image.new("RGB", (a.width + c.width, max(a.height, c.height)))
    im.paste(a, (0, 0))
    im.paste(c, (a.width, 0))
    return im, [ba[0] - 2 * math.pi * 6378137, ba[1], bc[2], bc[3]]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = plate(name, z, lo0, lo1, la0, la1, cache)
        if im.width > 3200:
            im = im.resize((3200, round(im.height * 3200 / im.width)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    for key, admin in COUNTRIES.items():
        g = C[admin]
        g = unary_union([p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 0.05])
        east = key in ("russia", "iran", "kazakhstan", "turkmenistan", "uk", "turkey")
        g = unwrap(g, east)
        geo[key] = rings(g.intersection(box(-380, -60, -20, 80)), 0.03)
    # the Caspian is not in Natural Earth's lakes: it is the water inside the land around it
    land = unary_union([g for g in C.values() if g.intersects(box(45, 35, 56, 48))])
    water = box(46.0, 36.3, 55.2, 47.5).difference(land)
    parts = list(water.geoms) if hasattr(water, "geoms") else [water]
    casp = max(parts, key=lambda q: q.area)
    geo["caspian"] = rings(translate(casp, xoff=-360), 0.02)
    geo["route"] = [[round(mx(lo), 1), round(my(la), 1)] for _, lo, la in ROUTE]
    geo["route_ll"] = [[lo, la] for _, lo, la in ROUTE]
    names = [n for n, _, _ in ROUTE]
    geo["stage"] = {k: names.index(v) for k, v in STAGES.items()}
    geo["places"] = {n: [round(mx(lo), 1), round(my(la), 1)] for n, lo, la in ROUTE}
    (ROOT / "src" / "bushby").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "bushby" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print({k: (len(v) if isinstance(v, (list, dict)) else v) for k, v in geo.items()})


if __name__ == "__main__":
    main()
