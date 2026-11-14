# Shared keyframe animation helper for the shot scripts.
# ZK_ANIM = {"f0": 526, "f1": 600, "out": "dir", "keys": [[frame, {param: value, ...}], ...]}
# Values are numbers or lists of numbers; between keys they ease (smootherstep) unless the later key sets "_lin": 1.
import os, json, math

def load():
    a = os.environ.get('ZK_ANIM')
    return json.loads(a) if a else None

def _ease(t): return t * t * t * (t * (t * 6 - 15) + 10)

def at(anim, f):
    """parameter dict at frame f (holds the first/last key outside the range)"""
    keys = sorted(anim['keys'], key=lambda k: k[0])
    names = set(); [names.update(k[1].keys()) for k in keys]; out = {}
    for n in names:
        ks = [(k[0], k[1][n], k[1].get('_lin', 0)) for k in keys if n in k[1]]
        if f <= ks[0][0]: out[n] = ks[0][1]; continue
        if f >= ks[-1][0]: out[n] = ks[-1][1]; continue
        for (fa, va, _), (fb, vb, lin_) in zip(ks, ks[1:]):
            if fa <= f <= fb:
                t = (f - fa) / max(fb - fa, 1e-9); t = t if lin_ else _ease(t)
                if isinstance(va, list): out[n] = [x + (y - x) * t for x, y in zip(va, vb)]
                elif isinstance(va, (int, float)) and isinstance(vb, (int, float)): out[n] = va + (vb - va) * t
                else: out[n] = va if t < 0.5 else vb
                break
    return out

def pulse(f, centre, rise=3, hold=6, fall=8):
    """0..1 glow envelope around a word frame"""
    if f < centre - rise or f > centre + hold + fall: return 0.0
    if f < centre: return _ease((f - (centre - rise)) / rise)
    if f <= centre + hold: return 1.0
    return 1 - _ease((f - centre - hold) / fall)
