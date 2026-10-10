"""Antique parchment maps and 1803 borders for the Louisiana Purchase video.

    python3 -I tools/build_louisiana_maps.py <nasa_world.jpg> <ne_dir> <ne_extra_dir>

Base plates (Web Mercator, no unwrap): Natural Earth land on the creator's parchment texture, terrain shading taken
from NASA Blue Marble luminance, a muted teal sea with paper grain, ink coastlines and lakes.
  world.jpg      lon -170..55, lat 76..-12, 20 px/deg
  namerica.jpg   lon -128..-58, lat 54..16, 60 px/deg
  europe.jpg     lon -14..22, lat 62..34, 60 px/deg
  carib.jpg      lon -88..-60, lat 28..12, 110 px/deg (relief upsampled)
  carib_sat.jpg  same frame, NASA Blue Marble colour (the satellite cut)
Vector layers (src/louisiana/geo.json, Mercator metres): 1803 colour blocks (Louisiana, USA, Britain/Canada, Spain,
France in Europe, Britain in Europe, Saint-Domingue/Haiti), the Mississippi, New Orleans, India (true-scale outline).

Borders are drawn here by hand from public-domain coastlines (Natural Earth) and rivers; the Louisiana outline follows
the usual 1803 depiction: Mississippi in the east, 49°N in the north, the Continental Divide in the west, then the
Arkansas River, 100°W, the Red River and the Sabine in the south-west.
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import LineString, MultiPolygon, Polygon, box, mapping, shape
from shapely.ops import linemerge, unary_union

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "louisiana" / "maps"
R = 6378137.0


def mx(lon):
    return R * math.radians(lon)


def my(lat):
    lat = max(-85.0, min(85.0, lat))
    return R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def bounds(lon0, lon1, lat0, lat1):
    return [mx(lon0), my(lat1), mx(lon1), my(lat0)]


# ---------------------------------------------------------------- vector data (lon/lat, shapely)
def countries(ne):
    sf = shapefile.Reader(str(ne / "z10" / "ne_10m_admin_0_countries.shp"))
    out = {}
    for rec, shp in zip(sf.records(), sf.shapes()):
        out.setdefault(rec["ADMIN"], []).append(shape(shp.__geo_interface__))
    return {k: unary_union(v) for k, v in out.items()}


def mississippi(extra):
    """The whole river, mouth → source. Natural Earth stores it as several multi-part records (delta branches,
    lake crossings), so split every part out and chain them greedily from the mouth northwards."""
    sf = shapefile.Reader(str(extra / "ne_10m_rivers_lake_centerlines" / "ne_10m_rivers_lake_centerlines.shp"))
    parts = []
    for r, s in zip(sf.records(), sf.shapes()):
        if r["name"] != "Mississippi":
            continue
        idx = list(s.parts) + [len(s.points)]
        for a0, a1 in zip(idx, idx[1:]):
            seg = s.points[a0:a1]
            if len(seg) >= 2:
                parts.append(seg if seg[0][1] <= seg[-1][1] else seg[::-1])
    # main stem only: start from the part reaching furthest south, then keep taking the part whose start is nearest
    parts.sort(key=lambda sg: sg[0][1])
    pts = list(parts.pop(0))
    while parts:
        ex, ey = pts[-1]
        j = min(range(len(parts)), key=lambda k: (parts[k][0][0] - ex) ** 2 + (parts[k][0][1] - ey) ** 2)
        sg = parts.pop(j)
        if sg[-1][1] <= ey + 0.02:
            continue  # a branch that doesn't take us further north
        if (sg[0][0] - ex) ** 2 + (sg[0][1] - ey) ** 2 > 0.25:
            continue
        pts += sg[1:]
    return pts


DIVIDE = [(-113.95, 49.0), (-113.3, 48.3), (-112.6, 47.4), (-112.4, 46.6), (-113.0, 45.7), (-112.0, 44.5), (-111.0, 44.5),
          (-110.5, 43.6), (-109.6, 42.9), (-108.6, 42.4), (-107.6, 41.4), (-106.9, 40.9), (-106.0, 40.3), (-106.3, 39.25)]
ARKANSAS = [(-105.9, 38.5), (-105.0, 38.4), (-104.0, 38.25), (-103.0, 38.1), (-102.0, 38.0), (-101.0, 37.95), (-100.0, 37.75)]
SOUTHWEST = [(-100.0, 34.56), (-99.0, 34.2), (-98.0, 34.1), (-97.0, 33.8), (-96.0, 33.85), (-95.0, 33.85), (-94.04, 33.55),
             (-94.04, 32.0), (-93.9, 31.0), (-93.7, 30.4), (-93.85, 29.7), (-93.9, 28.5), (-91.5, 28.2), (-89.0, 28.2)]


def louisiana(river, land):
    north = [(river[-1][0], 49.0)]
    ring = river + north + DIVIDE + ARKANSAS + SOUTHWEST + [(river[0][0] + 0.3, river[0][1] - 0.5)]
    poly = Polygon(ring).buffer(0)
    return poly.intersection(land)


def east_of_river(river):
    ring = river + [(river[-1][0], 49.3), (-50, 49.3), (-50, 20), (river[0][0] + 0.3, 20), (river[0][0] + 0.3, river[0][1] - 0.5)]
    return Polygon(ring).buffer(0)


# ---------------------------------------------------------------- rasters
def eq_crop(src, lon0, lon1, lat0, lat1, ppd):
    W, H = src.size
    s = W / 360
    c = src.crop((int((lon0 + 180) * s), int((90 - lat0) * s), int((lon1 + 180) * s), int((90 - lat1) * s)))
    return c.resize((int(round((lon1 - lon0) * ppd)), int(round((lat0 - lat1) * ppd))), Image.LANCZOS)


def to_merc(eq: np.ndarray, lat0, lat1, ppd, lon_span):
    y1, y0 = my(lat0), my(lat1)
    w = eq.shape[1]
    h = int(round(w * (y1 - y0) / (mx(lon_span) - mx(0))))
    ys = y1 - (np.arange(h) + 0.5) / h * (y1 - y0)
    lat = np.degrees(2 * np.arctan(np.exp(ys / R)) - np.pi / 2)
    rows = np.clip(((lat0 - lat) * ppd).astype(int), 0, eq.shape[0] - 1)
    return eq[rows]


def raster_mask(geoms, b, W, H, ss=2):
    im = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(im)
    def px(lon, lat):
        return ((mx(lon) - b[0]) / (b[2] - b[0]) * W * ss, (b[3] - my(lat)) / (b[3] - b[1]) * H * ss)
    for g in geoms:
        polys = g.geoms if hasattr(g, "geoms") else [g]
        for p in polys:
            if p.geom_type != "Polygon":
                continue
            d.polygon([px(*c) for c in p.exterior.coords], fill=255)
            for hole in p.interiors:
                d.polygon([px(*c) for c in hole.coords], fill=0)
    return np.asarray(im.resize((W, H), Image.LANCZOS), np.float32) / 255


def tile(tex, W, H, scale):
    t = tex.resize((int(tex.width * scale), int(tex.height * scale)), Image.LANCZOS)
    out = Image.new("RGB", (W, H))
    for y in range(0, H, t.height):
        for x in range(0, W, t.width):
            out.paste(t, (x, y))
    return np.asarray(out, np.float32) / 255


def plate(name, nasa, tex, land, lakes, lon0, lon1, lat0, lat1, ppd, src_ppd=60):
    b = bounds(lon0, lon1, lat0, lat1)
    eq_ppd = min(ppd, src_ppd)
    eq = np.asarray(eq_crop(nasa, lon0, lon1, lat0, lat1, eq_ppd))
    merc = to_merc(eq, lat0, lat1, eq_ppd, lon1 - lon0)
    H0, W0 = merc.shape[:2]
    W = int(round((lon1 - lon0) * ppd))
    H = int(round(W * H0 / W0))
    sat = Image.fromarray(merc).resize((W, H), Image.BICUBIC)
    lum = np.asarray(sat.convert("L"), np.float32) / 255
    m_land = raster_mask([land], b, W, H)
    m_lake = raster_mask([lakes], b, W, H)
    m_land = np.clip(m_land - m_lake, 0, 1)
    # terrain: local contrast of the satellite luminance (mountains read as darker ridges)
    blur = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(max(2, ppd / 6))), np.float32) / 255
    relief = np.clip(0.5 + (lum - blur) * 3.2 - (0.55 - lum) * 0.35, 0, 1)
    paper = tile(tex, W, H, 0.55 if ppd < 40 else 0.9)
    pl = paper.mean(2, keepdims=True)
    land_rgb = paper * (0.80 + 0.32 * relief[..., None])
    land_rgb = land_rgb * np.array([1.0, 0.97, 0.9])
    sea = np.array([0.42, 0.62, 0.62]) * (0.78 + 0.32 * pl)
    # a pale band along the coast, like old engraved maps
    dist = np.asarray(Image.fromarray((m_land * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(ppd / 5 + 2)), np.float32) / 255
    halo = np.clip(dist * 2.2, 0, 1) * (1 - m_land)
    sea = sea * (1 - 0.18 * halo[..., None]) + 0.18 * halo[..., None] * np.array([0.78, 0.85, 0.8])
    rgb = land_rgb * m_land[..., None] + sea * (1 - m_land[..., None])
    # ink coastline
    edge = np.abs(np.asarray(Image.fromarray((m_land * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES), np.float32)) / 255
    edge = np.asarray(Image.fromarray((np.clip(edge * 2, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255
    rgb = rgb * (1 - 0.55 * edge[..., None]) + 0.55 * edge[..., None] * np.array([0.25, 0.2, 0.15])
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).save(OUT / f"{name}.jpg", quality=90)
    print(name, W, H)
    return {"bounds": b, "w": W, "h": H}, sat


def rings(geom, tol):
    out = []
    polys = geom.geoms if hasattr(geom, "geoms") else [geom]
    for p in polys:
        if p.geom_type != "Polygon" or p.area < 0.02:
            continue
        s = p.simplify(tol, preserve_topology=True)
        out.append([[round(mx(x), 1), round(my(y), 1)] for x, y in s.exterior.coords])
    return out


def main() -> None:
    nasa, ne, extra = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    OUT.mkdir(parents=True, exist_ok=True)
    C = countries(ne)
    land = unary_union(list(C.values()))
    lsf = shapefile.Reader(str(extra / "ne_10m_lakes" / "ne_10m_lakes.shp"))
    lakes = unary_union([shape(s.__geo_interface__) for r, s in zip(lsf.records(), lsf.shapes()) if r["scalerank"] <= 2])
    river = mississippi(extra)

    # ---- 1803 blocks
    us_main = C["United States of America"].intersection(box(-125, 24, -66, 50))
    lou = louisiana(river, land)
    usa = us_main.intersection(east_of_river(river)).intersection(box(-98, 31, -60, 50))
    spain_na = unary_union([C[k] for k in ["Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Cuba", "Puerto Rico"] if k in C])
    spain_us = us_main.intersection(box(-125, 24, -60, 42)).difference(lou).difference(usa)
    spain = unary_union([spain_na, spain_us])
    britain_na = C["Canada"]
    jam = unary_union([C[k] for k in ["Jamaica", "The Bahamas"] if k in C])
    haiti = C["Haiti"]
    france_eu = unary_union([C["France"].intersection(box(-6, 41, 10, 52)), C["Belgium"], C["Luxembourg"]])
    britain_eu = unary_union([C["United Kingdom"].intersection(box(-9, 49, 3, 61)), C["Ireland"]])
    india = shape(json.loads((ROOT / "public" / "sentinel" / "geo" / "geo_india.json").read_text())["features"][0]["geometry"])

    geo = {
        "louisiana": rings(lou, 0.05), "usa": rings(usa, 0.05), "spain": rings(spain, 0.05), "britainNA": rings(britain_na, 0.08),
        "britainCarib": rings(jam, 0.01), "haiti": rings(haiti, 0.004), "franceEU": rings(france_eu, 0.02), "britainEU": rings(britain_eu, 0.02),
        "india": rings(india, 0.03),
        "mississippi": [[round(mx(x), 1), round(my(y), 1)] for x, y in LineString(river).simplify(0.02).coords],
        "newOrleans": [round(mx(-90.07), 1), round(my(29.95), 1)],
        "areas_km2": {},
    }
    # true areas (equal-area via local cos(lat) on a fine grid is overkill; use a sinusoidal-ish transform)
    def km2(g):
        polys = g.geoms if hasattr(g, "geoms") else [g]
        tot = 0.0
        for p in polys:
            xs, ys = np.array(p.exterior.coords).T
            X = np.radians(xs) * np.cos(np.radians(ys)) * 6371.0
            Y = np.radians(ys) * 6371.0
            tot += 0.5 * abs(np.dot(X, np.roll(Y, 1)) - np.dot(Y, np.roll(X, 1)))
        return round(tot)
    geo["areas_km2"] = {"louisiana": km2(lou), "india": km2(india), "usa1803": km2(usa)}
    print("areas km2", geo["areas_km2"])

    src = Image.open(nasa)
    tex = Image.open(ROOT / "public" / "louisiana" / "img" / "texture_parchment.png").convert("RGB")
    geo["world"], _ = plate("world", src, tex, land, lakes, -170, 55, 76, -12, 20)
    geo["namerica"], _ = plate("namerica", src, tex, land, lakes, -128, -58, 54, 16, 50)
    geo["europe"], _ = plate("europe", src, tex, land, lakes, -14, 22, 62, 34, 50)
    geo["carib"], sat = plate("carib", src, tex, land, lakes, -88, -60, 28, 12, 100)
    sat.save(OUT / "carib_sat.jpg", quality=90)
    (ROOT / "src" / "louisiana").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "louisiana" / "geo.json").write_text(json.dumps(geo, separators=(",", ":")))
    for k, v in geo.items():
        if isinstance(v, list) and v and isinstance(v[0], list) and isinstance(v[0][0], list):
            print(k, len(v), "rings", sum(len(r) for r in v), "pts")


if __name__ == "__main__":
    main()
