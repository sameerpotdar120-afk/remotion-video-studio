"""Mix the Garbage Patch video as a seamless loop: the creator's voice on top, Mixkit "Vastness" as the bed (a calm
ambient pad, like the reference's), and an effect on every visual hit, the reference's way: whooshes on the big camera
moves and transitions, pops and ticks on every type-on, bubble and ring, impacts on the slams.

    python3 tools/mix_garbagepatch.py        # writes public/garbagepatch/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start.
Ducking works like a sidechain compressor (music about 21 dB under the voice while talking, about 11 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/garbagepatch/edit/timing.json.
Music: Mixkit "Vastness", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "garbagepatch" / "audio"
VO = ROOT / "public" / "garbagepatch" / "vo" / "gp_vo.mp3"
T = json.load(open(ROOT / "src" / "garbagepatch" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_vastness_mixkit.mp3", 0.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "waves_soft": 120, "wind_howl": 120, "braam": 35, "boom": 35, "thunder_impact": 40, "splash": 80}

CUES = [
    # line 1: the push-in, the plane, "Pacific Ocean", India's ghost, the throb, the pin, "?", the ✕
    (0.0, "waves_soft", -27, {"dur": 3.0, "align": "start"}), (C["pacific1"], "typewriter_click", -21, {}), (C["bharat1"], "whoosh_sparkle", -17, {}),
    (C["bharat1"] + 0.4, "ui_pop", -18, {}), (C["island1"], "impact_whoosh_deep", -16, {}), (C["nakshe1"] - 0.3, "pop_high", -16, {}), (C["nakshe1"], "toon_boing", -19, {}),
    *[(C["nakshe1"] - 0.2 + i * 0.05, "typewriter_click", -22, {}) for i in range(6)], (C["milega1"] + 0.05, "metal_thud", -14, {}),
    # line 2: "क्यों?", nobody lives there, 0 people, the reveal, "कचरा", the debris burst
    (C["kyun2"], "ui_glassy_snap", -15, {}), (C["koi2"] - 0.1, "wh_fast", -15, {}), (C["koi2"] + 0.55, "counter_ticking", -19, {"dur": 0.6}),
    (C["poora2"], "whoosh_cinematic_fast", -14, {}), (C["kachre2"], "impact_chord", -13, {}), (C["kachre2"] + 0.1, "light_transition_magic", -17, {}),
    *[(C["kachre2"] + 0.15 + i * 0.05, "pop_light", -20, {}) for i in range(3)],
    # line 3: the outline draws, the name types, California, Hawaii, the dashed line
    (C["kehte3"] - 0.1, "riser", -20, {"dur": 0.7, "align": "start"}), *[(C["great3"] + i * 0.06, "typewriter_click", -23, {}) for i in range(8)],
    (C["california3"], "whoosh_cinematic_fast", -14, {}), (C["california3"] + 0.2, "chime_hit", -16, {}), (C["hawaii3"], "pop_high", -16, {}), (C["beech3"] - 0.3, "swoosh_windy", -19, {}),
    # line 4: the shock, 16 lakh km², India lands, half
    (C["size4"], "impact_whoosh_deep", -15, {}), (C["lakh4"] - 0.2, "counter_ticking", -18, {"dur": 0.8}), (C["lakh4"] + 0.65, "ui_glassy_snap", -15, {}),
    (C["matlab4"] - 0.1, "wh_big_tonal", -15, {}), (C["matlab4"] + 0.15, "thud", -15, {}), (C["aadha4"] - 0.3, "whoosh_sparkle", -16, {}), (C["aadha4"] + 0.1, "ui_pop", -16, {}),
    # line 5: the whip out to the world, the card tilts, five rings, the biggest; the dive back
    (C["duniya5"] - 0.2, "whoosh_cinematic_fast", -12, {}), (C["duniya5"] + 0.1, "swoosh_windy", -17, {}),
    *[(C["paanch5"] - 0.15 + i * 0.25, "pop_high", -16, {}) for i in range(2)], *[(C["bhanwar5"] - 0.2 + i * 0.25, "pop_high", -16, {}) for i in range(3)],
    (C["sabse5"], "impact_chord", -14, {}), (C["yahan6"] - 0.4, "whoosh_cinematic_fast", -12, {}),
    # line 6: 80,000 tonnes slams, the callouts, the net
    (C["ton6"] - 0.5, "counter_ticking", -18, {"dur": 0.6}), (C["ton6"] + 0.3, "boom", -14, {}), (C["ton6"] + 0.3, "heavy_knock", -15, {}), (C["tair6"], "waves_soft", -22, {"dur": 2.0, "align": "start"}),
    (C["botal6"], "ui_pop", -15, {}), (C["dibbe6"], "ui_pop", -15, {}), (C["zyada6"], "wh_fast", -16, {}), (C["machhli6"], "pop_high", -14, {}),
    # line 7: rivers, ships, cities
    (C["aata7"] - 0.2, "whoosh_cinematic_fast", -14, {}), (C["nadiyon7"], "splash", -19, {}), (C["nadiyon7"] + 0.1, "light_transition_magic", -18, {}),
    (C["jahazon7"], "waves_soft", -19, {"dur": 2.0, "align": "start"}), (C["jahazon7"] + 0.1, "swoosh_windy", -18, {}), *[(C["shehron7"] - 0.4 + i * 0.1, "pop_light", -18, {}) for i in range(4)],
    # line 8: the sun, the waves, the shatter, the dissolve, "microplastic", the magnifier
    (C["dhoop8"] - 0.1, "whoosh_sparkle", -15, {}), (C["dhoop8"] + 0.1, "chime_hit", -18, {}), (C["lehrein8"], "splash", -16, {}), (C["lehrein8"] + 0.3, "waves_soft", -18, {"dur": 2.0, "align": "start"}),
    (C["tod8"], "ui_pop", -16, {}), (C["tod8"] + 0.5, "braam", -16, {}), (C["tod8"] + 0.5, "metal_thud", -13, {}), (C["tukde8"], "rain_light", -20, {"dur": 1.6, "align": "start"}),
    (C["micro8"] - 0.1, "typewriter_click", -20, {}), (C["micro8"] + 0.3, "wh_fast", -17, {}),
    # line 9: the pulse, the food chain badges
    (C["yahi9"], "impact_whoosh_deep", -17, {}), *[(C["machhli9"] - 0.6 + i * (C["thali9"] - C["machhli9"] + 0.6) / 3, "pop_high", -16, {}) for i in range(4)],
    # line 10: the satellite, the viewfinder, nothing found
    (C["satellite10"] - 0.3, "whoosh_cinematic_fast", -15, {}), (C["dekh10"] - 0.2, "ui_snap", -15, {}), (C["dekh10"] + 0.3, "metal_thud", -16, {}), (C["neela10"] - 0.2, "wh_big_tonal", -17, {}),
    # line 11: the zoom blur into the soup, the strike on "ज़मीन", the cut, the bowl
    (C["asal11"] - 0.15, "whoosh_cinematic_fast", -12, {}), (C["asal11"] + 0.15, "splash", -16, {}), (C["zameen11"] + 0.05, "pen_cross", -15, {}),
    (C["paani11"] - 0.25, "wh_fast", -17, {}), (C["soup11"] - 0.3, "toon_boing", -18, {}), (C["soup11"], "splash", -19, {}),
    # line 12: back out to the map, the currents, the bottle bounces, the swell
    (C["samundar12"] - 0.15, "whoosh_cinematic_fast", -13, {}), (C["bhanwar12"] - 0.2, "swoosh_windy", -16, {}), (C["kachra12"] + 0.3, "toon_boing", -19, {}),
    (C["badhta12"], "impact_whoosh_deep", -14, {}),
    # line 13: the smear into the cross-section, the bracket, sinking, the sea floor, the beach
    (C["jo13"] - 0.3, "wh_big_tonal", -14, {}), (C["jo13"], "splash", -17, {}), (C["thoda13"] - 0.3, "ui_snap", -17, {}), (C["baaki13"], "riser", -21, {"dur": 1.0, "align": "start"}),
    (C["tal13"], "thud", -15, {}), (C["kinaron13"] - 0.1, "waves_soft", -18, {"dur": 2.0, "align": "start"}),
    # line 14: the smash cut, three punches, the pull back to frame 0
    (C["mitti14"], "impact_chord", -14, {}), (C["kinara14"], "drum_hit_big", -16, {}), (C["pakki14"], "drum_hit_big", -15, {}), (DURATION - 0.7, "whoosh_cinematic_fast", -13, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["kachre2"], C["ton6"] + 0.3, C["tod8"] + 0.5))
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
