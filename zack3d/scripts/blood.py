# Extreme macro on the skin surface: velvety skin, a red-rimmed cut, blood bead / glassy saliva / spongy pad.
# Look-dev for ref 20.5 s (saliva in the cut), 23.9 s (blood bead), 25.8 s (pad in a blood pool).
# usage: blender -b --python blood.py -- <mode bead|saliva|pad> <out.png> <res%> <spp>   (tuning: ZK_B json)
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; MODE, OUT, RES, SPP = argv[0], argv[1], int(argv[2]), int(argv[3])
B = {'skin': [206, 142, 110], 'skin_lo': [194, 126, 98], 'skin_hi': [226, 182, 160], 'cut': [220, 22, 22], 'blood': [142, 10, 16],
     'cam': [0.0, -2.4, 2.3], 'tgt': [0.0, 0.0, 0.0], 'lens': 42, 'fstop': 3.5, 'key': 220, 'amb': 0.35}
B.update(json.loads(os.environ.get('ZK_B', '{}')))
sc = reset()
# velvety skin: soft colour clouds + fine fuzz via sheen, very low specular
sk = mat('vskin', lin(*B['skin']), 0.75, **{'Sheen Weight': 0.35, 'Sheen Roughness': 0.4, 'Sheen Tint': lin(255, 220, 200), 'Specular IOR Level': 0.08,
                                            'Subsurface Weight': 0.3, 'Subsurface Radius': (1, .4, .3)})
n, l = nodes(sk); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord')
t = n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value = 0.6; t.inputs['Detail'].default_value = 8; t.inputs['Roughness'].default_value = 0.6
l.new(tc.outputs['Object'], t.inputs['Vector']); r = n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].position = 0.35; r.color_ramp.elements[0].color = lin(*B['skin_lo'])
r.color_ramp.elements[1].position = 0.68; r.color_ramp.elements[1].color = lin(*B['skin_hi']); l.new(t.outputs['Fac'], r.inputs['Fac'])
# the cut: a soft red glow band along x = slit line (distance from the line in y)
sx = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sx.inputs[0]); ab = n.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'
rot = n.new('ShaderNodeMath'); rot.operation = 'MULTIPLY_ADD'; rot.inputs[1].default_value = math.tan(math.radians(B.get('cut_angle', 12))); rot.inputs[2].default_value = 0.0
l.new(sx.outputs['X'], rot.inputs[0]); sub = n.new('ShaderNodeMath'); sub.operation = 'SUBTRACT'; l.new(sx.outputs['Y'], sub.inputs[0]); l.new(rot.outputs[0], sub.inputs[1])
l.new(sub.outputs[0], ab.inputs[0]); cr = n.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
e[0].position = 0.0; e[0].color = lin(96, 8, 12); e[1].position = 0.5; e[1].color = (0, 0, 0, 1)
e.new(0.16).color = lin(120, 10, 14); e.new(0.24).color = lin(*B['cut']); e.new(0.3).color = lin(*B['cut'])
fac = n.new('ShaderNodeValToRGB'); f2 = fac.color_ramp.elements; f2[0].position = 0.3; f2[0].color = (0, 0, 0, 1); f2[1].position = 0.5; f2[1].color = (1, 1, 1, 1)
l.new(ab.outputs[0], cr.inputs['Fac']); l.new(ab.outputs[0], fac.inputs['Fac'])
mx = n.new('ShaderNodeMix'); mx.data_type = 'RGBA'; l.new(cr.outputs['Color'], mx.inputs['A']); l.new(fac.outputs['Color'], mx.inputs['Factor']); l.new(r.outputs['Color'], mx.inputs['B'])
l.new(mx.outputs['Result'], b.inputs['Base Color'])
if MODE == 'pad':
    for el in fac.color_ramp.elements: el.color = (1, 1, 1, 1)
    # distant skin is barely lit at this grazing angle and goes dark: fade it into self-lit skin colour by camera depth
    cdn = n.new('ShaderNodeCameraData'); mrd = n.new('ShaderNodeMapRange'); mrd.inputs['From Min'].default_value = B.get('fade0', 7); mrd.inputs['From Max'].default_value = B.get('fade1', 16)
    l.new(cdn.outputs['View Z Depth'], mrd.inputs['Value']); emd = n.new('ShaderNodeEmission'); emd.inputs['Color'].default_value = lin(*B.get('far_skin', [226, 140, 104]))
    msd = n.new('ShaderNodeMixShader'); l.new(mrd.outputs['Result'], msd.inputs['Fac']); l.new(b.outputs['BSDF'], msd.inputs[1]); l.new(emd.outputs['Emission'], msd.inputs[2])
    l.new(msd.outputs['Shader'], n['Material Output'].inputs['Surface'])
