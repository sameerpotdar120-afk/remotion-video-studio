"""GeoLayers-style plates and vectors for the Panama Canal video (house style, free data only).

    python3 -I tools/build_panama_maps.py <tile_cache> <ne_dir> [plate names]

Same recipe as tools/build_ukweather_maps.py: EOX Sentinel-2 cloudless 2024 (CC BY 4.0) + AWS terrarium relief
(SRTM/NASA, ETOPO1/NOAA), multi-directional hillshade soft-lit onto the land, a depth-tinted sea with seabed relief,
then the teal/warm grade. Countries from Natural Earth's India point-of-view edition (public domain). The canal
centre line is traced by hand from the satellite plate (approximate).
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import shape

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ukweather_maps as uk  # noqa: E402
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
uk.OUT = ROOT / "public" / "panama" / "maps"
PLATES = [  # name, satellite zoom, dem zoom, lon0, lon1, lat0, lat1
    ("americas", 4, 3, -135.0, -25.0, -60.0, 52.0),
    ("isthmus", 8, 7, -84.0, -76.5, 6.5, 11.0),
    ("canal", 12, 10, -80.55, -79.3, 8.55, 9.5),
    ("approach", 13, 11, -79.7, -79.3, 8.6, 9.0),
]
PLACES = {"colon": (-79.90, 9.36), "gatun_locks": (-79.92, 9.27), "gatun_lake": (-79.85, 9.17), "pedro_miguel": (-79.613, 9.017),
          "miraflores": (-79.592, 8.998), "panama_city": (-79.52, 8.98), "pacific_anchor": (-79.50, 8.83), "atlantic_anchor": (-79.93, 9.42),
          "rio_indio_dam": (-80.08, 8.92), "cape_horn": (-67.27, -55.98)}
# the canal's centre line, Atlantic → Pacific (approximate, traced from the plate)
CANAL = [(-79.915, 9.42), (-79.915, 9.36), (-79.918, 9.28), (-79.90, 9.24), (-79.86, 9.20), (-79.80, 9.16), (-79.74, 9.12), (-79.69, 9.10),
         (-79.66, 9.07), (-79.635, 9.045), (-79.613, 9.017), (-79.592, 8.998), (-79.575, 8.965), (-79.56, 8.93), (-79.53, 8.88)]


def main() -> None:
    cache, ne = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    uk.OUT.mkdir(parents=True, exist_ok=True)
    gj = ROOT / "src" / "panama" / "geo.json"
    geo = json.loads(gj.read_text()) if gj.exists() else {}
    geo.setdefault("plates", {})
    for name, zs, zd, lo0, lo1, la0, la1 in PLATES:
        if only and name not in only:
            continue
        geo["plates"][name] = uk.build(name, zs, zd, lo0, lo1, la0, la1, cache, sat_water=True)
        print(name, geo["plates"][name]["w"], geo["plates"][name]["h"], flush=True)
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind" / "*.shp"))[0])
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in zip(sf.records(), sf.shapes())}
    geo["panama"] = rings(C["Panama"], 0.004, 0.0005)
    geo["colombia"] = rings(C["Colombia"], 0.02, 0.01)
    geo["samerica"] = {k: rings(C[k], 0.05, 0.05) for k in ["Brazil", "Argentina", "Peru", "Chile", "Bolivia", "Venezuela", "Colombia", "Ecuador", "Paraguay", "Uruguay", "Guyana", "Suriname"] if k in C}
    geo["places"] = {k: [round(mx(a), 1), round(my(b), 1)] for k, (a, b) in PLACES.items()}
    geo["places_deg"] = PLACES
    geo["canal"] = [[round(mx(a), 1), round(my(b), 1)] for a, b in CANAL]
    gj.parent.mkdir(parents=True, exist_ok=True)
    gj.write_text(json.dumps(geo, separators=(",", ":"), ensure_ascii=False))
    print("geo kB", len(gj.read_text()) // 1024)


if __name__ == "__main__":
    main()
