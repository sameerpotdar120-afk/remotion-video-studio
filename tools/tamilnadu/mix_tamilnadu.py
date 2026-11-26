#!/usr/bin/env python3
"""Tamil Nadu letters Short: the mix. NO music (creator, Nov 26). The VO (1.15x) plus Sonniss GDC sound effects, each
one the real thing on screen and placed on its word (sources: public/tamilnadu/audio/sfx/SOURCES.json, all from the
Sonniss GDC game-audio bundles on archive.org, royalty-free). Every SFX is peak-normalised, then given its own gain.

  python3 tools/tamilnadu/mix_tamilnadu.py     # -> public/tamilnadu/audio/mix.wav (-14 LUFS)
"""
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
AUD = ROOT / "public" / "tamilnadu" / "audio"
SR = 48000
DUR = 73.7

# (sfx, time s, gain, max length s, offset into the file s)
CUES = []


def add(kind, ts, g, mx, off=0.0):
    CUES.extend((kind, t, g, mx, off) for t in ts)


# the hook (0–7.4 s)
add("deep_thud", [0.0], 0.5, 1.6)
add("ui_click", [0.02, 72.24], 0.55, 0.2)
add("wind_rush", [0.12, 1.42, 7.78, 9.55, 69.7, 72.3], 0.5, 1.05)
add("lens_dial", [2.36], 0.45, 0.7, 0.1)
add("shutter", [2.44], 0.55, 0.7)
add("pencil_tick", [3.92 + i * 0.15 for i in range(5)], 0.5, 0.25)
add("marker_strike", [4.66, 64.28, 65.43], 0.6, 0.5)
add("stone_hit_a", [5.64, 6.2, 6.76, 66.0], 0.45, 0.9)
add("stone_hit_b", [5.92, 6.48, 69.0], 0.42, 0.9)
add("bowl", [7.02, 46.6], 0.3, 3.2)
# Thanjavur, the campus, MGR
add("wood_figure", [8.3], 0.45, 1.5)
add("marker_strike", [11.18], 0.3, 0.6)
add("brick_hit", [13.14], 0.45, 1.0)
add("deep_thud", [13.16, 56.75], 0.25, 1.4)
add("counter", [14.94, 30.42], 0.5, 0.7)
add("flash_old", [17.04], 0.55, 1.1)
# the blueprint
add("paper_slide", [20.35, 36.8], 0.65, 0.8, 0.45)
add("paper_rustle", [20.5, 29.78], 0.4, 1.0)
add("pencil_write", [22.14 + i * 0.55 for i in range(5)] + [26.82], 0.55, 0.6, 1.7)
add("pencil_tick", [23.16 + i * 0.42 for i in range(5)], 0.3, 0.25)
add("pencil_circles", [28.45], 0.55, 1.1, 0.5)
add("paper_handle", [31.95], 0.4, 2.6, 0.4)
# the rise
add("counter", [36.9], 0.45, 1.6)
add("crane_hoist", [38.5, 44.4], 0.3, 2.0, 1.5)
add("brick_lay", [38.76, 41.22, 42.18, 44.55, 44.75], 0.55, 0.9)
add("brick_hit", [38.95, 41.35, 42.32, 44.85], 0.35, 1.0)
add("counter", [43.66], 0.5, 0.9)
add("pencil_tick", [46.46], 0.4, 0.25)
# the faculties
add("leaf_swish", [50.45], 0.6, 1.6)
add("wine_glass", [52.4], 0.45, 1.0)
add("plant_growth", [53.8], 0.85, 2.0, 2.0)
add("leaf_swish", [53.9], 0.3, 1.2)
# back to the map and into frame 0
add("deep_thud", [70.2], 0.25, 1.4)


def load(path, mono=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32)
    return a if mono else a.reshape(-1, 2).copy()


def main():
    n = int(DUR * SR)
    vo = load(AUD / "vo_115.wav", mono=True)[:n]
    vo = np.pad(vo, (0, n - len(vo)))
    sfx = np.zeros((n, 2), np.float32)
    bank = {}
    for kind, t, g, mx, off in CUES:
        if kind not in bank:
            a = load(AUD / "sfx" / f"{kind}.mp3")
            bank[kind] = a / max(1e-6, np.abs(a).max())
        s = bank[kind][int(off * SR): int((off + mx) * SR)].copy()
        fl = min(len(s), int(0.12 * SR))
        s[-fl:] *= np.linspace(1, 0, fl, dtype=np.float32)[:, None]
        i = int(t * SR)
        j = min(n, i + len(s))
        sfx[i:j] += s[: j - i] * g
    mix = np.c_[vo, vo] * 1.0 + sfx * 0.42
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    raw = AUD / "mix_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(raw)],
                   input=mix.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    raw.unlink()
    print(len(CUES), "cues; wrote", AUD / "mix.wav")


if __name__ == "__main__":
    main()
