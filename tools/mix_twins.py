"""Mix the Twin countries video: the creator's voice on top, a playful score that breathes with the voice, cartoon effects on the gags.

    python3 tools/mix_twins.py        # writes public/twins/audio/mix.wav

Cue times come from src/twins/timing.json.
Ducking works like a sidechain compressor: while the voice speaks the music sits about 21 dB under it, and in every
pause it swells back to about 12 dB under (fast attack, slow release). Effects duck 4 dB under the voice.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Kidding Around" (Ahjay Stelino), Mixkit free licence.
slide_up, slide_down (sine glides) and drumroll (noise bursts) were synthesised in code with numpy.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "twins" / "audio"
T = json.load(open(ROOT / "src" / "twins" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = ("music_kidding_around_mixkit.mp3", 0.0)
MUSIC_PAUSE, MUSIC_TALK = -9.0, -20.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "toon_bassdown": 30}

CUES = [
    # the hook: Italy and its twin pop up, the camera pulls out, the magnifying glass sweeps
    (0.03, "toon_pops", -10, {}), (0.05, "punch", -12, {}),
    (C["maps1"] + 0.1, "toon_swoosh", -10, {}),
    (C["notice1"] - 0.45, "toon_whoosh", -11, {}), (C["notice1"] + 0.05, "magic", -15, {"dur": 1.2}),
    (C["judwa2"] - 0.05, "toon_pops", -10, {}), (C["judwa2"] + 0.1, "kalimba", -12, {}),
    # 1: Thailand flips onto Myanmar's side
    (C["pehla3"] - 0.25, "wh_fast", -9, {}), (C["pehla3"], "punch", -10, {}), (C["pehla3"] + 0.02, "ui_snap", -12, {}),
    (C["thai3"], "pop_high", -12, {}), (C["myan3"], "pop_high", -12, {}),
    (C["thai4"] + 0.1, "toon_boing", -11, {}),
    (C["palat4"] + 0.05, "card_flip", -9, {}), (C["palat4"] + 0.1, "toon_spin", -13, {"dur": 0.9}),
    (C["samne4"] - 0.2, "toon_swoosh", -11, {}),
    (C["same4"] + 0.25, "toon_hit", -9, {}), (C["saanche4"] + 0.05, "toon_hit", -9, {}),
    # 2: west to Africa, Benin and Togo
    (C["doosra5"] - 0.25, "wh_fast", -9, {}), (C["doosra5"], "punch", -10, {}),
    (C["benin5"], "pop_high", -12, {}), (C["togo5"], "pop_high", -12, {}),
    (C["kandhe6"] - 0.1, "toon_pops", -12, {}), (C["kandhe6"] + 0.3, "squeak", -12, {}),
    (C["lambe6"] - 0.05, "slide_up.wav", -12, {}), (C["patle6"] - 0.05, "slide_down.wav", -12, {}),
    (C["suno6"], "ui_snap", -13, {}),
    (C["togo6"] - 0.1, "wh_air", -11, {}),
    (C["n56"] - 0.6, "toon_whoosh", -12, {}), (C["n56"] + 0.6, "chime_hit", -13, {}),
    # 3: Italy's boot, Vietnam's boot, the football
    (C["teesra7"] - 0.25, "wh_fast", -9, {}), (C["teesra7"], "punch", -10, {}),
    (C["italy7"], "pop_high", -12, {}), (C["boot7"] + 0.15, "toon_hit", -10, {}),
    (C["hazaron8"] + 0.1, "wh_big_tonal", -9, {}),
    (C["vietnam8"], "pop_high", -12, {}), (C["boot8"] + 0.15, "toon_hit", -9, {}), (C["boot8"] + 0.3, "toon_boing", -12, {}),
    (C["farak8"] - 0.1, "wh_fast", -10, {}),
    (C["football8"], "toon_boing", -10, {}),
    (C["laat8"] - 0.02, "kick", -7, {}), (C["laat8"] + 0.05, "toon_whoosh", -10, {}), (C["laat8"] + 0.95, "toon_dizzy", -12, {}),
    # 4: the drumroll, Norway and Chile, the mirror
    (C["asli9"] - 0.1, "toon_bassdown", -11, {}), (C["asli9"] + 0.05, "drumroll.wav", -11, {"align": "start"}),
    (C["norway10"], "punch", -10, {}), (C["norway10"] + 0.02, "pop_high", -12, {}), (C["chile10"], "pop_high", -12, {}),
    (C["mirchi11"], "toon_pops", -10, {}),
    (C["upar11"] - 0.05, "slide_up.wav", -13, {}), (C["neeche11"] - 0.05, "slide_down.wav", -13, {}),
    (C["aaina11"] - 0.05, "magic", -11, {"dur": 2.0}),
    # Null: the split slides up, the twins pop
    (C["to12"] - 0.25, "wh_soft", -11, {}), (C["copy12"], "toon_boing", -11, {}), (C["bhejo12"], "ui_pop", -12, {}),
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
    # short dips so the kick and the drumroll land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["laat8"] + 0.2)) / 0.8, 0, 1) + np.clip(1 - np.abs(t_ax - (C["asli9"] + 0.8)) / 1.2, 0, 1)
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
