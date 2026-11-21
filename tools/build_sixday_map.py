"""Map world for the Six-Day War (1967) long video and its six Shorts (free data only).

    python3 -I tools/build_sixday_map.py <tile_cache> <ne_dir> <ne_lakes_dir>

One tilted 3D map, drawn in the shader from distance fields so coasts and borders stay sharp in 4K close-ups:
- Countries: Natural Earth 10 m admin-0, India point-of-view edition (public domain). 1967 regions are split out of it:
  Sinai (Egypt east of the canal), Gaza and the West Bank (the two parts of "Palestine"), East Jerusalem (a small
  approximate polygon moved from Israel to the West Bank), and the Golan Heights (an approximate polygon of the land
  taken in 1967, cut out of Syria).
- Lakes: Natural Earth 10 m lakes, plus Lake Timsah and the Little Bitter Lake drawn by hand (approximate).
- Rivers: Natural Earth 10 m rivers (Nile, Jordan, Yarmouk ...) and the Suez Canal drawn as a line.
- Heights: AWS Terrain Tiles, terrarium (SRTM/NASA; open data), zoom 9.

Writes public/sixday/map/:
- sdf.png  RGBA, linear: R coast (signed, land > 128, 2 px per step), G pre-war borders, B post-war (10 June 1967)
  borders, A every region line (8 steps per px, 0 = on the line).
- aux.png  RGBA, linear: R rivers + canal (8 steps per px), G the canal only, B/A unused.
- ids.png  L, nearest: region id (see IDS).
- height.bin float32 GH x GW, metres (water and sub-sea-level land compressed), north row first.
- meta.json bounds, sizes, ids and places.
"""
import glob
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw
from scipy import ndimage
from shapely.geometry import LineString, MultiPolygon, Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sixday" / "map"
LON0, LON1, LAT0, LAT1 = 28.0, 40.0, 26.0, 35.6
TW = 6144
TH = round(TW * (LAT1 - LAT0) / ((LON1 - LON0) * math.cos(math.radians(30.8))))
GW = 1024
GH = round(GW * TH / TW)
IDS = {"water": 0, "egypt": 1, "sinai": 2, "gaza": 3, "israel": 4, "westbank": 5, "golan": 6, "jordan": 7, "syria": 8,
       "lebanon": 9, "saudi": 10, "other": 11}
PRE = {1: 1, 2: 1, 3: 1, 4: 4, 5: 7, 7: 7, 6: 8, 8: 8, 9: 9, 10: 10}       # 4 June 1967: who holds what
POST = {1: 1, 2: 4, 3: 4, 4: 4, 5: 4, 7: 7, 6: 4, 8: 8, 9: 9, 10: 10}      # 10 June 1967
SINAI_CUT = Polygon([(32.30, 31.9), (32.30, 31.27), (32.33, 30.9), (32.28, 30.6), (32.35, 30.45), (32.40, 30.30),
                     (32.56, 29.95), (32.6, 29.7), (33.0, 29.0), (33.6, 28.0), (34.3, 27.5), (35.6, 27.5), (35.6, 31.9)])
GOLAN = Polygon([(35.640, 32.700), (35.645, 32.760), (35.640, 32.820), (35.630, 32.880), (35.645, 32.930), (35.620, 33.000),
                 (35.625, 33.090), (35.640, 33.210), (35.660, 33.250), (35.720, 33.300), (35.810, 33.330), (35.870, 33.330),
                 (35.900, 33.270), (35.870, 33.200), (35.860, 33.120), (35.880, 33.040), (35.920, 32.960), (35.900, 32.860),
                 (35.860, 32.760), (35.790, 32.710), (35.700, 32.690)])
EAST_JERUSALEM = Polygon([(35.222, 31.770), (35.226, 31.790), (35.235, 31.805), (35.255, 31.800), (35.262, 31.780),
                          (35.250, 31.760), (35.232, 31.762)])
