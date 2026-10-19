"""Mix the Hundred Years' War video: the creator's voice on top, war drums under the war, a hopeful bed under Joan's
rise, a dark one under the capture, trial and fire, and the hopeful one back for 1453 and the saint. An effect on every
visual hit (the duel, the counter, the slam, Edward, the brawl, the cavalry and the arrows, the game, Joan's card and
voices, the banner, Orléans, Reims, the grab, the trial ticks, the fire, the banners, the halo, the poll).

    python3 tools/mix_hundredyears.py        # writes public/hundredyears/audio/mix.wav

Cue times come from src/hundredyears/edit/timing.json. Ducking works like a sidechain compressor (music about 21 dB under
the voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Epical Drums 06", "I Won't Surrender" and "Silent Descent", Mixkit free licence.
SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "hundredyears" / "audio"
VO = ROOT / "public" / "hundredyears" / "vo" / "hundredyears_vo.mp3"
T = json.load(open(ROOT / "src" / "hundredyears" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]
BURN = (C["aag12"] - 0.3, C["aag12"] + 1.4)

# (file, offset into the file): war → Joan's rise → the capture and the fire → victory and the saint
MUSIC = [("music_epical_drums_06_mixkit.mp3", 0.0), ("music_i_wont_surrender_mixkit.mp3", 8.0),
         ("music_silent_descent_mixkit.mp3", 10.0), ("music_i_wont_surrender_mixkit.mp3", 60.0)]
MUSIC_CUTS = [0.0, C["domremy7"] - 0.45, C["dushman10"] - 0.3, C["n1453_12"] - 0.1]
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "thud_low": 35, "drum_hit_big": 35, "heartbeat": 30, "fire": 90, "fire_crackle": 90,
       "crowd_charge": 90, "crowd_cheer": 90, "village_day": 150, "wind_howl": 120, "impact_trailer_epic": 35}

CUES = [
    # hook: the duel, the 116 counter, Joan's swoop, the worry, the stake
    (0.05, "wh_big_tonal", -13, {}), (0.3, "sword_hit", -12, {}), (0.75, "sword_scrape", -17, {}), (1.4, "sword_hit", -14, {}),
    (C["desh1"] - 0.3, "ui_snap", -16, {}), *[(C["desh1"] - 0.2 + i * 0.07, "ui_perc", -21, {}) for i in range(10)], (C["desh1"] + 0.6, "chime_hit", -13, {}),
    (C["rok1"] + 0.8, "toon_whoosh", -13, {}), (C["n17_2"] - 0.1, "whoosh_cinematic_fast", -10, {}), (C["n17_2"] + 0.1, "shimmer_power", -14, {}),
    (C["rukh2"], "wh_fast", -13, {}), (C["par2"] + 0.2, "tap_negative", -14, {}), (C["dard2"] - 0.1, "braam_dark", -13, {}), (C["dard2"] + 0.1, "fire_whoosh", -16, {}),
    # parchment 1337: the slam, Edward and his idea, the French king's no, the brawl, the title
    (C["n1337_3"] - 0.15, "page_turn", -13, {}), (C["n1337_3"] + 1.6, "drum_hit_big", -11, {}), (C["n1337_3"] + 1.62, "impact_chord", -14, {}),
    (C["edward3"] - 0.2, "toon_whoosh", -13, {}), (C["edward3"] + 0.1, "pop_high", -14, {}), (C["maa3"] - 0.2, "ui_pop", -14, {}),
    (C["raja3"], "toon_boing", -15, {}), (C["kyon3"] + 0.8, "magic", -17, {}),
    (C["mana4"] - 0.3, "toon_whoosh", -13, {}), (C["mana4"] + 0.1, "click_error", -14, {}), (C["mana4"] + 0.5, "heavy_knock", -14, {}),
    (C["zid4"], "wh_fast", -12, {}), *[(C["zid4"] + 0.25 + i * 0.22, "punch" if i % 2 == 0 else "toon_hit", -15, {}) for i in range(4)],
    (C["hundred4"] - 0.3, "riser", -16, {"dur": 0.3}), (C["hundred4"] - 0.05, "impact_trailer_epic", -10, {}), (C["hundred4"], "boom", -12, {}),
    # the field: the charge, the arrow rain, the longbows, the armour like paper
    (C["ghud5"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["ghud5"], "crowd_charge", -17, {"dur": 2.8}), (C["ghud5"] + 0.2, "thud_low", -15, {}),
    (C["jaldi5"] - 0.25, "bow_loose", -13, {}), (C["jaldi5"], "arrow_whoosh", -13, {}), *[(C["jaldi5"] + 0.35 + i * 0.12, "arrow_hit", -18, {}) for i in range(5)],
    (C["longbow5"] - 0.35, "wh_fast", -12, {}), (C["longbow5"], "bow_loose", -12, {}), (C["longbow5"] + 0.2, "arrow_fly", -14, {}),
    (C["kagaz5"], "metal_thud", -13, {}), (C["kagaz5"] + 0.15, "page_turn", -15, {}),
    # the game: years passing, France breaking, game over
    (C["saal6"] - 0.05, "whoosh_cinematic_fast", -10, {}), (C["saal6"] + 0.2, "ui_pops_seq", -15, {}),
    (C["toot6"], "thud", -12, {}), (C["toot6"] + 0.1, "tap_negative", -13, {}), (C["khel6"] - 1.1, "ui_pop", -15, {}), (C["khel6"], "subdrop", -12, {}),
    # Joan: the village, the card, crown, swords, the fist, the voices, the banner, the shockwave
    (C["domremy7"] - 0.45, "whoosh_cinematic_fast", -10, {}), (C["domremy7"] + 0.2, "village_day", -20, {"dur": 2.0}),
    (C["joan7"] - 0.05, "light_sweep_magic", -13, {}), (C["joan7"] + 0.05, "impact_chord", -13, {}),
    (C["shahi7"], "cross_out", -14, {}), (C["fauj7"], "cross_out", -14, {}), (C["yakeen7"], "punch", -14, {}), (C["yakeen7"] + 0.05, "shimmer_power", -14, {}),
    (C["upar7"] - 0.55, "whoosh_sparkle", -12, {}), (C["upar7"], "bell", -17, {}), (C["bachana7"], "swell_soft", -15, {}),
    (C["jhande8"] - 0.9, "sword_draw", -13, {}), (C["jhande8"] - 0.3, "toon_whoosh", -13, {}), (C["jhande8"] + 0.1, "wh_air", -12, {}),
    (C["jaan8"], "drum_hit_big", -11, {}), (C["jaan8"] + 0.05, "crowd_cheer", -18, {"dur": 1.8}),
    # Orléans: the siege, the arrow, the siege broken; Reims: the crown
    (C["n1429_9"] - 0.1, "wh_soft", -12, {}), (C["orleans9"] - 0.1, "pop_high", -13, {}),
    (C["teer9"] - 0.3, "arrow_whoosh", -12, {}), (C["teer9"] + 0.15, "arrow_hit", -11, {}), (C["teer9"] + 0.25, "toon_hit", -16, {}),
    (C["ghera9"], "gate_metal", -12, {}), (C["ghera9"] + 0.1, "ui_glassy_snap", -14, {}),
    (C["reims9"] - 0.05, "wh_soft", -12, {}), (C["reims9"] + 0.4, "pop_high", -14, {}),
    (C["charles9"] - 0.4, "toon_whoosh", -13, {}), (C["charles9"] + 0.9, "gong", -15, {}), (C["charles9"] + 0.95, "crowd_cheer", -19, {"dur": 1.4}),
    # the enemy, the grab, the sale, the trial, the stake
    (C["dushman10"] - 0.3, "whoosh_cinematic_fast", -11, {}), (C["dushman10"], "braam_dark", -13, {}),
    (C["burgundy11"] + 0.4, "wh_fast", -12, {}), (C["burgundy11"] + 1.2, "punch", -14, {}), (C["bech11"], "coins_pouch", -13, {}),
    (C["rouen11"] + 0.35, "whoosh_cinematic_fast", -10, {}), (C["ilzaam11"], "hammer", -13, {}),
    (C["kapde11"], "pen_cross", -14, {}), (C["bhatkaya11"], "pen_cross", -14, {}),
    (C["n19_11"] - 0.15, "heartbeat", -14, {"dur": 2.2}), (C["n19_11"] + 0.1, "thud_low", -13, {}),
    (C["jala11"], "fire_whoosh", -13, {}), (C["jala11"] + 0.2, "fire", -18, {"dur": 2.6}),
    # the fire burns the scene away, hope, 1453
    (BURN[0], "fire_whoosh", -11, {}), (BURN[0] + 0.1, "fire_crackle", -16, {"dur": 1.8}), (C["ummeed12"] - 0.5, "light_sweep_magic", -13, {}),
    (C["n1453_12"] - 0.4, "wh_big_tonal", -13, {}), (C["n1453_12"] + 0.05, "impact_chord", -12, {}), (C["jeet12"], "drum_hit_big", -12, {}),
    (C["jeet12"] + 0.05, "crowd_cheer", -18, {"dur": 1.6}),
    # 1431 / 1920 chips, the halo, the poll
    (C["church13"] + 0.1, "pop_high", -14, {}), (C["churail13"], "fire_whoosh", -17, {}), (C["n500_13"] + 0.2, "ui_glassy_snap", -13, {}),
    (C["saint13"] - 0.1, "whoosh_sparkle", -13, {}), (C["saint13"] + 0.05, "shimmer_power", -13, {}), (C["saint13"] + 0.1, "bell", -17, {}),
    (C["insaaf13"], "pop_high", -13, {}), (C["dhokha13"], "pop_high", -13, {}), (C["comment13"] + 0.3, "toon_whoosh", -14, {}),
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

    # four sections, crossfaded over 0.5 s, matched in loudness
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
    # short dips so the title, game over, the age and 1453 land
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["hundred4"], C["khel6"], C["n19_11"], C["n1453_12"]))
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
