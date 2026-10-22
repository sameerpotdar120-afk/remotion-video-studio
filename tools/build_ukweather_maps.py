"""GeoLayers-style plates and vectors for the UK weather video (4K 60 fps).

    python3 -I tools/build_ukweather_maps.py <tile_cache> <ne_dir> <worldbank_precip.json> [plate names]

The look the creator asked for (an After Effects GeoLayers map: crisp satellite, terrain relief, sea-floor relief, a
strong grade) rebuilt from free data only:
- Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), one zoom finer than before.
- Relief: AWS Terrain Tiles, "terrarium" encoding (open data; SRTM/NASA on land, ETOPO1/NOAA bathymetry at sea;
  credited on screen). A multi-directional hillshade is blended onto the land (soft light), and the flat Sentinel sea is
  replaced by a depth-tinted ocean (turquoise shelf → navy abyss) with its own seabed hillshade, as in the reference.
- Grade: teal shadows / warm highlights, gentle vibrance, local contrast (unsharp), no clipping.
Countries: Natural Earth's India point-of-view edition (public domain). The 72 countries wetter than the UK come from
the World Bank's AG.LND.PRCP.MM indicator (long-term average precipitation in depth, mm per year).
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageFilter
from shapely.geometry import box, shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402
from fetch_mumbai_tiles import stitch as stitch_tpl  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ukweather" / "maps"
CAP = 8192
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("world", 4, 3, -180.0, 179.99, -62.0, 78.0),
    ("atlantic", 6, 4, -100.0, 40.0, -5.0, 72.0),
    ("isles", 8, 6, -14.0, 6.0, 48.0, 61.5),
    ("england", 9, 8, -6.5, 2.5, 50.0, 55.8),
    ("samerica", 6, 4, -95.0, -50.0, -22.0, 16.0),
    ("colombia", 8, 6, -80.5, -65.5, -5.0, 13.5),
]
PLACES = {"mumbai": (72.88, 19.08), "london": (-0.13, 51.51), "edinburgh": (-3.19, 55.95), "highlands": (-4.8, 57.2), "midlands": (-1.6, 52.6),
          "gulf_start": (-82.0, 24.5), "atlantic_mid": (-40.0, 45.0), "bogota": (-74.07, 4.71), "pacific_col": (-82.0, 4.5), "iceland": (-18.5, 64.9)}


def dem(z, lo0, lo1, la0, la1, cache):
    im, b = stitch_tpl(TERRARIUM, z, lo0, lo1, la0, la1, cache / "terrarium", "terr")
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def hillshade(h, px_m, az=(315, 270, 0), alt=45, exag=1.0):
    """Multi-directional hillshade (0..1), averaged over three light azimuths so no side goes flat black."""
    gy, gx = np.gradient(h * exag, px_m)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    out = np.zeros_like(h)
    for a in az:
        azr, altr = math.radians(360 - a + 90), math.radians(alt)
        out += np.sin(altr) * np.cos(slope) + np.cos(altr) * np.sin(slope) * np.cos(azr - aspect)
    return np.clip(out / len(az), 0, 1)


def soft_light(base, blend):
    return np.where(blend < 0.5, 2 * base * blend + base * base * (1 - 2 * blend), 2 * base * (1 - blend) + np.sqrt(np.clip(base, 0, 1)) * (2 * blend - 1))


def grade(rgb, land):
    """Teal shadows / warm highlights, vibrance, local contrast."""
    lum = rgb.mean(axis=2, keepdims=True)
    sh = np.clip(1 - lum * 2, 0, 1)
    hi = np.clip(lum * 2 - 1, 0, 1)
    rgb = rgb + sh * np.array([-0.02, 0.02, 0.035]) + hi * np.array([0.03, 0.015, -0.02])
    sat = rgb.max(axis=2, keepdims=True) - rgb.min(axis=2, keepdims=True)
    rgb = lum + (rgb - lum) * (1 + 0.35 * (1 - sat) * land[..., None] + 0.15)
    return np.clip(rgb, 0, 1)


def build(name, zs, zd, lo0, lo1, la0, la1, cache):
    sat, b = stitch(zs, lo0, lo1, la0, la1, cache / "eox")
    f = min(1.0, CAP / max(sat.size))
    if f < 1:
        sat = sat.resize((round(sat.width * f), round(sat.height * f)), Image.LANCZOS)
    W, H = sat.size
    h = dem(zd, lo0, lo1, la0, la1, cache)
    hi = Image.fromarray(h.astype(np.float32), mode="F").resize((W, H), Image.BICUBIC)
    h = np.asarray(hi)
    mid_lat = math.radians((la0 + la1) / 2)
    px_m = (lo1 - lo0) * 111320 * math.cos(mid_lat) / W
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    land = (h > 0.5).astype(np.float32)
    land = np.asarray(Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    # land: satellite with soft-light relief (exaggerated more when zoomed out)
    exag = max(1.0, min(6.0, px_m / 120))
    hs_land = hillshade(np.maximum(h, 0), px_m, exag=exag)
    land_rgb = soft_light(a, (0.35 + 0.65 * hs_land)[..., None] * 0.9 + 0.05)
    # sea: depth tint (shallow turquoise → deep navy) with seabed relief, keeping a little of the satellite's texture
    d = np.clip(-h, 0, 6000)
    t = np.clip(np.log1p(d / 40) / np.log1p(6000 / 40), 0, 1)[..., None]
    shallow, mid, deep = np.array([0.20, 0.52, 0.58]), np.array([0.06, 0.30, 0.43]), np.array([0.02, 0.12, 0.24])
    sea = np.where(t < 0.5, shallow + (mid - shallow) * (t / 0.5), mid + (deep - mid) * ((t - 0.5) / 0.5))
    hs_sea = hillshade(np.minimum(h, 0), px_m, alt=35, exag=exag * 4)[..., None]
    sea = sea * (0.72 + 0.5 * hs_sea)
    sea = sea * 0.88 + a * 0.12
    out = land_rgb * land[..., None] + sea * (1 - land[..., None])
    out = grade(out, land)
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    img.save(OUT / f"{name}_geo.jpg", quality=90)
    return {"bounds": [round(v, 1) for v in b], "w": W, "h": H}


def main() -> None:
    cache, ne, wbp = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    only = set(sys.argv[4:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "ukweather" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = build(name, zs, zd, lo0, lo1, la0, la1, cache)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    recs = list(zip(sf.records(), sf.shapes()))
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in recs}
    ISO = {r["ADM0_A3"]: (r["ADMIN"], shape(s.__geo_interface__).buffer(0)) for r, s in recs}
    uk = C["United Kingdom"]
    gb = max(uk.geoms, key=lambda g: g.area) if hasattr(uk, "geoms") else uk
    geo["gb"] = rings(gb, 0.003, 0.0)
    geo["uk"] = rings(uk, 0.003, 0.0005)
    geo["ireland"] = rings(C["Ireland"], 0.003, 0.0005)
    geo["colombia"] = rings(C["Colombia"].intersection(box(-82, -5, -66, 14)), 0.005, 0.002)
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    # the countries wetter than the UK (World Bank), as label points
    d = json.loads(wbp.read_text())[1]
    vals = {x["countryiso3code"]: x["value"] for x in d if x["value"] and x["countryiso3code"]}
    ukv = vals["GBR"]
    wet = []
    for iso, v in sorted(vals.items(), key=lambda kv: -kv[1]):
        if v > ukv and iso in ISO:
            name, g = ISO[iso]
            p = g.representative_point()
            wet.append([name, round(p.x, 2), round(p.y, 2), v])
    geo["wetter"] = wet
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024, "wetter", len(wet))


if __name__ == "__main__":
    main()
