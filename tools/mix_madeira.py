"""Mix the Madeira video as a seamless loop: the creator's voice on top, Mixkit "Discover" as the bed, and an effect on
every visual hit (the dive, the neon strobe, the caravel, the forest, the title, the fuse and the fire, the settlers in
the sea, 7 years, the cane, the sugar trade, Brazil, the collapse, the levadas, 2,000 km, the wine, the paradise, Funchal,
Ronaldo, the airport, the loop back to frame 0).

    python3 tools/mix_madeira.py        # writes public/madeira/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start.
Ducking works like a sidechain compressor (music about 21 dB under the voice while talking, about 11 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/madeira/edit/timing.json.
Music: Mixkit "Discover", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "madeira" / "audio"
VO = ROOT / "public" / "madeira" / "vo" / "madeira_vo.mp3"
T = json.load(open(ROOT / "src" / "madeira" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_discover_mixkit.mp3", 0.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "waves_soft": 120, "wind_howl": 120, "braam": 35, "boom": 35, "thunder_impact": 40, "splash": 80}

CUES = [
    # line 1: frame 0 (the portrait, a low swell), the dive onto the archipelago, the neon strobe, 7 years
    (0.0, "waves_soft", -27, {"dur": 3.0, "align": "start"}), (C["island1"] + 0.1, "whoosh_cinematic_fast", -12, {}), (C["island1"] + 0.6, "impact_whoosh_deep", -15, {}),
    *[(C["island1"] + 0.6 + i * 0.133, "ui_snap", -20, {}) for i in range(3)], (C["saal1"] - 0.5, "counter_ticking", -19, {"dur": 0.5}), (C["saal1"], "ui_glassy_snap", -15, {}),
    # line 2: out to Portugal, the caravel sails, the forest grows, MADEIRA lands letter by letter, "लकड़ी"
    (C["kyun2"], "wh_big_tonal", -14, {}), (C["portugal2"], "whoosh_sparkle", -16, {}), (C["sailors2"], "waves_soft", -21, {"dur": 4.0, "align": "start"}),
    (C["kali2"] - 0.4, "swoosh_windy", -16, {}), *[(C["kali2"] + i * 0.12, "pop_light", -23, {}) for i in range(8)],
    *[(C["madeira2"] - 0.3 + i * 0.05, "typewriter_click", -21, {}) for i in range(7)], (C["madeira2"] + 0.1, "impact_chord", -14, {}), (C["lakdi2"], "metal_thud", -15, {}),
    # line 3–4: the fuse, the fire catching, the settlers in the sea, the legend
    (C["aag3"] - 1.0, "riser", -18, {"dur": 1.2, "align": "start"}), (C["aag3"], "thunder_impact", -13, {}), (C["aag3"] + 0.1, "boom", -16, {}),
    (C["aag3"] + 0.3, "wind_howl", -22, {"dur": 6.0}), (C["samundar4"], "splash", -17, {}), (C["samundar4"] + 0.4, "waves_soft", -20, {"dur": 4.0, "align": "start"}),
    (C["do4"], "ui_pop", -17, {}), (C["saat4"] - 0.5, "counter_ticking", -18, {"dur": 0.5}), (C["saat4"] + 0.05, "braam", -14, {}), (C["saat4"] + 0.05, "drum_hit_big", -16, {}),
    # line 5–6: the ash clears, the cane, the trade to Europe, white gold, number 1, Brazil, the collapse
    (C["raakh5"], "light_transition_magic", -15, {}), *[(C["mitti5"] + i * 0.08, "pop_light", -22, {}) for i in range(8)],
    (C["europe5"], "whoosh_cinematic_fast", -12, {}), *[(C["europe5"] + 0.9 + i * 0.12, "pop_high", -19, {}) for i in range(7)], (C["safed5"], "chime_hit", -14, {}),
    (C["duniya6"] + 0.1, "impact_chord", -14, {}), (C["ganna6"] - 0.2, "whoosh_cinematic_fast", -12, {}), (C["brazil6"] + 0.4, "pop_high", -15, {}),
    (C["dhandha6"] + 0.3, "wh_fast", -15, {}), (C["doob6"], "heavy_knock", -12, {}), (C["doob6"] + 0.05, "drum_hit_big", -17, {}),
    # line 7: the levadas: water, cards flipping in, 2,000 km
    (C["haar7"] + 0.3, "swoosh_windy", -16, {}), (C["pahad7"], "page_turn", -15, {}), (C["levadas7"], "page_turn", -15, {}), (C["nahre7"], "waves_soft", -22, {"dur": 3.0, "align": "start"}),
    (C["n2000_7"] - 0.2, "counter_ticking", -18, {"dur": 0.8}), (C["n2000_7"] + 0.65, "ui_glassy_snap", -14, {}), (C["mumbai7"], "ui_snap", -17, {}),
    # line 8–9: the vineyards, the bottle zooms through, the outline in light, the paradise card
    (C["angoor8"] - 0.1, "page_turn", -16, {}), (C["wine8"], "pop_high", -15, {}), (C["jala9"] - 0.35, "whoosh_cinematic_fast", -12, {}), (C["jala9"] + 0.1, "light_transition_magic", -15, {}),
    (C["paradise9"] - 0.2, "page_turn", -16, {}), (C["laakhon9"], "ui_pop", -17, {}),
    # line 10: Funchal, the boy, Ronaldo, the airport
    (C["funchal10"] - 0.1, "ui_snap", -16, {}), (C["funchal10"] + 0.1, "pop_high", -16, {}), (C["ladka10"], "toon_boing", -17, {}), (C["ronaldo10"], "impact_chord", -13, {}),
    (C["ronaldo10"] + 0.1, "whoosh_sparkle", -15, {}), (C["airport10"], "pop_high", -15, {}), (C["airport10"] + 0.5, "impact_whoosh_deep", -15, {}),
    # line 11: "लकड़ी", the portrait returns, the pull back to frame 0
    (C["lakdi11"], "metal_thud", -15, {}), (C["chehra11"] - 0.3, "whoosh_sparkle", -14, {}), (DURATION - 0.6, "whoosh_cinematic_fast", -12, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["aag3"], C["saat4"], C["doob6"]))
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
