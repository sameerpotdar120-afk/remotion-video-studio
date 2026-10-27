"""Writes docs/russia/PROMPTS_IMAGES.md and docs/russia/paste/BATCH_*.txt from asset_list.py."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from asset_list import ASSETS, STYLES

OUT = 'docs/russia'
os.makedirs(f'{OUT}/paste', exist_ok=True)
for f in os.listdir(f'{OUT}/paste'):
    os.remove(f'{OUT}/paste/{f}')

def chapter(a):
    if a['file'].startswith(('_style', 'host')): return 0
    m = re.search(r'Ch(\d+)', a['used'])
    if m: return int(m.group(1))
    if a['used'].startswith('Close'): return 11
    return 0
FOLDER_ORDER = {'chars': 0, 'horses': 1, 'cards': 2, 'bg': 3, 'props': 4, 'docs': 5}
items = sorted(ASSETS, key=lambda a: (chapter(a), FOLDER_ORDER[a['folder']]))
CH = {0: 'Style + host + map tokens', 1: 'Ch1 Rus', 2: 'Ch2 Mongols', 3: 'Ch3 Ivan', 4: 'Ch4 Troubles', 5: 'Ch5 Peter',
      6: 'Ch6 Catherine', 7: 'Ch7 1812 & reforms', 8: 'Ch8 Last Tsar', 9: 'Ch9 Stalin', 10: 'Ch10 Today', 11: 'Close'}

# batches: one per chapter group, max 22 images
batches, cur, cur_ch = [], [], None
for a in items:
    c = chapter(a)
    if cur and (len(cur) >= 22 or (c != cur_ch and len(cur) >= 12)):
        batches.append(cur); cur = []
    cur.append(a); cur_ch = c
if cur:
    if len(cur) < 5 and batches: batches[-1] += cur
    else: batches.append(cur)

def size_of(a):
    if a['size']: return a['size']
    return {'B': '1536x1024', 'H': '1536x1024', 'C': '1024x1280', 'C20': '1024x1280'}.get(a['style'], '1024x1024')

GLOBAL = """GLOBAL RULES (apply to every image)
- Make ONE image at a time, in the order below. Give each image the exact file name listed. After each image go straight on to the next one unless I say stop.
- Transparent background PNG for characters, horses and props. Backgrounds and portrait cards fill the whole canvas.
- After removing the background, every WHITE or pale part of an object must stay solid and opaque (not see-through).
- No text, letters or numbers anywhere unless the prompt asks for exact words.
- Characters: the face is ALWAYS completely blank (no eyes, nose, mouth, brows) and there are NO arms, hands, legs or feet. The animation adds them.
- If an item says "attach", I will upload that image in the chat: use it as the reference."""

n_total = 0
for bi, b in enumerate(batches, 1):
    styles = sorted({a['style'] for a in b}, key=list(STYLES).index)
    chs = sorted({chapter(a) for a in b})
    title = ' + '.join(CH[c] for c in chs)
    L = [f'RUSSIA VIDEO — IMAGE BATCH {bi} of {len(batches)} ({title}) — {len(b)} images', '',
         'You are generating image assets for an animated Hindi/Hinglish history YouTube video ("Russia Kaise Bana?", 862 to today). '
         'Characters use the same peg-doll style as our earlier video: the style reference sheet is attached (image 1) — use it as the strict style reference for every character and horse.', '',
         GLOBAL, '']
    for s in styles:
        L += ['=' * 70, STYLES[s], '']
    L += ['=' * 70, 'THE IMAGES', '=' * 70, '']
    for i, a in enumerate(b, 1):
        att = f" [attach: {a['attach']}]" if a['attach'] else ''
        opt = ' (optional)' if a['pri'] == 'B' else ''
        L.append(f"{i}. {a['file']}{opt} — {size_of(a)}{att} — STYLE {a['style']} + {a['prompt']}")
        if a['file'].startswith('_style'):
            L.append('>> Show me this one and WAIT for my OK before continuing. Then use it, together with image 1, as the style reference for everything below.')
        L.append('')
    L += ['=' * 70, 'BEFORE SENDING: characters have blank faces and NO arms/hands/legs/feet; horses have no rider; backgrounds have no people and no readable text; nothing has a swastika or any other symbol not asked for.']
    open(f'{OUT}/paste/BATCH_{bi:02d}.txt', 'w').write('\n'.join(L) + '\n')
    n_total += len(b)

# overview doc
M = ['# Russia video — image prompts', '',
     f'**{len(ASSETS)} images** ({sum(a["pri"] == "A" for a in ASSETS)} needed, {sum(a["pri"] == "B" for a in ASSETS)} optional), '
     f'in **{len(batches)} paste batches** ordered by chapter: `docs/russia/paste/BATCH_01.txt` … `BATCH_{len(batches):02d}.txt`. '
     'Paste one batch per ChatGPT conversation, attach the style sheet, and send the images back in the same way as for America '
     '(zips are fine, raw names are fine: renaming, trimming, transparency checks and rigging happen in the repo). '
     'Source of truth: `scripts/russia/asset_list.py` (rebuild this doc with `python3 scripts/russia/build_prompt_docs.py`).', '',
     '## What is built in code (no prompt needed)', '',
     '- **Host animation**: face (dot eyes, blinks, lip-flap every 4 frames), noodle arms with white gloves, stick legs that walk, '
     'pointer, reactions (shock "O", shrug, hands on head, pointer dropped flat at chapter breaks). Only his body image is generated.',
     '- **Every character**: face, arms, gloves, walk/bob/squash, moods; riders mounted on 2-frame gallop horses.',
     '- **Maps**: real terrain (AWS Terrain Tiles), satellite look, 3D globe, translucent territory fills per era, white brush routes with red arrowheads, '
     'siege circles, pincers, frost creep, city pins, extruded 3D countries that crack apart (1991).',
     '- **Devices**: year tag + iris, chapter scroll with 10 medallions, loop wheel, 4 collapse X marks, recap timeline HUD, '
     'verdict stamps (LEGEND? / TRUE STORY / FAKE / COUP / SOLD / EXAGGERATED?), counters, person-icon grids, calendars, '
     'measuring tape, candles that snuff out, fire, smoke, snow, flash frames, flags.',
     '- **3D in code**: the globe, Sputnik, the spinning beard token, extruded country pieces, camera moves on every shot.',
     '- **Sound**: SFX + music bed made in code (copyright-free), mixed under your VO.', '',
     '## Batches', '']
for bi, b in enumerate(batches, 1):
    chs = sorted({chapter(a) for a in b})
    M.append(f'- **BATCH_{bi:02d}** — {" + ".join(CH[c] for c in chs)} — {len(b)} images')
M += ['', '## Full list', '', '| # | File | Style | Size | Need | Used in |', '|---|---|---|---|---|---|']
k = 0
for bi, b in enumerate(batches, 1):
    for a in b:
        k += 1
        M.append(f"| {k} | `{a['folder']}/{a['file']}` | {a['style']} | {size_of(a)} | {'yes' if a['pri'] == 'A' else 'optional'} | {a['used']} |")
M += ['', '## Styles', '']
for s, t in STYLES.items():
    M += [f'**{s}**', '', '```', t, '```', '']
open(f'{OUT}/PROMPTS_IMAGES.md', 'w').write('\n'.join(M) + '\n')
print(len(batches), 'batches', n_total, 'images', [len(b) for b in batches])
