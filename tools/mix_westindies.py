"""Mix the West Indies video as a seamless loop: the creator's voice on top, Mixkit "Skyline" as the bed, and an effect
on every visual hit (the title card, the magnifier, the whip onto the Caribbean, the outline, every island fill in the
tour, the 13, the territories, the crosses, the cricket islands, the arc to India, Guyana, the crossing, "is this
India?", the mistake, East and West Indies, the Federation, the flag, the 4 years, the vote, the crack, the team).

    python3 tools/mix_westindies.py        # writes public/westindies/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start.
Ducking works like a sidechain compressor (music about 21 dB under the voice while talking, about 11 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/westindies/edit/timing.json.
Music: Mixkit "Skyline", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "westindies" / "audio"
VO = ROOT / "public" / "westindies" / "vo" / "westindies_vo.mp3"
T = json.load(open(ROOT / "src" / "westindies" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_skyline_mixkit.mp3", 0.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"boom": 35, "drum_hit_big": 35, "thunder_impact": 40, "thunder_crash": 40, "heartbeat": 30, "waves_soft": 120, "rain_light": 150, "splash": 80}

TOUR = ["cuba3", "jamaica3", "haiti3", "dr3", "bahamas3", "barbados3", "trinidad3"]
CUES = [
    # line 1: the title card is already up (the loop), the magnifier glides and searches
    (0.0, "waves_soft", -26, {"dur": 6.8, "align": "start"}), *[(1.1 + i * 0.63, "ui_snap", -24, {}) for i in range(7)], (C["nahi1"], "toon_boing", -16, {}),
    # line 2: the whip down onto the Caribbean, "no such country", the outline drawing
    (C["kyun2"] + 0.05, "whoosh_cinematic_fast", -11, {}), (C["kyun2"] + 0.6, "impact_whoosh_deep", -15, {}), (C["desh2"] - 0.1, "pen_cross", -14, {}),
    (C["kyun2"] + 0.7, "light_transition_magic", -17, {}),
    # line 3: the island tour, a whoosh and a pop per island; the 13; the territories
    *[(C[k] - 0.02, "wh_fast", -16, {}) for k in TOUR], *[(C[k] + 0.12, "pop_high", -15, {}) for k in TOUR],
    (C["n13_3"] + 0.05, "whoosh_sparkle", -14, {}), (C["n13_3"] + 0.1, "counter_ticking", -18, {"dur": 0.6}), (C["n13_3"] + 0.7, "ui_glassy_snap", -14, {}),
    *[(C["n13_3"] + 0.25 + i * 0.07, "pop_light", -22, {}) for i in range(6)],
    *[(C[k], "ui_pop", -16, {}) for k in ("britain3", "france3", "neth3", "america3")],
    # line 4: the twist, the four crosses
    (C["twist4"], "wh_big_tonal", -14, {}), (C["cricket4"], "ui_wipe", -16, {}),
    *[(C[k], "heavy_knock", -12, {}) for k in ("xcuba4", "xhaiti4", "xdr4", "xbah4")], *[(C[k] + 0.02, "drum_hit_big", -18, {}) for k in ("xcuba4", "xhaiti4", "xdr4", "xbah4")],
    # line 5: the cricket islands light up, British राज, the arc to India, the three names, the small islands
    (C["kyun5"] + 0.3, "whoosh_sparkle", -15, {}), *[(C["kyun5"] + 0.6 + i * 0.08, "pop_light", -22, {}) for i in range(9)],
    (C["britain5"] - 0.1, "chime_hit", -15, {}), (C["hamari5"] - 0.05, "whoosh_cinematic_fast", -12, {}), (C["hamari5"] + 0.25, "light_transition_magic", -15, {}),
    (C["jamaica5"] - 0.1, "whoosh_cinematic_fast", -13, {}), *[(C[k] + 0.05, "pop_high", -16, {}) for k in ("barbados5", "trinidad5")],
    *[(C["chhote5"] + i * 0.1, "pop_light", -22, {}) for i in range(6)],
    # line 6: the strange part, Guyana (not an island)
    (C["ajeeb6"], "toon_boing", -15, {}), (C["island6"] - 0.2, "whoosh_transition_fast", -14, {}), (C["island6"] + 0.2, "pen_cross", -15, {}),
    (C["guyana6"] + 0.05, "impact_chord", -13, {}), (C["samerica6"], "ui_snap", -16, {}),
    # line 7: why the name: 1492, Spain, the dark crossing, the arrival, "is this India?", the mistake, East and West
    (C["naam7"] - 0.2, "whoosh_cinematic_fast", -12, {}), (C["n500_7"], "counter_ticking", -18, {"dur": 0.7}), (C["n500_7"] + 0.72, "ui_glassy_snap", -15, {}),
    (C["columbus7"], "riser", -18, {"dur": 2.6, "align": "start"}), (C["columbus7"] + 0.2, "waves_soft", -20, {"dur": 2.6, "align": "start"}), (C["columbus7"] + 0.3, "wind_howl", -26, {"dur": 2.4}),
    (C["pahunch7"] + 0.2, "impact_whoosh_deep", -13, {}), (C["yahi7"] - 0.1, "toon_whoosh", -15, {}), (C["yahi7"] + 0.35, "pop_high", -15, {}),
    *[(C["yahi7"] + 0.45 + i * 0.033, "typewriter_click", -22, {}) for i in range(10)],
    (C["galti7"], "heavy_knock", -11, {}), (C["east7"] - 0.5, "whoosh_cinematic_fast", -12, {}), (C["east7"], "chime_hit", -14, {}), (C["west7"], "chime_hit", -14, {}),
    # line 8: one country: the islands join, 1958, the flag, the parliament, 4 years, the vote, the crack
    (C["desh8"] - 0.7, "whoosh_cinematic_fast", -12, {}), *[(C["desh8"] + 0.2 + i * 0.08, "pop_light", -21, {}) for i in range(9)],
    (C["n1958_8"], "counter_ticking", -18, {"dur": 0.5}), (C["n1958_8"] + 0.55, "impact_chord", -13, {}), (C["jhanda8"] - 0.1, "swoosh_windy", -15, {}),
    (C["sansad8"] + 0.05, "wh_fast", -15, {}), (C["sansad8"] + 0.3, "pop_high", -16, {}), (C["n4_8"], "counter_ticking", -18, {"dur": 0.4}), (C["n4_8"] + 0.42, "ui_glassy_snap", -15, {}),
    (C["jamaica8"] + 0.1, "whoosh_transition_fast", -14, {}), (C["vote8"], "metal_thud", -13, {}), (C["vote8"] + 0.1, "pop_high", -16, {}),
    (C["toot8"] - 0.03, "thunder_impact", -12, {}), (C["toot8"], "braam", -14, {}), (C["toot8"] + 0.05, "drum_hit_big", -15, {}),
    # line 9: the team still together, the old name; the whip back to frame 0
    (C["toot9"] + 0.2, "whoosh_sparkle", -15, {}), *[(C["toot9"] + 0.3 + i * 0.08, "pop_light", -22, {}) for i in range(10)],
    (C["cricket9"], "ui_wipe", -16, {}), (C["naam9"], "impact_chord", -14, {}),
    (DURATION - 0.75, "whoosh_cinematic_fast", -11, {}), (DURATION - 0.05, "waves_soft", -26, {"dur": 1.2, "align": "start"}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["xcuba4"], C["guyana6"], C["galti7"], C["toot8"]))
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
