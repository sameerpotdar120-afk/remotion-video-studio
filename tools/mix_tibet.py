"""Mix the Tibet no-fly-zone video: the creator's voice on top, an ambient high-mountain bed, aviation/weather effects.

    python3 tools/mix_tibet.py        # writes public/tibet/audio/mix.wav

Cue times come from src/tibet/timing.json. The bed sits about 18 dB under the voice; effects stay small.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Vastness" (Andrew Ev), Mixkit free licence.
"""


import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "tibet" / "audio"
T = json.load(open(ROOT / "src" / "tibet" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_vastness_mixkit.mp3", 0.0, -15.0)]
MUSIC_DUCK, SFX_DUCK = 4.0, 2.5
HPF = {"thunder": 40, "boom_low": 35, "thud_low": 45, "wind_howl": 150, "cabin_flight": 80, "jet_pass": 120}

CUES = [
    # the globe and the hook
    (0.05, "impact_whoosh_deep", -9, {}),
    (0.2, "jet_pass", -20, {"align": "start", "skip": 3.0, "dur": 2.6}),
    (C["udta1"] - 0.05, "impact_blow", -10, {}),
    # radar
    (C["radar2"] - 0.3, "wh_fast", -9, {}),
    (C["radar2"], "radar_ping", -12, {}),
    (C["chaaron2"], "typewriter_click", -16, {}),
    (C["beech2"] - 0.1, "light_sweep_magic", -13, {}),
    (C["khaali2"] - 0.05, "tap_negative", -10, {}),
    # the plateau, India
    (C["pathar3"] - 0.3, "whoosh_cinematic_fast", -8, {}),
    (C["pathar3"], "ui_pop_high", -11, {}),
    (C["lakh3"] - 0.05, "pop_light", -12, {}),
    (C["bharat3"] - 0.1, "shimmer_power", -13, {}),
    (C["teen4"] - 0.05, "pop_light", -12, {}), (C["teen4"] + 0.07, "pop_light", -12, {}), (C["teen4"] + 0.19, "pop_light", -12, {}),
    # 1 · height: dive through the clouds into 3D
    (C["pehli5"] - 0.5, "wh_big_subtle_tonal", -7, {}),
    (C["pehli5"] - 0.35, "wind_howl", -20, {"align": "start", "dur": 3.2}),
    (C["pehli5"], "ui_pop_high", -11, {}),
    (C["ft14800"] - 0.05, "ui_glassy_snap", -12, {}),
    (C["everest5"] - 0.1, "impact_chord", -12, {}),
    (C["plane6"] - 0.2, "cabin_flight", -24, {"align": "start", "skip": 4.0, "dur": C["pilot7"] - C["plane6"] + 0.4}),
    (C["ft35000"] - 0.05, "ui_glassy_snap", -12, {}),
    (C["gir6"] - 0.05, "stall_warning", -9, {}),
    (C["gir6"] + 0.6, "alarm_slow", -14, {}),
    (C["oxygen6"] - 0.1, "thud_low", -10, {}),
    (C["min15"] - 0.1, "typewriter_click", -13, {}),
    (C["pilot7"] - 0.05, "whoosh_cinematic_fast", -8, {}),
    (C["ft10000"] - 0.05, "ui_glassy_snap", -12, {}),
    (C["par7"], "riser_9", -16, {"align": "start", "dur": C["ft15000"] - C["par7"] + 0.2}),
    (C["ft15000"] + 0.1, "click_error", -9, {}),
    (C["ft15000"] + 0.12, "boom_low", -11, {}),
    # 2 · weather
    (C["doosri8"] - 0.3, "wh_magic_air", -8, {}),
    (C["doosri8"], "thunder", -16, {"align": "start", "dur": 5.5}),
    (C["hawayen8"] - 0.2, "wind_howl", -17, {"align": "start", "dur": 3.0}),
    (C["turb8"] - 0.05, "impact_blow", -11, {}),
    # 3 · airports
    (C["teesri9"] - 0.1, "swoosh_fast", -11, {}),
    (C["emergency9"] - 0.1, "pop_light", -12, {}),
    (C["airports9"] - 0.05, "click_error", -11, {}),
    (C["airports9"] + 0.1, "radar_ping", -15, {}),
    (C["patli9"], "wh_airy_soft", -12, {}),
    # around
    (C["gadbad10"] - 0.2, "whoosh_cinematic_fast", -9, {}),
    (C["gadbad10"] + 0.4, "jet_pass", -22, {"align": "start", "skip": 8.0, "dur": 3.0}),
    (C["ghoom10"] - 0.05, "light_sweep_magic", -13, {}),
    # the question
    (C["tum11"] - 0.3, "wh_airy_soft", -11, {}),
    (C["seedha11"] - 0.15, "pop_light", -12, {}),
    (C["ghoom11"] - 0.15, "pop_light", -12, {}),
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
    # a dip for the pressure alarm and the 15,000 ft reveal, so those land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["gir6"] + 0.4)) / 1.0, 0, 1) * 0.7 + np.clip(1 - np.abs(t_ax - (C["ft15000"] + 0.3)) / 0.9, 0, 1) * 0.7
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
