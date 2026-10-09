"""Maps and data for the El Niño video.

    python3 -I tools/build_elnino_maps.py <nasa_world.jpg> <ne_dir> <oisst_dir>

Frame: Web Mercator, longitudes west of -20 unwrapped (+360), so one strip runs
40°E (East Africa) → India → the Pacific → the Americas → 340°E (mid-Atlantic).

Writes to public/elnino/maps/:
  world.jpg / world_small.jpg  NASA Blue Marble July topo+bathy, 24 px/deg
  india.jpg, peru.jpg          close-up plates, 60 px/deg (source resolution)
  ocean_mask.png               anti-aliased ocean alpha for the SST frames (8 px/deg)
  sst/sst_YYYYMMDD.jpg         NOAA OISST v2.1 daily anomaly, coloured, 8 px/deg
and src/elnino/geo.json (plate bounds, country rings, SST frame list).
"""
import glob
import json
import math
import sys
from pathlib import Path

import h5py
import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "elnino" / "maps"
R = 6378137.0
WRAP = -20.0
LON0, LON1, LAT0, LAT1 = 40.0, 340.0, 78.0, -62.0


def unwrap(lon: float) -> float:
    return lon + 360 if lon < WRAP else lon


def my(lat: float) -> float:
    lat = max(-85.0, min(85.0, lat))
    return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def mx(lon: float) -> float:
    return R * math.radians(lon)


def bounds(lon0, lon1, lat0, lat1):
    """[x0, y0, x1, y1] in Mercator metres (lon already unwrapped, lat0 > lat1)."""
    return [mx(lon0), my(lat1), mx(lon1), my(lat0)]


def eq_strip(src: Image.Image, lon0: float, lon1: float, lat0: float, lat1: float, ppd: int) -> np.ndarray:
    """Equirectangular crop (wrapping across ±180) resampled to ppd px/deg."""
    W, H = src.size
    s = W / 360
    rows = (int((90 - lat0) * s), int((90 - lat1) * s))
    parts = []
    a = lon0
    while a < lon1:
        la = ((a + 180) % 360) - 180
        b = min(lon1, a + (180 - la))
        c0 = int(round((la + 180) * s))
        c1 = int(round((la + (b - a) + 180) * s))
        parts.append(src.crop((c0, rows[0], c1, rows[1])))
        a = b
    strip = Image.new("RGB", (sum(p.width for p in parts), rows[1] - rows[0]))
    x = 0
    for p in parts:
        strip.paste(p, (x, 0))
        x += p.width
    return np.asarray(strip.resize((int(round((lon1 - lon0) * ppd)), int(round((lat0 - lat1) * ppd))), Image.LANCZOS))


def to_merc(eq: np.ndarray, lat0: float, lat1: float, ppd: int, lon_span: float) -> np.ndarray:
    """Reproject equirectangular rows to Mercator (columns are already linear in x)."""
    y1, y0 = my(lat0), my(lat1)
    w = eq.shape[1]
    h = int(round(w * (y1 - y0) / (mx(lon_span) - mx(0))))
    ys = y1 - (np.arange(h) + 0.5) / h * (y1 - y0)
    lat = np.degrees(2 * np.arctan(np.exp(ys / R)) - np.pi / 2)
    fr = (lat0 - lat) * ppd - 0.5
    r0 = np.clip(np.floor(fr).astype(int), 0, eq.shape[0] - 1)
    r1 = np.clip(r0 + 1, 0, eq.shape[0] - 1)
    t = np.clip(fr - np.floor(fr), 0, 1)
    out = np.empty((h,) + eq.shape[1:], np.uint8)
    for a in range(0, h, 256):  # row chunks keep memory flat on the big plate
        tt = t[a : a + 256].reshape((-1,) + (1,) * (eq.ndim - 1))
        out[a : a + 256] = (eq[r0[a : a + 256]] * (1 - tt) + eq[r1[a : a + 256]] * tt).clip(0, 255).astype(np.uint8)
    return out


