# Independence Day at the Red Fort - stylized game-engine look (Blender, fully procedural, no downloaded assets).
#   blender -b --python redfort.py -- --from 0 --to 150 --outdir out/ [--res 720] [--spp 32] [--engine EEVEE|CYCLES]
# Vertical 720x1280, 30 fps. One continuous drone move from above the crowd to the speaker on the Lahori Gate rampart.
import bpy, bmesh, math, random, sys, os, time
import numpy as np
from mathutils import Vector, Matrix, noise

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return argv[argv.index(k) + 1] if k in argv else d
F0, F1 = int(arg('--from', '0')), int(arg('--to', '1')); OUTDIR = arg('--outdir', '/tmp/rf'); os.makedirs(OUTDIR, exist_ok=True)
RESW = int(arg('--res', '720')); SPP = int(arg('--spp', '32')); ENGINE = arg('--engine', 'EEVEE'); FPS = 30; NF = 150
R = random.Random(15)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def link(o, c=None): (c or sc.collection).objects.link(o); return o

# ---------------------------------------------------------------- materials
def mat(name, build):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); out = nt.nodes.new('ShaderNodeOutputMaterial'); build(nt, out); return m
def N(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n
def L(nt, a, b): nt.links.new(a, b)
def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple([x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [a])
def ramp(nt, stops, fac):
    r = N(nt, 'ShaderNodeValToRGB'); el = r.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], stops[0][1]; el[1].position, el[1].color = stops[-1][0], stops[-1][1]
    for p, c in stops[1:-1]: e = el.new(p); e.color = c
    L(nt, fac, r.inputs['Fac']); return r
def pbsdf(nt, out, col=None, sock=None, rough=0.6, metal=0.0, spec=0.4, alpha=1.0):
    p = N(nt, 'ShaderNodeBsdfPrincipled'); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal; p.inputs['Specular IOR Level'].default_value = spec
    p.inputs['Alpha'].default_value = alpha
    if sock is not None: L(nt, sock, p.inputs['Base Color'])
    elif col: p.inputs['Base Color'].default_value = col
    L(nt, p.outputs[0], out.inputs['Surface']); return p
def objvec(nt, scale=(1, 1, 1)):
    tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = scale; L(nt, tc.outputs['Object'], mp.inputs['Vector']); return mp.outputs[0]
def bump(nt, p, h, s=0.5, d=0.02):
    b = N(nt, 'ShaderNodeBump', Strength=s, Distance=d); L(nt, h, b.inputs['Height']); L(nt, b.outputs['Normal'], p.inputs['Normal'])

def m_sandstone(nt, out):   # Red Fort sandstone: ashlar blocks with thin mortar, weathering streaks, colour drift
    tc = N(nt, 'ShaderNodeTexCoord'); br = N(nt, 'ShaderNodeTexBrick', offset=0.5, squash=1.0)
    br.inputs['Scale'].default_value = 1.0; br.inputs['Mortar Size'].default_value = 0.0035; br.inputs['Brick Width'].default_value = 0.95; br.inputs['Row Height'].default_value = 0.34
    br.inputs['Color1'].default_value = hexc('#a03c2b'); br.inputs['Color2'].default_value = hexc('#963726'); br.inputs['Mortar'].default_value = hexc('#7e2e20')
    mp = N(nt, 'ShaderNodeMapping'); L(nt, tc.outputs['Object'], mp.inputs['Vector'])
    xz = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, mp.outputs[0], xz.inputs[0]); cmb = N(nt, 'ShaderNodeCombineXYZ'); add = N(nt, 'ShaderNodeMath', operation='ADD')
    L(nt, xz.outputs['X'], add.inputs[0]); L(nt, xz.outputs['Y'], add.inputs[1]); L(nt, add.outputs[0], cmb.inputs['X']); L(nt, xz.outputs['Z'], cmb.inputs['Y']); L(nt, cmb.outputs[0], br.inputs['Vector'])
    n = N(nt, 'ShaderNodeTexNoise', Scale=0.35, Detail=6.0); L(nt, tc.outputs['Object'], n.inputs['Vector'])
    st = N(nt, 'ShaderNodeTexNoise', Scale=1.2, Detail=4.0); L(nt, objvec(nt, (0.6, 0.6, 0.05)), st.inputs['Vector'])
    dk = ramp(nt, [(0.35, (0.62, 0.55, 0.52, 1)), (0.65, (1, 1, 1, 1))], st.outputs['Fac'])
    m1 = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); m1.inputs['Factor'].default_value = 1.0; L(nt, br.outputs['Color'], m1.inputs['A']); L(nt, dk.outputs['Color'], m1.inputs['B'])
    lt = ramp(nt, [(0.3, (0.88, 0.85, 0.85, 1)), (0.7, (1.12, 1.05, 1.0, 1))], n.outputs['Fac'])
    m2 = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); m2.inputs['Factor'].default_value = 1.0; L(nt, m1.outputs['Result'], m2.inputs['A']); L(nt, lt.outputs['Color'], m2.inputs['B'])
    p = pbsdf(nt, out, sock=m2.outputs['Result'], rough=0.85, spec=0.25)
    hm = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); hm.inputs[1].default_value = 0.6; L(nt, n.outputs['Fac'], hm.inputs[0]); L(nt, br.outputs['Fac'], hm.inputs[2]); bump(nt, p, hm.outputs[0], 0.25, 0.01)
M_SAND = mat('sandstone', m_sandstone)
def m_marble(nt, out):
    n = N(nt, 'ShaderNodeTexNoise', Scale=3.0, Detail=10.0, Distortion=1.5); L(nt, objvec(nt), n.inputs['Vector'])
    r = ramp(nt, [(0.4, hexc('#e9e4dc')), (0.6, hexc('#f7f4ef')), (0.8, hexc('#d8d1c6'))], n.outputs['Fac']); pbsdf(nt, out, sock=r.outputs['Color'], rough=0.3, spec=0.5)
