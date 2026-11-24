#!/usr/bin/env python3
"""Everest Short: the mix. VO (1.15x) + Mixkit "Skyline" (as West Indies; ducked under the voice, its last 0.6 s
crossfading into its own start for the loop) + Sonniss SFX on every cut, fill, pop, count and impact, plus beds:
underwater bubbles/waves while the camera is under the old sea, wind on the summit.

  python3 tools/everest/mix_everest.py     # -> public/everest/audio/mix.wav (-14 LUFS)
"""
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
AUD = ROOT / "public" / "everest" / "audio"
SR = 48000
DUR = 61.0

# (sfx, time s, gain, max length s)
CUES = [
    ("subdrop", 0.0, 0.7, 2.5), ("ui_bubbles", 0.15, 0.6, 1), ("splash", 1.3, 0.55, 2.2), ("wind_howl", 2.0, 0.35, 4.0),
    ("swell_tonal", 2.4, 0.25, 4), ("counter_ticking", 3.0, 0.35, 1.4), ("chime_hit", 4.35, 0.45, 2.5),
    ("waves_soft", 5.9, 0.6, 2.3), ("splash", 6.6, 0.45, 2.0), ("ui_glassy_snap", 6.5, 0.5, 0.5),
    ("whoosh_cinematic_fast", 8.2, 0.8, 1.4), ("impact_whoosh_deep", 8.42, 0.6, 2.0), ("shimmer_power", 9.35, 0.5, 1.6),
    ("ui_glassy_snap", 9.4, 0.5, 0.5), ("counter_ticking", 10.8, 0.35, 0.9), ("boom_low", 11.7, 0.45, 2.0),
    ("waves_soft", 12.7, 0.45, 1.6), ("ui_glassy_snap", 13.0, 0.45, 0.5),
    ("whoosh_transition_fast", 14.05, 0.8, 1.2), ("swoosh_windy", 14.5, 0.5, 1.6), ("pop_high", 14.75, 0.4, 0.7),
    ("wh_big_tonal", 15.4, 0.4, 2.0), ("pop_high", 16.15, 0.4, 0.7),
    ("splash", 17.3, 0.6, 1.8), ("ui_bubbles", 17.6, 0.6, 1), ("pop_light", 18.3, 0.5, 0.3), ("light_transition_magic", 20.7, 0.5, 1.6),
    ("pop_high", 21.05, 0.4, 0.7), ("light_transition_magic", 22.25, 0.5, 1.6), ("pop_high", 22.15, 0.4, 0.7), ("pop_light", 23.65, 0.5, 0.3),
    ("whoosh_cinematic_fast", 24.55, 0.8, 1.4), ("riser", 25.0, 0.35, 4.3), ("pop_high", 24.95, 0.4, 0.7), ("counter_ticking", 27.2, 0.3, 0.6),
    ("pop_high", 28.8, 0.4, 0.7), ("whoosh_sparkle", 28.4, 0.4, 1.0),
    ("thunder_impact", 29.3, 0.9, 3.5), ("boom", 29.36, 0.8, 3.0), ("crack", 29.45, 0.4, 2.0),
    ("pop_high", 31.3, 0.4, 0.7), ("waves_soft", 31.4, 0.35, 1.4),
    ("whoosh_transition_fast", 32.1, 0.7, 1.2), ("subdrop", 32.6, 0.6, 3.0), ("swell_tonal", 32.8, 0.45, 3.2), ("crack", 33.6, 0.35, 1.8),
    ("ui_glassy_snap", 34.5, 0.45, 0.5), ("whoosh_sparkle", 34.3, 0.35, 1.0),
    ("pop_high", 35.7, 0.4, 0.7), ("wh_big_tonal", 36.1, 0.55, 1.8), ("shimmer_power", 37.15, 0.45, 1.5), ("pop_light", 37.8, 0.5, 0.3),
    ("whoosh_cinematic_fast", 38.1, 0.55, 1.4), ("pop_high", 38.8, 0.45, 0.7), ("counter_ticking", 40.55, 0.3, 0.8), ("chime_hit", 41.3, 0.35, 2),
    ("boom_low", 42.45, 0.45, 1.6), ("pop_light", 42.5, 0.5, 0.3), ("ui_bubbles", 43.5, 0.6, 1), ("waves_soft", 43.4, 0.4, 1.3),
    ("magic", 44.3, 0.5, 1.8), ("pop_high", 44.4, 0.4, 0.7),
    ("whoosh_transition_fast", 46.0, 0.6, 1.2), ("swoosh_windy", 46.4, 0.4, 1.6), ("wh_big_tonal", 47.75, 0.5, 2.0), ("pop_high", 47.85, 0.4, 0.7),
    ("riser", 48.6, 0.3, 2.2), ("subdrop", 50.6, 0.55, 3.0), ("swell_tonal", 50.7, 0.35, 2.5), ("ui_glassy_snap", 51.05, 0.45, 0.5),
    ("whoosh_cinematic_fast", 52.45, 0.7, 1.4), ("wind_howl", 52.7, 0.3, 3.6), ("pop_light", 54.1, 0.5, 0.3), ("pop_light", 54.85, 0.5, 0.3),
    ("impact_whoosh_deep", 56.5, 0.75, 2.0), ("wh_big_tonal", 56.6, 0.5, 1.8), ("wind_howl", 57.5, 0.3, 2.0), ("chime_hit", 57.9, 0.35, 2),
    ("pop_high", 58.5, 0.4, 0.7), ("waves_soft", 58.8, 0.55, 2.2), ("splash", 59.6, 0.45, 1.4), ("ui_bubbles", 60.5, 0.5, 0.5),
]


def load(path, mono=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32)
    return a if mono else a.reshape(-1, 2).copy()


def main():
    n = int(DUR * SR)
    vo = load(AUD / "vo_115.wav", mono=True)[:n]
    vo = np.pad(vo, (0, n - len(vo)))
    m = load(AUD / "music_skyline_mixkit.mp3")
    start = int(4.0 * SR)  # skip the slow intro so the bed is already moving on frame 0
    music = m[start:start + n].copy()
    L = int(0.6 * SR)
    r2 = np.linspace(0, 1, L, dtype=np.float32)[:, None]
    music[-L:] = music[-L:] * (1 - r2) + m[start:start + L] * r2  # the loop point
    env = np.abs(vo)
    k = int(0.25 * SR)
    sm = np.convolve(env, np.ones(k, np.float32) / k, mode="same")
    talk = np.clip(sm / (np.percentile(sm, 90) * 0.35), 0, 1)
    music *= (0.32 - 0.19 * talk)[:, None]
    sfx = np.zeros((n, 2), np.float32)
    bank = {}
    for kind, t, g, mx in CUES:
        if kind not in bank:
            bank[kind] = load(AUD / "sfx" / f"{kind}.mp3")
        s = bank[kind][: int(mx * SR)].copy()
        fl = min(len(s), int(0.15 * SR))
        s[-fl:] *= np.linspace(1, 0, fl, dtype=np.float32)[:, None]
        i = int(t * SR)
        j = min(n, i + len(s))
        sfx[i:j] += s[: j - i] * g
    mix = np.c_[vo, vo] * 1.0 + music + sfx * 0.5
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    raw = AUD / "mix_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(raw)],
                   input=mix.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    raw.unlink()
    print(len(CUES), "cues; wrote", AUD / "mix.wav")


if __name__ == "__main__":
    main()
