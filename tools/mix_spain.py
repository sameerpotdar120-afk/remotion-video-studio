"""Mix the Spain hidden-neighbours video: the creator's voice on top, a Spanish-flavoured bed, map/foley effects.

    python3 tools/mix_spain.py        # writes public/spain/audio/mix.wav

Cue times come from src/spain/timing.json. The reference keeps its bed about 13 dB under the voice with a whoosh on
nearly every camera move; this mix sits the bed a little lower (voice first) and keeps the effects small.
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Cancion Oeste" (Eugenio Mininni), Mixkit free licence.
"""


import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "spain" / "audio"
T = json.load(open(ROOT / "src" / "spain" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC = [("music_cancion_oeste_mixkit.mp3", 9.0, -13.0)]
MUSIC_DUCK, SFX_DUCK = 5.0, 2.5
HPF = {"harbour": 150, "waves_ocean": 120, "gulls_harbour": 250, "dock_creak": 150, "wind_snow_gusty": 200, "boom_low": 35, "thud_low": 45}

CUES = [
    # hook: Europe → Spain, the wall map, the lost quiz
    (0.05, "impact_whoosh_deep", -10, {}),
    (C["spain1"] - 0.5, "wh_big_subtle_tonal", -7, {}),
    (C["padha"], "paper_slide", -13, {}),
    (C["spain1"], "ui_pop_high", -12, {}),
    (C["france1"] - 0.05, "pop_light", -13, {}),
    (C["portugal"] - 0.05, "pop_light", -13, {}),
    (C["haar"] - 0.05, "thud_low", -7, {}),
    (C["haar"] - 0.03, "tap_negative", -9, {}),
    # five neighbours: the map goes dark, the count slams in, the glass searches
    (C["paanch"] - 0.25, "wh_fast", -8, {}),
    (C["paanch"], "boom_low", -8, {}),
    (C["paanch"] + 0.02, "impact_chord", -11, {}),
    (C["paanch"] + 0.15, "ui_glassy_snap", -13, {}),
    (C["baaki"] - 0.1, "wh_airy_soft", -11, {}),
    (C["baaki"] + 0.5, "pop_light", -16, {}),
    (C["naksha"], "pop_light", -16, {}),
    (C["chupa"], "pop_light", -16, {}),
    # the Pyrenees border, Llívia
    (C["pehle"] - 0.3, "whoosh_cinematic_fast", -8, {}),
    (C["ajeeb"] - 0.1, "light_sweep_magic", -13, {}),
    (C["dedh"] - 0.3, "wh_big_subtle_tonal", -7, {}),
    (C["dedh"] + 0.4, "ui_triple_click", -15, {}),
    (C["llivia"] - 0.1, "ui_pop_high", -11, {}),
    (C["spain4"] - 0.1, "swoosh_fast", -13, {}),
    # 1659: the treaty, one word
    (C["y1659"] - 0.1, "thud_low", -8, {}),
    (C["y1659"], "page_turn_glossy", -11, {}),
    (C["y1659"] + 0.3, "pen_cross", -16, {"align": "start", "dur": 1.2}),
    (C["gaon5"], "pen_cross", -12, {}),
    (C["shahar5"] - 0.05, "impact_blow", -9, {}),
    (C["shabd"], "shimmer_power", -13, {}),
    # west to the Bidasoa: Pheasant Island
    (C["pashchim"] - 0.1, "whoosh_cinematic_fast", -7, {}),
    (C["tapu"] - 0.3, "wh_magic_air", -8, {}),
    (C["tapu"], "waves_ocean", -27, {"align": "start", "dur": C["teesra"] - C["tapu"]}),
    (C["pheasant"] - 0.1, "bird_screech", -18, {}),
    (C["pheasant"] + 0.1, "wh_airy_soft", -12, {}),
    (C["badalta"] - 0.2, "swoosh_fast", -12, {}),
    (C["farvari"] - 0.15, "page_turn_info", -12, {}),
    (C["farvari"] - 0.05, "swoosh_fast", -13, {}),
    (C["agast"] - 0.15, "page_turn_info", -12, {}),
    (C["agast"] - 0.05, "swoosh_fast", -13, {}),
    (C["waqt"] - 0.05, "ui_glassy_snap", -11, {}),
    # Andorra and the two princes
    (C["teesra"] - 0.2, "wh_big_subtle_tonal", -7, {}),
    (C["andorra"] - 0.05, "ui_pop_high", -11, {}),
    (C["andorra"] + 0.1, "counter_infographic", -17, {"align": "start", "dur": 0.4}),
    (C["prince"], "shimmer_power", -13, {}),
    (C["rashtrapati"] - 0.35, "pop_light", -13, {}),
    (C["bishop"] - 0.9, "pop_light", -13, {}),
    # Britain, Gibraltar, 1713, the gate
    (C["chautha"] + 0.3, "wh_low_double" if False else "impact_whoosh_deep", -8, {}),
    (C["britain"] - 0.05, "ui_pop_high", -11, {}),
    (C["britain"] + 0.1, "counter_infographic", -17, {"align": "start", "dur": 0.4}),
    (C["dakshin"], "whoosh_cinematic_fast", -7, {}),
    (C["gib"] - 0.05, "thud_low", -9, {}),
    (C["gib"] + 0.2, "gulls_harbour", -26, {"align": "start", "skip": 12.0, "dur": C["darwaza"] - C["gib"]}),
    (C["y1713"] - 0.05, "thud_low", -7, {}),
    (C["y1713"] + 0.02, "boom_low", -11, {}),
    (C["darwaza"] - 0.2, "dock_creak", -14, {"align": "start", "dur": 1.6}),
    (C["darwaza"] + 0.2, "hit_wood_hard", -12, {}),
    (C["khulta"] - 0.3, "harbour", -24, {"align": "start", "skip": 20.0, "dur": 1.8}),
    # Morocco, Africa, the only European country
    (C["paanchva"] - 0.1, "impact_whoosh_deep", -8, {}),
    (C["africa10"], "wh_big_subtle_tonal", -8, {}),
    (C["morocco"] - 0.05, "ui_pop_high", -11, {}),
    (C["morocco"] + 0.1, "counter_infographic", -17, {"align": "start", "dur": 0.4}),
    (C["akela"] - 0.05, "ui_glassy_snap", -12, {}),
    # Ceuta, Melilla, the Peñón, 85 metres
    (C["do11"] - 0.2, "wh_fast", -9, {}),
    (C["ceuta"] - 0.05, "pop_light", -12, {}),
    (C["melilla"] - 0.05, "pop_light", -12, {}),
    (C["chattan"] - 0.25, "whoosh_cinematic_fast", -7, {}),
    (C["ret"] - 0.2, "wind_snow_gusty", -16, {"align": "start", "skip": 2.0, "dur": 2.4}),
    (C["duniya"] - 0.1, "riser_9", -16, {"align": "start", "dur": C["m85"] - C["duniya"] + 0.1}),
    (C["m85"] - 0.35, "typewriter_click", -14, {}),
    (C["m85"], "thud_low", -6, {}),
    (C["m85"] + 0.02, "impact_chord", -10, {}),
    # how many did you know?
    (C["sach"] - 0.1, "wh_big_subtle_tonal", -7, {}),
    (C["paanch12"] + 0.2, "light_sweep_magic", -12, {}),
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
    # a small dip for the count beat and the 85-metre reveal, so those hits land
    t_ax = np.arange(n) / SR
    dip = np.clip(1 - np.abs(t_ax - (C["paanch"] + 0.4)) / 1.2, 0, 1) * 0.6 + np.clip(1 - np.abs(t_ax - (C["m85"] + 0.3)) / 1.0, 0, 1) * 0.6
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
