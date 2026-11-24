"""The globe for the Everest Short's drift scene (free data only).

    python3 -I tools/everest/build_globe.py <tile_cache> <ne_dir>

globe_tex.jpg   4096x2048 equirectangular, EOX Sentinel-2 cloudless 2024 z5 (CC BY 4.0) with AWS terrarium relief, graded to the
                Midnight look (tools/everest/build_3d.py grade()).
globe_india.png 4096x2048 equirectangular: R = India (official boundary, Natural Earth India point of view), G = its outline.
globe.json      India's northern edge (max latitude of India per 0.25 deg of longitude, 66-98E) and its centroid.
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
from shapely.geometry import shape

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "tools" / "everest"))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import stitch  # noqa: E402
from build_3d import grade  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
OUT = ROOT / "public" / "everest" / "3d"
W, H = 4096, 2048
R = 6378137.0


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    LAT = 84.0
    sat, b = stitch(5, -180.0, 179.999, -LAT, LAT, cache / "eox")
    dem = uk.dem(3, -180.0, 179.999, -LAT, LAT, cache).astype(np.float32)
    sat = sat.resize((W, round(W * sat.height / sat.width)), Image.LANCZOS)
    tex = grade(sat, dem, 40075016 / W)
    # Web Mercator rows -> equirectangular rows
    m = np.asarray(tex)
    lat = 90 - (np.arange(H) + 0.5) / H * 180
    yM = R * np.log(np.tan(np.pi / 4 + np.radians(np.clip(lat, -LAT, LAT)) / 2))
    row = (b[3] - yM) / (b[3] - b[1]) * (m.shape[0] - 1)
    eq = np.empty((H, W, 3), np.uint8)
    for c in range(3):
        eq[..., c] = ndimage.map_coordinates(m[..., c].astype(np.float32), [np.repeat(row[:, None], W, 1), np.tile(np.linspace(0, m.shape[1] - 1, W), (H, 1))], order=1).clip(0, 255)
    polar = np.abs(lat) > LAT - 0.5
    eq[polar] = (np.array([0.016, 0.055, 0.09]) * 255).astype(np.uint8)
    Image.fromarray(eq).save(OUT / "globe_tex.jpg", quality=92)

    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    india = None
    for r, s_ in zip(sf.records(), sf.shapes()):
        if r["ADMIN"] == "India":
            india = shape(s_.__geo_interface__).buffer(0)
    P = lambda x, y: ((x + 180) / 360 * W, (90 - y) / 180 * H)
    fill = Image.new("L", (W, H), 0)
    line = Image.new("L", (W, H), 0)
    d1, d2 = ImageDraw.Draw(fill), ImageDraw.Draw(line)
    for p in india.geoms:
        d1.polygon([P(x, y) for x, y in p.exterior.coords], fill=255)
        d2.line([P(x, y) for x, y in p.exterior.coords], fill=255, width=3, joint="curve")
    fill = fill.filter(ImageFilter.GaussianBlur(0.8))
    line = line.filter(ImageFilter.GaussianBlur(0.7))
    Image.merge("RGB", [fill, line, Image.new("L", (W, H), 0)]).save(OUT / "globe_india.png")
    # India's northern edge per longitude (the "Asia" shore the Tethys closes against)
    f = np.asarray(fill) > 127
    edge = []
    for lon in np.arange(66.0, 98.01, 0.25):
        c = int((lon + 180) / 360 * W)
        rows = np.nonzero(f[:, max(0, c - 1):c + 2].any(axis=1))[0]
        edge.append(round(90 - rows.min() / H * 180, 2) if len(rows) else None)
    cen = india.representative_point()
    (OUT / "globe.json").write_text(json.dumps({"edge_lon0": 66.0, "edge_step": 0.25, "edge": edge, "india_c": [cen.x, cen.y]}))
    print("globe", eq.shape, "edge points", sum(e is not None for e in edge))


if __name__ == "__main__":
    main()
