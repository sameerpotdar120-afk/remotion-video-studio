"""Vectors for the "every second" video (free data only).

    python3 -I tools/build_everysecond_geo.py <ne_dir>

Plates are the world and India plates built for the map-sizes video (tools/build_mapsizes_maps.py: EOX Sentinel-2
cloudless 2024 + AWS terrarium relief), copied to public/everysecond/maps. Countries and continents: Natural Earth
admin-0, India point-of-view edition (India's official boundary). Oil regions are the main producing areas, as points.
"""
import glob
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_thailand_maps import mx, my, rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OIL = {"Gulf": (49.5, 26.0), "Iraq": (46.0, 31.0), "Russia": (70.0, 61.0), "Texas": (-101.0, 31.5), "Canada": (-112.0, 56.5),
       "Venezuela": (-66.0, 8.5), "Nigeria": (6.5, 5.0), "NorthSea": (2.5, 58.0), "Kazakhstan": (54.0, 46.0), "China": (122.0, 40.5),
       "Brazil": (-41.0, -23.0), "Iran": (51.0, 31.5), "Libya": (19.0, 29.0), "Angola": (12.5, -7.5)}


def main() -> None:
    ne = Path(sys.argv[1])
    sf = shapefile.Reader(glob.glob(str(ne / "ne_10m_admin_0_countries_ind*.shp"))[0])
    recs = list(zip(sf.records(), sf.shapes()))
    C = {r["ADMIN"]: shape(s.__geo_interface__).buffer(0) for r, s in recs}
    view = box(-180, -60, 180, 84)
    cont = {}
    for name in ["Asia", "Africa", "South America", "North America", "Europe", "Oceania"]:
        cont[name] = unary_union([shape(s.__geo_interface__).buffer(0) for r, s in recs if r["CONTINENT"] == name]).intersection(view)
    mp = json.loads((ROOT / "src" / "mapsizes" / "geo.json").read_text())
    geo = {
        "plates": {k: mp["plates"][k] for k in ("world", "india")},
        "borders": mp["borders"],
        "countries": {"India": rings(C["India"], 0.01, 0.02)},
        "continents": {k.replace(" ", ""): rings(v, 0.05, 0.4) for k, v in cont.items()},
        "centroids": {k.replace(" ", ""): [round(mx(v.representative_point().x), 0), round(my(v.representative_point().y), 0)] for k, v in cont.items()},
        "oil": {k: [round(mx(x), 0), round(my(y), 0)] for k, (x, y) in OIL.items()},
    }
    geo["centroids"]["India"] = [round(mx(78.8), 0), round(my(22.5), 0)]
    out = ROOT / "src" / "everysecond" / "geo.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(geo, separators=(",", ":")))
    print("geo kB", out.stat().st_size // 1024, list(geo["continents"]))


if __name__ == "__main__":
    main()
