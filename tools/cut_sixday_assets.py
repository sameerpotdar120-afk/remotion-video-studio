"""Cut the creator's Six-Day War assets (AI-generated, the creator's own) for the edit.

    python3 -I tools/cut_sixday_assets.py <raw_dir> <out_dir>

Props (RGBA): trimmed to their alpha, longest side 1600 px, WebP with alpha. Portraits: 1200x1500 WebP.
Breathers and the desk diorama: 3840x2160 WebP q90.
"""
import os
import sys

from PIL import Image

raw, out = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(raw)):
    im = Image.open(os.path.join(raw, f))
    name = f[:-4]
    if im.mode == "RGBA":
        a = im.getchannel("A").point(lambda v: 255 if v > 8 else 0)
        im = im.crop(a.getbbox())
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(os.path.join(out, name + ".webp"), quality=92, method=6)
    elif name.startswith("q_"):
        im.convert("RGB").resize((1200, 1500), Image.LANCZOS).save(os.path.join(out, name + ".webp"), quality=92, method=6)
    else:
        im.convert("RGB").save(os.path.join(out, name + ".webp"), quality=90, method=6)
    print(name, im.size)
