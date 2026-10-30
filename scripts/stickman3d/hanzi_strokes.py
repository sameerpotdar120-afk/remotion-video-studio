"""Stroke-order data for CJK characters (Make Me a Hanzi graphics.txt, Arphic Public License) for the HanziWriter
component: python3 -I scripts/stickman3d/hanzi_strokes.py "塞翁失马" src/<episode>/hanzi.generated.json"""
import json, sys, urllib.request
need = set(sys.argv[1]); out = {}
with urllib.request.urlopen('https://raw.githubusercontent.com/skishore/makemeahanzi/master/graphics.txt') as r:
    for line in r:
        d = json.loads(line)
        if d['character'] in need: out[d['character']] = {'strokes': d['strokes'], 'medians': d['medians']}
json.dump(out, open(sys.argv[2], 'w', encoding='utf8'), ensure_ascii=False)
print('found', ''.join(out), 'missing', ''.join(sorted(need - set(out))) or '-')
