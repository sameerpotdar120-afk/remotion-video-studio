"""Install the user's Hiroshima images from extracted zip folders into public/hiroshima/assets.
- re-encodes every PNG (repairs the 6 files truncated in the zips; their missing rows were empty transparent space)
- backgrounds -> high-quality JPG (opaque, faster to load); bg_room_clock: 111 black rows cropped off the bottom
- writes src/hiroshima/assets.generated.json: size + alpha bounding box (fraction of canvas) for every image
usage: python3 -I scripts/hiroshima/install_assets.py <extracted dir> """
import glob, json, os, re, sys
import numpy as np
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
SRC = sys.argv[1]; OUT = 'public/hiroshima/assets'; meta = {}
for f in sorted(glob.glob(f'{SRC}/p*/*/*.png')):
    rel = re.sub(r'^.*/p\d+/', '', f); grp, name = rel.split('/')
    if name == 'sheet_couple.png': continue
    im = Image.open(f); im.load()
    os.makedirs(f'{OUT}/{grp}', exist_ok=True)
    if grp == 'bg':
        im = im.convert('RGB')
        if name == 'bg_room_clock.png': im = im.crop((0, 0, im.width, im.height - 111))
        dst = f'{OUT}/bg/{name[:-4]}.jpg'; im.save(dst, quality=92, optimize=True)
        meta[f'bg/{name[:-4]}.jpg'] = dict(w=im.width, h=im.height)
    else:
        im = im.convert('RGBA'); a = np.asarray(im)[..., 3]
        ys, xs = np.nonzero(a > 16)
        dst = f'{OUT}/{grp}/{name}'; im.save(dst, optimize=True)
        meta[f'{grp}/{name}'] = dict(w=im.width, h=im.height, box=[round(xs.min() / im.width, 4), round(ys.min() / im.height, 4), round((xs.max() + 1) / im.width, 4), round((ys.max() + 1) / im.height, 4)])
os.makedirs('src/hiroshima', exist_ok=True)
json.dump(meta, open('src/hiroshima/assets.generated.json', 'w'), indent=1)
print(len(meta), 'assets installed')
