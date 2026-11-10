# render s1 frame 10 small with a ZK_LOOK and measure the colour boxes vs the reference
import sys, os, json, subprocess, time
import numpy as np
from PIL import Image
look = sys.argv[1]; tag = sys.argv[2]
out = os.path.expanduser(f'~/zack/tune/{tag}'); os.makedirs(out, exist_ok=True)
t = time.time()
subprocess.run([os.path.expanduser('~/zack/bin/blender-4.5.15-linux-x64/blender'), '-b', '--python', os.path.expanduser('~/zack/scripts/shots_me.py'), '--', 's1', out, '25', '16', '10', '10'],
               env={**os.environ, 'ZK_LOOK': look}, capture_output=True)
im = np.asarray(Image.open(f'{out}/f_0010.png').convert('RGB').resize((1440, 2560))).astype(float)
def m(b): return im[b[1]:b[3], b[0]:b[2]].reshape(-1, 3).mean(0).round().astype(int).tolist()
R = {'sky corner': ((40, 40, 300, 300), [42, 165, 208]), 'skin ground': ((100, 2300, 1300, 2500), [233, 147, 99])}
for k, (b, ref) in R.items():
    o = m(b); print(f'{tag}: {k:12s} ours {o} ref {ref} diff {[o[i]-ref[i] for i in range(3)]}')
print(f'{tag}: {time.time()-t:.0f}s')
