"""Caption track for the Hiroshima short, rebuilt from the reference: phrase text, 2-line layout ('/'), red key words
(*word*), each word's pop frame = the frame its spoken word starts (forced alignment, docs/hiroshima/vo_words.json).
A phrase holds until the next phrase or countdown card starts (the reference hard-cuts captions).
usage: python3 -I scripts/hiroshima/build_captions.py -> src/hiroshima/captions.generated.json"""
import json, re
FPS = 60
CARDS = [749, 1227, 1703, 2148, 2719, 3187, 3411, 3505]
# (text, spoken tokens consumed, optional fixed start/end overrides)
P = [
    ('BEFORE THE *NUKE*/DETONATES', 'sixty seconds | before the nuke detonates'),
    ('AN OLD COUPLE/IN *HIROSHIMA*', 'an old couple in hiroshima'),
    ('IS FINISHING/BREAKFAST', 'is finishing breakfast'),
    ('THE SIREN', 'the siren'),
    ('HAD GONE OFF', 'had gone off'),
    ('AN HOUR EARLIER', 'an hour earlier'),
    ('BUT', 'but'),
    ('IT STOPPED', 'it stopped'),
    ('THE ARMY NOTICED A PLANE', 'the army noticed a plane'),
    ('BUT', 'but'),
    ("ONE PLANE WASN'T WORTH/A CITY WIDE EVACUATION", "one plane wasn't worth a city wide evacuation"),
    ('THE HUSBAND', 'fifty seconds | the husband'),
    ('FOLDS HIS NEWSPAPER', 'folds his newspaper'),
    ('AND HIS WIFE', 'and his wife'),
    ('HUMS WHILE CLEARING/THE TABLE', 'hums while clearing the table'),
    ('OUTSIDE', 'outside'),
    ('KIDS ARE WALKING TO SCHOOL', 'kids are walking to school'),
    ("IT'S A BEAUTIFUL DAY", "it's a beautiful day"),
    ('A FAINT ENGINE HUM', 'forty seconds | a faint engine hum'),
    ('DRIFTS OVER THE CITY', 'drifts over the city'),
    ('THE HUSBAND PAUSES', 'the husband pauses'),
    ('LISTENING', 'listening'),
    ('PROBABLY JUST ANOTHER/RECONNAISSANCE PLANE', 'probably just another reconnaissance plane'),
    ('THE SOUND GROWS LOUDER', 'thirty seconds | the sound grows louder'),
    ('SO THE HUSBAND LOOKS UP/THROUGH THE WINDOW', 'so the husband looks up through the window'),
    ('A SINGLE B-29', 'a single b+twenty+nine'),
    ('ALONE', 'alone'),
    ('CUTTING ACROSS THE SKY', 'cutting across the sky'),
    ('HE WONDERS WHY/A BOMBER PLANE', 'twenty seconds | he wonders why a bomber plane'),
    ('IS FLYING ALONE/OVER THE CITY', 'is flying alone over the city'),
    ('BUT', 'but'),
    ('HIS WIFE TELLS HIM TO SIT', 'his wife tells him to sit'),
    ('IF IT WERE A REAL DANGER', 'if it were a real danger'),
    ('THE OFFICIALS WOULD BE/SOUNDING THE ALARM', 'the officials would be sounding the alarm'),
    ('SOMETHING SMALL/DROPS FROM THE PLANE', 'ten seconds | something small drops from the plane'),
    ('JUST A...', 'just a'),
    ('...DARK SPECK/AGAINST THE SUNLIGHT', 'dark speck against the sunlight'),
    ('THE OLD MAN SQUINTS', 'the old man squints'),
    ('HE IS', 'he is'),
    ('CONFUSED', 'confused'),
    ("IT'S FALLING FAST NOW", "five | it's falling fast now"),
    ('"HONEY', 'honey'),
    ("I THINK IT'S/BETTER TO GO-\"", "i think it's better to go"),
    ('HE REACHES FOR HER HAND', 'two | he reaches for her hand'),
    ('A BIG BALL OF LIGHT', 'one | a big ball of light'),
    ('CLAIMS THE LIVES OF', 'claims the lives of'),
    ('140,000 CITIZENS', 'one+hundred+forty+thousand citizens'),
    ('INCLUDING AMERICAN/PRISONERS OF WAR', 'including american prisoners of war'),
]
W = json.load(open('docs/hiroshima/vo_words.json')); k = 0
def take(tok):
    global k
    parts = tok.split('+'); w0 = None
    for p in parts:
        while W[k]['w'] != p: k += 1
        if w0 is None: w0 = W[k]
        k += 1
    return w0
out = []
for text, spoken in P:
    if '|' in spoken:
        skip, spoken = spoken.split('|'); [take(t) for t in skip.split()]
    toks = spoken.split()
    lines = text.split('/'); words = []
    ti = 0
    for li, line in enumerate(lines):
        for w in line.split(' '):
            red = w.startswith('*'); w = w.strip('*')
            sw = take(toks[ti]); ti += 1
            words.append(dict(t=w, line=li, red=red, at=round(sw['s'] * FPS)))
    out.append(dict(text=text, words=words, start=words[0]['at']))
TOTAL = 3901
for i, p in enumerate(out):
    nxt = out[i + 1]['start'] if i + 1 < len(out) else TOTAL
    card = min([c for c in CARDS if c > p['start']] + [TOTAL])
    p['end'] = min(nxt, card)
# the 140,000 beat: the number pops alone first, CITIZENS joins on its word (reference 61.0 s / 62.1 s)
out[0]['words'][2]['redOut'] = 118  # NUKE leaves 7 frames before the phrase cut
json.dump(out, open('src/hiroshima/captions.generated.json', 'w'), indent=1)
for p in out: print(f"{p['start']:5d}-{p['end']:5d} {p['text']}  " + ' '.join(f"{w['t']}@{w['at']}" for w in p['words']))
