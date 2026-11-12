"""Shorts thumbnail/cover: a caption-free frame + 1-3 words (white line + gold line, black outline, soft shadow, darkened top band).
usage: python3 thumbnail.py frame.jpg out.jpg "THE" "LOOPHOLE" [--font fonts/montserrat-latin-900-normal.woff2]
Get the clean frame first:  QS='&nocap' SOFTWARE_GL=1 node tools/capture.mjs frames review/thumb "34.6"
Also writes out_feed.png (180x320) so you can check it reads at phone-feed size. Rule: the cover never repeats the title's words."""
import sys, argparse
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ap = argparse.ArgumentParser(); ap.add_argument('frame'); ap.add_argument('out'); ap.add_argument('line1'); ap.add_argument('line2', nargs='?', default='')
ap.add_argument('--font', default='fonts/montserrat-latin-900-normal.woff2'); a = ap.parse_args()
bg = Image.open(a.frame).convert('RGBA'); W, H = bg.size
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y in range(0, int(H * 0.36)): d.line([(0, y), (W, y)], fill=(10, 8, 30, int(170 * (1 - y / (H * 0.36)))))
im = Image.alpha_composite(bg, ov)
def text(img, s, y, size, fill, stroke=14):
    f = ImageFont.truetype(a.font, size); dr = ImageDraw.Draw(img)
    while dr.textbbox((0, 0), s, font=f, stroke_width=stroke)[2] > W * 0.92 and size > 60: size -= 6; f = ImageFont.truetype(a.font, size)
    l, t, r, b = dr.textbbox((0, 0), s, font=f, stroke_width=stroke); x = (W - (r - l)) // 2 - l
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x + 6, y + 12), s, font=f, fill=(0, 0, 0, 170), stroke_width=stroke, stroke_fill=(0, 0, 0, 170))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(8)))
    ImageDraw.Draw(img).text((x, y), s, font=f, fill=fill, stroke_width=stroke, stroke_fill=(15, 10, 25)); return img
if a.line2: im = text(im, a.line1, int(H * 0.078), 150, (255, 255, 255)); im = text(im, a.line2, int(H * 0.16), 170, (255, 205, 50))
else: im = text(im, a.line1, int(H * 0.1), 170, (255, 205, 50))
im = im.convert('RGB'); im.save(a.out, quality=94); im.resize((180, 320), Image.LANCZOS).save(a.out.rsplit('.', 1)[0] + '_feed.png')
print('wrote', a.out)
