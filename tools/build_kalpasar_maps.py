"""Satellite plates and vectors for the Kalpasar video (4K).

    python3 -I tools/build_kalpasar_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Borders: Natural Earth (public domain;
India point-of-view edition for India). The Mahi follows Natural Earth's centreline; the Sabarmati and Dhadhar,
which Natural Earth leaves out, are traced from their known courses, so all river lines are approximate.
The dam line follows the reported alignment only roughly (across the gulf, about 60 km with its land dykes).
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from PIL import Image
from shapely.geometry import LineString, Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "kalpasar" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 (sized for the 4K render)
    ("world", 5, -180.0, 179.9999, -66.0, 80.0),
    ("india", 7, 62.0, 100.0, 4.0, 38.0),
    ("gujarat", 9, 67.8, 75.2, 19.4, 25.0),
    ("gulf", 11, 71.5, 73.5, 20.7, 22.7),
]
PLACES = {"bhavnagar": (72.15, 21.76), "bharuch": (72.98, 21.70), "surat": (72.83, 21.17), "khambhat": (72.62, 22.31),
          "ahmedabad": (72.58, 23.02), "gulf": (72.45, 21.6)}
SAURASHTRA = Polygon([(68.8, 20.5), (71.3, 20.6), (72.35, 21.2), (72.35, 22.45), (71.7, 22.95), (70.4, 22.95), (69.0, 22.6)])
RIVERS_EXTRA = {  # traced, approximate (lon, lat), source → mouth
    "sabarmati": [(73.05, 24.05), (72.9, 23.6), (72.68, 23.25), (72.58, 23.02), (72.5, 22.75), (72.43, 22.5), (72.38, 22.3)],
    "dhadhar": [(73.55, 22.45), (73.3, 22.3), (73.05, 22.2), (72.85, 22.1), (72.72, 22.03)],
}
ROUTE_OLD = [(72.15, 21.76), (72.2, 22.05), (72.2, 22.3), (72.4, 22.55), (72.62, 22.45), (72.95, 22.32), (73.15, 22.2), (73.05, 21.95), (72.98, 21.70), (72.95, 21.45), (72.83, 21.17)]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        for side in (0, 1):
            if im.size[side] > 6400:
                f = 6400 / im.size[side]
                im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    india = C["India"]
    geo["india"] = rings(unary_union([p for p in india.geoms if p.area > 0.05]), 0.02)
    st = shapefile.Reader(glob.glob(str(ne / "extra" / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    guj = [shape(s.__geo_interface__) for r, s in zip(st.records(), st.shapes()) if r["adm0_a3"] == "IND" and r["name"] == "Gujarat"][0]
    guj = guj.intersection(india)
    geo["gujarat"] = rings(guj, 0.004)
    geo["saurashtra"] = rings(guj.intersection(SAURASHTRA), 0.004)
    # the gulf's water (north part becomes the lake, behind the dam line)
    land = unary_union([g for g in C.values() if g.intersects(box(70, 20, 75, 24))])
    water = box(71.9, 21.0, 73.2, 22.45).difference(land)
    parts = list(water.geoms) if hasattr(water, "geoms") else [water]
    gulf = max(parts, key=lambda q: q.area)
    # dam: across the gulf at the latitude where it is about 30 km of sea, plus land dykes either side (≈ 60 km in all)
    lat = 21.86
    cross = LineString([(71.9, lat), (73.2, lat)]).intersection(gulf)
    seg = max((list(cross.geoms) if hasattr(cross, "geoms") else [cross]), key=lambda g: g.length)
    (w0, _), (e0, _) = seg.coords[0], seg.coords[-1]
    dam = [(w0 - 0.13, lat - 0.04), (w0, lat), (e0, lat + 0.01), (e0 + 0.1, lat + 0.03)]
    geo["dam_ll"] = [[round(a, 4), round(b, 4)] for a, b in dam]
    geo["dam"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in dam]
    lake = gulf.intersection(box(71.9, lat, 73.2, 22.45))
    lp = list(lake.geoms) if hasattr(lake, "geoms") else [lake]
    geo["lake"] = rings(max(lp, key=lambda q: q.area), 0.002)
    geo["sea_south"] = rings(gulf.intersection(box(71.9, 21.0, 73.2, lat)), 0.002)
    rv = shapefile.Reader(glob.glob(str(ne / "extra" / "ne_10m_rivers_lake_centerlines" / "*.shp"))[0])
    mahi = [s for r, s in zip(rv.records(), rv.shapes()) if r["name"] == "Mahi"][0]
    pts = [tuple(p) for p in mahi.points]
    if pts[0][0] < pts[-1][0]:  # make it run source → mouth (west end last)
        pts = pts[::-1]
    pts = pts + [(72.62, 22.22)]
    rivers = {"mahi": pts, **RIVERS_EXTRA}
    geo["rivers"] = {k: [[round(mx(a), 1), round(my(b), 1)] for a, b in v] for k, v in rivers.items()}
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["route_old"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in ROUTE_OLD]
    geo["route_new"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in [(72.15, 21.76), dam[0], dam[1], dam[2], dam[3], (72.98, 21.70), (72.95, 21.45), (72.83, 21.17)]]
    print("dam", geo["dam_ll"], "sea width km", round((e0 - w0) * 111.32 * 0.9283, 1))
    (ROOT / "src" / "kalpasar").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "kalpasar" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))


if __name__ == "__main__":
    main()
