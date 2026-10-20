"""Mix the Whisky War video: the creator's voice on top, a playful bed ("Kidding Around") with a mock-serious war drum
under the "जंग का ऐलान?" fake-out that cuts dead on "नहीं", then the playful bed back. An effect on every visual hit (the
flag fills, the WAR? badge, the bottles, the newspaper and its burn, the dive, the typed tags, the distance, 1953, the
border, the 18 km arrows, 1984, the helicopters, the flags thrown and planted, the bottles, the notes, the tape stop, the
montage, 2022, the split, the new border, the poll).

    python3 tools/mix_whiskywar.py        # writes public/whiskywar/audio/mix.wav

Cue times come from src/whiskywar/edit/timing.json. Ducking works like a sidechain compressor (music about 21 dB under
the voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Kidding Around" (Ahjay Stelino) and "Epical Drums 06" (Eugenio Mininni), Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "whiskywar" / "audio"
VO = ROOT / "public" / "whiskywar" / "vo" / "whiskywar_vo.mp3"
T = json.load(open(ROOT / "src" / "whiskywar" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]
SC = {"paper": C["canada2"] - 0.45, "dive": C["ladai2"] + 0.25, "atlas": C["door3"] - 0.3, "parch": C["greenland4"] - 0.15, "strait": C["samundar5"] - 0.3,
      "y1984": C["n1984_6"] - 0.2, "beach1": C["sainik6"] - 0.3, "heli": C["usi7"] - 0.1, "beach2": C["jhanda7"] - 0.6, "war": C["ab8"] - 0.1,
      "beach3": C["nahi9"] - 0.05, "montage": C["silsila10"] - 0.1, "island": C["n2022_10"] - 0.2, "border": C["yun11"] - 0.15}

# (file, offset into the file): playful → the war fake-out drums → playful again
MUSIC = [("music_kidding_around_mixkit.mp3", 0.0), ("music_epical_drums_06_mixkit.mp3", 20.0), ("music_kidding_around_mixkit.mp3", 40.0)]
MUSIC_CUTS = [0.0, SC["war"], SC["beach3"]]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "thud_low": 35, "drum_hit_big": 35, "fire": 90, "fire_crackle": 90, "heli_flyby": 60, "waves_soft": 120, "wind_howl": 120}

FLASHES = [SC[k] for k in ("dive", "strait", "y1984", "beach1", "heli", "war", "montage", "island", "border")]
CUES = [
    # line 1: Canada's flag fills, Denmark's, the WAR? badge, the bottles
    (0.05, "wh_big_tonal", -13, {}), (0.15, "pop_high", -14, {}), (0.35, "whoosh_sparkle", -15, {}),
    (C["desh1"] - 0.1, "pop_high", -14, {}), (C["desh1"], "whoosh_sparkle", -15, {}),
    (C["n49_1"] - 0.2, "wh_fast", -13, {}), (C["n49_1"], "impact_chord", -13, {}), (C["jang1"], "sword_hit", -14, {}),
    (C["hathiyar1"] - 0.1, "toon_whoosh", -14, {}), (C["hathiyar1"] + 0.15, "pop_light", -14, {}), (C["hathiyar1"] + 0.2, "toon_whoosh", -15, {}), (C["hathiyar1"] + 0.45, "pop_light", -14, {}),
    (C["botal1"], "toon_boing", -15, {}),
    # line 2: the newspaper, the highlighter, the burn, the dive, the ring and label
    (SC["paper"], "whoosh_cinematic_fast", -11, {}), (SC["paper"] + 0.1, "page_turn", -13, {}), (C["whisky2"] - 0.1, "scratch", -16, {}),
    (C["ladai2"] - 0.15, "fire_whoosh", -12, {}), (C["ladai2"] - 0.1, "fire_crackle", -18, {"dur": 0.8}),
    (C["patthar2"] - 0.3, "whoosh_cinematic_fast", -11, {}), (C["hans2"] - 0.1, "ui_glassy_snap", -13, {}), *[(C["hans2"] + 0.25 + i * 0.05, "typewriter_click", -20, {}) for i in range(8)],
    # line 3 on the atlas: the tags, the distance, the question
    (SC["atlas"] + 0.3, "ui_pop", -14, {}), (SC["atlas"] + 0.6, "ui_pop", -14, {}), (C["door3"], "ui_wipe", -15, {}), (C["jhagda3"], "toon_boing", -14, {}),
    # line 4 on parchment: 1953, Greenland, the border
    (SC["parch"], "page_turn", -12, {}), (C["n1953_4"] - 0.1, "typewriter_click", -15, {}), (C["n1953_4"] + 0.05, "typewriter_click", -15, {}), (C["n1953_4"] + 0.12, "typewriter_click", -15, {}), (C["n1953_4"] + 0.2, "typewriter_click", -15, {}),
    (C["greenland4"], "ui_pop", -14, {}), (C["hissa4"] - 0.3, "whoosh_sparkle", -14, {}), (C["sarhad4"] - 0.1, "wh_fast", -12, {}), (C["sarhad4"] + 0.2, "pen_cross", -15, {}),
    # line 5: the pin, the 18 km arrows
    (SC["strait"] + 0.2, "pop_high", -13, {}), (C["hans5"], "ui_glassy_snap", -14, {}), (C["n18_5"] - 0.6, "ui_snap", -15, {}), *[(C["n18_5"] - 0.5 + i * 0.06, "ui_perc", -20, {}) for i in range(9)],
    # 1984 and the Canadian landing
    (C["n1984_6"], "impact_chord", -13, {}), (SC["beach1"], "heli_flyby", -16, {"dur": 2.2}), (SC["beach1"] + 0.7, "thud", -14, {}),
    (C["jhanda6"] - 0.3, "toon_whoosh", -13, {}), (C["jhanda6"], "metal_thud", -13, {}), (C["whisky6"], "toon_whoosh", -14, {}), (C["whisky6"] + 0.25, "pop_hard", -14, {}),
    # the minister: the route, his flag, the schnapps, the letter, the note
    (SC["heli"], "heli_flyby", -16, {"dur": 2.0}), (SC["heli"] + 0.2, "pop_high", -14, {}), (C["tom7"], "ui_pop", -14, {}),
    (SC["beach2"], "toon_whoosh", -14, {}), (C["jhanda7"] - 0.3, "toon_whoosh", -13, {}), (C["jhanda7"] + 0.3, "metal_thud", -13, {}),
    (C["schnapps7"], "toon_whoosh", -14, {}), (C["schnapps7"] + 0.25, "pop_hard", -14, {}), (C["note7"], "paper_slide", -13, {}),
    (C["danish7"] - 0.5, "paper_quick_move", -13, {}), (C["danish7"] - 0.2, "writing", -16, {"dur": 1.6}),
    # the war fake-out, the tape stop
    (SC["war"], "braam", -12, {}), (SC["war"] + 0.2, "whoosh_cinematic_fast", -11, {}), (C["jang8"] - 0.1, "drum_hit_big", -11, {}), (C["jang8"] + 0.1, "boom", -13, {}),
    (C["nahi9"] - 0.05, "tape_rewind", -11, {}), (C["nahi9"] + 0.05, "scratch", -12, {}),
    # Canada again
    (C["sainik9"] - 0.1, "toon_whoosh", -14, {}), (C["jhanda9"] - 0.25, "toon_whoosh", -13, {}), (C["jhanda9"] + 0.35, "metal_thud", -13, {}),
    (C["botal9"] - 0.2, "toon_whoosh", -14, {}), (C["botal9"] + 0.05, "pop_hard", -14, {}), (C["canada9"] - 0.15, "paper_quick_move", -13, {}), (C["canada9"], "writing", -16, {"dur": 1.4}),
    # the montage, 2022, the split
    *[(SC["montage"] + 0.1 + (i / 12) ** 0.7 * 2.2, "pop_light", -17, {}) for i in range(12)],
    (C["n2022_10"], "impact_chord", -12, {}), (C["baant10"] - 0.4, "ui_wipe", -14, {}), (C["n60_10"], "ui_perc", -15, {}), (C["n40_10"], "ui_perc", -15, {}), (C["n40_10"] + 0.6, "chime_hit", -13, {}),
    # the new border, the poll
    (C["yun11"], "pen_cross", -14, {}), (C["sarhad11"] - 0.4, "whoosh_cinematic_fast", -11, {}), (C["sarhad11"], "drum_hit_big", -12, {}),
    (C["canada12"], "pop_high", -13, {}), (C["canada12"] + 0.5, "pop_high", -13, {}), (C["comment12"] + 0.2, "toon_whoosh", -14, {}),
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
    # short dips so the war, the stop, 2022 and the border land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["jang8"], C["nahi9"], C["n2022_10"], C["sarhad11"]))
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
