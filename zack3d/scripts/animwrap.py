# Generic keyframed render loop for single-frame scene scripts.
# keys: cam / tgt (offsets from `base`), lens, fstop, plus any custom params handled by `extra(p, f)`.
import os, bpy
from mathutils import Vector as V
import anim
from scene import camera, sky, lights

def run(sc, base, lens0, fstop0, light_k, extra=None, RES=25, SPP=16):
    A = anim.load(); base = V(base)
    def apply(p, f=None):
        cl, tg = base + V(p['cam']), base + V(p['tgt'])
        camera(sc, cl, tg, lens=p.get('lens', lens0), fstop=p.get('fstop', fstop0), focus=(tg - cl).length)
        if extra: extra(p, f)
        if f is not None:
            cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        return tg
    tg = apply(anim.at(A, A['f0']))
    sky(sc, sc.camera.location, tg, light_frac=0.5); lights(sc, tg, light_k)
    for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
    sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
    dp = [n for n in sc.world.node_tree.nodes if n.type == 'VECT_MATH'][0]; out = A['out']; os.makedirs(out, exist_ok=True)
    for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
        sc.frame_set(f); pp = anim.at(A, f); dp.inputs[1].default_value = (base + V(pp['tgt']) - sc.camera.location).normalized()
        sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
