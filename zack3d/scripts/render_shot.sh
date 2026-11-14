#!/bin/bash
# usage: render_shot.sh <shot> <out_dir> <res%> <spp> [f0 f1] [step]
# Renders one shot (or a frame sub-range of it) with the final scene scripts. Frames land in <out_dir>/f_####.png.
set -e
SH=$1; OUT=$2; RES=$3; SPP=$4; F0=${5:-}; F1=${6:-}; STEP=${7:-1}
Z=$(cd "$(dirname "$0")/.." && pwd); B=${BLENDER:-$HOME/zack/bin/blender-4.5.15-linux-x64/blender}
read SCRIPT MODEARG ENVN ENVJ < <(python3 - "$Z" "$SH" <<'PY'
import json, sys
z, sh = sys.argv[1], sys.argv[2]
for n, s, ex in json.load(open(f'{z}/scripts/shots.json')):
    if n == sh:
        mode = ex[1] if ex and ex[0] == 'MODE' else '-'
        en, ej = (ex[0], json.dumps(ex[1]).replace(' ', '')) if ex and ex[0] != 'MODE' else ('-', '-')
        print(s, mode, en, ej)
PY
)
A=$(python3 -c "
import json; a=json.load(open('$Z/anim/$SH.json')); a['out']='$OUT'; a['step']=$STEP
if '$F0': a['f0']=int('$F0')
if '$F1': a['f1']=int('$F1')
print(json.dumps(a))")
EXTRA=()
[ "$SCRIPT" = "blood.py" ] && [ "$MODEARG" = "pad" ] && export ZK_B="$(cat $Z/scripts/pad_look.json)"
[ "$ENVN" != "-" ] && export $ENVN="$ENVJ"
ARGS=(x "$RES" "$SPP"); [ "$MODEARG" != "-" ] && ARGS=("$MODEARG" x "$RES" "$SPP")
ZK_ANIM="$A" "$B" -b --python "$Z/scripts/$SCRIPT" -- "${ARGS[@]}" 2>&1 | grep -E "^FRAME|Error|Traceback" || true
