"""Mix the UK weather video: the creator's voice on top, a light playful bed ("Summer Fun") that hands over to a war drum
for the battlefield of the four winds ("मौसम की जंग", line 7 to line 10), then the playful bed back for the end card and
the close. An effect on every visual hit (the India fill and monsoon, the whip to Britain, the thunder, the flight, the
tourist, rain, fog, sun, hail and wind, the calendar flips, the ellipse and its strike, the tilt and the country tags,
Colombia, the bars, the giant word, the ribbons, the halo, the four arrows and their collision, the Gulf Stream, the
moisture and rain, the air-mass tags, the winner, the send button).

    python3 tools/mix_ukweather.py        # writes public/ukweather/audio/mix.wav

Cue times come from src/ukweather/edit/timing.json. Ducking works like a sidechain compressor (music about 21 dB under
the voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Summer Fun" and "Epical Drums 02", Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "ukweather" / "audio"
VO = ROOT / "public" / "ukweather" / "vo" / "ukweather_vo.mp3"
T = json.load(open(ROOT / "src" / "ukweather" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]
SC = {"flight": C["socho2"] - 0.1, "tourist": C["london2"] + 0.35, "wind": C["hawa2"] - 0.05, "tilt0": C["duniya5"] - 0.25, "tilt1": C["pehle5"] - 0.1,
      "battle": C["kyunki7"] - 0.2, "gulf": C["pashchim8"] - 0.15, "winds": C["uttar9"] - 0.2}

# (file, offset into the file): playful → the battle drums → playful again
MUSIC = [("music_summer_fun_mixkit.mp3", 0.0), ("music_epical_drums_02_mixkit.mp3", 8.0), ("music_summer_fun_mixkit.mp3", 50.0)]
MUSIC_CUTS = [0.0, SC["battle"], C["jeet10"] - 0.2]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"boom": 35, "drum_hit_big": 35, "thunder_impact": 40, "thunder_crash": 40, "jet_pass": 60, "wind_howl": 120, "rain_light": 150, "amb_jungle_thunderstorm": 120}

FLASHES = [SC["flight"], SC["tilt0"], SC["tilt1"]]
CUES = [
    # line 1: India, the monsoon, the whip to Britain, the red fill, बेहिसाब and the thunder
    (0.2, "whoosh_sparkle", -15, {}), (0.5, "pop_high", -14, {}), (1.0, "rain_light", -24, {"dur": 2.8}), (C["bharosa1"], "toon_boing", -14, {}),
    (C["par1"], "whoosh_cinematic_fast", -11, {}), (C["britain1"] + 0.1, "wh_big_tonal", -13, {}), (C["britain1"] + 0.3, "pop_high", -14, {}),
    (C["britain1"] + 0.2, "rain_light", -22, {"dur": 2.4}), (C["hisaab1"], "impact_chord", -12, {}), (C["hisaab1"] + 0.25, "thunder_impact", -11, {}),
    # line 2: the flight, Mumbai, London, the tourist, the day of weather, the wind
    (SC["flight"] - 0.05, "light_transition_magic", -15, {}), (C["socho2"], "jet_pass", -15, {"dur": 2.4, "align": "start"}), (C["mumbai2"], "pop_high", -15, {}),
    (C["london2"] - 0.1, "pop_high", -14, {}), (C["london2"] + 0.2, "whoosh_cinematic_fast", -12, {}), (SC["tourist"], "pop_light", -13, {}), (SC["tourist"] + 0.3, "toon_boing", -15, {}),
    (C["subah2"] - 0.05, "ui_snap", -15, {}), (C["subah2"] + 0.25, "ui_pop", -15, {}),
    (C["baarish2"] - 0.1, "rain_light", -17, {"dur": 2.0}), (C["baarish2"], "thunder_crash", -18, {}),
    (C["kohra2"] - 0.45, "ui_snap", -15, {}), (C["kohra2"] - 0.1, "swoosh_windy", -15, {}),
    (C["dhoop2"] - 0.45, "ui_snap", -15, {}), (C["dhoop2"] + 0.05, "chime_hit", -14, {}),
    (C["n10_2"] - 0.05, "ui_snap", -15, {}), (C["ole2"] - 0.05, "toon_whoosh", -15, {}), *[(C["ole2"] + 0.05 + i * 0.09, "pop_light", -21, {}) for i in range(8)],
    (SC["wind"], "wh_wind_gust", -12, {}), (SC["wind"] + 0.2, "wind_howl", -17, {"dur": 1.8}), (SC["wind"] + 0.75, "toon_whoosh", -14, {}), (C["free2"], "pop_high", -13, {}),
    # line 3: Scotland, the calendar, the ellipse, नहीं
    (C["scotland3"] - 0.2, "whoosh_cinematic_fast", -13, {}), (C["scotland3"] + 0.1, "pop_high", -14, {}),
    (C["n250_3"] - 0.68, "toon_whoosh", -14, {}), *[(C["n250_3"] - 0.45 + i * 0.05, "page_turn", -22, {}) for i in range(9)], (C["n250_3"], "pop_high", -13, {}),
    *[(C["n250_3"] + 0.35 + i * 0.035, "typewriter_click", -21, {}) for i in range(10)],
    (C["dekh3"] + 0.05, "ui_wipe", -15, {}), *[(C["dekh3"] + 0.3 + i * 0.05, "typewriter_click", -21, {}) for i in range(10)],
    (C["nahi4"] - 0.05, "pen_cross", -13, {}), (C["nahi4"] + 0.05, "drum_hit_big", -13, {}),
    # line 5: the tilt and the 73 tags, Colombia, 3,240, the bars, गर्म मौसम, the Pacific, the Andes
    (SC["tilt0"], "whoosh_cinematic_fast", -12, {}), (C["n70_5"], "counter_ticking", -17, {"dur": 1.6}), *[(C["n70_5"] + 0.1 + i * 0.12, "pop_light", -22, {}) for i in range(12)],
    (C["britain5"], "pop_high", -13, {}), (SC["tilt1"], "wh_big_tonal", -13, {}), (C["pehle5"], "impact_chord", -13, {}),
    (C["colombia5"] - 0.1, "whoosh_sparkle", -14, {}), (C["colombia5"] + 0.1, "pop_high", -14, {}),
    (C["n3240_5"], "counter_ticking", -16, {"dur": 0.8}), (C["n3240_5"] + 0.8, "ui_glassy_snap", -14, {}), (C["n3240_5"] + 0.75, "ui_wipe", -16, {}),
    (C["garm5"] - 0.1, "wh_fast", -13, {}), (C["pacific5"], "whoosh_sparkle", -15, {}), (C["pahaad5"], "toon_whoosh", -14, {}),
    # Null, the battlefield, the four arrows, the collision
    (C["toh6"] - 0.15, "ui_wipe", -15, {}), (C["kyunki7"] - 0.2, "ui_wipe", -15, {}), (C["jang7"] - 0.25, "braam", -12, {}), (C["jang7"], "drum_hit_big", -13, {}),
    *[(C["chaar7"] - 0.15 + i * 0.117, "wh_fast", -15, {}) for i in range(4)], (C["takrati7"], "boom", -11, {}), (C["takrati7"] + 0.02, "thunder_impact", -13, {}),
    # line 8: the Gulf Stream, sponsor, the name, warm sea, moisture, rain
    (SC["gulf"], "whoosh_cinematic_fast", -12, {}), (C["pashchim8"] + 0.1, "swoosh_windy", -14, {}), (C["sponsor8"], "pop_high", -13, {}),
    *[(C["gulf8"] - 0.1 + i * 0.05, "typewriter_click", -20, {}) for i in range(11)], (C["nami8"] - 0.55, "whoosh_cinematic_fast", -11, {}),
    (C["garm8"], "ui_pop", -14, {}), (C["nami8"], "wind_howl", -18, {"dur": 2.6}), (C["barsa8"] - 0.1, "rain_light", -15, {"dur": 1.6}), (C["barsa8"], "thunder_crash", -17, {}),
    # line 9: the air masses
    (SC["winds"], "whoosh_cinematic_fast", -13, {}), (SC["winds"] + 0.1, "pop_high", -15, {}),
    (C["uttar9"] + 0.05, "wh_wind_gust", -15, {}), (C["uttar9"] + 0.15, "pop_high", -14, {}),
    (C["dakshin9"] + 0.05, "wh_fast", -15, {}), (C["dakshin9"] + 0.15, "pop_high", -14, {}),
    (C["poorab9"] + 0.05, "wh_fast", -15, {}), (C["poorab9"] + 0.15, "pop_high", -14, {}),
    # line 10: the winner, आज का मौसम
    *[(C["jeet10"] + 1.6 * ((i / 9) ** 2), "ui_snap", -17, {}) for i in range(10)], (C["mausam10"], "chime_hit", -13, {}),
    # the close: the send button and the umbrella plane
    (C["video11"] - 0.2, "ui_wipe", -15, {}), (C["video11"], "pop_high", -14, {}), (C["chhata11"] + 0.4, "toon_whoosh", -13, {}),
    *[(p - 0.05, "light_transition_magic", -15, {}) for p in FLASHES],
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(VO, VOICE_CHAIN)[:n]
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

    # three sections, crossfaded over 0.5 s, matched in loudness
    music = np.zeros((n, 2), np.float32)
    ref = None
    edges = MUSIC_CUTS + [DURATION]
    for (f, off), s0, s1 in zip(MUSIC, edges[:-1], edges[1:]):
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
    # short dips so बेहिसाब, नहीं, number one and the collision land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["hisaab1"], C["nahi4"], C["pehle5"], C["takrati7"]))
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
