"""3D coloured terrain for the Siliguri Corridor v2 video (free data only).

    python3 -I tools/build_siliguri2_3d.py <tile_cache> <ne_dir>

The look follows the creator's reference (a GeoLayers-style tilted 3D map), rebuilt from open data:
- Heights: AWS Terrain Tiles, terrarium (SRTM/NASA; open data): zoom 8 over the wide box, zoom 10 over the detail box
  around the corridor, blended, exaggerated 2.2x. One mesh, denser over the detail box (non-uniform grid).
- Texture: EOX Sentinel-2 cloudless 2024 (CC BY 4.0): zoom 9 (wide) and zoom 12 (detail), both in Web Mercator.
- Colour: strong semi-transparent country fills over the shaded relief (China red, India blue, Bangladesh green,
  Nepal/Bhutan/Myanmar purple), snow kept white on the high peaks, glowing cyan rivers (Natural Earth 10 m rivers in the
  plains + a drainage network computed from the DEM in the hills), white borders. Borders: Natural Earth, India
  point-of-view edition (India's official boundary).
- Drape masks for the animated highlights (RGB data textures, read by the ground shader):
  det_regions.png (detail box): R corridor fill, G corridor outline, B Chumbi Valley wedge;
  wide_regions.png (wide box): R Northeast state id (1..8)/8, G Northeast outline, B Bangladesh.
Writes public/siliguri2/3d/{tex_wide.jpg, tex_det.jpg, det_regions.png, wide_regions.png, height.bin, meta.json}.
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
from shapely.geometry import LineString, MultiPolygon, Polygon, box, shape
from shapely.ops import nearest_points, unary_union
from skimage.morphology import reconstruction

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "siliguri2" / "3d"
WIDE = (80.0, 98.0, 20.0, 31.0)
DET = (87.3, 90.8, 25.2, 28.1)
VEX = 2.2
COLS = (300, 800, 300)   # mesh columns: west of the detail box, inside it, east of it
ROWS = (220, 680, 260)   # mesh rows: north of it, inside it, south of it
R = 6378137.0
NE_STATES = ["Sikkim", "Assam", "Meghalaya", "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura"]
FILL = {  # country: (rgb, alpha)
    "China": ((0.95, 0.10, 0.17), 0.62), "India": ((0.10, 0.30, 1.00), 0.56), "Bangladesh": ((0.12, 0.92, 0.22), 0.55),
    "Nepal": ((0.62, 0.16, 1.00), 0.58), "Bhutan": ((0.62, 0.16, 1.00), 0.58), "Myanmar": ((0.62, 0.16, 1.00), 0.50),
}
PLACES = {
    "darjeeling": (88.2627, 27.0410), "guwahati": (91.7362, 26.1445), "siliguri": (88.4306, 26.7271),
    "gangtok": (88.6138, 27.3389), "yadong": (88.92, 27.48), "doklam": (88.94, 27.31), "jampheri": (88.97, 27.245),
    "lalmonirhat": (89.4333, 25.9300), "hasimara": (89.369, 26.698), "bamuni": (89.97, 26.07), "kishanganj": (87.95, 26.10),
    "chopra": (88.30, 26.35), "dhaka": (90.4125, 23.8103), "bagdogra": (88.3286, 26.6812), "kolkata": (88.36, 22.57),
    "delhi": (77.21, 28.61), "thimphu": (89.64, 27.47), "kathmandu": (85.32, 27.70), "shillong": (91.89, 25.58),
}


def mx(lon): return R * math.radians(lon)
def my(lat): return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def ilat(y): return math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)


def raster(geoms, b, W, H, blur=0, line=0):
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)

    def P(x, y): return ((mx(x) - b[0]) / (b[2] - b[0]) * W, (b[3] - my(y)) / (b[3] - b[1]) * H)
    for g in geoms:
        for p in (g.geoms if hasattr(g, "geoms") else [g]):
            if p.geom_type == "Polygon":
                if line:
                    d.line([P(x, y) for x, y in p.exterior.coords], fill=255, width=line)
                else:
                    d.polygon([P(x, y) for x, y in p.exterior.coords], fill=255)
                    for r in p.interiors:
                        d.polygon([P(x, y) for x, y in r.coords], fill=0)
            elif p.geom_type == "LineString":
                d.line([P(x, y) for x, y in p.coords], fill=255, width=max(line, 1))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im).astype(np.float32) / 255


def drainage(dem, thresh):
    """D8 flow accumulation on a depression-filled DEM; returns cells with accumulation above thresh (0/1)."""
    H, W = dem.shape
    seed = dem.copy()
    seed[1:-1, 1:-1] = dem.max()
    filled = reconstruction(seed, dem, method="erosion")
    f = filled + ndimage.gaussian_filter(dem, 2) * 1e-3 + np.linspace(0, 1e-4, H)[:, None]
    best = np.zeros((H, W), np.int64) - 1
    drop = np.zeros((H, W), np.float32)
    idx = np.arange(H * W).reshape(H, W)
    for dy, dx in [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]:
        sh = np.full((H, W), np.inf, np.float32)
        si = np.full((H, W), -1, np.int64)
        ys, ye, xs, xe = max(0, -dy), H - max(0, dy), max(0, -dx), W - max(0, dx)
        sh[ys:ye, xs:xe] = f[ys + dy:ye + dy, xs + dx:xe + dx]
        si[ys:ye, xs:xe] = idx[ys + dy:ye + dy, xs + dx:xe + dx]
        dd = (f - sh) / math.hypot(dy, dx)
        m = dd > drop
        drop[m], best[m] = dd[m], si[m]
    order = np.argsort(-f.ravel(), kind="stable")
    down = best.ravel().tolist()
    acc = [1.0] * (H * W)
    for i in order.tolist():
        j = down[i]
        if j >= 0:
            acc[j] += acc[i]
    return np.asarray(acc, np.float32).reshape(H, W) > thresh


def colourise(sat, b, dem_full, dem_b, countries, india, rivers_ne, borders, px_m, river_px, glow_px, dr):
    """The base map texture for one box (sat: PIL RGB in Mercator over b). Works in strips to keep memory low."""
    W, H = sat.size
    # the DEM resampled onto this texture (float32, one row block at a time)
    demT = np.empty((H, W), np.float32)
    gxr = ((b[0] + np.linspace(0, 1, W) * (b[2] - b[0])) - dem_b[0]) / (dem_b[2] - dem_b[0]) * (dem_full.shape[1] - 1)
    for r0 in range(0, H, 512):
        r1 = min(H, r0 + 512)
        yy = np.linspace(0, 1, H)[r0:r1]
        gy = (dem_b[3] - (b[3] - yy * (b[3] - b[1]))) / (dem_b[3] - dem_b[1]) * (dem_full.shape[0] - 1)
        GY, GX = np.meshgrid(gy, gxr, indexing="ij")
        demT[r0:r1] = ndimage.map_coordinates(dem_full, [GY.ravel(), GX.ravel()], order=1).reshape(r1 - r0, W)
    hs = uk.hillshade(np.maximum(demT, 0) * 2.4, px_m).astype(np.float32)
    U8 = lambda m: (np.clip(m, 0, 1) * 255).astype(np.uint8)
    land = U8(raster(countries.values(), b, W, H, 1.0))
    cmask = [(FILL.get(n, ((0.5, 0.5, 0.5), 0.0)), U8(raster([poly], b, W, H, 1.2))) for n, poly in countries.items()]
    riv = raster(rivers_ne, b, W, H, 0, line=river_px)
    if dr is not None:
        dri = np.asarray(Image.fromarray((dr * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
        riv = np.maximum(riv, np.clip(dri * 1.6, 0, 1))
        del dri
    rivI = Image.fromarray(U8(riv * (land / 255.0)))
    del riv
    core = np.asarray(rivI.filter(ImageFilter.GaussianBlur(max(river_px * 0.35, 0.6))))
    glow = np.asarray(rivI.filter(ImageFilter.GaussianBlur(glow_px)))
    bl = U8(raster(borders, b, W, H, 0.6, line=max(2, river_px)))
    il = U8(raster([india], b, W, H, 0.6, line=max(3, river_px + 1)))
    sat_a = np.asarray(sat)
    out8 = np.empty((H, W, 3), np.uint8)
    f = lambda m, r0, r1: m[r0:r1].astype(np.float32)[..., None] / 255
    for r0 in range(0, H, 512):
        r1 = min(H, r0 + 512)
        a = sat_a[r0:r1].astype(np.float32) / 255
        hs_ = hs[r0:r1][..., None]
        dm = demT[r0:r1][..., None]
        lum = a @ np.array([0.3, 0.59, 0.11], np.float32)
        grey = lum[..., None]
        rich = np.clip(grey + (a - grey) * 1.35, 0, 1)
        base = np.clip(rich * (0.42 + 0.85 * hs_), 0, 1)
        shade = 0.30 + 0.95 * hs_
        out = base * 0.55
        for (rgb, k), m8 in cmask:
            m = f(m8, r0, r1)
            if k:
                col = np.array(rgb, np.float32) * shade * (0.55 + 0.9 * grey)
                out = out * (1 - m) + (base * (1 - k) + col * k * 1.45) * m
            else:
                out = out * (1 - m) + base * 0.6 * m
        snow = np.clip((grey - 0.48) / 0.22, 0, 1) * np.clip((dm - 3400) / 1300, 0, 1)
        out = out * (1 - snow * 0.9) + (np.array([0.93, 0.95, 1.0]) * (0.55 + 0.5 * hs_)) * snow * 0.9
        sea = np.clip((1 - f(land, r0, r1)) * (dm < 2), 0, 1)
        ocean = np.array([0.03, 0.15, 0.19]) * (0.75 + 0.5 * np.clip((dm + 3000) / 3000, 0, 1))
        out = out * (1 - sea) + ocean * sea
        out = out + f(glow, r0, r1) * np.array([0.05, 0.55, 0.75]) * 1.6 + f(core, r0, r1) * np.array([0.45, 1.0, 1.0]) * 0.9
        blm, ilm = f(bl, r0, r1), f(il, r0, r1)
        out = out * (1 - blm * 0.55) + blm * 0.85 * 0.55
        out = out * (1 - ilm * 0.8) + ilm * 0.97 * 0.8
        out8[r0:r1] = (np.clip(out, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(out8), demT


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    wbox = box(WIDE[0] - 1, WIDE[2] - 1, WIDE[1] + 1, WIDE[3] + 1)
    countries = {}
    for r, s_ in zip(sf.records(), sf.shapes()):
        g = shape(s_.__geo_interface__).buffer(0)
        if g.intersects(wbox):
            countries[r["ADMIN"]] = g.intersection(wbox)
    india = countries["India"]
    borders = [c.boundary for c in countries.values()]
    s1 = shapefile.Reader(str(ne / "ne_10m_admin_1_states_provinces_lakes.shp"))
    states = {}
    for r, s_ in zip(s1.records(), s1.shapes()):
        if r["admin"] == "India" and r["name"] in NE_STATES:
            states[r["name"]] = shape(s_.__geo_interface__).buffer(0).intersection(india)
    assert len(states) == 8, states.keys()
    rv = shapefile.Reader(str(ne / "ne_10m_rivers_lake_centerlines_scale_rank.shp"))
    rivers = [shape(s_.__geo_interface__) for s_ in rv.shapes() if s_.bbox[2] > WIDE[0] and s_.bbox[0] < WIDE[1] and s_.bbox[3] > WIDE[2] and s_.bbox[1] < WIDE[3]]

    # ---- heights
    dw = uk.dem(8, *WIDE, cache)
    dd = uk.dem(10, *DET, cache)
    dw = ndimage.gaussian_filter(ndimage.median_filter(dw, 3), 0.6)
    dd = ndimage.gaussian_filter(ndimage.median_filter(dd, 3), 0.6)
    bw = [mx(WIDE[0]), my(WIDE[2]), mx(WIDE[1]), my(WIDE[3])]
    bd = [mx(DET[0]), my(DET[2]), mx(DET[1]), my(DET[3])]
    xs = np.concatenate([np.linspace(bw[0], bd[0], COLS[0], endpoint=False), np.linspace(bd[0], bd[2], COLS[1], endpoint=False),
                         np.linspace(bd[2], bw[2], COLS[2])])
    ys = np.concatenate([np.linspace(bw[3], bd[3], ROWS[0], endpoint=False), np.linspace(bd[3], bd[1], ROWS[1], endpoint=False),
                         np.linspace(bd[1], bw[1], ROWS[2])])  # north to south

    def sample(d, b, X, Y):
        gx = (X - b[0]) / (b[2] - b[0]) * (d.shape[1] - 1)
        gy = (b[3] - Y) / (b[3] - b[1]) * (d.shape[0] - 1)
        return ndimage.map_coordinates(d, [gy, gx], order=1, mode="nearest")

    X, Y = np.meshgrid(xs, ys)
    hw = sample(dw, bw, X.ravel(), Y.ravel()).reshape(X.shape)
    hd = sample(dd, bd, X.ravel(), Y.ravel()).reshape(X.shape)
    # feather the detail heights in over ~0.15 deg inside the detail box edge
    fx = np.clip(np.minimum(X - bd[0], bd[2] - X) / (bd[2] - bd[0]) / 0.04, 0, 1)
    fy = np.clip(np.minimum(Y - bd[1], bd[3] - Y) / (bd[3] - bd[1]) / 0.05, 0, 1)
    wdet = fx * fy
    hgt = hw * (1 - wdet) + hd * wdet
    lat_mid = math.radians((WIDE[2] + WIDE[3]) / 2)
    scale = math.cos(lat_mid) / 1000  # mercator metres -> km
    land_m = raster(countries.values(), bw, len(xs), len(ys), 0)
    hk = np.where(hgt > 0, hgt, -60) / 1000 * VEX
    hk = np.where(land_m > 0.5, np.maximum(hk, 0.0), np.minimum(hk, -0.04))
    hk.astype(np.float32).tofile(OUT / "height.bin")

    # ---- drainage (hills only; the plains use Natural Earth's lines)
    def hills_only(dem, thresh):
        net = drainage(np.maximum(dem, 0).astype(np.float64), thresh).astype(np.float32)
        return net * np.clip((dem - 160) / 200, 0, 1)
    dr_w = None if ("--keep-wide" in sys.argv or "--masks-only" in sys.argv) else hills_only(dw, 900)
    MO = "--masks-only" in sys.argv
    dr_d = None if MO else hills_only(dd, 1400)

    # ---- textures
    def tex(z, bx, maxw, name, dem, demb, river_px, glow_px, dr):
        sat, b = stitch(z, *bx, cache / "eox")
        if sat.width > maxw:
            sat = sat.resize((maxw, round(maxw * sat.height / sat.width)), Image.LANCZOS)
        px_m = (b[2] - b[0]) * math.cos(lat_mid) / sat.width
        im, _ = colourise(sat, b, dem, demb, countries, india, rivers, borders, px_m, river_px, glow_px, dr)
        im.save(OUT / name, quality=93)
        print(name, im.size)
        return im.size
    tw = Image.open(OUT / "tex_wide.jpg").size if (OUT / "tex_wide.jpg").exists() and ("--keep-wide" in sys.argv or "--masks-only" in sys.argv) else tex(9, WIDE, 6144, "tex_wide.jpg", dw, bw, 2, 5, dr_w)
    td = Image.open(OUT / "tex_det.jpg").size if MO else tex(12, DET, 8192, "tex_det.jpg", dd, bd, 3, 9, dr_d)

    # ---- drape masks
    nepal, bang, china = countries["Nepal"], countries["Bangladesh"], countries["China"]
    corridor = india.intersection(Polygon([(88.02, 26.86), (88.62, 26.86), (88.62, 26.62), (88.42, 26.45), (88.30, 26.38), (88.02, 26.40)]))
    corridor = max(corridor.geoms, key=lambda g: g.area) if hasattr(corridor, "geoms") else corridor
    chumbi = china.intersection(box(88.55, 27.0, 89.45, 28.05))
    chumbi = max(chumbi.geoms, key=lambda g: g.area) if hasattr(chumbi, "geoms") else chumbi
    DW = 4096
    DH = round(DW * (bd[3] - bd[1]) / (bd[2] - bd[0]))
    # the corridor: a soft glow, and its two real walls (the Nepal and Bangladesh borders) as lines
    walls = unary_union([corridor.boundary.intersection(nepal.buffer(0.012)), corridor.boundary.intersection(bang.buffer(0.012))])
    wl = [g for g in (walls.geoms if hasattr(walls, "geoms") else [walls]) if g.geom_type == "LineString"]
    soft = np.clip(raster([corridor], bd, DW, DH, 22) * 1.25, 0, 1)
    reg = np.stack([soft, raster(wl, bd, DW, DH, 1.5, line=9), raster([chumbi], bd, DW, DH, 3)], -1)
    Image.fromarray((reg * 255).astype(np.uint8)).save(OUT / "det_regions.png")
    WW = 4096
    WH = round(WW * (bw[3] - bw[1]) / (bw[2] - bw[0]))
    sid = np.zeros((WH, WW), np.float32)
    for i, n in enumerate(NE_STATES):
        m = raster([states[n]], bw, WW, WH, 0)
        sid = np.where(m > 0.5, (i + 1) / 8, sid)
    outl = raster(list(states.values()), bw, WW, WH, 1.0, line=4)
    reg2 = np.stack([sid, outl, raster([bang], bw, WW, WH, 2)], -1)
    Image.fromarray((reg2 * 255).astype(np.uint8)).save(OUT / "wide_regions.png")

    # the narrowest crossing: Nepal to Bangladesh across the corridor
    zone = box(87.9, 26.2, 88.7, 26.9)
    pn, pb = nearest_points(nepal.intersection(zone), bang.intersection(zone))
    gap_km = math.hypot((pn.x - pb.x) * 111.32 * math.cos(math.radians(pn.y)), (pn.y - pb.y) * 110.57)
    cen = corridor.centroid
    meta = {"wide": WIDE, "det": DET, "bw": bw, "bd": bd, "scale": scale, "vex": VEX,
            "xs": [round(float(v), 1) for v in xs], "ys": [round(float(v), 1) for v in ys],
            "tex_wide": tw, "tex_det": td, "reg_det": [DW, DH], "reg_wide": [WW, WH], "max_h": float(hk.max()),
            "places": PLACES, "gap": [[pn.x, pn.y], [pb.x, pb.y], round(gap_km, 1)], "corridor_c": [cen.x, cen.y],
            "chumbi_c": [chumbi.centroid.x, chumbi.centroid.y], "states": NE_STATES,
            "state_c": {n: [states[n].representative_point().x, states[n].representative_point().y] for n in NE_STATES},
            "corridor": [[round(x, 4), round(y, 4)] for x, y in corridor.simplify(0.004).exterior.coords],
            "chumbi": [[round(x, 4), round(y, 4)] for x, y in chumbi.simplify(0.004).exterior.coords]}
    (OUT / "meta.json").write_text(json.dumps(meta))
    print("grid", len(xs), len(ys), "max h", round(meta["max_h"], 2), "gap", meta["gap"])


if __name__ == "__main__":
    main()