M_MARBLE = mat('marble', m_marble)
M_GOLD = mat('gold', lambda nt, out: pbsdf(nt, out, hexc('#d9a62e'), rough=0.25, metal=1.0))
M_DARK = mat('archdark', lambda nt, out: pbsdf(nt, out, hexc('#2a1310'), rough=0.9))
M_INSET = mat('inset', lambda nt, out: pbsdf(nt, out, hexc('#7c2b1d'), rough=0.85))
def m_ground(nt, out):     # parade ground: dusty paved stone + lawn patches
    v = objvec(nt); n = N(nt, 'ShaderNodeTexNoise', Scale=0.05, Detail=6.0); L(nt, v, n.inputs['Vector'])
    br = N(nt, 'ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 0.8; br.inputs['Mortar Size'].default_value = 0.01; L(nt, v, br.inputs['Vector'])
    br.inputs['Color1'].default_value = hexc('#b9ab98'); br.inputs['Color2'].default_value = hexc('#a69683'); br.inputs['Mortar'].default_value = hexc('#7d7266')
    g = ramp(nt, [(0.45, (1, 1, 1, 1)), (0.6, (0.82, 0.8, 0.75, 1))], n.outputs['Fac'])
    m1 = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); m1.inputs['Factor'].default_value = 1.0; L(nt, br.outputs['Color'], m1.inputs['A']); L(nt, g.outputs['Color'], m1.inputs['B'])
    p = pbsdf(nt, out, sock=m1.outputs['Result'], rough=0.9, spec=0.2); bump(nt, p, br.outputs['Fac'], 0.3, 0.01)
M_GROUND = mat('ground', m_ground)
def m_lawn(nt, out):
    n = N(nt, 'ShaderNodeTexNoise', Scale=1.5, Detail=8.0); L(nt, objvec(nt), n.inputs['Vector'])
    r = ramp(nt, [(0.35, hexc('#3f6a24')), (0.6, hexc('#5c8a32')), (0.8, hexc('#7a9a46'))], n.outputs['Fac']); p = pbsdf(nt, out, sock=r.outputs['Color'], rough=0.95, spec=0.2); bump(nt, p, n.outputs['Fac'], 0.6, 0.01)
M_LAWN = mat('lawn', m_lawn)
def m_attr(name, rough=0.8):   # per-face colour attribute (crowd clothes / hair / skin in one draw)
    def b(nt, out):
        at = N(nt, 'ShaderNodeAttribute', attribute_name='col', attribute_type='GEOMETRY'); pbsdf(nt, out, sock=at.outputs['Color'], rough=rough, spec=0.3)
    return mat(name, b)
M_CROWD = m_attr('crowd')
def m_flag(nt, out):       # tricolour: saffron / white / India green bands, navy Ashoka Chakra with 24 spokes (UV space)
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['UV'], sep.inputs[0])
    band = ramp(nt, [(0.0, hexc('#138808')), (0.333, hexc('#138808')), (0.334, hexc('#ffffff')), (0.666, hexc('#ffffff')), (0.667, hexc('#ff9933')), (1.0, hexc('#ff9933'))], sep.outputs['Y'])
    for el in band.color_ramp.elements: pass
    band.color_ramp.interpolation = 'CONSTANT'
    # chakra: distance from centre (0.5,0.5) with aspect 3:2
    cx = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); cx.inputs[1].default_value = 0.5; L(nt, sep.outputs['X'], cx.inputs[0]); sx = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); sx.inputs[1].default_value = 1.5; L(nt, cx.outputs[0], sx.inputs[0])
    cy = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); cy.inputs[1].default_value = 0.5; L(nt, sep.outputs['Y'], cy.inputs[0])
    vec = N(nt, 'ShaderNodeCombineXYZ'); L(nt, sx.outputs[0], vec.inputs['X']); L(nt, cy.outputs[0], vec.inputs['Y']); ln = N(nt, 'ShaderNodeVectorMath', operation='LENGTH'); L(nt, vec.outputs[0], ln.inputs[0])
    ring = ramp(nt, [(0.0, (0, 0, 0, 1)), (0.135, (0, 0, 0, 1)), (0.14, (1, 1, 1, 1)), (0.16, (1, 1, 1, 1)), (0.165, (0, 0, 0, 1)), (1.0, (0, 0, 0, 1))], ln.outputs['Value']); ring.color_ramp.interpolation = 'CONSTANT'
    at = N(nt, 'ShaderNodeMath', operation='ARCTAN2'); L(nt, cy.outputs[0], at.inputs[0]); L(nt, sx.outputs[0], at.inputs[1])
    s24 = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); s24.inputs[1].default_value = 24.0; L(nt, at.outputs[0], s24.inputs[0]); cs = N(nt, 'ShaderNodeMath', operation='COSINE'); L(nt, s24.outputs[0], cs.inputs[0])
    spk = N(nt, 'ShaderNodeMath', operation='GREATER_THAN'); spk.inputs[1].default_value = 0.82; L(nt, cs.outputs[0], spk.inputs[0])
    inr = N(nt, 'ShaderNodeMath', operation='LESS_THAN'); inr.inputs[1].default_value = 0.145; L(nt, ln.outputs['Value'], inr.inputs[0])
    hub = N(nt, 'ShaderNodeMath', operation='LESS_THAN'); hub.inputs[1].default_value = 0.025; L(nt, ln.outputs['Value'], hub.inputs[0])
    sp2 = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); L(nt, spk.outputs[0], sp2.inputs[0]); L(nt, inr.outputs[0], sp2.inputs[1])
    a1 = N(nt, 'ShaderNodeMath', operation='MAXIMUM'); L(nt, sp2.outputs[0], a1.inputs[0]); L(nt, hub.outputs[0], a1.inputs[1])
    a2 = N(nt, 'ShaderNodeMath', operation='MAXIMUM'); L(nt, a1.outputs[0], a2.inputs[0]); L(nt, ring.outputs['Color'], a2.inputs[1])
    mx = N(nt, 'ShaderNodeMix', data_type='RGBA'); L(nt, a2.outputs[0], mx.inputs['Factor']); L(nt, band.outputs['Color'], mx.inputs['A']); mx.inputs['B'].default_value = hexc('#000080')
    p = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.8); p.inputs['Subsurface Weight'].default_value = 0.0; L(nt, mx.outputs['Result'], p.inputs['Base Color'])
    tr = N(nt, 'ShaderNodeBsdfTranslucent'); L(nt, mx.outputs['Result'], tr.inputs['Color']); ms = N(nt, 'ShaderNodeMixShader'); ms.inputs['Fac'].default_value = 0.25
    L(nt, p.outputs[0], ms.inputs[1]); L(nt, tr.outputs[0], ms.inputs[2]); L(nt, ms.outputs[0], out.inputs['Surface'])
