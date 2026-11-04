"""Plates and vectors for the Canada vs USA time zones video (free data only).

    python3 -I tools/build_tzcanada_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py; close-ups via tools/build_canadalakes_maps.closeup). Countries: Natural Earth, India
point-of-view edition; provinces and states: Natural Earth admin-1; time zones: Natural Earth 10 m time zones (all
public domain). Zone shapes follow Natural Earth's lines; the offsets for winter 2026-27 are set here per province.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_canadalakes_maps as cl  # noqa: E402
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "tzcanada" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("namerica", 5, 4, -172.0, -10.0, -22.0, 83.5),
    ("west", 7, 6, -136.0, -98.0, 40.0, 63.0),
    ("calgary", 9, 8, -117.0, -111.0, 48.6, 53.4),
    ("destin", 9, 8, -89.5, -83.5, 27.4, 33.2),
    ("cascadia", 11, 9, -123.95, -121.55, 47.2, 49.75),
]
CITIES = {
    "Vancouver": (-123.1207, 49.2827), "Seattle": (-122.3321, 47.6062), "Calgary": (-114.0719, 51.0447),
    "Destin": (-86.4958, 30.3935),
}
# the Amtrak Cascades corridor, Pacific Central station to King Street station (approximate, along the coast)
RAIL = [(-123.0977, 49.2735), (-122.95, 49.215), (-122.91, 49.20), (-122.85, 49.09), (-122.75, 49.00), (-122.66, 48.86),
        (-122.4787, 48.7205), (-122.42, 48.60), (-122.3356, 48.4201), (-122.27, 48.20), (-122.2060, 47.9754),
        (-122.30, 47.88), (-122.38, 47.81), (-122.40, 47.70), (-122.3295, 47.5983)]
# offsets: Natural Earth's standard-time zone, then winter 2026-27 (UTC). BC, Alberta, Manitoba and the NWT did not fall
# back on 1 Nov 2026; Yukon (since 2020) and Saskatchewan keep one time all year.
STAY = {"British Columbia": (-8, -7), "Alberta": (-7, -6), "Manitoba": (-6, -5), "Northwest Territories": (-7, -6),
        "Yukon": (-7, -7), "Saskatchewan": (-6, -6)}
WEST = box(-180, 15, -50, 84)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    cl.OUT = OUT
    gj = ROOT / "src" / "tzcanada" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        if name in ("namerica", "west", "calgary", "destin"):
            geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        else:
            geo["plates"][name] = cl.closeup(name, zs, zd, lo0, lo1, la0, la1, cache)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    usa = C["United States of America"].intersection(WEST)
    can = C["Canada"]
    land = unary_union([usa, can])
    geo["countries"] = {"Canada": rings(can, 0.03, 0.02), "United States of America": rings(usa, 0.03, 0.05)}

    sp = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes*.shp"))[0])
    A1 = {}
    for r, s in zip(sp.records(), sp.shapes()):
        if r["admin"] in ("Canada", "United States of America"):
            A1[r["name"]] = shape(s.__geo_interface__).buffer(0).intersection(WEST)
    geo["admin1"] = {n: rings(g, 0.02, 0.01) for n, g in A1.items()}
    geo["provinces"] = {n: rings(A1[n], 0.008, 0.002) for n in [*STAY, "Washington", "Florida"]}

    tz = shapefile.Reader(glob.glob(str(ne / "ne_10m_time_zones*.shp"))[0])
    stay = unary_union([A1[n] for n in STAY])
    zones = []
    for r, s in zip(tz.records(), tz.shapes()):
        z = float(r["zone"])
        if z < -10 or z > -3:
            continue
        g = shape(s.__geo_interface__).buffer(0).intersection(land).difference(stay)
        if not g.is_empty:
            zones.append((z, z, g))
    for n, (z0, z1) in STAY.items():
        zones.append((z0, z1, A1[n]))
    merged = {}
    for z0, z1, g in zones:
        merged.setdefault((z0, z1), []).append(g)
    geo["zones"] = [{"z0": z0, "z1": z1, "rings": rings(unary_union(gs), 0.02, 0.01)} for (z0, z1), gs in sorted(merged.items())]
    # tag spots: a central point of each standard zone inside the lower 48 + Canada's south
    geo["points"] = {k: [round(mx(lon)), round(my(lat))] for k, (lon, lat) in CITIES.items()}
    for n in [*STAY, "Washington", "Florida"]:
        c = A1[n].representative_point()
        geo["points"][n] = [round(mx(c.x)), round(my(c.y))]
    geo["rail"] = [[round(mx(lon), 1), round(my(lat), 1)] for lon, lat in RAIL]
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "zones", [(z["z0"], z["z1"], len(z["rings"])) for z in geo["zones"]])


if __name__ == "__main__":
    main()
