"""War sound effects for the Six-Day War video, synthesised in code (our own, no licence needed).

    python3 -I tools/synth_sixday_sfx.py      # writes public/sixday/audio/sfx/syn_*.wav

- syn_blast_near: a close explosion (sub thump, noise burst, crackle tail, debris)
- syn_blast_far: a distant one (low-passed, longer roll)
- syn_artillery: a gun's report and the shell's far crump
- syn_tank: tank tracks and engine, 4 s (loopable bed)
- syn_gunfire: distant small-arms bursts, 3 s
- syn_radio: radio static with tuning chirps, 2.5 s
- syn_horn: a ship's horn, 3 s
- syn_rumble: a low war rumble bed, 6 s
"""
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sixday" / "audio" / "sfx"
rng = np.random.default_rng(1967)


def lp(x, f, o=4):
    return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, a, b, o=2):
    return signal.sosfilt(signal.butter(o, [a, b], "band", fs=SR, output="sos"), x)


def env(n, a, d, shape=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * shape / d)


def write(name, x, stereo_w=0.25):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    d = int(SR * 0.011)
    r = np.concatenate([np.zeros(d), x[:-d]])
    st = np.stack([x * (1 - stereo_w * 0.3) + r * stereo_w * 0.3, x * (1 - stereo_w * 0.3) + np.roll(r, d) * stereo_w * 0.3], 1)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    import wave
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def blast(dur, far=False):
    n = int(SR * dur)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (52 - 22 * t) * t) * env(n, 0.003, 0.5 if not far else 0.9, 5)
    noise = rng.standard_normal(n)
    burst = lp(noise, 2400 if not far else 700) * env(n, 0.002, 1.2 if not far else 2.4, 3.2)
    roll = lp(rng.standard_normal(n), 180) * env(n, 0.08, dur, 2.2) * 2.5
    crackle = np.zeros(n)
    for _ in range(140 if not far else 40):
        k = int(abs(rng.normal(0.25, 0.5)) * SR) % n
        L = int(SR * rng.uniform(0.002, 0.012))
        crackle[k:k + L] += rng.standard_normal(min(L, n - k)) * rng.uniform(0.2, 1)
    crackle = hp(crackle, 1500) * np.exp(-t * 1.8) * (0.5 if not far else 0.12)
    x = thump * 1.4 + burst + roll + crackle
    if far:
        x = lp(x, 900)
    return x * env(n, 0.001, dur * 1.6, 1.0)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write("syn_blast_near", blast(3.2))
    write("syn_blast_far", blast(4.0, far=True))
    # artillery: sharp report, then a distant crump 1.1 s later
    a = blast(1.4) * 0.8
    b = blast(2.6, far=True) * 0.6
    x = np.zeros(int(SR * 4.0)); x[: len(a)] += hp(a, 120); k = int(SR * 1.1); x[k:k + len(b)] += b
    write("syn_artillery", x)
    # tank: track clatter (pulse train ~11 Hz with jitter) + engine (low saw) + rumble
    n = int(SR * 4); t = np.arange(n) / SR
    eng = signal.sawtooth(2 * np.pi * (38 + 3 * np.sin(2 * np.pi * 0.4 * t)) * t) * 0.35
    eng = lp(eng, 400)
    clat = np.zeros(n)
    tt = 0.0
    while tt < 4:
        k = int(tt * SR); L = int(SR * 0.018)
        clat[k:k + L] += rng.standard_normal(min(L, n - k)) * np.hanning(L)[: min(L, n - k)]
        tt += 1 / 11 + rng.normal(0, 0.006)
    clat = bp(clat, 400, 3000) * 0.6
    rum = lp(rng.standard_normal(n), 90) * 1.6
    x = eng + clat + rum
    f = int(SR * 0.3); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    write("syn_tank", x, 0.5)
    # distant small arms: bursts of short cracks
    n = int(SR * 3); x = np.zeros(n)
    for start in (0.1, 0.9, 1.5, 2.2):
        for i in range(int(rng.integers(3, 8))):
            k = int((start + i * rng.uniform(0.07, 0.11)) * SR)
            if k >= n - 2000:
                break
            L = int(SR * 0.05)
            x[k:k + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (SR * 0.008)) * rng.uniform(0.5, 1)
    x = lp(bp(x, 300, 4000), 2500)
    x = x + 0.4 * np.concatenate([np.zeros(int(SR * 0.09)), lp(x, 800)[: n - int(SR * 0.09)]])  # slap echo
    write("syn_gunfire", x, 0.5)
    # radio static with tuning chirps
    n = int(SR * 2.5); t = np.arange(n) / SR
    st = bp(rng.standard_normal(n), 500, 3500) * (0.6 + 0.4 * (rng.random(n) > 0.997).astype(float).cumsum() % 2)
    chirp = np.sin(2 * np.pi * np.cumsum(900 + 700 * np.sin(2 * np.pi * 1.3 * t)) / SR) * 0.25 * (np.sin(2 * np.pi * 0.8 * t) > 0.3)
    x = st * 0.7 + chirp
    f = int(SR * 0.05); x[:f] *= np.linspace(0, 1, f); x[-f * 4:] *= np.linspace(1, 0, f * 4)
    write("syn_radio", x, 0.1)
    # ship horn: two detuned low tones with harmonics
    n = int(SR * 3); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * h * f0 * t) / h for f0 in (98, 98.7, 130.5) for h in (1, 2, 3, 4, 5))
    x = lp(x, 1400) * np.minimum(1, t / 0.15) * np.minimum(1, (3 - t) / 0.5)
    x = x + 0.25 * np.concatenate([np.zeros(int(SR * 0.35)), x[: n - int(SR * 0.35)]])
    write("syn_horn", x, 0.6)
    # war rumble bed
    n = int(SR * 6); t = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 70) * 2 + lp(rng.standard_normal(n), 300) * 0.3 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t))
    f = int(SR * 0.8); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    write("syn_rumble", x, 0.7)
    print("ok")


if __name__ == "__main__":
    main()
