"""Mix the Kolkata video: the creator's voice on top, music that changes with the era, effects on every rigged move.

    python3 tools/mix_kolkata.py        # writes public/kolkata/audio/mix.wav

Cue times come from src/kolkata/timing.json.
Ducking works like a sidechain compressor: while the voice speaks the music sits about 21 dB under it, and in every
pause it swells back to about 11 dB under (fast attack, quick release). Effects duck 4 dB under the voice.
Music: Mixkit "Discover" (Eugenio Mininni) for today's city, "Indian Meditations" (Ahjay Stelino) for the 1690s story;
Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "kolkata" / "audio"
T = json.load(open(ROOT / "src" / "kolkata" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, offset into the file, section start cue): today's city → the 1690s → today again, crossfaded at each cue
MUSIC = [("music_discover_mixkit.mp3", 30.0, 0.0), ("music_indian_meditations_mixkit.mp3", 8.0, None), ("music_discover_mixkit.mp3", 62.0, None)]
MUSIC_CUTS = [0.0, C["teen1"] - 0.3, C["matlab9"] - 0.2]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "cannon": 35, "city": 120, "village": 150, "marina": 120, "tram": 80, "bell": 120}

CUES = [
    # hook: today's street — a whoosh in, the tram passes, the taxi drives through, city ambience
    (0.03, "wh_big_tonal", -10, {}), (0.05, "punch", -13, {}),
    (0.1, "city", -24, {"align": "start", "dur": C["teen1"] - 0.1}),
    (0.6, "tram", -19, {"align": "start", "skip": 2.0, "dur": 4.0}), (1.6, "oldcar", -14, {}),
    (C["joy1"] + 0.1, "chime_hit", -14, {}),
    # "तीन गाँव": the city melts into the 1690s — riser, three village pops, birds
    (C["teen1"] - 0.35, "wh_soft", -10, {}), (C["teen1"], "magic", -14, {"dur": 1.0}),
    (C["teen1"] + 0.05, "pop_high", -13, {}), (C["teen1"] + 0.2, "pop_high", -13, {}), (C["teen1"] + 0.35, "pop_high", -13, {}),
    (C["teen1"], "village", -24, {"align": "start", "dur": C["raj1"] - C["teen1"]}),
    # the rent: coins drop one by one, the register
    *[(C["n1300"] + 0.42 + i * 0.28, "coins", -15, {"dur": 0.5}) for i in range(5)],
    (C["kiraye1"], "register", -12, {}),
    # "राजधानी कैसे?": pull out to India
    (C["raj1"] - 0.3, "wh_fast", -10, {}), (C["raj1"] + 0.1, "boom", -13, {}), (C["raj1"] + 0.3, "ui_perc", -12, {}),
    # the three villages
    (C["pehla2"] - 0.15, "wh_fast", -10, {}), (C["sutanuti2"], "pop_high", -11, {}),
    # Veo cutaway: the 1690s cotton market (full screen), then back to the map
    (C["soot2"] - 0.2, "wh_air", -10, {}), (C["soot2"] - 0.05, "village", -21, {"align": "start", "skip": 3.0, "dur": C["aaj2"] - C["soot2"] + 0.1}),
    (C["aaj2"] - 0.1, "wh_fast", -11, {}),
    (C["shobha2"], "ui_snap", -13, {}),
    (C["doosra3"] - 0.1, "wh_air", -11, {}), (C["gobind3"], "pop_high", -11, {}), (C["maidan3"], "ui_snap", -13, {}),
    (C["teesra4"] - 0.1, "wh_air", -11, {}), (C["kalikata4"], "pop_high", -11, {}), (C["kalikata4"] + 0.3, "bell", -14, {"align": "start", "dur": 3.0}),
    (C["central4"], "ui_snap", -13, {}),
    # the Hooghly: the ship sails up — water, creaks, sails
    (C["hooghly5"] - 0.25, "wh_big_tonal", -11, {}),
    (C["hooghly5"], "marina", -18, {"align": "start", "dur": C["y1698"] - C["hooghly5"]}),
    (C["hooghly5"] + 0.6, "sail", -13, {}), (C["perfect5"], "chime_hit", -13, {}),
    # 1698: the deed unrolls, the quill writes, the seal stamps, the hands meet
    (C["y1698"] - 0.3, "wh_fast", -10, {}), (C["y1698"], "stinger", -11, {}), (C["y1698"] + 0.2, "pages", -14, {"align": "start", "dur": 1.6}),
    (C["company5"], "writing", -17, {"align": "start", "dur": 2.2}),
    (C["sabarna5"] + 0.4, "wh_soft", -14, {}), (C["haq5"] + 0.1, "heavy_knock", -10, {}), (C["haq5"] + 0.12, "punch", -14, {}),
    # Fort William: Gobindapur emptied — huts lift away, the family walks off, the gates slam, the cannon fires
    (C["fort6"] - 0.15, "wh_fast", -10, {}), (C["fort6"] + 0.1, "braam", -14, {}),
    (C["fort6"] + 1.2, "wh_soft", -11, {}),  # Veo cutaway: the families leave Gobindapur
    (C["gobind6"], "wh_air", -12, {}), (C["khali6"], "subdrop", -12, {}),
    (C["gobind6"] + 0.2, "village", -26, {"align": "start", "skip": 6.0, "dur": 1.4}),
    (C["khali6"] + 0.25, "wh_soft", -12, {}), (C["khali6"] + 0.45, "wood_door", -12, {"align": "start"}), (C["khali6"] + 1.02, "gate_metal", -11, {}),
    (C["yahin7"] + 0.15, "cannon", -10, {}),
    # one city, the capital: the crown settles
    (C["yahin7"] - 0.05, "wh_big_tonal", -11, {}), (C["shehar7"], "chime_hit", -12, {}),
    (C["shehar7"] + 0.95, "wh_air", -10, {}), (C["shehar7"] + 1.08, "city", -25, {"align": "start", "skip": 8.0, "dur": C["raj7"] - C["shehar7"] - 1.0}),  # Veo: City of Palaces
    (C["raj7"] - 0.3, "wh_fast", -10, {}), (C["raj7"] + 0.45, "metal_thud", -13, {}), (C["raj7"] + 0.5, "magic", -15, {"dur": 0.9}),
    # the book opens, the court, the gavel, the red ✗
    (C["kitab8"], "page_turn", -11, {}), (C["kitab8"] + 0.4, "pages", -15, {"align": "start", "dur": 1.0}),
    (C["kitab8"] + 0.9, "writing", -18, {"align": "start", "dur": 2.0}),
    (C["court8"] - 0.1, "wh_fast", -10, {}), (C["court8"] + 0.1, "boom", -13, {}),
    (C["court8"] + 1.15, "hammer", -8, {}), (C["court8"] + 1.17, "punch", -11, {}), (C["court8"] + 1.3, "scratch", -12, {}), (C["court8"] + 2.69, "hammer", -11, {}),  # the Veo gavel strikes twice
    (C["pehle8"], "magic", -14, {"dur": 1.0}),
    # the ending: the village becomes today's city
    (C["matlab9"] - 0.2, "wh_soft", -11, {}), (C["matlab9"], "village", -24, {"align": "start", "dur": C["hamesha9"] - C["matlab9"] + 0.4}),
    (C["hamesha9"] - 0.2, "riser", -14, {"align": "start", "dur": 0.5}), (C["hamesha9"] + 0.2, "chime_hit", -11, {}),
    (C["hamesha9"] + 0.2, "city", -24, {"align": "start", "skip": 4.0, "dur": DURATION - C["hamesha9"] - 0.2}),
    # Null and the CTA
    (C["to10"] - 0.15, "wh_soft", -12, {}), (C["to10"] + 0.3, "pop_high", -13, {}), (C["to10"] + 0.55, "pop_high", -13, {}), (C["to10"] + 0.8, "pop_high", -13, {}),
    (C["bhejo10"], "toon_whoosh", -13, {}), (C["follow10"], "ui_pop", -12, {}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(AUD / "vo.mp3", VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    # sidechain: gaps between words (< 0.15 s) count as speech; a real pause (a comma, a full stop) lets the music swell.
    # Fast attack (25 ms) gets it out of the way as a word starts; a 120 ms release brings it up quickly in the pause.
    from scipy import ndimage
    hop = SR // 100
    sp = talking[::hop]
    sp = ndimage.binary_closing(sp, structure=np.ones(15))
    speech = np.repeat(sp, hop)[:n]
    speech = np.pad(speech, (0, n - len(speech)), constant_values=False)
    activity = envelope(speech.astype(np.float32), 0.025, 0.12)[:, None]
    talking = speech

    # three sections (today, the 1690s, today again), each crossfaded in over 0.5 s, matched in loudness
    music = np.zeros((n, 2), np.float32)
    ref = None
    edges = MUSIC_CUTS + [DURATION]
    for (f, off, _), s0, s1 in zip(MUSIC, edges[:-1], edges[1:]):
        i0, i1 = int(s0 * SR), min(n, int((s1 + 0.5) * SR))
        m = ff(AUD / f, "anull")[int(off * SR):][: i1 - i0]
        if ref is None:
            ref = np.mean(m ** 2)
        m = m * np.sqrt(ref / (np.mean(m ** 2) + 1e-12))
        m = fade(m.copy(), 0.5 if s0 > 0 else 0.25, 0.5)
        music[i0: i0 + len(m)] += m
    m = music
    music *= db(v_ref - 10 * np.log10(np.mean(music[: len(m)] ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    # short dips so the gavel, the cannon and the gates land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["court8"] + 1.15, C["yahin7"] + 0.15, C["khali6"] + 1.0))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    music = fade(music, 0.25, 2.5)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / (name if "." in name else f"{name}.mp3"), f"highpass=f={HPF.get(name.split('.')[0], 70)}")
        a = cache[name]
        if opt.get("skip"):
            a = a[int(opt["skip"] * SR):]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.08, 0.35)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        start = t - r.argmax() / SR if opt.get("align", "peak") == "peak" else t
        s = int(start * SR)
        if s < 0:
            a, s = a[-s:], 0
        e = min(n, s + len(a))
        if e > s:
            sfx[s:e] += a[: e - s]
    sfx *= db(-SFX_DUCK * activity)

    mix = voice + music + sfx
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                    "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9",
                    "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    tmp.unlink()
    rms = lambda x: 10 * np.log10(np.mean((x**2).mean(1)) + 1e-12)
    quiet = ~talking
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music talking {rms(music[talking]):.1f}  music pauses {rms(music[quiet]):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
