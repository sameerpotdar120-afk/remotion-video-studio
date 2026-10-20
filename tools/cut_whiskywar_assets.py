"""Prepare the creator's Whisky War images for the edit.

    python3 -I tools/cut_whiskywar_assets.py <folder with the PNGs>

The two 9:16 backgrounds (the beach, the newspaper) become 2160×3840 JPEGs; every prop and person (on white) is keyed
to a transparent PNG, cropped and capped at 2000 px; Tom Høyem's face is cropped into a square for the round portrait.
Missing files are skipped, so it can run again as more images arrive. Writes public/whiskywar/img/ and
public/whiskywar/img_sizes.json.
"""
import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_closestspace_assets import key  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "whiskywar" / "img"
BGS = ["wk01_arctic_beach_bg", "wk02_newspaper_bg"]
PROPS = ["wk03_hans_island_model", "wk04_tom_hoyem", "wk04b_tom_hoyem_arm", "wk05_canadian_soldier", "wk06_helicopter", "wk06b_helicopter_rotor",
         "wk07_schnapps_bottle", "wk08_whisky_bottle", "wk09_letter"]


def main() -> None:
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sp = ROOT / "public" / "whiskywar" / "img_sizes.json"
    sizes = json.loads(sp.read_text()) if sp.exists() else {}
    for name in BGS:
        f = src / f"{name}.png"
        if f.exists():
            im = Image.open(f).convert("RGB").resize((2160, 3840), Image.LANCZOS)
            im.save(OUT / f"{name}.jpg", quality=92)
            sizes[name] = {"w": 2160, "h": 3840, "ext": "jpg"}
    for name in PROPS:
        f = src / f"{name}.png"
        if f.exists():
            im, _ = key(Image.open(f))
            im.save(OUT / f"{name}.png", optimize=True)
            sizes[name] = {"w": im.width, "h": im.height}
            if name == "wk04_tom_hoyem":
                # the head: the top ~18% of the figure, a centred square
                s = round(im.height * 0.17)
                face = im.crop((im.width // 2 - s // 2, round(im.height * 0.01), im.width // 2 + s // 2, round(im.height * 0.01) + s))
                bg = Image.new("RGBA", face.size, (201, 194, 180, 255))
                bg.alpha_composite(face)
                bg.convert("RGB").save(OUT / "wk04_tom_hoyem_face.jpg", quality=92)
                sizes["wk04_tom_hoyem_face"] = {"w": s, "h": s, "ext": "jpg"}
    sp.write_text(json.dumps(sizes))
    print(sizes)


if __name__ == "__main__":
    main()
