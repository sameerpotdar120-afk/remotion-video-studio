"""Assemble the 5 s preview: frames 1-150 at 1440x2560, whip blur at cuts, PIL captions.
usage: python3 assemble.py <out_dir>
Sources: ~/zack/render/f_####.png (my shots) and ~/zack/render/x/f_####.png (frames extracted from helper mp4s).
A missing frame holds the nearest earlier frame of the same shot."""
import sys, os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

Z = Path.home() / 'zack'
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
W, H = 1440, 2560
SHOTS = [(1, 24), (25, 45), (46, 56), (57, 114), (115, 129), (130, 150)]
CAPS = [(0.0, 0.99, 'when a horse fly'), (0.99, 1.75, 'bites you'), (1.75, 2.42, 'it presses'),
        (2.42, 4.12, 'six needle like tools'), (4.12, 5.01, 'against your skin')]
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 87)


def src(f):
    for d in (Z / 'render', Z / 'render' / 'x'):
        p = d / f'f_{f:04d}.png'
        if p.exists():
            return p
    return None


def caption(text):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    l, t, r, b = FONT.getbbox(text, stroke_width=3)
    x, y = (W - (r - l)) // 2 - l, 1960 - t
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x + 3, y + 5), text, font=FONT, fill=(0, 0, 0, 120), stroke_width=3, stroke_fill=(0, 0, 0, 120))
    lay = Image.alpha_composite(lay, sh.filter(ImageFilter.GaussianBlur(3)))
    ImageDraw.Draw(lay).text((x, y), text, font=FONT, fill=(255, 255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0, 255))
    return lay


CAPIMG = {c[2]: caption(c[2]) for c in CAPS}
cut_near = {}
for a, b in SHOTS[1:]:
    cut_near[a - 1] = 1; cut_near[a] = 1
    cut_near[a - 2] = 0.5; cut_near[a + 1] = 0.5

last = {}
for f in range(1, 151):
    shot = next(i for i, (a, b) in enumerate(SHOTS) if a <= f <= b)
    p = src(f)
    if p is None:
        p = last.get(shot)
        if p is None:  # nothing yet in this shot: take the next available in it
            p = next((src(g) for g in range(f, SHOTS[shot][1] + 1) if src(g)), None)
    if p is None:
        im = Image.new('RGB', (W, H), (30, 150, 205))
    else:
        last[shot] = p
        im = Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)
    k = cut_near.get(f)
    if k:  # horizontal whip blur: stretch-blur via squeeze/expand
        r = int(60 * k)
        sm = im.resize((W // r * 2 if r > 2 else W, H), Image.BILINEAR).resize((W, H), Image.BILINEAR)
        im = Image.blend(im, sm.filter(ImageFilter.BoxBlur(2)), 0.85)
    t = (f - 1) / 30
    txt = next(c[2] for c in CAPS if c[0] <= t < c[1])
    im = Image.alpha_composite(im.convert('RGBA'), CAPIMG[txt]).convert('RGB')
    im.save(OUT / f'p_{f:04d}.png', compress_level=1)
print('done', OUT)
