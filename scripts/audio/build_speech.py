"""VO speech intervals (frames @60) for BGM ducking → src/vo/speech.json. Gaps < 0.35 s are merged."""
import json
d = json.load(open('scripts/vo/vo_timeline.json'))
words = d['words'] if isinstance(d, dict) else d
iv = []
for w in words:
    a, b = w['f'], w['fEnd']
    if iv and a - iv[-1][1] < 21:
        iv[-1][1] = max(iv[-1][1], b)
    else:
        iv.append([a, b])
json.dump(iv, open('src/vo/speech.json', 'w'))
print(len(iv), 'speech intervals')
