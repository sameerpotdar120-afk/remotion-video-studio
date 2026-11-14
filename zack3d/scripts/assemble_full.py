"""Assemble the full 63.5 s video: frames 1-1907, upscale to 1440x2560 if needed, word-synced captions (2-3 word phrases).
usage: python3 assemble_full.py <frames_dir> <out_dir> [--hold]
--hold fills missing frames with the previous one (animatic only; the final must have every frame)."""
import sys, os, json, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2]); HOLD = '--hold' in sys.argv; OUT.mkdir(parents=True, exist_ok=True)
Z = Path(os.environ.get('ZK_ROOT', '/root/zack'))
W, H, N = 1440, 2560, 1907
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 87)
words = json.load(open(Z / 'anim' / 'vo_words.json')) if (Z / 'anim' / 'vo_words.json').exists() else json.load(open(Z / 'vo_words.json'))

# phrases: break after punctuation, or at 3 words, or when the phrase would exceed 18 characters
phr, cur = [], []
for w in words:
    t = w['w'].strip(); cur.append(w)
    txt = ' '.join(x['w'].strip() for x in cur)
    if re.search(r'[.,!?]$', t) or len(cur) >= 3 or len(re.sub(r'[.,!?]', '', txt)) > 16:
        phr.append(cur); cur = []
if cur: phr.append(cur)
# merge a stranded single word back into the phrase before it (when that one has no end punctuation)
i = 1
while i < len(phr):
    if len(phr[i]) == 1 and not re.search(r'[.,!?]$', phr[i - 1][-1]['w'].strip()) and len(phr[i - 1]) <= 3 and len(' '.join(x['w'].strip() for x in phr[i - 1] + phr[i])) <= 22:
        phr[i - 1] += phr.pop(i)
    else: i += 1
FIX = {'plane': 'plain'}
CAPS = []
for i, p in enumerate(phr):
    s = p[0]['s']; e = phr[i + 1][0]['s'] if i + 1 < len(phr) else 63.6
    txt = re.sub(r'[.,!?]', '', ' '.join(FIX.get(x['w'].strip().lower(), x['w'].strip()) for x in p))
    txt = txt[0].upper() + txt[1:].lower() if i == 0 or re.search(r'[.!?]$', phr[i - 1][-1]['w'].strip()) else txt.lower()
    txt = re.sub(r'\bi\b', 'I', txt)
    CAPS.append((s, e, txt))
json.dump(CAPS, open(OUT / 'captions.json', 'w'), indent=0)

cache = {}
def caption(text):
    if text in cache: return cache[text]
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    l, t, r, b = FONT.getbbox(text, stroke_width=3); x, y = (W - (r - l)) // 2 - l, 1960 - t
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x + 3, y + 5), text, font=FONT, fill=(0, 0, 0, 120), stroke_width=3, stroke_fill=(0, 0, 0, 120))
    lay = Image.alpha_composite(lay, sh.filter(ImageFilter.GaussianBlur(3)))
    ImageDraw.Draw(lay).text((x, y), text, font=FONT, fill=(255, 255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0, 255))
    cache[text] = lay; return lay

last, missing = None, []
for f in range(1, N + 1):
    p = SRC / f'f_{f:04d}.png'
    if p.exists(): last = p
    else:
        missing.append(f)
        if not HOLD or last is None: continue
    im = Image.open(last if not p.exists() else p).convert('RGB')
    if im.size != (W, H): im = im.resize((W, H), Image.LANCZOS)
    t = (f - 1) / 30; cap = next((c[2] for c in CAPS if c[0] <= t < c[1]), None)
    if cap: im = Image.alpha_composite(im.convert('RGBA'), caption(cap)).convert('RGB')
    im.save(OUT / f'p_{f:04d}.png', compress_level=1)
print('missing frames:', len(missing), missing[:20])
