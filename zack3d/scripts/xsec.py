# Inside-the-skin cross-section scene (reference 7.6-17.3 s look): tissue layers cut open, amber serrated blades,
# a glossy blood vessel. Look-dev key frame matched to ref 13.0 s ("sawing up and down").
# usage: blender -b --python xsec.py -- <out.png> <res%> <spp>     (tuning: ZK_X json)
import sys, os, math, json, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2])
X = {'dermis': [150, 66, 60], 'dermis_lo': [118, 44, 44], 'dermis_hi': [176, 92, 80],
     'lower': [130, 76, 86], 'lower_lo': [98, 54, 64], 'band': [128, 14, 20], 'vessel': [118, 8, 10],
     'blade_tip': [255, 236, 180], 'blade_base': [240, 172, 104], 'key': 900, 'fill': 350, 'amb': [250, 170, 160], 'amb_k': 0.6,
     'cam': [0.1, -4.2, -3.4], 'tgt': [0.0, 0.0, -4.0], 'lens': 26}
X.update(json.loads(os.environ.get('ZK_X', '{}')))
sc = reset()

def cloudy(m, lo, hi, scale, detail=6):
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); t = n.new('ShaderNodeTexNoise')
    t.inputs['Scale'].default_value = scale; t.inputs['Detail'].default_value = detail; t.inputs['Roughness'].default_value = 0.55
    l.new(tc.outputs['Object'], t.inputs['Vector']); r = n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].position = 0.35
    r.color_ramp.elements[0].color = lin(*lo); r.color_ramp.elements[1].position = 0.7; r.color_ramp.elements[1].color = lin(*hi)
    l.new(t.outputs['Fac'], r.inputs['Fac']); l.new(r.outputs['Color'], b.inputs['Base Color'])

# tissue block: the camera looks at the cut face (y = 0 plane); skin surface at z = 0
W, D = 60, 6
def block(name, z0, z1, m):
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = name
    o.scale = (W, D, z1 - z0); o.location = (0, D / 2, (z0 + z1) / 2); o.data.materials.append(m)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); return o
derm = mat('dermis', lin(*X['dermis']), 0.62, **{'Subsurface Weight': 0.25, 'Subsurface Radius': (1, .35, .3)})
cloudy(derm, X['dermis_lo'], X['dermis_hi'], 9); add_bump(derm, [('noise', 14, 0.3), ('noise', 60, 0.2)], mul=0.8)
n, l = nodes(derm); b = n['Principled BSDF']; tc2 = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 8)
l.new(tc2.outputs['Object'], mp.inputs['Vector']); fz = n.new('ShaderNodeTexNoise'); fz.inputs['Scale'].default_value = 60; fz.inputs['Detail'].default_value = 10; l.new(mp.outputs['Vector'], fz.inputs['Vector'])
fb = n.new('ShaderNodeBump'); fb.inputs['Strength'].default_value = 0.5; fb.inputs['Distance'].default_value = 0.02; l.new(fz.outputs['Fac'], fb.inputs['Height'])
prev = b.inputs['Normal'].links[0].from_socket; l.new(prev, fb.inputs['Normal']); l.new(fb.outputs['Normal'], b.inputs['Normal'])   # fibrous streaks
lower = mat('lower', lin(*X['lower']), 0.28, **{'Coat Weight': 0.55, 'Coat Roughness': 0.12})
cloudy(lower, X['lower_lo'], X['lower'], 14); add_bump(lower, [('cells', X.get('cr1', 9), 1.0), ('cells', X.get('cr2', 20), 0.7), ('cells', 45, 0.35)], mul=X.get('crumple', 6.0))
band = mat('band', lin(*X['band']), 0.3, **{'Coat Weight': 0.6, 'Coat Roughness': 0.1})
def remap(m, sc_xyz):
    # the look was tuned on unit cubes scaled to (14, 6, h): reproduce those texture coordinates on the bigger mesh
    n, l = nodes(m)
    for tcn in [x for x in n if x.type == 'TEX_COORD']:
        for lk in list(tcn.outputs['Object'].links):
            mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = sc_xyz; to = lk.to_socket; l.remove(lk); l.new(tcn.outputs['Object'], mp.inputs['Vector']); l.new(mp.outputs['Vector'], to)
