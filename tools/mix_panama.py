"""Mix the Panama Canal video as a seamless loop: the creator's voice on top, Mixkit "Discover" as the bed, and an
effect on every visual hit (the ship queue and the gold overtake, the counters, the stamps, the whip zooms, salt and
fresh, the locks, the water arc, the pools draining, the rain, the drought, the waiting ships, the auction's gavel,
the record, the city, the balance, the dam, the heartbeat and its flatline, the long route round South America).

    python3 tools/mix_panama.py        # writes public/panama/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too: no fade-in or fade-out, the bed's tail past the end is
crossfaded into its head, and anything that rings past the end (the final whoosh) wraps round to the start.
Ducking works like a sidechain compressor (music about 21 dB under the voice while talking, about 11 dB under in
pauses); effects duck 4 dB under the voice. Cue times come from src/panama/edit/timing.json.
Music: Mixkit "Discover", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "panama" / "audio"
VO = ROOT / "public" / "panama" / "vo" / "panama_vo.mp3"
T = json.load(open(ROOT / "src" / "panama" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_discover_mixkit.mp3", 0.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -11.0, -21.0
SFX_DUCK = 4.0
HPF = {"boom": 35, "drum_hit_big": 35, "thunder_impact": 40, "thunder_crash": 40, "heartbeat": 30, "waves_soft": 120, "rain_light": 150, "splash": 80}

# the scene cuts (as in src/panama/edit/cam.ts SCENES), each with a white flash
CUTS = [C["locks2"] - 0.25, C["khel3"] - 0.4, C["olympic3"] - 0.8, C["hisaab4"] - 0.2, C["n2023_5"] - 0.45, C["jaise5"] - 0.2,
        C["auction5"] - 0.2, C["sept5"] - 0.25, C["ships6"] - 0.3, C["business6"] - 0.6]
AU0 = C["auction5"] - 0.2 + 0.1
GAVEL = [AU0 + h / 60 for h in (24, 48, 72, 96)]
CUES = [
    # line 1: the queue (a bed of soft waves), the arrow, the $5.3M counter, the gold overtake, क्यों, Panama, the dry lake
    (0.0, "waves_soft", -24, {"dur": 6.4, "align": "start"}), (0.05, "pop_high", -16, {}), (C["n53_1"], "counter_ticking", -17, {"dur": 1.1}),
    (C["n53_1"] + 1.15, "coins_ting", -13, {}), (C["line1"] - 0.9, "whoosh_sparkle", -14, {}), (C["line1"] - 0.1, "pop_high", -14, {}),
    (C["kyun1"], "toon_boing", -15, {}), (C["kyunki1"] - 0.1, "whoosh_cinematic_fast", -11, {}), (C["kyunki1"] + 0.3, "pop_light", -15, {}),
    (C["paani1"], "ui_bubbles", -17, {}), (C["khatam1"], "heavy_knock", -11, {}), (C["khatam1"] + 0.02, "drum_hit_big", -15, {}),
    # line 2: अजीब, the canal line drawing, salt ✗ ✗, fresh ✓, Gatun Lake, man-made, मीठा पानी
    (C["ajeeb2"], "wh_big_tonal", -14, {}), (C["ajeeb2"] + 0.25, "ui_wipe", -16, {}), (C["samundar2"], "pen_cross", -15, {}), (C["samundar2"] + 0.4, "pen_cross", -16, {}),
    (C["gatun2"] + 0.1, "chime_hit", -14, {}), (C["gatun2"] + 0.4, "pop_high", -15, {}), (C["insaan2"], "ui_snap", -15, {}), (C["meethe2"], "ui_bubbles", -16, {}),
    # the locks: the cut, the water rising and the 26 m lift, down the other side
    (CUTS[0] - 0.05, "light_transition_magic", -15, {}), (C["locks2"] + 0.3, "splash", -19, {"dur": 2.0}), (C["n26_2"], "riser", -18, {"dur": 1.6}),
    (C["utha2"] + 0.4, "ui_glassy_snap", -14, {}), (C["doosri2"], "whoosh_transition_fast", -15, {}), (C["neeche2"] + 0.2, "splash", -20, {"dur": 1.6}),
    # line 3: पानी का खेल, the water arc pouring into the Pacific, 20 crore litres, the pools draining
    (CUTS[1] - 0.05, "light_transition_magic", -15, {}), (C["khel3"] + 0.1, "pop_high", -15, {}), (C["n20_3"] - 1.2, "whoosh_sparkle", -15, {}),
    (C["n20_3"] - 0.3, "splash", -15, {}), (C["n20_3"], "counter_ticking", -17, {"dur": 1.2}), (C["n20_3"] + 1.25, "ui_glassy_snap", -14, {}), (C["samundar3"], "pop_light", -15, {}),
    (CUTS[2] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["olympic3"], "counter_ticking", -18, {"dur": 0.9}), (C["khatam3"], "ui_bubbles", -14, {}), (C["khatam3"] + 0.1, "splash", -16, {"dur": 1.8}),
    # line 4: हिसाब, 36 ships a day, the rain cloud
    (CUTS[3] - 0.05, "light_transition_magic", -15, {}), (C["hisaab4"] + 0.1, "typewriter_click", -18, {}), (C["n36_4"], "counter_ticking", -17, {"dur": 0.7}),
    (C["n36_4"] + 0.75, "pop_high", -14, {}), (C["baarish4"] - 0.5, "whoosh_sparkle", -16, {}), (C["baarish4"], "rain_light", -17, {"dur": 1.6}), (C["baarish4"] + 0.1, "thunder_crash", -20, {}),
    # line 5: the drought (2023, the sun, the kid's tears), 36 → 22, the waiting ships, the line
    (CUTS[4] - 0.05, "impact_whoosh_deep", -12, {}), (C["n2023_5"], "impact_chord", -13, {}), (C["n2023_5"] + 0.5, "wind_howl", -24, {"dur": 3.0}),
    (C["n22_5"] - 0.9, "counter_ticking", -18, {"dur": 0.8}), (C["n22_5"], "metal_thud", -12, {}), (C["n22_5"] + 0.05, "toon_boing", -16, {}),
    (CUTS[5] - 0.05, "whoosh_cinematic_fast", -13, {}), *[(C["jaise5"] + 0.4 + i * 0.033, "pop_light", -24, {}) for i in range(16)],
    (C["jaise5"] + 1.0, "pen_cross", -16, {}), (C["line5"] + 0.4, "whoosh_transition_fast", -14, {}), (C["line5"] + 0.9, "pop_high", -15, {}),
    # the auction: four gavel strikes, the bids, then the record
    (CUTS[6] - 0.05, "light_transition_magic", -14, {}), (CUTS[6] + 0.15, "pop_high", -14, {}),
    *[(g, "hammer", -11, {"dur": 0.6}) for g in GAVEL], (GAVEL[-1] + 0.05, "coins_ting", -13, {}),
    (CUTS[7] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["sept5"], "page_turn", -15, {}), (C["sept5"] + 0.15, "pop_high", -15, {}),
    (C["n53_5"], "counter_ticking", -17, {"dur": 1.0}), (C["n53_5"] + 1.05, "coins_ting", -13, {}), (C["record5"], "heavy_knock", -10, {}), (C["record5"] + 0.03, "boom", -15, {}),
    # line 6: Panama City, the lake bubble, half of Panama drinks it; the balance
    (CUTS[8] - 0.05, "light_transition_magic", -15, {}), (C["gatun6"], "ui_bubbles", -15, {}), (C["aadhe6"], "pop_high", -15, {}), (C["peete6"], "splash", -22, {"dur": 0.8}),
    (CUTS[9] - 0.05, "whoosh_cinematic_fast", -13, {}), (C["business6"], "ui_snap", -15, {}), (C["peene6"], "ui_snap", -15, {}),
    # line 7: Río Indio, the dam rising, ज़िंदा: the heartbeat starts
    (C["rio7"] - 0.4, "whoosh_sparkle", -14, {}), (C["rio7"] + 0.1, "waves_soft", -24, {"dur": 2.0}), (C["dam7"], "metal_thud", -12, {}), (C["dam7"] + 0.05, "drum_hit_big", -16, {}),
    (C["zinda7"] - 0.1, "heartbeat", -15, {"dur": C["khatam8"] - C["zinda7"] + 0.2, "align": "start"}),
    *[(C["zinda7"] + 0.1 + i * 0.75, "beep_on", -20, {}) for i in range(int((C["khatam8"] - C["zinda7"] - 0.2) / 0.75))],
    # line 8: सोचो, the water runs out (flatline), the long way round, +13,000 km, the whip back to frame 0
    (C["socho8"], "wh_big_tonal", -15, {}), (C["khatam8"], "beep_off", -13, {"dur": 1.4}), (C["khatam8"] + 0.02, "braam", -14, {}),
    (C["samerica8"] - 0.5, "whoosh_cinematic_fast", -11, {}), (C["samerica8"] + 0.4, "riser", -19, {"dur": 2.4}), (C["samerica8"] + 0.5, "pop_high", -15, {}),
    (C["n13k_8"] - 0.4, "counter_ticking", -18, {"dur": 0.8}), (C["n13k_8"] + 0.3, "impact_chord", -14, {}),
    (DURATION - 0.75, "whoosh_cinematic_fast", -11, {}), (DURATION - 0.05, "waves_soft", -24, {"dur": 1.2, "align": "start"}),
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
    m = ff(AUD / MUSIC, "anull")[int(MUSIC_OFF * SR):]
    x = int(LOOP_XF * SR)
    assert len(m) >= n + x
    music = m[:n].copy()
    u = np.linspace(0, 1, x, dtype=np.float32)[:, None]
    music[:x] = music[:x] * np.sin(u * np.pi / 2) + m[n: n + x] * np.cos(u * np.pi / 2)
    music *= db(v_ref - 10 * np.log10(np.mean(music ** 2) + 1e-12))
    music *= db(MUSIC_PAUSE + (MUSIC_TALK - MUSIC_PAUSE) * activity)
    t_ax = np.arange(n) / SR
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["khatam1"], C["n22_5"], C["record5"], C["khatam8"]))
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
