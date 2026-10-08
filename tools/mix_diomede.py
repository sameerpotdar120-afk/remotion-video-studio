"""Mix the Diomede Islands soundtrack: voiceover + music bed + timed sound effects.

    python3 tools/mix_diomede.py          # writes public/diomede/audio/mix.wav

Same cue format as tools/mix_audio.py: (time, sfx, gain_db, options). The loudest
point of each effect lands on `time` unless align="start". Times come from the
voiceover's word timings and the animation keys in src/diomede/.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, decode, fade, rms_db, write_wav

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "diomede" / "audio"
DURATION = 59.4

VOICE = AUD / "voiceover.mp3"
# "Silent Descent" swells at 69.5 s into the track; the offset puts that on "फिर कोल्ड वार में" (34.78)
MUSIC = AUD / "music_silent_descent_mixkit.mp3"
MUSIC_OFFSET = 34.72
MUSIC_DB = -15.0  # bed level relative to the voice
# (time, dB) music gain automation on top of MUSIC_DB, linear between points
MUSIC_AUTO = [(0, 0), (14.5, 0), (15.3, 3), (16.9, 3), (17.5, 0), (34.6, 0), (35.4, -1.5), (46.0, -1.5), (47.0, -0.5), (58.4, -0.5), (59.4, -6)]

RADAR = [42.9, 43.5, 44.1, 45.3, 45.9]
FOOTSTEP_START = 49.25

CUES = [
    # hook: dive in, pulse rings, 3.8 km arrow and counter
    (0.00, "whoosh_deep_air", -5, {"align": "start"}),
    (0.00, "wind_winter_loop", -14, {"align": "start", "dur": 4.4}),
    (0.45, "radar_ping", -11, {}),
    (1.10, "radar_ping", -12, {}),
    (1.35, "impact_quick_zoom", -6, {}),
    (1.20, "swoosh_fast", -7, {"align": "start"}),
    (1.40, "counter_ticking", 0, {"align": "start", "dur": 1.2}),
    (2.62, "pop_hard", -6, {}),
    (4.10, "whoosh_wind_short", -9, {}),
    (4.72, "pop_long", -3, {}),
    (4.72, "bass_hit_short", -8, {}),
    (6.34, "pop_long", -3, {}),
    (6.34, "bass_hit_short", -6, {}),
    # title
    (7.15, "whoosh_transition_fast", -6, {}),
    (7.75, "impact_trailer_epic", -1, {}),
    (7.80, "light_transition_magic", -12, {}),
    # America / Russia
    (9.65, "sweep_fast_small", -8, {}),
    (10.14, "pop_hard", -4, {}),
    (10.18, "bass_hit_short", -9, {}),
    (11.55, "swoosh_flying_fast", -8, {}),
    (11.92, "pop_hard", -4, {}),
    (11.96, "bass_hit_short", -9, {}),
    # the date line, then out to the Pacific
    (13.15, "sweep_fast_small", -10, {}),
    (13.45, "sparkle_whoosh", -6, {"align": "start"}),
    (14.94, "bass_hit_short", -7, {}),
    (15.25, "whoosh_tunnel_reverb", -4, {}),
    (15.60, "pop_light", -5, {}),
    (15.75, "pop_light", -5, {}),
    (16.05, "heartbeat_impact_deep", -5, {}),
    # back down: Monday / Tuesday
    (17.00, "whoosh_cinematic_fast", -5, {}),
    (17.40, "pop_long", -6, {}),
    (17.55, "clock_tick_close", -3, {"align": "start", "dur": 3.2}),
    (18.70, "pop_long", -5, {}),
    (19.42, "fairy_glitter", -8, {"align": "start"}),
    (20.58, "pop_long", -6, {}),
    (20.80, "clock_ticking_fast", -4, {"align": "start", "dur": 0.95}),
    (20.80, "watch_knob_spin", 0, {"align": "start"}),
    (20.90, "pop_dry", -9, {}),
    (21.74, "impact_quick_zoom", -3, {}),
    (21.74, "bass_hit_short", -6, {}),
    # "पर इतने पास होकर भी… क्यों?"
    (23.70, "whoosh_deep_air", -8, {}),
    (24.20, "wind_hum_deep", -14, {"align": "start", "dur": 2.4, "skip": 1.0}),
    (26.52, "pop_hard", -3, {}),
    (26.52, "heartbeat_impact_deep", -3, {}),
    # 1867: out to Alaska, the treaty and the quill
    (27.15, "swoosh_windy", -6, {}),
    (27.40, "impact_whoosh_deep", -1, {}),
    (27.95, "zoom_air_fast", -7, {}),
    (28.90, "paper_slide", 0, {"align": "start"}),
    (29.45, "page_turn", 0, {}),
    (29.62, "bass_hit_short", -8, {}),
    (30.15, "pen_writing", -1, {"align": "start", "dur": 1.05}),
    (30.30, "pop_light", -8, {}),
    (30.88, "impact_quick_zoom", -3, {}),
    (30.88, "sparkle_poof", -6, {}),
    (31.40, "paper_quick_move", -5, {}),
    # the border through the strait
    (31.90, "whoosh_transition_fast", -6, {}),
    (31.82, "light_sweep_magic", -6, {"align": "start"}),
    (32.90, "bass_hit_short", -4, {}),
    (33.50, "swoosh_flying_fast", -6, {}),
    # Cold War: frost, orbit, the wall rises, Ice Curtain
    (34.78, "sweep_darkness", -4, {"align": "start"}),
    (34.78, "ice_crack_c", -5, {}),
    (34.80, "wind_arctic", -13, {"align": "start", "dur": 5.8, "skip": 3.0}),
    (35.30, "thunder_distant", -9, {}),
    (36.20, "swoosh_windy", -8, {}),
    (36.80, "ice_crack_a", -1, {}),
    (36.80, "stomp_apocalyptic", -5, {}),
    (37.30, "ice_crack_b", -6, {}),
    (37.85, "ice_crack_d", -4, {}),
    (39.04, "impact_movie_intro", -4, {}),
    (39.06, "ice_crack_c", -7, {}),
    # Soviet military base
    (40.55, "whoosh_cinematic_fast", -5, {}),
    (42.20, "pop_hard", -3, {}),
    (42.22, "bass_hit_short", -6, {}),
    (42.55, "pop_long", -6, {}),
    *[(t, "radar_ping", -9, {}) for t in RADAR],
    (44.74, "heartbeat_impact_deep", -4, {}),
    # winter: snow, sea ice freezing, the ice bridge, the walker
    (46.30, "whoosh_magic_gust", -5, {}),
    (46.00, "wind_winter_loop", -11, {"align": "start", "dur": 8.4, "skip": 4.4}),
    (46.60, "fairy_glitter", -9, {"align": "start"}),
    (46.90, "ice_crack_d", -4, {}),
    (47.55, "ice_crack_c", -8, {}),
    (48.15, "ice_crack_b", -7, {}),
    (48.70, "ice_crack_a", -3, {}),
    (48.70, "impact_quick_zoom", -5, {}),
    (48.70, "light_sweep_magic", -10, {"align": "start"}),
    (FOOTSTEP_START, "footsteps_snow", -4, {"align": "start", "dur": 4.3}),
    # आज / कल again, then the question
    (51.76, "pop_long", -4, {}),
    (53.54, "pop_long", -4, {}),
    (54.00, "pop_dry", -4, {}),
    (54.05, "sparkle_poof", -10, {}),
    (54.60, "whoosh_deep_air", -9, {}),
    (55.92, "pop_hard", -5, {}),
    (56.88, "pop_hard", -5, {}),
    (57.92, "pop_long", -3, {}),
    (57.95, "sparkle_intro", -9, {"align": "start"}),
]


def automation(n: int, points: list[tuple[float, float]]) -> np.ndarray:
    ts, gs = zip(*points)
    return db(np.interp(np.arange(n) / SR, ts, gs)).astype(np.float32)[:, None]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = decode(VOICE)[:n]
    voice[: len(v)] = v
    voice *= 0.8 / (np.abs(voice).max() + 1e-9)
    v_rms = rms_db(voice[np.abs(voice).max(1) > 1e-3])

    music = np.zeros((n, 2), np.float32)
    m = decode(MUSIC)[int(MUSIC_OFFSET * SR):][:n]
    music[: len(m)] = m
    music *= db(v_rms + MUSIC_DB - rms_db(music))
    music *= automation(n, MUSIC_AUTO)
    music = fade(music, 0.4, 0.8)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    report = []
    for t, name, gain, opt in CUES:
        if name not in cache:
            a = decode(AUD / "sfx" / f"{name}.mp3")
            cache[name] = a / (np.abs(a).max() + 1e-9) * db(-1)
        a = cache[name]
        if opt.get("skip"):
            a = a[int(opt["skip"] * SR):]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.05, 0.25)
        a = a * db(gain)
        if opt.get("align", "peak") == "peak":
            env = np.convolve(np.abs(a).mean(1), np.ones(480) / 480, "same")
            start = t - env.argmax() / SR
        else:
            start = t
        s = int(start * SR)
        if s < 0:
            a, s = a[-s:], 0
        e = min(n, s + len(a))
        if e > s:
            sfx[s:e] += a[: e - s]
            seg_v = voice[s:e]
            report.append((t, name, round(float(rms_db(a[: e - s]) - (rms_db(seg_v) if seg_v.any() else -90)), 1)))

    mix = voice + music + sfx
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4) * 0.98
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix)
    out = AUD / "mix.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), str(out)],
        check=True,
    )
    tmp.unlink()
    (AUD / "mix_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=0))
    quiet = [r for r in report if r[2] < -14]
    print(f"cues: {len(report)}, quieter than voice by >14 dB: {len(quiet)}")
    for r in quiet:
        print("  ", r)


if __name__ == "__main__":
    main()
