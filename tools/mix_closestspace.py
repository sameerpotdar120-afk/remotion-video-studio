"""Mix the closest-to-space video: the creator's voice on top, a curious bed for the hunt and Everest, a spacey one for
the globe and the geoid, the curious one back for the equator, Chimborazo and the answer. An effect on every visual hit
(the pins rising, EASY → EASY?, the lens, the dive, the summit label, the flag, the border, Nepal and China, the red X,
the flat earth, गोल → Geoid, the spin, the stretch and squash, the roti, the glow, the potato, the radii, the equator
hunt, Ecuador, the heights, the tape measure, the answer, the send).

    python3 tools/mix_closestspace.py        # writes public/closestspace/audio/mix.wav

Cue times come from src/closestspace/edit/timing.json. Ducking works like a sidechain compressor (music about 21 dB under
the voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Discover" (Eugenio Mininni) and "Vastness" (Andrew Ev), Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "closestspace" / "audio"
VO = ROOT / "public" / "closestspace" / "vo" / "closestspace_vo.mp3"
T = json.load(open(ROOT / "src" / "closestspace" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]
EV3D = (C["everest2"] + 0.55, C["choti3"] - 0.22)
GLOBE1 = (C["lagta3"] - 0.25, C["dhoond9"] + 0.5)
ROTI = (C["bilkul6"] - 0.12, C["pahad7"] - 0.12)
GEOID = (C["hazaron7"] - 0.12, C["natija8"] - 0.15)
GLOBE2 = C["center10"] - 0.35

# (file, offset into the file): curious → space → curious again
MUSIC = [("music_discover_mixkit.mp3", 0.0), ("music_vastness_mixkit.mp3", 12.0), ("music_discover_mixkit.mp3", 52.0)]
MUSIC_CUTS = [0.0, GLOBE1[0], GLOBE1[1]]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "thud_low": 35, "drum_hit_big": 35, "heartbeat": 30, "wind_howl": 120, "impact_trailer_epic": 35, "swell_soft": 60}

CUES = [
    # hook: the pins pop and rise, the question, EASY → EASY?
    (0.05, "wh_big_tonal", -13, {}), *[(0.12 + i * 0.05, "pop_light", -19, {}) for i in range(8)],
    (C["desh1"] - 0.3, "riser", -18, {"dur": 0.8}), (C["space1"] - 0.05, "shimmer_power", -14, {}), (C["space1"], "pop_high", -14, {}),
    (C["easy1"] - 0.12, "whoosh_cinematic_fast", -11, {}), (C["easy1"], "ui_glassy_snap", -13, {}), (C["par1"] + 0.15, "tap_negative", -12, {}), (C["nahi1"], "toon_boing", -15, {}),
    # the hunt with the glass, the dive into the 3D Himalaya
    (C["dhoond2"] - 0.2, "wh_soft", -12, {}), (C["dhoond2"] + 0.6, "wh_air", -16, {}), (C["unchi2"], "wh_air", -16, {}),
    (C["everest2"] - 0.1, "pop_high", -13, {}), (C["everest2"] + 0.3, "whoosh_cinematic_fast", -10, {}), (EV3D[0], "wind_howl", -18, {"dur": 4.0}),
    (C["n8849_2"] - 0.05, "impact_chord", -14, {}), (C["n8849_2"] + 0.1, "ui_perc", -18, {}),
    (C["chhat2"] - 0.2, "toon_whoosh", -14, {}), (C["chhat2"] + 0.5, "metal_thud", -14, {}), (C["chhat2"] + 0.9, "crowd_cheer", -21, {"dur": 1.2}),
    # the plunge to top-down, the border, Nepal, China
    (EV3D[1] - 0.15, "whoosh_cinematic_fast", -10, {}), (C["border3"], "ui_wipe", -14, {}), (C["nepal3"] - 0.1, "pop_high", -13, {}), (C["nepal3"], "wh_fast", -13, {}),
    (C["china3"], "impact_chord", -13, {}), (C["china3"] + 0.05, "pop_high", -14, {}),
    (GLOBE1[0] - 0.1, "wh_big_tonal", -12, {}), (GLOBE1[0] + 0.1, "swell_soft", -15, {}),
    # but that's wrong: the X, the red wash; flat earth, just kidding
    (C["galat4"] - 0.05, "click_error", -12, {}), (C["galat4"] + 0.15, "braam_dark", -13, {}), (C["galat4"] + 0.18, "boom", -13, {}),
    (C["gol4"] - 0.1, "wh_soft", -13, {}), (C["chapti4"] - 0.08, "whoosh_cinematic_fast", -11, {}), (C["chapti4"] + 0.3, "thud", -13, {}),
    (C["mazak5"] - 0.3, "toon_boing", -15, {}), (C["mazak5"] + 0.05, "toon_whoosh", -13, {}),
    # the ring, गोल struck, Geoid typed
    (C["perfect5"] - 0.25, "light_sweep_magic", -14, {}), (C["ball5"] + 0.55, "pen_cross", -13, {}), *[(C["ball5"] + 0.9 + i * 0.08, "typewriter_click", -18, {}) for i in range(5)],
    # spin, stretch, squash; the roti
    (C["dhuri6"] - 0.2, "wh_air", -13, {}), (C["ghumav6"], "wh_soft", -14, {}), (C["equator6"], "punch", -14, {}), (C["equator6"] + 0.1, "toon_hit", -16, {}),
    (C["poles6"], "punch", -14, {}), (C["dab6"], "toon_hit", -15, {}),
    (ROTI[0], "whoosh_cinematic_fast", -11, {}), (ROTI[0] + 0.3, "toon_whoosh", -15, {}), (C["rumali6"], "wh_air", -15, {}), (C["rumali6"] + 0.5, "wh_air", -15, {}),
    (ROTI[1], "whoosh_cinematic_fast", -11, {}),
    # the lumpy glow, the potato
    (C["pahad7"], "shimmer_power", -14, {}), (C["wazan7"], "spark_shock", -17, {}),
    (GEOID[0], "impact_whoosh_deep", -11, {}), (GEOID[0] + 0.1, "subdrop", -12, {}), (C["aalu7"], "toon_boing", -13, {}), (C["aalu7"] + 0.1, "pop_high", -14, {}),
    (GEOID[1], "whoosh_cinematic_fast", -11, {}),
    # the radii, +21 km
    (C["natija8"] + 0.1, "ui_snap", -15, {}), (C["center8"], "ui_perc", -15, {}), (C["poles8"], "ui_perc", -15, {}), (C["n21_8"], "chime_hit", -12, {}), (C["n21_8"] + 0.05, "pop_high", -14, {}),
    # the dive onto the equator, the hunt west, Ecuador, Chimborazo
    (GLOBE1[1] - 0.15, "whoosh_cinematic_fast", -10, {}), (C["equator9"], "wh_soft", -13, {}), (C["equator9"] + 1.4, "wh_air", -15, {}),
    (C["ecuador9"] - 0.2, "pop_high", -13, {}), (C["ecuador9"] + 0.05, "wh_fast", -13, {}), (C["chimb9"], "impact_chord", -14, {}),
    (C["n6263_9"] - 0.05, "ui_perc", -17, {}), (C["jwala9"], "boom_low", -16, {}),
    # Everest vs Chimborazo heights, -2,600
    (C["everest10"] - 0.15, "ui_wipe", -14, {}), (C["n2600_10"] - 0.05, "tap_negative", -13, {}),
    # the tape measure, +2 km
    (GLOBE2, "wh_big_tonal", -12, {}), (GLOBE2 + 0.6, "pop_high", -14, {}), (GLOBE2 + 0.9, "counter_ticking", -18, {"dur": 1.4}),
    (C["naapo10"] + 0.3, "counter_ticking", -18, {"dur": 0.9}), (C["n2_10"], "drum_hit_big", -12, {}), (C["n2_10"] + 0.05, "chime_hit", -13, {}),
    (C["n2_10"] + 0.1, "crowd_cheer", -20, {"dur": 1.4}),
    # the answer, the send
    (C["matlab11"], "wh_soft", -13, {}), (C["ecuador11"] - 0.15, "shimmer_power", -12, {}), (C["ecuador11"], "impact_chord", -12, {}),
    *[(C["ecuador11"] - 0.1 + i * 0.07, "typewriter_click", -19, {}) for i in range(7)],
    (C["video12"] - 0.1, "pop_high", -13, {}), (C["everest12"], "whoosh_sparkle", -13, {}),
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
    # short dips so the X, +21 km, +2 km and the answer land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["galat4"], C["n21_8"], C["n2_10"], C["ecuador11"]))
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
