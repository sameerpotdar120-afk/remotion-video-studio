"""
Word-level timing for the Hindi VO, without a Hindi forced-aligner.

Inputs : script text (exact VO text), chunks.json (speech chunks between pauses, from
         silencedetect + Whisper-small multilingual; Whisper text is only used for NUMBER anchors).
Method : dynamic programming assigns consecutive script words to each speech chunk, minimising
         (a) duration error vs. a speaking-rate model, (b) chunk breaks that don't fall on punctuation,
         subject to (c) hard anchors: chunk k must contain number phrase P (years, counts).
         Inside a chunk, word times are spread by phonetic weight.
Output : vo_timeline.json  (words with start/end seconds + frames @60, sentences, chunk map)
"""
import json, re, sys, math

script_path, chunks_path, out_path = sys.argv[1:4]
FPS = 60
text = open(script_path).read()
words = re.findall(r'\S+', text)
N = len(words)

def weight(w):
    core = re.sub(r'[^\wऀ-ॿ]', '', w)
    if re.fullmatch(r'[A-Za-z\']+', core or 'x'):
        return max(1.0, len(core) * 0.75)            # English spelling is longer than its sound
    letters = re.sub(r'[ा-्॑-ॗॢॣँ-ः़]', '', core)  # drop matras/nukta
    return max(1.0, len(letters) * 1.0 + 0.35 * (len(core) - len(letters)))

W = [weight(w) for w in words]
def punct(w):
    if re.search(r'[।?!.]["”]?$', w): return 0.0      # sentence end: pause expected
    if re.search(r'[,;:]["”]?$', w): return 0.6       # comma: pause likely
    return 3.0                                         # mid-clause: pause unlikely

segs = json.load(open(chunks_path))['segments']
K = len(segs)
speech = sum(s['end'] - s['start'] for s in segs)
rate = speech / sum(W)                                  # seconds per weight unit

# hard anchors: (chunk index, phrase that must lie inside that chunk)
ANCHORS = [(1, 'सत्रह सौ तिरसठ'), (8, 'चार July'), (16, 'सत्रह सौ पचहत्तर'), (17, 'पच्चीस'),
           (19, 'पाँच लाख'), (29, 'सत्रह सौ चौवन में Benjamin'), (41, 'सत्रह सौ चौवन,'), (46, 'बाईस'),
           (49, 'पंद्रह minute'), (87, 'छह pence'), (112, 'अठारह March'), (154, 'सोलह December'),
           (159, 'तीन सौ बयालीस'), (163, 'पाँच September'), (167, 'अठारह April'), (184, 'दस May'),
           (185, 'पंद्रह June'), (186, 'इक्कीस साल'), (193, 'दस January'), (201, 'बारह colonies ने हाँ'),
           (206, 'चार July को Declaration'), (214, 'सत्रह सौ तिरसठ में राजा')]
def find(phrase, start):
    p = phrase.split()
    for i in range(start, N - len(p) + 1):
        if all(words[i + k].rstrip('।,?.!"') == p[k].rstrip('।,?.!"') for k in range(len(p))):
            return i
    raise SystemExit(f'anchor not found: {phrase}')
need = {}
pos = 0
for k, ph in ANCHORS:
    a = find(ph, pos); b = a + len(ph.split())
    need[k] = (a, b); pos = b

INF = 1e18
MAXW = 40
f = [[INF] * (N + 1) for _ in range(K + 1)]
back = [[-1] * (N + 1) for _ in range(K + 1)]
f[0][0] = 0.0
cumW = [0.0]
for x in W: cumW.append(cumW[-1] + x)
for k in range(K):
    d = segs[k]['end'] - segs[k]['start']
    lo_k, hi_k = need.get(k, (None, None))
    for j in range(N + 1):
        if f[k][j] >= INF: continue
        if lo_k is not None and j > lo_k: continue
        # empty chunk (breath / click): allowed only if short
        if lo_k is None and d < 0.7:
            c = f[k][j] + 1.5
            if c < f[k + 1][j]: f[k + 1][j] = c; back[k + 1][j] = j
        for j2 in range(j + 1, min(N, j + MAXW) + 1):
            if hi_k is not None and j2 < hi_k: continue
            pred = rate * (cumW[j2] - cumW[j])
            err = (d - pred) / (0.22 * pred + 0.25)
            c = f[k][j] + err * err + punct(words[j2 - 1])
            if c < f[k + 1][j2]: f[k + 1][j2] = c; back[k + 1][j2] = j
if f[K][N] >= INF: raise SystemExit('no alignment')

# backtrack
bounds = [N]
j = N
for k in range(K, 0, -1):
    j = back[k][j]; bounds.append(j)
bounds = bounds[::-1]   # bounds[k] = first word of chunk k

out_words = []
chunk_map = []
for k in range(K):
    a, b = bounds[k], bounds[k + 1]
    s, e = segs[k]['start'], segs[k]['end']
    chunk_map.append({'chunk': k, 'start': s, 'end': e, 'words': ' '.join(words[a:b])})
    if b <= a: continue
    tot = cumW[b] - cumW[a]
    for i in range(a, b):
        ws = s + (e - s) * (cumW[i] - cumW[a]) / tot
        we = s + (e - s) * (cumW[i + 1] - cumW[a]) / tot
        out_words.append({'i': i, 'w': words[i], 'start': round(ws, 3), 'end': round(we, 3),
                          'f': int(math.floor(ws * FPS)), 'fEnd': int(math.ceil(we * FPS))})

# sentences
sents, cur = [], []
for w in out_words:
    cur.append(w)
    if re.search(r'[।?!.]["”]?$', w['w']):
        sents.append({'text': ' '.join(x['w'] for x in cur), 'start': cur[0]['start'], 'end': cur[-1]['end'],
                      'f': cur[0]['f'], 'fEnd': cur[-1]['fEnd']}); cur = []
if cur: sents.append({'text': ' '.join(x['w'] for x in cur), 'start': cur[0]['start'], 'end': cur[-1]['end'], 'f': cur[0]['f'], 'fEnd': cur[-1]['fEnd']})

json.dump({'fps': FPS, 'durationSec': json.load(open(chunks_path))['duration'], 'words': out_words, 'sentences': sents, 'chunks': chunk_map},
          open(out_path, 'w'), ensure_ascii=False, indent=1)
print('words', len(out_words), '/', N, 'sentences', len(sents), 'cost', round(f[K][N], 1), 'rate s/unit', round(rate, 4))
