"""Mix the Siliguri Corridor video: the creator's voice on top, a tense bed that turns to drums when India answers,
effects on every map move.

    python3 tools/mix_siliguri.py        # writes public/siliguri/audio/mix.wav

Cue times come from src/siliguri/timing.json. Ducking works like a sidechain compressor (music about 21 dB under the
voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Silent Descent" (Eugenio Mininni) and "Epical Drums 06", Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "siliguri" / "audio"
T = json.load(open(ROOT / "src" / "siliguri" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, offset into the file, section start cue): today's city → the 1690s → today again, crossfaded at each cue
MUSIC = [("music_silent_descent_mixkit.mp3", 20.0, 0.0), ("music_epical_drums_06_mixkit.mp3", 6.0, None)]
MUSIC_CUTS = [0.0, C["par8"] - 0.25]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0  # music level vs the voice in pauses / while talking
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "boom_low": 30, "thud_low": 35, "marina": 120, "tram": 80, "alarm_slow": 200}

CUES = [
    # hook: down onto the strip, the 22 km bar, the cut, the counter, the Northeast drifting off, "कहाँ?"
    (0.02, "wh_big_tonal", -10, {}), (0.08, "boom_low", -12, {}),
    (C["n22"], "ui_glassy_snap", -11, {}), (C["n22"] + 0.25, "typewriter_click", -14, {}),
    (C["kati1"], "impact_blow", -8, {}), (C["kati1"] + 0.02, "scratch", -12, {}), (C["kati1"] + 0.1, "alarm_slow", -22, {"align": "start", "dur": 2.4}),
    (C["crore1"] - 0.1, "register", -13, {}), (C["crore1"] + 0.7, "pop_high", -13, {}),
    (C["khatam1"], "subdrop", -11, {}), (C["khatam1"] + 0.05, "braam", -15, {}),
    (C["kahan1"], "whoosh_cinematic_fast", -10, {}), (C["kahan1"] + 0.6, "punch", -14, {}),
    # the corridor, the chicken's neck, 8 states, 8%
    (C["siliguri2"], "impact_chord", -12, {}), (C["siliguri2"] + 0.4, "ui_pop", -13, {}),
    (C["chicken2"], "pop_high", -11, {}), (C["chicken2"] + 0.05, "light_sweep_magic", -16, {}),
    (C["northeast2"] - 0.15, "wh_fast", -10, {}), (C["northeast2"] + 0.2, "thud_low", -13, {}),
    (C["n8a2"], "ui_glassy_snap", -12, {}), (C["n8b2"], "ui_glassy_snap", -12, {}), (C["zameen2"], "chime_hit", -14, {}),
    # road, rail, oil
    (C["sadak3"] - 0.15, "wh_air", -11, {}), (C["sadak3"], "oldcar", -16, {}), (C["rail3"], "tram", -18, {"align": "start", "skip": 1.0, "dur": 1.6}),
    (C["tel3"], "ui_pop", -12, {}), (C["sab3"], "impact_chord", -13, {}),
    # the neighbours, China, the Chumbi Valley
    (C["nepal4"] - 0.2, "wh_fast", -10, {}), (C["nepal4"], "thud", -13, {}), (C["bangla4"], "thud", -13, {}), (C["bhutan4"], "thud", -13, {}),
    (C["china4"], "boom", -11, {}), (C["chumbi4"], "stinger", -11, {}), (C["chumbi4"] + 0.1, "tap_negative", -14, {}),
    # the second route by sea
    (C["isiliye5"], "wh_soft", -11, {}), (C["y2018"], "ui_glassy_snap", -12, {}), (C["y2018"] + 0.3, "marina", -22, {"align": "start", "dur": C["par6"] - C["y2018"]}),
    (C["ctg5"], "pop_high", -13, {}), (C["mongla5"], "pop_high", -13, {}),
    # Mongla: India's zone flips to China; China's money
    (C["par6"] - 0.1, "wh_fast", -10, {}), (C["y2015"], "ui_pop", -12, {}), (C["china6"] - 0.1, "swoosh_fast", -12, {}), (C["china6"], "impact_blow", -10, {}),
    (C["port6"], "metal_thud", -13, {}), (C["paisa6"], "coins", -13, {}), (C["paisa6"] + 0.05, "register", -14, {}),
    # the Teesta project, right by the neck
    (C["teesta7"] - 0.1, "wh_air", -11, {}), (C["teesta7"] + 0.3, "light_sweep_magic", -15, {}), (C["karib7"], "alarm_slow", -18, {"align": "start", "dur": 1.0}),
    (C["karib7"], "impact_chord", -12, {}),
    # India is ready (the drums come in), 3 bases, the air defence, Kaladan
    (C["par8"] - 0.2, "riser", -13, {"align": "start", "dur": 0.4}), (C["taiyar8"], "impact_chord", -10, {}),
    (C["n3_8"], "thud_low", -11, {}), (C["n3_8"] + 0.22, "thud_low", -12, {}), (C["n3_8"] + 0.44, "thud_low", -12, {}),
    (C["n3_8"] + 0.9, "metal_thud", -13, {}), (C["kaladan8"] - 0.1, "wh_fast", -10, {}), (C["kaladan8"] + 0.4, "marina", -24, {"align": "start", "dur": 3.5}),
    (C["myanmar8"], "thud", -13, {}), (C["mizoram8"], "pop_high", -13, {}),
    # China's own neck: Malacca; India at the door
    (C["aur9"], "whoosh_cinematic_fast", -10, {}), (C["china9"], "boom", -11, {}), (C["tel9"], "wh_soft", -13, {}),
    (C["malacca9"] - 0.1, "wh_fast", -11, {}), (C["n28"], "ui_glassy_snap", -11, {}), (C["n28"] + 0.6, "punch", -14, {}),
    (C["darwaze9"], "wh_air", -11, {}), (C["andaman9"], "impact_chord", -11, {}), (C["andaman9"] + 0.3, "radar_ping", -14, {}), (C["andaman9"] + 1.4, "radar_ping", -17, {}),
    # the question
    (C["to10"] - 0.15, "wh_soft", -12, {}), (C["kamzori10"], "pop_high", -12, {}), (C["taqat10"], "pop_high", -12, {}), (C["comment10"], "ui_pop", -12, {}),
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

    # two sections (the threat, then India's answer), crossfaded over 0.5 s, matched in loudness
    music = np.zeros((n, 2), np.float32)
    ref = None
    edges = MUSIC_CUTS + [DURATION]
    for (f, off, _), s0, s1 in zip(MUSIC, edges[:-1], edges[1:]):
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
    # short dips so the gavel, the cannon and the gates land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["kati1"], C["china6"], C["taiyar8"]))
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
