"""Mix the Canada lake names video as a seamless loop: the creator's voice on top, Mixkit "Kidding Around" as a light,
playful bed (the reference's tone), and an effect on every visual hit: whooshes on the whips and dives, pops on pins,
labels and the count, clicks under the typed names, a boing for the silly names.

    python3 tools/mix_canadalakes.py        # writes public/canadalakes/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Kidding Around", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "canadalakes" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "canadalakes" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_kidding_around_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 60.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35}

CUES = [
    # line 1: the whip out, Canada flashes white then red, the dots and the count, "Another Lake?" slams
    (C["bees1"] + 0.45, "whoosh_transition_fast", -14, {}), (C["bees1"] + 0.95, "pop_hard", -16, {}),
    (C["bees1"] + 1.5, "counter_ticking", -19, {"dur": 2.8}), *[(C["bees1"] + 1.45 + i * 0.09, "pop_light", -24, {}) for i in range(10)],
    (C["another1"] - 0.05, "bass_hit_short", -14, {}), (C["another1"], "boing", -17, {}),
    # line 2: the map room (the two pop in), the count again, the dive and the "???" storm
    (C["canada2"] - 0.05, "swoosh_fast", -15, {}), (C["canada2"] + 0.1, "pop_hard", -16, {}), (C["canada2"] + 0.3, "pop_hard", -17, {}),
    (C["bees2"] - 1.5, "whoosh_transition_fast", -15, {}), (C["bees2"] - 1.2, "pop_high", -17, {}),
    (C["har2"] - 0.05, "wh_fast", -15, {}), (C["har2"] + 0.1, "cartoon_pops", -16, {}),
    # line 3: the storm collapses, the whip out, FIRST NATIONS, the dive to Athabasca, the pin, the typed meaning
    (C["shuru3"], "wh_magic_air", -17, {}), (C["first3"] - 0.1, "pop_high", -16, {}),
    (C["athabasca3"] - 0.05, "whoosh_transition_fast", -14, {}), (C["athabasca3"] + 0.3, "pop_hard", -15, {}),
    *[(C["matlab3"] + 0.3 + i * 0.12, "typewriter_click", -22, {}) for i in range(10)],
    # line 4: the card whips in, the crown, LAKE LOUISE, the card whips out
    (C["kuch4"] + 0.2, "swoosh_fast", -13, {}), (C["princess4"] - 0.2, "whoosh_sparkle", -18, {}), (C["louise4"] - 0.1, "pop_hard", -15, {}), (C["end4"] + 0.1, "swoosh_fast", -16, {}),
    # line 5: the thought bubble, then the three panels
    (C["phir5"] - 0.05, "pop_light", -16, {}), (C["phir5"] + 0.2, "dizzy", -20, {"dur": 1.6}),
    (C["long5"] - 0.15, "swoosh_fast", -15, {}), (C["clear5"] - 0.12, "swoosh_fast", -15, {}), (C["mirror5"] - 0.12, "swoosh_fast", -15, {}),
    # line 6: the dive into the forest, the crowd pops in, OFFICIAL stamps
    (C["jheelen6"], "wh_air_smooth", -16, {}), *[(C["shikari6"] - 0.1 + i * 0.034, "pop_light", -26, {}) for i in range(12)],
    (C["wahi6"], "drum_hit_big", -15, {}),
    # line 7: the whip to BC, the dive, the pins, the dashed line, the second pin
    (C["bc7"] - 0.05, "whoosh_transition_fast", -14, {}), (C["bc7"] + 0.2, "pop_hard", -18, {}), (C["another7"] - 0.6, "wh_big_tonal", -17, {}),
    (C["another7"], "pop_hard", -15, {}), (C["kuch7"], "wh_fast", -19, {}), (C["kuch7"] + 0.45, "pop_high", -18, {}), (C["andanother7"], "pop_hard", -15, {}),
    # line 8: Manitoba, Stupid Lake (boing), Nova Scotia, 1953 stamps, Big Ass Lake
    (C["manitoba8"] - 0.05, "whoosh_transition_fast", -14, {}), (C["stupid8"] - 0.3, "wh_fast", -16, {}), (C["stupid8"] - 0.15, "pop_hard", -15, {}),
    (C["stupid8"] + 0.15, "boing", -17, {}), (C["nova8"], "whoosh_transition_fast", -14, {}), (C["nova8"] + 0.2, "pop_hard", -18, {}),
    (C["y1953"] - 0.1, "drum_hit_big", -14, {}), (C["bigass8"] - 0.3, "wh_fast", -15, {}), (C["bigass8"] - 0.1, "bass_hit_short", -14, {}), (C["bigass8"], "pop_hard", -15, {}),
    # line 9: out to all the pins, the dive, the long name typed
    (C["par9"], "whoosh_transition_fast", -14, {}), *[(C["par9"] + 0.55 + i * 0.12, "pop_light", -20, {}) for i in range(7)],
    (C["name9"] - 0.4, "wh_big_tonal", -16, {}), (C["name9"] + 0.1, "pop_hard", -15, {}),
    *[(C["name9"] + 0.2 + i * (C["end9"] - C["name9"] - 0.6) / 31, "typewriter_click", -22, {}) for i in range(31)],
    # line 10: the computer and the cat on the keys, CREE, the meaning typed, the trout splashes down on its line
    (C["billi10"] - 0.5, "swoosh_fast", -15, {}), *[(C["billi10"] - 0.2 + i * 0.11, "typewriter_click", -18, {}) for i in range(16)],
    (C["cree10"] - 0.1, "swoosh_fast", -15, {}), (C["cree10"] + 0.15, "pop_high", -16, {}),
    *[(C["matlab10"] + 0.3 + i * 0.09, "typewriter_click", -23, {}) for i in range(16)],
    (C["trout10"] - 0.3, "wh_air_smooth", -17, {}), (C["trout10"] + 0.1, "splash", -18, {}),
    # line 11: back to frame 0
    (C["socho11"] + 0.3, "wh_magic_air", -18, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["another1"], C["y1953"], C["bigass8"]))
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
