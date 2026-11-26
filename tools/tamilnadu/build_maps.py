"""Plates, vectors and the campus for the Tamil Nadu letters Short (free data only).

    python3 -I tools/tamilnadu/build_maps.py <tile_cache> <ne_dir> <osm_xml> [<osm_xml> ...]

- Plates (Web Mercator, coarse to fine): India (copied from the Brands Short), Tamil Nadu, Thanjavur. EOX Sentinel-2
  cloudless 2024 (CC BY 4.0) graded with AWS terrarium relief (tools/build_ukweather_maps.py), softened; the edit turns
  them black and white.
- Campus ground: EOX Sentinel-2 at z16 around the Tamil University ring (10 m data, so soft), black and white, with
  OpenStreetMap roads and the other campus buildings drawn on top (ODbL, "© OpenStreetMap contributors").
- The five letter buildings (த மி ழ் நா டு, clockwise from the north) come from their OpenStreetMap footprints, in local
  metres east/north of the ring's centre (the library, not mapped in OSM).
- Tamil Nadu from Natural Earth admin-1, India from the India point-of-view admin-0 (official boundary).
"""
import glob
import json
import math
import shutil
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "tamilnadu" / "maps"
uk.ImageFilter.UnsharpMask = lambda **k: ImageFilter.GaussianBlur(0.5)  # type: ignore[attr-defined]

PLATES = [("tn", 9, 8, 75.6, 80.8, 7.8, 13.8), ("tnj", 12, 10, 78.55, 79.65, 10.25, 11.2)]
CENTER = (79.0947, 10.7397)  # the ring's centre (the library)
LETTERS = {  # letter: (approx centroid lon, lat) of its OSM footprint; read clockwise from the north
    "த": (79.0940, 10.7422), "மி": (79.0967, 10.7410), "ழ்": (79.0965, 10.7379), "நா": (79.09354, 10.73724), "டு": (79.09192, 10.73998),
}
PLACES = {"thanjavur": (79.137, 10.787), "chennai": (80.27, 13.08), "campus": CENTER}
M_LON = 111320 * math.cos(math.radians(CENTER[1]))
M_LAT = 110600


def local(lon: float, lat: float) -> tuple[float, float]:
    return ((lon - CENTER[0]) * M_LON, (lat - CENTER[1]) * M_LAT)


def osm(paths):
    nodes, ways = {}, {}
    for p in paths:
        r = ET.parse(p).getroot()
        for n in r.iter("node"):
            nodes[n.get("id")] = (float(n.get("lon")), float(n.get("lat")))
        for w in r.iter("way"):
            t = {x.get("k"): x.get("v") for x in w.findall("tag")}
            ways[w.get("id")] = (t, [nd.get("ref") for nd in w.findall("nd")])
    return {k: (t, [nodes[r] for r in refs if r in nodes]) for k, (t, refs) in ways.items()}


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    W = osm(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    uk.OUT = OUT
    gj = ROOT / "src" / "tamilnadu" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    shutil.copy(ROOT / "public" / "brands" / "maps" / "india_geo.jpg", OUT / "india_geo.jpg")
    geo["plates"]["india"] = json.loads((ROOT / "src" / "brands" / "geo.json").read_text())["plates"]["india"]
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if name not in geo["plates"]:
            geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
            print(name, geo["plates"][name], flush=True)
    geo["order"] = ["india", "tn", "tnj"]

    # the campus ground: Sentinel-2 at z16 (soft), black and white, with OSM roads and the other buildings
    R = 1150.0  # half-size in metres
    lo0, lo1 = CENTER[0] - R / M_LON, CENTER[0] + R / M_LON
    la0, la1 = CENTER[1] - R / M_LAT, CENTER[1] + R / M_LAT
    sat, _ = stitch(16, lo0, lo1, la0, la1, cache / "eox")
    N = 2048
    g = sat.convert("L").resize((N, N), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(g).astype(np.float32) / 255
    a = np.clip((a - 0.08) * 1.3, 0, 1) ** 1.0 * 0.86  # dark documentary ground
    rng = np.random.default_rng(7)
    canopy = Image.fromarray((rng.random((N // 8, N // 8)) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
    a = a * (0.86 + 0.28 * np.asarray(canopy).astype(np.float32) / 255)
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).convert("RGB")
    d = ImageDraw.Draw(im, "RGBA")
    px = lambda lon, lat: ((lon - lo0) / (lo1 - lo0) * N, (la1 - lat) / (la1 - la0) * N)
    letter_ids = {}
    for k, (t, pts) in W.items():
        if len(pts) < 2:
            continue
        if "highway" in t and t["highway"] not in ("footway", "path", "steps"):
            wdt = 5 if t["highway"] in ("trunk", "primary", "secondary") else 3
            d.line([px(*p) for p in pts], fill=(150, 150, 150, 120), width=wdt)
    for k, (t, pts) in W.items():
        if "building" not in t or len(pts) < 4:
            continue
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        near = min(LETTERS, key=lambda L: math.hypot(*np.subtract(local(cx, cy), local(*LETTERS[L]))))
        if math.hypot(*np.subtract(local(cx, cy), local(*LETTERS[near]))) < 75:
            letter_ids.setdefault(near, []).append(k)
            continue
        d.polygon([px(*p) for p in pts], fill=(120, 120, 120, 150))
    im.save(OUT / "campus_ground.jpg", quality=90)
    geo["campus"] = {"half": R, "center": CENTER, "ground": "campus_ground.jpg"}
    geo["letters"] = {}
    for L, (lon, lat) in LETTERS.items():
        parts = [[[round(v, 1) for v in local(*p)] for p in W[k][1]] for k in letter_ids.get(L, [])]
        allp = [q for part in parts for q in part]
        c = [sum(q[0] for q in allp) / len(allp), sum(q[1] for q in allp) / len(allp)]
        geo["letters"][L] = {"parts": parts, "c": [round(c[0], 1), round(c[1], 1)]}
        print(L, len(parts), "parts, centre", [round(v) for v in c], "r", round(math.hypot(*c)))

    a1 = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))[0])
    tn = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in zip(a1.records(), a1.shapes()) if r["adm0_a3"] == "IND" and r["name"] == "Tamil Nadu"])
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["countries"] = {"India": rings(C["India"], 0.01, 0.003)}
    geo["states"] = {"Tamil Nadu": rings(tn, 0.004, 0.0005)}
    geo["places"] = {k: [round(mx(x)), round(my(y))] for k, (x, y) in PLACES.items()}
    gj.write_text(json.dumps(geo, ensure_ascii=False, separators=(",", ":")))
    print("geo kB", gj.stat().st_size // 1024)


if __name__ == "__main__":
    main()
