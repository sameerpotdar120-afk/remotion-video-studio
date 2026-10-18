"""Mix the Thailand video: the creator's voice on top, a playful bed (a lighter piece under the diplomats' skit), and an
effect on every visual hit (the colonies filling, the "?", the tug of war, the volleys, the clash, the handshake, the
gunboat, the losses, the King's badges and shield, the heart, the stamp).

    python3 tools/mix_thailand.py        # writes public/thailand/audio/mix.wav

Cue times come from src/thailand/edit/timing.json. Ducking works like a sidechain compressor (music about 21 dB under
the voice while talking, about 11 dB under in pauses); effects duck 4 dB under the voice.
Music: Mixkit "Kidding Around" and "Summer Fun", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "thailand" / "audio"
T = json.load(open(ROOT / "src" / "thailand" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]
CUT_PALACE = (C["hua8"] - 0.3, C["bas15"] - 0.12)

# (file, offset into the file, section start): playful → lighter under the skit → playful again
MUSIC = [("music_kidding_around_mixkit.mp3", 0.0, 0.0), ("music_summer_fun_mixkit.mp3", 2.0, None), ("music_kidding_around_mixkit.mp3", 36.0, None)]
MUSIC_CUTS = [0.0, CUT_PALACE[0], CUT_PALACE[1]]
MUSIC_PAUSE, MUSIC_TALK = -12.0, -22.0
SFX_DUCK = 4.0
HPF = {"subdrop": 30, "boom": 35, "thud_low": 35, "waves_soft": 120, "cannon": 40, "drum_hit_big": 35, "heartbeat": 30}

CUES = [
    # hook: British India, the 200 counter, the colonies popping in, the dodge, the "?"
    (0.05, "wh_big_tonal", -13, {}), (C["britain1"], "impact_chord", -13, {}), (C["britain1"] + 0.15, "pop_high", -15, {}),
    (C["n200_1"] - 0.1, "ui_snap", -17, {}), *[(C["n200_1"] + i * 0.07, "ui_perc", -21, {}) for i in range(9)], (C["n200_1"] + 0.8, "chime_hit", -13, {}),
    (C["bagal1"], "wh_air", -12, {}), *[(C["bagal1"] + d + 0.1, "pop_light", -15, {}) for d in (0.35, 0.6, 0.85, 1.0, 1.25, 1.5, 1.7)],
    (C["ghulam1"] - 0.05, "chain_drop", -15, {}), (C["ghulam1"] + 0.75, "metal_thud", -14, {}), (C["ghulam1"] + 0.8, "toon_whoosh", -15, {}),
    (C["kaise1"] - 0.1, "toon_whoosh", -12, {}), (C["kaise1"] + 0.15, "pop_high", -12, {}), (C["kaise1"] + 0.4, "ui_pop", -15, {}),
    (C["thailand2"], "shimmer_power", -14, {}), (C["siam2"], "ui_glassy_snap", -13, {}), (C["simple3"], "ui_pop", -13, {}),
    # the tug of war
    (C["britain3"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["britain3"] + 0.4, "scratch", -16, {}), (C["fayda3"] + 0.2, "toon_whoosh", -13, {}),
    # Britain from India: the arrow, the battle's three volleys, Burma taken
    (C["paschim4"] - 0.2, "whoosh_cinematic_fast", -10, {}), (C["india4"] + 0.4, "riser", -17, {"dur": 0.7}),
    (C["teen4"] - 0.12, "wh_fast", -11, {}), *[(C["teen4"] - 0.12 + v / 60, "cannon", -14, {}) for v in (8, 40, 72)], (C["teen4"], "crowd_charge", -20, {"dur": 1.6}),
    (C["burma4"] - 0.06, "whoosh_cinematic_fast", -11, {}), (C["burma4"] + 0.05, "thud", -12, {}), (C["burma4"] + 0.1, "pop_high", -14, {}), (C["british4"], "ui_glassy_snap", -14, {}),
    # France from the east
    (C["poorab5"], "wh_soft", -12, {}), (C["poorab5"] + 0.3, "pop_light", -14, {}), (C["vietnam5"], "impact_chord", -13, {}), (C["cambodia5"], "pop_high", -13, {}),
    # squeezed: the chevrons, the flexing, the balance, the electric border, the clash
    *[(C["beech6"] + i * 0.5, "ui_perc", -18, {}) for i in range(4)],
    (C["dono7"] - 0.1, "whoosh_cinematic_fast", -10, {}), (C["dono7"] + 0.5, "toon_whoosh", -13, {}), (C["dono7"] + 0.85, "punch", -13, {}),
    (C["dono7"] + 1.2, "toon_whoosh", -13, {}), (C["dono7"] + 1.55, "punch", -13, {}),
    (C["dikkat7"], "wh_fast", -12, {}), (C["leta7"] - 0.55, "toon_whoosh", -13, {}), (C["leta7"], "metal_thud", -11, {}), (C["leta7"] + 0.1, "gate_metal", -16, {}),
    (C["sarhad7"] - 0.08, "whoosh_cinematic_fast", -11, {}), (C["sarhad7"] + 0.15, "spark_shock", -14, {}), (C["sarhad7"] + 0.6, "glitch_electric_small", -16, {}),
    (C["jang7"] - 0.35, "riser", -16, {"dur": 0.35}), (C["jang7"], "boom", -9, {}), (C["jang7"] + 0.02, "impact_chord", -12, {}),
    # the skit
    (C["hua8"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["l9"] - 0.2, "toon_whoosh", -16, {}), (C["l10"], "pop_light", -17, {}), (C["l11"], "toon_whoosh", -15, {}),
    (C["l12"] + 0.1, "sword_hit", -15, {}), (C["l12"] + 0.15, "stinger", -17, {}), (C["l14"], "pop_high", -13, {}), (C["l14"] + 0.08, "whoosh_sparkle", -14, {}),
    # the buffer: stripes, gloves, 1896, the core, the padlock
    (C["bas15"] - 0.12, "whoosh_cinematic_fast", -10, {}), (C["bas15"] + 0.1, "light_sweep_magic", -14, {}),
    (C["gaddi15"] - 0.3, "toon_whoosh", -13, {}), (C["gaddi15"] + 0.1, "punch", -15, {}), (C["n1896_15"], "impact_chord", -13, {}),
    (C["chao15"], "shimmer_power", -14, {}), (C["koi15"] + 0.35, "gate_metal", -13, {}),
    # the spheres, the edges
    (C["matlab16"], "wh_soft", -12, {}), (C["safe16"], "ui_glassy_snap", -13, {}), (C["kinare16"], "tap_negative", -13, {}),
    # the gunboats, then the losses
    (C["french17"] - 0.05, "whoosh_cinematic_fast", -10, {}), (C["french17"] + 0.1, "waves_soft", -17, {"dur": 3.0}), (C["bangkok17"] - 0.2, "cannon", -14, {}),
    (C["bangkok17"] + 0.2, "ui_pop", -14, {}), (C["laos17"] - 0.1, "wh_air", -12, {}), (C["laos17"] + 0.3, "thud_low", -11, {}),
    (C["cambodia17"], "thud", -13, {}), (C["cambodia17"] + 0.2, "ui_pop", -15, {}), (C["malaya17"], "thud", -13, {}), (C["malaya17"] + 0.2, "ui_pop", -15, {}),
    # the King: badges, the shield, the arrows bouncing off
    (C["rajaon18"] - 0.3, "whoosh_cinematic_fast", -10, {}), (C["rajaon18"] + 0.2, "gong", -17, {}), (C["modern18"] - 0.2, "magic", -16, {}),
    *[(C[k] - 0.0, "pop_high", -13, {}) for k in ("army18", "railway18", "kanoon18")], (C["railway18"] + 0.1, "train", -19, {"dur": 0.9}),
    (C["hamla18"], "shimmer_power", -13, {}), (C["hamla18"] + 0.5, "metal_thud", -13, {}), (C["hamla18"] + 0.73, "metal_thud", -14, {}), (C["bahana18"], "ui_glassy_snap", -14, {}),
    # the heart, never a colony, the send
    (C["kinare19"] - 0.12, "whoosh_cinematic_fast", -11, {}), (C["dil19"] - 0.1, "heartbeat", -13, {"dur": 1.6}),
    (C["isiliye20"] + 0.2, "wh_big_tonal", -13, {}), (C["colony20"], "drum_hit_big", -11, {}), (C["colony20"] + 0.05, "impact_chord", -13, {}),
    (C["video21"] - 0.6, "wh_soft", -13, {}), (C["video21"] - 0.15, "pop_high", -13, {}), (C["video21"] + 1.0, "toon_whoosh", -14, {}),
]


def main() -> None:
    n = int(DURATION * SR)
    voice = np.zeros((n, 2), np.float32)
    v = ff(ROOT / "public" / "thailand" / "vo" / "thailand_vo.mp3", VOICE_CHAIN)[:n]
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x + 0.2)) / 0.7, 0, 1) for x in (C["jang7"], C["l14"], C["laos17"], C["colony20"]))
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
