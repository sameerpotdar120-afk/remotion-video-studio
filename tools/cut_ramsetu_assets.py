"""Prepare the creator's GPT images for the Ram Setu video.

    python3 -I tools/cut_ramsetu_assets.py <raw_dir>

Trims the transparent margin, scales the longest side to 1800 px (props are at most about 900 px on the 4K frame
times two), and writes public/ramsetu/img/<name>.png plus src/ramsetu/edit/assets.ts (which ones exist, and
their aspect). Images made on black (l_bolt, s_light_streak, s_sun, s_stars) get their black turned into transparency.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "ramsetu" / "img"
MAX = 1800


def main() -> None:
    raw = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for f in sorted(raw.glob("*.png")):
        im = Image.open(f)
        if im.mode == "RGBA":
            box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
            if box:
                pad = 24
                box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
                im = im.crop(box)
        else:
            # made on black: turn the black into real transparency (alpha = brightness, colour un-premultiplied), so the
            # light composites correctly inside faded or transformed groups, where a screen blend would not
            import numpy as np
            a = np.asarray(im.convert("RGB")).astype(np.float32) / 255
            al = a.max(axis=2, keepdims=True)
            rgb = np.where(al > 1e-3, a / np.maximum(al, 1e-3), 0)
            im = Image.fromarray((np.concatenate([rgb, al], axis=2) * 255).round().astype(np.uint8), "RGBA")
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        im.save(OUT / f.name, optimize=True)
        meta[f.stem] = round(im.width / im.height, 4)
        print(f.stem, im.size)
    ts = ROOT / "src" / "ramsetu" / "edit" / "assets.ts"
    ts.write_text("// The creator's GPT images in public/ramsetu/img (tools/cut_ramsetu_assets.py): name -> aspect (w/h).\n"
                  f"export const ASPECT: Record<string, number> = {json.dumps(meta, indent=1)};\n")


if __name__ == "__main__":
    main()
