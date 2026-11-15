"""Prepare the creator's GPT images for the Junagadh video.

    python3 -I tools/cut_junagadh_assets.py <raw_dir>

Cut-outs (RGBA): trim the transparent margin and scale the longest side to 1800 px. Full-frame photos (RGB, e.g.
p_patel_somnath): keep them whole, scale the longest side to 2600 px and save as JPEG (they fill the 4K frame).
Writes public/junagadh/img/<name>.(png|jpg) and src/junagadh/edit/assets.ts (name -> aspect, and the file name).
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "junagadh" / "img"


def main() -> None:
    raw = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    meta, files = {}, {}
    for f in sorted(raw.glob("*.png")):
        im = Image.open(f)
        if im.mode == "RGBA":
            box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
            if box:
                pad = 24
                im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
            im.thumbnail((1800, 1800), Image.LANCZOS)
            name = f.stem + ".png"
            im.save(OUT / name, optimize=True)
        else:
            im = im.convert("RGB")
            im.thumbnail((2600, 2600), Image.LANCZOS)
            # a touch of softening: fine photo texture crawls at 4K under a moving camera
            im = im.filter(ImageFilter.GaussianBlur(0.5))
            name = f.stem + ".jpg"
            im.save(OUT / name, quality=93)
        meta[f.stem] = round(im.width / im.height, 4)
        files[f.stem] = name
        print(f.stem, im.size, name)
    ts = ROOT / "src" / "junagadh" / "edit" / "assets.ts"
    ts.write_text("// The creator's GPT images in public/junagadh/img (tools/cut_junagadh_assets.py).\n"
                  f"export const ASPECT: Record<string, number> = {json.dumps(meta, indent=1)};\n"
                  f"export const FILE: Record<string, string> = {json.dumps(files, indent=1)};\n")


if __name__ == "__main__":
    main()
