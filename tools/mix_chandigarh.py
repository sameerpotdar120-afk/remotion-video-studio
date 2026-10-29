"""Mix the Chandigarh video as a seamless loop: the creator's voice on top, Mixkit "A Special Feeling" as the bed (warm
and rhythmic, mixed loud like the reference's), and an effect on every visual hit, the reference's way: whooshes on
every transition and camera move, pops and clicks on every pill, tag, icon and type-on, impacts on the slams.

    python3 tools/mix_chandigarh.py        # writes public/chandigarh/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end wraps round to the start. The track is shorter than the
video, so it is first extended by crossfading its opening back in after its end.
Ducking works like a sidechain compressor (music about 15 dB under the voice while talking, about 8 dB under in
pauses, louder than our usual, as in the reference); effects duck 4 dB under the voice. Cue times come from
src/chandigarh/edit/timing.json.
Music: Mixkit "A Special Feeling" (Michael Ramir C.), Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "chandigarh" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "chandigarh" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_a_special_feeling_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 90.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -8.0, -15.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "braam": 35, "boom": 35, "wh_wind_gust": 120, "rain_light": 120, "heartbeat": 30, "crowd_cheer": 150}

CUES = [
    # line 1: the push on India, the pin and its ripple, the bubble (Capitol, computer ✕, the body), the heartbeat, the bubble closes
    (0.0, "wh_wind_gust", -26, {"dur": 2.0, "align": "start"}), (C["shahar1"] - 0.1, "pop_high", -15, {}), (C["shahar1"] + 0.15, "ui_glassy_snap", -18, {}),
    (C["shahar1"] + 0.35, "whoosh_sparkle", -17, {}), (C["computer1"], "card_flip", -14, {}), (C["computer1"] + 0.75, "pen_cross", -13, {}), (C["computer1"] + 0.8, "metal_thud", -15, {}),
    (C["balki1"], "card_flip", -14, {}), (C["zinda1"], "heartbeat", -15, {"dur": 1.4, "align": "start"}), (C["design1"] + 0.5, "wh_fast", -16, {}),
    # line 2: the push onto the city; head, heart, lungs, veins; the pull back; the tag on "Chandigarh"
    (C["jee2"] - 0.6, "whoosh_cinematic_fast", -13, {}), (C["jee2"] + 0.1, "pop_light", -16, {}), (C["sir2"] - 0.1, "ui_pop", -14, {}), (C["dil2"] - 0.1, "ui_pop", -14, {}),
    (C["dil2"] + 0.2, "heartbeat", -17, {"dur": 1.6, "align": "start"}), (C["saans2"], "ui_pop", -14, {}), (C["phephde2"], "wh_wind_gust", -21, {"dur": 1.2, "align": "start"}),
    (C["nasen2"] - 0.1, "riser", -19, {"dur": 0.9, "align": "start"}), (C["hum2"] + 0.1, "whoosh_cinematic_fast", -13, {}), (C["chd2"], "impact_chord", -13, {}), (C["chd2"] + 0.05, "ui_snap", -15, {}),
    # line 3: 1947, partition: Pakistan wipes, Punjab glows, the split, Lahore, the mosque flies off; the push in; "PUNJAB"; the "?" hops
    *[(C["y1947"] - 0.25 + i * 0.08, "typewriter_click", -20, {}) for i in range(4)], (C["y1947"] + 0.1, "chime_hit", -18, {}),
    (C["bantwara3"] - 0.1, "braam", -15, {}), (C["bantwara3"], "ui_wipe", -16, {}), (C["punjab3"] - 0.1, "light_transition_magic", -18, {}),
    (C["lahore3"] - 0.1, "whoosh_cinematic_fast", -14, {}), (C["lahore3"] + 0.1, "ui_snap", -15, {}), (C["pakistan3"] - 0.45, "pop_high", -15, {}),
    (C["pakistan3"] + 0.45, "wh_fast", -15, {}), (C["pakistan3"] + 0.75, "pop_light", -15, {}), (C["azaad3"] - 0.1, "whoosh_sparkle", -16, {}),
    *[(C["azaad3"] + i * 0.07, "typewriter_click", -21, {}) for i in range(6)],
    *[(C["chahiye3"] - 0.1 + i * (C["zameen4"] - 0.4 - C["chahiye3"]) / 5, "toon_boing", -20, {}) for i in range(5)],
    # line 4: the dissolve and the push in, the ribbon, the site, the ✓, the slope, rain, the icons, ripples, the blob reveal
    (C["zameen4"] - 0.15, "whoosh_cinematic_fast", -13, {}), (C["shivalik4"] - 0.15, "swoosh_windy", -16, {}), (C["shivalik4"] + 0.1, "light_sweep_magic", -18, {}),
    (C["neeche4"] - 0.1, "ui_glassy_snap", -15, {}), (C["ittefaq4"], "drum_hit_big", -16, {}), (C["ittefaq4"] + 0.12, "pop_high", -15, {}),
    (C["dhalaan4"] - 0.1, "wh_fast", -17, {}), (C["baarish4"], "rain_light", -20, {"dur": 2.0, "align": "start"}), (C["baarish4"] - 0.1, "ui_pop", -14, {}),
    (C["mitti4"], "card_flip", -14, {}), (C["paani4"], "card_flip", -14, {}), (C["paani4"] + 0.1, "chime_hit", -19, {}),
    (C["paas4"] - 0.1, "whoosh_sparkle", -14, {}), (C["paas4"] + 0.3, "wh_big_tonal", -15, {}), (C["paas4"] + 0.55, "ui_snap", -17, {}), (C["paas4"] + 0.6, "bell", -22, {}),
    # the UT on the city; Le Corbusier; the glitter wipe, the pencil line and its ✕; the wipe to paper; the morph
    (C["chd4"] - 0.3, "light_transition_magic", -16, {}), (C["chd4"] + 0.05, "ui_snap", -15, {}), (C["design5"] + 0.5, "impact_whoosh_deep", -16, {}),
    (C["corb5"] - 0.3, "ui_glassy_snap", -15, {}), *[(C["corb5"] - 0.25 + i * 0.06, "typewriter_click", -22, {}) for i in range(6)],
    (C["unhone5"] - 0.15, "ui_wipe", -14, {}), (C["unhone5"], "whoosh_sparkle", -17, {}), (C["lakeeren5"] - 0.35, "pencil_circles", -17, {"dur": 0.7, "align": "start"}),
    (C["lakeeren5"] + 0.3, "pen_cross", -13, {}), (C["lakeeren5"] + 0.32, "metal_thud", -16, {}), (C["jism5"] - 0.35, "ui_wipe", -14, {}), (C["jism5"] - 0.1, "paper_quick_move", -15, {}),
    (C["jism5"] + 0.15, "swoosh_windy", -18, {}), (C["sabse6"], "chime_hit", -18, {}), (C["sabse6"] + 1.15, "wh_fast", -16, {}),
    # line 6: the Capitol drops, its label, the brush wipe, the three buildings
    (C["capitol6"] - 0.1, "thud", -13, {}), (C["capitol6"] + 0.1, "ui_pop", -16, {}), *[(C["capitol6"] + 0.15 + i * 0.06, "typewriter_click", -22, {}) for i in range(5)],
    (C["jahan6"] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["vidhan6"] - 0.1, "ui_glassy_snap", -15, {}),
    (C["secretariat6"] - 0.1, "wh_fast", -15, {}), (C["secretariat6"], "ui_snap", -15, {}), (C["highcourt6"] - 0.1, "wh_fast", -15, {}), (C["highcourt6"], "ui_snap", -15, {}),
    # line 7: the tear back to the plan, the sectors paint in, the zoom-through, 800 and 1200, the ring, three cards, they fold in
    (C["poora7"] - 0.35, "paper_quick_move", -13, {}), (C["poora7"], "light_sweep_magic", -17, {}), (C["poora7"] + 0.9, "ui_pop", -17, {}),
    (C["sector7"] - 0.1, "whoosh_cinematic_fast", -13, {}), (C["m800"] - 0.15, "counter_ticking", -19, {"dur": 0.6}), (C["m800"] + 0.45, "ui_glassy_snap", -16, {}),
    (C["m1200"] - 0.1, "counter_ticking", -19, {"dur": 0.6}), (C["m1200"] + 0.5, "ui_glassy_snap", -16, {}), (C["apne7"], "chime_hit", -18, {}),
    (C["ghar7"] - 0.15, "card_flip", -13, {}), (C["school7"] - 0.15, "card_flip", -13, {}), (C["hospital7"] - 0.15, "card_flip", -13, {}),
    (C["sab7"] + 0.05, "wh_fast", -16, {}), (C["sab7"] + 0.25, "pop_high", -15, {}),
    # line 8: Sector 17 turns red and beats; the car brakes and gets its ✕; the cut to the spotlight; the pill; the plaza card
    (C["dil8"] - 0.2, "whoosh_cinematic_fast", -14, {}), (C["s17"] - 0.1, "impact_whoosh_deep", -16, {}), (C["s17"], "heartbeat", -16, {"dur": 1.8, "align": "start"}),
    (C["gaadiyan8"] - 0.35, "oldcar", -19, {"dur": 0.6, "align": "start"}), (C["gaadiyan8"] + 0.05, "pen_cross", -13, {}), (C["gaadiyan8"] + 0.07, "heavy_knock", -15, {}),
    (C["sirf8"], "wh_big_tonal", -14, {}), (C["sirf8"] + 0.1, "light_sweep_magic", -18, {}), (C["ise8"] - 0.1, "card_flip", -14, {}),
    (C["paradise8"] - 0.55, "ui_glassy_snap", -15, {}), *[(C["paradise8"] - 0.5 + i * 0.06, "typewriter_click", -22, {}) for i in range(8)],
    # line 9: back to the plan, pale; roads draw, the 1→7 count, the V1 tags off the edges, the pill; the zoom to the footpaths
    (C["nasen9"] - 0.15, "whoosh_cinematic_fast", -14, {}), (C["v1a"] - 0.3, "swoosh_windy", -16, {}), (C["saat9"] - 0.2, "counter_ticking", -19, {"dur": 0.5}),
    (C["saat9"] + 0.35, "ui_glassy_snap", -16, {}), *[(C["duniya9"] - 0.4 + i * 0.12, "pop_light", -16, {}) for i in range(4)], (C["v1b"], "ui_snap", -15, {}),
    (C["v7b"] - 0.1, "whoosh_cinematic_fast", -13, {}), (C["v7b"], "ui_snap", -15, {}), (C["paidal9"], "cartoon_pops", -21, {}),
    # line 10: the zoom out, the Leisure Valley draws, gardens pop, the lungs, the wind
    (C["phephde10"] - 0.1, "wh_fast", -16, {}), (C["leisure10"] - 0.2, "swoosh_windy", -16, {}), *[(C["leisure10"] + 0.5 + i * 0.09, "pop_light", -19, {}) for i in range(5)],
    (C["saaf10"] - 0.3, "ui_pop", -14, {}), (C["saaf10"] - 0.2, "wh_wind_gust", -18, {"dur": 2.4, "align": "start"}),
    # line 11: the brush to the Secretariat, the heat pill, the strips, the cool air, the temperature drops; the High Court roof, the sun, its label
    (C["imaraten11"] - 0.25, "whoosh_cinematic_fast", -13, {}), (C["mausam11"] - 0.1, "ui_glassy_snap", -16, {}), (C["secretariat11"] - 0.1, "light_sweep_magic", -17, {}),
    (C["garmi11"] - 0.1, "wh_wind_gust", -18, {"dur": 1.6, "align": "start"}), (C["garmi11"], "ui_snap", -16, {}), (C["thanda11"] - 0.2, "counter_ticking", -19, {"dur": 0.5}),
    (C["highcourt11"] - 0.05, "wh_fast", -15, {}), (C["mudi11"] - 0.1, "light_transition_magic", -17, {}), (C["dhoop11"] - 0.4, "whoosh_sparkle", -16, {}),
    (C["dhoop11"] + 0.1, "chime_hit", -18, {}), (C["mudi11"] + 0.2, "ui_glassy_snap", -16, {}),
    # line 12: the tear back to the plan, the Capitol glows, 2016, the seal slams, the sparkles, the pill
    (C["isi12"] - 0.1, "paper_quick_move", -13, {}), (C["isi12"] + 0.2, "riser", -20, {"dur": 1.0, "align": "start"}), (C["y2016"] - 0.2, "ui_glassy_snap", -15, {}),
    (C["unesco12"] - 0.25, "wh_fast", -15, {}), (C["unesco12"] + 0.05, "boom", -14, {}), (C["unesco12"] + 0.05, "impact_chord", -14, {}),
    (C["world12"], "whoosh_sparkle", -16, {}), (C["world12"] - 0.1, "ui_snap", -16, {}), (C["world12"] + 0.2, "crowd_cheer", -24, {"dur": 1.8, "align": "start"}),
    # line 13: the pull back, the body draws over the plan, the three organs pulse; the wipe back to the map, the pull out to frame 0
    (C["corb13"] - 0.1, "whoosh_cinematic_fast", -14, {}), (C["corb13"] + 0.2, "light_sweep_magic", -17, {}), (C["zinda13"] - 0.15, "ui_pop", -15, {}),
    (C["zinda13"], "heartbeat", -15, {"dur": 1.5, "align": "start"}), (C["isiliye13"] - 0.25, "ui_wipe", -14, {}), (DURATION - 0.8, "whoosh_cinematic_fast", -13, {}),
]


def place(buf: np.ndarray, a: np.ndarray, start: float) -> None:
    """Add a at start (seconds); whatever runs past the end wraps round to the beginning, since the video loops."""
    n = len(buf)
    s = int(round(start * SR)) % n
    k = min(len(a), n - s)
    buf[s: s + k] += a[:k]
    if len(a) > k:
        buf[: len(a) - k] += a[k: k + n]


def main() -> None:
    n = int(round(DURATION * SR))
    voice = np.zeros((n, 2), np.float32)
    v = ff(VO, VOICE_CHAIN)[:n]
    voice[: len(v)] = v
    vr = win_rms_db(voice)
    talking = vr > vr.max() - 30
    v_ref = 10 * np.log10(np.mean((voice[talking] ** 2).mean(1)))
    from scipy import ndimage
    hop = SR // 100
    sp = ndimage.binary_closing(talking[::hop], structure=np.ones(15))
    speech = np.repeat(sp, hop)[:n]
    speech = np.pad(speech, (0, n - len(speech)), constant_values=False)
    # the sidechain envelope, computed over two loops so its state at the start matches the end
    act2 = envelope(np.concatenate([speech, speech]).astype(np.float32), 0.025, 0.12)
    activity = act2[n:][:, None]

    # the bed: its tail past the end is equal-power crossfaded into the head, so the loop has no seam
    m0 = ff(AUD / MUSIC, "anull")[int(MUSIC_OFF * SR):]
    # extend the track: from EXTEND_AT its opening fades back in (equal power) and carries on
    e, xe = int(EXTEND_AT * SR), int(EXTEND_XF * SR)
    w = np.linspace(0, 1, xe, dtype=np.float32)[:, None]
    m = np.concatenate([m0[:e], m0[e: e + xe] * np.cos(w * np.pi / 2) + m0[:xe] * np.sin(w * np.pi / 2), m0[xe:]])
    x = int(LOOP_XF * SR)
    assert len(m) >= n + x
    music = m[:n].copy()
    u = np.linspace(0, 1, x, dtype=np.float32)[:, None]
    music[:x] = music[:x] * np.sin(u * np.pi / 2) + m[n: n + x] * np.cos(u * np.pi / 2)
    music *= db(v_ref - 10 * np.log10(np.mean(music ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["chd2"], C["bantwara3"], C["unesco12"] + 0.05))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]

    sfx = np.zeros((n, 2), np.float32)
    cache: dict[str, np.ndarray] = {}
    for t, name, level, opt in CUES:
        if name not in cache:
            cache[name] = ff(AUD / "sfx" / f"{name}.mp3", f"highpass=f={HPF.get(name, 70)}")
        a = cache[name]
        if opt.get("dur"):
            a = fade(a[: int(opt["dur"] * SR)].copy(), 0.08, 0.35)
        r = win_rms_db(a)
        a = a * db(v_ref + level - r.max())
        start = t - r.argmax() / SR if opt.get("align", "peak") == "peak" else t
        place(sfx, a, start)
    sfx *= db(-SFX_DUCK * activity)

    mix = voice + music + sfx
    tmp = AUD / "_mix_raw.wav"
    write_wav(tmp, mix / max(1.0, float(np.abs(mix).max()) / 0.98))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                    "acompressor=threshold=-14dB:ratio=2:attack=10:release=150,loudnorm=I=-14:TP=-1.0:LRA=9",
                    "-ar", str(SR), str(AUD / "mix.wav")], check=True)
    tmp.unlink()
    rms = lambda y: 10 * np.log10(np.mean((y**2).mean(1)) + 1e-12)
    print(f"cues {len(CUES)}  voice {rms(voice[talking]):.1f}  music talking {rms(music[speech]):.1f}  music pauses {rms(music[~speech]):.1f}  "
          f"loudest sfx 50ms {win_rms_db(sfx).max() - v_ref:+.1f} dB vs voice")


if __name__ == "__main__":
    main()