TIMSAH = Polygon([(32.265, 30.555), (32.285, 30.575), (32.31, 30.580), (32.33, 30.565), (32.315, 30.548), (32.285, 30.545)])
LITTLE_BITTER = Polygon([(32.455, 30.262), (32.49, 30.255), (32.545, 30.17), (32.535, 30.145), (32.505, 30.16), (32.46, 30.235)])
CANAL = [(32.305, 31.265), (32.315, 31.10), (32.33, 30.90), (32.31, 30.70), (32.30, 30.585), (32.33, 30.548),
         (32.35, 30.45), (32.37, 30.40), (32.46, 30.25), (32.53, 30.15), (32.56, 30.03), (32.55, 29.95)]
PLACES = {
    "cairo": (31.236, 30.044), "alexandria": (29.92, 31.20), "port_said": (32.30, 31.26), "ismailia": (32.27, 30.60),
    "suez": (32.55, 29.97), "el_arish": (33.80, 31.13), "rafah": (34.25, 31.29), "khan_yunis": (34.30, 31.34),
    "gaza": (34.46, 31.50), "abu_ageila": (34.10, 30.83), "bir_gifgafa": (33.13, 30.41), "mitla": (32.95, 29.98),
    "giddi": (33.10, 30.22), "nakhl": (33.75, 29.92), "sharm": (34.33, 27.91), "tiran": (34.46, 27.98),
    "tiran_island": (34.53, 27.94), "eilat": (34.95, 29.56), "aqaba": (35.00, 29.53), "tel_aviv": (34.78, 32.08),
    "haifa": (34.99, 32.79), "netanya": (34.86, 32.33), "tulkarm": (35.03, 32.31), "jerusalem": (35.23, 31.78),
    "ramallah": (35.20, 31.90), "latrun": (34.98, 31.84), "bethlehem": (35.20, 31.70), "hebron": (35.10, 31.53),
    "jenin": (35.30, 32.46), "nablus": (35.26, 32.22), "jericho": (35.44, 31.86), "amman": (35.93, 31.95),
    "mafraq": (36.21, 32.34), "damascus": (36.29, 33.51), "kuneitra": (35.82, 33.13), "hermon": (35.86, 33.42),
    "tiberias": (35.53, 32.79), "galilee": (35.59, 32.82), "beirut": (35.50, 33.89), "dead_sea": (35.50, 31.50),
    "great_bitter_lake": (32.38, 30.33), "lake_timsah": (32.30, 30.565), "dan": (35.65, 33.25),
    "cairo_west": (30.92, 30.12), "inshas": (31.45, 30.35), "abu_suweir": (32.10, 30.56), "fayid": (32.32, 30.33),
    "kabrit": (32.48, 30.24), "bir_thamada": (33.47, 30.17), "beni_suef": (31.08, 29.03), "el_arish_af": (33.84, 31.07),
    "jebel_libni": (33.70, 30.67), "hurghada": (33.80, 27.18), "mansoura": (31.38, 31.04), "cairo_intl": (31.40, 30.12),
    "damascus_af": (36.51, 33.41), "dumayr": (36.75, 33.61), "seikal": (37.20, 33.68), "marj_ruhayyil": (36.46, 33.29),
    "amman_af": (35.99, 31.97), "mafraq_af": (36.27, 32.36), "h3": (40.00, 33.0), "ramat_david": (35.18, 32.67),
    "hatzor": (34.73, 31.76), "tel_nof": (34.82, 31.84),
}


def px(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * TW, (LAT1 - lat) / (LAT1 - LAT0) * TH)


def rings(g):
    for p in getattr(g, "geoms", [g]):
        if p.geom_type == "Polygon" and not p.is_empty:
            yield p


def fill(geoms, val, im):
    d = ImageDraw.Draw(im)
    for g in geoms:
        for p in rings(g):
            d.polygon([px(*c) for c in p.exterior.coords], fill=val)
            for h in p.interiors:
                d.polygon([px(*c) for c in h.coords], fill=0)


