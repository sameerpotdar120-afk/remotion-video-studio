#!/usr/bin/env python3
"""Nauru Short: the mix. VO (1.15x) + Mixkit "Kidding Around" (ducked under the voice, extended to the film's
length, its tail crossfading into its own start for the loop) + Sonniss SFX cued from the scene's own items.

  python3 tools/gta6/mix_gta.py     # -> public/gta6/film/audio/mix.wav (-14 LUFS) and sfx_cues.json
"""
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np  # noqa: E402

import nrkit as NK  # noqa: E402
from nrkit import G  # noqa: E402
import render_nauru as R  # noqa: E402

REPO = G.REPO
SR = 48000
AUD = NK.FILM / "audio"
SFX = {
    "hit0": "public/nauru/audio/sfx/bass_hit_short.mp3",
    "year": "public/nauru/audio/sfx/impact_trailer_epic.mp3",
    "whoosh": "public/nauru/audio/sfx/whoosh_transition_fast.mp3",
    "swoosh": "public/nauru/audio/sfx/swoosh_fast.mp3",
    "pop": "public/nauru/audio/sfx/pop_light.mp3",
    "pophi": "public/nauru/audio/sfx/pop_high.mp3",
    "ticks": "public/nauru/audio/sfx/counter_ticking.mp3",
    "drum": "public/nauru/audio/sfx/drum_hit_big.mp3",
    "glitch": "public/nauru/audio/sfx/glitch_electric_small.mp3",
    "zoom": "public/nauru/audio/sfx/impact_quick_zoom.mp3",
    "boom": "public/nauru/audio/sfx/boom_low.mp3",
    "laser": "public/nauru/audio/sfx/laser_synth.mp3",
    "jet": "public/nauru/audio/sfx/jet_pass.mp3",
    "bird": "public/nauru/audio/sfx/bird_screech.mp3",
    "coins": "public/nauru/audio/sfx/coins_ting.mp3",
    "thud": "public/nauru/audio/sfx/thud.mp3",
    "pops": "public/nauru/audio/sfx/cartoon_pops.mp3",
}


def load(path, mono=False):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1" if mono else "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32)
    return a if mono else a.reshape(-1, 2)


def cues():
    film, screen = R.build()
    out = [("hit0", 0.0, 0.8)]
    for it in film.items:
        n = type(it).__name__
        if n == "GPSRoute":
            out.append(("whoosh", it.t_in, 0.5))
        elif n == "Jets" and it.t_in > 0:
            out.append(("jet", it.t_in, 0.55))
        elif n == "Outline" and it.t_in > 0 and it.fill:
            out.append(("zoom", it.t_in - 0.05, 0.4))
        elif n == "CityGlow":
            out.append(("coins", it.t_in, 0.5))
        elif n == "Pictos":
            out.append(("pops", it.t_in, 0.45))
    for s in screen:
        n = type(s).__name__
        if n == "YearCard":
            out.append(("year", s.t_in - 0.03, 0.7))
        elif n == "Stamp":
            out.append(("thud", s.t_in + 0.05, 0.9))
        elif n == "Poster":
            out.append(("bird" if "seabird" in s.name else "swoosh", s.t_in, 0.45))
        elif n == "NullPanel":
            out += [("glitch", s.t_in, 0.5), ("glitch", s.t_out, 0.4)]
        elif n == "Chip":
            out.append(("pophi", s.t_in, 0.25))
        elif n == "IncomeBars":
            out.append(("ticks", s.t_in + 0.2, 0.4))
    out.sort(key=lambda c: c[1])
    kept, last = [], {}
    for k, t, g in out:
        if t - last.get(k, -9) >= 0.25 and 0 <= t < R.scene.DUR:
            kept.append((k, t, g)); last[k] = t
    return kept


def main():
    n = int(R.scene.DUR * SR)
    vo = load(AUD / "vo_115.wav", mono=True)[:n]
    vo = np.pad(vo, (0, n - len(vo)))
    # music: the track, then from 0:16 again with a 3 s crossfade at 1:06, to cover the film
    m = load(REPO / "public/nauru/audio/music_kidding_around_mixkit.mp3")
    cut, xf, back = int(66 * SR), int(3 * SR), int(16 * SR)
    tail = m[back:]
    music = np.zeros((n + SR, 2), np.float32)
    music[:cut + xf] = m[:cut + xf]
    ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    music[cut:cut + xf] = m[cut:cut + xf] * (1 - ramp) + tail[:xf] * ramp
    rest = tail[xf:xf + (n + SR - cut - xf)]
    music[cut + xf:cut + xf + len(rest)] = rest
    music = music[:n]
    # loop: the last 0.5 s crossfades into the music's own start
    L = int(0.5 * SR); r2 = np.linspace(0, 1, L, dtype=np.float32)[:, None]
    music[-L:] = music[-L:] * (1 - r2) + m[:L] * r2
    # duck under the voice
    env = np.abs(vo)
    k = int(0.25 * SR)
    sm = np.convolve(env, np.ones(k, np.float32) / k, mode="same")
    talk = np.clip(sm / (np.percentile(sm, 90) * 0.35), 0, 1)
    duck = 0.30 - 0.17 * talk
    music *= duck[:, None]
    # sfx
    sfx = np.zeros((n, 2), np.float32)
    bank = {}
    cl = cues()
    for kind, t, g in cl:
        if kind not in bank:
            bank[kind] = load(REPO / SFX[kind])
        s = bank[kind]
        if kind == "ticks":
            s = s[: int(1.6 * SR)]
        i = int(t * SR); j = min(n, i + len(s))
        sfx[i:j] += s[: j - i] * g
    (AUD / "sfx_cues.json").write_text(json.dumps(cl, indent=0))
    mix = np.c_[vo, vo] * 1.0 + music + sfx * 0.55
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    raw = AUD / "mix_raw.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(raw)],
                   input=mix.astype(np.float32).tobytes(), check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR),
                    str(AUD / "mix.wav")], check=True)
    print(len(cl), "cues;", "wrote", AUD / "mix.wav")


if __name__ == "__main__":
    main()
