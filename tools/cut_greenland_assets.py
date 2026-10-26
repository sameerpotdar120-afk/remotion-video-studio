"""Size the creator's Greenland images for the edit (cut-outs to transparent PNG, scenes to JPG).

    python3 -I tools/cut_greenland_assets.py <folder with the PNGs> <folder with the *_alpha.png cut-outs>

Cut-outs that came with their own alpha (titles, longship, ravens, helmet, spyglass) are used as they are; Flóki, Erik
and the hut are keyed here like West Indies (only the white touching the border, hole-filled). The images were made
at about 1.2–1.7K and upscaled, so everything is stored at its native size. Writes public/greenland/img/ and
img_sizes.json.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from PIL import Image  # noqa: E402
from cut_westindies_assets import key  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "greenland" / "img"
KEY = {"gl01_floki_viking": 1450, "gl02_erik_the_red": 1450, "gl07_snowed_turf_hut": 1300}
ALPHA = {"gl03_longship": 1700, "gl04_raven_wings_up": 900, "gl04b_raven_wings_down": 900, "gl08_viking_helmet": 700, "gl09_title_greenland_grass": 1700,
         "gl09b_title_greenland_ice": 1700, "gl10_title_iceland_ice": 1700, "gl10b_title_iceland_grass": 1700, "gl12_spyglass_eyepiece": 1300}
BGS = {"gl05_fjord_drift_ice_bg": 1700, "gl06_iceland_green_valley": 1700, "gl06b_iceland_hot_spring": 1700, "gl06c_iceland_volcano": 1700,
       "gl11_ice_sheet_texture": 1600, "gl13_parchment_texture": 1700}


def fit(im: Image.Image, cap: int) -> Image.Image:
    k = min(1.0, cap / max(im.size))
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1 else im


def main() -> None:
    src, alp = Path(sys.argv[1]), Path(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for name, cap in KEY.items():
        im = key(Image.open(src / f"{name}.png"), cap=cap)
        im.save(OUT / f"{name}.png", optimize=True)
        sizes[name] = {"w": im.width, "h": im.height}
    for name, cap in ALPHA.items():
        im = Image.open(alp / f"{name}_alpha.png").convert("RGBA")
        im = fit(im.crop(im.getbbox()), cap)
        im.save(OUT / f"{name}.png", optimize=True)
        sizes[name] = {"w": im.width, "h": im.height}
    for name, cap in BGS.items():
        im = fit(Image.open(src / f"{name}.png").convert("RGB"), cap)
        im.save(OUT / f"{name}.jpg", quality=92)
        sizes[name] = {"w": im.width, "h": im.height, "ext": "jpg"}
    (ROOT / "public" / "greenland" / "img_sizes.json").write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
