"""Mix the Cooch Behar enclaves video: the creator's voice on top, an emotional score that breathes with the voice, small effects.

    python3 tools/mix_coochbehar.py        # writes public/coochbehar/audio/mix.wav

Cue times come from src/coochbehar/timing.json.
Ducking works like a sidechain compressor: while the voice speaks the music sits about 21 dB under it, and in every
pause it swells back to about 12 dB under (fast attack, slow release). Effects duck 4 dB under the voice.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Possible Dreams" (Eugenio Mininni), Mixkit free licence.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "coochbehar" / "audio"
T = json.load(open(ROOT / "src" / "coochbehar" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# the track's break ends at 113 s and the full theme comes back: that lands on "31 July 2015"
MUSIC = ("music_possible_dreams_mixkit.mp3", 113.0 - C["n31"])
MUSIC_PAUSE, MUSIC_TALK = -10.0, -21.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"boom": 35, "subdrop": 30, "night": 120, "village_day": 120, "kids": 150, "wind_wire": 150, "heartbeat": 30, "gong": 40}

CUES = [
    # the hook
    (0.03, "punch", -9, {}),
    (0.05, "wh_big_tonal", -10, {}),
    (C["n111"] - 0.35, "wh_fast", -9, {}),
    (C["n111"] + 0.4, "ui_snap", -11, {}),
    (C["bd1"] - 0.5, "riser", -15, {"align": "start", "dur": 0.9}),
    (C["bd1"] - 0.1, "ui_pop", -12, {}), (C["bd1"] + 0.15, "ui_pop", -13, {}), (C["bd1"] + 0.35, "ui_pop", -14, {}),
    (C["n111"] + 0.3, "village_day", -24, {"align": "start", "skip": 5.0, "dur": C["raat2"] - C["n111"] - 0.1}),
    # night: sleep in one country, wake in another
    (C["raat2"] - 0.2, "wh_soft", -11, {}),
    (C["raat2"] - 0.1, "night", -20, {"align": "start", "skip": 2.0, "dur": C["kahani3"] - C["raat2"] + 0.3}),
    (C["jaage2"] - 0.1, "chime_hit", -12, {}),
    (C["kyon2"] - 0.05, "stinger", -10, {}),
    (C["kyon2"] + 0.05, "boom", -12, {}),
    # Cooch Behar, 162
    (C["kahani3"] - 0.3, "wh_big_tonal", -9, {}),
    (C["cooch3"], "ui_pop", -12, {}),
    (C["border3"] - 0.05, "wh_air", -13, {}),
    (C["lakeer3"] + 0.35, "cross_out", -11, {}),
    (C["n162"] - 0.1, "glitch", -16, {"dur": 0.5}),
    (C["n162"], "punch", -11, {}),
    (C["n162"] + 0.3, "ui_perc", -14, {}),
    # Dahala Khagrabari: the dive
    (C["anokha4"] - 0.1, "riser_long", -16, {"align": "start", "skip": 2.5, "dur": C["dahala4"] - C["anokha4"] + 0.5}),
    (C["dahala4"] + 0.45, "wh_big_tonal", -8, {}),
    (C["khet5"] + 0.1, "ui_snap", -12, {}),
    (C["charon5"], "wh_air", -13, {}),
    (C["bd5"], "ui_pop", -12, {}),
    (C["bharat6"] + 0.1, "wh_air", -13, {}),
    (C["ghira6"], "ui_pop", -12, {}),
    (C["poore6"], "wh_soft", -11, {}),
    # यानी… चक्रव्यूह
    (C["yaani7"], "ui_perc", -13, {}), (C["doosra7"] - 0.1, "ui_perc", -13, {}), (C["pehla7"] - 0.1, "ui_perc", -13, {}),
    (C["duniya7"] - 0.05, "stinger", -10, {}),
    (C["duniya7"] + 0.4, "riser", -16, {"align": "start", "dur": C["chakra7"] - C["duniya7"] - 0.3}),
    (C["chakra7"] - 0.05, "braam", -10, {}),
    # the legend
    (C["kehte8"], "wh_big_tonal", -10, {}),
    (C["shatranj8"], "chess", -9, {}),
    (C["daanv8"], "chess", -10, {}),
    # 1947
    (C["y1947"] - 0.05, "punch", -8, {}),
    (C["y1947"], "subdrop", -10, {}),
    (C["batware9"] - 0.2, "wind_wire", -20, {"align": "start", "skip": 4.0, "dur": C["sochiye10"] - C["batware9"] + 0.3}),
    (C["phans9"], "boom", -12, {}),
    # 68 years
    (C["sochiye10"] - 0.2, "wh_soft", -12, {}),
    (C["n68"], "ui_snap", -12, {}),
    (C["n51k"], "ui_snap", -12, {}),
    (C["pehchan10"], "glitch", -13, {"dur": 0.7}),
    (C["sarkar11"] + 0.3, "cross_out", -10, {}),
    (C["bd11"] + 0.4, "cross_out", -10, {}),
    (C["bachche12"] - 0.1, "kids", -24, {"align": "start", "skip": 10.0, "dur": C["bukhar12"] - C["bachche12"]}),
    (C["school12"] + 0.35, "cross_out", -10, {}),
    (C["bukhar12"] - 0.15, "wh_air", -13, {}),
    (C["sarhad12"] - 0.4, "night", -24, {"align": "start", "skip": 20.0, "dur": C["phir13"] - C["sarhad12"] + 0.4}),
    (C["jaan12"] - 0.1, "heartbeat", -16, {"align": "start", "skip": 1.0, "dur": C["phir13"] - C["jaan12"] + 0.1}),
    # 31 July 2015, midnight
    (C["phir13"] - 0.1, "clock", -18, {"align": "start", "skip": 3.0, "dur": C["aadhi13"] - C["phir13"] + 0.3}),
    (C["n31"] - 0.05, "punch", -10, {}),
    (C["aadhi13"] + 0.1, "gong", -13, {"align": "start", "dur": 2.4}),
    (C["itihas13"] - 0.4, "riser", -14, {"align": "start", "dur": 0.5}),
    (C["itihas13"], "subdrop", -10, {}),
    (C["itihas13"] + 0.05, "chime_hit", -11, {}),
    (C["itihas13"] + 0.6, "applause", -24, {"align": "start", "dur": 3.2}),
    (C["nakshe13"], "wh_air", -12, {}),
    (C["parivar14"] - 0.1, "night", -26, {"align": "start", "skip": 40.0, "dur": C["n1000"] - C["parivar14"]}),
    (C["zameen15"] - 0.15, "wh_soft", -11, {}),
    (C["desh15"] - 0.1, "boom", -13, {}),
    # the choice
    (C["n1000"] - 0.1, "wh_big_tonal", -9, {}),
    (C["n1000"] + 0.55, "ui_snap", -11, {}),
    (C["tirange16"] - 0.15, "chime_hit", -11, {}),
    (C["mitti16"], "wh_soft", -13, {}),
    # the question
    (C["sach17"] + 0.4, "wh_air", -12, {}),
    (C["ghar17"] - 0.1, "ui_pop", -11, {}),
    (C["desh17"] - 0.1, "ui_pop", -11, {}),
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

    f, off = MUSIC
    m = ff(AUD / f, "anull")[int(off * SR):][:n]
    music = np.zeros((n, 2), np.float32)
    music[: len(m)] = m
    music *= db(v_ref - 10 * np.log10(np.mean(music[: len(m)] ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    # a short dip so the 1947 hit and the midnight gong land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["y1947"] + 0.2)) / 0.8, 0, 1) + np.clip(1 - np.abs(t_ax - (C["aadhi13"] + 0.5)) / 0.9, 0, 1)
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    music = fade(music, 0.25, 2.5)

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
    quiet = ~talking
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music talking {rms(music[talking]):.1f}  music pauses {rms(music[quiet]):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
