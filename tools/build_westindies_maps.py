"""Dark "Midnight" plates and vectors for the West Indies video (free data only).

    python3 -I tools/build_westindies_maps.py <tile_cache> <ne_dir> [plate names]

The reference's dark map, rebuilt from free sources: EOX Sentinel-2 cloudless 2024 (CC BY 4.0) for the land and the
shallow banks, AWS terrarium relief (SRTM/NASA on land, ETOPO1/NOAA bathymetry) for the hillshade and the seabed.
The look: the land pulled down and cooled (shadows to navy, a little less saturation, relief soft-lit), the deep sea
near-black navy with faint seabed relief, and the shallow banks (the Bahamas, the Cuban shelf, the reefs round every
island) kept from the satellite and lifted, so they glow turquoise against the dark like in the reference.
Countries from Natural Earth's India point-of-view edition (public domain).
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from scipy import ndimage
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "westindies" / "maps"
CAP = 8192
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("world", 4, 3, -180.0, 179.99, -62.0, 78.0),
    ("caribbean", 7, 6, -90.0, -54.0, 4.0, 29.0),
    ("greater", 9, 8, -85.5, -67.5, 16.5, 23.8),
    ("bahamas", 8, 7, -80.5, -71.0, 20.5, 27.5),
    ("lesser", 9, 8, -65.5, -58.8, 10.0, 18.8),
]
# the island countries the VO names, plus the territories and Guyana (the cricket team's mainland member)
COUNTRIES = ["Cuba", "Jamaica", "Haiti", "Dominican Republic", "The Bahamas", "Barbados", "Trinidad and Tobago", "Grenada", "Saint Lucia",
             "Antigua and Barbuda", "Dominica", "Saint Kitts and Nevis", "Saint Vincent and the Grenadines", "Guyana"]
TERRITORIES = ["Puerto Rico", "United States Virgin Islands", "British Virgin Islands", "Anguilla", "Montserrat", "Cayman Islands",
               "Turks and Caicos Islands", "Aruba", "Curaçao", "Sint Maarten", "Saint Martin", "France", "Netherlands"]
BOX = box(-90, 5, -55, 30)


def build(name, zs, zd, lo0, lo1, la0, la1, cache):
    sat, b = stitch(zs, lo0, lo1, la0, la1, cache / "eox")
    f = min(1.0, CAP / max(sat.size))
    if f < 1:
        sat = sat.resize((round(sat.width * f), round(sat.height * f)), Image.LANCZOS)
    W, H = sat.size
    h = uk.dem(zd, lo0, lo1, la0, la1, cache)
    h = np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC))
    px_m = (lo1 - lo0) * 111320 * math.cos(math.radians((la0 + la1) / 2)) / W
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    lum = (r_ + g_ + b_) / 3
    # water from the satellite where the DEM is too coarse (small islands, reefs)
    wet = (b_ > r_ + 0.015) & (b_ >= g_ - 0.03) & (lum < 0.42)
    land = (h > 0.5) & ~wet
    land = ndimage.binary_opening(land, iterations=1)
    landf = np.asarray(Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255
    # shallow banks: bright turquoise water in the satellite, or shallow water by depth
    turq = np.clip(((g_ + b_) / 2 - r_ - 0.06) * 6, 0, 1) * np.clip((lum - 0.22) * 5, 0, 1)
    shallow = np.clip(turq + np.clip(1 - (-np.minimum(h, 0)) / 60, 0, 1) * 0.35 * (h <= 0.5), 0, 1)
    shallow = ndimage.gaussian_filter(shallow.astype(np.float32), 1.5) * (1 - landf)

    # land: soft-lit relief, then pulled down and cooled
    exag = max(1.0, min(6.0, px_m / 120))
    hs = uk.hillshade(np.maximum(h, 0), px_m, exag=exag)
    land_rgb = uk.soft_light(a, (0.35 + 0.65 * hs)[..., None] * 0.9 + 0.05)
    llum = land_rgb.mean(axis=2, keepdims=True)
    land_rgb = llum + (land_rgb - llum) * 0.82
    land_rgb = land_rgb * 0.74 + np.array([-0.01, 0.0, 0.02])
    land_rgb = land_rgb + np.clip(0.35 - llum, 0, 1) * np.array([-0.03, 0.0, 0.05])

    # deep sea: near-black navy, slightly lighter on the shelves, with faint seabed relief
    d = np.clip(-h, 0, 6000)
    t = np.clip(np.log1p(d / 30) / np.log1p(6000 / 30), 0, 1)[..., None]
    near, far = np.array([0.05, 0.16, 0.22]), np.array([0.016, 0.055, 0.09])
    sea = near + (far - near) * t
    hs_sea = uk.hillshade(np.minimum(h, 0), px_m, alt=35, exag=exag * 4)[..., None]
    sea = sea * (0.75 + 0.55 * hs_sea)
    # shallows from the satellite, lifted and pushed toward turquoise so they glow
    sh_rgb = np.clip(a * 1.25 + np.array([-0.06, 0.04, 0.06]), 0, 1)
    slum = sh_rgb.mean(axis=2, keepdims=True)
    sh_rgb = np.clip(slum + (sh_rgb - slum) * 1.35, 0, 1)
    sea = sea * (1 - shallow[..., None]) + sh_rgb * shallow[..., None]

    out = land_rgb * landf[..., None] + sea * (1 - landf[..., None])
    # polar ice and snow stay near-white but not glaring
    ice = np.clip((lum - 0.78) * 6, 0, 1)[..., None] * landf[..., None]
    out = out * (1 - ice) + np.clip(a * 0.92, 0, 1) * ice
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2))
    img.save(OUT / f"{name}_geo.jpg", quality=91)
    return {"bounds": [round(v, 1) for v in b], "w": W, "h": H}


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "westindies" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = build(name, zs, zd, lo0, lo1, la0, la1, cache)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {n: rings(C[n], 0.004, 0.00002) for n in COUNTRIES}
    geo["territories"] = {n: rings(C[n].intersection(BOX), 0.004, 0.00002) for n in TERRITORIES}
    geo["india"] = rings(C["India"], 0.02, 0.01)
    # the region's outline: a rounded hull round every island (buffered out, merged, eased back in)
    isl = unary_union([C[n] for n in COUNTRIES if n != "Guyana"] + [C[n].intersection(BOX) for n in TERRITORIES])
    hull = isl.buffer(1.1, resolution=8).buffer(-0.55, resolution=8).simplify(0.05)
    hull = max(hull.geoms, key=lambda g: g.area) if hull.geom_type == "MultiPolygon" else hull
    geo["hull"] = [[[round(mx(x)), round(my(y))] for x, y in hull.exterior.coords]]
    geo["centroids"] = {n: [round(mx(C[n].representative_point().x)), round(my(C[n].representative_point().y))] for n in COUNTRIES}
    gj.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
