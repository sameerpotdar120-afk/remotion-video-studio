"""Satellite plates, the 3D Everest block, the globe texture and vectors for the closest-to-space video (4K 60 fps).

    python3 -I tools/build_closestspace_maps.py <tile_cache> <ne_dir> [plate names, or "none" for vectors only]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat Web Mercator plates, one zoom level finer
than a 1080p cut would need. Elevation: AWS Terrain Tiles, "terrarium" encoding (open data; sources include SRTM/NASA;
credited on screen). Borders: Natural Earth's India point-of-view edition (public domain), so India has its official
boundary and China's fill never takes Aksai Chin or Arunachal Pradesh.
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image
from shapely.geometry import LineString, box, shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402
from fetch_mumbai_tiles import stitch as stitch_tpl  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "closestspace" / "maps"
CAP = 8192
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("world", 5, -180.0, 179.99, -62.0, 80.0),
    ("asia", 7, 70.0, 105.0, 18.0, 42.0),
    ("hima", 12, 86.3, 87.6, 27.6, 28.4),
    ("africa", 7, 25.0, 50.0, -12.0, 12.0),
    ("samerica", 6, -92.0, -30.0, -45.0, 15.0),
    ("andes", 10, -80.5, -77.5, -3.0, 0.5),
]
EV3D = (86.72, 87.13, 27.84, 28.13)  # the 3D fly-over block round Everest (about 40 × 32 km)
PLACES = {
    "everest": (86.925, 27.988), "chimborazo": (-78.817, -1.469), "kathmandu": (85.32, 27.71), "quito": (-78.47, -0.18),
    "kilimanjaro": (37.355, -3.066), "denali": (-151.0, 63.07), "aconcagua": (-70.01, -32.65), "mont_blanc": (6.865, 45.833),
    "elbrus": (42.44, 43.35), "kosciuszko": (148.26, -36.46), "k2": (76.51, 35.88), "nairobi": (36.82, -1.29),
}


def dem(z: int, lo0: float, lo1: float, la0: float, la1: float, cache: Path):
    im, b = stitch_tpl(TERRARIUM, z, lo0, lo1, la0, la1, cache / "terrarium", "terr")
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768, b


def globe_texture(cache: Path) -> None:
    """Equirectangular 8192×4096 from the z5 Mercator world (lat ±85), ice past 85°."""
    wm, _ = stitch(5, -180.0, 179.999, -85.0, 85.0, cache / "eox")
    wa = np.asarray(wm)
    H, W = 4096, 8192
    lat = 90 - (np.arange(H) + 0.5) * 180 / H
    lat_c = np.clip(lat, -85, 85)
    ys = (1 - np.log(np.tan(np.radians(lat_c)) + 1 / np.cos(np.radians(lat_c))) / math.pi) / 2 * wa.shape[0]
    xs = (np.arange(W) + 0.5) / W * wa.shape[1]
    eq = wa[np.clip(ys.astype(int), 0, wa.shape[0] - 1)][:, np.clip(xs.astype(int), 0, wa.shape[1] - 1)].copy()
    for i, l in enumerate(lat):
        if abs(l) > 82:
            k = min(1, (abs(l) - 82) / 6)
            eq[i] = (eq[i] * (1 - k) + np.array([232, 238, 242]) * k).astype(np.uint8)
    Image.fromarray(eq).save(OUT / "globe_eq.jpg", quality=88)
    print("globe", eq.shape, flush=True)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "closestspace" / "geo.json"
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
    if not only or "globe" in only:
        globe_texture(cache)
    if not only or "ev3d" in only:
        lo0, lo1, la0, la1 = EV3D
        tex, tb = stitch(14, lo0, lo1, la0, la1, cache / "eox")
        if tex.width > 4096:
            tex = tex.resize((4096, round(tex.height * 4096 / tex.width)), Image.LANCZOS)
        tex.save(OUT / "ev3d_sat.jpg", quality=92)
        h, hb = dem(13, lo0, lo1, la0, la1, cache)
        h = np.clip(h, 0, 9000)
        hs = Image.fromarray(h.astype(np.float32), mode="F").resize((640, round(640 * h.shape[0] / h.shape[1])), Image.BILINEAR)
        small = np.asarray(hs)
        geo["ev3d"] = {"lonlat": [lo0, lo1, la0, la1], "w": int(small.shape[1]), "h": int(small.shape[0]), "max": round(float(small.max())), "min": round(float(small.min()))}
        (OUT / "ev3d_dem.json").write_text(json.dumps([int(v) for v in small.ravel()], separators=(",", ":")))
        print("ev3d", tex.size, small.shape, "height range", small.min(), small.max(), flush=True)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    nepal, china, india, ecuador = C["Nepal"], C["China"], C["India"], C["Ecuador"]
    # point tests: India's official boundary (Aksai Chin, Shaksgam, Gilgit, Muzaffarabad, Tawang inside India, not China)
    from shapely.geometry import Point
    for nm, p in {"aksai_chin": (79.3, 35.2), "shaksgam": (76.6, 36.1), "gilgit": (74.3, 35.9), "muzaffarabad": (73.47, 34.37), "tawang": (91.86, 27.59)}.items():
        assert india.contains(Point(*p)) and not china.contains(Point(*p)), nm
    geo["nepal"] = rings(nepal, 0.003, 0.0)
    geo["china"] = rings(china.intersection(box(70, 15, 140, 56)), 0.01, 0.05)
    geo["india"] = rings(india, 0.01, 0.05)
    geo["ecuador"] = rings(ecuador.intersection(box(-82, -6, -74, 2)), 0.003, 0.01)
    # the Nepal–China border, the line through Everest's summit
    shared = nepal.boundary.intersection(china.buffer(0.003))
    segs = [shared] if shared.geom_type == "LineString" else [g for g in getattr(shared, "geoms", []) if g.geom_type == "LineString"]
    geo["border_np_cn"] = [[[round(mx(x), 1), round(my(y), 1)] for x, y in s.simplify(0.002).coords] for s in segs if s.length > 0.01]
    geo["equator"] = [[[round(mx(x), 1), round(my(0.0), 1)] for x in np.linspace(-180, 180, 73)]]
    # lon/lat rings for painting the globe texture
    def deg(g, tol, min_area=0.0):
        out = []
        for p in (g.geoms if hasattr(g, "geoms") else [g]):
            if p.geom_type == "Polygon" and p.area >= min_area:
                out.append([[round(x, 3), round(y, 3)] for x, y in p.simplify(tol, preserve_topology=True).exterior.coords])
        return out
    geo["deg"] = {"Nepal": deg(nepal, 0.01), "China": deg(china, 0.03, 0.05), "Ecuador": deg(ecuador.intersection(box(-82, -6, -74, 2)), 0.01, 0.01), "India": deg(india, 0.03, 0.05)}
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024, "border segs", len(geo["border_np_cn"]))


if __name__ == "__main__":
    main()
