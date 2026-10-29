"""Size the creator's Chandigarh images for the edit (cut-outs to transparent PNG, scenes and textures to JPG).

    python3 -I tools/cut_chandigarh_assets.py <folder with the images>

Props came on white and are keyed the West Indies way (only the white touching the border, hole-filled). Scenes, cards
and textures stay JPG. Sizes are capped near how big each one gets on screen at 4K. The gp10 sun and gp19 pin (reused
from the Garbage Patch video) are left as they are. Writes public/chandigarh/img/ and img_sizes.json, keeping any marked
points (the roof, the facade); skips images that haven't arrived.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image  # noqa: E402
from cut_garbagepatch_assets import cut, find, fit  # noqa: E402

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "chandigarh" / "img"
KEY = {"cg11_retro_computer": 1000, "cg13_icon_drainage": 700, "cg14_icon_fertile_soil": 700, "cg15_icon_water": 700, "cg16_brain": 900,
       "cg17_heart": 900, "cg18_lungs": 900, "cg24_car": 900, "cg26_blank_gold_seal": 1000}
JPG = {"cg01_chandi_temple": 3840, "cg02_le_corbusier": 3840, "cg03_palace_of_assembly": 3840, "cg04_secretariat": 3840, "cg05_high_court": 3840,
       "cg06_sector17_plaza": 1400, "cg07_sector_homes": 1000, "cg08_sector_school": 1000, "cg09_sector_hospital": 1000, "cg10_lahore_badshahi": 1100,
       "cg12_human_body_glow": 1400, "cg19_jute_texture": 1600, "cg20_water_ribbon_texture": 1200, "cg21_paper_texture": 2400,
       "cg22_red_glitter_texture": 2400, "cg23_gold_glitter_texture": 1600, "cg25_sector17_aerial": 2400}
# points on the photos for the overlays (image px on the creator's 2160-wide originals), traced by hand: the High Court's curved roof slab
# and the Secretariat's brise-soleil grid
PTS = {"cg05_high_court": {"roof": [[0, 580], [770, 300], [1100, 800], [1500, 1350], [1800, 1700], [2080, 1780], [2060, 1840], [1800, 1960], [1600, 1880],
                                    [1300, 1520], [900, 1060], [400, 820], [0, 880]]},
       "cg04_secretariat": {"facade": [[1880, 40], [1880, 2280], [1500, 2380], [1000, 2480], [520, 2560], [520, 1880], [800, 1500], [1200, 1000], [1600, 450]]}}


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sp = ROOT / "public" / "chandigarh" / "img_sizes.json"
    sizes = json.loads(sp.read_text()) if sp.exists() else {}
    for name, cap in KEY.items():
        f = find(src, name)
        if f:
            im = cut(Image.open(f), cap)
            bb = im.getchannel("A").getbbox()
            im = im.crop(bb) if bb else im
            im.save(OUT / f"{name}.png", optimize=True)
            sizes[name] = {**sizes.get(name, {}), "w": im.width, "h": im.height, "ext": "png"}
    for name, cap in JPG.items():
        f = find(src, name)
        if f:
            im = fit(Image.open(f).convert("RGB"), cap)
            im.save(OUT / f"{name}.jpg", quality=90)
            sizes[name] = {**sizes.get(name, {}), "w": im.width, "h": im.height, "ext": "jpg"}
    for name, pts in PTS.items():
        if name in sizes:
            k = sizes[name]["w"] / 2160
            sizes[name]["pts"] = {n: [[round(x * k), round(y * k)] for x, y in ring] for n, ring in pts.items()}
    sp.write_text(json.dumps(sizes, indent=0))
    print(len(sizes), sorted(sizes))


if __name__ == "__main__":
    main()
