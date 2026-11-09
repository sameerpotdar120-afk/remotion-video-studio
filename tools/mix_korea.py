"""Mix the Korea video as a seamless loop: the creator's voice on top, Mixkit "I Won't Surrender" as the bed, and an
effect on every visual hit: the stamp on "khatam", the DMZ push-in, wire and mines, the pull-outs, the USSR arrows, the
officers' pencil and stopwatch, the 38th parallel, the badges, the Null splits, booms under the front-line tides, the
long pull-out to India, counters under the Field Ambulance numbers, the armistice signatures and the "aaj tak nahi" stamp.

    python3 tools/mix_korea.py        # writes public/korea/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "I Won't Surrender", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "korea" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "korea" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_i_wont_surrender_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 112.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    # the hook: the stamp on "khatam", 73 years counter, the paper, the line flares, families, the push to the DMZ
    (C["khatam"], "impact_trailer_epic", -14, {}), (C["n73"] - 0.1, "counter_ticking", -22, {"dur": 0.8}), (C["sign"] - 0.3, "paper_slide", -16, {}),
    (C["line1"], "light_sweep_magic", -18, {}), (C["parivar"] - 0.1, "pop_light", -18, {}), (C["parivar"] + 0.1, "pop_light", -18, {}),
    (C["line1"] + 0.2, "wh_air_smooth", -17, {}), (C["dmz"] + 0.1, "impact_whoosh_deep", -16, {}), (C["n4"] - 0.1, "pop_hard", -16, {}),
    (C["taar"] - 0.2, "wind_wire", -20, {"dur": 4.6, "align": "start"}), *[(C["surang"] + i * 0.12, "pop_high", -19, {}) for i in range(4)],
    (C["bandook"] - 0.1, "metal_thud", -16, {}), (C["bandook"] + 0.1, "metal_thud", -17, {}),
    # 1945: one country, Japan's 35 years, the USSR from the north, America worries
    (C["ek"] - 0.1, "whoosh_transition_fast", -16, {}), (C["y1945"] - 0.1, "pop_hard", -16, {}), (C["japan"] - 0.1, "light_sweep_magic", -18, {}),
    (C["n35"] - 0.1, "ui_pop", -17, {}), (C["phir"], "wh_big_tonal", -17, {}), (C["soviet"] - 0.05, "drum_hit_big", -16, {}),
    (C["uttar"] - 0.2, "swoosh_fast", -17, {}), (C["america1"] - 0.1, "wh_air_smooth", -17, {}), (C["poora1"] - 0.05, "pop_high", -17, {}),
    # the officers: pencil, stopwatch, the line, the flare
    (C["to2"] - 0.2, "paper_quick_move", -15, {}), (C["aadhe"] - 0.2, "clock", -20, {"dur": 2.4, "align": "start"}),
    (C["khinch"] - 0.3, "pencil_circles", -17, {"dur": 1.0, "align": "start"}), (C["p38"] - 0.2, "whoosh_sparkle", -16, {}),
    (C["p38"] + 0.05, "bass_hit_short", -16, {}), (C["yahi"], "chime_hit", -17, {}),
    # the zones, the Cold War, 1948, two flags, the Null split
    (C["batwara"] + 0.1, "pop_light", -18, {}), (C["batwara"] + 0.3, "pop_light", -18, {}), (C["batwara"] + 0.8, "ui_pop", -18, {}),
    (C["cold"] - 0.1, "heartbeat_impact_deep", -18, {}), (C["comm"] - 0.1, "ui_pop", -18, {}), (C["cap"] - 0.1, "ui_pop", -18, {}),
    (C["y1948"] - 0.1, "pop_hard", -16, {}), (C["do"], "pop_light", -18, {}), (C["do"] + 0.15, "pop_light", -18, {}),
    (C["dono"] - 0.3, "swoosh_fast", -16, {}), (C["poora2"] - 0.1, "thud", -17, {}),
    # the war: 1950, the tide south, Incheon, the tide north, China
    (C["end22"] + 0.1, "swoosh_fast", -17, {}), (C["y1950"] - 0.1, "pop_hard", -16, {}), (C["hamla"] - 0.05, "boom_low", -14, {}),
    (C["hamla"] + 1.2, "boom", -19, {}), (C["un"] - 0.1, "pop_light", -18, {}), (C["un"] + 0.1, "pop_light", -18, {}),
    (C["un"] + 0.2, "wh_air_smooth", -17, {}), (C["dhakel"] - 0.1, "boom_hit", -16, {}),
    (C["tab"] - 0.3, "swoosh_fast", -16, {}), (C["china2"] - 0.1, "impact_trailer_epic", -14, {}), (C["lakhon"] - 0.1, "boom_low", -17, {}),
    # India: the long pull-out, the arc, rifle crossed, red cross, the medic, counters, bullets
    (C["aur3"] + 0.05, "wh_big_tonal", -16, {}), (C["india"] - 0.1, "light_sweep_magic", -17, {}), (C["india"] + 0.3, "whoosh_sparkle", -19, {}),
    (C["ladne"] - 0.1, "pen_cross", -17, {}), (C["bachane"] - 0.1, "chime_hit", -17, {}), (C["hamari"] - 0.1, "wh_air_smooth", -16, {}),
    (C["hamari"] + 0.2, "pop_hard", -17, {}), (C["n627"] - 0.1, "counter_ticking", -21, {"dur": 0.8}), (C["n22l"] - 0.1, "counter_ticking", -21, {"dur": 0.9}),
    (C["n2324"] - 0.1, "counter_ticking", -21, {"dur": 1.0}), (C["goli"] - 0.05, "boom_hit", -19, {}),
    # the end of the fighting, the armistice, the peace that never came, the loop home
    (C["n3"] - 0.4, "whoosh_transition_fast", -17, {}), (C["n3"] - 0.1, "pop_hard", -16, {}), (C["n25"] - 0.1, "heartbeat_impact_deep", -15, {}),
    (C["ladai"] - 0.1, "boom_low", -17, {}), (C["usiline"] - 0.05, "light_sweep_magic", -18, {}),
    (C["y1953"] - 0.2, "paper_slide", -15, {}), (C["vir"] - 0.3, "pencil_circles", -19, {"dur": 1.4, "align": "start"}), (C["sk"], "pen_cross", -16, {}),
    (C["signtak"], "drum_hit_big", -16, {}), (C["shanti"] - 0.2, "paper_quick_move", -15, {}), (C["aaj"], "impact_trailer_epic", -14, {}),
    (C["toye"] + 0.1, "wh_magic_air", -18, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["khatam"], C["china2"], C["aaj"]))
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
