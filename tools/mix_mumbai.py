"""Mix the Mumbai seven-islands video: the creator's voice on top, a light world-music bed, map/foley effects.

    python3 tools/mix_mumbai.py        # writes public/mumbai/audio/mix.wav

Cue times come from src/mumbai/timing.json (aligned to the voiceover). Same levels as the earlier videos: bed ~20 LU
under the voice, effects small (loudest hits around -6 dB vs the voice), ducked while the voice talks.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Indian Meditations" (Ahjay Stelino), Mixkit free licence.
"""

import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "mumbai" / "audio"
T = json.load(open(ROOT / "src" / "mumbai" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_indian_meditations_mixkit.mp3", 8.0, -20.0)]
MUSIC_DUCK, SFX_DUCK = 5.0, 2.5
HPF = {"harbour": 150, "waves_ocean": 120, "waves_heavy": 90, "gulls_harbour": 250, "rain_light": 150, "crane_motor": 120, "dock_creak": 150, "vhs_rewind": 200, "boom_low": 35, "thud_low": 45, "rock_big": 40}

NAMES = ["colaba", "bombay", "mazgaon", "parel", "worli", "mahim", "oldw"]
CUES = [
    # hook: dive from India onto today's Mumbai, 2 crore people
    (0.05, "impact_whoosh_deep", -10, {}),
    (C["crore"] - 0.45, "wh_big_subtle_tonal", -6, {}),
    (C["crore"] - 0.1, "counter_infographic", -16, {"align": "start", "dur": 0.9}),
    (C["log"] + 0.02, "ui_glassy_snap", -11, {}),
    # 200 years back: rewind, then the sea takes the low ground back
    (C["dosau"] - 0.05, "vhs_rewind", -17, {"align": "start", "skip": 1.0, "dur": C["samandar2"] - C["dosau"]}),
    (C["dosau"], "counter_ticking", -19, {"align": "start", "dur": 1.1}),
    (C["pehle"], "boom_low", -11, {}),
    (C["samandar2"] - 0.3, "waves_heavy", -11, {"align": "start", "dur": 2.0}),
    (C["samandar2"] + 0.15, "splash", -13, {}),
    # not one city: seven islands
    (C["mumbai3"] + 0.2, "ui_pop_high", -12, {}),
    (C["nahi3"], "paper_quick_move", -11, {}),
    (C["saat"], "thud_low", -7, {}),
    (C["saat"] + 0.02, "boom_low", -12, {}),
] + [(C["saat"] + 0.12 * i, "pop_light", -17, {}) for i in range(7)] + [
    x for k in NAMES for x in [(C[k] - 0.25, "wh_airy_soft", -10, {}), (C[k] - 0.02, "ui_pop_high", -14, {})]
] + [
    (C["island7"] + 0.1, "wh_big_subtle_tonal", -8, {}),
    # our Koli brothers: gulls, the sea, boats creaking
    (C["yahan"] - 0.2, "gulls_harbour", -25, {"align": "start", "skip": 4.0, "dur": C["devi10"] - C["yahan"] + 0.4}),
    (C["yahan"], "waves_ocean", -27, {"align": "start", "dur": C["devi10"] - C["yahan"] + 0.6}),
    (C["koli8"], "ui_pop_high", -13, {}),
    (C["samandar9"] - 0.2, "dock_creak", -22, {"align": "start", "dur": 2.6}),
    # Mumba Devi
    (C["devi10"] - 0.2, "wh_magic_air", -8, {}),
    (C["mumba"] - 0.05, "bowl_strike", -9, {"align": "start", "dur": 3.4}),
    (C["mumbai10"] - 0.1, "light_sweep_magic", -11, {}),
    (C["mumbai10"] + 0.3, "shimmer_power", -13, {}),
    # 1534: the Portuguese sail in
    (C["y1534"], "thud_low", -7, {}),
    (C["y1534"] + 0.02, "boom_low", -10, {}),
    (C["y1534"] + 0.25, "harbour", -24, {"align": "start", "skip": 10.0, "dur": C["y1661"] - C["y1534"]}),
    (C["kabja"] - 0.4, "wh_fast", -9, {}),
    (C["kabja"], "impact_chord", -15, {}),
    # 1661: dowry, the king, ten pounds a year, the Company's ship
    (C["y1661"], "thud_low", -7, {}),
    (C["y1661"] + 0.25, "wh_big_subtle_tonal", -6, {}),
    (C["dahej"], "cash_coins", -11, {}),
    (C["dahej"] + 0.15, "shimmer_power", -14, {}),
    (C["england"] - 0.1, "whoosh_sparkle", -11, {}),
    (C["raja"], "ui_glassy_snap", -12, {}),
    (C["das"] - 0.05, "coins_ting", -9, {}),
    (C["das"] + 0.1, "paper_slide", -15, {}),
    (C["company14"], "harbour", -24, {"align": "start", "skip": 30.0, "dur": C["diya"] - C["company14"] + 0.3}),
    (C["company14"] + 0.1, "swoosh_windy", -12, {}),
    (C["diya"] - 0.05, "wh_low_double", -7, {}),
    (C["kam"] + 0.25, "impact_whoosh_deep", -11, {}),
    # too little land, the monsoon sea
    (C["zameen15"] + 0.3, "thunder_distant", -20, {"align": "start", "dur": 1.8}),
    (C["monsoon"] - 0.3, "rain_light", -15, {"align": "start", "dur": C["y1782"] - C["monsoon"] + 0.9}),
    (C["monsoon"], "wh_wind_gust", -12, {}),
    (C["samandar16"], "thunder_crash", -6, {}),
    (C["samandar16"] - 0.1, "waves_heavy", -10, {"align": "start", "skip": 2.0, "dur": 1.9}),
    (C["ghus"], "splash", -9, {}),
    # 1782: Hornby, the plan, the Company's letter
    (C["y1782"], "thud_low", -7, {}),
    (C["y1782"] + 0.02, "boom_low", -11, {}),
    (C["hornby17"] - 0.05, "ui_pop_high", -12, {}),
    (C["deewar"] - 0.05, "pop_light", -14, {}),
    (C["company19"] - 0.1, "swoosh_windy", -10, {}),
    (C["company19"] + 0.45, "paper_slide", -12, {}),
    (C["suspend"] - 0.05, "thud_low", -6, {}),
    (C["suspend"] - 0.03, "impact_blow", -10, {}),
    (C["ruka"] - 0.5, "ice_snap", -11, {}),
    (C["ruka"] - 0.15, "paper_quick_move", -9, {}),
    (C["ruka"] - 0.1, "wh_fast", -10, {}),
    # stone by stone: the Hornby Vellard, 1784
    (C["ruka"] - 0.3, "rock_single", -12, {}),
    (C["ruka"] + 0.15, "rock_single", -13, {}),
    (C["ruka"] + 0.5, "rock_single", -12, {}),
    (C["y1784"] - 0.2, "rock_single", -12, {}),
    (C["y1784"], "rock_big", -6, {}),
    (C["y1784"] + 0.02, "boom_low", -10, {}),
    (C["y1784"] + 0.3, "hit_wood_hard", -15, {}),
    (C["vellard"] - 0.05, "shimmer_power", -12, {}),
    # seven become one
    (C["saaton"] - 0.1, "wh_big_subtle_tonal", -7, {}),
    (C["ek22"] - 0.9, "riser_9", -15, {"align": "start", "dur": 0.9}),
    (C["ek22"], "impact_chord", -8, {}),
    (C["ek22"] + 0.1, "light_sweep_magic", -12, {}),
    # still taking land from the sea: the Coastal Road
    (C["aajbhi"] - 0.15, "wh_magic_air", -8, {}),
    (C["aajbhi"], "waves_ocean", -27, {"align": "start", "skip": 8.0, "dur": C["kisne"] - C["aajbhi"]}),
    (C["zameen23"] - 0.1, "crane_motor", -20, {"align": "start", "skip": 5.0, "dur": 3.4}),
    (C["y2024"], "thud_low", -7, {}),
    (C["coastal"] - 0.1, "whoosh_sparkle", -11, {}),
    (C["ek25"] - 0.05, "counter_infographic", -16, {"align": "start", "dur": 0.9}),
    (C["hectare"] + 0.35, "ui_glassy_snap", -12, {}),
    # who lost the most? our Koli brothers
    (C["kisne"] - 0.2, "swell_soft", -12, {}),
    (C["wahi"] - 0.1, "wh_airy_soft", -9, {}),
    (C["wahi"], "gulls_harbour", -26, {"align": "start", "skip": 40.0, "dur": DURATION - C["wahi"]}),
    (C["wahi"] + 0.1, "waves_ocean", -27, {"align": "start", "skip": 20.0, "dur": DURATION - C["wahi"]}),
    (C["devi28"] - 0.05, "bowl_strike", -11, {"align": "start", "dur": DURATION - C["devi28"]}),
    (C["shahar28"] - 0.1, "shimmer_power", -12, {}),
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
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(layer[: len(m)] ** 2) + 1e-12))
        music += layer
    # a little lower under the storm (let it be heard) and for the Koli question at the end
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["samandar16"] + 0.3)) / 1.8, 0, 1) * 0.8 + np.clip((t_ax - C["kisne"] + 0.3) / 0.6, 0, 1) * 0.6
    music *= db(-MUSIC_DUCK * activity - 4.0 * np.clip(dip, 0, 1)[:, None])
    music = fade(music, 0.3, 2.0)

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


if __name__ == "__main__":
    main()
