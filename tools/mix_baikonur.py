"""Mix the Baikonur video as a seamless loop: the creator's voice (1.15x as asked) on top, Mixkit "Vastness" as the bed, and an effect on every visual hit: the clouds parting, the pins, the 22 km bar, China's army,
the label, the counters, the jets, the Doklam road and its stop, the airbase, the map, the fortress, the badges, and a
whoosh into the loop.

    python3 tools/mix_baikonur.py        # writes public/baikonur/audio/mix.wav

Music: Mixkit "Vastness", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "baikonur" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "baikonur" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_vastness_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 200.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (0.0, "wh_big_tonal", -19, {}), (0.05, "pop_light", -19, {}), (C["antriksh"] - 0.2, "riser_trailer", -20, {"dur": 1.6}),
    (C["kiraya1"] - 0.04, "heavy_knock", -14, {}), (C["n115a"] - 0.1, "counter_ticking", -21, {"dur": 0.9}), (C["dollar1"], "cash_register", -19, {}),
    (C["kz1"] - 0.25, "whoosh_cinematic_fast", -16, {}), (C["registan"], "wind_howl", -25, {"dur": 1.4}), (C["ghera1"] - 0.2, "whoosh_transition_fast", -17, {}),
    (C["ghera1"] + 0.1, "radar_ping", -19, {}), (C["bk1"] - 0.1, "impact_whoosh_deep", -16, {}), (C["spaceport1"], "pop_hard", -17, {}),
    (C["n1955"] - 0.05, "drum_hit_big", -15, {}), (C["soviet1"] - 0.2, "whoosh_cinematic_fast", -16, {}), (C["ussr"] - 0.05, "stinger", -17, {}),
    (C["n1957"] - 0.05, "magic", -18, {}), (C["sputnik"], "radar_ping", -19, {}), (C["n1961"] - 0.05, "pop_hard", -17, {}),
    (C["gagarin"] - 0.05, "swell_tonal", -21, {}), (C["n1984"] - 0.05, "pop_hard", -17, {}), (C["rakesh2"] - 0.05, "shimmer_power", -19, {}),
    (C["n1991"] - 0.08, "boom_low", -14, {}), (C["toot"] - 0.05, "crack", -15, {}), (C["raaton"], "whoosh_transition_fast", -17, {}),
    (C["kiraye"] - 0.1, "page_turn", -17, {}), (C["n115b"] - 0.1, "counter_ticking", -21, {"dur": 0.9}), (C["n115b"] + 0.6, "coins", -19, {}),
    (C["n2050"] - 0.05, "stinger", -17, {}), (C["ghere2"] - 0.2, "whoosh_transition_fast", -17, {}), (C["kanoon"] - 0.05, "heavy_knock", -16, {}),
    (C["rouble"] - 0.05, "coins", -18, {}), (C["kyun1"] - 0.1, "sweep_fast_small", -18, {}), (C["south"] - 0.05, "pop_light", -18, {}),
    (C["south"] + 0.25, "pop_light", -19, {}), (C["south"] + 0.5, "pop_light", -19, {}), (C["equator"] - 0.05, "drum_hit_big", -16, {}),
    (C["dharti"] - 0.25, "whoosh_cinematic_fast", -16, {}), (C["dharti"] + 0.3, "swell_tonal", -20, {}), (C["dhakka"] - 0.2, "riser_trailer", -18, {"dur": 2.2}),
    (C["fuel"] - 0.1, "pop_hard", -17, {}), (C["pooche"] + 0.3, "wh_big_subtle_tonal", -18, {}), (C["kehna"] - 0.3, "subdrop", -19, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["kiraya1"], C["n1991"], C["equator"]))
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
