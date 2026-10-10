"""Mix the Louisiana Purchase video: the creator's voice on top, a light orchestral bed, soft cartoon/foley effects.

    python3 tools/mix_louisiana.py        # writes public/louisiana/audio/mix.wav

Cue times come from src/louisiana/timing.json (aligned to the voiceover). The reference keeps its bed ~17 LU under the
voice and its effects small (loudest hits around -3 to -7 dB vs the voice); this mix follows that.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Classical vibes 3" (Grigoriy Nuzhny), Mixkit free licence.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "louisiana" / "audio"
T = json.load(open(ROOT / "src" / "louisiana" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_classical_vibes_3_mixkit.mp3", 0.0, -20.0)]
MUSIC_DUCK, SFX_DUCK = 5.0, 2.5
HPF = {"harbour": 150, "crowd_charge": 120, "crowd_cheer": 120, "waves_ocean": 120, "vhs_rewind": 200, "boom_low": 35, "thud_low": 45, "cannon": 50}

CUES = [
    # hook: two diplomats, one city, the whole of Louisiana
    (C["do"] - 0.1, "ui_pop_high", -12, {}),
    (C["do"] + 0.05, "ui_pop_high", -13, {}),
    (C["shahar"] - 0.05, "ui_glassy_snap", -11, {}),
    (C["bhejo"], "wh_airy_soft", -9, {}),
    (C["bhejo"] + 0.1, "harbour", -26, {"align": "start", "skip": 10.0, "dur": C["poora"] - C["bhejo"] + 0.4}),
    (C["louis"] - 0.05, "wh_magic_air", -6, {}),
    (C["louis"] + 0.2, "shimmer_power", -12, {}),
    (C["daam"] - 0.5, "ui_perc_snap", -11, {}),
    (C["daam"] + 0.25, "cash_coins", -9, {}),
    # rewind to 1802
    (C["kaise"] + 0.4, "vhs_rewind", -16, {"align": "start", "skip": 2.0, "dur": C["y1802"] - C["kaise"] - 0.4}),
    (C["y1802"], "thud_low", -6, {}),
    (C["y1802"] + 0.02, "boom_low", -10, {}),
    # France and Britain, swords behind their backs
    (C["france"] - 0.1, "ui_wipe", -12, {}),
    (C["britain"] - 0.1, "ui_wipe", -12, {}),
    (C["sulah"] - 0.3, "cartoon_pops", -14, {"align": "start"}),
    (C["brk"] - 0.1, "sword_draw", -12, {}),
    (C["brk"] + 0.05, "hit_chime", -14, {}),
    # North America, Louisiana, the plan
    (C["udhar"] - 0.1, "wh_big_subtle_tonal", -5, {}),
    (C["udhar"] + 0.2, "ui_scatter_plops", -14, {}),
    (C["ilaka"] - 0.3, "wh_infographic_slide", -11, {}),
    (C["louis4"], "ui_glassy_snap", -11, {}),
    (C["plan"] - 0.2, "ui_pop_high", -12, {}),
    (C["samrajya"] - 0.3, "ui_kalimba_up", -13, {}),
    # Saint-Domingue, the money machine
    (C["chaabi"] - 0.1, "wh_airy_medium", -7, {}),
    (C["saint"] - 0.2, "wh_magic_air", -8, {}),
    (C["haiti"], "ui_glassy_snap", -12, {}),
    (C["paise"], "coins_explainer", -8, {}),
    (C["paise"] + 0.15, "cash_coins", -10, {}),
    (C["cheeni"] - 0.15, "ui_pop_high", -12, {}),
    (C["laakhon"] - 0.2, "ui_scatter_plops", -13, {}),
    # हाँ, गुलामी … बगावत
    (C["haan"] - 0.15, "wh_fast", -7, {}),
    (C["haan"] + 0.1, "chain_drop", -12, {}),
    (C["toota"] - 0.05, "sword_hit", -8, {}),
    (C["toota"], "chain_drop", -8, {}),
    (C["bagawat"] - 0.05, "crowd_charge", -16, {"align": "start", "dur": 2.0}),
    (C["control"] - 0.4, "wh_fast", -7, {}),
    # the fleet, the beach, yellow fever
    (C["napo9"] + 0.2, "wh_airy_medium", -8, {}),
    (C["napo9"] + 0.4, "harbour", -25, {"align": "start", "skip": 30.0, "dur": C["shuru9"] - C["napo9"]}),
    (C["fauj"], "cannon", -14, {}),
    (C["shuru9"] - 0.3, "wh_fast", -7, {}),
    (C["shuru9"], "crowd_cheer", -20, {"align": "start", "dur": 1.6}),
    (C["peela"] - 0.05, "swell_soft", -14, {}),
    (C["hissa"] + 0.1, "bodyfall", -11, {}),
    (C["hissa"] + 0.25, "bodyfall", -12, {}),
    (C["hissa"] + 0.4, "bodyfall", -11, {}),
    (C["hissa"] + 0.55, "bodyfall", -12, {}),
    (C["dweep"] - 0.3, "wh_fast", -7, {}),
    (C["dweep"] + 0.1, "shimmer_power", -12, {}),
    # Louisiana pointless
    (C["saint11"], "wh_big_subtle_tonal", -7, {}),
    (C["matlab"] - 0.3, "ui_pop_high", -12, {}),
    # the Mississippi trade
    (C["miss"] - 0.2, "wh_airy_soft", -8, {}),
    (C["miss"], "waves_ocean", -24, {"align": "start", "dur": C["neworl2"] - C["miss"]}),
    (C["neworl"] - 0.1, "ui_glassy_snap", -11, {}),
    (C["france12"] - 0.1, "ui_pop_high", -11, {}),
    # 1803, Jefferson's offer
    (C["jeff"] - 0.1, "thud_low", -7, {}),
    (C["jeff"] + 0.05, "ui_pop_high", -12, {}),
    (C["dipl"], "ui_pop_high", -12, {}),
    (C["crore"] - 0.2, "ui_perc_snap", -11, {}),
    (C["crore"], "coins_ting", -11, {}),
    # war with Britain, money, too far
    (C["britain14"], "wh_airy_medium", -7, {}),
    (C["jung14"] + 0.1, "sword_hit", -7, {}),
    (C["paisa"] - 0.1, "coins_explainer", -9, {}),
    (C["door"] - 0.3, "wh_infographic_slide", -10, {}),
    (C["namumkin"] - 0.2, "ui_triple_click", -13, {}),
    # the map room
    (C["chaunk"] - 0.15, "wh_magic_air", -6, {}),
    (C["poora15"] - 0.1, "shimmer_power", -12, {}),
    (C["dedh"] - 0.05, "cash_coins", -8, {}),
    (C["dedh"] + 0.15, "cartoon_pops", -12, {}),
    (C["ijazat"] - 0.05, "thud_low", -5, {}),
    (C["ijazat"] - 0.03, "boom_low", -9, {}),
    (C["mauka"] - 0.1, "ui_pop_high", -12, {}),
    # SOLD, doubling, India, under 3 cents
    (C["haan16"] - 0.35, "wh_fast", -7, {}),
    (C["haan16"] - 0.2, "ui_pop_high", -12, {}),
    (C["haan16"] + 0.4, "paper_slide", -10, {}),
    (C["ekdin"], "wh_magic_air", -6, {}),
    (C["ekdin"] + 0.1, "shimmer_power", -11, {}),
    (C["dugna"] - 0.1, "thud_low", -8, {}),
    (C["bharat"] - 0.25, "wh_big_subtle_tonal", -6, {}),
    (C["bharat"] + 0.4, "ui_glassy_snap", -11, {}),
    (C["cent"] - 0.1, "coins_ting", -9, {}),
    (C["cent"] + 0.4, "counter_infographic", -17, {"align": "start", "dur": 0.6}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(AUD / "voiceover.mp3", VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    activity = envelope(talking.astype(np.float32), 0.03, 0.35)[:, None]

    music = np.zeros((n, 2), np.float32)
    for f, off, lvl in MUSIC:
        m = ff(AUD / f, "anull")[int(off * SR):][:n]
        layer = np.zeros((n, 2), np.float32)
        layer[: len(m)] = m
        layer *= db(v_ref + lvl - 10 * np.log10(np.mean(layer[: len(m)] ** 2) + 1e-12))
        music += layer
    # a little lower under the slavery and yellow-fever beats
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["gulami"] + 1.0)) / 2.5, 0, 1) + np.clip(1 - np.abs(t_ax - (C["hissa"] + 0.5)) / 2.0, 0, 1)
    music *= db(-MUSIC_DUCK * activity - 4.0 * np.clip(dip, 0, 1)[:, None])
    music = fade(music, 0.3, 2.0)

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
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music {rms(music):.1f}  music+sfx {rms(music + sfx):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
