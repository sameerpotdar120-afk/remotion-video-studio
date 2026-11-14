#!/bin/bash
# usage: strip.sh <script.py> <anim name> <step> [ZK env name] [ZK json] [extra args...]  -> ~/zack/anim/<name>_strip.jpg
S=$1; N=$2; ST=$3; EN=$4; EJ=$5; shift 5
cd ~/zack; rm -rf anim/t_$N; python3 -c "
import json; a=json.load(open('anim/$N.json')); a['out']='/root/zack/anim/t_$N'; a['step']=$ST; open('anim/run_$N.json','w').write(json.dumps(a))"
env ZK_ANIM="$(cat anim/run_$N.json)" ${EN:+$EN="$EJ"} bin/blender-4.5.15-linux-x64/blender -b --python scripts/$S -- "$@" 2>&1 | grep -E "Error|Traceback|line [0-9]" | head -5
python3 -c "
from PIL import Image, ImageDraw
import glob
fs=sorted(glob.glob('/root/zack/anim/t_$N/f_*.png'))
c=Image.new('RGB',(len(fs)*200,356))
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((200,356)); ImageDraw.Draw(im).text((4,4),f.split('_')[-1][:4],fill='yellow'); c.paste(im,(i*200,0))
c.save('/root/zack/anim/${N}_strip.jpg',quality=85)"
