"""Mix the Canada vs USA time zones video as a seamless loop: the creator's voice on top, Mixkit "Discover" as a light,
curious bed, and an effect on every visual hit: whooshes on the whips and dives, pops on pins and tags, a clock under
the 1 November insert, flaps on the departure board, metal clanks on the padlocks, ticking as the clocks turn back.

    python3 tools/mix_tzcanada.py        # writes public/tzcanada/audio/mix.wav

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
AUD = ROOT / "public" / "tzcanada" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "tzcanada" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_discover_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 60.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35}

CUES = [
    # line 1: the dive to Vancouver, the pins, the rail draws, 3 hours down, 5 back; "kyu?"
    (C["vancouver1"] + 0.1, "whoosh_transition_fast", -14, {}), (C["vancouver1"] + 0.55, "pop_hard", -16, {}), (C["seattle1"] + 0.45, "pop_hard", -16, {}),
    (C["seattle1"] + 0.6, "wh_air_smooth", -20, {}), (C["three1"] - 0.05, "pop_high", -15, {}), (C["five1"] - 0.05, "bass_hit_short", -15, {}),
    (C["kyu2"] - 0.1, "wh_fast", -15, {}), (C["kyu2"], "pop_hard", -15, {}),
    # line 2: the continent goes pale, the zones develop, the tags, the meridian sweep, the tags flip to clocks
    (C["map2"] - 2.3, "whoosh_sparkle", -18, {}), *[(C["map2"] - 1.95 + i * 0.13, "pop_light", -24, {}) for i in range(7)],
    *[(C["map2"] - 0.1 + i * 0.09, "ui_pop", -22, {}) for i in range(7)], (C["east2"], "light_sweep_magic", -18, {}),
    *[(C["ghadi2"] + i * 0.06, "ui_snap", -24, {}) for i in range(7)],
    # line 3: the clock drops in, the hands run to 2:00 (ticking), everyone falls back, the clock falls away, the recolour
    (C["nov3"] - 0.15, "swoosh_fast", -14, {}), (C["nov3"], "bass_hit_short", -16, {}), (C["nov3"], "clock", -19, {"dur": 2.4, "align": "start"}),
    (C["raat3"] + 0.3, "bell", -20, {"dur": 1.6}), (C["ulta3"] - 0.1, "wh_magic_air", -17, {}), (C["ulta3"] + 0.35, "whoosh_transition_fast", -14, {}),
    (C["ulta3"] + 0.4, "drum_hit_big", -15, {}), *[(C["ulta3"] + 0.5 + i * 0.07, "pop_light", -23, {}) for i in range(9)],
    # line 4: Calgary (ring), the whip to Destin, the line, the distance, the meridians, the degrees, the same time
    (C["calgary4"] - 0.5, "whoosh_transition_fast", -14, {}), (C["calgary4"], "radar_ping", -18, {}), (C["calgary4"] + 0.05, "pop_hard", -17, {}),
    (C["destin4"] - 0.5, "wh_fast", -14, {}), (C["destin4"] + 0.05, "radar_ping", -18, {}), (C["destin4"] + 0.1, "pop_hard", -17, {}),
    (C["doori4"] + 0.2, "wh_air_smooth", -18, {}), (C["doori4"] + 0.95, "riser", -21, {"dur": 0.9}), (C["km4"] - 0.05, "pop_high", -15, {}),
    (C["deg4"] - 0.7, "wh_fast", -19, {}), (C["deg4"], "pop_high", -15, {}), (C["same4"] + 0.6, "ui_pop", -16, {}), (C["same4"] + 0.75, "ui_pop", -16, {}),
    (C["same4"] + 1.1, "chime_hit", -16, {}),
    # line 5: the ring round Vancouver, the dive, the pins, the meridians, 0.79 degrees, the two clocks, 1 hour
    (C["ulta5"], "whoosh_transition_fast", -14, {}), (C["ulta5"] + 0.6, "wh_magic_air", -19, {}), (C["vancouver5"] - 0.3, "wh_big_tonal", -16, {}),
    (C["vancouver5"] + 0.05, "pop_hard", -16, {}), (C["seattle5"], "pop_hard", -16, {}), (C["lon5"] - 0.2, "wh_fast", -19, {}),
    (C["lon5"] + 0.1, "ui_snap", -18, {}), (C["kam5"], "pop_high", -15, {}), (C["clocks5"] - 0.2, "swoosh_fast", -16, {}),
    (C["clocks5"] + 0.5, "ui_pop", -16, {}), (C["clocks5"] + 0.9, "ui_pop", -16, {}), (C["ghante5"] - 0.05, "bass_hit_short", -16, {}),
    # line 6: the rail line, the train runs it (4H), the station whips in, the train passes, the board flaps, 3H, 5H
    (C["train6"] - 0.2, "swoosh_fast", -16, {}), (C["train6"] + 0.4, "train", -22, {"dur": 3.2, "align": "start"}), (C["four6"] - 0.05, "pop_hard", -15, {}),
    (C["ghadi6"] - 0.15, "whoosh_transition_fast", -14, {}), (C["ghadi6"], "train", -18, {"dur": 1.6, "align": "start"}), (C["ghadi6"] + 0.25, "pop_hard", -17, {}),
    *[(C["go6"] - 0.2 + i * 0.05, "typewriter_click", -21, {}) for i in range(16)], (C["go6"] + 0.75, "pop_high", -15, {}),
    *[(C["back6"] - 0.2 + i * 0.05, "typewriter_click", -21, {}) for i in range(16)], (C["back6"] + 0.75, "bass_hit_short", -15, {}),
    # line 7: back out; ring pulses everywhere; question marks
    (C["aise7"] + 0.05, "whoosh_transition_fast", -14, {}), *[(C["aise7"] + 0.5 + i * 0.17, "radar_ping", -26, {}) for i in range(15)],
    *[(C["kaise7"] - 1.6 + i * 0.16, "pop_light", -20, {}) for i in range(6)],
    # line 8: the provinces light up one by one, their clocks, the padlocks; Saskatchewan and Yukon join
    (C["bc8"] - 0.05, "whoosh_transition_fast", -15, {}), (C["bc8"], "pop_hard", -17, {}), (C["alberta8"], "pop_hard", -17, {}),
    (C["manitoba8"], "pop_hard", -17, {}), (C["nwt8"], "pop_hard", -17, {}), *[(C["chhod8"] + i * 0.1, "ui_pop", -20, {}) for i in range(4)],
    *[(C["chhod8"] + 0.9 + i * 0.12, "gate_metal", -18, {}) for i in range(4)], (C["chhod8"] + 0.9, "metal_thud", -16, {}),
    (C["sask8"], "pop_hard", -17, {}), (C["sask8"] + 0.55, "gate_metal", -17, {}), (C["yukon8"], "pop_hard", -17, {}), (C["yukon8"] + 0.55, "gate_metal", -17, {}),
    # line 9: out to the continent, everyone else's clocks pop and turn back an hour, the provinces pulse, the map slips
    (C["baaki9"], "whoosh_transition_fast", -15, {}), *[(C["baaki9"] + i * 0.07, "pop_light", -24, {}) for i in range(14)],
    (C["peeche9"] - 0.2, "clock_running_late", -19, {"dur": 1.2, "align": "start"}), (C["peeche9"] - 0.2, "wh_magic_air", -19, {}),
    (C["ruke9"], "metal_thud", -17, {}), (C["khisak9"] + 0.25, "subdrop", -15, {}), (C["khisak9"] + 0.3, "drum_hit_big", -16, {}),
    # line 10: March, the clocks go forward, the map straightens; 'par tab tak', back to frame 0
    (C["march10"] - 0.1, "pop_high", -15, {}), (C["seedha10"], "light_sweep_magic", -17, {}), (C["tabtak10"] + 0.05, "wh_magic_air", -18, {}),
    (C["tabtak10"], "stinger", -21, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["ulta3"], C["same4"], C["khisak9"]))
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
