"""Mix the Super El Niño video: the creator's voice clearly on top, a low film-score bed, effects on the beats.

    python3 tools/mix_elnino.py        # writes public/elnino/audio/mix.wav

Cue times come from src/elnino/timing.json (aligned to the voiceover), so the mix follows the voice like the
animation. Levels are relative to the average speech level (loudest 50 ms of each effect). The reference sits its
bed ~15.6 LU under the voice; this mix keeps the bed lower (voice clarity first) but keeps the reference's hit levels.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Tapis" (Eugenio Mininni) and "Epical Drums 02"
(Grigoriy Nuzhny), Mixkit free licence.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "elnino" / "audio"
T = json.load(open(ROOT / "src" / "elnino" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, start offset in the track, level vs voice dB, from second, to second)
MUSIC = [
    ("music_tapis_mixkit.mp3", 6.0, -21.0, 0.0, DURATION),
    ("music_epical_drums_02_mixkit.mp3", 12.0, -29.0, C["bas"] - 0.2, DURATION),
]
MUSIC_DUCK, SFX_DUCK = 5.0, 3.0
HPF = {"ac_hum": 120, "fire_crackle": 200, "rain_light": 180, "projector": 150, "boom_low": 35, "thud_low": 45, "bass_down": 40,
       "drum_hit_big": 45, "wh_wind_gust": 140, "wh_airy_medium": 120, "thunder_distant": 60, "thunder_crash": 50}

CUES = [
    # सोचो… the AC on the coast, running
    (0.3, "ui_pop_high", -12, {}),
    (0.55, "beep_on", -15, {}),
    (0.5, "ac_hum", -24, {"align": "start", "skip": 2.0, "dur": C["band"] - 0.45}),
    (0.75, "wh_air_smooth", -10, {}),
    (C["pacific"], "ui_glassy_snap", -14, {}),
    # AC अचानक बंद: beep, spark, clunk
    (C["band"], "beep_off", -10, {}),
    (C["band"] + 0.02, "spark_shock", -6, {}),
    (C["band"] + 0.12, "thud_low", -10, {}),
    (C["band"] + 0.3, "bass_down", -12, {}),
    # flash-forward to the burning planet
    (C["agla"] - 0.25, "wh_big_subtle_tonal", -4, {}),
    (C["agla"] + 0.05, "impact_chord", -5, {}),
    (C["agla"] + 0.05, "fire_whoosh", -9, {}),
    (C["agla"], "fire_crackle", -24, {"align": "start", "dur": C["naam"] - C["agla"]}),
    (C["garmsaal"], "ui_glassy_snap", -13, {}),
    # नाम है सुपर एल नीनो
    (C["naam"] - 0.15, "wh_magic_air", -4, {}),
    (C["super"], "boom_low", -6, {}),
    (C["super"], "drum_hit_big", -7, {}),
    (C["elnino"], "thud_low", -8, {}),
    (C["elnino"] + 0.05, "shimmer_power", -12, {}),
    # इतिहास का सबसे खतरनाक: rewind, ticker, warning
    (C["itihas"] - 0.1, "wh_vacuum", -9, {}),
    (C["itihas"] + 0.3, "counter_infographic", -18, {"align": "start", "dur": C["khatarnak"] - C["itihas"] + 0.8}),
    (C["khatarnak"], "braam_dark", -6, {}),
    (C["khatarnak"], "ui_pop_high", -12, {}),
    # ये AC हैं हवाएँ, ट्रेड विंड्स
    (C["ac2"] - 0.1, "ui_pop_high", -12, {}),
    (C["ac2"] + 0.2, "beep_on", -16, {}),
    (C["hawayen"], "wh_wind_gust", -6, {}),
    (C["trade"], "wh_airy_medium", -9, {}),
    (C["trade"] + 0.1, "ui_perc_snap", -13, {}),
    (C["purab"], "wh_infographic_slide", -10, {}),
    (C["paschim"], "ui_glassy_snap", -12, {}),
    # warm water west, rain
    (C["garm"] - 0.1, "wh_airy_soft", -9, {}),
    (C["indo"], "ui_pop_high", -12, {}),
    (C["barish"] - 0.1, "thunder_distant", -10, {}),
    (C["barish"] - 0.1, "rain_light", -23, {"align": "start", "dur": C["peru"] - C["barish"]}),
    # whip east to Peru: cold, dry
    (C["peru"] - 0.1, "wh_fast", -5, {}),
    (C["thanda4"], "ui_glassy_snap", -13, {}),
    (C["sukha"] - 0.1, "shimmer_power", -14, {}),
    (C["sukha"], "ui_pop_high", -12, {}),
    # winds weaken, warm water back east, thermometers
    (C["lekin"], "wh_air_smooth", -10, {}),
    (C["y27"], "ui_perc_snap", -12, {}),
    (C["kamzor"], "bass_down", -10, {}),
    (C["garm5"], "wh_airy_medium", -9, {}),
    (C["ekdo"] - 0.2, "ui_pop_high", -13, {}),
    (C["ekdo"], "ui_pop_high", -13, {}),
    (C["degree"] - 0.1, "ui_pop_high", -12, {}),
    (C["ekdo"], "ui_readout", -16, {}),
    # बस दुनिया भर का मौसम बिगड़ जाता है (the loudest hit, as in the reference)
    (C["bas"] - 0.12, "wh_big_subtle_tonal", -3, {}),
    (C["bigad"] - 0.05, "boom_low", -2, {}),
    (C["bigad"] - 0.05, "impact_chord", -4, {}),
    (C["bigad"], "fire_whoosh", -8, {}),
    # पेरू में बाढ़, ऑस्ट्रेलिया में सूखा
    (C["peru7"] - 0.1, "wh_magic_air", -4, {}),
    (C["baadh"], "splash", -7, {}),
    (C["aus7"] - 0.05, "wh_fast", -8, {}),
    (C["sukha7"], "ui_pop_high", -12, {}),
    (C["sukha7"] + 0.1, "shimmer_power", -14, {}),
    # भारत: monsoon, then failing
    (C["bharat"], "wh_airy_soft", -8, {}),
    (C["bharat"] + 0.5, "thunder_distant", -12, {}),
    (C["monsoon"] - 0.3, "rain_light", -23, {"align": "start", "dur": C["kamzor8"] - C["monsoon"] + 0.9}),
    (C["kamzor8"], "bass_down", -12, {}),
    # 13 प्रतिशत
    (C["issaal"] - 0.3, "wh_air_smooth", -8, {}),
    (C["p13"], "counter_infographic", -16, {"align": "start", "dur": 0.9}),
    (C["p13"] + 0.9, "thud_low", -9, {}),
    (C["kam"], "ui_glassy_snap", -12, {}),
    # 1876: the film strip
    (C["y1876"] - 0.1, "wh_transition049", -6, {}),
    (C["y1876"] - 0.1, "projector", -17, {"align": "start", "dur": C["akele"] - C["y1876"]}),
    (C["y1876"] + 0.05, "thud_low", -8, {}),
    (C["akaal"], "braam_slow", -8, {}),
    (C["akaal"], "ui_perc_snap", -14, {}),
    (C["akaal"] + 0.32, "ui_perc_snap", -14, {}),
    (C["akaal"] + 0.64, "ui_perc_snap", -14, {}),
    (C["lakh50"] - 0.1, "counter_infographic", -16, {"align": "start", "dur": 1.0}),
    (C["lakh50"] + 0.9, "boom_low", -8, {}),
    # और अब समंदर 3 डिग्री
    (C["ab"] - 0.15, "wh_fast", -5, {}),
    (C["d3"] - 0.3, "ui_pop_high", -12, {}),
    (C["d3"], "riser_9", -12, {}),
    (C["d3"], "ui_readout", -15, {}),
    # heat rises, 2027
    (C["garmi"], "fire_whoosh", -6, {}),
    (C["garmi"], "riser_trailer", -14, {"align": "start", "dur": C["y2027"] - C["garmi"] + 0.2}),
    (C["dharti"], "fire_crackle", -24, {"align": "start", "dur": DURATION - C["dharti"]}),
    (C["y2027"], "impact_chord", -3, {}),
    (C["y2027"], "boom_low", -5, {}),
    (C["y2027"] + 0.02, "drum_hit_big", -6, {}),
    (C["sabsegarm"] - 0.3, "wh_big_subtle_tonal", -8, {}),
    # क्या हम रेडी हैं?
    (C["kya"] - 0.1, "ui_pop_high", -10, {}),
    (C["kya"], "swell_tonal", -14, {}),
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
    for f, off, lvl, t0, t1 in MUSIC:
        m = ff(AUD / f, "anull")[int(off * SR):]
        layer = np.zeros((n, 2), np.float32)
        s0, s1 = int(t0 * SR), int(t1 * SR)
        seg = m[: s1 - s0]
        layer[s0 : s0 + len(seg)] = seg
        body = layer[s0 : s0 + len(seg)]
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(body**2) + 1e-12))
        layer[s0 : s0 + len(seg)] = fade(layer[s0 : s0 + len(seg)], 0.6 if t0 > 0 else 0.2, 1.5)
        music += layer
    music *= db(-MUSIC_DUCK * activity)

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
