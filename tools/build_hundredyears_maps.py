"""Satellite and parchment plates and historical vectors for the Hundred Years' War video (4K 60 fps).

    python3 -I tools/build_hundredyears_maps.py <tile_cache> <ne_dir> [plate names, or "none" for vectors only]

Satellite: EOX Sentinel-2 cloudless 2024 (CC BY 4.0, credited on screen), flat Web Mercator plates. The parchment
plate for the 1337 section is made from the satellite plate (land toned to tan relief, sea to slate) with a Natural
Earth land mask. Borders: Natural Earth (public domain). The historical shapes are built from modern departments and
are approximate: England = England + Wales; English France in 1337 = Gascony; in 1429 = Normandy, Maine, the Paris
region, Picardy, Artois and Champagne plus Gascony; Burgundy in 1429 = the duchy plus Flanders and the Low Countries;
English France in 1453 = the Pale of Calais.
"""
import glob
import json
import sys
from pathlib import Path

import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import Point, box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_thailand_maps import mx, my, rings, stitch  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "hundredyears" / "maps"
CAP = 8192
PLATES = [  # name, zoom, lon0, lon1, lat0, lat1
    ("europe", 7, -16.0, 32.0, 33.0, 63.0),
    ("france", 9, -6.0, 10.0, 41.0, 52.5),
    ("north", 10, -1.5, 6.5, 47.0, 51.5),
]
PLACES = {
    "london": (-0.13, 51.51), "paris": (2.35, 48.86), "domremy": (5.6847, 48.4417), "orleans": (1.9093, 47.9030), "reims": (4.0317, 49.2583),
    "compiegne": (2.8258, 49.4179), "rouen": (1.0993, 49.4431), "calais": (1.8587, 50.9513), "chinon": (0.2420, 47.1670), "crecy": (1.88, 50.25),
    "agincourt": (2.13, 50.46), "castillon": (-0.04, 44.85), "patay": (1.70, 48.05), "bordeaux": (-0.58, 44.84), "dijon": (5.04, 47.32),
    "channel": (1.0, 50.3), "france_mid": (2.4, 46.6), "england_mid": (-1.6, 52.6),
}
GASCONY = ["Gironde", "Landes", "Pyrénées-Atlantiques"]
EN_1429 = ["Manche", "Calvados", "Orne", "Eure", "Seine-Maritime", "Sarthe", "Mayenne", "Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne",
           "Essonne", "Yvelines", "Val-d'Oise", "Seien-et-Marne", "Eure-et-Loir", "Oise", "Somme", "Pas-de-Calais", "Aisne", "Marne", "Aube"] + GASCONY
CHAMPAGNE = ["Aisne", "Marne", "Aube"]
BURGUNDY_FR = ["Côte-d'Or", "Saône-et-Loire", "Yonne", "Nord", "Ardennes"]


def parchment(src: Path, land_rings: list, b: list, dst: Path) -> None:
    """Tan relief land and slate sea from the satellite plate and a land mask (the reference's 1337 map look)."""
    im = Image.open(src).convert("RGB")
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    for r in land_rings:
        d.polygon([((x - b[0]) / (b[2] - b[0]) * w, (b[3] - y) / (b[3] - b[1]) * h) for x, y in r], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.5))
    a = np.asarray(im).astype(np.float32) / 255
    lum = a.mean(axis=2)
    detail = lum - np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    land = np.array([0.80, 0.68, 0.52]) * (0.92 + detail[..., None] * 2.4 + (lum[..., None] - 0.35) * 0.25)
    sea = np.array([0.40, 0.52, 0.53]) + (np.random.default_rng(3).random((h, w, 1)) - 0.5) * 0.015
    m = (np.asarray(mask).astype(np.float32) / 255)[..., None]
    out = np.clip(land * m + sea * (1 - m), 0, 1)
    Image.fromarray((out * 255).astype(np.uint8)).save(dst, quality=90)


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "hundredyears" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    for name, z, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        im, b = stitch(z, lo0, lo1, la0, la1, cache / "eox")
        f = min(1.0, CAP / max(im.size))
        if f < 1:
            im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
        im.save(OUT / f"{name}_sat.jpg", quality=90)
        geo["plates"][name] = {"bounds": [round(v, 1) for v in b], "w": im.width, "h": im.height}
        if name == "europe":
            land = unary_union([g for g in C.values() if g.intersects(box(lo0 - 5, la0 - 5, lo1 + 5, la1 + 5))]).intersection(box(lo0 - 2, la0 - 2, lo1 + 2, la1 + 2))
            parchment(OUT / "europe_sat.jpg", rings(land, 0.01, 0.0005), b, OUT / "europe_parch.jpg")
            geo["plates"]["europe_parch"] = geo["plates"]["europe"]
        print(name, im.size, flush=True)

    st = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_1_states_provinces_lakes" / "*.shp"))[0])
    recs = list(zip(st.records(), st.shapes()))
    dep = {r["name"]: shape(s.__geo_interface__).buffer(0) for r, s in recs if r["adm0_a3"] == "FRA"}
    gbr = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in recs if r["adm0_a3"] == "GBR" and r["geonunit"] in ("England", "Wales")])
    U = lambda names: unary_union([dep[n] for n in names])
    france = C["France"].intersection(box(-5.5, 41.3, 9.8, 51.2))
    en1429 = U(EN_1429)
    bur = U(BURGUNDY_FR)
    low = unary_union([C["Belgium"], C["Netherlands"], C["Luxembourg"]])
    calais = france.intersection(Point(1.86, 50.92).buffer(0.22))
    geo["england"] = rings(gbr, 0.01, 0.003)
    geo["scotland"] = rings(unary_union([shape(s.__geo_interface__).buffer(0) for r, s in recs if r["adm0_a3"] == "GBR" and r["geonunit"] == "Scotland"]), 0.02, 0.005)
    geo["france"] = rings(france, 0.01, 0.003)
    geo["en_1337"] = rings(U(GASCONY), 0.01, 0.003)
    geo["en_1429"] = rings(en1429, 0.01, 0.003)
    geo["en_1430"] = rings(en1429.difference(U(CHAMPAGNE)), 0.01, 0.003)
    geo["burgundy"] = rings(unary_union([bur, low]), 0.01, 0.003)
    geo["dauphin_1429"] = rings(france.difference(en1429).difference(bur), 0.01, 0.003)
    geo["en_1453"] = rings(calais, 0.005, 0.0005)
    geo["europe_land"] = rings(unary_union([g for n, g in C.items() if g.intersects(box(-16, 33, 32, 63))]).intersection(box(-16, 33, 32, 63)), 0.04, 0.05)
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024)


if __name__ == "__main__":
    main()