M_FLAG = mat('tricolour', m_flag)
M_GLASS = mat('glass', lambda nt, out: pbsdf(nt, out, hexc('#e8f0f2'), rough=0.0, spec=0.5, alpha=0.035)); M_GLASS.surface_render_method = 'BLENDED'
M_POLE = mat('pole', lambda nt, out: pbsdf(nt, out, hexc('#f0eee8'), rough=0.3, metal=0.3))
M_WOOD = mat('lectern', lambda nt, out: pbsdf(nt, out, hexc('#4a2a18'), rough=0.35, spec=0.5))
M_MIC = mat('mic', lambda nt, out: pbsdf(nt, out, hexc('#1a1a1c'), rough=0.4, metal=0.6))
M_MARIGOLD = mat('marigold', lambda nt, out: pbsdf(nt, out, hexc('#ff8c1a'), rough=0.85))
M_MARIGOLD2 = mat('marigold2', lambda nt, out: pbsdf(nt, out, hexc('#ffc21a'), rough=0.85))
M_TREE = mat('tree', lambda nt, out: pbsdf(nt, out, hexc('#3b5a26'), rough=0.9))
M_CITY = mat('city', lambda nt, out: pbsdf(nt, out, hexc('#c9bfb2'), rough=0.9))

# ---------------------------------------------------------------- geometry helpers
def box(name, size, loc, m=None, c=None, bevel=0.0, rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect='EDGES')
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    return link(o, c)
def cyl(name, r, h, loc, m=None, verts=16, rot=(0, 0, 0), r2=None, c=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return link(o, c)
def sphere(name, r, loc, m=None, scale=(1, 1, 1), seg=24, c=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.scale = scale
    if m: me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return link(o, c)
def dome(name, r, loc, m, h=1.2, c=None):
    """Mughal bulbous dome: profile revolved (onion swell, pointed tip)"""
    prof = []
    for i in range(17):
        t = i / 16; ang = t * math.pi * 0.5; x = r * (math.sin(math.pi * t * 0.95 + 0.25) * 1.08) * (1 - t ** 3); z = h * r * t
        prof.append((max(0.001, x), z))
    me = bpy.data.meshes.new(name); bm = bmesh.new(); seg = 24; rings = []
    for (x, z) in prof: rings.append([bm.verts.new((x * math.cos(a), x * math.sin(a), z)) for a in [k / seg * math.tau for k in range(seg)]])
    for a_, b_ in zip(rings, rings[1:]):
        for k in range(seg): bm.faces.new([a_[k], a_[(k + 1) % seg], b_[(k + 1) % seg], b_[k]])
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return link(o, c)
def chhatri(loc, s=1.0):
    """domed kiosk: 8 slim pillars, chajja (eave), bulbous marble dome, gold finial"""
    x, y, z = loc
    box('cplinth', (2.4 * s, 2.4 * s, 0.25 * s), (x, y, z + 0.12 * s), M_MARBLE)
    for k in range(8):
        a = k / 8 * math.tau + math.pi / 8; cyl('cpillar', 0.08 * s, 1.6 * s, (x + math.cos(a) * 1.0 * s, y + math.sin(a) * 1.0 * s, z + 1.05 * s), M_MARBLE, 8)
    cyl('cchajja', 1.45 * s, 0.12 * s, (x, y, z + 1.9 * s), M_MARBLE, 8, r2=1.2 * s); cyl('cdrum', 0.95 * s, 0.3 * s, (x, y, z + 2.1 * s), M_MARBLE, 16)
    dome('cdome', 0.95 * s, (x, y, z + 2.25 * s), M_MARBLE, 1.25)
    cyl('cfin', 0.05 * s, 0.6 * s, (x, y, z + 3.6 * s), M_GOLD, 8); sphere('cfinb', 0.09 * s, (x, y, z + 3.45 * s), M_GOLD, seg=12)
def arch_mesh(name, w, h, depth, loc, m, rot=(math.pi / 2, 0, 0)):
    """pointed (four-centred) Mughal arch outline, extruded"""
    pts = [(-w / 2, 0), (-w / 2, h * 0.62)]
    for i in range(1, 9): t = i / 9; pts.append((-w / 2 * (1 - t) ** 0.8 * math.cos(t * 0.6), h * 0.62 + (h * 0.38) * math.sin(t * math.pi / 2)))
    pts.append((0, h)); pts += [(-x, z) for (x, z) in reversed(pts[:-1])]
    me = bpy.data.meshes.new(name); bm = bmesh.new(); f = bm.faces.new([bm.verts.new((x, z, 0)) for (x, z) in pts])
    ex = bmesh.ops.extrude_face_region(bm, geom=[f]); bmesh.ops.translate(bm, vec=(0, 0, depth), verts=[v for v in ex['geom'] if isinstance(v, bmesh.types.BMVert)])
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot; me.materials.append(m); return link(o)
def niche_grid(x0, x1, z0, z1, yface, cols, rows, w, h):
    for i in range(cols):
        for j in range(rows):
            x = x0 + (x1 - x0) * (i + 0.5) / cols; z = z0 + (z1 - z0) * j / rows
            arch_mesh('nicheb', w * 1.18, h * 1.1, 0.06, (x, yface - 0.01, z - h * 0.05), M_MARBLE); arch_mesh('niche', w, h, 0.08, (x, yface - 0.03, z), M_INSET)

# ---------------------------------------------------------------- Red Fort: Lahori Gate + walls
GY = -4.0       # gate front face (y); the crowd is toward -Y
box('wallL', (110, 12, 20), (-71, 6, 10), M_SAND); box('wallR', (110, 12, 20), (71, 6, 10), M_SAND)
for side in (-1, 1):   # crenellated parapet + bastion towers along the walls
    for k in range(52):
        x = side * (18 + k * 2.1); box('merlon', (1.2, 1.2, 1.6), (x, 0.4, 20.8), M_SAND)
    for k in (1, 2):
        cyl('bastion', 7.5, 24, (side * (18 + k * 38), 2.0, 12), M_SAND, 12); chhatri((side * (18 + k * 38), 2.0, 24.0), 1.6)
box('gate', (36, 14, 30), (0, GY + 7, 15), M_SAND)
box('gateband', (36.2, 0.3, 0.5), (0, GY - 0.05, 29.4), M_MARBLE); box('gateband2', (36.2, 0.3, 0.35), (0, GY - 0.05, 22.2), M_MARBLE)
arch_mesh('gatearch_b', 12.0, 17.5, 0.2, (0, GY - 0.05, 0), M_MARBLE); arch_mesh('gatearch', 10.4, 16.2, 0.5, (0, GY - 0.25, 0), M_DARK)
niche_grid(-17, -7, 2, 20, GY, 2, 3, 2.4, 4.4); niche_grid(7, 17, 2, 20, GY, 2, 3, 2.4, 4.4)
for side in (-1, 1):     # octagonal flanking towers with chhatris
    cyl('tower', 5.0, 34, (side * 18.5, GY + 1.0, 17), M_SAND, 8); cyl('towerband', 5.15, 0.4, (side * 18.5, GY + 1.0, 30.0), M_MARBLE, 8)
    chhatri((side * 18.5, GY + 1.0, 34.0), 2.1)
for k in range(-3, 4):   # row of small chhatris over the gate (the "chhatri gallery")
    chhatri((k * 4.2, GY + 2.0, 30.0), 0.95 if k else 1.25)
for k in range(-8, 9): box('gmerlon', (1.0, 1.0, 1.3), (k * 2.0, GY + 0.3, 30.65), M_SAND)

# ---------------------------------------------------------------- the rampart balcony: platform, balustrade, garlands, glass box, lectern
PZ = 19.2; PY0, PY1 = GY, GY - 5.5   # rampart above the gate arch (arch top 17.5 m)
box('balcony', (12, 5.5, 0.6), (0, (PY0 + PY1) / 2, PZ - 0.3), M_MARBLE)
for k in range(-5, 6): cyl('baluster', 0.09, 0.95, (k * 1.1, PY1 + 0.2, PZ + 0.48), M_MARBLE, 10)
box('rail', (12, 0.3, 0.14), (0, PY1 + 0.2, PZ + 1.0), M_MARBLE)
M_SAFF = mat('saff', lambda nt, out: pbsdf(nt, out, hexc('#ff9933'), rough=0.8)); M_WHT = mat('wht', lambda nt, out: pbsdf(nt, out, hexc('#f7f5f0'), rough=0.8)); M_GRN = mat('grn', lambda nt, out: pbsdf(nt, out, hexc('#138808'), rough=0.8))
for k, mm in enumerate((M_SAFF, M_WHT, M_GRN)):   # tricolour drape on the balcony front
    box('drape', (12.2, 0.05, 0.42), (0, PY1 - 0.02, PZ - 0.82 - k * 0.42), mm)
def garland(a, b, n=60, sag=0.55):
    a, b = Vector(a), Vector(b)
    for i in range(n + 1):
        t = i / n; p = a.lerp(b, t); p.z -= sag * 4 * t * (1 - t); sphere('mg', 0.06, p, M_MARIGOLD if i % 3 else M_MARIGOLD2, seg=8)
for k in range(-3, 3): garland((k * 2.0, PY1 - 0.06, PZ + 0.95), ((k + 1) * 2.0, PY1 - 0.06, PZ + 0.95), 22, 0.35)
GB = (0.0, PY1 + 1.6)    # glass enclosure centre
for (sx, sy, cx, cy) in ((3.2, 0.03, 0, -1.0), (0.03, 2.0, -1.6, 0), (0.03, 2.0, 1.6, 0)):
    box('glass', (sx, sy, 2.45), (GB[0] + cx, GB[1] + cy, PZ + 1.22), M_GLASS)
box('glassframe', (3.25, 2.05, 0.08), (GB[0], GB[1], PZ + 2.46), M_POLE)
box('lectern', (0.9, 0.55, 1.15), (0, GB[1] - 0.55, PZ + 0.57), M_WOOD, bevel=0.03)
box('lectop', (1.0, 0.65, 0.05), (0, GB[1] - 0.55, PZ + 1.17), M_WOOD, rot=(math.radians(-12), 0, 0))
cyl('emblem', 0.16, 0.02, (0, GB[1] - 0.84, PZ + 0.72), M_GOLD, 24, rot=(math.pi / 2, 0, 0))
for k in (-0.18, -0.06, 0.06, 0.18):
    x = k * 1.7 + (0.08 if k > 0 else -0.08); cyl('micstem', 0.007, 0.3, (x, GB[1] - 0.7, PZ + 1.3), M_MIC, 6, rot=(math.radians(-35), 0, math.radians(-x * 60))); sphere('mic', 0.022, (x * 0.85, GB[1] - 0.6, PZ + 1.43), M_MIC, seg=10)

# flagpole + tricolour on the gate top (waves with a Wave modifier weighted away from the pole)
FP = Vector((0, GY + 4.0, 31.0)); cyl('flagpole', 0.09, 16, (FP.x, FP.y, FP.z + 8), M_POLE, 12)
sphere('poletop', 0.18, (FP.x, FP.y, FP.z + 16.1), M_GOLD, seg=12)
def make_flag(w=5.4, h=3.6):
    me = bpy.data.meshes.new('flag'); bm = bmesh.new(); nx, ny = 54, 36; vs = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1): row.append(bm.verts.new((i / nx * w, 0, j / ny * h)))
        vs.append(row)
    uv = bm.loops.layers.uv.new()
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new([vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]])
            for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))): l[uv].uv = (a / nx, b / ny)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('flag', me); me.materials.append(M_FLAG)
    for p in me.polygons: p.use_smooth = True
    vg = o.vertex_groups.new(name='free'); link(o)
    for v in me.vertices: vg.add([v.index], min(1.0, (v.co.x / w) ** 1.3 * 1.15), 'REPLACE')
    return o
