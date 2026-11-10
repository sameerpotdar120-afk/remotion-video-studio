# Inside-the-skin cross-section scene (reference 7.6-17.3 s look): tissue layers cut open, amber serrated blades,
# a glossy blood vessel. Look-dev key frame matched to ref 13.0 s ("sawing up and down").
# usage: blender -b --python xsec.py -- <out.png> <res%> <spp>     (tuning: ZK_X json)
import sys, os, math, json, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2])
X = {'dermis': [236, 116, 110], 'dermis_lo': [214, 92, 92], 'dermis_hi': [246, 150, 140],
     'lower': [206, 150, 166], 'lower_lo': [152, 100, 120], 'band': [168, 26, 36], 'vessel': [150, 16, 22],
     'blade_tip': [255, 236, 180], 'blade_base': [240, 172, 84], 'key': 900, 'fill': 350, 'amb': [250, 170, 160], 'amb_k': 0.6,
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
W, D = 14, 6
def block(name, z0, z1, m):
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = name
    o.scale = (W, D, z1 - z0); o.location = (0, D / 2, (z0 + z1) / 2); o.data.materials.append(m); return o
derm = mat('dermis', lin(*X['dermis']), 0.62, **{'Subsurface Weight': 0.25, 'Subsurface Radius': (1, .35, .3)})
cloudy(derm, X['dermis_lo'], X['dermis_hi'], 9); add_bump(derm, [('noise', 14, 0.3), ('noise', 60, 0.2)], mul=0.8)
lower = mat('lower', lin(*X['lower']), 0.28, **{'Coat Weight': 0.55, 'Coat Roughness': 0.12})
cloudy(lower, X['lower_lo'], X['lower'], 14); add_bump(lower, [('cells', 16, 1.0), ('cells', 34, 0.7), ('cells', 70, 0.4)], mul=X.get('crumple', 6.0))
band = mat('band', lin(*X['band']), 0.3, **{'Coat Weight': 0.6, 'Coat Roughness': 0.1})
block('DERMIS', -2.2, 0.0, derm); block('BAND1', -2.4, -2.2, band); block('LOWER', -9, -2.4, lower)
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
def blade(x, tip_z, top_z, w, teeth_side, seed):
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=w, radius2=w * 0.16, depth=top_z - tip_z)
    o = bpy.context.object; o.rotation_euler = (math.radians(180), 0, 0); o.location = (x, -0.35, (top_z + tip_z) / 2); o.scale = (1, 0.45, 1)
    o.data.materials.append(BM); [setattr(p, 'use_smooth', True) for p in o.data.polygons]
    rng = random.Random(seed); n = 24
    for i in range(n):  # cone teeth along one edge
        u = (i + 0.5) / n; z = tip_z + 0.35 + u * (top_z - tip_z - 0.5); r = w * 0.16 + w * 0.84 * (z - tip_z) / (top_z - tip_z)
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.16, radius2=0.0, depth=0.6)
        t = bpy.context.object; t.location = (x + teeth_side * (r + 0.16), -0.35, z); t.rotation_euler = (0, math.radians(teeth_side * 55), 0); t.scale = (1, 0.35, 1); t.data.materials.append(TM)
if X.get('mode', 'blades') == 'blades':
    blade(-0.9, -6.6, 4, 1.0, -1, 1); blade(0.95, -5.2, 4, 0.85, 1, 2)
else:  # mosquito: one hair-thin dark needle slipping cleanly into the vessel
    nm = mat('needle', lin(58, 44, 38), 0.25, **{'Coat Weight': 0.6, 'Coat Roughness': 0.08})
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.16, radius2=0.025, depth=11); nd = bpy.context.object
    nd.rotation_euler = (math.radians(180 - 8), 0, 0); nd.location = (0.1, -0.35, X.get('needle_tip', -7.2) + 5.5); nd.data.materials.append(nm)
    [setattr(p_, 'use_smooth', True) for p_ in nd.data.polygons]

# lights: soft key from front-top-left, warm fill, pinkish ambient
area(sc, 'key', (-4, -8, 2), (0, 0, -4), X['key'], 14, (1, .97, .94)); area(sc, 'fill', (5, -7, -8), (0, 0, -4), X['fill'], 14, (1, .9, .9))
for xx, pw in ((-6, 1), (6, 0.7), (-2.5, 0.5)):  # tall strip lights -> vertical sheen bands on the blades
    area(sc, f'strip{xx}', (xx, -6, -2), (0, 0, -2), X.get('strip', 500) * pw, 1, (1, .95, .85)).data.shape = 'RECTANGLE'
for o in sc.objects:
    if o.name.startswith('strip'): o.data.size = 0.5; o.data.size_y = 14
w = bpy.data.worlds.new('amb'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = lin(*X['amb']); w.node_tree.nodes['Background'].inputs[1].default_value = X['amb_k']
camera(sc, V(X['cam']), V(X['tgt']), lens=X['lens'], fstop=8, focus=(V(X['tgt']) - V(X['cam'])).length)
render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
