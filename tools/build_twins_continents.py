"""Continent outlines for the Twin countries hook (they glow one after another on "दुनिया में कुछ देश").

    python3 -I tools/build_twins_continents.py <ne_dir>

Natural Earth admin-0 countries (public domain), India point-of-view edition, merged by its CONTINENT field.
"""
import json
import sys
from pathlib import Path

import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_spain_maps import rings  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
KEEP = {"Africa": "africa", "Asia": "asia", "Europe": "europe", "South America": "samerica", "North America": "namerica", "Oceania": "oceania"}


def main() -> None:
    ne = Path(sys.argv[1])
    sf = shapefile.Reader(str(ne / "ind" / "ne_10m_admin_0_countries_ind.shp"))
    groups: dict[str, list] = {}
    for r, s in zip(sf.records(), sf.shapes()):
        k = KEEP.get(r["CONTINENT"])
        if k:
            groups.setdefault(k, []).append(shape(s.__geo_interface__).buffer(0))
    out = {}
    for k, gs in groups.items():
        g = unary_union(gs).buffer(0.08).buffer(-0.08).intersection(box(-179.9, -60, 179.9, 84))
        parts = [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if p.area > 2.0]
        out[k] = rings(unary_union(parts), 0.12)
        print(k, len(parts), sum(len(r) for r in out[k]))
    (ROOT / "src" / "twins" / "continents.json").write_text(json.dumps(out, separators=(",", ":")))


if __name__ == "__main__":
    main()
