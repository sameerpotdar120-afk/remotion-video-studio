import sys, os, time, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; out = argv[0]; hover = float(argv[1]) if len(argv) > 1 else 1.0
sc = reset(); skin(sc); fly, parts, M = load_fly(sc)
fly.location = (0, 0, skin_z(0, 0) + hover); fly.rotation_euler = (math.radians(float(argv[3]) if len(argv) > 3 else 12), 0, math.radians(float(argv[4]) if len(argv) > 4 else 0))
bpy.context.view_layer.update(); fly_fur(sc, fly, M); hp = head_point(sc); tgt = V((0, 0, fly.location.z + 0.45))
cl = V((0, -7.4, fly.location.z + 0.8)); camera(sc, cl, tgt, lens=50, fstop=4.0, focus=(hp - cl).length)
sky(sc, cl, tgt); lights(sc, tgt)
t0 = time.time(); render(sc, out, 540, 960, int(argv[2]) if len(argv) > 2 else 24); print('TIME', round(time.time() - t0, 1))
