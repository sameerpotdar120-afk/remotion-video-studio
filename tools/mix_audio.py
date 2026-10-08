"""Mix the Darién Gap soundtrack: voiceover + music bed + timed sound effects.

    python3 tools/mix_audio.py            # writes public/darien/audio/mix.wav

Each cue is (time, sfx, gain_db, options). By default the loudest point of the
effect (the hit of an impact, the centre of a whoosh) lands exactly on `time`;
pass align="start" to start the file at `time` instead. Effects are peak-
normalised first, so gain_db is relative to full scale and directly comparable
between cues.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "darien" / "audio"
SR = 48000
DURATION = 72.8

VOICE = AUD / "voiceover.mp3"
MUSIC = AUD / "music_unforgiven_mixkit.mp3"
MUSIC_OFFSET = 20.0  # seconds into the track
MUSIC_DB = -15.0  # bed level relative to the voice

# Typing clicks for the map labels (one per grapheme)
TYPE_PANAMA = [34.15 + i * 0.15 for i in range(3)]
TYPE_COLOMBIA = [34.85 + i * 0.14 for i in range(4)]
RADAR = [65.0, 65.32, 65.64, 65.96, 67.14, 67.42, 67.7]

CUES = [
    # hook: highway draws, counter, the X
    (0.00, "whoosh_air", -5, {"align": "start"}),
    (1.85, "counter_ticking", -1, {"align": "start", "dur": 1.45}),
    (2.60, "whoosh_wind_short", -7, {}),
    (3.25, "bass_hit_short", -6, {}),
    (4.98, "pop_hard", -4, {}),
    (4.98, "bass_hit_short", -2, {}),
    (5.30, "sweep_fast_small", -6, {}),
    (7.64, "heartbeat_impact_deep", -2, {}),
    # continents
    (8.50, "whoosh_deep_air", -7, {}),
    (8.50, "pop_light", -6, {}),
    (9.56, "pop_light", -6, {}),
    (11.68, "impact_quick_zoom", -2, {}),
    # X splits, dive, region, title
    (12.95, "zoom_air_fast", -5, {}),
    (13.90, "whoosh_tunnel_reverb", -4, {}),
    (14.90, "light_transition_magic", -9, {}),
    (15.58, "impact_trailer_epic", 0, {}),
    # most dangerous: skull
    (18.12, "hit_horror_drum", -1, {}),
    (18.12, "impact_horror", -6, {}),
    # longest road, the break
    (20.80, "whoosh_cinematic_fast", -4, {}),
    (21.10, "pop_long", -7, {}),
    (22.90, "impact_whoosh_deep", -2, {}),
    (22.72, "radar_ping", -8, {}),
    (22.84, "radar_ping", -9, {}),
    (24.98, "heartbeat_impact_deep", -2, {}),
    # dark mood, zoom-through, 160 km
    (26.40, "sweep_darkness", -3, {"align": "start"}),
    (28.10, "zoom_air_vacuum", -3, {}),
    (28.32, "counter_ticking_2", -1, {"align": "start", "dur": 1.3}),
    (29.62, "bass_hit_short", -6, {}),
    # B-roll
    (30.85, "whoosh_transition_fast", -3, {}),
    (30.90, "amb_swamp_jungle_birds", -6, {"align": "start", "dur": 3.3, "skip": 3.0}),
    (32.14, "swoosh_fast", -4, {}),
    (33.18, "whoosh_wind_short", -5, {}),
    (33.18, "wind_hum_deep", -12, {"align": "start", "dur": 1.1, "skip": 2.0}),
    (34.20, "whoosh_deep_air", -4, {}),
    *[(t, "typewriter_click", -2, {}) for t in TYPE_PANAMA + TYPE_COLOMBIA],
    # terrain, humidity, rain
    (36.90, "sweep_fast_small", -6, {}),
    (38.00, "amb_breeze_trees", -8, {"align": "start", "dur": 2.6, "skip": 3.0}),
    (38.84, "amb_jungle_thunderstorm", -8, {"align": "start", "dur": 1.9}),
    (39.66, "thunder_impact", -2, {}),
    # paper map
    (40.45, "whoosh_sparkle", -4, {}),
    (40.50, "swoosh_windy", -6, {}),
    (40.95, "paper_slide", 0, {}),
    (42.12, "bass_hit_short", -5, {}),
    (43.12, "paper_quick_move", -2, {}),
    (45.40, "whoosh_wind_short", -7, {}),
    (47.25, "swoosh_flying_fast", -6, {}),
    (47.84, "hit_wood_hard", 0, {}),
    (47.84, "impact_blow", -2, {}),
    (47.84, "bass_hit_short", -3, {}),
    (48.60, "sweep_fast_small", -8, {}),
    # migrants
    (49.05, "whoosh_cinematic_fast", -4, {}),
    (50.20, "light_sweep_magic", -8, {}),
    (50.55, "bass_hit_short", -8, {}),
    (52.60, "whoosh_wind_short", -7, {}),
    (54.60, "zoom_air_fast", -5, {}),
    (54.70, "pop_dry", -10, {}),
    (54.95, "pop_dry", -10, {}),
    (55.20, "pop_dry", -10, {}),
    (57.40, "tap_negative", -9, {}),
    (57.70, "impact_horror", -2, {}),
    # terrain + wildlife
    (59.60, "sweep_fast_small", -7, {}),
    (60.30, "leaves_rustle", -3, {}),
    (61.08, "pop_long", -5, {}),
    (61.38, "pop_long", -5, {}),
    (61.40, "bird_screech", -12, {}),
    (61.68, "pop_long", -5, {}),
    (61.70, "mosquito_buzz", -10, {"align": "start", "dur": 1.0}),
    (61.95, "pop_long", -6, {}),
    # no government control
    (62.72, "police_siren", -11, {"align": "start", "dur": 1.6}),
    (62.75, "pop_hard", -4, {}),
    (63.98, "click_error", -4, {}),
    (64.05, "glitch_electric_small", -8, {"align": "start"}),
    (64.95, "swoosh_flying_fast", -4, {}),
    # criminals, smugglers, gangs
    (65.00, "heartbeat_drum_horror", -6, {"align": "start"}),
    *[(t, "radar_ping", -8, {}) for t in RADAR],
    (67.14, "hit_horror_drum", -3, {}),
    (68.12, "heartbeat_impact_deep", -1, {}),
    # kidnapping
    (69.50, "leaves_rustle", -7, {}),
    (69.75, "paper_quick_move", -2, {}),
    (69.82, "pop_long", -5, {}),
    (70.38, "pop_hard", -3, {}),
    (70.40, "hit_horror_drum", -4, {}),
    (72.32, "impact_trailer_epic", -2, {}),
]


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def db(x: float) -> float:
    return 10 ** (x / 20)


def fade(a: np.ndarray, fin: float, fout: float) -> np.ndarray:
    n = len(a)
    i, o = min(n, int(fin * SR)), min(n, int(fout * SR))
    if i:
        a[:i] *= np.linspace(0, 1, i)[:, None]
    if o:
        a[n - o:] *= np.linspace(1, 0, o)[:, None]
    return a


def rms_db(a: np.ndarray) -> float:
    return 20 * np.log10(np.sqrt(np.mean(a**2)) + 1e-12)


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = decode(VOICE)[:n]
    voice[: len(v)] = v
    voice *= 0.5 / (np.abs(voice).max() + 1e-9) * 1.6  # voice peaks near -2 dBFS
    v_rms = rms_db(voice[voice.any(1)])

    music = np.zeros((n, 2), np.float32)
    m = decode(MUSIC)[int(MUSIC_OFFSET * SR):][:n]
    music[: len(m)] = m
    music *= db(v_rms + MUSIC_DB - rms_db(music))
    music = fade(music, 1.5, 1.2)

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
    # soft limiter, then loudness-normalise with ffmpeg
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


def write_wav(path: Path, a: np.ndarray) -> None:
    import wave

    pcm = (np.clip(a, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
