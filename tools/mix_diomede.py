"""Mix the Diomede Islands soundtrack: processed voice + ducked music bed + ducked SFX.

    python3 tools/mix_diomede.py          # writes public/diomede/audio/mix.wav

Cue format: (time, sfx, level_db, options). level_db is where the loudest 50 ms of
the effect sits relative to the voice's average speech level, so -8 means "8 dB
under the voice". The loudest point lands on `time` unless align="start".
While the voice is talking, effects duck a further SFX_DUCK dB and the music
MUSIC_DUCK dB, so the voice always stays on top.

Sound effects: Sonniss GDC Game Audio Bundles (royalty free, commercial use, no
attribution required). Music: "Silent Descent", Mixkit.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, decode, fade, write_wav

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "diomede" / "audio"
DURATION = 59.4

VOICE = AUD / "voiceover.mp3"
# clean low end, a little less mud, more presence, then steady the level
VOICE_CHAIN = (
    "highpass=f=80,equalizer=f=280:t=q:w=1.2:g=-2,equalizer=f=3800:t=q:w=1.0:g=2.5,"
    "acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=3,"
    "alimiter=limit=0.89:attack=2:release=40"
)

# "Silent Descent" swells at 69.5 s into the track; the offset puts that on "फिर कोल्ड वार में" (34.78)
MUSIC = AUD / "music_silent_descent_mixkit.mp3"
MUSIC_OFFSET = 34.72
MUSIC_DB = -14.0  # bed RMS relative to the voice, before ducking
MUSIC_DUCK = 5.0
SFX_DUCK = 5.0
# (time, dB) music automation on top of MUSIC_DB, linear between points
MUSIC_AUTO = [(0, 0), (14.6, 0), (15.3, 3), (16.9, 3), (17.5, 0), (34.6, 0), (35.4, -1.5), (58.4, -1.5), (59.4, -8)]

# default high-pass per effect (Hz); rumbly sources get more
HPF = {"wind_winter_open": 180, "wind_snow_gusty": 160, "snow_walk_crusty": 150, "ice_field": 120,
       "wh_low_double": 90, "wh_airy_medium": 120, "wh_wind_gust": 140, "wh_magic_air": 110, "hit_chime": 50,
       "boom_low": 35, "thud_low": 45, "braam_dark": 60}

CUES = [
    # hook: dive in, pulse rings, the 3.8 km arrow and its counter
    (0.45, "wh_magic_air", -9, {}),
    (0.00, "wind_winter_open", -24, {"align": "start", "skip": 30.0, "dur": 4.4}),
    (0.10, "sonar", -15, {}),
    (1.25, "wh_infographic_slide", -10, {}),
    (1.35, "thud_low", -13, {}),
    (1.40, "counter_infographic", -13, {"align": "start", "dur": 1.2}),
    (2.62, "ui_glassy_snap", -8, {}),
    # आज / कल calendars
    (4.72, "ui_pop_high", -6, {}),
    (4.78, "page_turn_info", -14, {}),
    (6.34, "ui_pop_high", -6, {}),
    (6.40, "page_turn_info", -14, {}),
    # title
    (7.20, "wh_air_smooth", -10, {}),
    (7.75, "hit_chime", -6, {}),
    (7.80, "shimmer_power", -11, {}),
    # America / Russia
    (9.65, "wh_organic", -10, {}),
    (10.14, "ui_kalimba_up", -7, {}),
    (11.55, "wh_organic", -11, {}),
    (11.92, "ui_marimba", -7, {}),
    # the date line, then out to the whole Pacific
    (13.15, "wh_infographic_slide", -12, {}),
    (13.44, "ui_readout", -15, {"align": "start", "dur": 1.0}),
    (15.30, "wh_big_subtle_tonal", -8, {}),
    (15.60, "ui_pop_high", -9, {}),
    (15.75, "ui_pop_high", -10, {}),
    # back down: Monday / Tuesday
    (17.10, "wh_vacuum", -10, {}),
    (17.40, "ui_perc_snap", -9, {}),
    (17.55, "clock_running_late", -15, {"align": "start", "dur": 3.2}),
    (18.70, "ui_pop_high", -8, {}),
    (19.42, "shimmer_power", -10, {}),
    (20.58, "ui_perc_snap", -9, {}),
    (20.80, "clock_trailer023", -11, {"align": "start", "skip": 1.0, "dur": 1.0}),
    (21.30, "wh_fast", -15, {}),
    (20.90, "ui_pop_high", -10, {}),
    (21.74, "ui_glassy_snap", -6, {}),
    (21.76, "thud_low", -12, {}),
    # "पर इतने पास होकर भी… क्यों?"
    (23.70, "wh_airy_soft", -11, {}),
    (26.52, "ui_balafon", -8, {}),
    # 1867: out to Alaska, the treaty and the quill
    (27.35, "wh_transition049", -9, {}),
    (27.40, "boom_low", -10, {}),
    (27.90, "wh_airy_medium", -12, {}),
    (29.00, "paper_slide", -8, {}),
    (29.45, "page_turn_glossy", -9, {}),
    (29.62, "ui_perc_snap", -11, {}),
    (30.15, "pencil_circles", -9, {"align": "start", "skip": 0.8, "dur": 1.05}),
    (30.30, "ui_pop_high", -12, {}),
    (30.88, "ui_wipe", -8, {}),
    (30.92, "shimmer_power", -13, {}),
    (31.40, "page_turn_info", -10, {}),
    # the border through the strait
    (31.90, "wh_air_smooth", -10, {}),
    (31.82, "ui_readout", -15, {"align": "start", "dur": 1.2}),
    (32.90, "thud_low", -10, {}),
    (33.50, "wh_organic", -11, {}),
    # Cold War: frost, a dark swell into the wall, Ice Curtain
    (34.78, "ice_fissure", -10, {}),
    (34.80, "wind_snow_gusty", -22, {"align": "start", "skip": 20.0, "dur": 5.8}),
    (36.80, "braam_dark", -9, {}),
    (36.80, "wh_magic_ice", -7, {}),
    (36.90, "ice_crushed", -7, {}),
    (37.40, "ice_snap", -13, {}),
    (39.04, "hit_chime", -6, {}),
    (39.06, "ice_debris", -10, {}),
    # Soviet military base
    (40.55, "wh_airy_medium", -11, {}),
    (42.20, "ui_pop_high", -7, {}),
    (42.22, "thud_low", -12, {}),
    (42.55, "ui_scatter_plops", -9, {}),
    (42.90, "sonar", -16, {}),
    (44.10, "sonar", -17, {}),
    (44.74, "thud_low", -10, {}),
    (45.30, "sonar", -17, {}),
    # winter: snow, sea ice freezing, the ice bridge, the walker
    (46.40, "wh_wind_gust", -10, {}),
    (46.00, "wind_winter_open", -20, {"align": "start", "skip": 40.0, "dur": 8.4}),
    (46.60, "ice_field", -17, {"align": "start", "skip": 30.0, "dur": 2.2}),
    (47.00, "ice_debris", -14, {}),
    (47.60, "ice_fissure", -15, {}),
    (48.70, "ice_freeze_break", -7, {}),
    (48.75, "shimmer_power", -13, {}),
    (49.25, "snow_walk_crusty", -13, {"align": "start", "skip": 4.0, "dur": 4.3}),
    # आज / कल again, then the question
    (51.76, "ui_pop_high", -7, {}),
    (53.54, "ui_pop_high", -7, {}),
    (54.00, "ui_bubbles", -9, {}),
    (54.60, "wh_airy_soft", -12, {}),
    (55.92, "ui_kalimba_up", -8, {}),
    (56.88, "ui_marimba", -8, {}),
    (57.92, "ui_entry_happy", -6, {}),
    (57.96, "ui_arp_twinkle", -12, {}),
]


def ff(path: Path, chain: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-af", chain, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def win_rms_db(a: np.ndarray, w: int = int(0.05 * SR)) -> np.ndarray:
    p = np.convolve((a**2).mean(1), np.ones(w) / w, "same")
    return 10 * np.log10(p + 1e-12)


def envelope(x: np.ndarray, attack: float, release: float) -> np.ndarray:
    """One-pole follower on a 0..1 control signal (computed at 1 kHz, then upsampled)."""
    hop = SR // 1000
    c = x[::hop]
    out = np.empty_like(c)
    ka, kr = np.exp(-1 / (attack * 1000)), np.exp(-1 / (release * 1000))
    y = 0.0
    for i, v in enumerate(c):
        k = ka if v > y else kr
        y = k * y + (1 - k) * v
        out[i] = y
    return np.repeat(out, hop)[: len(x)]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(VOICE, VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))  # average speech level
    activity = envelope(talking.astype(np.float32), 0.03, 0.35)[:, None]

    music = np.zeros((n, 2), np.float32)
    m = decode(MUSIC)[int(MUSIC_OFFSET * SR):][:n]
    music[: len(m)] = m
    music *= db(v_ref + MUSIC_DB - 10 * np.log10(np.mean(music**2)))
    ts, gs = zip(*MUSIC_AUTO)
    music *= db(np.interp(np.arange(n) / SR, ts, gs)).astype(np.float32)[:, None]
    music *= db(-MUSIC_DUCK * activity)
    music = fade(music, 0.3, 0.8)

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    report = []
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / f"{name}.mp3", f"highpass=f={HPF.get(name, 70)}")
        a = cache[name]
        if opt.get("skip"):
            a = a[int(opt["skip"] * SR):]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.05, 0.25)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        start = t - r.argmax() / SR if opt.get("align", "peak") == "peak" else t
        s = int(start * SR)
        if s < 0:
            a, s = a[-s:], 0
        e = min(n, s + len(a))
        if e > s:
            sfx[s:e] += a[: e - s]
            report.append((t, name, level))
    sfx *= db(-SFX_DUCK * activity)

    mix = voice + music + sfx
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
    out = AUD / "mix.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
         "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", str(SR), str(out)],
        check=True,
    )
    tmp.unlink()
    (AUD / "mix_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=0))

    rms = lambda x: 10 * np.log10(np.mean((x**2).mean(1)) + 1e-12)
    print(f"cues {len(report)}  voice(speech) {rms(voice[talking]):.1f}  music {rms(music):.1f}  "
          f"music under speech {rms(music[talking]):.1f}  sfx loudest 50ms {win_rms_db(sfx).max():.1f}  dBFS pre-loudnorm")


if __name__ == "__main__":
    main()
