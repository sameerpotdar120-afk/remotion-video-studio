# Horsefly exterior shots (02, 03, 11, 15, 26), keyframed via ZK_ANIM.
# keys: z/pitch/yaw/x (fly), cam/tgt (relative to the skin top at the origin), lens, fstop, focus, mouth (orange glow 0..1),
#       mlen (in ZK_ANIM top level: mouth length, default 0.6)
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene, anim
A = anim.load()
scene.MOUTH_LEN = A.get('mlen', 0.6) if A else 0.6
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; RES, SPP = int(argv[1]), int(argv[2])
sc = reset(); skin(sc); fly, parts, M = load_fly(sc); sz = skin_z(0, 0)
p0 = anim.at(A, A['f0'])
fly.location = (p0.get('x', 0), 0, sz + p0.get('z', 0)); fly.rotation_euler = (math.radians(p0.get('pitch', 0)), 0, math.radians(p0.get('yaw', -8))); bpy.context.view_layer.update()
fly_fur(sc, fly, M)
pm = M['proboscis'].node_tree.nodes['Principled BSDF']; pm.inputs['Emission Color'].default_value = lin(255, 190, 60)
def apply(p, f=None):
    fly.location = (p.get('x', 0), 0, sz + p.get('z', 0)); fly.rotation_euler = (math.radians(p.get('pitch', 0)), 0, math.radians(p.get('yaw', -8)))
    bpy.context.view_layer.update(); hp = head_point(sc)
    if p.get('rel_head'): cl, tg = hp + V(p['cam']), hp + V(p['tgt']); fp = hp + V(p['focus']) if 'focus' in p else None
    else:
        cl, tg = V(p['cam']), V(p['tgt']); cl.z += sz; tg.z += sz
        fp = V(p['focus']) if 'focus' in p else None
        if fp is not None: fp.z += sz
    camera(sc, cl, tg, lens=p.get('lens', 50), fstop=p.get('fstop', 4.5), focus=((fp if fp is not None else hp) - cl).length)
    pm.inputs['Emission Strength'].default_value = 3.0 * p.get('mouth', 0.0)
    if f is not None:
        cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        cam.data.dof.keyframe_insert('focus_distance', frame=f); fly.keyframe_insert('location', frame=f); fly.keyframe_insert('rotation_euler', frame=f)
        pm.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
    return tg
tg = apply(p0)
sky(sc, sc.camera.location, tg, light_frac=0.5); lights(sc, tg, 1.25)
out = A['out']; os.makedirs(out, exist_ok=True)
for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
dp = [n for n in sc.world.node_tree.nodes if n.type == 'VECT_MATH'][0]
for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
    sc.frame_set(f); pp = anim.at(A, f); t = (head_point(sc) + V(pp['tgt'])) if pp.get('rel_head') else V(pp['tgt']) + V((0, 0, sz))
    dp.inputs[1].default_value = (t - sc.camera.location).normalized()
    sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
