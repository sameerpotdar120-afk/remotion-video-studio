"""Mix the Pangea video as a seamless loop: the creator's voice on top, Mixkit "Vastness" as the bed, and an effect on
every visual hit: counter ticks, the satellite-to-old-map page turns, pops for labels and fills, the breakup whooshes,
waves on the Tethys, the crash, rising rock, the lamp chime, the heat riser and the mammals fading.

    python3 tools/mix_pangea.py        # writes public/pangea/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Vastness", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "pangea" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "pangea" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_vastness_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 200.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (C["n5"] - 0.1, "counter_ticking", -22, {"dur": 0.9}), (C["n5"] + 0.8, "pop_hard", -18, {}),
    (C["n25"] - 0.2, "wh_big_tonal", -17, {}), (C["n25"] - 0.05, "counter_ticking", -22, {"dur": 1.0}),
    (C["mammals"] - 0.2, "toon_pops", -20, {}), (C["kyu"] - 0.05, "pop_high", -16, {}),
    (C["karib30"] - 0.1, "page_turn", -17, {}), (C["karib30"] + 0.3, "counter_ticking", -22, {"dur": 1.2}),
    (C["n30"] + 0.6, "wh_magic_air", -17, {}), (C["pangea"] - 0.05, "impact_whoosh_deep", -16, {}),
    (C["aur_bharat"] - 0.1, "whoosh_sparkle", -17, {}), (C["asia"] + 0.3, "pen_cross", -17, {}),
    (C["africa"] - 0.05, "pop_light", -17, {}), (C["antarc"] - 0.05, "pop_light", -17, {}), (C["austr"] - 0.05, "pop_light", -17, {}),
    (C["toota"] - 0.1, "boom_low", -16, {}), (C["toota"] + 0.4, "paper_slide", -19, {}), (C["bhagta"] - 0.3, "wh_fast", -16, {}),
    (C["n15"] - 0.05, "ui_pop", -17, {}), (C["tethys"] - 0.3, "waves_soft", -20, {"dur": 2.2, "align": "start"}),
    (C["karib5"] - 0.1, "counter_ticking", -22, {"dur": 0.9}), (C["n5cr"] + 0.6, "riser", -21, {"dur": 2.2, "align": "start"}),
    (C["takraya"], "impact_trailer_epic", -12, {}), (C["farsh"] - 0.2, "wind_dry", -21, {"dur": 2.0, "align": "start"}),
    (C["himalaya"] - 0.05, "drum_hit_big", -16, {}), (C["everest"] - 0.2, "whoosh_transition_fast", -17, {}),
    (C["fossil"] - 0.05, "pop_hard", -17, {}), (C["shaligram"] - 0.15, "chime_hit", -17, {}), (C["ammonite"] - 0.1, "light_sweep_magic", -17, {}),
    (C["takkar2"] - 0.1, "thud", -17, {}), (C["model"] - 0.1, "page_turn", -17, {}), (C["model"] + 0.2, "counter_ticking", -22, {"dur": 1.2}),
    (C["atlantic"] - 0.1, "wh_air_smooth", -18, {}), (C["america"] - 0.05, "pop_light", -17, {}), (C["africa2"] - 0.05, "pop_light", -17, {}),
    (C["austr2"] - 0.05, "pop_light", -17, {}), (C["asia2"] - 0.05, "pop_light", -17, {}), (C["n25b"] - 0.05, "boom_hit", -16, {}),
    (C["ultima"] - 0.05, "stinger", -16, {}), (C["n2023"] - 0.1, "typewriter_click", -21, {"dur": 0.8, "align": "start"}),
    (C["n40"] - 0.4, "riser", -20, {"dur": 2.0, "align": "start"}), (C["n70"] - 0.05, "bass_hit_short", -16, {}),
    (C["mammals2"] - 0.1, "toon_pops", -20, {}), (C["n8"] - 0.2, "heartbeat_impact_deep", -16, {}),
    (C["yani"] - 0.2, "wh_big_tonal", -17, {}), (C["mita"] - 0.05, "boom", -15, {}), (C["kyunki"] - 0.3, "whoosh_transition_fast", -17, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["takraya"], C["n8"]))
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
