"""Maps and vectors for the Mumbai seven-islands video.

    python3 -I tools/build_mumbai_maps.py <tile_cache> <ne_dir> [debug.jpg]

Needs tools/fetch_mumbai_tiles.py run first (EOX satellite plates + OSM land masks in <tile_cache>).

Today's coastline: OpenStreetMap water vs land (ODbL), cleaned of ferry lines and hatching, vectorised.
The seven islands: today's coastline cut by hand-drawn creek lines. Where they ran follows the standard account
of the islands before reclamation (Colaba, Old Woman's Island / Little Colaba, Bombay with the Malabar Hill and
Dongri arms and Back Bay between them, Mazagaon, Parel, Worli, Mahim); the shapes are illustrative, not survey-exact.
Chart plates: the creator's nautical-chart paper (mirrored repeat), a muted teal sea, engraved coast lines; land for
places outside the island city is baked in, the island city's land is drawn live (it changes through the story).
Wide chart plates use Natural Earth land (public domain).
"""
import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import LineString, MultiPolygon, Polygon, box, shape
from shapely.ops import unary_union

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "mumbai" / "maps"
R = 6378137.0


def mx(lon: float) -> float:
    return R * math.radians(lon)


def my(lat: float) -> float:
    return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def lonlat(x: float, y: float) -> tuple[float, float]:
    return math.degrees(x / R), math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)


def merc_poly(pts) -> Polygon:
    return Polygon([(mx(a), my(b)) for a, b in pts]).buffer(0)


def wobbly(pts, seed: int, amp: float = 150.0, step: float = 50.0) -> Polygon:
    """A hand-drawn creek edge: densify the polygon and push it in and out with smooth noise (metres)."""
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 2 * np.pi, 4)
    wl = np.array([2300.0, 1100.0, 620.0, 330.0])
    am = amp * np.array([1.0, 0.55, 0.3, 0.15])
    m = [(mx(a), my(b)) for a, b in pts]
    m.append(m[0])
    out, s0 = [], 0.0
    for (x0, y0), (x1, y1) in zip(m, m[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        nx, ny = -(y1 - y0) / L, (x1 - x0) / L
        n = max(1, int(L / step))
        for i in range(n):
            u = i / n
            sl = s0 + u * L
            d = float(np.sum(am * np.sin(2 * np.pi * sl / wl + ph)))
            out.append((x0 + (x1 - x0) * u + nx * d, y0 + (y1 - y0) * u + ny * d))
        s0 += L
    return Polygon(out).buffer(0)


def rounded(g, r: float):
    """Open then close: round every corner the straight cuts left, drop slivers."""
    return g.buffer(-r, join_style=1).buffer(2 * r, join_style=1).buffer(-r, join_style=1)


# ---------------------------------------------------------------- hand-drawn geography (lon, lat)
CITY_CLIP = [(72.76, 18.86), (72.76, 19.031), (72.828, 19.031), (72.828, 19.044), (72.845, 19.044), (72.85, 19.052), (72.866, 19.049), (72.877, 19.032), (72.886, 19.0), (72.90, 18.86)]
ISLANDS = {
    "colaba": [[(72.79, 18.88), (72.85, 18.88), (72.85, 18.9065), (72.79, 18.9065)]],
    "oldwoman": [[(72.8165, 18.9088), (72.8305, 18.9088), (72.8305, 18.9165), (72.8165, 18.9165)]],
    "bombay": [
        [(72.78, 18.93), (72.812, 18.94), (72.8145, 18.952), (72.8125, 18.9735), (72.78, 18.977)],          # Malabar & Cumballa hills
        [(72.810, 18.9515), (72.836, 18.944), (72.838, 18.9575), (72.812, 18.9605)],                         # Girgaon-Kalbadevi neck
        [(72.826, 18.9195), (72.8465, 18.9195), (72.8465, 18.9665), (72.836, 18.9665), (72.834, 18.957), (72.826, 18.944)],  # Fort-Dongri
    ],
    "mazagaon": [[(72.8385, 18.9685), (72.857, 18.9685), (72.857, 18.9862), (72.8405, 18.9862)]],
    "parel": [[(72.8355, 18.9885), (72.87, 18.9885), (72.882, 19.03), (72.866, 19.052), (72.852, 19.052), (72.8515, 19.012), (72.8385, 19.0055)]],
    "worli": [[(72.80, 18.9868), (72.8225, 18.9868), (72.822, 19.0), (72.8195, 19.031), (72.80, 19.031)]],
    "mahim": [[(72.8255, 19.0085), (72.8425, 19.0085), (72.8485, 19.025), (72.8485, 19.049), (72.829, 19.049)]],
}
LABEL_AT = {  # where each island's name sits (lon, lat)
    "colaba": (72.8115, 18.8985), "oldwoman": (72.8235, 18.9128), "bombay": (72.826, 18.940), "mazagaon": (72.848, 18.977),
    "parel": (72.856, 19.008), "worli": (72.8125, 19.008), "mahim": (72.838, 19.033),
}
VELLARD = [(72.8115, 18.9738), (72.8132, 18.980), (72.8152, 18.9875)]
COASTAL_ROAD = [(72.8243, 18.9440), (72.8200, 18.9500), (72.8150, 18.9560), (72.8065, 18.9625), (72.7983, 18.9687),
                (72.8037, 18.9725), (72.8075, 18.9790), (72.8100, 18.9840), (72.8098, 18.9935), (72.8100, 19.0030),
                (72.8125, 19.0160), (72.8150, 19.0280)]
PLACES = {"mumbadevi": (72.8352, 18.9415), "worliKoliwada": (72.8148, 19.0255)}


# ---------------------------------------------------------------- masks → polygons
def clean_mask(path: Path, close: int, open_: int, min_area: int) -> np.ndarray:
    m = (np.asarray(Image.open(path)) > 127).astype(np.uint8)
    k = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k(close))   # fill hatching / dotted military areas
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k(open_))    # drop ferry lines, bridges, piers
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    m = keep[lab].astype(np.uint8)
    # fill lakes and docks enclosed by land
    inv = (1 - m).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, 4)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < min_area * 4 and x > 0 and y > 0 and x + w < m.shape[1] and y + h < m.shape[0]:
            m[lab == i] = 1
    return m