remap(derm, (1 / 14, 1 / 6, 1 / 2.2)); remap(lower, (1 / 14, 1 / 6, 1 / 6.6))
block('DERMIS', -2.2, 0.0, derm); block('BAND1', -2.4, -2.2, band); block('LOWER', -30, -2.4, lower)
# bright red rim along the top cut edge (the skin surface seen edge-on)
rim = mat('rim', lin(214, 24, 24), 0.35, **{'Emission Color': lin(214, 24, 24), 'Emission Strength': 0.4})
bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.scale = (W, 0.06, 0.07); o.location = (0, 0.0, 0.0); o.data.materials.append(rim)
# skin surface beyond the cut, receding
sk = mat('skintop', lin(165, 100, 62), 0.7); bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.object; o.scale = (W, 40, 1); o.location = (0, 20, 0.001); o.data.materials.append(sk)
# blood vessel: glossy tube along x, half sunk into the cut face below the band
ves = mat('vessel', lin(*X['vessel']), 0.3, **{'Coat Weight': 0.4, 'Coat Roughness': 0.25, 'Subsurface Weight': 0.3, 'Subsurface Radius': (1, .2, .2)})
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.9, depth=W); o = bpy.context.object; o.rotation_euler = (0, math.radians(90), 0); o.location = (0, 0.25, -4.9)
o.location = (0, 0.25, -7.6); o.data.materials.append(ves); [setattr(p, 'use_smooth', True) for p in o.data.polygons]

# amber serrated blades coming down from above into the tissue
def blade_mat():
    m = mat('blade', lin(*X['blade_base']), 0.22, **{'Metallic': X.get('blade_metal', 0.55), 'Anisotropic': 0.8, 'Coat Weight': 0.4, 'Coat Roughness': 0.05})
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); sx = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sx.inputs[0])
    r = n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color = lin(*X['blade_tip']); r.color_ramp.elements[1].color = lin(*X['blade_base'])
    mr = n.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1; mr.inputs['From Max'].default_value = 1; l.new(sx.outputs['Z'], mr.inputs['Value'])
    l.new(mr.outputs['Result'], r.inputs['Fac']); l.new(r.outputs['Color'], b.inputs['Base Color']); return m
BM = blade_mat()
TM = mat('tooth', lin(248, 196, 60), 0.2, **{'Metallic': 0.5, 'Coat Weight': 0.5, 'Coat Roughness': 0.05})
def glowable(base, name):
    """copy of a material with an Emission input we can key (yellow glow)"""
    m = base.copy(); m.name = name; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Emission Color'].default_value = lin(255, 220, 60); b.inputs['Emission Strength'].default_value = 0.0; return m
def blade(name, x, tip_z, top_z, w, teeth_side, seed, y=-0.35):
    rig = bpy.data.objects.new(name, None); sc.collection.objects.link(rig); rig.location = (x, y, 0)
    bm_, tm_ = glowable(BM, name + '_m'), glowable(TM, name + '_t')
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=w, radius2=w * 0.16, depth=top_z - tip_z)
    o = bpy.context.object; o.rotation_euler = (math.radians(180), 0, 0); o.location = (0, 0, (top_z + tip_z) / 2); o.scale = (1, 0.45, 1); o.parent = rig
    o.data.materials.append(bm_); [setattr(p, 'use_smooth', True) for p in o.data.polygons]
    n = 24
    for i in range(n):  # cone teeth along one edge
        u = (i + 0.5) / n; z = tip_z + 0.35 + u * (top_z - tip_z - 0.5); r = w * 0.16 + w * 0.84 * (z - tip_z) / (top_z - tip_z)
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.16, radius2=0.0, depth=0.6)
        t = bpy.context.object; t.location = (teeth_side * (r + 0.16), 0, z); t.rotation_euler = (0, math.radians(teeth_side * 55), 0); t.scale = (1, 0.35, 1); t.data.materials.append(tm_); t.parent = rig
    return rig, (bm_, tm_)
RIGS = []
if X.get('mode', 'blades') == 'blades':
    # four blades: mandible pair (outer, wide) and maxilla pair (inner, narrower, set back)
    for nm_, x, tip, w, side, y in (('B0', -1.0, -6.6, 1.0, -1, -0.35), ('B1', 1.05, -5.2, 0.85, 1, -0.35), ('B2', -2.9, -5.6, 0.7, -1, 0.4), ('B3', 3.0, -6.0, 0.7, 1, 0.4)):
        RIGS.append(blade(nm_, x, tip, 4, w, side, 1, y))
