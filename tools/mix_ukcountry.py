"""Mix the "UK: one country or four?" video as a seamless loop: the creator's voice on top, Mixkit "Classical Vibes 3"
as the bed, and an effect on every visual hit: whooshes on the whip moves, pops for the badges and the four countries,
the stamp and coins for the 1801 bribe, cricket and football hits, castles thudding in, sword clashes, the ship and the
treasure, a gavel and a bell, a quiet 1921/1947 partition beat (the music dips under it), and a whoosh at the loop.

    python3 tools/mix_ukcountry.py        # writes public/ukcountry/audio/mix.wav

The video's last frame runs into frame 0, so the mix does too (tail crossfaded into head, overhangs wrap round).
Music: Mixkit "Classical Vibes 3", Mixkit free licence. SFX: Sonniss GDC game-audio bundles (royalty-free).
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from mix_audio import SR, db, fade, write_wav
from mix_diomede import VOICE_CHAIN, envelope, ff, win_rms_db

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / "public" / "ukcountry" / "audio"
VO = AUD / "vo.mp3"
T = json.load(open(ROOT / "src" / "ukcountry" / "edit" / "timing.json", encoding="utf-8"))
C = T["cues"]
DURATION = T["duration"]

MUSIC, MUSIC_OFF = "music_classical_vibes_3_mixkit.mp3", 0.0
EXTEND_AT, EXTEND_XF = 118.0, 2.0
LOOP_XF = 1.5
MUSIC_PAUSE, MUSIC_TALK = -9.0, -16.0
SFX_DUCK = 4.0
HPF = {"drum_hit_big": 35, "bass_hit_short": 35, "boom_low": 30, "impact_trailer_epic": 30}

CUES = [
    (0.0, "wh_big_tonal", -20, {}), (C["n200"] - 0.1, "counter_ticking", -22, {"dur": 0.9}), (C["uk1"] - 0.2, "whoosh_transition_fast", -15, {}),
    (C["char1"] - 0.05, "pop_hard", -16, {}), (C["n1801a"] - 0.05, "page_turn", -17, {}), (C["bribe"] + 0.3, "drum_hit_big", -13, {}),
    (C["bribe"] + 0.35, "coins", -17, {}), (C["kaise"] - 0.05, "pop_high", -16, {}), (C["king"] - 0.1, "ui_pop", -16, {}),
    (C["passport"] - 0.1, "ui_pop", -16, {}), (C["army"] - 0.1, "ui_pop", -16, {}), (C["andar"], "wh_air_smooth", -18, {}),
    (C["eng_list"] - 0.05, "pop_light", -16, {}), (C["scot_list"] - 0.05, "pop_light", -16, {}), (C["wales_list"] - 0.05, "pop_light", -16, {}),
    (C["ni_list"] - 0.05, "pop_light", -16, {}), (C["capital"] - 0.2, "chime_hit", -19, {}), (C["cricket"] - 0.1, "thud", -16, {}),
    (C["engwales"] - 0.1, "stinger", -17, {}), (C["football"], "whistle", -18, {}), (C["olympics"] - 0.1, "whoosh_sparkle", -17, {}),
    (C["teamgb"] - 0.05, "crowd_cheer", -18, {"dur": 2.0, "align": "start"}), (C["shuruat"] - 0.1, "whoosh_transition_fast", -16, {}),
    (C["n13"] - 0.05, "boom_hit", -16, {}), (C["jeet"] - 0.05, "sword_draw", -16, {}), (C["kilon"] - 0.2, "metal_thud", -18, {}),
    (C["kilon"] + 0.3, "metal_thud", -19, {}), (C["kilon"] + 0.6, "metal_thud", -19, {}), (C["baari"] - 0.1, "wh_fast", -16, {}),
    (C["scots"] + 0.2, "sword_draw", -14, {}), (C["n1603"] - 0.05, "boom_hit", -16, {}), (C["raja"] - 0.2, "light_sweep_magic", -17, {}),
    (C["panama"] - 0.3, "whoosh_transition_fast", -15, {}), (C["panama"] + 0.4, "waves_heavy", -18, {"dur": 3.0, "align": "start"}),
    (C["doob"] - 0.1, "boom_low", -15, {}), (C["doob"] + 0.2, "coins_ting", -18, {}), (C["n1707"] - 0.05, "page_turn", -17, {}),
    (C["kanoon"] - 0.2, "pop_hard", -17, {}), (C["kanoon"] + 0.6, "pop_hard", -17, {}), (C["church"] - 0.1, "bell", -18, {}),
    (C["gb"] - 0.05, "stinger", -15, {}), (C["ireland1"] - 0.3, "whoosh_sparkle", -17, {}), (C["n1801b"] - 0.05, "page_turn", -17, {}),
    (C["khitab"] - 0.1, "coins_pouch", -16, {}), (C["khitab"] + 0.8, "drum_hit_big", -13, {}), (C["vote"] - 0.05, "cash_register", -17, {}),
    (C["ukd"] - 0.05, "impact_whoosh_deep", -15, {}), (C["n1916"] - 0.1, "boom_low", -17, {}), (C["jung"] - 0.1, "sword_draw", -18, {}),
    (C["n1922"] - 0.05, "paper_slide", -16, {}), (C["batwara"] - 0.2, "pen_cross", -17, {}), (C["n1947"] - 0.3, "whoosh_transition_fast", -18, {}),
    (C["fullname"] - 0.1, "ui_pop", -17, {}), (C["fullname"] + 1.0, "ui_pop", -17, {}), (C["fullname"] + 2.1, "ui_pop", -17, {}),
    (C["sovereign"], "boom_hit", -15, {}), (C["nation"] - 0.1, "pop_light", -17, {}), (C["agli"] + 0.2, "wh_big_tonal", -17, {}),
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
    dip = sum(np.clip(1 - np.abs(t_ax - (x0 + 0.2)) / 0.7, 0, 1) for x0 in (C["bribe"] + 0.3, C["khitab"] + 0.8, C["sovereign"]))
    music *= db(-5.0 * np.clip(dip, 0, 1))[:, None]
    # the partition beat (1921, 1947): the music sinks under it
    night = np.clip((t_ax - C["batwara"] + 0.5) / 1.0, 0, 1) * np.clip((C["naam"] + 1.0 - t_ax) / 1.0, 0, 1)
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
