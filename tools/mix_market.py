"""Mix the Märket lighthouse video: the creator's voice on top, a light orchestral bed, map/foley effects.

    python3 tools/mix_market.py        # writes public/market/audio/mix.wav

Cue times come from src/market/timing.json. The bed sits about 17 dB under the voice; effects stay small.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Drawing the Sky" (Eugenio Mininni), Mixkit free licence.
"""


import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "market" / "audio"
T = json.load(open(ROOT / "src" / "market" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_drawing_the_sky_mixkit.mp3", 13.0, -14.5)]
MUSIC_DUCK, SFX_DUCK = 4.0, 2.5
HPF = {"waves_cliffs": 150, "gulls_harbour": 250, "boom_low": 35, "thud_low": 45, "projector": 120, "tape_rewind": 200}

CUES = [
    # hook: open on the zig-zag
    (0.05, "impact_whoosh_deep", -9, {}),
    (0.0, "waves_cliffs", -27, {"align": "start", "dur": C["sweden2"] - 0.2}),
    (C["zigzag1"] - 0.05, "ui_glassy_snap", -12, {}),
    (C["lighthouse1"] - 0.05, "shimmer_power", -13, {}),
    # Sweden, Finland, the sea border
    (C["sweden2"] - 0.4, "whoosh_cinematic_fast", -7, {}),
    (C["sweden2"] + 0.05, "swoosh_fast", -13, {}),
    (C["finland2"] + 0.05, "swoosh_fast", -13, {}),
    (C["samandar2"], "light_sweep_magic", -13, {}),
    # zoom… and zoom… Märket
    (C["zoom3"] - 0.2, "wh_big_subtle_tonal", -8, {}),
    (C["zoom3b"] - 0.2, "wh_magic_air", -8, {}),
    (C["paanch3"] - 0.05, "pop_light", -14, {}),
    (C["paanch3"] + 0.07, "pop_light", -15, {}),
    (C["paanch3"] + 0.19, "pop_light", -15, {}),
    (C["paanch3"] + 0.31, "pop_light", -15, {}),
    (C["paanch3"] + 0.43, "pop_light", -15, {}),
    (C["market3"] - 0.05, "ui_pop_high", -11, {}),
    (C["market3"] + 0.2, "gulls_harbour", -27, {"align": "start", "skip": 12.0, "dur": 2.2}),
    (C["tedhi3"] - 0.05, "tap_negative", -11, {}),
    # 1809: rewind, the war, the treaty
    (C["y1809"] - 0.5, "tape_rewind", -14, {"align": "start", "dur": 0.85}),
    (C["y1809"] - 0.1, "projector", -22, {"align": "start", "dur": 1.6}),
    (C["y1809"] + 0.3, "thud_low", -8, {}),
    (C["sweden4"] - 0.1, "pop_light", -13, {}),
    (C["jung4"] - 0.1, "sword_hit", -10, {}),
    (C["jung4"], "boom_low", -11, {}),
    (C["finland4"] - 0.15, "paper_slide", -13, {}),
    (C["russi4"] + 0.05, "impact_blow", -9, {}),
    # the new border, through the island
    (C["naya5"] - 0.1, "pen_cross", -14, {"align": "start", "dur": 1.4}),
    (C["seedha5"] - 0.2, "whoosh_cinematic_fast", -8, {}),
    (C["beech5"] - 0.1, "wh_airy_soft", -11, {}),
    # 1885: the lighthouse rises
    (C["y1885"] - 0.05, "thud_low", -8, {}),
    (C["lighthouse6"] - 0.3, "riser_9", -17, {"align": "start", "dur": 1.2}),
    (C["oonchi6"] - 0.05, "ui_glassy_snap", -13, {}),
    (C["dikkat7"] - 0.05, "tap_negative", -10, {}),
    (C["sweden7"] - 0.1, "swoosh_fast", -12, {}),
    # war? not here. everyone gains
    (C["jung8"] - 0.1, "sword_hit", -8, {}),
    (C["jung8"] - 0.05, "impact_chord", -12, {}),
    (C["par8"] + 0.05, "wh_airy_soft", -12, {}),
    (C["fayda8"] - 0.4, "light_sweep_magic", -13, {}),
    (C["fayda8"] - 0.3, "waves_cliffs", -27, {"align": "start", "skip": 8.0, "dur": 2.8}),
    # 1985: the fix
    (C["sau9"] - 0.1, "page_turn_glossy", -12, {}),
    (C["y1985"] - 0.05, "thud_low", -7, {}),
    (C["y1985"] + 0.2, "typewriter_click", -15, {}),
    (C["hal9"] - 0.1, "shimmer_power", -13, {}),
    (C["moda10"] - 0.1, "wh_big_subtle_tonal", -9, {}),
    (C["zigzag10"] - 0.05, "pen_cross", -13, {}),
    (C["finland10"] - 0.05, "ui_pop_high", -12, {}),
    (C["barabar10"] - 0.05, "ui_glassy_snap", -12, {}),
    # the pull-out and the question
    (C["jung11"] - 0.1, "wh_airy_soft", -11, {}),
    (C["shareef11"] - 0.3, "wh_magic_air", -8, {}),
    (C["shareef11"], "waves_cliffs", -26, {"align": "start", "skip": 14.0, "dur": DURATION - C["shareef11"]}),
    (C["hatate12"] - 0.4, "whoosh_cinematic_fast", -9, {}),
    (C["lighthouse12"] - 0.15, "pop_light", -12, {}),
    (C["border12"] - 0.15, "pop_light", -12, {}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(AUD / "voiceover.mp3", VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    activity = envelope(talking.astype(np.float32), 0.03, 0.35)[:, None]

    music = np.zeros((n, 2), np.float32)
    for f, off, lvl in MUSIC:
        m = ff(AUD / f, "anull")[int(off * SR):][:n]
        layer = np.zeros((n, 2), np.float32)
        layer[: len(m)] = m
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(layer[: len(m)] ** 2) + 1e-12))
        music += layer
    # a dip for the 1809 rewind and the swords, so those land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["y1809"] + 0.1)) / 0.9, 0, 1) * 0.8 + np.clip(1 - np.abs(t_ax - (C["jung8"] + 0.2)) / 0.8, 0, 1) * 0.5
    music *= db(-MUSIC_DUCK * activity - 4.0 * np.clip(dip, 0, 1)[:, None])
    music = fade(music, 0.3, 2.0)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / f"{name}.mp3", f"highpass=f={HPF.get(name, 70)}")
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
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music {rms(music):.1f}  music+sfx {rms(music + sfx):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
