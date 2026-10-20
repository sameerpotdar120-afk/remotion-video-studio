"""
Synthesises every sound effect from scratch (numpy/scipy) + a few musical stings rendered with
FluidSynth and the FluidR3_GM soundfont (MIT licence). Nothing is sampled from third parties,
so all SFX are original and copyright-free.

    python3 scripts/audio/make_sfx.py public/assets/sfx
"""
import os, sys, subprocess, tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/assets/sfx'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1776)
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'


def t_(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.standard_normal(int(SR * d))


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x)


def env(n, a, d, curve=4.0):
    """attack (s) then exponential decay over d (s)."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / max(d, 1e-4) * curve / 4))
    return e


def sweep_filter(x, f0, f1, q=3.0, block=256):
    """time-varying band-pass (whooshes / risers)."""
    y = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, block):
        f = f0 * (f1 / f0) ** (i / n)
        b, a = signal.iirpeak(min(f, SR / 2 - 100), q, fs=SR)
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        seg, zi = signal.lfilter(b, a, x[i:i + block], zi=zi)
        y[i:i + block] = seg
    return y


def reverb(x, size=1.2, mix=0.25, damp=3000):
    n = int(SR * size)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6 / size)
    ir = lp(ir, damp)
    dry = np.concatenate([x, np.zeros(n)])
    wet = signal.fftconvolve(x, ir)[: len(dry)]
    wet = np.pad(wet, (0, len(dry) - len(wet)))
    wet /= np.max(np.abs(wet)) + 1e-9
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def stereo(x, width=0.0):
    if width == 0:
        return np.stack([x, x], 1)
    d = int(SR * 0.011 * width)
    r = np.concatenate([np.zeros(d), x])[: len(x)]
    return np.stack([x, r * 0.9 + x * 0.1], 1)


def save(name, x, peak=0.89, width=0.0):
    x = np.asarray(x, float)
    if x.ndim == 1:
        x = stereo(x, width)
    fade = min(len(x), int(SR * 0.01))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    wavfile.write(f'{OUT}/{name}.wav', SR, (x * 32767).astype(np.int16))
    print('sfx', name, f'{len(x) / SR:.2f}s')


def fluid(notes, dur, program, bank=0, gain=1.0):
    """render [(time, midi, vel, len)] with FluidSynth → mono float array."""
    import pretty_midi
    pm = pretty_midi.PrettyMIDI()
    inst = pretty_midi.Instrument(program=program, is_drum=(bank == 128))
    for (st, p, v, ln) in notes:
        inst.notes.append(pretty_midi.Note(velocity=v, pitch=p, start=st, end=st + ln))
    pm.instruments.append(inst)
    with tempfile.TemporaryDirectory() as td:
        pm.write(f'{td}/a.mid')
        subprocess.run(['fluidsynth', '-ni', '-g', str(gain), '-r', str(SR), '-F', f'{td}/a.wav', SF2, f'{td}/a.mid'],
                       check=True, capture_output=True)
        sr, y = wavfile.read(f'{td}/a.wav')
    y = y.astype(float) / 32768
    y = y.mean(1) if y.ndim > 1 else y
    return y[: int(SR * dur)]


# ── whooshes ────────────────────────────────────────────────────────────────
def whoosh(d=0.45, f0=300, f1=3200, q=2.2):
    x = sweep_filter(noise(d), f0, f1, q)
    n = len(x)
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return x * e


save('whoosh_fast', whoosh(0.32, 400, 4200), width=1)
save('whoosh_soft', lp(whoosh(0.7, 200, 1800, 1.4), 3000), width=1)
save('whoosh_big', reverb(whoosh(0.9, 120, 3000, 1.6) + 0.5 * lp(noise(0.9), 200) * np.sin(np.linspace(0, np.pi, int(SR * 0.9))), 0.8, 0.2), width=1)
save('whoosh_down', whoosh(0.5, 3000, 250), width=1)

# ── pops / UI ───────────────────────────────────────────────────────────────
def pop(f=700, d=0.12):
    t = t_(d)
    ph = 2 * np.pi * np.cumsum(f * (1 + 1.8 * np.exp(-t * 60))) / SR
    return np.sin(ph) * env(len(t), 0.002, 0.05) + 0.15 * hp(noise(d), 2000) * env(len(t), 0.001, 0.01)


save('pop', pop())
save('pop_high', pop(1100, 0.1))
save('pop_low', pop(420, 0.16))
tick = bp(noise(0.03), 2500, 7000) * env(int(SR * 0.03), 0.0005, 0.006) + 0.6 * np.sin(2 * np.pi * 3200 * t_(0.03)) * env(int(SR * 0.03), 0.0005, 0.004)
save('tick', tick, peak=0.6)
save('click_soft', lp(tick, 2500), peak=0.5)

# ── stamp / thud / impact ───────────────────────────────────────────────────
def thud(d=0.5, f=70):
    t = t_(d)
    body = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t * 30))) / SR) * env(len(t), 0.001, 0.16)
    knock = bp(noise(d), 150, 1600) * env(len(t), 0.0005, 0.03)
    return body + 0.8 * knock


save('stamp_slam', reverb(thud(0.6, 85) + 0.3 * bp(noise(0.6), 2000, 6000) * env(int(SR * 0.6), 0.0005, 0.012), 0.5, 0.15))
save('impact_boom', reverb(thud(1.6, 42) * 1.0 + 0.4 * lp(noise(1.6), 300) * env(int(SR * 1.6), 0.001, 0.5), 2.0, 0.35), width=1)
save('thud_soft', lp(thud(0.35, 110), 1500), peak=0.6)

# ── gunfire ─────────────────────────────────────────────────────────────────
def musket(d=2.2):
    n = int(SR * d)
    crack = hp(noise(d), 900) * env(n, 0.0003, 0.02)
    blast = lp(noise(d), 1400) * env(n, 0.001, 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(60 * (1 + 2 * np.exp(-t_(d) * 25))) / SR) * env(n, 0.001, 0.25)
    flint = np.zeros(n)
    flint[: int(SR * 0.02)] = hp(noise(0.02), 3000) * 0.3
    x = np.concatenate([flint[: int(SR * 0.05)], (crack * 1.2 + blast + boom)])[:n]
    return reverb(x, 2.4, 0.4, 2500)


save('musket_shot', musket(), width=1)
save('musket_volley', sum(np.pad(musket(2.6) * g, (int(SR * o), SR))[: int(SR * 3.0)]
                          for o, g in [(0, 1), (0.05, 0.8), (0.11, 0.9), (0.17, 0.7), (0.24, 0.6)]), width=1)
cock = np.concatenate([bp(noise(0.03), 1500, 6000) * env(int(SR * 0.03), 0.0005, 0.008), np.zeros(int(SR * 0.07)),
                       bp(noise(0.05), 800, 5000) * env(int(SR * 0.05), 0.0005, 0.012) * 1.2])
save('musket_cock', cock, peak=0.7)

# ── fireworks ───────────────────────────────────────────────────────────────
def firework():
    d1 = 0.7
    t = t_(d1)
    whistle = np.sin(2 * np.pi * np.cumsum(900 + 1600 * t / d1) / SR) * np.sin(np.linspace(0, np.pi, len(t))) * 0.25
    whistle += 0.15 * sweep_filter(noise(d1), 800, 3000, 6)
    boom = thud(1.0, 55) * 0.9 + lp(noise(1.0), 900) * env(int(SR * 1.0), 0.001, 0.15)
    crackle = np.zeros(int(SR * 1.6))
    for _ in range(90):
        p = int(rng.uniform(0.15, 1.5) * SR)
        c = hp(noise(0.006), 2500) * rng.uniform(0.1, 0.5)
        crackle[p:p + len(c)] += c[: len(crackle) - p]
    tail = np.pad(boom, (0, len(crackle) - len(boom))) + crackle
    return reverb(np.concatenate([whistle, tail]), 1.8, 0.35)


save('firework', firework(), width=1)

# ── rewind / tape ───────────────────────────────────────────────────────────
d = 1.1
t = t_(d)
f = 220 * 2 ** (3.5 * (t / d) ** 1.4)
saw = signal.sawtooth(2 * np.pi * np.cumsum(f * (1 + 0.06 * np.sin(2 * np.pi * 13 * t))) / SR) * 0.35
chatter = bp(noise(d), 1200, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (18 + 40 * t / d) * t))) * 0.35
save('rewind_tape', (saw + chatter) * np.minimum(1, np.minimum(t / 0.05, (d - t) / 0.08)), width=1)

# ── riser / sub drop / heartbeat ────────────────────────────────────────────
d = 2.5
t = t_(d)
riser = sweep_filter(noise(d), 200, 6000, 3) * (t / d) ** 2 + 0.4 * np.sin(2 * np.pi * np.cumsum(80 + 300 * (t / d) ** 2) / SR) * (t / d) ** 2
save('riser', riser, width=1)
d = 2.0
t = t_(d)
save('sub_drop', reverb(np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 1.4) + 30) / SR) * env(len(t), 0.005, 1.2), 1.5, 0.2))
beat = thud(0.3, 52)
hb = np.zeros(int(SR * 1.1))
hb[: len(beat)] += beat
hb[int(SR * 0.24): int(SR * 0.24) + len(beat)] += beat * 0.75
save('heartbeat_low', lp(hb, 400))

# ── paper / map ─────────────────────────────────────────────────────────────
def paper(d=0.35):
    n = int(SR * d)
    x = bp(noise(d), 1500, 9000) * (np.abs(lp(noise(d), 30)) * 6)
    return x * np.sin(np.linspace(0, np.pi, n))


save('paper_swish', paper(), width=1)
save('paper_slide', lp(paper(0.6), 5000), width=1)
save('paper_tear', bp(noise(0.5), 800, 8000) * np.abs(signal.sawtooth(2 * np.pi * 70 * t_(0.5))) * env(int(SR * 0.5), 0.01, 0.25), width=1)
pen = bp(noise(0.8), 3000, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t_(0.8))) * np.sin(np.linspace(0, np.pi, int(SR * 0.8)))
save('pen_draw', pen, peak=0.4, width=1)

# ── musical stings (FluidSynth, FluidR3_GM, MIT) ────────────────────────────
save('sting_shimmer', reverb(fluid([(0, 84, 90, 1.2), (0.06, 88, 85, 1.1), (0.12, 91, 80, 1.0), (0.18, 96, 75, 1.0)], 2.0, 9), 1.5, 0.3), width=1)  # glockenspiel
save('sting_crown', reverb(fluid([(0, 60, 110, 1.4), (0, 64, 110, 1.4), (0, 67, 110, 1.4), (0, 72, 110, 1.4)], 2.0, 61), 1.6, 0.3), width=1)  # brass section
save('sting_hit', reverb(fluid([(0, 48, 127, 0.8), (0, 55, 127, 0.8), (0, 60, 127, 0.8)], 1.6, 55), 1.4, 0.3), width=1)  # orchestra hit
save('timpani_roll', fluid([(i * 0.06, 41, 60 + i * 2, 0.1) for i in range(26)] + [(1.6, 41, 127, 1.2)], 3.0, 47), width=1)
save('timpani_hit', reverb(fluid([(0, 38, 127, 1.4), (0, 45, 110, 1.4)], 2.2, 47), 1.6, 0.25), width=1)
save('snare_roll', fluid([(i * 0.045, 38, 50 + i * 2, 0.05) for i in range(30)] + [(1.4, 49, 120, 1.0)], 2.6, 0, bank=128), width=1)
save('bell_ding', reverb(fluid([(0, 79, 100, 2.0)], 2.4, 14), 1.8, 0.3), width=1)  # tubular bell
save('pluck_up', fluid([(i * 0.07, p, 90, 0.2) for i, p in enumerate([60, 64, 67, 72])], 0.9, 45), width=1)  # pizzicato
save('pluck_down', fluid([(i * 0.07, p, 90, 0.2) for i, p in enumerate([72, 67, 63, 60])], 0.9, 45), width=1)
