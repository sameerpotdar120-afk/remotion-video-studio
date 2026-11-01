"""Plates and vectors for the Canada lake names video (free data only).

    python3 -I tools/build_canadalakes_maps.py <tile_cache> <ne_dir> [plate names]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen) with AWS terrarium relief, graded the house way
(tools/build_ukweather_maps.py). Countries and provinces: Natural Earth (India point-of-view edition for countries;
public domain). Big lakes (Athabasca, Mistassini, Nipigon) from Natural Earth's 10 m lakes. The small named lakes
(Lake Louise, Another Lake, And Another Lake, Stupid Lake, Big Ass Lake, Pekwachnamaykoskwaskwaypinwanik Lake) are not
in Natural Earth, so their outlines are traced here from the Sentinel-2 plate itself: the connected patch of dark-blue
water pixels under the lake's published coordinates.
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

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "canadalakes" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1 (close-ups tall enough to fill a 9:16 frame)
    ("namerica", 5, 4, -172.0, -10.0, 14.0, 83.5),
    ("canada", 6, 5, -142.0, -50.0, 41.0, 72.0),
    ("shield", 13, 9, -93.78, -93.30, 53.93, 54.13),
    ("athabasca", 8, 7, -114.0, -104.0, 55.5, 62.0),
    ("louise", 15, 12, -116.26, -116.17, 51.392, 51.437),
    ("bc", 16, 12, -120.256, -120.218, 49.878, 49.902),
    ("stupid", 14, 10, -93.52, -93.38, 55.635, 55.692),
    ("novascotia", 7, 6, -68.0, -58.0, 40.5, 49.5),
    ("bigass", 16, 12, -62.945, -62.921, 44.917, 44.935),
]
NAMED = {  # name: (lon, lat, plate) for lakes traced from the satellite
    "Lake Louise": (-116.2195, 51.4160, "louise"),
    "Another Lake": (-120.2379, 49.8886, "bc"),
    "And Another Lake": (-120.2322, 49.8917, "bc"),
    "Stupid Lake": (-93.44778, 55.66361, "stupid"),
    "Big Ass Lake": (-62.93278, 44.92556, "bigass"),
    "Pekwachnamaykoskwaskwaypinwanik Lake": (-93.53361, 54.02833, "shield"),
}
TOL = {"And Another Lake": 0.035, "Stupid Lake": 0.03, "Pekwachnamaykoskwaskwaypinwanik Lake": 0.03}
CLIP = {"Pekwachnamaykoskwaskwaypinwanik Lake": (-93.61, -93.45, 54.012, 54.05)}
NE_LAKES = {"Lake Athabasca": "Lake Athabasca", "Lake Mistassini": "Lake Mistassini", "Lake Nipigon": "Lake Nipigon"}
PROVINCES = ["British Columbia", "Manitoba", "Nova Scotia", "Saskatchewan", "Alberta", "Ontario", "Québec"]


def closeup(name, zs, zd, lo0, lo1, la0, la1, cache):
    """Close-up plates: the satellite as it is (no DEM water tint, which paints blocky squares on dark lakes), with a soft
    multi-directional relief and the house grade."""
    from build_thailand_maps import stitch  # noqa: PLC0415
    sat, b = stitch(zs, lo0, lo1, la0, la1, cache / "eox")
    W, H = sat.size
    h = uk.dem(zd, lo0, lo1, la0, la1, cache)
    h = np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC))
    px_m = (lo1 - lo0) * 111320 * math.cos(math.radians((la0 + la1) / 2)) / W
    hs = uk.hillshade(ndimage.gaussian_filter(np.maximum(h, 0), 2), px_m, exag=1.5)
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    out = uk.soft_light(a, (0.4 + 0.6 * hs)[..., None] * 0.9 + 0.05)
    out = uk.grade(out, np.ones(out.shape[:2], np.float32))
    from PIL import ImageFilter  # noqa: PLC0415
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=50, threshold=2)).save(OUT / f"{name}_geo.jpg", quality=90)
    return {"bounds": [round(v, 1) for v in b], "w": W, "h": H}


def trace(name: str, plate: dict, zs: int, box4: tuple, lon: float, lat: float, cache: Path) -> list:
    """The lake under (lon, lat), traced on the raw Sentinel-2 mosaic of the plate (same pixel grid): water is dark and
    not green (b >= g), or glacial turquoise; the biggest water patch touching a 60 px disc round the point wins."""
    from build_thailand_maps import stitch  # noqa: PLC0415
    from skimage import measure  # noqa: PLC0415
    sat, _ = stitch(zs, *box4, cache / "eox")
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    H, W = a.shape[:2]
    b0, b1, b2, b3 = plate["bounds"]
    px = (mx(lon) - b0) / (b2 - b0) * W
    py = (b3 - my(lat)) / (b3 - b1) * H
    a = ndimage.uniform_filter(a, size=(3, 3, 1))
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    lum = a.mean(axis=2)
    if TOL.get(name):
        # dark lakes in dark forest: grow from the seed over pixels close to the water's own colour
        from skimage.segmentation import flood  # noqa: PLC0415
        g = ndimage.gaussian_filter(lum, 1.2)
        sy, sx = int(round(py)), int(round(px))
        w = g[max(0, sy - 3): sy + 4, max(0, sx - 3): sx + 4]
        iy, ix = np.unravel_index(np.argmin(w), w.shape)
        seed = (max(0, sy - 3) + iy, max(0, sx - 3) + ix)
        m = flood(g, seed, tolerance=TOL[name])
        if name in CLIP:  # rivers join this lake to its neighbours: keep it to its own box
            lo0, lo1, la0, la1 = CLIP[name]
            xs0, xs1 = (mx(lo0) - b0) / (b2 - b0) * W, (mx(lo1) - b0) / (b2 - b0) * W
            ys0, ys1 = (b3 - my(la1)) / (b3 - b1) * H, (b3 - my(la0)) / (b3 - b1) * H
            yy, xx = np.mgrid[0:H, 0:W]
            m &= (xx > xs0) & (xx < xs1) & (yy > ys0) & (yy < ys1)
            m = ndimage.binary_opening(m, iterations=3)
        m = ndimage.binary_fill_holes(ndimage.binary_opening(m, iterations=1))
        lab, _ = ndimage.label(m)
        m = lab == lab[seed]
    else:
        water = ((lum < 0.24) & (b_ >= g_ - 0.006)) | ((g_ > r_ + 0.08) & (b_ > r_ + 0.08) & (lum > 0.3))
        water = ndimage.binary_opening(ndimage.binary_closing(water, iterations=2), iterations=2)
        lab, _ = ndimage.label(water)
        yy, xx = np.mgrid[0:H, 0:W]
        disc = (yy - py) ** 2 + (xx - px) ** 2 < 60 ** 2
        ids = np.unique(lab[disc & (lab > 0)])
        if not len(ids):
            raise SystemExit(f"no water near {lon},{lat}")
        sizes = ndimage.sum(np.ones_like(lab), lab, ids)
        m = ndimage.binary_fill_holes(lab == ids[int(np.argmax(sizes))])
    m = ndimage.gaussian_filter(m.astype(np.float32), 1.5)
    c = max(measure.find_contours(m, 0.5), key=len)
    pts = [(b0 + (x / W) * (b2 - b0), b3 - (y / H) * (b3 - b1)) for y, x in c]
    poly = Polygon(pts).buffer(0).simplify((b2 - b0) / W * 1.0)
    return [[[round(x, 1), round(y, 1)] for x, y in poly.exterior.coords]]


def lake_dots(plate: dict, img: Path, canada, n: int = 5000) -> list:
    """Points on water inside Canada on the overview plate: the '+2,000,000 lakes' light-up."""
    a = np.asarray(Image.open(img).convert("RGB")).astype(np.float32) / 255
    H, W = a.shape[:2]
    b0, b1, b2, b3 = plate["bounds"]
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    water = (b_ > r_ + 0.03) & (a.mean(axis=2) < 0.42)
    ys, xs = np.nonzero(water)
    rng = np.random.default_rng(4)
    idx = rng.permutation(len(xs))
    from shapely.prepared import prep  # noqa: PLC0415
    from shapely.ops import transform  # noqa: PLC0415
    cm = prep(transform(lambda x, y: (mx(x), my(y)), canada.simplify(0.05)))
    from shapely.geometry import Point  # noqa: PLC0415
    out = []
    for i in idx:
        x = b0 + (xs[i] + 0.5) / W * (b2 - b0)
        y = b3 - (ys[i] + 0.5) / H * (b3 - b1)
        if y > my(70.5):  # skip the Arctic sea channels
            continue
        if cm.contains(Point(x, y)):
            out.append([round(x), round(y)])
            if len(out) >= n:
                break
    return out


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "canadalakes" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        fn = uk.build if name in ("namerica", "canada") else closeup
        geo["plates"][name] = fn(name, zs, zd, lo0, lo1, la0, la1, cache, **({"sat_water": True} if fn is uk.build else {}))
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {
        "Canada": rings(C["Canada"], 0.03, 0.02),
        "United States of America": rings(C["United States of America"].intersection(box(-170, 15, -50, 72)), 0.03, 0.05),
        "Greenland": rings(C["Greenland"], 0.03, 0.05),
    }
    sp = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes*.shp"))[0])
    P = {r["name"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sp.records(), sp.shapes()) if r["admin"] == "Canada"}
    geo["provinces"] = {n: rings(P[n], 0.01, 0.002) for n in PROVINCES}
    sl = shapefile.Reader(glob.glob(str(ne / "ne_10m_lakes*.shp"))[0])
    L = {r["name"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sl.records(), sl.shapes()) if r["name"] in NE_LAKES.values()}
    geo["lakes"] = {k: rings(L[v], 0.005) for k, v in NE_LAKES.items()}
    for k, (lon, lat, pl) in NAMED.items():
        if pl in geo["plates"]:
            pz = {n: (zs, (lo0, lo1, la0, la1)) for n, zs, zd, lo0, lo1, la0, la1 in PLATES}[pl]
            geo["lakes"][k] = trace(k, geo["plates"][pl], pz[0], pz[1], lon, lat, cache)
    geo["points"] = {k: [round(mx(lon)), round(my(lat))] for k, (lon, lat, _) in NAMED.items()}
    for k, v in NE_LAKES.items():
        c = L[v].representative_point()
        geo["points"][k] = [round(mx(c.x)), round(my(c.y))]
    geo["points"].update({n: [round(mx(P[n].representative_point().x)), round(my(P[n].representative_point().y))] for n in PROVINCES})
    if "canada" in geo["plates"]:
        geo["dots"] = lake_dots(geo["plates"]["canada"], OUT / "canada_geo.jpg", C["Canada"])
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024, "lakes", {k: len(v[0]) if v else 0 for k, v in geo["lakes"].items()}, "dots", len(geo.get("dots", [])))


if __name__ == "__main__":
    main()
