"""
VO timeline (src/russia/vo/timeline.json, master-VO seconds) → VIDEO timeline at 60 fps with a silent gap
before every chapter for the chapter-scroll card (reference: ≈77 f @30 = 2.6 s, narration resumes after).

Writes src/russia/vo/video.json:
  total            frames
  audio            [{file, trimFrom, trimTo, at}]   VO pieces (frames of the source file / of the video)
  chapters         [{n, title, card, from}]          card = first frame of the scroll card
  paragraphs       [{p, f, fEnd, text}]              video frames
  words            [{i, w, p, f, fEnd}]
  speech           [[f, fEnd], ...]                  speech chunks (for lip-flap + music ducking)
"""
import json, math

FPS = 60
LEAD = 0.40          # s of picture before the first word
GAP = 2.80           # s chapter card
TAIL = 5.0           # s after the last word (subscribe + end screen)
CHAPTER_PARAS = {5: 'Rus', 17: 'Mongols', 25: 'Ivan', 34: 'Troubles', 43: 'Peter', 51: 'Catherine', 58: '1812',
                 67: 'Last Tsar', 76: 'Stalin', 85: 'Today'}
FILES = [('russia/vo/russia_vo_1.mp3', 799.242438), ('russia/vo/russia_vo_2.mp3', 659.226063)]
FILE_GAP = 0.5       # align_vo.py put 0.5 s between the files on the master timeline

tl = json.load(open('src/russia/vo/timeline.json'))
paras = tl['paragraphs']
# master-VO second at which each chapter gap is inserted: halfway through the pause before its first paragraph
cuts = []
for p, title in CHAPTER_PARAS.items():
    prev_end, start = paras[p - 1]['end'], paras[p]['start']
    cuts.append((round((prev_end + start) / 2, 3), title))
cuts.sort()

def vid(t):
    """master-VO seconds → video seconds"""
    return LEAD + t + GAP * sum(1 for c, _ in cuts if t >= c)
F = lambda t: int(round(vid(t) * FPS))

# audio pieces: split each file at the cuts that fall inside it
audio, off = [], 0.0
for path, dur in FILES:
    a, b = off, off + dur
    edges = [a] + [c for c, _ in cuts if a < c < b] + [b]
    for s, e in zip(edges, edges[1:]):
        audio.append({'file': path, 'trimFrom': int(round((s - a) * FPS)), 'trimTo': int(round((e - a) * FPS)), 'at': F(s + 1e-6)})
    off = b + FILE_GAP

chapters = []
for n, (c, title) in enumerate(cuts, 1):
    card = int(round((LEAD + c + GAP * (n - 1)) * FPS))
    chapters.append({'n': n, 'title': title, 'card': card, 'from': card + int(GAP * FPS)})
out = {
    'fps': FPS,
    'total': F(tl['durationSec']) + int(TAIL * FPS),
    'audio': audio,
    'chapters': chapters,
    'paragraphs': [{'p': p['p'], 'f': F(p['start']), 'fEnd': F(p['end']), 'text': p['text']} for p in paras],
    'words': [{'i': w['i'], 'w': w['w'], 'p': w['p'], 'f': F(w['start']), 'fEnd': F(w['end'])} for w in tl['words']],
    'speech': [[F(c['start']), F(c['end'])] for c in tl['chunks'] if c['words']],
}
json.dump(out, open('src/russia/vo/video.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('total', out['total'], 'frames =', f"{out['total'] / FPS / 60:.2f} min", '| audio pieces', len(audio))
for c in chapters: print(f"  ch{c['n']:2} {c['title']:10} card {c['card']:6}  ({c['card'] / FPS:7.2f} s)")
