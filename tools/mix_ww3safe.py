"""Mix the World War 3 safe-countries video: the creator's voice on top, war drums under the threat, a hopeful bed
from "बचना है तो नीचे चलो", effects on every move.

    python3 tools/mix_ww3safe.py        # writes public/ww3safe/audio/mix.wav

Cue times come from src/ww3safe/timing.json. Ducking works like a sidechain compressor (music about 21 dB under the
voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Epical Drums 06" and "Possible Dreams", Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "ww3safe" / "audio"
T = json.load(open(ROOT / "src" / "ww3safe" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, offset into the file, section start): the threat, then the way out (from "बचना है तो नीचे चलो")
MUSIC = [("music_epical_drums_06_mixkit.mp3", 2.0, 0.0), ("music_possible_dreams_mixkit.mp3", 8.0, None)]
MUSIC_CUTS = [0.0, C["bachna3"] - 0.3]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "boom_low": 30, "thud_low": 35, "thunder": 40, "waves_soft": 120, "wind_snow_gusty": 150, "wind_winter_open": 150, "alarm_slow": 200}
IMPACTS = [0.9, 1.1, 1.75, 2.1, 3.8, 4.0, 4.15, 4.2, 4.4, 4.45]
LAUNCHES = [0.0, 0.25, 0.55, 1.0, 1.6, 1.85, 2.05, 2.2, 2.4, 2.55]

CUES = [
    # hook: the banner slams, missiles fly, America and Europe hit
    (0.12, "wh_big_tonal", -10, {}), (0.3, "boom_low", -12, {}), (0.1, "alarm_slow", -24, {"align": "start", "dur": 4.6}),
    *[(x, "jet_pass", -24, {"align": "start", "dur": 0.9}) for x in LAUNCHES[::2]],
    *[(x, "boom" if i % 2 else "impact_blow", -13 - (i % 3), {}) for i, x in enumerate(IMPACTS)],
    (C["america1"], "impact_chord", -12, {}), (C["europe1"], "stinger", -12, {}),
    # to the globe; the nine nuclear powers; India; the northern half
    (C["kyon2"] - 0.1, "whoosh_cinematic_fast", -9, {}), (C["kyon2"] + 0.35, "subdrop", -12, {}),
    *[(C["nuke2"] - 0.1 + i * 0.11, "ui_glassy_snap", -18, {}) for i in range(0, 9, 2)], (C["nuke2"], "braam", -14, {}),
    (C["india2"], "impact_chord", -12, {}), (C["uttari2"], "light_sweep_magic", -15, {}),
    # the nukes
    (C["matlab2"] - 0.1, "thunder", -11, {}), (C["matlab2"] + 0.35, "boom", -12, {}), (C["khatra2"], "impact_blow", -9, {}), (C["khatra2"] + 0.05, "subdrop", -11, {}),
    (C["khatra2"] + 0.4, "boom_low", -13, {}),
    # the way out: spin south, dive into Fiji
    (C["neeche3"] - 0.2, "wh_big_tonal", -11, {}), (C["dakshin3"], "shimmer_power", -14, {}),
    (C["dakshin3"] + 0.9, "riser", -13, {"align": "start", "dur": 0.8}), (C["dakshin3"] + 1.7, "whoosh_cinematic_fast", -9, {}),
    # Fiji
    (C["fiji4"], "impact_chord", -11, {}), (C["fiji4"] + 0.15, "pop_high", -13, {}), (C["pacific4"], "waves_soft", -22, {"align": "start", "dur": 3.0}),
    (C["n300"] - 0.15, "wh_soft", -11, {}), (C["n300"], "ui_glassy_snap", -12, {}), (C["dweep4"], "pop_high", -13, {}),
    (C["aus4"] - 0.1, "wh_air", -11, {}), (C["aus4"] + 0.2, "typewriter_click", -15, {}), (C["n2700"], "ui_glassy_snap", -11, {}), (C["n2700"] + 0.7, "punch", -14, {}),
    (C["akela4"], "sonar", -14, {}), (C["nishane4"], "radar_ping", -14, {}), (C["nishane4"] + 1.2, "tap_negative" if False else "thud", -15, {}),
    (C["ilaka4"], "light_sweep_magic", -15, {}), (C["sandhi4"] + 0.2, "pop_high", -13, {}), (C["zone4"] - 0.3, "metal_thud", -12, {}), (C["zone4"], "impact_chord", -12, {}),
    # New Zealand
    (C["nz5"] - 0.1, "wh_fast", -10, {}), (C["nz5"] + 0.2, "thud_low", -12, {}), (C["y1987"], "ui_glassy_snap", -11, {}), (C["y1987"] + 0.7, "punch", -14, {}),
    (C["kanoon5"], "page_turn", -12, {}), (C["hathiyar5"] - 0.3, "pop_high", -13, {}), (C["hathiyar5"], "metal_thud", -12, {}),
    (C["y2023"], "ui_pop", -12, {}), (C["sardi5"] - 0.1, "wind_winter_open", -18, {"align": "start", "dur": 4.2}), (C["sardi5"], "subdrop", -12, {}),
    (C["fasle5"], "pop_high", -13, {}), (C["barbaad5"] + 0.1, "metal_thud", -13, {}),
    (C["nz5b"] - 0.15, "wh_soft", -11, {}), (C["khana5"], "pop_high", -13, {}), (C["uga5"], "chime_hit", -13, {}),
    # Iceland
    (C["teesra6"] - 0.1, "whoosh_cinematic_fast", -9, {}), (C["ajeeb6"], "stinger", -13, {}), (C["iceland6"], "impact_chord", -11, {}),
    (C["iceland6"] + 0.2, "wind_snow_gusty", -22, {"align": "start", "dur": 3.0}),
    (C["list6"] - 0.2, "wh_air", -12, {}), (C["army7"], "metal_thud", -11, {}), (C["army7"] + 0.3, "impact_blow", -13, {}),
    (C["n19"], "ui_glassy_snap", -11, {}), (C["n19"] + 0.15, "wh_magic_air", -15, {}), (C["shaant7"], "chime_hit", -13, {}),
    (C["thand7"] - 0.15, "wh_soft", -11, {}), (C["thand7"], "wh_airy_soft", -16, {}), (C["n90"], "ui_glassy_snap", -11, {}), (C["n90"] + 0.6, "punch", -14, {}),
    # the close: the teaser, the bunker, the comment
    (C["chautha8"] - 0.2, "whoosh_cinematic_fast", -10, {}), (C["chautha8"], "stinger", -12, {}),
    (C["bunker8"] - 0.2, "wh_fast", -11, {}), (C["bunker8"], "heavy_knock", -12, {}), (C["bani8"] - 0.3, "gate_metal", -12, {}),
    (C["pehchana9"] - 0.1, "wh_soft", -12, {}), (C["comment9"] - 0.1, "pop_high", -11, {}), (C["comment9"] + 0.1, "ui_pop", -13, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["khatra2"], C["zone4"], C["army7"]))
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
