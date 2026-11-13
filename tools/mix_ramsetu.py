"""Mix the Ram Setu video as a seamless loop: the creator's voice on top, Mixkit "Indian Meditations" as the bed (the
Mumbai reel's music), and an effect on every visual hit: footsteps-in-the-surf waves, the 1480 record, thunder and rain
for the storm, the bow's ripple, temple bell and gong for the faith beats, the ISRO laser, a quiet night for 1964 (the
music dips under it), the train and the wave, and waves again at the loop.

    python3 tools/mix_ramsetu.py        # writes public/ramsetu/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Indian Meditations", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "ramsetu" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "ramsetu" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_indian_meditations_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 160.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (0.0, "waves_soft", -24, {"dur": 5.0, "align": "start"}), (C["n1480"] - 0.1, "page_turn", -17, {}), (C["n1480"], "bell", -20, {}),
    (C["toofan"] - 0.4, "wh_wind_gust", -16, {}), (C["toofan"], "thunder_crash", -13, {}), (C["toofan"] + 0.2, "rain_light", -21, {"dur": 5.5, "align": "start"}),
    (C["n1964"] - 0.05, "waves_heavy", -16, {"dur": 3.0, "align": "start"}), (C["n1964"], "boom_low", -15, {}), (C["kaise"] - 0.05, "pop_high", -16, {}),
    (C["ye"] - 0.1, "whoosh_transition_fast", -15, {}), (C["dhanush1"] - 0.3, "wh_big_tonal", -16, {}), (C["matlab"] - 0.05, "ui_pop", -17, {}),
    (C["matlab"] + 1.4, "light_sweep_magic", -18, {}), (C["nok"] - 0.05, "gong", -15, {}), (C["nok"] + 0.1, "impact_whoosh_deep", -17, {}),
    (C["yahin"] - 0.1, "whoosh_sparkle", -17, {}), (C["palk"] - 0.05, "pop_light", -17, {}), (C["mannar2"] - 0.05, "pop_light", -17, {}),
    (C["beech"] - 0.05, "stinger", -15, {}), (C["aastha"] - 0.2, "bell", -18, {}), (C["nal"] - 0.05, "pop_hard", -18, {}),
    (C["tairne"] - 0.3, "waves_soft", -20, {"dur": 3.0, "align": "start"}), (C["ramnaam"] - 0.2, "chime_hit", -16, {}), (C["n5din"] - 0.1, "counter_ticking", -21, {"dur": 1.4}),
    (C["sita"] - 0.2, "light_sweep_magic", -18, {}), (C["angrez"] - 0.1, "paper_slide", -16, {}), (C["hamare"] + 0.55, "drum_hit_big", -14, {}),
    (C["n2024"] - 0.4, "wh_air_smooth", -17, {}), (C["isro"] - 0.1, "typewriter_click", -21, {"dur": 0.8, "align": "start"}), (C["laser"] - 0.1, "whoosh_sparkle", -18, {}),
    (C["n48"] + 0.2, "pen_cross", -16, {}), (C["n29"] - 0.05, "boom_hit", -15, {}), (C["n9998"] - 0.1, "counter_ticking", -21, {"dur": 1.0}),
    (C["n8m"] - 0.3, "riser", -20, {"dur": 1.4, "align": "start"}), (C["vigyan"] - 0.2, "ui_pop", -18, {}), (C["aastha2"] - 0.2, "bell", -17, {}),
    (C["jo"] - 0.1, "gong", -16, {}), (C["par2"] - 0.3, "wind_howl", -22, {"dur": 4.0, "align": "start"}), (C["chakravat"] - 0.2, "thunder_impact", -14, {}),
    (C["chakravat"] + 0.2, "rain_light", -20, {"dur": 8.0, "align": "start"}), (C["n115"] - 0.9, "train", -19, {"dur": 2.6, "align": "start"}),
    (C["train"] - 0.2, "waves_heavy", -13, {"dur": 3.0, "align": "start"}), (C["train"] + 0.3, "boom_low", -15, {}), (C["n1800"] - 0.1, "heartbeat_impact_deep", -16, {}),
    (C["sarkar"] - 0.3, "wind_dry", -21, {"dur": 3.0, "align": "start"}), (C["church"] - 0.1, "thud", -19, {}), (C["station"] - 0.1, "thud", -19, {}),
    (C["machhuare"] - 0.2, "waves_soft", -20, {"dur": 2.5, "align": "start"}), (C["setu_last"] - 0.1, "stinger", -15, {}), (C["usi"], "waves_ocean", -22, {"dur": 6.0, "align": "start"}),
    (C["kabhi"] - 0.4, "whoosh_transition_fast", -18, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["toofan"], C["nok"], C["train"]))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    # 1964: the music sinks and stays low until dawn ("sarkar ne…")
    night = np.clip((t_ax - C["par2"] + 0.5) / 1.5, 0, 1) * np.clip((C["sarkar"] + 1.5 - t_ax) / 1.5, 0, 1)
    music *= db(-7.0 * night)[:, None]

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