def mask_polys(m: np.ndarray, b, tol_px: float):
    """Contours of a mask on a Mercator plate (bounds [x0, y0(s), x1, y1(n)]) → shapely geometry in metres."""
    H, W = m.shape
    cs, hier = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    to = lambda c: [(b[0] + (p[0][0] + 0.5) / W * (b[2] - b[0]), b[3] - (p[0][1] + 0.5) / H * (b[3] - b[1])) for p in c]
    polys = []
    for i, c in enumerate(cs):
        if hier[0][i][3] != -1 or len(c) < 8:
            continue
        holes = [to(cs[j]) for j in range(len(cs)) if hier[0][j][3] == i and len(cs[j]) >= 8]
        polys.append(Polygon(to(c), holes).buffer(0))
    px = (b[2] - b[0]) / W
    return unary_union(polys).simplify(tol_px * px, preserve_topology=True)


def rings(g, min_area=0.0, smooth=0.0):
    if smooth:
        g = g.buffer(smooth, join_style=1).buffer(-smooth, join_style=1)
    out = []
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type != "Polygon" or p.area < min_area:
            continue
        out.append([[round(x, 1), round(y, 1)] for x, y in p.exterior.coords])
    return out


# ---------------------------------------------------------------- rasters
def raster(g, b, W, H, ss=2) -> np.ndarray:
    im = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(im)
    px = lambda x, y: ((x - b[0]) / (b[2] - b[0]) * W * ss, (b[3] - y) / (b[3] - b[1]) * H * ss)
    for p in (g.geoms if hasattr(g, "geoms") else [g]):
        if p.geom_type != "Polygon" or p.is_empty:
            continue
        d.polygon([px(*c) for c in p.exterior.coords], fill=255)
        for h in p.interiors:
            d.polygon([px(*c) for c in h.coords], fill=0)
    return np.asarray(im.resize((W, H), Image.LANCZOS), np.float32) / 255


