import sys, os, time, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene
scene.MOUTH_LEN = 1.9
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; out = argv[0]
sc = reset(); skin(sc); fly, parts, M = load_fly(sc)
fly.location = (0, 0, skin_z(0, 0) - 0.05); fly.rotation_euler = (math.radians(-16), 0, math.radians(-14))
bpy.context.view_layer.update(); fly_fur(sc, fly, M); hp = head_point(sc)
cl = hp + V((0.5, -3.0, -0.75)); tgt = hp + V((0, 0, -0.6)); camera(sc, cl, tgt, lens=50, fstop=6.0, focus=(hp - cl).length)
sky(sc, cl, tgt); lights(sc, tgt)
t0 = time.time(); render(sc, out, 720, 1280, 32); print('TIME', round(time.time() - t0, 1))
