"""Mix the House vs Senate video as a seamless loop: the creator's voice on top, Mixkit "Skyline" as the bed, and an
effect on every visual hit: whooshes on the dives, wipes and the ink wash, pops on labels, icons and tags, ticking under
the counters, a pen and paper on the federal law, chimes on the ticks.

    python3 tools/mix_uscongress.py        # writes public/uscongress/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Skyline", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "uscongress" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "uscongress" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_skyline_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 60.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35}

CUES = [
    # line 1: the arcs rise and flip; the US; Wyoming, its people, two senators; New York; "=" and "?"
    (C["flip"] - 0.35, "whoosh_sparkle", -18, {}), *[(C["flip"] + i * 0.1, "pop_light", -24, {}) for i in range(10)],
    (C["but"], "wh_air_smooth", -17, {}), (C["wyoming0"], "pop_hard", -16, {}), (C["n588"] - 0.05, "counter_ticking", -21, {"dur": 0.9}),
    (C["senators0"] - 0.05, "pop_high", -16, {}), (C["ny0"], "pop_hard", -16, {}), (C["n20m"] - 0.05, "counter_ticking", -21, {"dur": 0.8}),
    (C["n20m"] + 0.25, "pop_high", -16, {}), (C["n20m"] + 0.45, "bass_hit_short", -16, {}), (C["n20m"] + 0.6, "pop_hard", -17, {}),
    # line 2-3: the dive to DC, the boundary draws, the title; the White House; the walk down the Mall; the Capitol
    (C["heres"] + 0.1, "whoosh_transition_fast", -14, {}), (C["heres"] + 0.6, "wh_big_tonal", -18, {}), (C["heres"] + 0.8, "pop_high", -17, {}),
    (C["this"], "wh_fast", -16, {}), (C["this"] + 0.05, "pop_light", -18, {}), (C["whitehouse"] + 0.1, "pop_hard", -15, {}), (C["president0"] - 0.1, "ui_pop", -18, {}),
    (C["andjust"], "wh_air_smooth", -18, {}), (C["capitol"] - 0.25, "pop_light", -18, {}), (C["capitol"], "pop_hard", -15, {}), (C["capitol"] + 0.2, "whoosh_sparkle", -20, {}),
    (C["meets"] - 0.4, "ui_pop", -18, {}),
    # board 1: the ink wash, the two cards, the bracket, the House grid and 435, the Senate grid and 100
    (C["meets"] + 0.5, "wh_magic_air", -16, {}), (C["meets"] + 0.65, "pop_light", -19, {}), (C["meets"] + 0.85, "pop_light", -19, {}),
    (C["chambers"] - 0.4, "ui_snap", -19, {}), (C["house1"] - 0.05, "pop_hard", -16, {}), (C["house1"] + 0.2, "counter_ticking", -21, {"dur": 1.3}),
    (C["n435"], "bass_hit_short", -16, {}), (C["senate1"] - 0.1, "pop_hard", -16, {}), (C["senate1"] + 0.1, "counter_ticking", -21, {"dur": 0.6}), (C["n100"], "bass_hit_short", -16, {}),
    # line 5: the wipe back to the map; New York's districts pop, 26; into the city; the whip to Wyoming, 1
    (C["inhouse"] - 0.3, "swoosh_fast", -14, {}), (C["population"], "wh_air_smooth", -17, {}), *[(C["population"] + 0.75 + i * 0.056, "pop_light", -25, {}) for i in range(13)],
    (C["ny26"] - 0.05, "drum_hit_big", -15, {}), (C["ny26"] + 0.3, "wh_big_tonal", -19, {}), (C["wyoming2"] - 0.1, "whoosh_transition_fast", -14, {}),
    (C["one"] - 0.1, "drum_hit_big", -15, {}), (C["one"] + 0.15, "pop_high", -17, {}),
    # line 6 (Null A): a representative pops in every district; "every 2 years" writes on
    *[(C["elects"] + i * 0.06, "pop_light", -25, {}) for i in range(13)], (C["twoyears"] - 0.5, "pages", -22, {"dur": 0.8}),
    # board 2: the wipe, the 26 people and the 1, the beam tips, SENATE slams in
    (C["so"] - 0.25, "swoosh_fast", -14, {}), *[(C["so"] + 0.1 + i * 0.09, "pop_light", -25, {}) for i in range(9)],
    (C["dominate"] - 0.1, "metal_thud", -17, {}), (C["senateexists"] - 0.15, "bass_hit_short", -14, {}), (C["senateexists"], "pop_hard", -15, {}),
    # line 8: the wipe to the map; every state lights up, two senators each, the pulses on New York and Wyoming, 50, 100
    (C["insenate"] - 0.25, "swoosh_fast", -14, {}), (C["insenate"], "light_sweep_magic", -17, {}), *[(C["twosen"] + i * 0.07, "pop_light", -26, {}) for i in range(12)],
    (C["nomatter"], "radar_ping", -19, {}), (C["n50"] - 0.1, "pop_hard", -15, {}), (C["n100b"] - 0.1, "bass_hit_short", -15, {}),
    # board 3: the Senate arc, 6 years, a third, 35; the law: paper, two ticks, the pen, the seal
    (C["senserve"] - 0.3, "swoosh_fast", -14, {}), (C["senserve"] - 0.1, "pop_hard", -17, {}), (C["six"] - 0.15, "pages", -22, {"dur": 0.6}),
    (C["third"], "ui_snap", -18, {}), (C["n35"] - 0.1, "chime_hit", -16, {}),
    (C["topass"], "page_turn", -16, {}), (C["both"] + 0.1, "chime_hit", -16, {}), (C["both"] + 0.25, "wh_fast", -20, {}), (C["both"] + 0.8, "chime_hit", -16, {}),
    (C["signs"] - 0.9, "wh_air_smooth", -19, {}), (C["signs"] - 0.1, "typewriter_click", -22, {}), (C["signs"] + 0.55, "metal_thud", -16, {}),
    # line 11 (Null B): both chambers fill seat by seat; "whoever holds both"
    (C["thatswhy"], "riser", -21, {"dur": 1.6}), *[(C["thatswhy"] + 0.1 + i * 0.12, "pop_light", -27, {}) for i in range(14)], (C["whoever"], "chime_hit", -17, {}),
    (C["bothch"], "pop_hard", -16, {}),
    # the close: the ink wash out; Wyoming and New York again; "=" and "?"; back to frame 0
    (C["should"] - 0.45, "wh_magic_air", -16, {}), (C["half"], "pop_high", -17, {}), (C["samevote"], "bass_hit_short", -16, {}),
    (C["yorkers"] - 0.2, "pop_hard", -16, {}), (C["yorkers"] + 0.4, "stinger", -21, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["n435"], C["ny26"], C["one"], C["senateexists"]))
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