add_bump(sk, [('noise', 3, 0.25), ('noise', 25, 0.15)], mul=0.6)
# velvety fuzz: fine streaky noise stretched along one direction, as bump + slight colour
n, l = nodes(sk); b = n['Principled BSDF']; tc2 = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 6, 1)
l.new(tc2.outputs['Object'], mp.inputs['Vector']); fz = n.new('ShaderNodeTexNoise'); fz.inputs['Scale'].default_value = 22; fz.inputs['Detail'].default_value = 12; l.new(mp.outputs['Vector'], fz.inputs['Vector'])
fb = n.new('ShaderNodeBump'); fb.inputs['Strength'].default_value = B.get('fuzz', 0.35); fb.inputs['Distance'].default_value = 0.02; l.new(fz.outputs['Fac'], fb.inputs['Height'])
prev = b.inputs['Normal'].links[0].from_socket; l.new(prev, fb.inputs['Normal']); l.new(fb.outputs['Normal'], b.inputs['Normal'])
bpy.ops.mesh.primitive_grid_add(x_subdivisions=500, y_subdivisions=500, size=12); g = bpy.context.object; g.data.materials.append(sk)
_a = math.radians(B.get('cut_angle', 12)); _gw = B.get('groove_w', 0.2); _gd = B.get('groove_d', 0.0 if MODE == 'pad' else 0.12)
for v in g.data.vertices:  # carve a V/U groove along the cut line
    d = abs(v.co.y * math.cos(_a) - v.co.x * math.sin(_a))
    if d < _gw: v.co.z -= _gd * (1 - (d / _gw) ** 2)
    elif _gd > 0 and d < _gw * 1.8: v.co.z += 0.025 * math.sin(math.pi * (d - _gw) / (_gw * 0.8))   # slight swollen lips
for p_ in g.data.polygons: p_.use_smooth = True
bpy.ops.mesh.primitive_plane_add(size=60); g2 = bpy.context.object; g2.location.z = -0.003; g2.data.materials.append(sk)
# the slit itself: a thin dark-red groove (sunken strip) with glossy wet walls
cutm = mat('cutwet', lin(150, 12, 18), 0.15, **{'Coat Weight': 1.0, 'Coat Roughness': 0.05})
bpy.ops.mesh.primitive_cube_add(size=1); s_ = bpy.context.object; s_.scale = (11.5, 0.3, 0.02); s_.location = (0, 0, -0.13)
s_.rotation_euler = (0, 0, math.atan(math.tan(math.radians(B.get('cut_angle', 12))))); s_.data.materials.append(cutm)
if MODE == 'pad': s_.hide_render = True
blood = mat('blood', lin(*B['blood']), 0.12, **{'Coat Weight': 1.0, 'Coat Roughness': 0.02, 'Subsurface Weight': 0.35, 'Subsurface Radius': (1, .15, .1), 'Specular IOR Level': 0.7})
def blob(name, centers, mat_, res=0.04):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res * 0.5; o = bpy.data.objects.new(name, mb); sc.collection.objects.link(o)
    for (c, r_, sc_) in centers:
        e = mb.elements.new(); e.co = c; e.radius = r_; e.size_x, e.size_y, e.size_z = sc_ if isinstance(sc_, tuple) else (sc_, sc_, sc_); e.type = 'ELLIPSOID'
    o.data.materials.append(mat_); return o
