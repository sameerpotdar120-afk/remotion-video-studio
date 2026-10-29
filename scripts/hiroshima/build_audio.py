"""Soundtrack for the Hiroshima short: the reference voice-over (public/hiroshima/vo.wav) over our own score and
sound effects, following the reference's bed curve (docs/hiroshima-ref/ANALYSIS.md §9): low end enters with the plane,
builds 22–56 s, drops away 56–60 s, surges at the flash, then silence. Bed sits ~11 LU under the voice.
Sources (public/hiroshima/sfx_src, credits in docs/hiroshima/AUDIO_CREDITS.md): Mixkit free SFX, Kevin MacLeod (CC BY 4.0).

    python3 -I scripts/hiroshima/build_audio.py  ->  public/hiroshima/soundtrack.wav
"""
import os, subprocess, json, re
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 3901 / 60
N = int(round(DUR * SR))
SRC = 'public/hiroshima/sfx_src'
LIB = 'public/assets/sfx'
F = lambda frame: frame / 60  # reference frame → seconds


def load(path, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path]
    if dur: cmd += ['-t', str(dur)]
    raw = subprocess.run(cmd + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def env(n, keys):
    """Gain curve in dB from [(t_rel_seconds, dB), ...], linear in dB between keys."""
    t = np.arange(n) / SR
    k = np.array(keys, float)
    return 10 ** (np.interp(t, k[:, 0], k[:, 1]) / 20)


def fades(x, fi=0.02, fo=0.05):
    x = x.copy(); n = len(x)
    a, b = min(n, int(fi * SR)), min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


def lp(x, hz):
    return sosfilt(butter(4, hz, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, hz):
    return sosfilt(butter(2, hz, 'high', fs=SR, output='sos'), x, axis=0)


bed = np.zeros((N, 2))


def put(x, t, db=0.0, keys=None, fi=0.02, fo=0.05):
    x = fades(x, fi, fo) * 10 ** (db / 20)
    if keys: x = x * env(len(x), keys)[:, None]
    a = int(round(t * SR)); b = min(N, a + len(x))
    if b > a: bed[a:b] += x[: b - a]


def varispeed(x, speed):
    """Tape-style playback with a time-varying speed curve (per output sample): pitch falls as it slows."""
    pos = np.cumsum(speed); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); fr = (pos - i)[:, None]
    return x[i] * (1 - fr) + x[i + 1] * fr


# ── score: Kevin MacLeod "Lightless Dawn" (dark sustained strings), shaped to the reference bed curve ──
mus = load(f'{SRC}/km_Lightless_Dawn.mp3', 0, DUR)
put(mus, 0, -2, keys=[(0, -10), (3, -9), (8, -7), (12, -5), (22, -5), (40, -2), (55.6, 0), (56.6, -30), (58.0, -60), (DUR, -60)], fi=0.5)

# ── 1 · breakfast: garden birds through the window, quiet room ──
put(load(f'{SRC}/mk17.mp3'), 0.0, -14, fi=0.6, fo=0.8)
put(load(f'{SRC}/mk3080.mp3', 0, 4.7), 0, -16, fi=0.5, fo=0.1)

# ── 2 · the hand siren winds down and stops on "IT STOPPED" ──
sir = load(f'{SRC}/mk1651.mp3', 5.0, 6.0)
n = int(4.0 * SR); t = np.arange(n) / SR
t_but, t_stop = F(414) - F(284), F(450) - F(284)
speed = np.where(t < t_but, 1.0, np.clip(1 - 0.8 * (t - t_but) / (t_stop - t_but), 0.2, 1))
sw = varispeed(sir, speed)
put(sw, F(284) - 0.35, -17, keys=[(0, 0), (t_but + 0.35, 0), (t_stop + 0.35, -14), (t_stop + 0.9, -60)], fi=0.15)

# ── 3 · the lone plane, far up (rumble enters with it) ──
put(lp(load(f'{SRC}/mk1590.mp3', 30, 4.6), 1800), F(483), -9, fi=0.6, fo=0.4)

# ── 5 · room tone indoors; 6 · kids outside, morning birds ──
put(load(f'{SRC}/mk3080.mp3', 5, F(1027) - F(806)), F(806), -16, fi=0.1, fo=0.1)
put(load(f'{SRC}/mk2472.mp3', 20, F(1227) - F(1027)), F(1027), -6, fi=0.3, fo=0.2)

# ── 8 · "a faint engine hum drifts over the city"; 9 · the clock ticks while he listens ──
put(lp(load(f'{SRC}/mk1590.mp3', 0, 7.5), 1200), F(1294), -4, keys=[(0, -10), (2.5, -4), (7.5, 0)], fi=0.4, fo=0.3)
put(load(f'{SRC}/mk1060.mp3', 2, F(1703) - F(1448)), F(1448), -10, fi=0.1, fo=0.1)
put(load(f'{SRC}/mk3080.mp3', 12, F(1703) - F(1448)), F(1448), -16, fi=0.1, fo=0.1)

# ── 11–12 · "the sound grows louder"; 13 · the B-29 passes over ──
put(lp(load(f'{SRC}/mk1590.mp3', 40, F(1934) - F(1761)), 2500), F(1761), -6, keys=[(0, -8), (2.9, 0)], fi=0.1, fo=0.1)
put(load(f'{SRC}/mk1579.mp3', 0, F(2148) - F(1934)), F(1934), -16, fi=0.2, fo=0.25)

# ── 15 · inside, the drone keeps on, far away ──
put(lp(load(f'{SRC}/mk1590.mp3', 20, F(2719) - F(2218)), 700), F(2218), -14, fi=0.2, fo=0.2)
put(load(f'{SRC}/mk3080.mp3', 20, F(2719) - F(2218)), F(2218), -16, fi=0.1, fo=0.1)

# ── 17 · into the sun: high distant engine; 19 · heartbeat starts under the squint ──
put(lp(hp(load(f'{SRC}/mk1568.mp3', 0, F(3062) - F(2781) + 0.4), 300), 3000), F(2781), -18, fi=0.4, fo=0.8)
hb = load(f'{SRC}/mk494.mp3', 0, F(3411) - F(3044))
put(hb, F(3044), -10, keys=[(0, -12), (3, -4), (6, 0)], fi=0.5, fo=0.3)

# ── 21 · the bomb falls: whistle, whip whoosh into 22 ──
put(load(f'{SRC}/mk1337.mp3', 0, 2.6), F(3228) - 0.1, -16, fi=0.05, fo=0.4)
put(load(f'{LIB}/whoosh_fast.wav'), F(3296), -12)

# ── 24–25 · near silence, a riser into the light ──
put(load(f'{SRC}/mk3080.mp3', 30, F(3634) - F(3437)), F(3437), -14, fi=0.1, fo=0.1)
ris = load(f'{LIB}/riser.wav')
put(ris[-int(min(len(ris) / SR, 3.0) * SR):], F(3634) - min(len(ris) / SR, 3.0), -14, fi=0.8, fo=0.02)

# ── 26 · the flash: muffled blast, swell, deep wind, ringing ears, then silence ──
t0 = F(3634)
put(lp(load(f'{SRC}/mk2782.mp3'), 900), t0, -17, fi=0.002, fo=1.0)
put(load(f'{SRC}/mk1686.mp3'), t0 + 0.05, -19, fi=0.002, fo=0.8)
put(load(f'{LIB}/sub_drop.wav'), t0, -20, fi=0.002)
put(load(f'{SRC}/mk786.mp3', 1.0), t0 + 0.2, -18, fi=0.3, fo=1.0)
put(lp(load(f'{SRC}/mk1177.mp3', 2, DUR - t0), 500), t0, -24, keys=[(0, 0), (2.5, -3), (DUR - t0 - 0.9, -14), (DUR - t0, -60)], fi=0.4, fo=0.1)
tn = np.arange(int(3.4 * SR)) / SR
ring = (np.sin(2 * np.pi * 5200 * tn) * 0.6 + np.sin(2 * np.pi * 5207 * tn) * 0.4)[:, None] * np.ones((1, 2))
put(ring * 0.006, t0 + 0.3, 0, keys=[(0, -6), (0.6, 0), (3.4, -40)], fi=0.4, fo=0.2)


def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])


def save(x, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path],
                   input=np.ascontiguousarray(x).tobytes(), check=True)


tmp = 'out/hiro'; os.makedirs(tmp, exist_ok=True)
save(bed, f'{tmp}/bed.wav'); bl = lufs(f'{tmp}/bed.wav')
vo = load('public/hiroshima/vo.wav')[:N]; vo = np.pad(vo, ((0, N - len(vo)), (0, 0)))
save(vo, f'{tmp}/vo.wav'); vl = lufs(f'{tmp}/vo.wav')
bed *= 10 ** (((vl - 11.0) - bl) / 20)  # bed 11 LU under the voice, as measured on the reference
mix = vo + bed
save(mix, f'{tmp}/mix.wav'); ml = lufs(f'{tmp}/mix.wav')
mix *= 10 ** ((-17.6 - ml) / 20)
peak = np.abs(mix).max()
if peak > 0.89: mix *= 0.89 / peak
save(mix, 'public/hiroshima/soundtrack.wav')
print(json.dumps({'bed_lufs_raw': bl, 'vo_lufs': vl, 'mix_lufs_before': ml, 'final_lufs': lufs('public/hiroshima/soundtrack.wav'), 'peak': float(np.abs(mix).max())}))