def mirrored(tex: Image.Image, W: int, H: int, scale: float) -> np.ndarray:
    t = tex.resize((max(8, int(tex.width * scale)), max(8, int(tex.height * scale))), Image.LANCZOS)
    a = np.asarray(t, np.float32) / 255
    quad = np.concatenate([np.concatenate([a, a[:, ::-1]], 1), np.concatenate([a[::-1], a[::-1, ::-1]], 1)], 0)
    reps = (H // quad.shape[0] + 1, W // quad.shape[1] + 1, 1)
    return np.tile(quad, reps)[:H, :W]


SEA = np.array([0.40, 0.60, 0.60])
INK = np.array([0.22, 0.17, 0.12])


def paper_layers(tex, W, H, scale):
    paper = mirrored(tex, W, H, scale)
    lum = paper.mean(2, keepdims=True)
    land = paper * np.array([1.0, 0.975, 0.92])
    sea = SEA * (0.80 + 0.30 * lum) + (paper - lum) * 0.25
    return land, sea


def engrave(rgb, m_land, px_per_line, lines=4):
    """Old-chart coast: ink outline plus fading parallel lines out to sea."""
    m8 = (m_land > 0.5).astype(np.uint8)
    d_out = cv2.distanceTransform(1 - m8, cv2.DIST_L2, 5)
    out = rgb.copy()
    for i in range(1, lines + 1):
        dd = i * px_per_line
        w = np.clip(1.0 - np.abs(d_out - dd) / 0.9, 0, 1) * (0.32 * (1 - (i - 1) / (lines + 0.5)))
        out = out * (1 - w[..., None]) + INK * w[..., None]
    edge = np.clip(1.0 - np.abs(cv2.distanceTransform(m8, cv2.DIST_L2, 5) + d_out - 1.0) / 1.4, 0, 1) * (m8 | (d_out < 2))
    out = out * (1 - 0.7 * edge[..., None]) + 0.7 * edge[..., None] * INK
    return out


def save(a, name):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(OUT / name, quality=90)


def ne_land(ne: Path):
    sf = shapefile.Reader(str(ne / "z10" / "ne_10m_admin_0_countries.shp"))
    return unary_union([shape(s.__geo_interface__) for s in sf.shapes()])


def to_merc_geom(g):
    from shapely.ops import transform
    return transform(lambda x, y, z=None: (np.radians(x) * R, R * np.log(np.tan(np.pi / 4 + np.radians(np.clip(y, -85, 85)) / 2))), g)


def chart_plate(name, land_geom, b, W, tex, scale, line_px):
    H = int(round(W * (b[3] - b[1]) / (b[2] - b[0])))
    m = raster(land_geom, b, W, H)
    land, sea = paper_layers(tex, W, H, scale)
    rgb = land * m[..., None] + sea * (1 - m[..., None])
    rgb = engrave(rgb, m, line_px, 3)
    save(rgb, f"{name}.jpg")
    print(name, W, H)
    return {"bounds": [round(v, 1) for v in b], "w": W, "h": H}


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    debug = Path(sys.argv[3]) if len(sys.argv) > 3 else None
    meta = json.loads((cache / "tiles_meta.json").read_text())
    tex = Image.open(ROOT / "public" / "mumbai" / "img" / "texture_nautical_chart.png").convert("RGB")

    # ---- today's land
    fine = mask_polys(clean_mask(cache / "land_mask.png", 3, 4, 400), meta["mask"]["bounds"], 1.2)
    wide = mask_polys(clean_mask(cache / "land_mask_wide.png", 2, 2, 150), meta["mask_wide"]["bounds"], 1.0)
    clip = merc_poly(CITY_CLIP)
    city = fine.intersection(clip)
    city = max(city.geoms, key=lambda p: p.area) if hasattr(city, "geoms") else city
    other = wide.difference(clip.buffer(250))  # Salsette, Trombay, the mainland, Elephanta…
    other = unary_union([p for p in (other.geoms if hasattr(other, "geoms") else [other]) if p.area > 6e4])
    islands = {}
    for j, (k, ps) in enumerate(ISLANDS.items()):
        hand = unary_union([wobbly(p, 11 * j + i, amp=110 if k == "oldwoman" else 160) for i, p in enumerate(ps)])
        islands[k] = rounded(hand.intersection(city), 70 if k == "oldwoman" else 120)
    for k, g in islands.items():
        polys = g.geoms if hasattr(g, "geoms") else [g]
        islands[k] = unary_union([p for p in polys if p.area > 2e4])
        print(f"island {k:9s} {islands[k].area / 1e6 / 1.058**2:5.2f} km2")
    print(f"city today {city.area / 1e6 / 1.058**2:.1f} km2, islands {sum(g.area for g in islands.values()) / 1e6 / 1.058**2:.1f} km2")

    geo = {k: meta[k] for k in ["india", "konkan", "mumbai"]}
    for k in ["konkan"]:  # the stitched Konkan plate is large; keep it at 3000 px wide
        im = Image.open(OUT / f"{k}_sat.jpg")
        if im.width > 3000:
            im = im.resize((3000, round(im.height * 3000 / im.width)), Image.LANCZOS)
            im.save(OUT / f"{k}_sat.jpg", quality=90)
            geo[k] = {**geo[k], "w": im.width, "h": im.height}

    # ---- chart plates
    mb = meta["mumbai"]["bounds"]
    W, H = meta["mumbai"]["w"], meta["mumbai"]["h"]
    m_other = raster(other, mb, W, H)
    land, sea = paper_layers(tex, W, H, 1.0)
    rgb = land * m_other[..., None] + sea * (1 - m_other[..., None])
    save(engrave(rgb, m_other, 7, 4), "mumbai_chart_sea.jpg")
    save(land, "mumbai_chart_land.jpg")
    world = to_merc_geom(ne_land(ne))
    kb = meta["konkan"]["bounds"]
    geo["konkan_chart"] = chart_plate("konkan_chart", unary_union([world.intersection(box(*kb)).difference(clip.buffer(800)), other]), kb, 3000, tex, 0.8, 5)
    wb = [mx(-26), my(-42), mx(96), my(62)]
    geo["world_chart"] = chart_plate("world_chart", world.intersection(box(*wb)), wb, 3000, tex, 0.6, 4)

    # ---- vectors
    geo["city"] = rings(city, 1e4)
    geo["islands"] = {k: rings(g.simplify(9), 1e4) for k, g in islands.items()}
    flats = city.difference(unary_union(list(islands.values())).buffer(6))
    geo["flats"] = rings(flats.simplify(9), 2e3)
    geo["label"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in LABEL_AT.items()}
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["vellard"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in VELLARD]
    geo["coastalRoad"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in COASTAL_ROAD]
    cen = city.centroid
    geo["cityCentre"] = [round(cen.x, 1), round(cen.y, 1)]
    for k in ["lisbon", "london"]:
        pass
    geo["cities"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in {"lisbon": (-9.14, 38.72), "london": (-0.12, 51.5), "mumbai": (72.835, 18.94)}.items()}
    (ROOT / "src" / "mumbai").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "mumbai" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    print("vectors: city", sum(len(r) for r in geo["city"]), "pts; islands", {k: sum(len(r) for r in v) for k, v in geo["islands"].items()})

    if debug:
        sat = Image.open(OUT / "mumbai_sat.jpg").convert("RGB")
        sx = lambda x, y: ((x - mb[0]) / (mb[2] - mb[0]) * sat.width, (mb[3] - y) / (mb[3] - mb[1]) * sat.height)
        # crop to the island city
        x0, y1 = sx(mx(72.775), my(19.06))
        x1, y0 = sx(mx(72.895), my(18.885))
        ov = Image.new("RGBA", sat.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        cols = {"colaba": (255, 80, 80), "oldwoman": (255, 200, 0), "bombay": (80, 200, 255), "mazagaon": (200, 80, 255),
                "parel": (80, 255, 120), "worli": (255, 140, 0), "mahim": (255, 80, 200)}
        for r in geo["city"]:
            d.line([sx(*p) for p in r], fill=(255, 255, 255, 255), width=3)
        for k, rs in geo["islands"].items():
            for r in rs:
                d.polygon([sx(*p) for p in r], fill=cols[k] + (110,), outline=cols[k] + (255,))
            d.text(sx(*geo["label"][k]), k, fill=(255, 255, 255, 255))
        d.line([sx(*p) for p in geo["vellard"]], fill=(255, 255, 0, 255), width=5)
        d.line([sx(*p) for p in geo["coastalRoad"]], fill=(0, 255, 255, 255), width=3)
        for k, p in geo["places"].items():
            q = sx(*p)
            d.ellipse([q[0] - 6, q[1] - 6, q[0] + 6, q[1] + 6], fill=(255, 0, 0, 255))
        im = Image.alpha_composite(sat.convert("RGBA"), ov).convert("RGB").crop((int(x0), int(y1), int(x1), int(y0)))
        chart = Image.open(OUT / "mumbai_chart_sea.jpg").crop((int(x0), int(y1), int(x1), int(y0)))
        both = Image.new("RGB", (im.width * 2 + 10, im.height), "white")
        both.paste(im, (0, 0))
        both.paste(chart, (im.width + 10, 0))
        both.thumbnail((1800, 1800))
        both.save(debug, quality=85)


if __name__ == "__main__":
    main()