a = math.radians(B.get('cut_angle', 12)); import random as _r; rr = _r.Random(4)
if MODE in ('bead', 'pad'):  # lumpy wet clot along the slit: a noisy displaced tube in the groove
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.085, depth=11.5); cl_ = bpy.context.object; cl_.rotation_euler = (0, math.radians(90), a); cl_.location = (0, 0, -0.08)
    bpy.ops.object.modifier_add(type='SUBSURF'); cl_.modifiers[-1].levels = 2; cl_.modifiers[-1].render_levels = 3
    tx = bpy.data.textures.new('clotn', 'CLOUDS'); tx.noise_scale = 0.12; dm = cl_.modifiers.new('d', 'DISPLACE'); dm.texture = tx; dm.strength = 0.07
    cl_.data.materials.append(blood); [setattr(p_, 'use_smooth', True) for p_ in cl_.data.polygons]
if False:
    blob('CLOT', [(((x * 0.22 - 4) * math.cos(a), (x * 0.22 - 4) * math.sin(a), -0.08), rr.uniform(0.1, 0.16), (1.4, 0.7, 0.35)) for x in range(37)], blood)
if MODE == 'bead':
    blob('BEAD', [((0, 0, 0.1), 0.42, (1.0, 0.95, 0.8)), ((0.16, 0.05, 0.04), 0.3, (1.0, 0.85, 0.6))], blood)
    a = math.radians(B.get('cut_angle', 12))
    blob('SEEP', [(((x * 0.5 - 4) * math.cos(a), (x * 0.5 - 4) * math.sin(a), 0.0), 0.12, (1.6, 0.6, 0.35)) for x in range(17)], blood)
elif MODE == 'saliva':
    glass = mat('saliva', lin(214, 226, 240), 0.03, **{'Transmission Weight': 0.8, 'IOR': 1.34, 'Subsurface Weight': 0.15, 'Subsurface Radius': (.8, .9, 1), 'Coat Weight': 0.8, 'Coat Roughness': 0.02})
    add_bump(glass, [('noise', 6, 0.25), ('cells', 18, 0.15)], mul=0.6)
    a = math.radians(B.get('cut_angle', 12))
    import random as _rb; rb = _rb.Random(3)
    for i in range(14):  # tiny trapped air bubbles
        u = rb.uniform(-3.5, 3.5); bpy.ops.mesh.primitive_uv_sphere_add(radius=rb.uniform(0.02, 0.05), location=(u * math.cos(a), u * math.sin(a) + rb.uniform(-0.08, 0.08), 0.12))
        bo = bpy.context.object; bo.name = f'BUB{i}'; bo.data.materials.append(mat('bub', lin(255, 255, 255), 0.02, **{'Transmission Weight': 1.0, 'IOR': 1.0})); bo.parent = None
    blob('SPIT', [(((x * 0.25 - 4) * math.cos(a), (x * 0.25 - 4) * math.sin(a), 0.07), 0.3, (1.6, 0.8, 0.38)) for x in range(33)], glass)