else:  # mosquito: one hair-thin dark needle slipping cleanly into the vessel
    nm = mat('needle', lin(58, 44, 38), 0.25, **{'Coat Weight': 0.6, 'Coat Roughness': 0.08})
    rig = bpy.data.objects.new('NEEDLE', None); sc.collection.objects.link(rig); rig.location = (0.1, -0.35, 0)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.16, radius2=0.025, depth=11); nd = bpy.context.object
    nd.rotation_euler = (math.radians(180 - 8), 0, 0); nd.location = (0, 0, X.get('needle_tip', -7.2) + 5.5); nd.data.materials.append(nm); nd.parent = rig
    [setattr(p_, 'use_smooth', True) for p_ in nd.data.polygons]; RIGS.append((rig, ()))
# nerve endings in the dermis (glow for "the sting you feel")
NERVE = mat('nerve', lin(214, 120, 120), 0.4, **{'Emission Color': lin(255, 214, 60), 'Emission Strength': 0.0})
rng_n = random.Random(9)
for k in range(6):
    x0 = rng_n.uniform(-5.5, 5.5); pts = [(x0, -0.05, -2.3)]
    for j in range(4): px, py, pz = pts[-1]; pts.append((px + rng_n.uniform(-0.5, 0.5), -0.05, pz + rng_n.uniform(0.35, 0.55)))
    tube_obj(sc, f'NERVE{k}', pts, [0.06, 0.05, 0.04, 0.03, 0.015], NERVE, None)
VES = [o for o in sc.objects if o.data and hasattr(o.data, 'materials') and o.data.materials and o.data.materials[0] == ves][0]
ves.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = lin(255, 210, 60)

# lights: soft key from front-top-left, warm fill, pinkish ambient
area(sc, 'key', (-4, -8, 2), (0, 0, -4), X['key'], 14, (1, .97, .94)); area(sc, 'fill', (5, -7, -8), (0, 0, -4), X['fill'], 14, (1, .9, .9))
for xx, pw in ((-6, 1), (6, 0.7), (-2.5, 0.5)):  # tall strip lights -> vertical sheen bands on the blades
    area(sc, f'strip{xx}', (xx, -6, -2), (0, 0, -2), X.get('strip', 500) * pw, 1, (1, .95, .85)).data.shape = 'RECTANGLE'
for o in sc.objects:
    if o.name.startswith('strip'): o.data.size = 0.5; o.data.size_y = 14
w = bpy.data.worlds.new('amb'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = lin(*X['amb']); w.node_tree.nodes['Background'].inputs[1].default_value = X['amb_k']

import anim
A = anim.load()
if A and A.get('mode'): pass
def apply(p, f=None):
    camera(sc, V(p.get('cam', X['cam'])), V(p.get('tgt', X['tgt'])), lens=p.get('lens', X['lens']), fstop=p.get('fstop', 8), focus=(V(p.get('tgt', X['tgt'])) - V(p.get('cam', X['cam']))).length)
    for i, (rig, mats) in enumerate(RIGS):
        rig.location.z = p.get(f'z{i}', 0.0)
        for m in mats: m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 4.0 * p.get(f'g{i}', 0.0)
    NERVE.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 10.0 * p.get('gn', 0.0)
    gv = p.get('gv', 0.0); vb = ves.node_tree.nodes['Principled BSDF']; vb.inputs['Emission Strength'].default_value = 0.18 * gv
    c0, c1 = lin(*X['vessel']), lin(236, 176, 40); vb.inputs['Base Color'].default_value = [c0[i] + (c1[i] - c0[i]) * gv for i in range(4)]
    if f is not None:  # key everything so Cycles motion blur sees the movement
        cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        for rig, mats in RIGS:
            rig.keyframe_insert('location', frame=f)
            for m in mats: m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
        for m in (NERVE, ves): m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
        ves.node_tree.nodes['Principled BSDF'].inputs['Base Color'].keyframe_insert('default_value', frame=f)
if A:
    out = A['out']; os.makedirs(out, exist_ok=True)
    for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = (A or {}).get('shutter', 0.5) if 'A' in dir() else 0.5
    sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
    for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
        sc.frame_set(f); sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
else:
    apply({}); render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
