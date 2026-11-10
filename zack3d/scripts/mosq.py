# Mosquito on the skin in the cyan world (shots 01/06/25). "MOSQUITO" by Branislav (Sketchfab), CC BY 4.0.
# usage: blender -b --python mosq.py -- <out.png> <res%> <spp>     (tuning: ZK_M json)
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2])
Mq = {'z': 0.0, 'pitch': 0, 'yaw': -20, 'len': 3.4, 'cam': [0.4, -6.4, 0.75], 'tgt': [0, 0, 0.9], 'lens': 60, 'fstop': 4.5, 'light_k': 1.0}
Mq.update(json.loads(os.environ.get('ZK_M', '{}')))
GLB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'mosquito.glb')
if not os.path.exists(GLB): GLB = '/root/zack/dl/new/fce3bbae949c4966a6cfd9d757deba9b.glb'
sc = reset(); skin(sc); sz = skin_z(0, 0)
before = set(sc.objects); bpy.ops.import_scene.gltf(filepath=GLB); new = [o for o in sc.objects if o not in before]
for o in new:
    if o.name.startswith('Skin_Plane') or o.name.startswith('Drop_Sphere'): o.hide_render = True; o.hide_viewport = True
meshes = [o for o in new if o.type == 'MESH' and not o.hide_render]
# realistic recolour: desaturate/darken the body texture, dark glossy compound eyes, dark hairs
def tame(m, sat, val):
    if not m or not m.use_nodes: return
    n, l = m.node_tree.nodes, m.node_tree.links; b = n.get('Principled BSDF')
    if not b or not b.inputs['Base Color'].links: return
    src = b.inputs['Base Color'].links[0].from_socket; hs = n.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = sat; hs.inputs['Value'].default_value = val
    l.new(src, hs.inputs['Color']); l.new(hs.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.35; b.inputs['Coat Weight'].default_value = 0.4
for o in meshes:
    for i, m in enumerate(o.data.materials):
        if m is None: continue
        if 'EYES' in m.name:
            E = LOOK.get('eye', {}); em = mat('meye', lin(40, 28, 26), 0.25, **{'Coat Weight': 0.5, 'Coat Roughness': 0.08})
            add_bump(em, [('cells', 140, 0.6)], mul=1.0); o.data.materials[i] = em
        elif 'BODY' in m.name: tame(m, Mq.get('sat', 0.55), Mq.get('val', 0.55))
        elif 'HAIR' in m.name: tame(m, 0.2, 0.4)
mn = V((1e9,) * 3); mx = -mn
for o in meshes:
    for c in o.bound_box: w = o.matrix_world @ V(c); mn = V(map(min, mn, w)); mx = V(map(max, mx, w))
piv = bpy.data.objects.new('MPIV', None); sc.collection.objects.link(piv); s = Mq['len'] / (mx.y - mn.y)
piv.scale = (s, s, s); piv.location = (-(mn.x + mx.x) / 2 * s, -(mn.y + mx.y) / 2 * s, -mn.z * s)
for o in new:
    if o.parent is None: o.parent = piv
MQ = bpy.data.objects.new('MOSQ', None); sc.collection.objects.link(MQ); piv.parent = MQ
MQ.location = (0, 0, sz + Mq['z']); MQ.rotation_euler = (math.radians(Mq['pitch']), 0, math.radians(Mq['yaw']))
import anim
A = anim.load()
def apply(p, f=None):
    MQ.location = (p.get('mx', 0.0), p.get('my', 0.0), sz + p.get('mz', Mq['z'])); MQ.rotation_euler = (math.radians(p.get('pitch', Mq['pitch'])), 0, math.radians(p.get('yaw', Mq['yaw'])))
    cl, tg = V(p.get('cam', Mq['cam'])), V(p.get('tgt', Mq['tgt'])); cl.z += sz; tg.z += sz
    fp = V(p.get('focus', [0, -1.2, 0.5])); fp.z += sz
    camera(sc, cl, tg, lens=p.get('lens', Mq['lens']), fstop=p.get('fstop', Mq['fstop']), focus=(fp - cl).length)
    if f is not None:
        cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        MQ.keyframe_insert('location', frame=f); MQ.keyframe_insert('rotation_euler', frame=f)
    return tg
tgt = apply(anim.at(A, A['f0']) if A else {})
sky(sc, sc.camera.location, tgt, light_frac=0.5); lights(sc, tgt, 1.25 * Mq['light_k'])
if A:
    out = A['out']; os.makedirs(out, exist_ok=True)
    for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
    sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
    dp = [n for n in sc.world.node_tree.nodes if n.type == 'VECT_MATH'][0]
    for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
        sc.frame_set(f); pp = anim.at(A, f); tg = V(pp.get('tgt', Mq['tgt'])); tg.z += sz
        dp.inputs[1].default_value = (tg - sc.camera.location).normalized()
        sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
else:
    render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
