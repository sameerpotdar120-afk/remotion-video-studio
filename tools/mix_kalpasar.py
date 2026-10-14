"""Mix the Kalpasar video: the creator's voice on top, a hopeful score for the dream that cuts to a tense one on the twist, effects on every beat.

    python3 tools/mix_kalpasar.py        # writes public/kalpasar/audio/mix.wav

Cue times come from src/kalpasar/timing.json.
Ducking works like a sidechain compressor: while the voice speaks the music sits about 21 dB under it, and in every
pause it swells back to about 12 dB under (fast attack, slow release). Effects duck 4 dB under the voice.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Skyline" and "Vertigo" (Eugenio Mininni), Mixkit free licence.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "kalpasar" / "audio"
T = json.load(open(ROOT / "src" / "kalpasar" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = ("music_skyline_mixkit.mp3", 10.0)
MUSIC2 = ("music_vertigo_mixkit.mp3", 20.0)  # from the record scratch on "पर…"
MUSIC_PAUSE, MUSIC_TALK = -10.0, -21.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "heartbeat": 30, "river": 120, "gush": 120, "waves": 80, "waves_soft": 80, "thunder": 40, "wind_dry": 150, "mud": 100, "train": 80, "clock": 200}

CUES = [
    # the hook: India, the dive, the wall slams across the gulf
    (0.03, "wh_big_tonal", -10, {}), (0.05, "punch", -12, {}),
    (C["n60"] - 0.3, "wh_fast", -10, {}), (C["deewar1"] - 0.02, "metal_thud", -7, {}), (C["deewar1"], "boom", -11, {}),
    (C["kyu1"] - 0.05, "ui_perc", -11, {}),
    # the farmer: dry wind, cracking earth, salt
    (C["socho2"] - 0.1, "wh_air", -11, {}), (C["socho2"] + 0.2, "ui_pop", -13, {}),
    (C["baarish3"] - 0.2, "wind_dry", -20, {"align": "start", "dur": C["door4"] - C["baarish3"] + 0.2}),
    (C["kuen3"], "crack", -12, {}), (C["khaara3"], "magic", -18, {"dur": 0.8}), (C["pyaase3"] - 0.05, "heartbeat", -16, {"align": "start", "skip": 1.0, "dur": 1.6}),
    # the rivers pour into the gulf and are lost to the sea
    (C["door4"] - 0.15, "wh_fast", -10, {}),
    (C["saamne5"] - 0.2, "river", -21, {"align": "start", "skip": 5.0, "dur": C["tabhi6"] - C["saamne5"] + 0.2}),
    (C["mahi5"], "pop_high", -13, {}), (C["sabarmati5"], "pop_high", -13, {}), (C["dhadhar5"], "pop_high", -13, {}),
    (C["hazaron5"], "ui_snap", -12, {}), (C["khaare5"] - 0.1, "splash", -11, {}),
    # the idea (Null), the pencil line
    (C["tabhi6"] - 0.2, "wh_soft", -11, {}), (C["idea6"] - 0.05, "kalimba", -11, {}),
    # Kalpasar: the wall builds west to east
    (C["kalpasar7"] - 0.3, "riser", -15, {"align": "start", "dur": 0.4}), (C["kalpasar7"], "stinger", -10, {}),
    (C["bhavnagar8"], "pop_high", -12, {}), (C["bharuch8"], "pop_high", -12, {}),
    (C["aarpaar8"] - 0.3, "metal_thud", -12, {}), (C["km8"] - 0.1, "ui_snap", -11, {}), (C["km8"] + 0.5, "chime_hit", -14, {}),
    # tide and gates
    (C["bharti9"] - 0.2, "waves", -20, {"align": "start", "skip": 10.0, "dur": C["aaj10"] - C["bharti9"] + 0.3}),
    (C["band9"] - 0.05, "metal_thud", -11, {}), (C["khulenge9"] - 0.05, "metal_thud", -11, {}), (C["khulenge9"] + 0.1, "gush", -15, {"align": "start", "skip": 3.0, "dur": 3.5}),
    (C["bahar9"] - 0.1, "splash", -14, {}), (C["andar9"] - 0.1, "toon_whoosh", -14, {}),
    # the lake, the canals, 9 districts
    (C["aaj10"] - 0.2, "wh_soft", -11, {}), (C["n1600"] - 0.1, "chime_hit", -12, {}), (C["bharat10"], "ui_pop", -13, {}),
    (C["kisan10"] - 0.2, "wh_air", -11, {}), (C["n9"], "pop_high", -12, {}), (C["n9"] + 0.3, "pop_high", -13, {}),
    # highway, railway, the short way
    (C["bonus11"] - 0.2, "wh_fast", -10, {}), (C["lane11"], "ui_snap", -12, {}),
    (C["railway11"] - 0.3, "train", -18, {"align": "start", "skip": 12.0, "dur": 2.6}),
    (C["surat11"] - 0.2, "wh_air", -12, {}), (C["n356"], "ui_perc", -12, {}), (C["n177"], "chime_hit", -12, {}),
    # the twist: the record scratch, the storm, the tide, the mud
    (C["par12"] - 0.15, "scratch", -6, {}), (C["par12"] + 0.05, "thunder", -14, {"align": "start", "dur": 4.0}),
    (C["haar12"] - 0.1, "braam", -12, {}),
    (C["jwaar13"] - 0.2, "waves", -15, {"align": "start", "skip": 40.0, "dur": 3.6}), (C["n10m"], "boom", -11, {}),
    (C["zameen13"] - 0.1, "wh_soft", -12, {}), (C["daldal13"] - 0.1, "mud", -15, {"align": "start", "skip": 10.0, "dur": 1.8}),
    # 50 years, the file, the brick, the cost
    (C["n50b"] - 0.1, "clock", -17, {"align": "start", "skip": 2.0, "dur": 1.6}), (C["file14"] + 0.15, "thud", -6, {}), (C["file14"] + 0.18, "punch", -10, {}),
    (C["eent14"] - 0.05, "brick", -9, {}),
    (C["cost14"] + 0.2, "coins", -12, {}), (C["lakh14"] - 0.05, "register", -10, {}), (C["lakh14"], "subdrop", -12, {}),
    # the name, the farmer waiting, the question (Null)
    (C["naam15"] - 0.2, "wh_soft", -11, {}), (C["kalpasar15"], "chime_hit", -12, {}),
    (C["kisan16"] - 0.2, "waves_soft", -22, {"align": "start", "skip": 8.0, "dur": DURATION - C["kisan16"]}),
    (C["banega16"] - 0.3, "wh_soft", -12, {}), (C["kalpana16"], "magic", -13, {"dur": 1.2}),
    (C["haan17"], "ui_pop", -11, {}), (C["naa17"], "ui_pop", -11, {}),
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

    # the dream score until the record scratch on "पर…", then the tense score
    cut = int((C["par12"] - 0.12) * SR)
    music = np.zeros((n, 2), np.float32)
    f, off = MUSIC
    m = ff(AUD / f, "anull")[int(off * SR):][:cut]
    music[: len(m)] = fade(m.copy(), 0.25, 0.08)
    f2, off2 = MUSIC2
    m2 = ff(AUD / f2, "anull")[int(off2 * SR):][: n - cut]
    m2 *= np.sqrt(np.mean(m ** 2) / (np.mean(m2 ** 2) + 1e-12)) * db(1.5)
    music[cut: cut + len(m2)] = fade(m2.copy(), 0.6, 0.2)
    m = music
    music *= db(v_ref - 10 * np.log10(np.mean(music[: len(m)] ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    # short dips so the wall slam and the scratch land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["deewar1"] + 0.2)) / 0.8, 0, 1) + np.clip(1 - np.abs(t_ax - (C["par12"] + 0.4)) / 1.0, 0, 1)
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
