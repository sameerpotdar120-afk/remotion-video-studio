# Shot 20 key frame: "about their own body weight in blood" - a balance with the horsefly on one pan and an
# equal-size glossy blood drop on the other, beam level, in the cyan world.
# usage: blender -b --python balance.py -- <out.png> <res%> <spp> [tilt_deg]
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2]); TILT = float(argv[3]) if len(argv) > 3 else 0.0
S = {'cam': [0.0, -17.5, 7.2], 'tgt': [0, 0, 5.4], 'lens': 40}
S.update(json.loads(os.environ.get('ZK_S', '{}')))
scene.MOUTH_LEN = 0.6
sc = reset()
brass = mat('brass', lin(214, 168, 92), 0.22, **{'Metallic': 1.0, 'Coat Weight': 0.3})
def cyl(name, loc, r, d, rot=(0, 0, 0), m=brass, v=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d); o = bpy.context.object; o.name = name; o.location = loc; o.rotation_euler = rot
    o.data.materials.append(m); [setattr(p, 'use_smooth', True) for p in o.data.polygons]; return o
# stand
cyl('base', (0, 0, 0.2), 2.4, 0.4); cyl('post', (0, 0, 4.0), 0.22, 7.6)
beam = bpy.data.objects.new('BEAM', None); sc.collection.objects.link(beam); beam.location = (0, 0, 7.8); beam.rotation_euler = (0, math.radians(TILT), 0)
b = cyl('bar', (0, 0, 0), 0.16, 7.2, rot=(0, math.radians(90), 0)); b.parent = beam
pans = []
for sx in (-1, 1):
    hang = bpy.data.objects.new(f'HANG{sx}', None); sc.collection.objects.link(hang); hang.parent = beam; hang.location = (sx * 3.4, 0, 0)
    for k in range(3):  # three chains
        a = k * 2 * math.pi / 3; top = V((0, 0, 0)); bot = V((1.35 * math.cos(a), 1.35 * math.sin(a), -3.6))
        c = cyl(f'ch{sx}{k}', (top + bot) / 2, 0.035, (bot - top).length); c.rotation_euler = (bot - top).to_track_quat('Z', 'Y').to_euler(); c.parent = hang
    pan = cyl(f'pan{sx}', (0, 0, -3.7), 1.6, 0.16); pan.parent = hang; pans.append(pan)
bpy.context.view_layer.update()
# keep the hangers vertical whatever the beam tilt
for sx in (-1, 1): sc.objects[f'HANG{sx}'].rotation_euler = (0, -math.radians(TILT), 0)
bpy.context.view_layer.update()
lp, rp = pans[0].matrix_world.translation, pans[1].matrix_world.translation
fly, parts, M = load_fly(sc, length=2.6); fly.location = lp + V((0, 0, 0.1)); fly.rotation_euler = (0, 0, math.radians(-30)); bpy.context.view_layer.update(); fly_fur(sc, fly, M, k=0.6)
blood = mat('blood', lin(150, 10, 16), 0.1, **{'Coat Weight': 1.0, 'Coat Roughness': 0.02, 'Subsurface Weight': 0.4, 'Subsurface Radius': (1, .15, .1), 'Specular IOR Level': 0.7})
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, radius=1.0); d = bpy.context.object; d.name = 'DROP'
for v in d.data.vertices:  # teardrop: round bottom, pulled to a soft point on top
    if v.co.z > 0: k = v.co.z; v.co.x *= (1 - k) ** 1.35 + 0.0; v.co.y *= (1 - k) ** 1.35; v.co.z = k * 1.9
[setattr(p, 'use_smooth', True) for p in d.data.polygons]
d.location = rp + V((0, 0, 0.82)); d.scale = (0.72, 0.72, 0.72); d.data.materials.append(blood)
import anim, animwrap
if anim.load():
    H = [sc.objects['HANG-1'], sc.objects['HANG1']]; bpy.context.view_layer.update()
    for ob, h in ((fly, H[0]), (d, H[1])):
        mw = ob.matrix_world.copy(); ob.parent = h; ob.matrix_world = mw
    dm = d.data.materials[0].node_tree.nodes['Principled BSDF']; dm.inputs['Emission Color'].default_value = lin(230, 30, 36)
    def ex(p, f):
        t = math.radians(p.get('tilt', 0.0)); beam.rotation_euler = (0, t, 0)
        for h in H: h.rotation_euler = (0, -t, 0)
        dm.inputs['Emission Strength'].default_value = 0.6 * p.get('gd', 0.0)
        if f is not None:
            beam.keyframe_insert('rotation_euler', frame=f); dm.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
            for h in H: h.keyframe_insert('rotation_euler', frame=f)
    animwrap.run(sc, V((0, 0, 0)), S['lens'], 11, 1.25 * 2.4, ex, RES, SPP)
else:
    cl, tgt = V(S['cam']), V(S['tgt'])
    camera(sc, cl, tgt, lens=S['lens'], fstop=11, focus=(tgt - cl).length)
    sky(sc, cl, tgt, light_frac=0.5); lights(sc, tgt, 1.25 * 2.4)
    render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