flag = make_flag(); flag.location = (FP.x + 0.1, FP.y, FP.z + 12.2); flag.rotation_euler = (0, 0, math.radians(-25))
for (ax, h_, w_, sp, nar, off) in (('X', 0.35, 1.6, 0.18, 1.2, 0), ('Y', 0.18, 0.9, 0.27, 0.8, 3)):
    wv = flag.modifiers.new('wave' + ax, 'WAVE'); wv.use_normal = True; wv.use_x = ax == 'X'; wv.use_y = ax == 'Y'; wv.height = h_; wv.width = w_; wv.speed = sp; wv.narrowness = nar
    wv.vertex_group = 'free'; wv.time_offset = off; wv.start_position_x = -0.5; wv.use_cyclic = True
flag.modifiers.new('sub', 'SUBSURF').levels = 1

# ---------------------------------------------------------------- ground, lawns, trees, distant city
box('ground', (700, 700, 1), (0, -250, -0.5), M_GROUND)
for side in (-1, 1): box('lawn', (90, 150, 0.06), (side * 120, -110, 0.03), M_LAWN)
tr = random.Random(3)
for k in range(140):   # neem trees around the lawns
    x = tr.choice((-1, 1)) * tr.uniform(95, 260); y = tr.uniform(-260, -15); s = tr.uniform(3.5, 6.5)
    cyl('trunk', 0.25 * s / 4, s * 0.6, (x, y, s * 0.3), M_WOOD, 6)
    for j in range(3): sphere('crown', s * tr.uniform(0.45, 0.6), (x + tr.uniform(-1, 1), y + tr.uniform(-1, 1), s * tr.uniform(0.8, 1.05)), M_TREE, (1, 1, 0.75), seg=10)
