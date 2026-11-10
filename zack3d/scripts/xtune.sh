#!/bin/bash
# usage: xtune.sh tag 'json' -> prints crumpled / bottom / dermis means vs ref 13.0
T=$1; cd ~/zack; ZK_X="$2" bin/blender-4.5.15-linux-x64/blender -b --python scripts/xsec.py -- tune/x/$T.png 25 16 >/dev/null 2>&1
python3 - <<PY
from PIL import Image
import numpy as np
def m(f,b):
    a=np.asarray(Image.open(f).convert('RGB').resize((1440,2560))).astype(float); return a[b[1]:b[3],b[0]:b[2]].reshape(-1,3).mean(0).astype(int).tolist()
o='tune/x/$T.png'
print('$T crumpled', m(o,(620,900,820,1500)), 'ref [164, 88, 93] | bottom', m(o,(300,2350,1200,2500)), 'ref [155, 39, 36] | dermis', m(o,(620,100,820,400)), 'ref [203, 135, 100] | blade', m(o,(350,600,500,1200)), 'ref [240, 180, 106]')
PY
