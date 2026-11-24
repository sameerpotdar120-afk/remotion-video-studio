#!/usr/bin/env python3
"""Brands Short: the mix. VO (1.15x) + Mixkit "Skyline" (as West Indies; ducked under the voice, its last 0.6 s
crossfading into its own start for the loop) + Sonniss SFX: a whoosh on every whip, a low hit on every fill, a pop on
every brand name and pill, a snap on every strike, a drop on "उल्टा".

  python3 tools/brands/mix_brands.py     # -> public/brands/audio/mix.wav (-14 LUFS)
"""
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
AUD = ROOT / "public" / "brands" / "audio"
SR = 48000
DUR = 57.5

# (sfx, time s, gain, max length s)
CUES = []
def add(kind, ts, g, mx):
    CUES.extend((kind, t, g, mx) for t in ts)

WHIPS = [2.1, 4.45, 6.48, 7.84, 17.66, 19.0, 20.75, 28.62, 31.84, 33.06, 35.55, 38.18, 41.12, 42.62, 45.86]
add("whoosh_cinematic_fast", [w - 0.05 for w in WHIPS], 0.7, 1.3)
add("whoosh_transition_fast", [11.15, 22.45, 48.85], 0.6, 1.4)
add("swoosh_windy", [25.0, 55.25], 0.35, 1.6)
add("boom_low", [2.42, 4.95, 6.98, 8.22, 13.0, 18.12, 19.5, 21.22, 29.05, 32.3, 36.0, 41.55, 43.05, 46.3], 0.42, 1.6)
add("impact_whoosh_deep", [0.0, 27.85, 50.3], 0.55, 2.0)
add("pop_high", [4.92, 8.1, 18.08, 19.45, 21.26, 28.95, 33.25, 38.37, 42.85, 56.38], 0.42, 0.7)
add("pop_light", [2.5, 5.1, 7.05, 8.3, 12.95, 18.55, 20.12, 21.78, 30.05, 32.25, 34.45, 36.05, 39.75, 41.6, 44.4, 46.25, 50.55, 50.85, 51.15, 51.45, 56.85], 0.5, 0.3)
add("ui_glassy_snap", [1.56, 6.15, 31.5, 35.33, 40.43], 0.55, 0.5)
add("crack", [1.6, 6.2, 31.55, 35.38, 40.48], 0.22, 0.8)
add("ui_bubbles", [5.62, 18.25, 19.62, 21.45, 32.3, 36.2, 41.68, 46.5, 56.55], 0.32, 0.6)
add("shimmer_power", [9.6, 30.8], 0.45, 1.5)
add("riser", [11.2], 0.3, 2.0)
add("whoosh_sparkle", [11.3, 44.05], 0.4, 1.0)
add("counter_ticking", [14.8], 0.3, 0.9)
add("subdrop", [23.5], 0.6, 2.5)
add("wh_big_tonal", [23.52], 0.5, 1.8)
add("light_transition_magic", [44.1], 0.45, 1.6)
add("chime_hit", [27.9, 54.85], 0.3, 2.0)


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
