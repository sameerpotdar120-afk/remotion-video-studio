#!/bin/bash
# usage: k1cmp.sh tag [ZK_K1 json]  -> ~/zack/tune/<tag>_full.jpg (ref 0.3 | ours)
T=$1; mkdir -p ~/zack/tune/$T; cd ~/zack
ZK_K1="${2:-{\}}" bin/blender-4.5.15-linux-x64/blender -b --python scripts/shots_me.py -- k1 tune/$T 50 64 2>&1 | grep -E "Error|Traceback"
python3 -c "
from PIL import Image
r=Image.open('/home/user/remotion-video-studio/zack3d/ref/ref_0.3.png').convert('RGB').resize((720,1280))
b=Image.open('/root/zack/tune/$T/f_0010.png').convert('RGB').resize((720,1280))
c=Image.new('RGB',(1440,1280)); c.paste(r,(0,0)); c.paste(b,(720,0)); c.save('/root/zack/tune/${T}_full.jpg',quality=90)"
