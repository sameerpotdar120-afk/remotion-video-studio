"""Mix the Chile video: the creator's voice on top, a light playful bed, an old-world classical piece under the
history and the skit, comic effects on every gag.

    python3 tools/mix_chile.py        # writes public/chile/audio/mix.wav

Cue times come from src/ww3safe/timing.json. Ducking works like a sidechain compressor (music about 21 dB under the
voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Drawing the Sky" and "Classical Vibes 3", Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "chile" / "audio"
T = json.load(open(ROOT / "src" / "chile" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

# (file, offset into the file, section start): playful → old world (history and skit) → playful again
MUSIC = [("music_drawing_the_sky_mixkit.mp3", 4.0, 0.0), ("music_classical_vibes_3_mixkit.mp3", 2.0, None), ("music_drawing_the_sky_mixkit.mp3", 60.0, None)]
MUSIC_CUTS = [0.0, C["y1500"] - 0.3, C["chalo12"] - 0.3]
MUSIC_PAUSE, MUSIC_TALK = -12.0, -22.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "boom_low": 30, "thud_low": 35, "waves_soft": 120, "waves": 120, "cannon": 40}

CUES = [
    # hook: the sheet, the chili, the scratch, the pluck, the right Chile
    (0.05, "wh_big_tonal", -12, {}), (0.5, "toon_whoosh", -12, {}), (0.78, "thud", -13, {}), (C["chalo1"] + 1.6, "ui_pop", -14, {}),
    (C["arey1"] - 0.05, "scratch", -10, {}), (C["mirchi1"] - 0.3, "wh_soft", -13, {}), (C["mirchi1"] + 0.3, "pop_light", -12, {}), (C["mirchi1"] + 0.5, "toon_whoosh", -11, {}),
    (C["chile1"] - 0.3, "ui_glassy_snap", -12, {}), (C["chile1"], "impact_chord", -12, {}),
    # long: letters, India, the overlay, the numbers
    *[(C["lamba2"] - 0.3 + i * 0.13, "pop_light", -18, {}) for i in range(7)],
    (C["india2"] - 0.2, "whoosh_cinematic_fast", -10, {}), (C["india2"] + 0.3, "wh_air", -12, {}), (C["kashmir2"], "thud_low", -12, {}),
    (C["kanya2"] + 0.2, "typewriter_click", -15, {}), (C["n1000"], "ui_glassy_snap", -11, {}), (C["n1000"] + 0.3, "punch", -13, {}),
    (C["n180"] - 0.3, "typewriter_click", -15, {}), (C["n180"] + 0.3, "ui_glassy_snap", -12, {}), (C["delhi3"], "pop_high", -13, {}), (C["agra3"], "pop_high", -13, {}),
    (C["shakal4"] - 0.6, "wh_fast", -11, {}), (C["shakal4"], "stinger", -13, {}),
    # back in time: the paper, the old map, the ships, "बातचीत"
    (C["y1500"] - 0.1, "pages", -12, {}), (C["adivasi5"] - 0.75, "page_turn", -10, {}), (C["inca5"], "ui_pop", -13, {}), (C["mapuche5"], "ui_pop", -13, {}),
    (C["spain6"] - 0.35, "page_turn", -11, {}), (C["spain6"], "waves_soft", -20, {"align": "start", "dur": 2.0}), (C["baat6"], "magic", -14, {}), (C["baat6"] + 0.05, "pop_light", -12, {}),
    # the skit
    (C["wah7"] - 0.3, "wh_soft", -12, {}), (C["bhai8"] - 0.3, "whoosh_cinematic_fast", -11, {}), (C["rehte8"] + 0.3, "whoosh_cinematic_fast", -11, {}),
    (C["rehte8"] + 0.45, "metal_thud", -9, {}), (C["rehte8"] + 0.55, "stinger", -10, {}), (C["aham9"] + 0.1, "tap_negative", -14, {}),
    # Spain and the Mapuche, independence, the lens
    (C["mapuche10"] - 0.3, "wh_air", -12, {}), (C["jeet10"], "impact_chord", -12, {}),
    (C["y1818"], "ui_glassy_snap", -11, {}), *[(C["y1818"] + 0.15 + i * 0.16, "pop_light", -16, {}) for i in range(7)],
    (C["shuru11"] + 0.6, "wh_magic_air", -13, {}), (C["chalo12"] - 0.3, "whoosh_cinematic_fast", -11, {}),
    # the flag: east, then the Andes, then south
    (C["chalo12"], "pop_high", -13, {}), (C["accha13"] - 0.1, "scratch", -12, {}), (C["accha13"], "boom_low", -13, {}), (C["dakshin13"], "toon_whoosh", -13, {}),
    # squeezed; wider no, longer yes; south to the tip
    (C["kyunki14"] - 0.2, "wh_fast", -11, {}), (C["pacific14"], "waves_soft", -18, {"align": "start", "dur": 1.6}), (C["pacific14"] + 0.05, "pop_high", -13, {}),
    (C["andes14"], "thud_low", -11, {}), (C["andes14"] + 0.1, "light_sweep_magic", -15, {}),
    (C["chaude15"] + 0.25, "punch", -11, {}), (C["chaude15"] + 0.6, "tap_negative", -13, {}), (C["lambe15"], "shimmer_power", -14, {}),
    (C["neeche15"], "riser", -15, {"align": "start", "dur": 2.5}), (C["chor15"], "chime_hit", -13, {}),
    # the war, the coast, Bolivia
    (C["uttar16"] - 0.1, "wh_fast", -11, {}), (C["y1879"], "cannon", -12, {}), (C["bolivia16"], "ui_pop", -13, {}), (C["peru16"], "ui_pop", -13, {}),
    (C["kinara17"], "impact_blow", -12, {}), (C["hissa17"], "thud", -13, {}), (C["bhai18"] - 0.2, "pop_high", -13, {}), (C["samandar18"], "tap_negative", -13, {}),
    # the navy, the close
    (C["bolivia19"] - 0.75, "whoosh_cinematic_fast", -11, {}), (C["bolivia19"] - 0.4, "waves", -20, {"align": "start", "dur": 4.5}), (C["navy19"], "ui_glassy_snap", -12, {}),
    (C["bhejo20"] - 1.1, "wh_soft", -12, {}), (C["bhejo20"], "pop_high", -11, {}), (C["mirchi20"] - 0.3, "toon_whoosh", -12, {}), (C["mirchi20"], "thud", -12, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["arey1"], C["rehte8"] + 0.45, C["accha13"]))
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