def plate(src, name, lon0, lon1, lat0, lat1, ppd, small=0):
    eq = eq_strip(src, lon0, lon1, lat0, lat1, ppd)
    m = Image.fromarray(to_merc(eq, lat0, lat1, ppd, lon1 - lon0))
    m.save(OUT / f"{name}.jpg", quality=90)
    if small:
        m.resize((m.width // small, m.height // small), Image.LANCZOS).save(OUT / f"{name}_small.jpg", quality=88)
    print(name, m.size)
    return {"bounds": bounds(lon0, lon1, lat0, lat1), "w": m.width, "h": m.height}


# ---------------------------------------------------------------- vector data
def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy)
    if n == 0:
        h = len(pts) // 2
        return simplify(pts[: h + 1], tol)[:-1] + simplify(pts[h:], tol)
    i, dmax = 0, 0.0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x1 * y0 - y1 * x0) / n
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[: i + 1], tol)[:-1] + simplify(pts[i:], tol)


def ring_merc(ring):
    """A ring centred west of WRAP (the Americas) moves wholly into the +360 frame."""
    west = sum(p[0] for p in ring) / len(ring) < WRAP
    return [[round(mx(lo + 360 if (west and lo < 0) else lo), 1), round(my(la), 1)] for lo, la in ring]


def area(pts):
    return abs(sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))) / 2


def country(sf, name, tol, min_area, keep=lambda lo, la: True):
    out = []
    for rec, shp in zip(sf.records(), sf.shapes()):
        if rec["ADMIN"] != name:
            continue
        idx = list(shp.parts) + [len(shp.points)]
        for a, b in zip(idx, idx[1:]):
            ring = shp.points[a:b]
            cx = sum(p[0] for p in ring) / len(ring)
            cy = sum(p[1] for p in ring) / len(ring)
            if not keep(cx, cy):
                continue
            pts = ring_merc(ring)
            if area(pts) < min_area:
                continue
            s = simplify(pts, tol)
            if len(s) >= 4:
                out.append(s)
    return out


