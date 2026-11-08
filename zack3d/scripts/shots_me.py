# My shots of the 5 s test: S1 landing (1-24), S3 wide low (46-56), S5 face (115-129), S6 skin level (130-150).
# usage: blender -b --python shots_me.py -- <shot> <out_dir> <res%> <spp> [frame_start frame_end]
import sys, os, time, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene
argv = sys.argv[sys.argv.index('--') + 1:]; SHOT, OUT, RES, SPP = argv[0], argv[1], int(argv[2]), int(argv[3])
RANGES = {'s1': (1, 24), 's3': (46, 56), 's5': (115, 129), 's6': (130, 150)}
F0, F1 = (int(argv[4]), int(argv[5])) if len(argv) > 5 else RANGES[SHOT]
if SHOT in ('s5', 's6'): scene.MOUTH_LEN = 1.9
from scene import *
def lerp(a, b, k): return a + (b - a) * k
def ease(x): x = max(0, min(1, x)); return x * x * (3 - 2 * x)
def lerpv(a, b, k): return V(a).lerp(V(b), k)
def seg(f, a, b): return max(0, min(1, (f - a) / (b - a)))
os.makedirs(OUT, exist_ok=True)
sc = reset(); skin(sc); fly, parts, M = load_fly(sc)
sz = skin_z(0, 0)
def place(z, pitch, yaw): fly.location = (0, 0, sz + z); fly.rotation_euler = (math.radians(pitch), 0, math.radians(yaw)); bpy.context.view_layer.update()
# grow fur once at a neutral placement (it is parented to FLY, so it follows every move)
if SHOT == 's1': place(1.9, 20, -14)
elif SHOT == 's3': place(0, 0, -10)
else: place(-0.05, -16, 14)
fly_fur(sc, fly, M)
W, Hh = 1440 * RES // 100, 2560 * RES // 100
for f in range(F0, F1 + 1):
    if SHOT == 's1':  # descends nose-down and lands; camera sinks and closes in
        k = ease(seg(f, 1, 17)); place(lerp(1.9, 0.0, k) + 0.04 * math.sin(f * 1.7) * (1 - k), lerp(20, 0, ease(seg(f, 1, 15))), lerp(-14, -8, k))
        c = ease(seg(f, 1, 24)); cl = lerpv((0, -7.0, sz + 2.7), (0.1, -5.6, sz + 1.3), c); tgt = lerpv((0, 0, sz + 2.35), (-0.25, 0, sz + 0.8), c)
        hp = head_point(sc); camera(sc, cl, tgt, lens=lerp(50, 46, c), fstop=4.5, focus=(hp - cl).length)
    elif SHOT == 's3':  # wide low shot along the skin, slow push in
        c = seg(f, 46, 56); cl = lerpv((-0.6, -21.0, sz + 0.5), (-0.3, -18.6, sz + 0.45), c); tgt = V((0, 0, sz + 0.75))
        camera(sc, cl, tgt, lens=55, fstop=8, focus=(V((0, 0, sz)) - cl).length)
    elif SHOT == 's5':  # head-on face close-up, slight push and drift
        hp = head_point(sc); c = seg(f, 115, 129); cl = hp + lerpv((-0.55, -3.1, -0.7), (-0.4, -2.7, -0.8), c); tgt = hp + V((0, 0, -0.62))
        camera(sc, cl, tgt, lens=50, fstop=6.0, focus=(hp - cl).length)
    else:  # down to skin level at the mouthparts
        hp = head_point(sc); c = ease(seg(f, 130, 150)); tip = V((hp.x, hp.y - 0.25, sz))
        cl = tip + lerpv((-0.3, -2.2, 1.0), (-0.12, -1.55, 0.72), c); tgt = tip + lerpv((0, 0, 0.6), (0, 0, 0.22), c)
        camera(sc, cl, tgt, lens=lerp(42, 36, c), fstop=5.0, focus=(tip + V((0, 0, 0.3)) - cl).length)
    if f == F0: sky(sc, sc.camera.location, tgt, light_frac=0.5); lights(sc, tgt, 0.8 if SHOT == 's3' else 1.25)
    else:  # re-aim the sky glow behind the subject every frame
        dp = [n for n in sc.world.node_tree.nodes if n.type == 'VECT_MATH'][0]; dp.inputs[1].default_value = (V(tgt) - sc.camera.location).normalized()
    t0 = time.time(); render(sc, os.path.join(OUT, f'f_{f:04d}.png'), W, Hh, SPP); print('FRAME', f, round(time.time() - t0, 1), flush=True)
