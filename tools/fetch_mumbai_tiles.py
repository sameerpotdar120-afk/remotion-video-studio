"""Download and stitch the web-map tiles behind the Mumbai video.

    python3 -I tools/fetch_mumbai_tiles.py <cache_dir>

Satellite: EOX "Sentinel-2 cloudless 2024" (CC BY 4.0, credit: Sentinel-2 cloudless - https://s2maps.eu by EOX IT
Services GmbH, contains modified Copernicus Sentinel data 2024). Three plates, all Web Mercator:
  india.jpg   z7   lon 64..92,      lat 4..34
  konkan.jpg  z11  lon 71.6..74.4,  lat 17.6..20.4
  mumbai.jpg  z14  lon 72.70..73.02, lat 18.84..19.14   (Sentinel-2 is 10 m/px; z14 is ~9 m/px here)
Land mask: OpenStreetMap standard tiles at z15 (ODbL, (c) OpenStreetMap contributors); OSM paints water exactly
#AAD3DF, so the mask is that colour against everything else. Tiles are fetched once, politely, and cached.
"""
import io
import json
import math
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "mumbai" / "maps"
UA = "NullDynastyMapBuilder/1.0 (one-off video map build)"
EOX = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"
OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
R = 6378137.0


def tile_xy(lon: float, lat: float, z: int) -> tuple[float, float]:
    n = 2**z
    la = math.radians(lat)
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(la) + 1 / math.cos(la)) / math.pi) / 2 * n


def fetch(url: str, cache: Path) -> Image.Image:
    if not cache.exists():
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                cache.write_bytes(urllib.request.urlopen(req, timeout=30).read())
                break
            except Exception:
                time.sleep(2 ** (attempt + 1))
        else:
            raise RuntimeError(url)
        time.sleep(0.05)
    return Image.open(io.BytesIO(cache.read_bytes())).convert("RGB")


def stitch(tpl: str, z: int, lon0: float, lon1: float, lat0: float, lat1: float, cache: Path, tag: str):
    """Crop exactly to the lon/lat box; return the image and its Mercator bounds [x0, y0, x1, y1] (y0 south)."""
    fx0, fy0 = tile_xy(lon0, lat1, z)
    fx1, fy1 = tile_xy(lon1, lat0, z)
    tx0, ty0, tx1, ty1 = int(fx0), int(fy0), int(fx1), int(fy1)
    cache.mkdir(parents=True, exist_ok=True)
    big = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            big.paste(fetch(tpl.format(z=z, x=tx, y=ty), cache / f"{tag}_{z}_{tx}_{ty}"), ((tx - tx0) * 256, (ty - ty0) * 256))
    crop = big.crop((round((fx0 - tx0) * 256), round((fy0 - ty0) * 256), round((fx1 - tx0) * 256), round((fy1 - ty0) * 256)))
    b = [R * math.radians(lon0), R * math.log(math.tan(math.pi / 4 + math.radians(lat0) / 2)),
         R * math.radians(lon1), R * math.log(math.tan(math.pi / 4 + math.radians(lat1) / 2))]
    return crop, b


def main() -> None:
    cache = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for name, z, box in [("india", 7, (64, 92, 4, 34)), ("konkan", 11, (71.6, 74.4, 17.6, 20.4)), ("mumbai", 14, (72.70, 73.02, 18.84, 19.14))]:
        im, b = stitch(EOX, z, *box, cache / "eox", "eox")
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        meta[name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        print(name, im.size)
    # land mask over the island city and harbour (z15, ~4.5 m/px)
    osm, b = stitch(OSM, 15, 72.76, 72.92, 18.87, 19.08, cache / "osm", "osm")
    a = np.asarray(osm, np.int16)
    water = (np.abs(a - np.array([170, 211, 223])).sum(2) < 18)
    Image.fromarray(((~water) * 255).astype(np.uint8)).save(cache / "land_mask.png")
    meta["mask"] = {"bounds": [round(v, 1) for v in b], "w": osm.width, "h": osm.height}
    # coarser mask over the whole Mumbai plate (Salsette, Trombay, the mainland), z14
    osm, b = stitch(OSM, 14, 72.70, 73.02, 18.84, 19.14, cache / "osm", "osm")
    a = np.asarray(osm, np.int16)
    water = (np.abs(a - np.array([170, 211, 223])).sum(2) < 18)
    Image.fromarray(((~water) * 255).astype(np.uint8)).save(cache / "land_mask_wide.png")
    meta["mask_wide"] = {"bounds": [round(v, 1) for v in b], "w": osm.width, "h": osm.height}
    (cache / "tiles_meta.json").write_text(json.dumps(meta, indent=1))
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
