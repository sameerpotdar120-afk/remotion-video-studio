"""Mix the Hormuz video as a seamless loop: the creator's voice on top, Mixkit "Epical Drums 06" as the bed, and an
effect on every visual hit: the gauge and the barrier across the strait, the fuel nozzle, the camera's big moves, the
flow bars, the lane to India, the canal cut, the Hajar range rising, the split, the icons, the pipelines and the bars.

    python3 tools/mix_hormuz.py        # writes public/hormuz/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Epical Drums 06", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "hormuz" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "hormuz" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_epical_drums_06_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 99.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (C["km"] - 0.1, "light_sweep_magic", -18, {}), (C["band"] - 0.05, "impact_trailer_epic", -14, {}), (C["petrol"] - 0.2, "wh_air_smooth", -17, {}),
    (C["petrol"] + 0.1, "pop_light", -18, {}), (C["doosra"] - 0.1, "ui_pop", -18, {}), (C["kyu"] - 0.05, "pop_high", -17, {}),
    (C["yehai"] - 0.1, "wh_big_tonal", -16, {}), (C["hormuz"] - 0.1, "pop_hard", -16, {}), (C["n2cr"] - 0.1, "ui_pop", -17, {}),
    (C["panch"] - 0.1, "pop_hard", -17, {}), (C["y2026"] - 0.1, "boom_low", -15, {}), (C["n216"] - 0.1, "counter_ticking", -21, {"dur": 0.8}),
    (C["n49"] - 0.05, "drum_hit_big", -15, {}), (C["bharat"] - 0.2, "whoosh_transition_fast", -16, {}), (C["bharat"] + 0.4, "light_sweep_magic", -18, {}),
    (C["aadha"] - 0.1, "pop_hard", -17, {}), (C["n26a"] - 0.1, "counter_ticking", -21, {"dur": 0.8}), (C["map"] - 0.1, "wh_big_tonal", -16, {}),
    (C["canal"] - 0.3, "pencil_circles", -17, {"dur": 1.3, "align": "start"}), (C["persian"], "swoosh_fast", -18, {}),
    (C["par"] - 0.1, "impact_whoosh_deep", -15, {}), (C["hajar"] - 0.1, "boom_low", -16, {}), (C["n700"] - 0.1, "counter_ticking", -21, {"dur": 0.9}),
    (C["choti"] - 0.1, "riser", -20, {"dur": 1.6}), (C["n3000"] - 0.05, "bass_hit_short", -15, {}),
    (C["upar"] - 0.2, "swoosh_fast", -16, {}), (C["uae"] - 0.1, "pop_light", -18, {}), (C["oman2"] - 0.1, "pop_light", -18, {}),
    (C["kat"] - 0.05, "impact_trailer_epic", -14, {}), (C["sec"] - 0.1, "pop_hard", -17, {}), (C["cus"] - 0.1, "pop_hard", -17, {}),
    (C["fauj"] - 0.1, "pop_hard", -17, {}), (C["sab"] - 0.1, "thud", -17, {}), (C["to3"] - 0.2, "swoosh_fast", -16, {}),
    (C["pipes"] - 0.1, "metal_thud", -16, {}), (C["saudi"] - 0.1, "whoosh_sparkle", -18, {}), (C["saudi"] + 0.1, "paper_quick_move", -18, {}),
    (C["redsea"] - 0.05, "pop_light", -18, {}), (C["uaep"] - 0.1, "whoosh_sparkle", -18, {}), (C["fuj"] - 0.05, "pop_light", -18, {}),
    (C["parh"] - 0.2, "wh_air_smooth", -17, {}), (C["n26b"] - 0.1, "counter_ticking", -21, {"dur": 0.8}), (C["bharat2"] - 0.1, "chime_hit", -17, {}),
    (C["n2cr2"] - 0.1, "riser", -21, {"dur": 1.0}), (C["kam"] - 0.05, "drum_hit_big", -15, {}), (C["baaki"] + 0.2, "wh_big_tonal", -17, {}),
]


def place(buf: np.ndarray, a: np.ndarray, start: float) -> None:
    """Add a at start (seconds); whatever runs past the end wraps round to the beginning, since the video loops."""
    n = len(buf)
    s = int(round(start * SR)) % n
    k = min(len(a), n - s)
    buf[s: s + k] += a[:k]
    if len(a) > k:
        buf[: len(a) - k] += a[k: k + n]


def main() -> None:
    n = int(round(DURATION * SR))
    voice = np.zeros((n, 2), np.float32)
    v = ff(VO, VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    from scipy import ndimage
    hop = SR // 100
    sp = ndimage.binary_closing(talking[::hop], structure=np.ones(15))
    speech = np.repeat(sp, hop)[:n]
    speech = np.pad(speech, (0, n - len(speech)), constant_values=False)
    # the sidechain envelope, computed over two loops so its state at the start matches the end
    act2 = envelope(np.concatenate([speech, speech]).astype(np.float32), 0.025, 0.12)
    activity = act2[n:][:, None]

    # the bed: its tail past the end is equal-power crossfaded into the head, so the loop has no seam
    m0 = ff(AUD / MUSIC, "anull")[int(MUSIC_OFF * SR):]
    # extend the track: from EXTEND_AT its opening fades back in (equal power) and carries on
    e, xe = int(EXTEND_AT * SR), int(EXTEND_XF * SR)
    w = np.linspace(0, 1, xe, dtype=np.float32)[:, None]
    m = np.concatenate([m0[:e], m0[e: e + xe] * np.cos(w * np.pi / 2) + m0[:xe] * np.sin(w * np.pi / 2), m0[xe:]])
    x = int(LOOP_XF * SR)
    assert len(m) >= n + x
    music = m[:n].copy()
    u = np.linspace(0, 1, x, dtype=np.float32)[:, None]
    music[:x] = music[:x] * np.sin(u * np.pi / 2) + m[n: n + x] * np.cos(u * np.pi / 2)
    music *= db(v_ref - 10 * np.log10(np.mean(music ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["band"], C["kat"], C["kam"]))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / f"{name}.mp3", f"highpass=f={HPF.get(name, 70)}")
        a = cache[name]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.08, 0.35)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        start = t - r.argmax() / SR if opt.get("align", "peak") == "peak" else t
        place(sfx, a, start)
    sfx *= db(-SFX_DUCK * activity)

    mix = voice + music + sfx
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                    "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9",
                    "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    tmp.unlink()
    rms = lambda y: 10 * np.log10(np.mean((y**2).mean(1)) + 1e-12)
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music talking {rms(music[speech]):.1f}  music pauses {rms(music[~speech]):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
