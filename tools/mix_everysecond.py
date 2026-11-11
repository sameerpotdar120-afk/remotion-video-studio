"""Mix the "every second" video as a seamless loop: the creator's voice on top, Mixkit "Discover" as the bed, and an
effect on every visual hit: the stopwatch tick, pops for babies and props, counters, the search bar typing, rupee pings,
thunder on the lightning, the cross-out and the 44 stamp, flames and CO2, the space whooshes, and the clock at the loop.

    python3 tools/mix_everysecond.py        # writes public/everysecond/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Discover", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "everysecond" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "everysecond" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_discover_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 120.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (C["sec"] - 0.1, "clock", -22, {"dur": 2.2, "align": "start"}), (C["n4a"] - 0.1, "pop_light", -18, {}), (C["n4a"] + 0.02, "pop_light", -18, {}),
    (C["n4a"] + 0.14, "pop_light", -18, {}), (C["n4a"] + 0.26, "pop_light", -18, {}), (C["km30a"] - 0.1, "whoosh_sparkle", -17, {}),
    (C["kya"] - 0.05, "pop_high", -17, {}), (C["n4b"] - 0.2, "swoosh_fast", -17, {}), (C["n4b"] + 0.4, "thud", -19, {}),
    (C["n2"] - 0.1, "chime_hit", -20, {}), (C["bharat"] - 0.2, "wh_big_tonal", -16, {}), (C["dedh"] - 0.1, "pop_hard", -17, {}),
    (C["ek"] - 0.2, "pop_light", -17, {}), (C["isi"] - 0.1, "whoosh_transition_fast", -16, {}), (C["n40"] - 0.3, "toon_pops", -19, {}),
    (C["n40"] - 0.1, "counter_ticking", -21, {"dur": 0.8}), (C["google"] - 0.2, "typewriter_click", -20, {"dur": 1.0, "align": "start"}),
    (C["bharat2"] - 0.3, "swoosh_fast", -16, {}), (C["upi"] - 0.4, "cartoon_pops", -19, {}), (C["n9500"] - 0.1, "counter_ticking", -21, {"dur": 1.0}),
    (C["dharti2"] - 0.2, "wh_air_smooth", -17, {}), (C["bijli"] - 0.1, "boom", -16, {}), (C["bijli"] + 0.6, "boom_hit", -19, {}),
    (C["n100"] + 0.2, "pen_cross", -17, {}), (C["n44b"] - 0.05, "drum_hit_big", -15, {}), (C["sat"] - 0.2, "light_sweep_magic", -19, {}),
    (C["oil"] - 0.2, "whoosh_transition_fast", -16, {}), (C["n1200a"] - 0.3, "toon_pops", -19, {}), (C["n1200a"] - 0.1, "counter_ticking", -21, {"dur": 0.9}),
    (C["co2"] - 0.2, "wind_dry", -21, {"dur": 2.0, "align": "start"}), (C["n1200b"] - 0.1, "pop_hard", -17, {}),
    (C["roshni"] - 0.6, "wh_big_tonal", -16, {}), (C["n7"] - 0.3, "riser", -20, {"dur": 1.4}), (C["chakkar"] + 0.8, "bass_hit_short", -16, {}),
    (C["tum"] - 0.1, "pop_high", -17, {}), (C["suraj"] - 0.2, "wh_magic_air", -17, {}), (C["km30"] - 0.1, "whoosh_sparkle", -16, {}),
    (C["yesab"] - 0.4, "whoosh_transition_fast", -16, {}), (C["phirbhi"] + 0.3, "clock", -22, {"dur": 1.2, "align": "start"}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["n44b"], C["chakkar"]))
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
