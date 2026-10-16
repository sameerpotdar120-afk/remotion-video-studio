"""Satellite plates and vectors for the Siliguri Corridor (Chicken's Neck) video, 1080p.

    python3 -I tools/build_siliguri_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), with a hillshade from AWS Terrain Tiles
(terrarium; SRTM and other open data, credited) multiplied in, so the relief reads like a 3D terrain map.
Borders, states and rivers: Natural Earth (public domain; India point-of-view edition for India and its neighbours).
The corridor and Chumbi Valley shapes are cut from those borders with a box (approximate); places are point
locations; routes are drawn in code from waypoints (approximate).
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
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "siliguri" / "maps"
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1, relief strength
    ("asia", 6, 60.0, 125.0, -10.0, 45.0, 0.55),
    ("east", 8, 84.0, 98.0, 18.5, 30.0, 0.75),
    ("corridor", 11, 87.8, 89.4, 25.9, 27.6, 0.8),
    ("malacca", 8, 91.0, 105.0, -1.0, 14.0, 0.55),
]
PLACES = {
    "siliguri": (88.43, 26.72), "kolkata": (88.36, 22.57), "guwahati": (91.75, 26.14), "agartala": (91.28, 23.83),
    "chattogram": (91.80, 22.33), "mongla": (89.60, 22.47), "dhaka": (90.41, 23.81), "yadong": (88.93, 27.48),
    "bamuni": (89.98, 26.03), "kishanganj": (87.95, 26.10), "chopra": (88.30, 26.37),
    "teesta": (89.13, 26.17), "sittwe": (92.90, 20.15), "paletwa": (92.87, 21.30), "zorinpui": (92.67, 22.55), "aizawl": (92.72, 23.73),
    "portblair": (92.73, 11.62), "indirapoint": (93.84, 6.75), "phillips": (103.80, 1.18), "neck": (88.25, 26.62),
    "kathmandu": (85.32, 27.71), "thimphu": (89.64, 27.47), "beijing": (116.4, 39.9),
}
NE_STATES = ["Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"]


def relief(z: int, lon0: float, lon1: float, lat0: float, lat1: float, size: tuple[int, int], cache: Path) -> np.ndarray:
    """Hillshade (0..1, light from the north-west) on the plate's own grid."""
    im, _ = stitch(TERRARIUM, z, lon0, lon1, lat0, lat1, cache / "terrarium", "terr")
    a = np.asarray(im).astype(np.float32)
    h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    h = np.maximum(h, 0)
    lat = (lat0 + lat1) / 2
    mpp = 40075016 * math.cos(math.radians(lat)) / (256 * 2**z)
    gy, gx = np.gradient(ndimage.gaussian_filter(h, 1.0), mpp)
    ex = 2.2  # vertical exaggeration so the hills read on a phone
    slope = np.arctan(ex * np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(42)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade, 0, 1)
    img = Image.fromarray((shade * 255).astype(np.uint8)).resize(size, Image.BILINEAR)
    return np.asarray(img).astype(np.float32) / 255


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    geo = {"plates": {}}
    for name, z, lo0, lo1, la0, la1, k in PLATES:
        im, b = stitch(EOX, z, lo0, lo1, la0, la1, cache / "eox", "eox")
        for side in (0, 1):
            if im.size[side] > 4096:
                f = 4096 / im.size[side]
                im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        sh = relief(z - 1, lo0, lo1, la0, la1, im.size, cache)
        a = np.asarray(im).astype(np.float32)
        # multiply-style relief: shadows deepen, lit faces stay; flat ground (shade ≈ 0.67) barely changes
        m = (1 - k) + k * (sh / 0.67)
        out = np.clip(a * m[..., None], 0, 255).astype(np.uint8)
        Image.fromarray(out).save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    india = C["India"]
    geo["india"] = rings(unary_union([p for p in india.geoms if p.area > 0.05]), 0.02)
    st = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    S = {r["name"]: shape(s.__geo_interface__) for r, s in zip(st.records(), st.shapes()) if r["adm0_a3"] == "IND"}
    ne8 = unary_union([S[n] for n in NE_STATES] + [india.intersection(box(91.5, 26.8, 97.6, 29.6))]).intersection(india)
    geo["ne"] = rings(unary_union([p for p in (ne8.geoms if hasattr(ne8, "geoms") else [ne8]) if p.area > 0.01]), 0.01)
    geo["states"] = {n: rings(S[n].intersection(india) if n != "Arunachal Pradesh" else india.intersection(box(91.5, 26.6, 97.6, 29.6)).difference(S["Assam"]), 0.008)
                     for n in NE_STATES}
    geo["westbengal"] = rings(S["West Bengal"].intersection(india), 0.006)
    an = S["Andaman and Nicobar"]
    geo["andaman"] = rings(an, 0.004)
    for n, key, tol in [("Nepal", "nepal", 0.01), ("Bhutan", "bhutan", 0.006), ("Bangladesh", "bangladesh", 0.008),
                        ("Myanmar", "myanmar", 0.02), ("Pakistan", "pakistan", 0.03), ("Sri Lanka", "srilanka", 0.02),
                        ("Malaysia", "malaysia", 0.02), ("Indonesia", "indonesia", 0.03), ("Thailand", "thailand", 0.03)]:
        g = C[n]
        geo[key] = rings(unary_union([p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 0.02]), tol)
    china = C["China"].intersection(box(70, 15, 126, 46))
    geo["china"] = rings(unary_union([p for p in (china.geoms if hasattr(china, "geoms") else [china]) if p.area > 0.5]), 0.04)
    chumbi = C["China"].intersection(box(88.7, 27.25, 89.25, 27.95))
    geo["chumbi"] = rings(max(chumbi.geoms, key=lambda p: p.area) if hasattr(chumbi, "geoms") else chumbi, 0.003)
    corr = india.intersection(box(87.98, 26.25, 88.62, 26.88))
    corr = max(corr.geoms, key=lambda p: p.area) if hasattr(corr, "geoms") else corr
    geo["corridor"] = rings(corr, 0.002)

    rv = shapefile.Reader(glob.glob(str(ne / "ne_10m_rivers_lake_centerlines" / "*.shp"))[0])
    for rec, s in zip(rv.records(), rv.shapes()):
        if rec["name"] == "Tista":
            pts = s.points
            geo["teesta"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in pts[:: max(1, len(pts) // 120)]]
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    (ROOT / "src" / "siliguri").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "siliguri" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print("geo", {k: (len(v) if isinstance(v, list) else "") for k, v in geo.items()})


if __name__ == "__main__":
    main()
