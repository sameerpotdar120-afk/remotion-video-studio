"""Build america-independence-script-hindi.md: ON SCREEN blocks from the Hinglish script + Hindi VO from hindi_vo.py."""
import re, importlib.util
spec = importlib.util.spec_from_file_location('h', 'hindi_vo.py'); h = importlib.util.module_from_spec(spec); spec.loader.exec_module(h)
src = open('america-independence-script.md').read()
rest = '## BEAT 1' + src.split('## BEAT 1', 1)[1]
body, sources = rest.split('## Fact sources', 1)
beats = [b for b in re.split(r'(?m)^(?=## BEAT \d+)', body) if b.strip()]
assert len(beats) == 20 == len(h.BEATS)
out = ["# अमेरिका आज़ाद कैसे हुआ? — Full Script (HINDI, ~15 min)\n\n"
       "Format: long-form animated map history. VO by ElevenLabs (Hindi).\n"
       "Every beat = `[ON SCREEN]` (what the editor builds) + `VO` (what is spoken).\n"
       "Character lines carry a speaker label here for the editor; the ElevenLabs file has labels removed.\n"
       "Hinglish version of the same script: `america-independence-script.md`. Fact sources at the bottom.\n\n---\n\n"]
for b, vo in zip(beats, h.BEATS):
    ons = re.findall(r'(?ms)^\[ON SCREEN:.*?\]$', b)
    out.append(b.splitlines()[0] + '\n' + ons[0] + '\n\n')
    first = True
    for p in vo:
        if p == '<<ON2>>':
            out.append(ons[1] + '\n\n'); first = True; continue
        out.append(('VO: ' if first else '') + p + '\n\n'); first = False
out.append('---\n\n## Fact sources' + sources)
open('america-independence-script-hindi.md', 'w').write(''.join(out))
