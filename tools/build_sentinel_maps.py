"""Build the North Sentinel map plates (Web Mercator, EPSG:3857).

    python3 tools/build_sentinel_maps.py <input_dir>

<input_dir> holds the creator's asset pack: map_world.jpg (NASA BMNG July 2004
topo+bathy, 21600x10800 equirectangular) and the EOX plates + metadata under
NorthSentinel_03_Maps_Data_Font/. Writes public/sentinel/maps/*.jpg and plates.json.

- world:    NASA reprojected to Mercator, lon 30..150, lat 55..-45
- andaman:  EOX land (masked by OSM island outlines, reefs kept) over NASA ocean;
            the raw EOX plate has flat no-data patches and a cloudy mosaic seam
- region / sentinel: EOX plates as delivered (lossless masters)
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sentinel" / "maps"
GEO = ROOT / "public" / "sentinel" / "geo"
R = 6378137.0


def merc(lon: float, lat: float) -> tuple[float, float]:
    return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def inv_lat(y: np.ndarray) -> np.ndarray:
    return np.degrees(2 * np.arctan(np.exp(y / R)) - np.pi / 2)


def sample_world(world: np.ndarray, crop: tuple[float, float], bounds: tuple[float, float, float, float], w: int, h: int) -> np.ndarray:
    """Bilinear sample of the (cropped) equirectangular NASA image onto a Mercator grid, in row chunks."""
    x0, y0, x1, y1 = bounds
    lon0, lat0 = crop  # top-left of the crop in degrees; NASA is 60 px per degree
    H, W = world.shape[:2]
    lon = np.degrees((x0 + (np.arange(w) + 0.5) / w * (x1 - x0)) / R)
    px = (lon - lon0) * 60 - 0.5
    ix = np.floor(px).astype(int)
    fx = (px - ix)[None, :, None].astype(np.float32)
    ix0, ix1 = np.clip(ix, 0, W - 1), np.clip(ix + 1, 0, W - 1)
    out = np.empty((h, w, 3), np.uint8)
    for r0 in range(0, h, 256):
        rows = np.arange(r0, min(h, r0 + 256))
        lat = inv_lat(y1 - (rows + 0.5) / h * (y1 - y0))
        py = (lat0 - lat) * 60 - 0.5
        iy = np.floor(py).astype(int)
        fy = (py - iy)[:, None, None].astype(np.float32)
        iy0, iy1 = np.clip(iy, 0, H - 1), np.clip(iy + 1, 0, H - 1)
        a = world[iy0][:, ix0] * (1 - fx) + world[iy0][:, ix1] * fx
        b = world[iy1][:, ix0] * (1 - fx) + world[iy1][:, ix1] * fx
        out[rows] = np.clip(a * (1 - fy) + b * fy, 0, 255).astype(np.uint8)
    return out


def polys(path: Path) -> list[list[tuple[float, float]]]:
    out = []
    for f in json.load(open(path))["features"]:
        g = f["geometry"]
        parts = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for p in parts:
            out.append(p[0])
    return out


def main() -> None:
    src = Path(sys.argv[1])
    data = src / "NorthSentinel_03_Maps_Data_Font" / "sentinel"
    meta = json.load(open(data / "public" / "sentinel" / "img" / "map_metadata.json"))
    OUT.mkdir(parents=True, exist_ok=True)
    plates = {}

    # crop NASA to lon 25..155, lat 60..-50 (60 px per degree) and keep it uint8
    CROP = (25.0, 60.0)
    world = np.asarray(Image.open(src / "map_world.jpg").crop((205 * 60, 30 * 60, 335 * 60, 140 * 60)))

    # world plate
    x0, y1 = merc(30, 55)
    x1, y0 = merc(150, -45)
    w = 7200
    h = int(round(w * (y1 - y0) / (x1 - x0)))
    img = Image.fromarray(sample_world(world, CROP, (x0, y0, x1, y1), w, h))
    img.save(OUT / "world.jpg", quality=92)
    img.resize((w // 3, h // 3), Image.LANCZOS).save(OUT / "world_small.jpg", quality=90)
    del img
    plates["world"] = {"bounds": [x0, y0, x1, y1], "w": w, "h": h}
    print("world", w, h)

    # andaman: EOX land on NASA ocean
    m = meta["map_andaman"]
    ax0, ay0, ax1, ay1 = m["bounds_meters"]
    aw, ah = m["width"], m["height"]
    eox = np.asarray(Image.open(data / "masters" / "map_andaman_master.png").convert("RGB"), dtype=np.float32)
    ocean = Image.fromarray(sample_world(world, CROP, (ax0, ay0, ax1, ay1), aw, ah))
    ocean = np.asarray(ocean.filter(ImageFilter.GaussianBlur(18)), dtype=np.float32)
    # match the ocean tone to the clean EOX region plate so plates blend
    reg = np.asarray(Image.open(data / "masters" / "map_region_master.png").convert("RGB"), dtype=np.float32)
    reg_ocean = reg[:300, :600].reshape(-1, 3).mean(0)
    matched = ocean * (reg_ocean / ocean.reshape(-1, 3).mean(0))
    # centre of the plate takes the EOX ocean tone, its edges return to raw NASA so it meets the world plate seamlessly
    yy, xx = np.mgrid[0:ah, 0:aw].astype(np.float32)
    edge = np.minimum(np.minimum(xx, aw - 1 - xx) / aw, np.minimum(yy, ah - 1 - yy) / ah)
    wgt = np.clip((edge - 0.04) / 0.22, 0, 1)[..., None] ** 1.5
    ocean = matched * wgt + ocean * (1 - wgt)
    mask = Image.new("L", (aw, ah), 0)
    d = ImageDraw.Draw(mask)
    for p in polys(GEO / "geo_andaman.json"):
        pts = [((merc(lo, la)[0] - ax0) / (ax1 - ax0) * aw, (ay1 - merc(lo, la)[1]) / (ay1 - ay0) * ah) for lo, la in p]
        if len(pts) > 2:
            d.polygon(pts, fill=255)
    # keep the fringing reefs: grow the mask ~700 m, then feather
    px_m = (ax1 - ax0) / aw
    grow = int(700 / px_m) | 1
    mask = mask.filter(ImageFilter.MaxFilter(min(grow, 31))).filter(ImageFilter.GaussianBlur(4))
    k = (np.asarray(mask, dtype=np.float32) / 255)[..., None]
    # Little Andaman (south of 11.2 N) is under cloud in the EOX mosaic: use sharp NASA there
    nasa = np.asarray(Image.fromarray(sample_world(world, CROP, (ax0, ay0, ax1, ay1), aw, ah)), dtype=np.float32)
    cloudy = (np.arange(ah)[:, None, None] > (ay1 - merc(0, 11.2)[1]) / (ay1 - ay0) * ah).astype(np.float32)
    land = eox * (1 - cloudy) + nasa * cloudy
    out = land * k + ocean * (1 - k)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(OUT / "andaman.jpg", quality=92)
    plates["andaman"] = {"bounds": [ax0, ay0, ax1, ay1], "w": aw, "h": ah}

    for name in ["region", "sentinel"]:
        m = meta[f"map_{name}"]
        Image.open(data / "masters" / f"map_{name}_master.png").convert("RGB").save(OUT / f"{name}.jpg", quality=93)
        plates[name] = {"bounds": m["bounds_meters"], "w": m["width"], "h": m["height"]}

    (OUT / "plates.json").write_text(json.dumps(plates, indent=1))
    print(json.dumps(plates))


if __name__ == "__main__":
    main()
