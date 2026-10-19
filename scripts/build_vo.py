"""Rebuild beat timestamps (150 wpm) and the ElevenLabs VO-only text from the script."""
import re, sys
p = sys.argv[1] if len(sys.argv) > 1 else 'america-independence-script.md'
t = open(p).read()

def vo_lines(body):
    out, on = [], False
    for l in body.split('## Fact sources')[0].splitlines():
        if l.startswith('VO: '):
            on = True; out.append(l[4:]); continue
        if l.startswith('[ON SCREEN') or l.startswith('## '):
            on = False; continue
        if on and l.strip():
            out.append(l.strip())
    return out

def fmt(x):
    x = int(round(x)); return f"{x // 60}:{x % 60:02d}"

parts = re.split(r'(?m)^(## BEAT \d+ — [^\n]*?) \((\d+:\d+)–(\d+:\d+)\)$', t)
out, cur, allvo = [parts[0]], 0.0, []
for i in range(1, len(parts), 4):
    title, body = parts[i], parts[i + 3]
    v = vo_lines(body); allvo += v
    secs = len(re.findall(r'\S+', ' '.join(v))) / 150 * 60
    out.append(f"{title} ({fmt(cur)}–{fmt(cur + secs)})"); out.append(body); cur += secs
open(p, 'w').write(''.join(out))
txt = '\n\n'.join(re.sub(r'^"[^"\s:]+(?: [^"\s:]+)?: ', '"', l) for l in allvo)
open(p.replace('-script.md', '-elevenlabs.txt'), 'w').write(txt + '\n')
w = len(re.findall(r'\S+', txt))
print(f"VO words {w}  runtime @150wpm {fmt(cur)}  @135wpm {fmt(w / 135 * 60)}")
