"""Dark "Midnight" plates and vectors for the Madeira video (free data only).

    python3 -I tools/build_madeira_maps.py <tile_cache> <ne_dir> [plate names]

The reference's look (a natural satellite map, the ocean deep navy with faint seabed relief, darker as the camera
dives in), rebuilt with the West Indies "Midnight" grade: EOX Sentinel-2 cloudless 2024 (CC BY 4.0) and AWS terrarium
relief (SRTM/NASA, ETOPO1/NOAA). Plates: the Atlantic from Europe to Brazil (the dive, the voyage, the sugar trade),
the archipelago (Madeira, Porto Santo, the Desertas) and Madeira close. Outlines from Natural Earth's India
point-of-view edition (public domain); the archipelago's islands from its 10 m land polygons.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from scipy import ndimage
from shapely.geometry import Polygon, box, shape
from skimage import measure

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_westindies_maps as wi  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "madeira" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("atlantic", 6, 4, -62.0, 32.0, -28.0, 62.0),
    ("archipelago", 11, 9, -17.6, -15.9, 32.25, 33.25),
    ("madeira", 13, 11, -17.55, -16.35, 32.4, 33.1),
]
COUNTRIES = ["Portugal", "Brazil", "India"]
ARCH = box(-17.6, 32.2, -15.9, 33.3)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    wi.OUT = OUT
    gj = ROOT / "src" / "madeira" / "geo.json"
    gj.parent.mkdir(parents=True, exist_ok=True)
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = wi.build(name, zs, zd, lo0, lo1, la0, la1, cache)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    # mainland Portugal only (the Azores and Madeira are separate)
    geo["countries"] = {"Portugal": rings(C["Portugal"].intersection(box(-10, 36.8, -6, 42.3)), 0.005, 0.001),
                        "Brazil": rings(C["Brazil"], 0.03, 0.05), "India": rings(C["India"], 0.02, 0.01)}
    # the islands' coastlines traced from the terrain (Natural Earth's Madeira is only ~50 points): the 1 m contour of
    # the z10 terrarium DEM over the archipelago, simplified to about 40 m
    lo0, lo1, la0, la1 = -17.6, -15.9, 32.25, 33.25
    h = wi.uk.dem(10, lo0, lo1, la0, la1, cache)
    H, W = h.shape
    x0, y0, x1, y1 = mx(lo0), my(la0), mx(lo1), my(la1)
    polys = []
    for cnt in measure.find_contours(ndimage.gaussian_filter(h, 0.8), 1.0):
        pts = [(x0 + (c / (W - 1)) * (x1 - x0), y1 - (r / (H - 1)) * (y1 - y0)) for r, c in cnt]
        if len(pts) > 20:
            g = Polygon(pts).buffer(0)
            if g.area > 2e5:
                polys.append(g.simplify(40))
    polys.sort(key=lambda g: -g.area)
    ring = lambda g: [[[round(x, 1), round(y, 1)] for x, y in (gg.exterior.coords)] for gg in (g.geoms if hasattr(g, "geoms") else [g])]
    geo["islands"] = {"Madeira": ring(polys[0]), "PortoSanto": ring(polys[1]), "Desertas": [r for g in polys[2:] for r in ring(g)]}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, [len(r) for r in geo["islands"]["Madeira"]], len(geo["islands"]["Desertas"]))


if __name__ == "__main__":
    main()
