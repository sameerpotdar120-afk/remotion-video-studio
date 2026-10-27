"""
Russia VO: join the ElevenLabs files, cut speech chunks at pauses, and assign script words to chunks.

No ASR model is reachable here, so this is the America method without number anchors:
dynamic programming over (speech chunks × script words), minimising
  (a) duration error vs. a phonetic-weight speaking-rate model,
  (b) chunk ends that don't sit on punctuation — weighted by how long the pause after the chunk is
      (a 0.8 s pause in the middle of a clause is very unlikely; at a paragraph end it is expected).
Inside a chunk, word times are spread by phonetic weight.

usage: align_vo.py SCRIPT_TXT OUT_JSON SIL1 DUR1 [SIL2 DUR2 ...]   (silencedetect logs, file durations)
"""
import json, re, sys, math

FPS = 60
GAP = 0.5   # seconds of silence inserted between files in the master
script_path, out_path = sys.argv[1:3]
files = [(sys.argv[i], float(sys.argv[i + 1])) for i in range(3, len(sys.argv), 2)]

paras = [p.strip() for p in open(script_path).read().split('\n') if p.strip()]
words, para_of = [], []
for pi, p in enumerate(paras):
    for w in re.findall(r'\S+', p):
        words.append(w); para_of.append(pi)
N = len(words)

def weight(w):
    core = re.sub(r'[^\wऀ-ॿ]', '', w)
    if re.fullmatch(r'[A-Za-z\']+', core or 'x'):
        return max(1.0, len(core) * 0.75)
    if re.fullmatch(r'[0-9,]+', core or 'x'):
        return 4.0
    letters = re.sub(r'[ा-्॑-ॗॢॣँ-ः़]', '', core)
    return max(1.0, len(letters) * 1.0 + 0.35 * (len(core) - len(letters)))
W = [weight(w) for w in words]
para_end = [i == N - 1 or para_of[i + 1] != para_of[i] for i in range(N)]

def end_cost(i, gap):
    """cost of a chunk ending after word i, followed by a pause of `gap` seconds"""
    w = words[i]
    long = min(1.0, max(0.0, (gap - 0.25) / 0.6))       # 0 for short pauses, 1 for ≥0.85 s
    if para_end[i]: return -0.6 * long
    if re.search(r'[।?!.]["”]?$', w): return 0.0
    if re.search(r'[,;:]["”]?$', w): return 0.5 + 1.0 * long
    return 2.5 + 6.0 * long

# speech segments from the silence logs, on the master timeline
segs, off = [], 0.0
for li, (log, dur) in enumerate(files):
    ev = re.findall(r'silence_(start|end): ([0-9.]+)', open(log).read())
    sil, st = [], None
    for k, v in ev:
        v = float(v)
        if k == 'start': st = v
        elif st is not None: sil.append((st, v)); st = None
    if st is not None: sil.append((st, dur))
    t = 0.0
    for a, b in sil + [(dur, dur)]:
        if a - t > 0.10: segs.append({'start': off + t, 'end': off + a})
        t = b
    off += dur + GAP
total = off - GAP
# pause after each segment
for k, s in enumerate(segs):
    s['gap'] = (segs[k + 1]['start'] - s['end']) if k + 1 < len(segs) else 9.0
K = len(segs)
speech = sum(s['end'] - s['start'] for s in segs)
rate = speech / sum(W)

INF = 1e18
MAXW = 45
cumW = [0.0]
for x in W: cumW.append(cumW[-1] + x)
f = [[INF] * (N + 1) for _ in range(K + 1)]
back = [[-1] * (N + 1) for _ in range(K + 1)]
f[0][0] = 0.0
for k in range(K):
    d = segs[k]['end'] - segs[k]['start']
    g = segs[k]['gap']
    row, nxt, bk = f[k], f[k + 1], back[k + 1]
    for j in range(N + 1):
        c0 = row[j]
        if c0 >= INF: continue
        if d < 0.45:   # breath / click chunk may carry no words
            c = c0 + 1.2
            if c < nxt[j]: nxt[j] = c; bk[j] = j
        for j2 in range(j + 1, min(N, j + MAXW) + 1):
            pred = rate * (cumW[j2] - cumW[j])
            err = (d - pred) / (0.20 * pred + 0.25)
            c = c0 + err * err + end_cost(j2 - 1, g)
            if c < nxt[j2]: nxt[j2] = c; bk[j2] = j
if f[K][N] >= INF: raise SystemExit('no alignment')
bounds = [N]; j = N
for k in range(K, 0, -1):
    j = back[k][j]; bounds.append(j)
bounds = bounds[::-1]

out_words, chunk_map = [], []
for k in range(K):
    a, b = bounds[k], bounds[k + 1]
    s, e = segs[k]['start'], segs[k]['end']
    chunk_map.append({'chunk': k, 'start': round(s, 3), 'end': round(e, 3), 'words': ' '.join(words[a:b])})
    if b <= a: continue
    tot = cumW[b] - cumW[a]
    for i in range(a, b):
        ws = s + (e - s) * (cumW[i] - cumW[a]) / tot
        we = s + (e - s) * (cumW[i + 1] - cumW[a]) / tot
        out_words.append({'i': i, 'w': words[i], 'p': para_of[i], 'start': round(ws, 3), 'end': round(we, 3),
                          'f': int(math.floor(ws * FPS)), 'fEnd': int(math.ceil(we * FPS))})
pp = []
for pi, p in enumerate(paras):
    ws = [w for w in out_words if w['p'] == pi]
    pp.append({'p': pi, 'start': ws[0]['start'], 'end': ws[-1]['end'], 'f': ws[0]['f'], 'fEnd': ws[-1]['fEnd'], 'text': p})
json.dump({'fps': FPS, 'durationSec': round(total, 3), 'fileOffsets': [0.0, files[0][1] + GAP], 'words': out_words,
           'paragraphs': pp, 'chunks': chunk_map}, open(out_path, 'w'), ensure_ascii=False, indent=1)
print('words', len(out_words), '/', N, 'paras', len(paras), 'chunks', K, 'cost', round(f[K][N], 1),
      'rate s/unit', round(rate, 4), 'total', round(total, 1))
bad = [c for c in chunk_map if c['words'] and not re.search(r'[।?!.,;:]["”]?$', c['words'])]
print('chunks ending mid-clause:', len(bad))