for k in range(90):   # hazy Old Delhi skyline far behind the camera and to the sides
    a = tr.uniform(-1.3, 1.3); d = tr.uniform(420, 700); x = math.sin(a) * d; y = -math.cos(a) * d - 60; h = tr.uniform(8, 30)
    box('bldg', (tr.uniform(12, 30), tr.uniform(12, 30), h), (x, y, h / 2), M_CITY)

# ---------------------------------------------------------------- the crowd (one static mesh per block: no per-frame re-evaluation)
SKIN = ['#8d5a3c', '#a06a48', '#b07a55', '#7a4b31', '#c08a64']; HAIR = ['#1a1412', '#24190f', '#3a2d24', '#d9d4cc']
TOPS = ['#ffffff', '#f2efe6', '#ff9933', '#138808', '#2a5db0', '#c9302c', '#f1c40f', '#8e44ad', '#ff6fa3', '#16a085', '#e6e1d6', '#5d6d7e', '#ffffff', '#f5b041']
PANTS = ['#2c3e50', '#1f2a36', '#e9e4d8', '#4a3b2a', '#20242c', '#6b5a45']
def person_template():
    """low-poly person (~1.65 m): legs, torso, arms, neck, head, hair; part ids drive the colour"""
    parts = []
    def addcyl(r, h, cx, cy, cz, seg, pid, r2=None):
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
        v = np.array([x.co[:] for x in bm.verts]); f = [[x.index for x in fc.verts] for fc in bm.faces]; bm.free(); v += (cx, cy, cz); parts.append((v, f, pid))
    def addsph(r, cx, cy, cz, sx, sy, sz, pid):
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)
        v = np.array([x.co[:] for x in bm.verts]) * (sx, sy, sz); f = [[x.index for x in fc.verts] for fc in bm.faces]; bm.free(); v += (cx, cy, cz); parts.append((v, f, pid))
    addcyl(0.075, 0.82, -0.09, 0, 0.41, 6, 1); addcyl(0.075, 0.82, 0.09, 0, 0.41, 6, 1)        # legs (pants)
    addcyl(0.2, 0.62, 0, 0, 1.12, 8, 0, 0.17)                                                   # torso (top)
    addcyl(0.05, 0.6, -0.25, 0, 1.1, 6, 0); addcyl(0.05, 0.6, 0.25, 0, 1.1, 6, 0)               # arms (sleeves)
    addcyl(0.05, 0.1, 0, 0, 1.47, 6, 2)                                                         # neck
    addsph(0.11, 0, 0, 1.6, 1.0, 0.95, 1.12, 2); addsph(0.115, 0, 0.015, 1.66, 1.0, 1.0, 0.75, 3) # head, hair cap
    return parts
TPL = person_template()
def crowd_block(name, n, pick_xy, top_fn, seed, arm_up=0.08):
    rs = random.Random(seed); V = []; Fs = []; C = []; off = 0
    for i in range(n):
        x, y = pick_xy(rs); s = rs.uniform(0.9, 1.08); a = rs.uniform(-0.5, 0.5) + math.pi   # facing the fort (+Y)
        ca, sa = math.cos(a), math.sin(a); cols = [hexc(top_fn(rs, x, y)), hexc(rs.choice(PANTS)), hexc(rs.choice(SKIN)), hexc(rs.choice(HAIR) if rs.random() > 0.08 else '#ffffff')]
        for (v, f, pid) in TPL:
            w = v * s; xr = w[:, 0] * ca - w[:, 1] * sa; yr = w[:, 0] * sa + w[:, 1] * ca
            V.append(np.stack([xr + x, yr + y, w[:, 2]], 1)); Fs += [[k + off for k in fc] for fc in f]; C += [cols[pid]] * len(f); off += len(v)
    V = np.concatenate(V); me = bpy.data.meshes.new(name); me.vertices.add(len(V)); me.vertices.foreach_set('co', V.ravel().astype(np.float32))
    loops = [k for fc in Fs for k in fc]; me.loops.add(len(loops)); me.loops.foreach_set('vertex_index', loops)
    me.polygons.add(len(Fs)); me.polygons.foreach_set('loop_start', np.cumsum([0] + [len(fc) for fc in Fs[:-1]])); me.polygons.foreach_set('loop_total', [len(fc) for fc in Fs])
    me.update(calc_edges=True); at = me.attributes.new('col', 'FLOAT_COLOR', 'FACE'); at.data.foreach_set('color', np.array(C, dtype=np.float32).ravel())
    me.materials.append(M_CROWD); return link(bpy.data.objects.new(name, me))
