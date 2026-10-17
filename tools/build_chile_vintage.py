"""The vintage paper map for the Chile video's history scenes (like an old atlas, from the Americas across to Spain): tan land, teal sea, paper grain,
inked coastlines. Drawn from Natural Earth (public domain) on a Web Mercator grid; no imagery.

    python3 -I tools/build_chile_vintage.py <ne_dir>
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
from shapely.geometry import box, shape

ROOT = Path(__file__).resolve().parent.parent
R = 6378137.0
LON0, LON1, LAT0, LAT1 = -125.0, 8.0, -62.0, 47.0
W = 4096


def mx(lon): return R * math.radians(lon)
def my(lat): return R * math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2))


def main() -> None:
    ne = Path(sys.argv[1])
    x0, x1, y0, y1 = mx(LON0), mx(LON1), my(LAT0), my(LAT1)
    H = round(W * (y1 - y0) / (x1 - x0))
    px = lambda x, y: ((x - x0) / (x1 - x0) * W, (y1 - y) / (y1 - y0) * H)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    land = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(land)
    clip = box(LON0 - 5, LAT0 - 5, LON1 + 5, LAT1 + 5)
    for s in sf.shapes():
        g = shape(s.__geo_interface__).intersection(clip)
        for p in (g.geoms if hasattr(g, "geoms") else [g]):
            if p.geom_type != "Polygon" or p.area < 0.01:
                continue
            p = p.simplify(0.02)
            d.polygon([px(mx(a), my(b)) for a, b in p.exterior.coords], fill=255)
    m = np.asarray(land).astype(np.float32) / 255
    rng = np.random.default_rng(7)
    grain = ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 1.2) * 6
    blot = ndimage.gaussian_filter(rng.standard_normal((H // 8, W // 8)).astype(np.float32), 6)
    blot = np.asarray(Image.fromarray(((blot - blot.min()) / (np.ptp(blot) + 1e-6) * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
    sea = np.array([104, 150, 150], np.float32)
    tan = np.array([219, 188, 145], np.float32)
    out = sea * (1 - m[..., None]) + tan * m[..., None]
    out += (blot[..., None] - 0.5) * np.array([26, 22, 16]) + grain[..., None]
    # a darker inked coast and a pale halo on the water side
    edge = ndimage.binary_dilation(m > 0.5, iterations=2) & ~ndimage.binary_erosion(m > 0.5, iterations=1)
    halo = ndimage.gaussian_filter((m > 0.5).astype(np.float32), 6) * (1 - m)
    out = out * (1 - 0.35 * edge[..., None]) + np.array([90, 60, 35]) * 0.35 * edge[..., None]
    out += halo[..., None] * np.array([18, 16, 10])
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - 0.18 * (((xx / W - 0.5) ** 2 + (yy / H - 0.5) ** 2) * 2.2)
    out *= vig[..., None]
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).filter(ImageFilter.SMOOTH).save(ROOT / "public" / "chile" / "maps" / "vintage_sat.jpg", quality=90)
    g = json.loads((ROOT / "src" / "chile" / "geo.json").read_text())
    g["plates"]["vintage"] = {"bounds": [round(v, 1) for v in (x0, y0, x1, y1)], "w": W, "h": H}
    (ROOT / "src" / "chile" / "geo.json").write_text(json.dumps(g, separators=(",", ":")))
    print("vintage", W, H)


if __name__ == "__main__":
    main()
