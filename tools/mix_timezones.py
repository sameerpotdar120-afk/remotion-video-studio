"""Mix the time zones video: the creator's voice on top, a playful bed with an Indian piece under the India section,
and an effect on every visual hit (ticks on the offset labels, the crack, buzzers on the cross-outs, the alarm, the
sunrise, the clock snaps).

    python3 tools/mix_timezones.py        # writes public/timezones/audio/mix.wav

Cue times come from src/timezones/timing.json. Ducking works like a sidechain compressor (music about 21 dB under the
voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Kidding Around" and "Indian Meditations" (Ahjay Stelino), Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "timezones" / "audio"
T = json.load(open(ROOT / "src" / "timezones" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, offset into the file, section start): playful → India (China to Assam) → playful again for Nepal and the close
MUSIC = [("music_kidding_around_mixkit.mp3", 0.0, 0.0), ("music_indian_meditations_mixkit.mp3", 6.0, None), ("music_kidding_around_mixkit.mp3", 30.0, None)]
MUSIC_CUTS = [0.0, C["ulta9"] - 0.3, C["nepal12"] - 0.4]
MUSIC_PAUSE, MUSIC_TALK = -12.0, -22.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "boom_low": 30, "thud_low": 35, "waves_soft": 120, "waves": 120, "cannon": 40}

CUES = [
    # hook: the pull-back, the bands sweeping in, "24", the call-out circles, the alarm, night
    (0.05, "wh_big_tonal", -12, {}), (C["naksha1"] + 0.1, "wh_air", -13, {}), (0.6, "light_sweep_magic", -15, {}),
    (C["n24_1"], "impact_chord", -12, {}), (C["n24_1"] + 0.2, "ui_pop", -14, {}),
    (C["seedhi1"] - 0.1, "scratch", -13, {}), *[(C["seedhi1"] + 0.3 + i * 0.05, "pop_light", -19, {}) for i in range(6)],
    (C["kyon1"] + 0.2, "toon_whoosh", -12, {}), (C["kyon1"] + 0.4, "scratch", -14, {}),
    (C["ghadi1"] - 0.1, "pop_high", -13, {}), (C["ghadi1"] + 0.3, "alarm_slow", -16, {"dur": 1.6}), (C["subah1"] - 0.1, "wh_airy_soft", -13, {}),
    # Greenwich: whip, pin, the red line, the 0 UTC badge, the typing
    (C["london2"] - 0.35, "whoosh_cinematic_fast", -10, {}), (C["greenwich2"], "ui_glassy_snap", -12, {}), (C["yahin2"], "riser", -16, {"dur": 0.9}),
    (C["zero2"], "impact_chord", -13, {}), (C["utc2"] + 0.05, "typewriter_click", -16, {"dur": 0.9}),
    # offsets: a tick on every label, east then west; India +5:30
    (C["poorab3"], "wh_soft", -13, {}), *[(t, "ui_perc", -15, {}) for t in (C["p1_3"], C["p2_3"], C["p3_3"])],
    *[(C["p3_3"] + 0.1 + k * 0.08, "ui_snap", -20, {}) for k in range(1, 10)],
    (C["paschim3"], "wh_soft", -13, {}), *[(t, "ui_perc", -15, {}) for t in (C["m1_3"], C["m2_3"])],
    *[(C["m2_3"] + 0.1 + k * 0.08, "ui_snap", -20, {}) for k in range(1, 11)],
    (C["india3"] - 0.2, "whoosh_cinematic_fast", -10, {}), (C["ist3"], "impact_chord", -12, {}), (C["saadhe3"], "ui_pop", -15, {}),
    # what if: the straight strips, the "?"
    (C["socho4"] + 0.1, "light_sweep_magic", -13, {}), (C["kya4"], "toon_whoosh", -13, {}), (C["kya4"] + 0.15, "pop_high", -14, {}),
    # Mirzapur: the yellow line, the dive, the crack, the two friends
    (C["ist5"] + 0.2, "riser", -16, {"dur": 0.9}), (C["mirzapur5"] - 0.1, "wh_air", -12, {}), (C["mirzapur5"] + 0.1, "radar_ping", -15, {}),
    (C["seedhi5"], "wh_soft", -13, {}), (C["kat5"] - 0.02, "punch", -9, {}), (C["kat5"] + 0.02, "metal_thud", -12, {}),
    (C["gali6"], "pop_light", -13, {}), (C["five6"], "ui_pop", -14, {}), (C["bagal6"], "pop_light", -13, {}), (C["six6"] - 0.4, "scratch", -15, {}), (C["six6"], "tap_negative", -14, {}),
    # the fix: the lines bend and lock
    (C["jhamela7"] + 0.2, "wh_big_tonal", -12, {}), (C["seema7"], "shimmer_power", -14, {}), (C["mod7"], "ui_glassy_snap", -11, {}),
    # France: two wrong guesses, then France and the 12
    (C["russia8"] - 0.2, "wh_soft", -13, {}), (C["russia8"] + 0.35, "tap_negative", -11, {}), (C["america8"], "wh_soft", -13, {}), (C["america8"] + 0.55, "tap_negative", -11, {}),
    (C["france8"] - 0.1, "whoosh_cinematic_fast", -10, {}), (C["france8"] + 0.3, "impact_chord", -12, {}),
    (C["dweep8"] + 0.1, "wh_air", -13, {}), *[(C["dweep8"] + i * 0.06, "pop_light", -20, {}) for i in range(12)],
    *[(C["n12_8"] - 0.75 + i * 0.065, "ui_snap", -19, {}) for i in range(12)], (C["n12_8"], "chime_hit", -12, {}),
    # China: five zones squeezed into one, Beijing time, Kashgar in the dark
    (C["ulta9"], "whoosh_cinematic_fast", -11, {}), (C["china9"], "thud_low", -12, {}), *[(C["n5_9"] - 0.1 + i * 0.07, "ui_perc", -17, {}) for i in range(5)],
    (C["ghadi9"], "wh_magic_air", -13, {}), (C["beijing9"], "impact_chord", -12, {}),
    (C["kashgar9"], "wh_air", -12, {}), (C["kashgar9"] + 0.3, "radar_ping", -15, {}), (C["sardi9"], "wind_winter_open", -18, {"dur": 3.0}),
    (C["n10_9"] - 0.3, "alarm_slow", -15, {"dur": 1.8}),
    # India: the width, one clock, Arunachal's sun, Gujarat asleep
    (C["india10"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["n3000_10"] - 0.2, "riser", -16, {"dur": 0.8}), (C["n3000_10"] + 0.6, "thud", -13, {}),
    (C["ghadi10"], "ui_pop", -14, {}), (C["arunachal10"], "wh_air", -12, {}), (C["arunachal10"] + 0.2, "shimmer_power", -13, {}), (C["n4_10"], "chime_hit", -13, {}),
    (C["gujarat10"], "wh_airy_soft", -12, {}), (C["n6_10"], "tap_negative", -15, {}),
    # Assam, the tea garden, बागान टाइम
    (C["assam11"] - 0.2, "whoosh_cinematic_fast", -11, {}), (C["assam11"] + 0.1, "magic", -15, {}), (C["bagan11"] + 0.3, "wh_big_tonal", -12, {}),
    (C["alag11"] + 0.65, "ui_glassy_snap", -12, {}), (C["bagaan11"], "impact_chord", -13, {}), (C["n1_11"], "ui_pop", -14, {}),
    # Nepal's 15 minutes; the close
    (C["nepal12"] - 0.3, "whoosh_cinematic_fast", -11, {}), (C["nepal12"] + 0.1, "thud_low", -13, {}), (C["n15_12"] - 0.05, "ui_glassy_snap", -12, {}), (C["n15_12"] + 0.2, "pop_high", -14, {}),
    (C["batao13"], "wh_soft", -13, {}), (C["india13"], "thud", -14, {}), (C["n2_13"], "impact_chord", -13, {}),
    (C["haan13"] - 0.35, "pop_high", -13, {}), (C["haan13"] + 1.4, "ui_pop", -13, {}),
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

    # three sections, crossfaded over 0.5 s, matched in loudness
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
    # short dips so the crack, the cross-outs and the alarm land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["kat5"], C["russia8"] + 0.35, C["america8"] + 0.55, C["n10_9"] - 0.3))
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
