import sys, os, time, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; out = argv[0]
sc = reset(); skin(sc); fly, parts, M = load_fly(sc)
fly.location = (0, 0, skin_z(0, 0) + 0.02); fly.rotation_euler = (0, 0, math.radians(-20))
bpy.context.view_layer.update(); fly_fur(sc, fly, M); hp = head_point(sc)
cl = hp + V((0.6, -2.2, 0.35)); camera(sc, cl, hp, lens=60, fstop=5.6, focus=(hp - cl).length)
sky(sc, cl, hp); lights(sc, hp)
t0 = time.time(); render(sc, out, 720, 1280, 32); print('TIME', round(time.time() - t0, 1))