def tricolour_top(rs, x, y):   # children seated in a giant living tricolour (with a navy chakra in the white band)
    u = (y + 40) / -36.0
    if u < 0.333: return '#ff9933'
    if u < 0.666: return '#000080' if math.hypot(x / 1.0, (y + 58) * 1.0) < 4.2 and abs(math.hypot(x, y + 58) - 3.6) < 0.7 or math.hypot(x, y + 58) < 0.9 else '#ffffff'
    return '#138808'
crowd_block('kids', 2600, lambda rs: (rs.uniform(-26, 26), rs.uniform(-40, -76)), tricolour_top, 7)
crowd_block('crowdL', 8000, lambda rs: (rs.uniform(-95, -30), rs.uniform(-22, -170)), lambda rs, x, y: rs.choice(TOPS), 8)
crowd_block('crowdR', 8000, lambda rs: (rs.uniform(30, 95), rs.uniform(-22, -170)), lambda rs, x, y: rs.choice(TOPS), 9)
crowd_block('crowdB', 5500, lambda rs: (rs.uniform(-28, 28), rs.uniform(-82, -170)), lambda rs, x, y: rs.choice(TOPS), 10)
crowd_block('vips', 700, lambda rs: (rs.uniform(-28, 28), rs.uniform(-14, -32)), lambda rs, x, y: rs.choice(['#ffffff', '#f2efe6', '#e6e1d6', '#2c3e50']), 11)

# ---------------------------------------------------------------- the speaker (stylized; recognisable by costume: white kurta, sleeveless bandi jacket, bandhani safa, white beard, glasses)
SP = Vector((0, GB[1] + 0.05, PZ))
M_KURTA = mat('kurta', lambda nt, out: pbsdf(nt, out, hexc('#f4f1ea'), rough=0.75, spec=0.3))
M_BANDI = mat('bandi', lambda nt, out: pbsdf(nt, out, hexc('#c9b48a'), rough=0.6, spec=0.35))
M_SKIN = mat('skin', lambda nt, out: pbsdf(nt, out, hexc('#a8714f'), rough=0.5, spec=0.35))
def m_beard(nt, out):
    n = N(nt, 'ShaderNodeTexNoise', Scale=180.0, Detail=4.0); L(nt, objvec(nt, (1, 1, 4)), n.inputs['Vector'])
    r = ramp(nt, [(0.35, hexc('#bdb8b0')), (0.65, hexc('#f4f2ee'))], n.outputs['Fac']); p = pbsdf(nt, out, sock=r.outputs['Color'], rough=0.7, spec=0.3); bump(nt, p, n.outputs['Fac'], 0.6, 0.002)
M_BEARD = mat('beard', m_beard)
def m_safa(nt, out):          # bandhani tie-dye turban: saffron/red field with white dot clusters, gold edge stripes
    v = objvec(nt, (60, 60, 60)); vo = N(nt, 'ShaderNodeTexVoronoi', Scale=1.0, Randomness=0.6); L(nt, v, vo.inputs['Vector'])
    dot = ramp(nt, [(0.0, (1, 1, 1, 1)), (0.12, (1, 1, 1, 1)), (0.16, (0, 0, 0, 1))], vo.outputs['Distance'])
    big = N(nt, 'ShaderNodeTexNoise', Scale=6.0, Detail=2.0); L(nt, objvec(nt), big.inputs['Vector'])
    fld = ramp(nt, [(0.4, hexc('#e8501a')), (0.55, hexc('#ff9a1f')), (0.7, hexc('#d4202a'))], big.outputs['Fac'])
    mx = N(nt, 'ShaderNodeMix', data_type='RGBA'); L(nt, dot.outputs['Color'], mx.inputs['Factor']); L(nt, fld.outputs['Color'], mx.inputs['A']); mx.inputs['B'].default_value = hexc('#fff3d0')
    pbsdf(nt, out, sock=mx.outputs['Result'], rough=0.8, spec=0.3)
M_SAFA = mat('safa', m_safa)
M_EYE = mat('eye', lambda nt, out: pbsdf(nt, out, hexc('#120c0a'), rough=0.2, spec=0.6))
M_LENS = mat('lens', lambda nt, out: pbsdf(nt, out, hexc('#f0f4f6'), rough=0.02, spec=1.0, alpha=0.18)); M_LENS.surface_render_method = 'BLENDED'
root = bpy.data.objects.new('speaker', None); link(root); root.location = SP   # local -Y = his face = toward the crowd
def part(o, parent):
    o.parent = parent; return o
