"""Mix Diomede v2: voice on top (reference-style), quiet bed, strong transition whooshes.

    python3 tools/mix_diomede2.py        # writes public/diomede/v2/audio/mix.wav

Cue times come from src/diomede2/timing.json (locked to the voiceover), so this mix
follows the voice just like the animation. Levels: loudest 50 ms vs average speech.
SFX: Sonniss GDC bundles. Music: Mixkit "Silent Descent" + "Epical Drums 06".
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "diomede" / "v2" / "audio"
T = json.load(open(ROOT / "src" / "diomede2" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_silent_descent_mixkit.mp3", 40.0, -25.0), ("music_epical_drums_06_mixkit.mp3", 10.0, -29.0)]
MUSIC_DUCK, SFX_DUCK = 4.0, 3.5
HPF = {"wind_winter_open": 180, "snow_walk_crusty": 150, "wh_airy_medium": 120, "wh_wind_gust": 140, "wh_magic_air": 110,
       "boom_low": 35, "thud_low": 45, "ice_crushed": 90}

CUES = [
    # the US, the laser, Russia
    (0.25, "ui_glassy_snap", -12, {}),
    (C["rus"] - 0.05, "laser_synth", -9, {"align": "start"}),
    (C["rus"] + 0.75, "thud_low", -9, {}),
    (C["rus"] + 0.78, "shimmer_power", -12, {}),
    # globe swing, iris wipe (reference: -4 dB)
    ((C["ekdusre"] + C["four"]) / 2, "wh_big_subtle_tonal", -5, {}),
    (C["four"] + 0.2, "wh_vacuum", -4, {}),
    (C["four"] + 0.3, "boom_low", -10, {}),
    (C["four"] + 0.6, "ui_pop_high", -10, {}),
    # connected: dashed lines, the burst
    (C["kabhi"] + 0.3, "wh_infographic_slide", -11, {}),
    (C["jud"], "magic_teleport", -8, {}),
    (C["jud"] + 0.02, "thud_low", -10, {}),
    # back to satellite (reference: -2 dB), Bering Strait, the dive through clouds
    (C["dono"], "wh_magic_air", -3, {}),
    (C["bering"], "ui_perc_snap", -11, {}),
    (C["bering"] + 0.05, "wh_air_smooth", -11, {}),
    ((C["zoom"] + C["dikhte"]) / 2 + 0.2, "wh_wind_gust", -5, {}),
    (C["diomede"], "ui_pop_high", -11, {}),
    (C["d38"], "ui_glassy_snap", -11, {}),
    # split screen
    (C["d38"] + 1.0, "wh_transition049", -8, {}),
    (C["d38"] + 1.02, "thud_low", -12, {}),
    # Little Diomede, the village
    (C["little"], "ui_pop_high", -10, {}),
    (C["usa2"], "ui_perc_snap", -13, {}),
    (C["basa"], "ui_scatter_plops", -12, {}),
    (C["gaon"] - 0.05, "wh_big_subtle_tonal", -4, {}),
    (C["eighty"] - 0.35, "counter_infographic", -15, {"align": "start", "dur": 0.6}),
    (C["eighty"] + 0.25, "ui_glassy_snap", -11, {}),
    # Big Diomede, the soldiers
    (C["bada"] - 0.05, "wh_airy_soft", -8, {}),
    (C["big"], "ui_pop_high", -10, {}),
    (C["rus2"], "ui_scatter_plops", -12, {}),
    (C["fauj"] - 0.15, "cartoon_pops", -12, {"align": "start"}),
    (C["fauj"] + 0.4, "ui_balafon", -10, {}),
    # 1867
    (C["bantwara"] + 0.3, "wh_airy_medium", -7, {}),
    (C["bantwara"] + 0.3, "paper_slide", -9, {}),
    (C["y1867"] + 0.14, "thud_low", -6, {}),
    (C["y1867"] + 0.15, "boom_low", -9, {}),
    (C["kharida"] - 0.1, "wh_fast", -12, {}),
    (C["kharida"], "coins_explainer", -8, {}),
    (C["kharida"] + 0.1, "coins_ting", -11, {}),
    (C["kharida"] + 0.2, "ui_wipe", -12, {}),
    # winter: wind, the freeze (big transition), the walk
    (C["sardi"] + 0.4, "wh_wind_gust", -6, {}),
    (C["sardi"], "wind_winter_open", -22, {"align": "start", "skip": 40.0, "dur": C["beech"] - C["sardi"] + 0.6}),
    (C["jamkar"], "ice_crushed", -5, {}),
    (C["jamkar"] + 0.05, "wh_magic_ice", -6, {}),
    (C["jamkar"] + 0.3, "ice_fissure", -9, {}),
    (C["pul"], "shimmer_power", -13, {}),
    (C["paidal"] - 0.1, "snow_walk_crusty", -14, {"align": "start", "skip": 4.0, "dur": C["beech"] - C["paidal"]}),
    # the date line
    (C["beech"] + 0.3, "wh_airy_medium", -6, {}),
    (C["intl"], "magic_teleport", -14, {}),
    (C["h21"], "ui_pop_high", -10, {}),
    # time travel
    (C["yaani"] + 0.45, "wh_air_smooth", -8, {}),
    (max(C["usa4"], C["yaani"] + 0.35), "clock_running_late", -15, {"align": "start", "dur": 0.6}),
    (max(C["usa4"], C["yaani"] + 0.35), "ui_perc_snap", -12, {}),
    (C["rus4"], "clock_running_late", -15, {"align": "start", "dur": 0.6}),
    (C["rus4"], "ui_perc_snap", -12, {}),
    (C["gaye"] + 0.35, "wh_vacuum", -8, {}),
    (C["kal"], "ui_glassy_snap", -9, {}),
    (C["time"] - 0.1, "portal_teleport", -7, {}),
    (C["time"] + 0.05, "shimmer_power", -11, {}),
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
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(layer**2) + 1e-12))
        music += layer
    music *= db(-MUSIC_DUCK * activity)
    music = fade(music, 0.2, 1.5)

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
