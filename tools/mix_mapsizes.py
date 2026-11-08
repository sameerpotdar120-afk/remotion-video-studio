"""Mix the map-sizes (Mercator) video as a seamless loop: the creator's voice on top, Mixkit "Vastness" as the bed, and
an effect on every visual hit: ticking under the km counters, the split-screen panel sliding, pops on tags, the lift and
drop of India and Greenland, the ink wash into the 1569 chart, waves under the ship, the whip into "everywhere", the
cuts in the globe, the gores peeling and stretching, the Tissot circles popping, and the true-size trip.

    python3 tools/mix_mapsizes.py        # writes public/mapsizes/audio/mix.wav

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
AUD = ROOT / "public" / "mapsizes" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "mapsizes" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_vastness_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 180.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35}

CUES = [
    # line 1-2: the hook, Greenland measured north-south (counter), the push in
    (C["dedh"], "pop_high", -17, {}), (C["chhota0"], "boing", -19, {}), (C["gl1"], "wh_air_smooth", -17, {}),
    (C["n2670"] - 0.75, "counter_ticking", -21, {"dur": 1.8}), (C["n2670"] + 1.0, "pop_hard", -17, {}),
    # line 3-4: the India panel slides up, its lines and counters; east-west on both
    (C["in1"] - 0.2, "paper_slide", -15, {}), (C["n3214"] - 0.6, "counter_ticking", -21, {"dur": 1.8}), (C["n3214"] + 1.2, "pop_hard", -17, {}),
    (C["n1050"] - 0.95, "counter_ticking", -21, {"dur": 1.5}), (C["n1050"] + 0.6, "pop_hard", -17, {}),
    (C["n2933"] - 0.75, "counter_ticking", -21, {"dur": 1.4}), (C["n2933"] + 0.7, "pop_hard", -17, {}), (C["dono"], "chime_hit", -18, {}),
    (C["area"] - 0.3, "paper_slide", -17, {}), (C["n22"] - 0.1, "ui_pop", -17, {}), (C["n33"] - 0.1, "ui_pop", -17, {}),
    # line 5-6: India lifted onto Greenland, back; Africa, 14x, Greenland slid onto Africa
    (C["uthakar"], "wh_magic_air", -16, {}), (C["glpar"] + 0.5, "thud", -17, {}), (C["chhota3"] - 0.1, "boing", -18, {}),
    (C["africa"] - 0.2, "wh_fast", -17, {}), (C["africa"] + 0.1, "light_sweep_magic", -19, {}), (C["n14"] - 0.05, "drum_hit_big", -16, {}),
    (C["barabar"] - 2.25, "wh_air_smooth", -17, {}), (C["barabar"] - 0.75, "thud", -18, {}), (C["barabar"] - 0.1, "pop_high", -17, {}),
    # line 7-8: Null, 1569, the wash into the chart, Mercator, the ship, ports, the rhumb line, the compass
    (C["gadbad"] - 0.2, "swoosh_fast", -17, {}), (C["y1569"] - 0.1, "pop_hard", -16, {}), (C["mercator"] - 0.75, "wh_magic_air", -16, {}),
    (C["mercator"] - 0.4, "page_turn", -17, {}), (C["mercator"] - 0.1, "typewriter_click", -21, {"dur": 0.9, "align": "start"}),
    (C["naavik"] - 0.1, "waves_soft", -21, {"dur": 8.0, "align": "start"}), (C["ports"] - 0.1, "pop_light", -18, {}), (C["ports"] + 0.05, "pop_light", -18, {}),
    (C["seedhi"] - 0.25, "whoosh_sparkle", -18, {}), (C["compass"] - 0.15, "metal_thud", -18, {}), (C["compass"] + 0.15, "counter_ticking", -23, {"dur": 0.8}),
    (C["jahaz"] - 0.15, "wh_air_smooth", -18, {}),
    # line 9: the whip into "everywhere", the cards, the atlas, the phone
    (C["chha"] - 0.25, "whip", -14, {}), *[(C["chha"] + 0.2 + d, "pop_light", -22, {}) for d in (0.2, 0.35, 0.5, 0.65, 0.8, 0.95)],
    (C["school"] - 0.05, "swoosh_fast", -16, {}), (C["school"] + 0.2, "page_turn", -18, {}), (C["google"] - 0.15, "swoosh_fast", -16, {}), (C["google"] + 0.25, "ui_pop", -18, {}),
    # line 10-11: into space, the globe, the cuts, the gores peel and lay flat, the stretch
    (C["dikkat"] - 0.3, "wh_big_tonal", -17, {}), (C["chhe"] - 0.6, "riser", -21, {"dur": 1.4}), *[(C["chhe"] - 0.5 + i * 0.22, "pop_light", -21, {}) for i in range(6)],
    (C["bichhao"] - 0.45, "wh_magic_air", -16, {}), (C["bichhao"] + 0.6, "thud", -19, {}), (C["khali"] - 0.7, "riser", -19, {"dur": 2.2}),
    (C["kheencho"] + 0.2, "bass_hit_short", -16, {}),
    # line 12-13: back to the map, the Tissot circles pop outwards, x10, +15%, the true-size trip, the loop home
    (C["pole"] - 0.35, "whoosh_transition_fast", -17, {}), *[(C["pole"] - 0.25 + k * 0.45, "toon_pops", -22, {}) for k in range(4)],
    (C["n10"] - 0.1, "drum_hit_big", -16, {}), (C["n15"] - 0.1, "pop_high", -17, {}), (C["ablao"] + 0.25, "wh_air_smooth", -16, {}),
    (C["asli"] + 0.9, "thud", -18, {}), (C["asligl"] - 0.1, "chime_hit", -17, {}), (C["chhota4"] - 0.1, "pop_hard", -17, {}),
    (DURATION - 1.55, "wh_magic_air", -18, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["n14"], C["kheencho"], C["n10"]))
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
