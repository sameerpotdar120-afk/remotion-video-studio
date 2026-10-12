"""Mix the sugar-journey video: the creator's voice on top, a world-music bed, map/foley effects.

    python3 tools/mix_sugar.py        # writes public/sugar/audio/mix.wav

Cue times come from src/sugar/timing.json. The bed sits about 18 dB under the voice; effects stay small.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Sun and His Daughter" (Eugenio Mininni), Mixkit free licence.
"""


import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "sugar" / "audio"
T = json.load(open(ROOT / "src" / "sugar" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_sun_and_his_daughter_mixkit.mp3", 3.0, -14.5)]
MUSIC_DUCK, SFX_DUCK = 4.0, 2.5
HPF = {"waves_cliffs": 150, "boom_low": 35, "thud_low": 45, "fire": 120, "wind_snow_gusty": 200}

CUES = [
    (0.05, "impact_whoosh_deep", -9, {}),
    (0.15, "sugar_pour", -14, {}),
    (C["cheen1"] - 0.05, "ui_glassy_snap", -12, {}),
    (C["mishri1"] - 0.1, "ui_glassy_snap", -12, {}),
    (C["jawab2"] - 0.1, "wh_magic_air", -8, {}),
    (C["jawab2"] + 0.2, "light_sweep_magic", -13, {}),
    (C["bharat2"] - 0.3, "whoosh_cinematic_fast", -8, {}),
    (C["bharat2"], "boom_low", -11, {}),
    (C["y1500"] - 0.05, "page_turn_glossy", -13, {}),
    (C["ganne3"] - 0.1, "pop_light", -13, {}),
    (C["jama3"] - 0.15, "pop_light", -13, {}),
    (C["jama3"], "fire", -22, {"align": "start", "dur": C["sharkara4"] - C["jama3"]}),
    (C["daane3"] - 0.05, "sugar_pour", -12, {}),
    (C["sharkara4"] - 0.05, "ui_pop_high", -11, {}),
    (C["matlab4"] + 0.2, "pop_light", -13, {}),
    (C["persia5"] - 0.8, "wh_big_subtle_tonal", -8, {}),
    (C["persia5"] - 0.7, "wind_snow_gusty", -22, {"align": "start", "skip": 2.0, "dur": 1.6}),
    (C["shakar5"] - 0.05, "ui_pop_high", -11, {}),
    (C["sukkar5"] - 0.05, "ui_pop_high", -11, {}),
    (C["europe6"] - 0.4, "whoosh_cinematic_fast", -8, {}),
    (C["europe6"] - 0.3, "waves_cliffs", -26, {"align": "start", "skip": 4.0, "dur": 2.0}),
    (C["zucchero"] - 0.05, "pop_light", -12, {}),
    (C["sucre"] - 0.05, "pop_light", -12, {}),
    (C["sugar6"] - 0.05, "ui_pop_high", -10, {}),
    (C["sugar6"], "thud_low", -10, {}),
    (C["yani7"] - 0.1, "wh_fast", -8, {}),
    (C["yani7"] + 0.5, "impact_chord", -10, {}),
    (C["yani7"] + 0.55, "boom_low", -10, {}),
    (C["hamara7"], "shimmer_power", -13, {}),
    (C["tukde8"] - 0.2, "thud_low", -9, {}),
    (C["khand8"] - 0.05, "ui_pop_high", -11, {}),
    (C["persia9"] - 0.5, "wh_big_subtle_tonal", -9, {}),
    (C["kand9"] - 0.05, "ui_pop_high", -11, {}),
    (C["kalakand"] - 0.1, "pop_light", -13, {}),
    (C["gulkand"] - 0.1, "pop_light", -13, {}),
    (C["angrez10"] - 0.2, "whoosh_cinematic_fast", -9, {}),
    (C["candy"] - 0.05, "ui_glassy_snap", -11, {}),
    (C["egypt11"] - 0.2, "wh_magic_air", -9, {}),
    (C["egypt11"] - 0.1, "wind_snow_gusty", -22, {"align": "start", "skip": 4.0, "dur": 2.0}),
    (C["crystals"] - 0.1, "shimmer_power", -13, {}),
    (C["arab11"] - 0.2, "swoosh_fast", -12, {}),
    (C["misr11"] - 0.05, "impact_blow", -10, {}),
    (C["mishri11"] - 0.05, "light_sweep_magic", -13, {}),
    (C["china12"] - 0.2, "wh_big_subtle_tonal", -9, {}),
    (C["china12"] + 0.1, "waves_cliffs", -26, {"align": "start", "skip": 10.0, "dur": 2.4}),
    (C["safed12"] - 0.05, "sugar_pour", -12, {}),
    (C["cheeni12"] - 0.05, "impact_blow", -9, {}),
    (C["nikli13"] - 0.6, "riser_9", -16, {"align": "start", "dur": C["ghar13"] - C["nikli13"] + 0.6}),
    (C["ghar13"], "impact_chord", -9, {}),
    (C["ghar13"] + 0.02, "boom_low", -10, {}),
    (C["ghar13"] + 0.1, "sugar_pour", -14, {}),
    (C["ghar14"] - 0.2, "wh_airy_soft", -11, {}),
    (C["shakkar14"] - 0.1, "pop_light", -12, {}),
    (C["cheeni14"] - 0.1, "pop_light", -12, {}),
    (C["aur14"] - 0.1, "pop_light", -12, {}),
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
    # a dip for the SUGAR = शर्करा stamp and the homecoming, so those land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["yani7"] + 0.6)) / 0.9, 0, 1) * 0.7 + np.clip(1 - np.abs(t_ax - (C["ghar13"] + 0.2)) / 0.9, 0, 1) * 0.7
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