def sdf_edge(ids, groups):
    """Distance in px to the nearest pixel edge where the group changes (water excluded from 'changes')."""
    g = np.zeros_like(ids, np.int16)
    for k, v in groups.items():
        g[ids == k] = v
    g[ids == 0] = -1
    edge = np.zeros(ids.shape, bool)
    for a, b in ((g[:, 1:], g[:, :-1]), (g[1:, :], g[:-1, :])):
        e = (a != b) & (a >= 0) & (b >= 0)
        if a.shape[1] != g.shape[1]:
            edge[:, 1:] |= e
            edge[:, :-1] |= e
        else:
            edge[1:, :] |= e
            edge[:-1, :] |= e
    return ndimage.gaussian_filter(ndimage.distance_transform_edt(~edge).astype(np.float32), 1.2)


def enc(d, k, signed=False):
    return np.clip((128 if signed else 0) + d * k, 0, 255).round().astype(np.uint8)


def main() -> None:
    cache, ne, nel = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    OUT.mkdir(parents=True, exist_ok=True)
    B = box(LON0 - 1, LAT0 - 1, LON1 + 1, LAT1 + 1)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind.shp"))[0])
    c = {}
    for r, s_ in zip(sf.records(), sf.shapes()):
        g = shape(s_.__geo_interface__).buffer(0)
        if g.intersects(B):
            c[r["ADM0_A3"]] = g.intersection(B)
    lakes = [shape(s.__geo_interface__).buffer(0) for s in shapefile.Reader(str(nel / "ne_10m_lakes.shp")).shapes()
             if shape(s.__geo_interface__).intersects(B)] + [TIMSAH, LITTLE_BITTER]
    water = unary_union(lakes)
    sinai = c["EGY"].intersection(SINAI_CUT)
    egypt = c["EGY"].difference(SINAI_CUT)
    psx = list(rings(c["PSX"]))
    gaza = unary_union([p for p in psx if p.centroid.x < 34.7])
    wb = unary_union([p for p in psx if p.centroid.x >= 34.7] + [EAST_JERUSALEM.intersection(c["ISR"])])
    israel = c["ISR"].difference(EAST_JERUSALEM)
    golan = GOLAN.intersection(c["SYR"])
    syria = c["SYR"].difference(GOLAN)
    regions = [("egypt", egypt), ("sinai", sinai), ("gaza", gaza), ("israel", israel), ("westbank", wb), ("golan", golan),
               ("jordan", c["JOR"]), ("syria", syria), ("lebanon", c["LBN"]), ("saudi", c["SAU"])]
    others = [g for k, g in c.items() if k not in ("EGY", "PSX", "ISR", "SYR", "JOR", "LBN", "SAU")]
    print("golan km2", round(golan.area * 111.32 ** 2 * math.cos(math.radians(33)), 0),
          "sinai km2", round(sinai.area * 111.32 ** 2 * math.cos(math.radians(29.5)), 0))

    # ---- region ids (others get their own ids 20.. so their mutual borders still draw)
    im = Image.new("L", (TW, TH), 0)
    for i, g in enumerate(others):
        fill([g], 20 + i, im)
    for name, g in regions:
        fill([g], IDS[name], im)
    fill([water], 0, im)
    ids = np.asarray(im).copy()
    oth = {20 + i: 20 + i for i in range(len(others))}
    print("ids", np.unique(ids))

    # ---- coast (signed), borders
    land = ids > 0
    dout = ndimage.distance_transform_edt(~land)
    din = ndimage.distance_transform_edt(land)
    coast = ndimage.gaussian_filter(np.where(land, din - 0.5, -(dout - 0.5)).astype(np.float32), 1.4)  # smooth the pixel stairs
    fine = {**{k: k for k in list(range(1, 12)) + list(oth)}, 2: 1}  # no line between Sinai and the rest of Egypt
    pre = sdf_edge(ids, {**PRE, **oth})
    post = sdf_edge(ids, {**POST, **oth})
    every = sdf_edge(ids, fine)
    Image.fromarray(np.dstack([enc(coast, 2, True), enc(pre, 8), enc(post, 8), enc(every, 8)]), "RGBA").save(OUT / "sdf.png", optimize=True)
    del dout, din, pre, post, every

    # ---- rivers + canal
    rv = shapefile.Reader(str(ne / "ne_10m_rivers_lake_centerlines_scale_rank.shp"))
    riv = Image.new("L", (TW, TH), 0)
    d = ImageDraw.Draw(riv)
    names = set()
    for r, s_ in zip(rv.records(), rv.shapes()):
        g = shape(s_.__geo_interface__)
        if not g.intersects(B):
            continue
        names.add(r["name"])
        if r["name"] in ("Suez Canal", "Ismailiya Canal", "Euphrates", "Al Furat", "Ceyhan"):
            continue  # the canal is drawn below; the freshwater canal would read as a second Suez
        for ln in getattr(g, "geoms", [g]):
            d.line([px(*q) for q in ln.coords], fill=255, width=1)
    print("rivers", sorted(n for n in names if n))
    can = Image.new("L", (TW, TH), 0)
    ImageDraw.Draw(can).line([px(*q) for q in CANAL], fill=255, width=1)
    ImageDraw.Draw(riv).line([px(*q) for q in CANAL], fill=255, width=1)
    dr = ndimage.gaussian_filter(ndimage.distance_transform_edt(np.asarray(riv) == 0).astype(np.float32), 1.0)
    dc = ndimage.gaussian_filter(ndimage.distance_transform_edt(np.asarray(can) == 0).astype(np.float32), 1.0)
    Image.fromarray(np.dstack([enc(dr, 8), enc(dc, 8), np.zeros_like(ids), np.full_like(ids, 255)]), "RGBA").save(OUT / "aux.png", optimize=True)
    Image.fromarray(ids, "L").save(OUT / "ids.png", optimize=True)

    # ---- heights (metres) on a GW x GH grid in this map's plate carree
    dem = uk.dem(9, LON0, LON1, LAT0, LAT1, cache)
    dem = ndimage.gaussian_filter(ndimage.median_filter(dem, 3), 0.7)
    lon = np.linspace(LON0, LON1, GW)
    lat = np.linspace(LAT1, LAT0, GH)
    R = 6378137.0
    my = lambda la: np.log(np.tan(np.pi / 4 + np.radians(la) / 2))  # noqa: E731
    gy = (my(LAT1) - my(lat)) / (my(LAT1) - my(LAT0)) * (dem.shape[0] - 1)
    gx = (lon - LON0) / (LON1 - LON0) * (dem.shape[1] - 1)
    Y, X = np.meshgrid(gy, gx, indexing="ij")
    h = ndimage.map_coordinates(dem, [Y, X], order=1, mode="nearest").astype(np.float32)
    lm = np.asarray(Image.fromarray(land.astype(np.uint8) * 255).resize((GW, GH), Image.BILINEAR)) / 255.0
    h = np.where(h < 0, h * 0.3, h)                 # Dead Sea / Jordan valley: keep the dip, compress it
    h = np.where(lm > 0.5, np.maximum(h, -140), 0)  # water flat
    h.astype(np.float32).tofile(OUT / "height.bin")
    _ = R

    kx = 111.32 * math.cos(math.radians(30.8))
    meta = {"bounds": [LON0, LON1, LAT0, LAT1], "tex": [TW, TH], "grid": [GW, GH], "kx": kx, "ky": 111.32,
            "center": [34.0, 30.8], "ids": IDS, "pre": PRE, "post": POST,
            "places": {k: [round((lo - 34.0) * kx, 3), round(-(la - 30.8) * 111.32, 3)] for k, (lo, la) in PLACES.items()},
            "hmax": float(h.max())}
    (OUT / "meta.json").write_text(json.dumps(meta, indent=1))
    print("tex", TW, TH, "grid", GW, GH, "hmax", h.max())


if __name__ == "__main__":
    main()
