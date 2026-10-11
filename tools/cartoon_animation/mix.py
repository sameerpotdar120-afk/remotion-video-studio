"""Mix the cartoon-explainer trial: the reference VO (Demucs vocals) on top, a light comedic bed, cartoon SFX.

    python3 tools/cartoon_animation/mix.py      # writes public/cartoon_animation/audio/mix.wav

Cue times come from the VO's word timestamps (src/cartoon_animation/words.json).
SFX: Sonniss GDC game-audio bundles (royalty-free). Music: Mixkit "Summer Fun" (Ahjay Stelino), Mixkit free licence.
"""


import json
import subprocess
from pathlib import Path

import numpy as np


SR = 48000
VOICE_CHAIN = (
    "highpass=f=80,equalizer=f=280:t=q:w=1.2:g=-2,equalizer=f=3800:t=q:w=1.0:g=2.5,"
    "acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=3,"
    "alimiter=limit=0.89:attack=2:release=40"
)


def db(x):
    return 10 ** (x / 20)


def fade(a: np.ndarray, fin: float, fout: float) -> np.ndarray:
    n = len(a)
    i, o = min(n, int(fin * SR)), min(n, int(fout * SR))
    if i:
        a[:i] *= np.linspace(0, 1, i)[:, None]
    if o:
        a[n - o:] *= np.linspace(1, 0, o)[:, None]
    return a


def write_wav(path: Path, a: np.ndarray) -> None:
    import wave

    pcm = (np.clip(a, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def ff(path: Path, chain: str) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-af", chain, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def win_rms_db(a: np.ndarray, w: int = int(0.05 * SR)) -> np.ndarray:
    p = np.convolve((a**2).mean(1), np.ones(w) / w, "same")
    return 10 * np.log10(p + 1e-12)


def envelope(x: np.ndarray, attack: float, release: float) -> np.ndarray:
    """One-pole follower on a 0..1 control signal (computed at 1 kHz, then upsampled)."""
    hop = SR // 1000
    c = x[::hop]
    out = np.empty_like(c)
    ka, kr = np.exp(-1 / (attack * 1000)), np.exp(-1 / (release * 1000))
    y = 0.0
    for i, v in enumerate(c):
        k = ka if v > y else kr
        y = k * y + (1 - k) * v
        out[i] = y
    return np.repeat(out, hop)[: len(x)]


ROOT = Path(__file__).resolve().parent.parent.parent
AUD = ROOT / "public" / "cartoon_animation" / "audio"
WORDS = json.load(open(ROOT / "src" / "cartoon_animation" / "words.json", encoding="utf-8"))
DURATION = 89.2
norm = lambda s: "".join(ch for ch in s.lower() if ch.isalnum() or ch == "'")


def W(phrase: str, occ: int = 1) -> float:
    p = [norm(x) for x in phrase.split()]
    n = 0
    for i in range(len(WORDS) - len(p) + 1):
        if all(norm(WORDS[i + j]["w"]) == x for j, x in enumerate(p)):
            n += 1
            if n == occ:
                return WORDS[i]["s"]
    raise KeyError(phrase)

MUSIC = [("music_summer_fun_mixkit.mp3", 2.0, -14.0)]
MUSIC_DUCK, SFX_DUCK = 4.0, 2.0
HPF = {"thud_low": 45}

CUES = [
    (0.05, "pop_light", -14, {}), (0.15, "pop_light", -15, {}), (0.25, "pop_light", -15, {}),
    (W("surely") - 0.1, "whoosh_cinematic_fast", -9, {}),
    (W("goofy"), "boing", -11, {}),
    (W("fun fact") - 0.15, "wh_fast", -9, {}),
    (W("fun fact"), "ui_pop_high", -12, {}),
    (W("2500") - 0.05, "cash_register", -7, {}),
    (W("2500") + 0.05, "shimmer_power", -13, {}),
    (W("a month"), "pop_light", -12, {}),
    (W("just standing"), "trans_down", -11, {}),
    (W("this got") - 0.15, "wh_fast", -9, {}),
    (W("average person"), "swoosh_fast", -13, {}),
    (W("land a job"), "impact_blow", -9, {}),
    (W("and why") + 0.3, "dizzy", -12, {}),
    (W("originally") - 0.15, "whoosh_cinematic_fast", -9, {}),
    (W("their entire purpose"), "sword_scrape", -14, {"align": "start", "dur": 0.9}),
    (W("costs") - 0.3, "sword_hit", -10, {}),
    (W("centuries") - 0.05, "airy_impact", -10, {}),
    (W("centuries") + 0.1, "cash_register", -16, {}),
    (W("assassinations") - 0.1, "whip", -9, {}),
    (W("assassinations"), "thud_low", -9, {}),
    (W("coups"), "pop_light", -11, {}),
    (W("power struggles"), "pop_light", -11, {}),
    (W("so they surrounded") - 0.15, "wh_fast", -9, {}),
    (W("themselves"), "pop_light", -14, {}), (W("themselves") + 0.12, "pop_light", -14, {}),
    (W("themselves") + 0.24, "pop_light", -14, {}), (W("themselves") + 0.36, "pop_light", -14, {}),
    (W("loyal"), "ui_pop_high", -13, {}), (W("capable"), "ui_pop_high", -13, {}),
    (W("if you had") - 0.05, "snap_spin", -9, {}),
    (W("trusted"), "impact_blow", -9, {}),
    (W("trusted") + 0.2, "typewriter_click", -14, {}),
    (W("and yes that") - 0.15, "wh_fast", -9, {}),
    (W("real soldiers") - 0.2, "swoosh_fast", -11, {}),
    (W("shoot") - 0.05, "click_error", -10, {}),
    (W("if you want") - 0.15, "wh_fast", -9, {}),
    (W("not easy"), "tap_negative", -11, {}),
    (W("british army") - 0.2, "ui_pop_high", -12, {}),
    (W("british army") + 0.5, "ui_triple_click", -11, {}),
    (W("from there"), "paper_slide", -12, {}),
    (W("regiments"), "light_sweep_magic", -14, {}),
    (W("grenadiers"), "pop_light", -11, {}), (W("coldstream"), "pop_light", -11, {}),
    (W("these are frontline") - 0.15, "wh_fast", -9, {}),
    (W("clean records") - 0.25, "page_turn_info", -11, {}),
    (W("clean records") + 0.1, "impact_blow", -10, {}),
    (W("strong performance"), "shimmer_power", -13, {}),
    (W("once selected") - 0.15, "wh_fast", -9, {}),
    (W("once selected") + 0.2, "plop", -10, {}),
    (W("you'll be"), "boing_crunch", -10, {}),
    (W("trained") - 0.35, "whistle_down", -12, {}),
    (W("that includes") - 0.15, "wh_fast", -9, {}),
    (W("drills"), "pop_light", -12, {}), (W("marching"), "pop_light", -12, {}),
    (W("and yes learning") - 0.05, "airy_impact", -10, {}),
    (W("still for"), "tap_negative", -12, {}),
    (W("alert") - 0.1, "ui_pop_high", -13, {}),
    (W("and no") - 0.15, "wh_fast", -9, {}),
    (W("two hours"), "typewriter_click", -12, {}),
    (W("switched"), "pull_swoosh", -11, {}),
    (W("subscribe"), "boing", -10, {}),
    (W("subscribe") + 0.6, "ui_triple_click", -10, {}),
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
    music *= db(-MUSIC_DUCK * activity)
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
