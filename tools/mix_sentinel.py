"""Mix the North Sentinel soundtrack, styled on the reference Short's measured mix:
voice compressed and on top, a quiet tense music bed far below it, effects mostly
whooshes on camera moves plus small UI ticks.

    python3 tools/mix_sentinel.py         # writes public/sentinel/audio/mix.wav

Cue format as in mix_diomede.py: (time, sfx, level_db vs average speech, options).
SFX: Sonniss GDC Game Audio Bundles (royalty free). Music: Mixkit
"Epical Drums 06" (pulse) layered with "Unforgiven" (drone).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "sentinel" / "audio"
DURATION = 68.8

MUSIC = [  # (file, offset s, level dB relative to the voice)
    ("music_epical_drums_06_mixkit.mp3", 0.0, -25.0),
    ("music_unforgiven_mixkit.mp3", 20.0, -27.0),
]
MUSIC_DUCK = 4.0
SFX_DUCK = 4.0
MUSIC_AUTO = [(0, 0), (14.6, 0), (14.7, -4), (19.3, -4), (19.5, 0), (66.5, 0), (68.8, -10)]
HPF = {"boat_motor": 120, "waves_heavy": 90, "heli_flyby": 70, "wh_airy_medium": 120, "wh_magic_air": 110,
       "wh_low_double": 90, "boom_low": 35, "thud_low": 45, "braam_dark": 60}

ARROWS = [51.6, 51.85, 52.1, 52.78, 52.92, 53.06, 53.34]
SPEARS = [52.36, 52.55, 53.2]

CUES = [
    # the most dangerous island
    (0.55, "wh_airy_medium", -13, {}),
    (0.20, "ui_pop_high", -13, {}),
    (0.95, "ui_perc_snap", -12, {}),
    (1.54, "ui_glassy_snap", -10, {}),
    # dive, neon outline, skull
    (3.95, "wh_big_subtle_tonal", -8, {}),
    (4.62, "thud_low", -14, {}),
    (5.38, "shimmer_power", -15, {}),
    (6.62, "thud_low", -9, {}),
    (6.64, "boom_low", -12, {}),
    # pins: crocodile thump, snake, gas
    (8.40, "thud_low", -9, {}),
    (8.42, "ui_pop_high", -13, {}),
    (8.84, "ui_pop_high", -14, {}),
    (9.56, "ui_pop_high", -14, {}),
    # the people
    (11.34, "ui_scatter_plops", -14, {}),
    (12.10, "wh_low_double", -12, {}),
    (12.72, "ui_perc_snap", -11, {}),
    # illustrated inserts: shutter on every cut
    (14.68, "shutter_rise", -10, {}),
    (16.96, "shutter_minolta", -10, {}),
    (18.08, "shutter_fuji", -10, {}),
    (19.38, "shutter_minolta", -12, {}),
    # North Sentinel, Manhattan, Indian Ocean, India
    (19.62, "ui_pop_high", -14, {}),
    (20.60, "ui_perc_snap", -14, {}),
    (23.10, "wh_infographic_slide", -11, {}),
    (24.90, "wh_big_subtle_tonal", -8, {}),
    (26.62, "ui_wipe", -12, {}),
    # back down to the island: the loudest whoosh, as in the reference
    (28.90, "wh_magic_air", -6, {}),
    (29.34, "ui_pop_high", -12, {}),
    (30.42, "ui_balafon", -10, {}),
    # Port Blair, 64 km
    (31.60, "wh_airy_soft", -12, {}),
    (31.62, "ui_pop_high", -14, {}),
    (32.30, "counter_infographic", -16, {"align": "start", "dur": 1.0}),
    (33.30, "ui_glassy_snap", -12, {}),
    # contact attempts: an arrow hits the waving emoji
    (34.70, "wh_organic", -12, {}),
    (34.60, "ui_bubbles", -12, {}),
    (36.30, "arrow_whoosh", -10, {}),
    (36.44, "arrow_hit", -7, {}),
    # 2004 tsunami
    (37.80, "boom_low", -9, {}),
    (37.74, "waves_heavy", -12, {"align": "start", "skip": 294.0, "dur": 2.1}),
    (38.86, "ui_perc_snap", -12, {}),
    # the helicopter
    (39.80, "heli_flyby", -11, {"align": "start", "skip": 9.0, "dur": 2.1}),
    # the archer insert
    (41.64, "shutter_rise", -10, {}),
    (42.60, "bow_loose", -10, {}),
    (42.72, "arrow_fly", -9, {}),
    (43.80, "shutter_minolta", -12, {}),
    # the 9 km zone
    (44.10, "wh_airy_medium", -12, {}),
    (44.75, "thud_low", -12, {}),
    (46.14, "ui_glassy_snap", -12, {}),
    (46.50, "boat_motor", -24, {"align": "start", "skip": 2.0, "dur": 2.6}),
    # sneaking in
    (49.00, "wh_magic_air", -8, {}),
    (49.30, "boat_motor", -18, {"align": "start", "skip": 8.0, "dur": 4.6}),
    *[(t, "arrow_fly", -11, {}) for t in ARROWS],
    *[(t, "arrow_whoosh", -11, {}) for t in SPEARS],
    (52.80, "arrow_hit", -11, {}),
    (53.10, "arrow_hit_rattle", -13, {}),
    # jungle, population
    (54.25, "wh_air_smooth", -12, {}),
    (54.45, "shimmer_power", -17, {}),
    (57.30, "ui_pop_high", -12, {}),
    # the ending
    (59.00, "ui_scatter_plops", -15, {}),
    (60.30, "wh_organic", -15, {}),
    (66.70, "braam_dark", -14, {}),
    (66.72, "thud_low", -12, {}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(AUD / "voiceover.mp3", VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    activity = envelope(talking.astype(np.float32), 0.03, 0.35)[:, None]

    music = np.zeros((n, 2), np.float32)
    for f, off, lvl in MUSIC:
        m = ff(AUD / f, "anull")[int(off * SR):][:n]
        layer = np.zeros((n, 2), np.float32)
        layer[: len(m)] = m
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(layer**2) + 1e-12))
        music += layer
    ts, gs = zip(*MUSIC_AUTO)
    music *= db(np.interp(np.arange(n) / SR, ts, gs)).astype(np.float32)[:, None]
    music *= db(-MUSIC_DUCK * activity)
    music = fade(music, 0.2, 1.5)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / f"{name}.mp3", f"highpass=f={HPF.get(name, 70)}")
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
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music {rms(music):.1f}  music+sfx {rms(music + sfx):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")
    json.dump([c[:3] for c in CUES], open(AUD / "mix_report.json", "w"), ensure_ascii=False)


if __name__ == "__main__":
    main()
