"""Mix the Greenland and Iceland video as a seamless loop: the creator's voice on top, Mixkit "Epical Drums 02" as the
bed (Vikings), and an effect on every visual hit (the ice spreading, the highlighter, the titles, the cards, the swap,
the paper map, IX, Norway, Flóki, the ravens, the voyage, the winter, the spyglass, Erik, the exile stamp, the voyage
west, the biggest island, the green, the helmets, the 25 ships, the clickbait stamp, the loop back to frame 0).

    python3 tools/mix_greenland.py        # writes public/greenland/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start.
Ducking works like a sidechain compressor (music about 21 dB under the voice while talking, about 11 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/greenland/edit/timing.json.
Music: Mixkit "Epical Drums 02", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "greenland" / "audio"
VO = ROOT / "public" / "greenland" / "vo" / "greenland_vo.mp3"
T = json.load(open(ROOT / "src" / "greenland" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_epical_drums_02_mixkit.mp3", 0.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "waves_soft": 120, "wind_howl": 120, "braam": 35}

CUES = [
    # line 1: the title card (the loop), the ice spreading with a cold wind, the 80% count, the name
    (0.0, "wind_howl", -26, {"dur": 4.0, "align": "start"}), (C["n80_1"] - 0.1, "whoosh_sparkle", -14, {}), (C["n80_1"] + 0.1, "counter_ticking", -19, {"dur": 0.9}),
    (C["n80_1"] + 1.1, "ui_glassy_snap", -15, {}), (C["naam1"], "ui_snap", -18, {}),
    *[(C["naam1"] + 0.02 + i * 0.017, "typewriter_click", -24, {}) for i in range(9)], (C["green1"] + 0.4, "pop_high", -14, {}),
    # line 2: the whip to Iceland, three cards, its name
    (C["hari2"] - 0.1, "whoosh_cinematic_fast", -12, {}), (C["hari2"] + 0.05, "ui_pop", -15, {}), (C["garam2"] + 0.1, "ui_pop", -15, {}), (C["jharno2"] + 0.2, "ui_pop", -15, {}),
    (C["naam2"] - 0.4, "wh_fast", -17, {}), *[(C["naam2"] + 0.02 + i * 0.017, "typewriter_click", -24, {}) for i in range(7)], (C["ice2"] + 0.45, "pop_high", -14, {}),
    # line 3: the swap, "?", the helmet, the 1000-year-old trick
    (C["ulta3"], "wh_big_tonal", -14, {}), (C["ulta3"] + 0.35, "toon_whoosh", -16, {}), (C["ulta3"] + 0.8, "toon_boing", -15, {}),
    (C["vikings3"], "metal_thud", -13, {}), (C["hazar3"], "pen_cross", -16, {}),
    # line 4: the paper map slides over, IX, Norway, Flóki, NO MAP, the ravens, the voyage, the new land
    (C["sadi4"] - 0.25, "page_turn", -12, {}), (C["sadi4"] + 0.1, "heavy_knock", -13, {}), (C["norway4"], "whoosh_sparkle", -17, {}),
    (C["floki4"] - 0.1, "swoosh_windy", -15, {}), (C["floki4"] + 0.4, "pen_cross", -17, {}), (C["map4"] + 0.08, "heavy_knock", -14, {}),
    (C["teen4"] - 0.05, "wh_wind_gust", -16, {}), (C["samundar4"] - 0.1, "waves_soft", -20, {"dur": 7.0, "align": "start"}),
    (C["kauva4"] - 0.1, "wh_wind_gust", -17, {}), (C["zameen4"], "impact_chord", -14, {}), (C["zameen4"] + 0.1, "pen_cross", -17, {}),
    # line 5: the first winter (wind), spring, the spyglass, the fjord full of ice, the name
    (C["sardi5"] - 0.2, "wind_howl", -18, {"dur": 3.2}), (C["sardi5"], "thud", -15, {}), (C["vasant5"], "swoosh_windy", -16, {}),
    (C["neeche5"] - 0.05, "wh_fast", -13, {}), (C["neeche5"] + 0.05, "metal_thud", -16, {}), (C["khadi5"], "wind_howl", -24, {"dur": 2.5}),
    (C["bas5"], "ui_snap", -18, {}), *[(C["bas5"] + 0.15 + i * 0.017, "typewriter_click", -24, {}) for i in range(7)], (C["ice5"] + 0.15, "pop_high", -14, {}),
    # line 6: back to the satellite, 100 years, Erik, the exile stamp
    (C["ab6"] - 0.1, "whoosh_cinematic_fast", -12, {}), (C["green6"], "ui_snap", -18, {}), (C["sau6"] + 0.05, "pen_cross", -17, {}),
    (C["erik6"] - 0.15, "swoosh_windy", -15, {}), (C["erik6"] + 0.3, "pen_cross", -17, {}), (C["nikal6"], "heavy_knock", -11, {}), (C["nikal6"] + 0.02, "drum_hit_big", -16, {}),
    # line 7: west to Greenland, the biggest island, the ice again, "!"
    (C["paschim7"], "waves_soft", -21, {"dur": 2.4, "align": "start"}), (C["paschim7"], "wh_fast", -17, {}), (C["bada7"], "impact_chord", -14, {}),
    (C["poora7"], "whoosh_sparkle", -15, {}), (C["barf7"] + 0.3, "toon_boing", -15, {}),
    # line 8: Null; the name, the green, Erik's grin, the helmets
    (C["green8"] - 0.1, "ui_snap", -18, {}), *[(C["green8"] - 0.05 + i * 0.017, "typewriter_click", -24, {}) for i in range(9)], (C["green8"] + 0.5, "pop_high", -14, {}),
    (C["hari8"], "light_transition_magic", -15, {}), (C["achha8"], "swoosh_windy", -16, {}), *[(C["log8"] + i * 0.083, "pop_light", -21, {}) for i in range(7)],
    # line 9: 25 ships
    (C["chaal9"] + 0.3, "whoosh_cinematic_fast", -14, {}), (C["n25_9"] - 0.2, "counter_ticking", -18, {"dur": 1.7}), (C["n25_9"] - 0.2, "waves_soft", -21, {"dur": 3.0, "align": "start"}),
    (C["n25_9"] + 1.45, "ui_glassy_snap", -14, {}),
    # line 10: the clickbait stamp, the name stays, back to frame 0
    (C["matlab10"] + 0.3, "wh_fast", -16, {}), (C["click10"], "heavy_knock", -10, {}), (C["click10"] + 0.02, "braam", -15, {}), (C["click10"] + 0.03, "drum_hit_big", -15, {}),
    (C["duniya10"] + 0.15, "pop_high", -16, {}), (C["isiliye10"] - 0.35, "whoosh_sparkle", -14, {}),
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
    m = ff(AUD / MUSIC, "anull")[int(MUSIC_OFF * SR):]
    x = int(LOOP_XF * SR)
    assert len(m) >= n + x
    music = m[:n].copy()
    u = np.linspace(0, 1, x, dtype=np.float32)[:, None]
    music[:x] = music[:x] * np.sin(u * np.pi / 2) + m[n: n + x] * np.cos(u * np.pi / 2)
    music *= db(v_ref - 10 * np.log10(np.mean(music ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["nikal6"], C["click10"]))
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
