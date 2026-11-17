"""3D terrain for the Aravalli video (free data only).

    python3 -I tools/build_aravalli_3d.py <tile_cache> <ne_dir>

One height field and one texture over north-west India (68-80.5E, 21-30.5N), both in Web Mercator so they line up:
- Heights: AWS Terrain Tiles, terrarium (SRTM/NASA; open data), zoom 8, resampled to a GRID x ? mesh. Exaggerated
  strongly inside the Aravalli (so the ridge reads on a phone) and gently elsewhere, blended smoothly.
- Texture: EOX Sentinel-2 cloudless 2024 (CC BY 4.0), zoom 9, 4096 px wide. The documentary "charcoal" look: grey,
  contrasty, with a baked hillshade; the Aravalli keeps its real colour (only the highlight carries colour); the Thar
  is tinted sand; India's official boundary (Natural Earth, India point-of-view edition) drawn white, outside India darker.
The Aravalli mask is a hand-drawn corridor along the range (Delhi Ridge to Palanpur, approximate) intersected with real
local relief, so only the hills themselves light up.
Writes public/aravalli/3d/{tex.jpg, height.bin (float32 scene units), meta.json}.
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from shapely.geometry import LineString, Polygon, shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "aravalli" / "3d"
BOX = (68.0, 80.5, 21.0, 30.5)  # lon0, lon1, lat0, lat1
GRID = 1100  # mesh vertices across
TEXW = 4096
# the Aravalli corridor (lon, lat, half-width in degrees), Delhi Ridge to the Gujarat end
RIDGE = [(77.20, 28.66, 0.10), (77.05, 28.40, 0.16), (76.75, 28.05, 0.22), (76.55, 27.60, 0.30), (76.20, 27.25, 0.32),
         (75.85, 26.95, 0.30), (75.30, 26.60, 0.30), (74.65, 26.40, 0.32), (74.25, 25.90, 0.38), (73.85, 25.35, 0.45),
         (73.65, 24.85, 0.55), (73.55, 24.45, 0.60), (72.95, 24.45, 0.45), (72.70, 24.60, 0.25), (72.45, 24.15, 0.30)]
THAR = [(71.0, 28.9), (72.4, 29.6), (73.6, 29.3), (74.4, 28.4), (74.7, 27.4), (74.2, 26.6), (73.3, 25.9),
        (72.3, 25.2), (71.2, 24.8), (70.3, 24.9), (69.9, 25.8), (70.1, 27.0), (70.4, 28.0)]
R = 6378137.0


def mx(lon): return R * math.radians(lon)
def my(lat): return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    lon0, lon1, lat0, lat1 = BOX
    sat, b = stitch(9, lon0, lon1, lat0, lat1, cache / "eox")
    sat = sat.resize((TEXW, round(TEXW * sat.height / sat.width)), Image.LANCZOS)
    TW, TH = sat.size
    h = uk.dem(8, lon0, lon1, lat0, lat1, cache)
    GW, GH = GRID, round(GRID * TH / TW)
    dem = np.asarray(Image.fromarray(h.astype(np.float32), mode="F").resize((GW, GH), Image.BILINEAR))
    dem = ndimage.median_filter(dem, 5)  # kills single-pixel spikes in the DEM
    dem = ndimage.gaussian_filter(dem, 0.8)

    def px(lon, lat, W, H):  # lon/lat -> pixel in a W x H raster of the box
        return (mx(lon) - b[0]) / (b[2] - b[0]) * W, (b[3] - my(lat)) / (b[3] - b[1]) * H

    def raster(polys, W, H, blur):
        im = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(im)
        for poly in polys:
            for ring in ([poly.exterior] if poly.geom_type == "Polygon" else [g.exterior for g in poly.geoms]):
                d.polygon([px(x, y, W, H) for x, y in ring.coords], fill=255)
        return np.asarray(im.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255

    corridor = None
    for (x0, y0, w0), (x1, y1, w1) in zip(RIDGE, RIDGE[1:]):
        seg = LineString([(x0, y0), (x1, y1)]).buffer((w0 + w1) / 2, cap_style=1)
        corridor = seg if corridor is None else corridor.union(seg)
    # local relief: height above a wide smoothed base
    base = ndimage.gaussian_filter(np.maximum(dem, 0), 18)
    relief = np.clip((dem - base - 8) / 55, 0, 1)
    cor_g = raster([corridor], GW, GH, 6)
    hill_g = np.clip(ndimage.gaussian_filter(relief, 1.2) * 1.4, 0, 1) * cor_g
    vex = 1.6 + 24.0 * ndimage.gaussian_filter(cor_g, 4)  # exaggeration: 1.6x outside, up to ~26x on the range
    # the plains stay calm: smooth the ground outside the range so its relief doesn't shimmer
    dem = dem * cor_g + ndimage.gaussian_filter(dem, 3) * (1 - cor_g)
    km_per_m = 1 / 1000
    lat_mid = math.radians((lat0 + lat1) / 2)
    scale = math.cos(lat_mid) / 1000  # mercator metres -> true-ish km at mid latitude
    W_km, H_km = (b[2] - b[0]) * scale, (b[3] - b[1]) * scale
    # soft-compress the few high peaks (Guru Shikhar, 1,722 m) so they don't turn into needles at this exaggeration
    demc = np.where(dem > 850, 850 + (dem - 850) * 0.45, dem)
    heights = (np.maximum(demc, 0) * km_per_m * vex).astype(np.float32)
    heights.tofile(OUT / "height.bin")
    # the same ground before the range rises: everything at the gentle 1.6x
    (np.maximum(demc, 0) * km_per_m * 1.6).astype(np.float32).tofile(OUT / "height_flat.bin")

    # ---- the texture
    a = np.asarray(sat.convert("RGB")).astype(np.float32) / 255
    demT = np.asarray(Image.fromarray(dem, mode="F").resize((TW, TH), Image.BICUBIC))
    vexT = np.asarray(Image.fromarray(vex.astype(np.float32), mode="F").resize((TW, TH), Image.BILINEAR))
    px_m = (b[2] - b[0]) * math.cos(lat_mid) / TW
    hs = uk.hillshade(np.maximum(demT, 0) * vexT / 4, px_m, exag=1.0)
    lum = a @ np.array([0.3, 0.59, 0.11], np.float32)
    lum_s = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))).astype(np.float32) / 255
    grey = np.clip((lum_s - 0.45) * 1.15 + 0.52, 0, 1)
    charcoal = np.clip(grey * (0.45 + 0.75 * hs), 0, 1)[..., None] * np.array([0.98, 0.98, 1.0])
    # the Aravalli in colour: the real satellite colour, a touch greener, with the same relief shading
    hillT = np.asarray(Image.fromarray((hill_g * 255).astype(np.uint8)).resize((TW, TH), Image.BILINEAR)).astype(np.float32)[..., None] / 255
    # the highlight: the documentary green laid onto the relief (hard light), so the hills stay readable
    G = np.array([0.36, 0.80, 0.24])
    hl = np.where(G < 0.5, 2 * charcoal * G, 1 - 2 * (1 - charcoal) * (1 - G))
    col = np.clip(hl * 1.05, 0, 1)
    bw = charcoal.copy()
    out = charcoal * (1 - hillT) + col * hillT
    # a soft lime glow on the ground around the range (flat, part of the map)
    glow = np.asarray(Image.fromarray((cor_g * 255).astype(np.uint8)).resize((TW, TH), Image.BILINEAR).filter(ImageFilter.GaussianBlur(30))).astype(np.float32)[..., None] / 255
    glow = glow * 0.6
    out = out + (1 - hillT) * glow * np.array([0.12, 0.22, 0.03])
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    india = next(shape(s_.__geo_interface__).buffer(0) for r, s_ in zip(sf.records(), sf.shapes()) if r["ADMIN"] == "India")
    ind = raster([india], TW, TH, 3)[..., None]
    thar = raster([Polygon(THAR)], TW, TH, 60)[..., None]

    def finish(img_arr, name, hillmask):
        th = thar * (1 - hillmask)
        sand = np.clip(img_arr * np.array([1.35, 1.05, 0.62]) + np.array([0.06, 0.03, 0.0]), 0, 1)
        o = img_arr * (1 - 0.85 * th) + sand * 0.85 * th
        o = o * (0.55 + 0.45 * ind)
        im = Image.fromarray((np.clip(o, 0, 1) * 255).astype(np.uint8))
        d = ImageDraw.Draw(im)
        for poly in (india.geoms if india.geom_type == "MultiPolygon" else [india]):
            d.line([px(x, y, TW, TH) for x, y in poly.exterior.coords], fill=(245, 245, 245), width=5)
        im.filter(ImageFilter.GaussianBlur(0.8)).save(OUT / name, quality=92)

    finish(out, "tex.jpg", hillT)
    finish(bw, "tex_bw.jpg", np.zeros_like(hillT))
    meta = {"box": BOX, "bounds": b, "grid": [GW, GH], "tex": [TW, TH], "size_km": [W_km, H_km], "scale": scale,
            "max_h": float(heights.max()), "ridge": [[x, y] for x, y, _ in RIDGE]}
    (OUT / "meta.json").write_text(json.dumps(meta))
    print(meta["grid"], meta["tex"], [round(v) for v in meta["size_km"]], "max h", round(meta["max_h"], 1))


if __name__ == "__main__":
    main()