def geojson_rings(path, tol, min_area):
    gj = json.loads(Path(path).read_text())
    out = []
    for f in gj["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            pts = ring_merc(poly[0])
            if area(pts) >= min_area:
                s = simplify(pts, tol)
                if len(s) >= 4:
                    out.append(s)
    return out


# ---------------------------------------------------------------- SST
STOPS = [  # anomaly °C → colour; pale near zero, NOAA-like heat ramp above
    (-4.0, (20, 40, 160)), (-2.5, (30, 90, 230)), (-1.2, (60, 180, 255)), (-0.4, (160, 230, 250)),
    (0.0, (236, 244, 236)), (0.5, (255, 240, 160)), (1.2, (255, 205, 70)), (2.0, (255, 140, 40)),
    (2.8, (245, 70, 30)), (3.6, (205, 10, 40)), (4.6, (140, 0, 70)), (6.0, (80, 0, 70)),
]


def colourize(a: np.ndarray) -> np.ndarray:
    xs = np.array([s[0] for s in STOPS])
    out = np.zeros(a.shape + (3,), np.float32)
    for c in range(3):
        out[..., c] = np.interp(a, xs, [s[1][c] for s in STOPS])
    return out


def sst_grid(path):
    with h5py.File(path, "r") as h:
        v = h["anom"]
        x = v[0, 0].astype(np.float32)
        x[x == v.attrs["_FillValue"][0]] = np.nan
        x *= float(v.attrs["scale_factor"][0])
        lat = h["lat"][:]
        lon = h["lon"][:]
    return x, lat, lon


def fill_nan(x):
    m = np.isnan(x)
    if not m.any():
        return x
    idx = ndimage.distance_transform_edt(m, return_distances=False, return_indices=True)
    return x[tuple(idx)]


def main() -> None:
    nasa, ne, oisst = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    (OUT / "sst").mkdir(parents=True, exist_ok=True)
    src = Image.open(nasa)
    geo = {"wrap": WRAP}
    geo["world"] = plate(src, "world", LON0, LON1, LAT0, LAT1, 24, small=3)
    geo["india"] = plate(src, "india", 60, 100, 38, 4, 60)
    geo["peru"] = plate(src, "peru", 268, 292, 6, -20, 60)
    geo["indo"] = plate(src, "indo", 92, 156, 10, -40, 30)
    del src

    # ---- ocean mask + SST frames at 8 px/deg, same Mercator frame as the world plate
    P = 8
    sf10 = shapefile.Reader(str(ne / "z10" / "ne_10m_admin_0_countries.shp"))
    b = geo["world"]["bounds"]
    W = int((LON1 - LON0) * P)
    H = int(round(W * (b[3] - b[1]) / (b[2] - b[0])))
    S = 3
    mask = Image.new("L", (W * S, H * S), 255)
    d = ImageDraw.Draw(mask)
    for shp in sf10.shapes():
        idx = list(shp.parts) + [len(shp.points)]
        for a0, a1 in zip(idx, idx[1:]):
            ring = shp.points[a0:a1]
            if len(ring) < 3:
                continue
            for shift in (0, 360):
                pts = [((mx(lo + shift) - b[0]) / (b[2] - b[0]) * W * S, (b[3] - my(la)) / (b[3] - b[1]) * H * S) for lo, la in ring]
                xs = [p[0] for p in pts]
                if max(xs) < 0 or min(xs) > W * S:
                    continue
                d.polygon(pts, fill=0)
    mask = mask.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    # fade out toward the poles (sea ice)
    ys = b[3] - (np.arange(H) + 0.5) / H * (b[3] - b[1])
    lat = np.degrees(2 * np.arctan(np.exp(ys / R)) - np.pi / 2)
    fade = np.clip((70 - np.abs(lat)) / 8, 0, 1)[:, None]
    m = (np.asarray(mask, np.float32) * fade).astype(np.uint8)
    Image.fromarray(m).save(OUT / "ocean_mask.png", optimize=True)
    print("ocean_mask", W, H)

    # Mercator row → latitude, column → longitude (unwrapped, mod 360 for the 0..360 grid)
    lon_cols = (LON0 + (np.arange(W) + 0.5) / P) % 360
    frames = []
    for f in sorted(glob.glob(str(oisst / "oisst-avhrr-v02r01.*.nc"))):
        day = Path(f).name.split(".")[1][:8]
        x, glat, glon = sst_grid(f)
        x = fill_nan(x)
        ri = (lat - glat[0]) / (glat[1] - glat[0])
        ci = (lon_cols - glon[0]) / (glon[1] - glon[0])
        rr, cc = np.meshgrid(ri, ci, indexing="ij")
        v = ndimage.map_coordinates(x, [rr, cc], order=3, mode="wrap")
        rgb = colourize(v)
        Image.fromarray(rgb.clip(0, 255).astype(np.uint8)).save(OUT / "sst" / f"sst_{day}.jpg", quality=86)
        frames.append(day)
        if day == frames[0] or len(frames) % 10 == 0:
            n34 = v[(np.abs(lat) <= 5)][:, (lon_cols >= 190) & (lon_cols <= 240)]
            print("sst", day, "nino3.4 ~%.2f" % float(n34.mean()))
    geo["sst"] = {"bounds": b, "w": W, "h": H, "days": frames}

    # ---- countries
    sf50 = shapefile.Reader(str(ne / "z50" / "ne_50m_admin_0_countries.shp"))
    geo["peru_c"] = country(sf10, "Peru", 3000, 1e9)
    geo["ecuador"] = country(sf10, "Ecuador", 3000, 1e9, lambda lo, la: lo > -85)  # no Galápagos
    geo["australia"] = country(sf50, "Australia", 9000, 5e10)
    geo["indonesia"] = country(sf50, "Indonesia", 6000, 4e9)
    geo["india_c"] = geojson_rings(ROOT / "public" / "sentinel" / "geo" / "geo_india.json", 6000, 5e9)
    geo["usa"] = country(sf50, "United States of America", 9000, 5e10, lambda lo, la: -126 < lo < -66 and 24 < la < 50)
    geo["canada"] = country(sf50, "Canada", 15000, 2e11)
    (ROOT / "src" / "elnino").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "elnino" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    for k, v in geo.items():
        if isinstance(v, list):
            print(k, len(v), "rings", sum(len(r) for r in v), "pts")


if __name__ == "__main__":
    main()
