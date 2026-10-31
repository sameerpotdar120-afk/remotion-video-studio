"""Mix the Sikkim video as a seamless loop: the creator's voice on top, Mixkit "Silent Descent" as the bed (dark,
cinematic and pulsing, mixed loud like the reference's), and an effect on every visual hit: whooshes on the swings and
cuts, pops and clicks on pins, labels and counters, rumbles and thunder for the storm and the quake.

    python3 tools/mix_sikkim.py        # writes public/sikkim/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start.
Ducking works like a sidechain compressor (music about 14 dB under the voice while talking, about 7 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/sikkim/edit/timing.json.
Music: Mixkit "Silent Descent", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "sikkim" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "sikkim" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_silent_descent_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 150.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -7.0, -14.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "braam": 35, "boom": 35, "subdrop": 30, "wh_wind_gust": 120, "rain_light": 120, "heartbeat": 30, "amb_jungle_thunderstorm": 90,
       "thunder": 40, "thunder_crash": 40}
CUT_ROUTE = C["sevoke7"]
CUT_GORGE, CUT_STORM, CUT_T7, FALL, CUT_TRAIN = 30.0, 58.6, 60.78, 69.62, 95.38  # v2 cuts (Blender shots)

CUES = [
    # line 1: the push on India, the rail web building (gold pops), the count, the lines out; the swing; Sikkim lights; the title
    (0.0, "wh_wind_gust", -25, {"dur": 2.4, "align": "start"}), *[(0.2 + i * 0.22, "pop_light", -21, {}) for i in range(6)],
    (C["n7000"] - 0.05, "counter_ticking", -19, {"dur": 1.0}), (C["n7000"] + 1.0, "ui_glassy_snap", -16, {}), (2.95, "whoosh_sparkle", -16, {}),
    (3.3, "whoosh_cinematic_fast", -13, {}), (C["rajya1"] + 0.3, "light_transition_magic", -16, {}), (5.3, "swoosh_windy", -19, {}),
    (C["sikkim1"] - 0.1, "impact_chord", -13, {}), (C["sikkim1"] - 0.05, "braam", -17, {}),
    # line 2: the track and train from the south, the brake, the "?"
    (C["kyon2"] + 0.1, "wh_fast", -16, {}), (C["kyon2"] + 0.3, "tram", -22, {"dur": 1.2, "align": "start"}), (C["kyon2"] + 1.4, "metal_thud", -16, {}),
    (C["koshish2"], "toon_boing", -18, {}),
    # line 3: the push onto Siliguri, the pins, the second train, the road and the car
    (C["aaj3"] + 1.0, "whoosh_cinematic_fast", -14, {}), (C["siliguri3"] - 0.1, "pop_high", -15, {}), *[(C["siliguri3"] + 0.05 + i * 0.05, "typewriter_click", -22, {}) for i in range(5)],
    (C["njp3"] - 0.1, "pop_high", -15, {}), *[(C["njp3"] + 0.05 + i * 0.05, "typewriter_click", -22, {}) for i in range(6)],
    (17.3, "tram", -22, {"dur": 1.0, "align": "start"}), (18.2, "metal_thud", -18, {}), (20.3, "swoosh_windy", -17, {}), (20.5, "oldcar", -21, {"dur": 1.4, "align": "start"}),
    # line 4: the pull back, the Himalaya fill (peaks pop), HIMALAYAS types
    (23.0, "whoosh_cinematic_fast", -14, {}), (C["himalaya4"] - 0.2, "boom", -15, {}), *[(C["himalaya4"] - 0.15 + i * 0.07, "pop_light", -20, {}) for i in range(6)],
    (C["himalaya4"] + 0.3, "light_sweep_magic", -18, {}),
    # line 5: the slope card, the ✓, the steep profile, the slip and the ✕
    (C["train5"] - 0.1, "card_flip", -14, {}), (C["chadhai5"] - 0.4, "tram", -24, {"dur": 1.6, "align": "start"}), (C["mod5"] - 0.4, "chime_hit", -18, {}),
    (C["lekin5"] - 0.2, "ui_wipe", -15, {}), (C["lekin5"] + 0.6, "wh_fast", -18, {}), (C["lekin5"] + 0.75, "pen_cross", -13, {}), (C["lekin5"] + 0.77, "metal_thud", -15, {}),
    # the cut to the Blender gorge (line 6): wind up the Teesta, the two tags; line 7: the red line over the ridge, the
    # hill turning to glass, the line inside
    (CUT_GORGE - 0.05, "impact_whoosh_deep", -14, {}), (CUT_GORGE, "wh_wind_gust", -18, {"dur": 5.0, "align": "start"}),
    (C["zameen5"] + 0.6, "ui_pop", -16, {}), (C["ghati5"] - 0.1, "ui_pop", -16, {}),
    (C["isliye6"], "whoosh_cinematic_fast", -14, {}), (C["isliye6"] + 0.5, "riser", -20, {"dur": 3.0, "align": "start"}), (C["upar6"], "light_transition_magic", -17, {}),
    (C["upar6"] + 0.9, "pen_cross", -15, {}), (C["andar6"] - 0.1, "ui_snap", -15, {}), (C["andar6"] - 0.05, "subdrop", -16, {}),
    # line 7: the tear to the map, the route draws, stations pop, 45 km, the ring to 86%, 38 km
    (CUT_ROUTE - 0.1, "paper_quick_move", -12, {}), (CUT_ROUTE + 0.4, "light_sweep_magic", -17, {}),
    *[(CUT_ROUTE + 0.4 + i * 0.42, "pop_high", -18, {}) for i in range(5)],
    (C["km45"] - 0.1, "counter_ticking", -19, {"dur": 0.6}), (C["km45"] + 0.6, "ui_glassy_snap", -16, {}),
    (C["p86"] - 0.1, "whoosh_sparkle", -17, {}), (C["p86"] + 0.1, "counter_ticking", -20, {"dur": 0.5}), (C["p86"] + 0.65, "chime_hit", -18, {}),
    (C["km38"] - 0.2, "wh_fast", -16, {}), (C["km38"] - 0.05, "counter_ticking", -19, {"dur": 0.6}), (C["km38"] + 0.6, "ui_glassy_snap", -16, {}),
    # line 8: 14 tunnels light up, 22 bridges, 5 stations, the longest tunnel and its bracket
    *[(C["surang7"] + i * 0.05, "ui_pop", -23, {}) for i in range(14)], (C["t14"] - 0.1, "ui_snap", -15, {}),
    *[(C["b22"] + i * 0.027, "pop_light", -24, {}) for i in range(10)], (C["b22"] - 0.05, "ui_snap", -15, {}), (C["s5"] - 0.05, "ui_snap", -15, {}),
    (C["longest8"] + 0.25, "light_transition_magic", -15, {}), (C["longest8"] + 0.4, "wh_big_tonal", -16, {}), (C["km53"] - 0.1, "impact_chord", -16, {}),
    # line 9: the storm rolls over the map, then the cut to Tunnel 7 in the rain: thunder, the slope moving, the wall going
    (CUT_STORM - 0.05, "impact_whoosh_deep", -14, {}), (CUT_STORM, "amb_jungle_thunderstorm", -19, {"dur": 12.0, "align": "start"}),
    (CUT_T7 - 0.05, "whoosh_cinematic_fast", -14, {}), (CUT_T7, "rain_light", -17, {"dur": 9.8, "align": "start"}),
    (C["baarish9"], "thunder_crash", -14, {}), (63.1, "subdrop", -16, {}), (C["khisak9"] + 0.4, "thunder", -17, {}),
    (C["tunnel7"] - 0.5, "ui_pop", -15, {}), (C["landslide9"] - 0.1, "ui_pop", -15, {}),
    (FALL - 0.25, "drum_hit_big", -14, {}), (FALL - 0.2, "boom", -13, {}), (FALL - 0.1, "impact_blow", -14, {}), (FALL + 0.2, "metal_thud", -16, {}),
    # line 10: the cut to the quake, the rings, ZONE IV stamps, the shakes
    (C["upar10"] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["bhukamp10"] - 0.1, "subdrop", -14, {}), (C["bhukamp10"], "heartbeat", -17, {"dur": 3.5, "align": "start"}),
    (C["zone10"], "impact_blow", -13, {}), (C["zone10"] + 0.02, "boom", -15, {}), (C["risk10"], "drum_hit_big", -15, {}),
    # line 11: the cut into the bore, its hum, stones dropping from the crown on "भारी", Null
    (C["yani11"] - 0.05, "wh_fast", -14, {}), (C["yani11"] + 0.05, "drum_hit_big", -18, {}), (C["yani11"], "wind_howl", -24, {"dur": 4.9, "align": "start"}),
    (79.75, "metal_thud", -18, {}), (80.0, "impact_blow", -19, {}), (C["bhaari11"], "stinger", -18, {}),
    # line 12: the fact card whips in, the highlight sweep, the ring to 85%, DEC 2027
    (C["phir12"] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["phir12"] + 0.05, "paper_quick_move", -16, {}),
    (C["p85"] - 0.1, "counter_ticking", -19, {"dur": 0.6}), (C["p85"] + 0.5, "chime_hit", -18, {}), (C["plan12"], "light_sweep_magic", -16, {}),
    (C["rangpo12"] - 0.1, "whoosh_sparkle", -16, {}), (C["rangpo12"] + 0.15, "pop_high", -15, {}), *[(C["rangpo12"] + 0.25 + i * 0.05, "typewriter_click", -22, {}) for i in range(6)],
    (C["pehla12"] - 0.1, "ui_glassy_snap", -15, {}), (92.5, "light_sweep_magic", -18, {}),
    # line 13: the train out of the tunnel, the cloud wipe back to India, the pull out to frame 0
    (CUT_TRAIN - 0.05, "wh_wind_gust", -18, {"dur": 2.5, "align": "start"}), (CUT_TRAIN + 0.6, "tram", -19, {"dur": 5.5, "align": "start"}),
    (C["himalaya13"], "braam", -17, {}), (C["isiliye13"] - 0.5, "whoosh_cinematic_fast", -13, {}), (DURATION - 0.9, "wh_fast", -17, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["sikkim1"], C["zameen5"], C["zone10"]))
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
