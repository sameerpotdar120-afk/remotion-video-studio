"""Cut the real Teesta valley out of the video's terrain data for the Blender shots (system python, needs PIL).

    python3 -I tools/blender/prep_teesta.py

Inputs: public/sikkim/maps/valley_hrg.png (AWS Terrain Tiles / SRTM heights, 16-bit packed in R,G) and valley_tex.jpg
(EOX Sentinel-2 cloudless 2024, CC BY 4.0), with their bounds from src/sikkim/geo.json. Output, in
tools/blender/data/: teesta_h.npy (heights in metres, upsampled 3x with bicubic), teesta_tex.jpg (the matching image)
and teesta.json (bounds, metres per pixel, the route and stations in local metres: x east, y north, from the crop's
centre).
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tools" / "blender" / "data"
LON0, LON1, LAT0, LAT1 = 88.395, 88.505, 26.955, 27.115  # Riyang to just above Melli: the deep middle of the gorge
UP = 3


def main() -> None:
    g = json.loads((ROOT / "src" / "sikkim" / "geo.json").read_text())
    t = g["terrain"]
    lo0, la0, lo1, la1 = t["ll"]
    a = np.asarray(Image.open(ROOT / "public/sikkim/maps/valley_hrg.png").convert("RGB")).astype(np.float64)
    h = (a[..., 0] * 256 + a[..., 1]) / 65535 * (t["hmax"] - t["hmin"]) + t["hmin"]
    H, W = h.shape

    def px(lon, lat, w, hh):
        return (lon - lo0) / (lo1 - lo0) * (w - 1), (la1 - lat) / (la1 - la0) * (hh - 1)

    x0, y0 = px(LON0, LAT1, W, H)
    x1, y1 = px(LON1, LAT0, W, H)
    x0, y0, x1, y1 = int(x0), int(y0), int(np.ceil(x1)), int(np.ceil(y1))
    crop = Image.fromarray(h[y0:y1 + 1, x0:x1 + 1].astype(np.float32), mode="F")
    up = crop.resize((crop.width * UP, crop.height * UP), Image.BICUBIC)
    hh = np.asarray(up, dtype=np.float32)
    np.save(OUT / "teesta_h.npy", hh)
    mpp_x = t["w_m"] / (W - 1) / UP
    mpp_y = t["h_m"] / (H - 1) / UP
    # the matching image
    tex = Image.open(ROOT / "public/sikkim/maps/valley_tex.jpg").convert("RGB")
    tx0, ty0 = px(lo0 + (x0 / (W - 1)) * (lo1 - lo0), la1 - (y0 / (H - 1)) * (la1 - la0), tex.width, tex.height)
    tx1, ty1 = px(lo0 + (x1 / (W - 1)) * (lo1 - lo0), la1 - (y1 / (H - 1)) * (la1 - la0), tex.width, tex.height)
    tex.crop((int(tx0), int(ty0), int(tx1), int(ty1))).save(OUT / "teesta_tex.jpg", quality=92)
    # local metres: x east, y north, from the crop centre
    w_m, h_m = (hh.shape[1] - 1) * mpp_x, (hh.shape[0] - 1) * mpp_y
    clon, clat = lo0 + ((x0 + x1) / 2 / (W - 1)) * (lo1 - lo0), la1 - ((y0 + y1) / 2 / (H - 1)) * (la1 - la0)
    mx = t["w_m"] / (lo1 - lo0)
    my = t["h_m"] / (la1 - la0)

    def local(lon, lat):
        return [round((lon - clon) * mx, 1), round((lat - clat) * my, 1)]

    meta = {"shape": list(hh.shape), "mpp": [mpp_x, mpp_y], "size_m": [w_m, h_m], "centre_ll": [clon, clat],
            "route": [local(lo, la) for lo, la in g["route_ll"]],
            "stations": {"Riyang": local(88.4480, 26.9560), "Teesta Bazar": local(88.4366, 27.0503), "Melli": local(88.4486, 27.0875)},
            "hmin": float(hh.min()), "hmax": float(hh.max())}
    (OUT / "teesta.json").write_text(json.dumps(meta))
    print(hh.shape, round(w_m), round(h_m), round(float(hh.min())), round(float(hh.max())))


if __name__ == "__main__":
    main()