torso = part(cyl('kurta', 0.2, 0.75, (0, 0, 1.12), M_KURTA, 20, r2=0.19), root); torso.scale = (1.0, 0.68, 1.0)
bandi = part(cyl('bandi', 0.205, 0.5, (0, 0, 1.22), M_BANDI, 20, r2=0.195), root); bandi.scale = (1.02, 0.72, 1.0)
part(cyl('vneck', 0.07, 0.02, (0, -0.135, 1.43), M_KURTA, 12, rot=(math.pi / 2, 0, 0)), root)
for k in range(3): part(sphere('btn', 0.011, (0.02, -0.15, 1.36 - k * 0.09), M_GOLD, seg=8), root)
neck = part(cyl('neck', 0.055, 0.1, (0, 0, 1.53), M_SKIN, 12), root)
head = bpy.data.objects.new('head', None); link(head); part(head, root); head.location = (0, 0, 1.6)
part(sphere('skull', 0.1, (0, 0, 0.09), M_SKIN, (0.93, 1.0, 1.15)), head)
part(sphere('hair', 0.104, (0, 0.012, 0.085), M_BEARD, (0.95, 1.0, 1.08)), head).scale = (0.96, 1.02, 1.0)
jaw = bpy.data.objects.new('jaw', None); link(jaw); part(jaw, head); jaw.location = (0, -0.02, 0.05)
part(sphere('beard', 0.085, (0, -0.045, -0.035), M_BEARD, (1.05, 0.85, 1.0)), jaw)
part(sphere('mous', 0.03, (0, -0.098, 0.02), M_BEARD, (1.6, 0.5, 0.45)), head)
part(cyl('nose', 0.016, 0.05, (0, -0.105, 0.08), M_SKIN, 8, rot=(math.radians(70), 0, 0), r2=0.008), head)
for s in (-1, 1):
    part(sphere('eye', 0.011, (s * 0.034, -0.09, 0.11), M_EYE, seg=10), head)
    part(box('brow', (0.035, 0.01, 0.008), (s * 0.034, -0.095, 0.132), M_BEARD), head)
    part(cyl('lens', 0.022, 0.003, (s * 0.034, -0.103, 0.108), M_LENS, 16, rot=(math.pi / 2, 0, 0)), head)
    rim = bpy.data.meshes.new('rim'); bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=False, segments=20, radius=0.023); bm.to_mesh(rim); bm.free()
    ro = bpy.data.objects.new('rim', rim); link(ro); rim.materials.append(M_GOLD); ro.location = (s * 0.034, -0.104, 0.108); ro.rotation_euler = (math.pi / 2, 0, 0); ro.parent = head
    sk = ro.modifiers.new('sk', 'SKIN'); ro.modifiers.new('sub', 'SUBSURF').levels = 1
    for v in ro.data.skin_vertices[''].data: v.radius = (0.0016, 0.0016)
    part(cyl('ear', 0.022, 0.015, (s * 0.094, 0.0, 0.09), M_SKIN, 10, rot=(0, math.pi / 2, 0)), head)
part(box('bridge', (0.02, 0.003, 0.003), (0, -0.104, 0.112), M_GOLD), head)
for k, (z, r, tilt) in enumerate(((0.16, 0.112, 6), (0.185, 0.115, -4), (0.21, 0.112, 8), (0.232, 0.104, -3))):   # safa wraps
    t = bpy.data.objects.new('wrap', None); link(t); part(t, head)
    me = bpy.data.meshes.new('wrapm'); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=28, radius1=r, radius2=r * 0.98, depth=0.035)
    bm.to_mesh(me); bm.free(); w_ = bpy.data.objects.new('wrapo', me); link(w_); me.materials.append(M_SAFA); w_.parent = t; w_.scale = (0.98, 1.05, 1.0)
    for p in me.polygons: p.use_smooth = True
    w_.modifiers.new('sol', 'SOLIDIFY').thickness = 0.012; t.location = (0, 0.008, z); t.rotation_euler = (math.radians(tilt), 0, math.radians(k * 23))
part(sphere('crown', 0.095, (0, 0.01, 0.25), M_SAFA, (1.0, 1.05, 0.45)), head)
tail = part(box('safatail', (0.11, 0.01, 0.5), (0.03, 0.105, -0.05), M_SAFA), head); tail.rotation_euler = (math.radians(8), 0, math.radians(4))
arms = {}
for s, nm in ((-1, 'L'), (1, 'R')):
    sh = bpy.data.objects.new('sh' + nm, None); link(sh); part(sh, root); sh.location = (s * 0.215, 0, 1.43)
    part(sphere('shoulder', 0.06, (0, 0, 0), M_KURTA, seg=12), sh)
    part(cyl('upper', 0.05, 0.3, (0, 0, -0.15), M_KURTA, 12), sh)
    el = bpy.data.objects.new('el' + nm, None); link(el); el.parent = sh; el.location = (0, 0, -0.3)
    part(cyl('fore', 0.045, 0.27, (0, 0, -0.135), M_KURTA, 12, r2=0.04), el)
    hand = bpy.data.objects.new('hand' + nm, None); link(hand); hand.parent = el; hand.location = (0, 0, -0.28)
    part(sphere('palm', 0.042, (0, 0, -0.03), M_SKIN, (0.8, 0.45, 1.0), seg=12), hand)
    idx = part(cyl('index', 0.009, 0.075, (0.0, 0, -0.1), M_SKIN, 8), hand)
    part(cyl('thumb', 0.01, 0.05, (s * -0.03, -0.01, -0.035), M_SKIN, 8, rot=(0, s * 0.6, 0)), hand)
    for k, dx in enumerate((-0.022, 0.0, 0.022)): part(cyl('fing', 0.009, 0.06, (dx, 0, -0.085), M_SKIN, 8), hand)
    arms[nm] = (sh, el, hand)

def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def lerp(a, b, t): return a + (b - a) * t
def pose(f):
    """speaking: head addresses left -> right, jaw on syllables, right hand: open-palm emphasis -> index finger raised -> sweep to the crowd; left hand on the lectern"""
    t = f / FPS
    head.rotation_euler = (math.radians(4 + 3 * math.sin(t * 2.1) + 6 * ease((f - 70) / 12) * (1 - ease((f - 100) / 15))), 0, math.radians(lerp(-16, 14, ease(f / NF)) + 3 * math.sin(t * 1.3)))
    syl = abs(math.sin(t * 13.0) * math.sin(t * 5.3 + 1.0)); jaw.rotation_euler = (math.radians(9 * syl), 0, 0)
    sh, el, hand = arms['L']; sh.rotation_euler = (math.radians(-30), 0, math.radians(8)); el.rotation_euler = (math.radians(-62), 0, 0); hand.rotation_euler = (math.radians(15), 0, 0)
    sh, el, hand = arms['R']
    a = ease(f / 25); b = ease((f - 60) / 14); c = ease((f - 110) / 20); beat = math.sin(t * 6.5) * 6 * (1 - b)
    sh.rotation_euler = (-math.radians(lerp(lerp(20, 55, a), 80, b) - 20 * c + beat), math.radians(lerp(0, -25, c)), math.radians(lerp(-6, -14, a)))
    el.rotation_euler = (-math.radians(lerp(lerp(30, 75, a), 70, b) - 30 * c), 0, 0)
    hand.rotation_euler = (-math.radians(lerp(10, 25, b)), 0, math.radians(lerp(0, 20, c)))
    root.rotation_euler = (math.radians(1.2 * math.sin(t * 1.7)), 0, math.radians(4 * math.sin(t * 0.9)))

