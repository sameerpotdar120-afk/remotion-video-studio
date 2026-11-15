"""Mix the Junagadh video as a seamless loop: the creator's voice on top, Mixkit "I Won't Surrender" as the bed, and an
effect on every visual hit: whooshes on the whip moves, pops for the tags and pins, stamps for the accession, the
blockade, the Arzi Hukumat and 9 November, temple bells and a gong for Somnath, the vote counter, and a whoosh at the loop.

    python3 tools/mix_junagadh.py        # writes public/junagadh/audio/mix.wav

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
AUD = ROOT / "public" / "junagadh" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "junagadh" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_i_wont_surrender_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 112.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (0.0, "wh_big_tonal", -20, {}), (C["gujarat1"] - 0.05, "pop_light", -17, {}), (C["pak1"] - 0.1, "whoosh_transition_fast", -16, {}),
    (C["somnath1"], "bell", -17, {}), (C["map1"] - 0.05, "paper_slide", -17, {}), (C["kaise"] - 0.05, "pop_high", -16, {}),
    (C["yehai"] - 0.1, "impact_whoosh_deep", -15, {}), (C["zila"] - 0.05, "pop_light", -18, {}), (C["zila"] + 0.3, "pop_light", -19, {}),
    (C["princely"] - 0.05, "chime_hit", -18, {}), (C["n80"] - 0.1, "counter_ticking", -21, {"dur": 0.9}), (C["nawab1"] - 0.05, "stinger", -16, {}),
    (C["azadi"] + 0.1, "wh_fast", -16, {}), (C["bharat1"] - 0.05, "pop_hard", -16, {}), (C["pakc"] - 0.05, "pop_hard", -16, {}),
    (C["n15"] - 0.05, "page_turn", -17, {}), (C["chose"] - 0.05, "heavy_knock", -14, {}), (C["chose"], "drum_hit_big", -14, {}),
    (C["zameen"], "wh_air_smooth", -18, {}), (C["nahi"] - 0.05, "cross_out", -16, {}), (C["teen"], "pop_light", -17, {}),
    (C["teen"] + 0.2, "pop_light", -17, {}), (C["teen"] + 0.4, "pop_light", -17, {}), (C["samundar"] - 0.2, "waves_soft", -19, {"dur": 2.2, "align": "start"}),
    (C["sardar"] - 0.1, "boom_hit", -15, {}), (C["naka"] - 0.05, "gate_metal", -15, {}), (C["mumbai"], "whoosh_transition_fast", -16, {}),
    (C["sarkar"] - 0.3, "crowd_charge", -22, {"dur": 2.0, "align": "start"}), (C["arzi"] - 0.05, "heavy_knock", -15, {}), (C["gaon"], "ui_pops_seq", -18, {}),
    (C["october"] - 0.1, "wh_air_smooth", -17, {}), (C["october"] + 0.3, "swoosh_flying_fast", -16, {}), (C["karachi"] - 0.1, "whoosh_sparkle", -18, {}),
    (C["n9"] - 0.05, "boom_hit", -15, {}), (C["diwan1"] - 0.1, "page_turn", -18, {}), (C["haath"] - 0.05, "heavy_knock", -14, {}),
    (C["haath"], "impact_trailer_epic", -15, {}), (C["shahnawaz"] - 0.1, "chime_hit", -18, {}), (C["pm"] - 0.1, "pop_hard", -17, {}),
    (C["pita"] - 0.3, "light_sweep_magic", -17, {}), (C["n13"] - 0.05, "page_turn", -17, {}), (C["somnath2"] - 0.4, "bell", -16, {}),
    (C["khandhar"] - 0.2, "wind_dry", -21, {"dur": 2.5, "align": "start"}), (C["faisla"] - 0.05, "hit_chime", -17, {}),
    (C["n1951"] - 0.05, "gong", -14, {}), (C["n1951"] - 0.2, "swell_tonal", -18, {}), (C["feb"] - 0.05, "page_turn", -17, {}),
    (C["bharat_q"] - 0.05, "pop_hard", -17, {}), (C["bharat_q"] + 0.7, "pop_hard", -17, {}), (C["votes"] - 0.1, "counter_ticking", -20, {"dur": 2.6, "align": "start"}),
    (C["vote"] + 0.6, "pop_light", -17, {}), (C["n91"] - 0.05, "pop_high", -15, {}), (C["n2020"] - 0.1, "whoosh_transition_fast", -16, {}),
    (C["newmap"] - 0.1, "paper_slide", -17, {}), (C["dikhaya"] - 0.05, "heavy_knock", -15, {}), (C["somnath3"] - 0.2, "bowl_strike", -16, {}),
    (C["passport"] + 0.15, "cross_out", -16, {}), (C["signature"] - 0.1, "writing", -17, {"dur": 1.1, "align": "start"}),
    (C["pak_last"] - 0.05, "heavy_knock", -15, {}), (C["map_last"] - 0.1, "wh_big_subtle_tonal", -18, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["chose"], C["haath"], C["n1951"]))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    # the Nawab leaves: the music sinks under it
    night = np.clip((t_ax - C["october"] + 0.5) / 1.0, 0, 1) * np.clip((C["n9"] + 0.3 - t_ax) / 1.0, 0, 1)
    music *= db(-5.0 * night)[:, None]

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
