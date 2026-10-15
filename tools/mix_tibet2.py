"""Mix the new Tibet video (tibet2): the creator's voice on top, a cinematic score, effects on every beat (like the reference).

    python3 tools/mix_tibet2.py        # writes public/tibet2/audio/mix.wav

Cue times come from src/tibet2/timing.json.
Ducking works like a sidechain compressor: about 21 dB under the voice while it speaks, about 11 dB under in pauses.
Music: Mixkit "Vastness" (Andrew Ev), Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "tibet2" / "audio"
T = json.load(open(ROOT / "src" / "tibet2" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_vastness_mixkit.mp3", 6.0, 0.0)]
MUSIC_CUTS = [0.0]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"boom_low": 30, "thud_low": 35, "thunder": 40, "wind_howl": 120, "cabin_flight": 90, "jet_pass": 60}

CUES = [
    # the flight map: radar pings, the red ring, the plane, the alarm
    (0.03, "wh_big_subtle_tonal", -10, {}), (0.05, "punch", -13, {}), (0.2, "radar_ping", -15, {}),
    (C["khaali1"] - 0.05, "impact_whoosh_deep", -11, {}), (C["khaali1"] + 0.2, "radar_ping", -14, {}),
    (C["india1"], "ui_glassy_snap", -13, {}),
    (C["plane1"] - 0.6, "jet_pass", -16, {"align": "start", "dur": 3.0}), (C["gadbad1"] + 0.1, "stall_warning", -16, {"align": "start", "dur": 1.6}),
    (C["kyu1"] - 0.05, "tap_negative", -12, {}),
    # the plateau, the four Frances, the highest plateau
    (C["ye2"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["tibet2"], "impact_chord", -12, {}),
    *[(C["france2"] + 0.2 + i * 0.32, "pop_light", -12, {}) for i in range(4)], (C["chaar2"], "ui_pop_high", -12, {}),
    (C["duniya2"], "shimmer_power", -15, {"dur": 1.4}),
    # into 3D: wind on the plateau, Everest
    (C["zameen3"] - 0.4, "wh_airy_soft", -10, {}), (C["zameen3"], "wind_howl", -24, {"align": "start", "dur": C["socho4"] - C["zameen3"]}),
    (C["n4500"], "ui_glassy_snap", -12, {}), (C["everest3"], "impact_chord", -13, {}),
    # the airliner cruising, the alarm, the masks
    (C["socho4"] - 0.2, "jet_pass", -15, {"align": "start", "dur": 3.5}), (C["n10000"], "ui_glassy_snap", -12, {}),
    (C["achanak4"] - 0.05, "impact_blow", -9, {}), (C["achanak4"], "alarm_slow", -14, {"align": "start", "dur": C["pilot5"] - C["achanak4"]}),
    (C["oxygen4"] - 0.25, "whoosh_cinematic_fast", -11, {}), (C["oxygen4"] + 0.15, "thud_low", -12, {}), (C["oxygen4"] + 0.3, "thud_low", -13, {}),
    (C["oxygen4"], "cabin_flight", -22, {"align": "start", "dur": C["pilot5"] - C["oxygen4"]}),
    (C["minute4"], "typewriter_click", -14, {}),
    # the dive, the safe line, no room
    (C["pilot5"] - 0.25, "wh_fast", -10, {}), (C["pilot5"], "jet_pass", -14, {"align": "start", "dur": 3.0}), (C["n3000"], "ui_pop_high", -12, {}),
    (C["par6"] - 0.1, "scratch", -9, {}), (C["n4500b"], "boom_low", -11, {}), (C["jagah6"], "click_error", -10, {}), (C["jagah6"] + 0.02, "punch", -12, {}),
    # the weather
    (C["mausam7"] - 0.3, "wh_big_subtle_tonal", -11, {}), (C["mausam7"], "thunder", -15, {"align": "start", "dur": 3.0}),
    (C["hawayen7"] - 0.2, "wind_howl", -18, {"align": "start", "dur": C["utarna8"] - C["hawayen7"] + 0.3}),
    (C["jhatke7"], "impact_blow", -11, {}), (C["aasmaan7"], "thunder", -17, {"align": "start", "skip": 2.0, "dur": 1.6}),
    # the few airports
    (C["utarna8"] - 0.1, "wh_airy_soft", -11, {}), *[(C["airports8"] - 0.2 + i * 0.16, "radar_ping", -16, {}) for i in range(0, 8, 2)],
    (C["airports8"], "ui_pop_high", -12, {}), (C["pahadon8"], "tap_negative", -13, {}),
    # L888
    (C["par9"] - 0.1, "riser_9", -14, {"align": "start", "dur": 1.2}), (C["band9"], "light_sweep_magic", -12, {}),
    (C["raasta9"], "wh_magic_air", -12, {}), (C["l888"], "impact_chord", -11, {}), (C["l888"] + 0.5, "jet_pass", -17, {"align": "start", "dur": 3.0}),
    (C["planes9"] - 1.6, "ui_glassy_snap", -13, {}),
    # Null and the question
    (C["aap10"] - 0.15, "wh_airy_soft", -12, {}), (C["haan10"], "pop_light", -11, {}), (C["haan10"] + 0.3, "pop_light", -11, {}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(AUD / "vo.mp3", VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    # sidechain: gaps between words (< 0.15 s) count as speech; a real pause (a comma, a full stop) lets the music swell.
    # Fast attack (25 ms) gets it out of the way as a word starts; a 120 ms release brings it up quickly in the pause.
    from scipy import ndimage
    hop = SR // 100
    sp = talking[::hop]
    sp = ndimage.binary_closing(sp, structure=np.ones(15))
    speech = np.repeat(sp, hop)[:n]
    speech = np.pad(speech, (0, n - len(speech)), constant_values=False)
    activity = envelope(speech.astype(np.float32), 0.025, 0.12)[:, None]
    talking = speech

    # three sections (today, the 1690s, today again), each crossfaded in over 0.5 s, matched in loudness
    music = np.zeros((n, 2), np.float32)
    ref = None
    edges = MUSIC_CUTS + [DURATION]
    for (f, off, _), s0, s1 in zip(MUSIC, edges[:-1], edges[1:]):
        i0, i1 = int(s0 * SR), min(n, int((s1 + 0.5) * SR))
        m = ff(AUD / f, "anull")[int(off * SR):][: i1 - i0]
        if ref is None:
            ref = np.mean(m ** 2)
        m = m * np.sqrt(ref / (np.mean(m ** 2) + 1e-12))
        m = fade(m.copy(), 0.5 if s0 > 0 else 0.25, 0.5)
        music[i0: i0 + len(m)] += m
    m = music
    music *= db(v_ref - 10 * np.log10(np.mean(music[: len(m)] ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    # short dips so the alarm, the scratch and the ✗ land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["achanak4"], C["par6"], C["jagah6"]))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    music = fade(music, 0.25, 2.5)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / (name if "." in name else f"{name}.mp3"), f"highpass=f={HPF.get(name.split('.')[0], 70)}")
        a = cache[name]
        if opt.get("skip"):
            a = a[int(opt["skip"] * SR):]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.08, 0.35)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        start = t - r.argmax() / SR if opt.get("align", "peak") == "peak" else t
        s = int(start * SR)
        if s < 0:
            a, s = a[-s:], 0
        e = min(n, s + len(a))
        if e > s:
            sfx[s:e] += a[: e - s]
    sfx *= db(-SFX_DUCK * activity)

    mix = voice + music + sfx
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                    "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9",
                    "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    tmp.unlink()
    rms = lambda x: 10 * np.log10(np.mean((x**2).mean(1)) + 1e-12)
    quiet = ~talking
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music talking {rms(music[talking]):.1f}  music pauses {rms(music[quiet]):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