if MODE == 'pad':
    CUTY = -0.95   # cut face of the skin (cross-section) just in front of the pool
    for o in (g, g2):  # trim the skin in front of the cut
        o.select_set(True)
    for v in g.data.vertices:
        if v.co.y < CUTY: v.co.y = CUTY
    g2.location.y = 30 + 5; g2.scale = (3, 1, 1)
    derm = mat('dermis', lin(*B.get('derm_hi', [236, 116, 110])), 0.62, **{'Subsurface Weight': 0.25, 'Subsurface Radius': (1, .35, .3)})
    n, l = nodes(derm); bb = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); t = n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value = 3.5; t.inputs['Detail'].default_value = 6
    l.new(tc.outputs['Object'], t.inputs['Vector']); rr_ = n.new('ShaderNodeValToRGB'); rr_.color_ramp.elements[0].position = 0.35; rr_.color_ramp.elements[0].color = lin(*B.get('derm_lo', [214, 92, 92]))
    rr_.color_ramp.elements[1].position = 0.7; rr_.color_ramp.elements[1].color = lin(*B.get('derm_hi', [246, 150, 140])); l.new(t.outputs['Fac'], rr_.inputs['Fac']); l.new(rr_.outputs['Color'], bb.inputs['Base Color'])
    add_bump(derm, [('cells', 9, 0.6), ('cells', 22, 0.4)], mul=1.5)
    bpy.ops.mesh.primitive_cube_add(size=1); tb = bpy.context.object; tb.scale = (12, 6, 5); tb.location = (0, CUTY + 3, -2.53); tb.data.materials.append(derm)
    rim = mat('rim', lin(214, 24, 24), 0.35, **{'Emission Color': lin(214, 24, 24), 'Emission Strength': 0.5})
    bpy.ops.mesh.primitive_cube_add(size=1); rb = bpy.context.object; rb.scale = (12, 0.05, 0.06); rb.location = (0, CUTY, -0.01); rb.data.materials.append(rim)
    # pool of blood on the surface + a column of blood climbing up out of the tissue on the cut face
    blob('POOL', [((0.0, -0.1, 0.12), 1.1, (1.25, 1.0, 0.6)), ((0.85, 0.1, 0.1), 0.7, (1.0, 1.0, 0.7)), ((-0.85, 0.1, 0.1), 0.7, (1.0, 1.0, 0.7)),
                  ((0.5, -0.65, 0.1), 0.6, (1.0, 0.85, 0.7)), ((-0.5, -0.65, 0.1), 0.6, (1.0, 0.85, 0.7)), ((0, 0, 0.5), 0.7, (1.0, 1.0, 0.6))], blood)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.22, depth=4.4); co_ = bpy.context.object; co_.location = (0, CUTY - 0.18, -2.05); co_.scale = (1, 0.8, 1)
    bpy.ops.object.modifier_add(type='SUBSURF'); co_.modifiers[-1].levels = 2; co_.modifiers[-1].render_levels = 3
    tx2 = bpy.data.textures.new('coln', 'CLOUDS'); tx2.noise_scale = 0.35; dm2 = co_.modifiers.new('d', 'DISPLACE'); dm2.texture = tx2; dm2.strength = 0.1
    co_.data.materials.append(blood); [setattr(p_, 'use_smooth', True) for p_ in co_.data.polygons]
    blob('COLTOP', [((0, CUTY - 0.2, -0.15), 0.42, (0.9, 0.7, 1.3)), ((0, CUTY - 0.1, 0.1), 0.4, (1.2, 0.9, 0.6))], blood)
    # spongy labellum: amber sheen cone from above, two soft porous lobes at the tip, red soaking up from the bottom
    soak = B.get('soak', 0.35)
    am = mat('stalk', lin(240, 172, 84), 0.22, **{'Metallic': 0.55, 'Anisotropic': 0.8, 'Coat Weight': 0.4, 'Coat Roughness': 0.05})
    bpy.ops.mesh.primitive_cone_add(vertices=96, radius1=0.5, radius2=0.85, depth=4.5); st = bpy.context.object; st.location = (0, 0, 2.6); st.data.materials.append(am)
    [setattr(p_, 'use_smooth', True) for p_ in st.data.polygons]
    n2, l2 = nodes(am); b2 = n2['Principled BSDF']; tc2 = n2.new('ShaderNodeTexCoord'); sx2 = n2.new('ShaderNodeSeparateXYZ'); l2.new(tc2.outputs['Generated'], sx2.inputs[0])
    SOAK2 = n2.new('ShaderNodeMath'); SOAK2.operation = 'SUBTRACT'; SOAK2.inputs[1].default_value = 0.0; l2.new(sx2.outputs['Z'], SOAK2.inputs[0])
    r2 = n2.new('ShaderNodeValToRGB'); e2 = r2.color_ramp.elements; e2[0].position = 0.0; e2[0].color = lin(150, 16, 22); e2[1].position = 0.04; e2[1].color = lin(240, 172, 104)
    l2.new(SOAK2.outputs[0], r2.inputs['Fac']); l2.new(r2.outputs['Color'], b2.inputs['Base Color'])
    pm = mat('pad', lin(236, 158, 74), 0.4, **{'Subsurface Weight': 0.5, 'Subsurface Radius': (1, .6, .3), 'Coat Weight': 0.4, 'Coat Roughness': 0.1})
    n, l = nodes(pm); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); sxz = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Generated'], sxz.inputs[0])
    rp = n.new('ShaderNodeValToRGB'); e = rp.color_ramp.elements; e[0].position = 0.0; e[0].color = lin(130, 14, 20); e[1].position = 1.0; e[1].color = lin(240, 172, 84)
    e.new(max(0.01, soak - 0.08)).color = lin(150, 20, 22); e.new(soak + 0.1).color = lin(240, 172, 84)
    SOAK = n.new('ShaderNodeMath'); SOAK.operation = 'ADD'; SOAK.inputs[1].default_value = 0.0; l.new(sxz.outputs['Z'], SOAK.inputs[0]); l.new(SOAK.outputs[0], rp.inputs['Fac'])
    vo = n.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 70; l.new(tc.outputs['Object'], vo.inputs['Vector'])
    pb = n.new('ShaderNodeBump'); pb.inputs['Strength'].default_value = 0.45; pb.inputs['Distance'].default_value = 0.02; l.new(vo.outputs['Distance'], pb.inputs['Height']); l.new(pb.outputs['Normal'], b.inputs['Normal'])
    l.new(rp.outputs['Color'], b.inputs['Base Color'])
    blob('PAD', [((-0.32, 0, 0.38), 0.55, (0.95, 0.85, 0.7)), ((0.32, 0, 0.38), 0.55, (0.95, 0.85, 0.7))], pm, res=0.03)
    area(sc, 'top', (0, 5, 8), (0, 3, 0), 330, 10, (1, .9, .84)); area(sc, 'fillp', (0, -6, 2), (0, 0, -1), 160, 8, (1, .92, .9))
    for xx, pw in ((-3, 1), (3, 0.7)):
        sl = area(sc, f'strip{xx}', (xx, -4, 2.5), (0, 0, 2.0), 300 * pw, 1, (1, .95, .85)); sl.data.shape = 'RECTANGLE'; sl.data.size = 0.4; sl.data.size_y = 6
