"""Mix the Dingo Fence video as a seamless loop: the creator's voice on top, Mixkit "Discover" as a curious bed, and an
effect on every visual hit: the whip of the flip, swooshes on the magnifier, pops on labels and cut-outs, ticking under
the counters, the paper slide of the comparison panel, the whip into the parchment, waves under the ships, a clang for
the fence, and a stinger for the question.

    python3 tools/mix_dingofence.py        # writes public/dingofence/audio/mix.wav

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
AUD = ROOT / "public" / "dingofence" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "dingofence" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_discover_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 60.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35}

CUES = [
    # line 1: the flip, the fence flashes on with its counter, CUT IN TWO
    (C["never"] + 0.2, "whip", -15, {}), (C["never"] + 0.5, "wh_big_tonal", -18, {}), (C["n5614"] - 0.1, "whoosh_sparkle", -18, {}),
    (C["n5614"], "counter_ticking", -21, {"dur": 2.4}), (C["cut"], "bass_hit_short", -15, {}), (C["cut"] + 0.05, "pop_hard", -16, {}),
    # line 2: the magnifier slides in, the kangaroo gag, the search, found, the dive through the lens
    (C["look"] - 0.15, "swoosh_fast", -15, {}), (C["no"] - 0.05, "boing", -17, {}), (C["notthere"], "wh_fast", -18, {}),
    (C["there"], "pop_high", -15, {}), (C["is"] - 0.05, "wh_magic_air", -15, {}), (C["is"] + 0.5, "whoosh_transition_fast", -15, {}),
    (C["is"] + 0.7, "pop_light", -18, {}),
    # line 3: the pull-back, the fence draws (counter), the three states lift, the comparison panel slides in and out
    (C["runs"], "wh_air_smooth", -17, {}), (C["runs"] + 0.3, "counter_ticking", -21, {"dur": 1.9}), (C["sa"] - 0.05, "pop_hard", -16, {}),
    (C["nsw"] - 0.05, "pop_hard", -16, {}), (C["qld"] - 0.05, "pop_hard", -16, {}), (C["longer"] - 0.25, "paper_slide", -15, {}),
    (C["london"], "pop_light", -18, {}), (C["ny"], "pop_light", -18, {}), (C["ny"] + 0.2, "chime_hit", -17, {}), (C["built"] - 0.3, "paper_slide", -17, {}),
    # line 4: the silhouette pops, the wash into the board, the colour dingo, Dingo writes on
    (C["oneanimal"], "pop_hard", -16, {}), (C["dingo"] - 0.05, "wh_magic_air", -15, {}), (C["dingo"] + 0.1, "light_sweep_magic", -18, {}),
    (C["dingo"] + 0.3, "pop_high", -17, {}),
    # line 5-6: the line-up pops, the weight tag; the treadmill, the speed counter, the leap, the kangaroo
    (C["wild"], "ui_pop", -17, {}), (C["size"] - 0.1, "pop_light", -17, {}), (C["medium"] - 0.05, "pop_light", -17, {}), (C["medium"] + 0.3, "pop_high", -17, {}),
    (C["sprint"] - 0.2, "swoosh_fast", -16, {}), (C["sprint"], "steps", -20, {"dur": 3.6, "align": "start"}), (C["sprint"] + 0.3, "counter_ticking", -21, {"dur": 1.9}),
    (C["hunted"] - 0.4, "wh_fast", -15, {}), (C["kangaroos"] - 0.05, "boing", -16, {}), (C["small"], "toon_pops", -18, {}),
    # line 7-9: the whip into the parchment, 1788, waves under the ships, the settlers and the sheep, the dingo pack, traps, guns, posts
    (C["then"] - 0.05, "whip", -14, {}), (C["then"] + 0.1, "paper_slide", -18, {}), (C["y1788"] - 0.05, "page_turn", -16, {}),
    (C["europeans"] - 0.9, "waves_soft", -20, {"dur": 3.0, "align": "start"}), (C["brought"], "pop_light", -18, {}), (C["brought"] + 0.15, "pop_light", -18, {}),
    *[(C["sheep1"] - 0.1 + i * 0.07, "pop_light", -24, {}) for i in range(10)], (C["fora"] - 0.1, "steps", -18, {"dur": 2.0, "align": "start"}),
    (C["fora"], "wh_fast", -17, {}), (C["traps"] - 0.1, "metal_thud", -17, {}), (C["guns"] - 0.2, "gate_metal", -20, {}),
    (C["losing"] - 0.1, "thud", -17, {}), *[(C["building"] - 0.2 + i * 0.07, "pop_dry" if False else "pop_light", -22, {}) for i in range(9)],
    (C["fences"], "metal_thud", -16, {}),
    # line 10-12: back to the satellite, the red pieces pop and join, the blue sweep, the two sides fill, the question, the flip home
    (C["by"] - 0.1, "wh_air_smooth", -16, {}), *[(C["y1940"] + 0.05 + i * 0.18, "ui_pop", -21, {}) for i in range(7)],
    (C["joined"], "riser", -20, {"dur": 1.2}), (C["giant"], "drum_hit_big", -15, {}), (C["giant"] + 0.05, "light_sweep_magic", -18, {}),
    *[(C["sheepside"] + 0.1 + i * 0.06, "pop_light", -26, {}) for i in range(12)], *[(C["most"] + 0.1 + i * 0.06, "pop_light", -26, {}) for i in range(12)],
    (C["whos"], "pop_hard", -16, {}), (C["sheepq"] + 0.3, "stinger", -20, {}), (DURATION - 0.75, "whip", -17, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["cut"], C["giant"], C["kangaroos"]))
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
