"""Mix the Karl Bushby walk video: the creator's voice on top, an emotional score that breathes with the voice, small effects.

    python3 tools/mix_bushby.py        # writes public/bushby/audio/mix.wav

Cue times come from src/coochbehar/timing.json.
Ducking works like a sidechain compressor: while the voice speaks the music sits about 21 dB under it, and in every
pause it swells back to about 12 dB under (fast attack, slow release). Effects duck 4 dB under the voice.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "I Won't Surrender" (Michael Ramir C.), Mixkit free licence.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "bushby" / "audio"
T = json.load(open(ROOT / "src" / "bushby" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# the track builds steadily; starting 20 s in puts its biggest stretch on the Caspian and the homecoming
MUSIC = ("music_i_wont_surrender_mixkit.mp3", 20.0)
MUSIC_PAUSE, MUSIC_TALK = -10.0, -21.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"boom": 35, "subdrop": 30, "jungle": 120, "blizzard": 150, "ice_field": 80, "heartbeat": 30, "steps": 120, "paddle": 120}

CUES = [
    # the hook, on the globe
    (0.03, "punch", -9, {}), (0.05, "wh_big_tonal", -10, {}),
    (C["kasam2"] - 0.05, "ui_snap", -12, {}),
    (C["plan3"] - 0.05, "ui_pop", -12, {}),
    (C["n28"] - 0.25, "cross_out", -11, {}), (C["n28"], "stinger", -9, {}), (C["n28"] + 0.02, "boom", -12, {}),
    (C["kyon3"] - 0.05, "ui_perc", -11, {}),
    # Karl, 1998, no transport
    (C["karl4"] - 0.4, "wh_big_tonal", -8, {}),
    (C["y1998"] - 0.05, "punch", -10, {}),
    (C["chile4"], "steps", -22, {"align": "start", "dur": C["imtihan5"] - C["chile4"]}),
    (C["gaadi4"] + 0.25, "cross_out", -10, {}), (C["jahaz4"] + 0.25, "cross_out", -10, {}), (C["plane4"] + 0.25, "cross_out", -10, {}),
    # Darién Gap, Panama jail
    (C["imtihan5"] - 0.3, "wh_fast", -9, {}), (C["imtihan5"], "ui_snap", -12, {}),
    (C["darien5"] + 0.3, "wh_air", -11, {}),
    (C["jungle5"] - 0.2, "jungle", -20, {"align": "start", "dur": C["panama6"] - C["jungle5"] + 0.3}),
    (C["taskar5"], "ui_pop", -12, {}), (C["taskar5"] + 0.3, "ui_pop", -13, {}), (C["hathiyar5"], "ui_pop", -12, {}),
    (C["maut6"] - 0.05, "heartbeat", -15, {"align": "start", "skip": 1.0, "dur": 1.8}),
    (C["visa6"] - 0.05, "gate", -9, {}), (C["n18"] + 0.6, "boom", -12, {}),
    # Bering Strait, arrest
    (C["bering7"] - 0.4, "wh_big_tonal", -8, {}),
    (C["jamne7"] - 0.2, "blizzard", -21, {"align": "start", "skip": 10.0, "dur": C["russia7"] - C["jamne7"] + 0.8}),
    (C["siberia9"] - 0.2, "blizzard", -20, {"align": "start", "skip": 40.0, "dur": C["n11"] - C["siberia9"] + 1.5}),
    (C["n14"] - 0.1, "ice_crack", -11, {}), (C["barf7"], "ice_field", -19, {"align": "start", "skip": 3.0, "dur": 2.5}),
    (C["giraftar7"] - 0.05, "punch", -9, {}), (C["giraftar7"] + 0.02, "gate", -12, {}),
    # Russia: visas, ban, 11 years
    (C["russia8"], "wh_air", -11, {}), (C["n90"], "ui_snap", -12, {}),
    (C["exit8"], "wh_fast", -12, {}), (C["entry8"], "wh_fast", -12, {}),
    (C["ban9"] - 0.05, "braam", -9, {}), (C["ban9"], "punch", -10, {}),
    (C["n11"] - 0.05, "subdrop", -11, {}),
    # pandemic, Caspian
    (C["pandemic10"] - 0.1, "glitch", -14, {"dur": 0.7}), (C["sarhad10"], "gate", -12, {}),
    (C["caspian11"] - 0.3, "wh_big_tonal", -9, {}),
    (C["band11"] - 0.05, "boom", -12, {}),
    (C["kood12"] - 0.05, "splash", -8, {}),
    (C["n31"], "paddle", -22, {"align": "start", "skip": 4.0, "dur": C["turkey13"] - C["n31"]}),
    (C["n31"] - 0.05, "ui_snap", -12, {}), (C["n288"] - 0.05, "ui_snap", -12, {}),
    # Europe, Channel, England
    (C["turkey13"] - 0.3, "wh_fast", -9, {}), (C["europe13"] - 0.2, "wh_air", -11, {}),
    (C["channel13"] - 0.2, "splash", -12, {}),
    (C["england13"] - 0.05, "stinger", -10, {}),
    # 28 years, 50,000 km, home
    (C["n28b"] - 0.4, "riser", -14, {"align": "start", "dur": 0.5}), (C["n28b"], "wh_big_tonal", -9, {}),
    (C["n50k"] + 0.9, "chime_hit", -11, {}),
    (C["ghar14"] - 0.3, "wh_soft", -11, {}), (C["ghar14"] + 0.3, "steps", -22, {"align": "start", "skip": 3.0, "dur": 2.0}),
    (C["junoon15"] - 0.1, "ui_pop", -11, {}), (C["pagal15"] - 0.1, "ui_pop", -11, {}),
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
    # a short dip so the "28" slam and the BANNED hit land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["n28"] + 0.2)) / 0.8, 0, 1) + np.clip(1 - np.abs(t_ax - (C["ban9"] + 0.3)) / 0.8, 0, 1)
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