# lights: soft key from front-left above, rim from behind for the wet speculars
area(sc, 'key', (-3, -5, 5), (0, 0, 0), B['key'], 6, (1, .97, .93)); area(sc, 'rim', (2, 6, 3), (0, 0, 0), B['key'] * 0.8, 4, (1, 1, 1))
area(sc, 'spec', (1.5, -4, 3), (0, 0, 0), B['key'] * 0.5, 0.8, (1, 1, 1))
w = bpy.data.worlds.new('amb'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = lin(240, 200, 185); w.node_tree.nodes['Background'].inputs[1].default_value = B['amb']
if MODE == 'pad': sky(sc, V(B['cam']), V(B['tgt']) + V((0, 0, 3)), light_frac=0.3)
# animation: cam/tgt/lens, grow (bead/spit/pool size), padz (pad + stalk height), soak (blood climbing the pad), lip (cut glow)
import anim
A = anim.load()
GROW = [o for o in sc.objects if o.name in ('BEAD', 'SPIT', 'POOL')]
PADS = [o for o in sc.objects if o.name == 'PAD' or (o.type == 'MESH' and o.data.materials and o.data.materials[0] and o.data.materials[0].name == 'stalk')]
base_z = {o.name: o.location.z for o in PADS}
skn = sk.node_tree.nodes['Principled BSDF']; skn.inputs['Emission Color'].default_value = lin(255, 40, 30)
def apply(p, f=None):
    cl, tg = V(p.get('cam', B['cam'])), V(p.get('tgt', B['tgt']))
    camera(sc, cl, tg, lens=p.get('lens', B['lens']), fstop=p.get('fstop', B['fstop']), focus=(tg - cl).length)
    g = max(p.get('grow', 1.0), 0.001)
    for o in GROW: o.scale = (g, g, g) if o.name != 'SPIT' else (1, 1, g)
    for o in PADS: o.location.z = base_z[o.name] + p.get('padz', 0.0)
    if MODE == 'pad': SOAK.inputs[1].default_value = 0.35 - p.get('soak', 0.35); SOAK2.inputs[1].default_value = p.get('soak', 0.0) * 0.55
    skn.inputs['Emission Strength'].default_value = 0.0   # (lip glow lives in the cut ramp; keep surface unlit)
    if f is not None:
        cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        for o in GROW + PADS: o.keyframe_insert('scale', frame=f); o.keyframe_insert('location', frame=f)
        if MODE == 'pad': SOAK.inputs[1].keyframe_insert('default_value', frame=f); SOAK2.inputs[1].keyframe_insert('default_value', frame=f)
if A:
    out = A['out']; os.makedirs(out, exist_ok=True)
    for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.5
    sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
    for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
        sc.frame_set(f); sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
else:
    apply({}); render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
