"""Satellite plates and vectors for the Kolkata three-villages video (4K).

    python3 -I tools/build_kolkata_maps.py <tile_cache> <ne_dir>

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen). Borders and the built-up area: Natural Earth (public domain;
India point-of-view edition for India). The Hooghly glow is a water mask taken from the city plate itself, and the
lower river line is traced from its known course (approximate). Village spots are approximate: Sutanuti around
today's Bagbazar/Shobhabazar, Kalikata around BBD Bag/Burrabazar, Gobindapur on the Fort William/Maidan site.
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import Point, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_mumbai_tiles import EOX, stitch  # noqa: E402
from build_spain_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "kolkata" / "maps"
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1 (sized for the 4K render)
    ("india", 7, 62.0, 100.0, 4.0, 38.0),
    ("bengal", 10, 86.6, 90.0, 21.3, 24.0),
    ("city", 14, 88.22, 88.48, 22.44, 22.70),
]
PLACES = {
    "sutanuti": (88.366, 22.602), "kalikata": (88.350, 22.575), "gobindapur": (88.338, 22.553),
    "kalighat": (88.343, 22.520), "fort": (88.3378, 22.5545), "highcourt": (88.3437, 22.5687),
    "shobhabazar": (88.364, 22.597), "chitpur": (88.370, 22.612), "kolkata": (88.36, 22.57),
}
HOOGHLY_LOWER = [  # traced, approximate, city → sea
    (88.348, 22.585), (88.332, 22.556), (88.305, 22.540), (88.25, 22.52), (88.18, 22.48), (88.14, 22.38),
    (88.17, 22.27), (88.19, 22.19), (88.12, 22.05), (88.06, 21.85), (88.05, 21.65),
]


def water_mask(im: Image.Image) -> Image.Image:
    """The Hooghly on the Sentinel-2 plate is smooth, green-teal water: low local texture and green above red.
    Keep the big connected bodies only (the river), so ponds and wetlands drop out."""
    from scipy import ndimage
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g = a[..., 0], a[..., 1]
    lum = a.mean(2)
    var = ndimage.uniform_filter(lum ** 2, 9) - ndimage.uniform_filter(lum, 9) ** 2
    m = (var < 16) & (g > r + 6) & (lum > 45) & (lum < 120)
    m = ndimage.binary_closing(ndimage.binary_opening(m, iterations=2), iterations=4)
    lab, n = ndimage.label(m)
    # bridges cut the river into pieces, so keep every big body, not just the largest
    sizes = ndimage.sum(m, lab, range(1, n + 1)) if n else np.array([0])
    big = [i + 1 for i in np.where(sizes > sizes.max() * 0.05)[0]]
    # the East Kolkata Wetlands sit far east of the river; drop bodies centred there
    cx = ndimage.center_of_mass(m, lab, big) if big else []
    big = [i for i, (_, x) in zip(big, cx) if x < m.shape[1] * 0.65]
    keep = np.isin(lab, big) if n else m
    keep = ndimage.binary_fill_holes(keep)
    alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    # CSS masks read alpha, so the mask is white with the water as its alpha
    out = Image.new("RGBA", alpha.size, (255, 255, 255, 0))
    out.putalpha(alpha)
    return out


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
        if name == "city":
            water_mask(im).save(OUT / "city_water.png")
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    C = {r["ADMIN"]: shape(s.__geo_interface__) for r, s in zip(sf.records(), sf.shapes())}
    india = C["India"]
    geo["india"] = rings(unary_union([p for p in india.geoms if p.area > 0.05]), 0.02)
    st = shapefile.Reader(glob.glob(str(ne / "extra" / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    wb = [shape(s.__geo_interface__) for r, s in zip(st.records(), st.shapes()) if r["adm0_a3"] == "IND" and r["name"] == "West Bengal"][0]
    geo["westbengal"] = rings(wb.intersection(india), 0.004)
    # Kolkata's built-up area (Natural Earth urban areas), for the city highlight
    ua = shapefile.Reader(glob.glob(str(ne / "extra" / "ne_10m_urban_areas" / "*.shp"))[0])
    pt = Point(88.355, 22.575)
    city = [shape(s.__geo_interface__) for s in ua.shapes() if shape(s.__geo_interface__).buffer(0.01).contains(pt)]
    if city:
        g = unary_union(city).intersection(box(88.22, 22.44, 88.48, 22.70))
        g = max(g.geoms, key=lambda q: q.area) if hasattr(g, "geoms") else g
        geo["urban"] = rings(g, 0.0015)
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["hooghly"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in HOOGHLY_LOWER]
    (ROOT / "src" / "kolkata").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "kolkata" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))


if __name__ == "__main__":
    main()