# ---------------------------------------------------------------- sky, sun, camera
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
sky = N(nt, 'ShaderNodeTexSky', sky_type='NISHITA'); sky.sun_elevation = math.radians(28); sky.sun_rotation = math.radians(205); sky.sun_disc = False; sky.air_density = 1.0; sky.dust_density = 0.6
bg = N(nt, 'ShaderNodeBackground', Strength=0.5); wo = N(nt, 'ShaderNodeOutputWorld'); L(nt, sky.outputs[0], bg.inputs['Color']); L(nt, bg.outputs[0], wo.inputs['Surface'])
sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = 4.6; sd.angle = math.radians(1.2); sd.color = (1.0, 0.9, 0.78); sun = link(bpy.data.objects.new('sun', sd))
sun.rotation_euler = Vector((-0.45, -0.75, 0.48)).normalized().to_track_quat('Z', 'Y').to_euler()
cd = bpy.data.cameras.new('cam'); cam = link(bpy.data.objects.new('cam', cd)); sc.camera = cam; cd.lens = 28; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24; cd.clip_end = 3000
def pchip(keys, x):
    xs = [k[0] for k in keys]; ys = [k[1] for k in keys]; n = len(xs)
    if x <= xs[0]: return ys[0]
    if x >= xs[-1]: return ys[-1]
    d = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(n - 1)]
    m = [d[0]] + [0 if d[i - 1] * d[i] <= 0 else 3 * (xs[i + 1] - xs[i - 1]) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]) for i in range(1, n - 1)] + [d[-1]]
    i = max(j for j in range(n - 1) if xs[j] <= x); h = xs[i + 1] - xs[i]; t = (x - xs[i]) / h
    return (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] + (t ** 3 - 2 * t ** 2 + t) * h * m[i] + (-2 * t ** 3 + 3 * t ** 2) * ys[i + 1] + (t ** 3 - t ** 2) * h * m[i + 1]
def camera(f):
    """drone: high over the crowd and the living tricolour -> glide in and down -> settle on the speaker behind the glass"""
    ks = [(0, (6, -150, 46)), (60, (3, -72, 28)), (110, (1, -26, 19)), (150, (0.35, PY1 - 3.0, PZ + 1.72))]
    p = Vector([pchip([(k, v[i]) for k, v in ks], f) for i in range(3)])
    tg = [(0, (0, -40, 10)), (60, (0, GY, 18)), (110, (0, SP.y, PZ + 2.2)), (150, (0, SP.y, PZ + 1.62))]
    q = Vector([pchip([(k, v[i]) for k, v in tg], f) for i in range(3)])
    p += Vector((0.03 * math.sin(f * 0.21), 0, 0.02 * math.sin(f * 0.17)))
    cam.location = p; cam.rotation_euler = (q - p).to_track_quat('-Z', 'Y').to_euler(); cam.rotation_euler.rotate_axis('Z', math.radians(lerp(-3, 0, ease(f / 120))))
    cd.lens = pchip([(0, 24), (100, 28), (150, 38)], f)
    cd.dof.use_dof = f > 100; cd.dof.aperture_fstop = 2.8; cd.dof.focus_distance = (Vector((0, SP.y, PZ + 1.6)) - p).length

# ---------------------------------------------------------------- render
sc.render.resolution_x, sc.render.resolution_y = RESW, int(RESW * 16 / 9); sc.render.resolution_percentage = 100; sc.render.fps = FPS
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'; sc.view_settings.exposure = 0.2
if ENGINE == 'CYCLES':
    sc.render.engine = 'CYCLES'; cy = sc.cycles; cy.device = 'CPU'; cy.samples = SPP; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.04; cy.use_denoising = True
    cy.max_bounces = 4; cy.diffuse_bounces = 2; cy.glossy_bounces = 2; cy.transparent_max_bounces = 8; sc.render.use_persistent_data = True
else:
    sc.render.engine = 'BLENDER_EEVEE_NEXT'; ee = sc.eevee; ee.taa_render_samples = SPP; ee.use_shadows = True; ee.shadow_ray_count = 1; ee.shadow_step_count = 6
    ee.use_raytracing = True; ee.ray_tracing_options.resolution_scale = '2'; ee.use_fast_gi = True
vl = sc.view_layers[0]; vl.use_pass_mist = True; w.mist_settings.start = 40; w.mist_settings.depth = 900; w.mist_settings.falloff = 'QUADRATIC'
sc.use_nodes = True; ct = sc.node_tree; ct.nodes.clear(); rl = ct.nodes.new('CompositorNodeRLayers'); comp = ct.nodes.new('CompositorNodeComposite')
mix = ct.nodes.new('CompositorNodeMixRGB'); mix.inputs[2].default_value = (0.78, 0.82, 0.9, 1); mf = ct.nodes.new('CompositorNodeMath'); mf.operation = 'MULTIPLY'; mf.inputs[1].default_value = 0.22
ct.links.new(rl.outputs['Mist'], mf.inputs[0]); ct.links.new(mf.outputs[0], mix.inputs[0]); ct.links.new(rl.outputs['Image'], mix.inputs[1])
gl = ct.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'MEDIUM'
for k, v in (('Threshold', 1.2), ('Size', 0.5)):
    if k in gl.inputs: gl.inputs[k].default_value = v
ct.links.new(mix.outputs[0], gl.inputs['Image']); ct.links.new(gl.outputs[0], comp.inputs['Image'])
sc.render.image_settings.file_format = 'PNG'
for f in range(F0, F1):
    out = os.path.join(OUTDIR, 'f%04d.png' % f)
    if os.path.exists(out): continue
    t1 = time.time(); sc.frame_set(f); pose(f); camera(f); sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    print('FRAME %d %.1fs' % (f, time.time() - t1), flush=True)
print('DONE')
