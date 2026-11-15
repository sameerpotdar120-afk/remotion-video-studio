# Samulation #4 (train): Blender world. Run: blender -b --python scene.py -- --shot hook --out out.png [--scale 0.25]
# EEVEE Next on software GL. Everything is procedural (our own code); the hero is our Canvas2D rig on a camera-facing card.
import bpy, bmesh, math, random, sys, json, os, subprocess
from mathutils import Vector, Matrix, noise

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT = arg('--out', '/tmp/train.png'); SCALE = float(arg('--scale', '1')); SHOT = arg('--shot', 'hook')
HERE = os.path.dirname(os.path.abspath(__file__)); CARD = os.path.join(HERE, '..', 'card'); TMP = arg('--tmp', '/tmp/train_tmp'); os.makedirs(TMP, exist_ok=True)
R = random.Random(7)
WELD = globals().get('WELD', False); KINK = globals().get('KINK', None)   # kink(y) -> lateral offset (m), welded gapless line

# ---------------------------------------------------------------- reset
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def coll(name):
    c = bpy.data.collections.new(name); sc.collection.children.link(c); return c
def link(o, c=None): (c or sc.collection).objects.link(o); return o

# ---------------------------------------------------------------- materials
def mat(name, build):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); build(nt, out); return m
def N(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items():
        if k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n
def L(nt, a, b): nt.links.new(a, b)
def ramp(nt, stops, fac):
    r = N(nt, 'ShaderNodeValToRGB'); el = r.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], stops[0][1]; el[1].position, el[1].color = stops[-1][0], stops[-1][1]
    for p, c in stops[1:-1]: e = el.new(p); e.color = c
    L(nt, fac, r.inputs['Fac']); return r
def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple([x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [a])
def principled(nt, out, col_socket=None, color=None, rough=0.8, metal=0.0, spec=0.3):
    p = N(nt, 'ShaderNodeBsdfPrincipled'); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal
    p.inputs['Specular IOR Level'].default_value = spec
    if col_socket is not None: L(nt, col_socket, p.inputs['Base Color'])
    elif color: p.inputs['Base Color'].default_value = color
    L(nt, p.outputs[0], out.inputs['Surface']); return p

def m_sand(nt, out):   # warm red-orange desert sand: two noise scales -> ramp, darker speckles
    tc = N(nt, 'ShaderNodeTexCoord'); n1 = N(nt, 'ShaderNodeTexNoise', Scale=0.08, Detail=6.0); n2 = N(nt, 'ShaderNodeTexNoise', Scale=2.5, Detail=4.0)
    L(nt, tc.outputs['Object'], n1.inputs['Vector']); L(nt, tc.outputs['Object'], n2.inputs['Vector'])
    mx = N(nt, 'ShaderNodeMix', data_type='FLOAT'); mx.inputs['Factor'].default_value = 0.35; L(nt, n1.outputs['Fac'], mx.inputs['A']); L(nt, n2.outputs['Fac'], mx.inputs['B'])
    r = ramp(nt, [(0.3, hexc('#b4522c')), (0.5, hexc('#d9773f')), (0.68, hexc('#eba062'))], mx.outputs['Result'])
    p = principled(nt, out, r.outputs['Color'], rough=0.95, spec=0.2)
    b = N(nt, 'ShaderNodeBump', Strength=0.25); L(nt, n2.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], p.inputs['Normal'])
M_SAND = mat('sand', m_sand)

def m_strata(nt, out):   # mesa rock: horizontal strata bands (object Z), warped by noise; pale cap
    tc = N(nt, 'ShaderNodeTexCoord'); n = N(nt, 'ShaderNodeTexNoise', Scale=0.02, Detail=5.0, Distortion=0.4)
    L(nt, tc.outputs['Object'], n.inputs['Vector'])
    sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], sep.inputs[0])
    add = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); add.inputs[1].default_value = 9.0
    L(nt, n.outputs['Fac'], add.inputs[0]); L(nt, sep.outputs['Z'], add.inputs[2])
    w = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); w.inputs[1].default_value = 0.06; L(nt, add.outputs[0], w.inputs[0])
    fr = N(nt, 'ShaderNodeMath', operation='FRACT'); L(nt, w.outputs[0], fr.inputs[0])
    r = ramp(nt, [(0.0, hexc('#9c3b22')), (0.22, hexc('#c4552c')), (0.4, hexc('#e08547')), (0.55, hexc('#b8482a')), (0.72, hexc('#d96a36')), (0.86, hexc('#f0b27a')), (1.0, hexc('#9c3b22'))], fr.outputs[0])
    p = principled(nt, out, r.outputs['Color'], rough=0.9, spec=0.15)
    b = N(nt, 'ShaderNodeBump', Strength=0.5); n3 = N(nt, 'ShaderNodeTexNoise', Scale=0.6, Detail=8.0); L(nt, tc.outputs['Object'], n3.inputs['Vector'])
    L(nt, n3.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], p.inputs['Normal'])
M_ROCK = mat('strata', m_strata)

def m_wood(nt, out, base='#6e4a30', dark='#3e2718', light='#9a6c45', bump=0.4):
    tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.0, 14.0, 1.0)
    L(nt, tc.outputs['Object'], mp.inputs['Vector'])
    mp.inputs['Scale'].default_value = (0.6, 9.0, 9.0)
    wv = N(nt, 'ShaderNodeTexNoise', Scale=2.2, Detail=3.0, Roughness=0.45); L(nt, mp.outputs[0], wv.inputs['Vector'])
    n = N(nt, 'ShaderNodeTexNoise', Scale=6.0, Detail=6.0); L(nt, tc.outputs['Object'], n.inputs['Vector'])
    mx = N(nt, 'ShaderNodeMix', data_type='FLOAT'); mx.inputs['Factor'].default_value = 0.4; L(nt, wv.outputs['Fac'], mx.inputs['A']); L(nt, n.outputs['Fac'], mx.inputs['B'])
    r = ramp(nt, [(0.25, hexc(dark)), (0.55, hexc(base)), (0.8, hexc(light))], mx.outputs['Result'])
    p = principled(nt, out, r.outputs['Color'], rough=0.85, spec=0.2)
    b = N(nt, 'ShaderNodeBump', Strength=bump); L(nt, wv.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], p.inputs['Normal'])
M_TIE = mat('tie', m_wood)
M_POLE = mat('pole', lambda nt, out: m_wood(nt, out, '#7a5638', '#4a3020', '#a07650', 0.3))

def m_rail(nt, out):   # polished running surface on top, rusty brown everywhere else
    g = N(nt, 'ShaderNodeNewGeometry'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, g.outputs['Normal'], sep.inputs[0])
    gt = N(nt, 'ShaderNodeMath', operation='GREATER_THAN'); gt.inputs[1].default_value = 0.9; L(nt, sep.outputs['Z'], gt.inputs[0])
    tc = N(nt, 'ShaderNodeTexCoord'); n = N(nt, 'ShaderNodeTexNoise', Scale=9.0, Detail=8.0); L(nt, tc.outputs['Object'], n.inputs['Vector'])
    rust = ramp(nt, [(0.35, hexc('#4a2a1c')), (0.6, hexc('#7a4128')), (0.8, hexc('#9c5a34'))], n.outputs['Fac'])
    mc = N(nt, 'ShaderNodeMix', data_type='RGBA'); L(nt, gt.outputs[0], mc.inputs['Factor']); L(nt, rust.outputs['Color'], mc.inputs['A']); mc.inputs['B'].default_value = hexc('#b4b0ac')
    rg = N(nt, 'ShaderNodeMix', data_type='FLOAT'); L(nt, gt.outputs[0], rg.inputs['Factor']); rg.inputs['A'].default_value = 0.9; rg.inputs['B'].default_value = 0.45
    mt = N(nt, 'ShaderNodeMix', data_type='FLOAT'); L(nt, gt.outputs[0], mt.inputs['Factor']); mt.inputs['A'].default_value = 0.0; mt.inputs['B'].default_value = 0.85
    p = principled(nt, out, mc.outputs['Result'], spec=0.08); L(nt, rg.outputs['Result'], p.inputs['Roughness']); L(nt, mt.outputs['Result'], p.inputs['Metallic'])
M_RAIL = mat('rail', m_rail)
def m_hot(nt, out):   # rail glowing with heat: emission ramp, strength set per frame through node 'heat'
    p = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.4, Metallic=0.6); p.inputs['Base Color'].default_value = hexc('#6a3a28')
    p.inputs['Emission Color'].default_value = hexc('#ff7a22'); p.inputs['Emission Strength'].default_value = 0.0; p.name = 'heat'
    L(nt, p.outputs[0], out.inputs['Surface'])
M_HOTRAIL = mat('hotrail', m_hot)
M_IRON = mat('iron', lambda nt, out: principled(nt, out, color=hexc('#3d3533'), rough=0.6, metal=0.7))
M_PLATE = mat('plate', lambda nt, out: principled(nt, out, color=hexc('#5a3a2a'), rough=0.7, metal=0.5))
def m_rock(nt, out):
    oi = N(nt, 'ShaderNodeObjectInfo')
    r = ramp(nt, [(0.0, hexc('#6f625c')), (0.35, hexc('#9a8c84')), (0.6, hexc('#b07a5a')), (0.85, hexc('#c9b8a8')), (1.0, hexc('#7d4b36'))], oi.outputs['Random'])
    p = principled(nt, out, r.outputs['Color'], rough=0.9, spec=0.25)
M_BALLAST = mat('ballast', m_rock)
def m_emit(col, strength):
    def b(nt, out):
        e = N(nt, 'ShaderNodeEmission', Strength=strength); e.inputs['Color'].default_value = hexc(col); L(nt, e.outputs[0], out.inputs['Surface'])
    return b
M_SPARK = mat('spark', m_emit('#ffc35a', 40.0))
M_WIRE = mat('wire', lambda nt, out: principled(nt, out, color=hexc('#2a2422'), rough=0.6))
M_HANDLE = mat('handle', lambda nt, out: m_wood(nt, out, '#b8854f', '#7a5230', '#d9a86c', 0.15))
M_MAUL = mat('maulhead', lambda nt, out: principled(nt, out, color=hexc('#4a4f57'), rough=0.35, metal=0.9))

# ---------------------------------------------------------------- mesh helpers
def box(name, size, loc=(0, 0, 0), m=None, c=None, bevel=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect='EDGES')
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc
    if m: me.materials.append(m)
    return link(o, c)
def cyl(name, r, h, loc=(0, 0, 0), m=None, c=None, verts=12, rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=h)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return link(o, c)
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)   # bake every part's offset, origin -> world origin
    bpy.ops.object.join(); objs[0].name = name; return objs[0]
def apply_all(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# ---------------------------------------------------------------- track (gauge 1.435 m, 39 ft = 11.887 m rails, joint gaps)
GAUGE, RAIL_LEN, GAP = 1.435, 11.887, 0.026     # gap drawn ~2x real width so it reads on screen
TIE_SP, TRACK_END = 0.56, 420.0
RX = GAUGE / 2 + 0.036                            # rail centre line
CT = coll('track')
def rail_mesh(length):   # head / web / foot profile, extruded along +Y
    parts = [box('h', (0.072, length, 0.045), (0, length / 2, 0.137)), box('w', (0.018, length, 0.09), (0, length / 2, 0.07)), box('f', (0.14, length, 0.022), (0, length / 2, 0.011))]
    o = join(parts, 'rail'); o.data.materials.append(M_RAIL); return o
rail_proto = rail_mesh(RAIL_LEN - GAP); sc.collection.objects.unlink(rail_proto)
JOINT0 = 2.05                                     # a joint sits right in the foreground
joints = [JOINT0 + k * RAIL_LEN for k in range(-1, int(TRACK_END / RAIL_LEN) + 1)]
def rail_strip(x0, y0, y1, seg):
    """continuous rail (head/web/foot profile) extruded in `seg` m steps; lateral offset KINK(y) applied"""
    prof = [(-0.036, 0.16), (0.036, 0.16), (0.036, 0.115), (0.009, 0.115), (0.009, 0.022), (0.07, 0.022), (0.07, 0.0), (-0.07, 0.0), (-0.07, 0.022), (-0.009, 0.022), (-0.009, 0.115), (-0.036, 0.115)]
    me = bpy.data.meshes.new('wrail'); bm = bmesh.new(); rings = []; n = int((y1 - y0) / seg) + 1
    for k in range(n + 1):
        y = y0 + (y1 - y0) * k / n
        rings.append([bm.verts.new((x0 + px, y, pz)) for (px, pz) in prof])
    for a, b in zip(rings, rings[1:]):
        for i2 in range(len(prof)): bm.faces.new([a[i2], a[(i2 + 1) % len(prof)], b[(i2 + 1) % len(prof)], b[i2]])
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1]); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new('wrail', me); me.materials.append(M_HOTRAIL if KINK else M_RAIL); link(o, CT)
    if KINK:
        o.shape_key_add(name='Basis'); sk = o.shape_key_add(name='kink')
        for i3, v in enumerate(me.vertices): sk.data[i3].co.x = v.co.x + KINK(v.co.y)
        KRAILS.append(sk)
    return o
KRAILS, KTIES = [], []
if WELD:
    for side in (-1, 1): rail_strip(side * RX, -6.0, TRACK_END, 0.25)
else:
  for side in (-1, 1):
    for j in joints:
        o = rail_proto.copy(); o.location = (side * RX, j + GAP / 2, 0.0); link(o, CT)
        if j < 60:   # joint bars + 4 bolts each side of the web
            for s2 in (-1, 1):
                b = box('jbar', (0.016, 0.6, 0.075), (side * RX + s2 * 0.018, j, 0.075), M_IRON, CT, bevel=0.003)
                for k in (-0.21, -0.07, 0.07, 0.21):
                    cyl('bolt', 0.013, 0.05, (side * RX + s2 * 0.034, j + k, 0.075), M_IRON, CT, 6, (0, math.pi / 2, 0))
# tie unit: tie + 2 plates + 4 spikes
def tie_unit():
    parts = [box('tie', (2.6, 0.23, 0.17), (0, 0, -0.085), bevel=0.012)]
    for side in (-1, 1):
        parts.append(box('plate', (0.2, 0.18, 0.016), (side * RX, 0, 0.008)))
        for s2 in (-1, 1):
            parts.append(box('spike', (0.016, 0.016, 0.03), (side * RX + s2 * 0.085, s2 * 0.04, 0.03)))
            parts.append(box('shead', (0.03, 0.022, 0.01), (side * RX + s2 * 0.078, s2 * 0.04, 0.047)))
    o = join(parts, 'tieunit'); o.data.materials.append(M_TIE); o.data.materials.append(M_PLATE)
    for p in o.data.polygons:
        if p.center.z > 0.0005 or abs(abs(p.center.x) - RX) < 0.12 and p.center.z > -0.001: p.material_index = 1
    sc.collection.objects.unlink(o); return o
TU = tie_unit()
n_near = 130 if KINK else 70
for i in range(n_near):    # near ties: individually jittered
    o = TU.copy(); o.data = TU.data; yy = -3.0 + i * TIE_SP + R.uniform(-0.03, 0.03); o.location = (R.uniform(-0.04, 0.04), yy, R.uniform(-0.01, 0.0))
    o.rotation_euler = (0, 0, math.radians(R.uniform(-1.6, 1.6))); link(o, CT)
    if KINK: KTIES.append((o, o.location.x, o.rotation_euler.z, KINK(yy), math.atan((KINK(yy + 0.3) - KINK(yy - 0.3)) / 0.6) * 0.8))
far = TU.copy(); far.location = (0, -3.0 + n_near * TIE_SP, 0); link(far, CT)
am = far.modifiers.new('arr', 'ARRAY'); am.count = int((TRACK_END - n_near * TIE_SP) / TIE_SP); am.use_relative_offset = False; am.use_constant_offset = True; am.constant_offset_displace = (0, TIE_SP, 0)

# ballast bed: trapezoid + rocks scattered near the camera
def ballast_bed():
    me = bpy.data.meshes.new('bed'); bm = bmesh.new()
    prof = [(-2.6, -0.32), (-1.7, -0.03), (1.7, -0.03), (2.6, -0.32)]
    for y in (-6.0, TRACK_END):
        for (x, z) in prof: bm.verts.new((x, y, z))
    bm.verts.ensure_lookup_table()
    for i in range(3): bm.faces.new([bm.verts[i], bm.verts[i + 1], bm.verts[i + 5], bm.verts[i + 4]])
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('bed', me); me.materials.append(M_BALLAST); return link(o, CT)
bed = ballast_bed()
rocks = coll('rocks'); rocks.hide_render = False
for k in range(10):
    me = bpy.data.meshes.new('rk'); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * R.uniform(0.7, 1.2), v.co.y * R.uniform(0.7, 1.2), v.co.z * R.uniform(0.45, 0.8))) * (1 + 0.15 * noise.noise(v.co * 3 + Vector((k, 0, 0))))
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('rk%d' % k, me); me.materials.append(M_BALLAST)
    rocks.objects.link(o); o.location = (0, -50, -10)
    for p in me.polygons: p.use_smooth = True
sc.view_layers[0].layer_collection.children['rocks'].exclude = False
def scatter(name, size, loc, density, coll_, scale, scale_rand, seed=1, upright=False, c=None):
    """static Geometry Nodes scatter (particle systems re-evaluate on every frame change: ~2 min/frame here)"""
    o = box(name, size, loc, None, c)
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree'); ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry'); nd = ng.nodes
    gi = nd.new('NodeGroupInput'); go = nd.new('NodeGroupOutput')
    top = nd.new('GeometryNodeMeshBoolean') if False else None
    dist = nd.new('GeometryNodeDistributePointsOnFaces'); dist.inputs['Density'].default_value = density; dist.inputs['Seed'].default_value = seed
    ci = nd.new('GeometryNodeCollectionInfo'); ci.inputs['Collection'].default_value = coll_; ci.inputs['Separate Children'].default_value = True; ci.inputs['Reset Children'].default_value = True
    iop = nd.new('GeometryNodeInstanceOnPoints'); iop.inputs['Pick Instance'].default_value = True
    rv = nd.new('FunctionNodeRandomValue'); rv.data_type = 'FLOAT_VECTOR'; rv.inputs['Min'].default_value = (0, 0, 0); rv.inputs['Max'].default_value = (0 if upright else 6.3, 0 if upright else 6.3, 6.3); rv.inputs['Seed'].default_value = seed + 1
    rs = nd.new('FunctionNodeRandomValue'); rs.data_type = 'FLOAT'; rs.inputs[2].default_value = scale * (1 - scale_rand); rs.inputs[3].default_value = scale; rs.inputs['Seed'].default_value = seed + 2
    ii = nd.new('FunctionNodeRandomValue'); ii.data_type = 'INT'; ii.inputs[4].default_value = 0; ii.inputs[5].default_value = len(coll_.objects) - 1; ii.inputs['Seed'].default_value = seed + 3
    lk = ng.links.new
    lk(gi.outputs[0], dist.inputs['Mesh']); lk(dist.outputs['Points'], iop.inputs['Points']); lk(ci.outputs[0], iop.inputs['Instance'])
    lk(rv.outputs[0], iop.inputs['Rotation']); lk(rs.outputs[1], iop.inputs['Scale']); lk(ii.outputs[2], iop.inputs['Instance Index']); lk(iop.outputs[0], go.inputs[0])
    mod = o.modifiers.new(name, 'NODES'); mod.node_group = ng; return o
emit = scatter('ballast_emit', (3.4, 68.0, 0.001), (0, 28.0, -0.035), 560.0, rocks, 0.032, 0.6, 3, c=CT)
for o in rocks.all_objects: o.hide_render = False

# ---------------------------------------------------------------- terrain + mesas
def terrain():
    nx, ny, size = 220, 260, (2400.0, 2600.0); me = bpy.data.meshes.new('ground'); bm = bmesh.new()
    vs = []
    for j in range(ny):
        row = []
        for i in range(nx):
            u, v = i / (nx - 1), j / (ny - 1); x = (u - 0.5) * size[0]; y = -400 + v * size[1]
            x = math.copysign(abs(x / (size[0] / 2)) ** 1.8 * size[0] / 2, x)       # denser near the track
            w = min(1.0, max(0.0, (abs(x) - 4.0) / 70.0)) ** 1.5
            h = noise.fractal(Vector((x * 0.004, y * 0.004, 0.3)), 0.7, 2.0, 5) * 9.0 + noise.noise(Vector((x * 0.03, y * 0.03, 1.7))) * 1.2
            row.append(bm.verts.new((x, y, -0.33 + w * h)))
        vs.append(row)
    for j in range(ny - 1):
        for i in range(nx - 1): bm.faces.new([vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]])
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('ground', me); me.materials.append(M_SAND)
    for p in me.polygons: p.use_smooth = True
    return link(o)
terrain()
def mesa(x, y, rad, h, seed, cap=0.12):
    """butte: talus skirt, then near-vertical cliff bands with small ledges (hard and soft strata), flat cap"""
    me = bpy.data.meshes.new('mesa'); bm = bmesh.new(); seg, rings = 180, 90
    bands = 7; rows = []
    for k in range(rings + 1):
        t = k / rings; z = t * h
        skirt = max(0.0, 0.16 - t) / 0.16; rr = rad * (1.0 + 0.7 * skirt ** 1.6)
        bt = (t * bands) % 1.0; band = int(t * bands)
        rr *= 1.0 - 0.025 * band - (0.035 if bt > 0.82 else 0.0)        # each band steps back; soft layer undercut at its top
        row = []
        for s_ in range(seg):
            a = s_ / seg * math.tau; d = Vector((math.cos(a), math.sin(a), 0))
            jag = noise.fractal(Vector((d.x * 1.5 + seed, d.y * 1.5, band * 0.35)), 0.5, 2.0, 3) * 0.10
            flute = abs(noise.noise(Vector((a * 30 + seed, t * 2.0, 5)))) * 0.035
            row.append(bm.verts.new((x + d.x * rr * (1 + jag - flute), y + d.y * rr * (1 + jag - flute), z - 2)))
        rows.append(row)
    for k in range(rings):
        for s_ in range(seg): bm.faces.new([rows[k][s_], rows[k][(s_ + 1) % seg], rows[k + 1][(s_ + 1) % seg], rows[k + 1][s_]])
    bm.faces.new(rows[-1]); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('mesa', me); me.materials.append(M_ROCK)
    for p in me.polygons: p.use_smooth = True
    return link(o)
for (x, y, rad, h) in [(-90, 420, 70, 95), (140, 520, 110, 120), (-260, 700, 160, 150), (40, 1100, 220, 170), (330, 900, 140, 110), (-60, 1500, 300, 210), (-520, 1200, 240, 190), (520, 1400, 260, 160)]:
    mesa(x, y, rad, h, R.uniform(0, 50))

# telegraph poles + wires along the right side
CP = coll('poles'); tops = []
for k in range(14):
    y = 6 + k * 34.0; x = 3.4
    cyl('pole', 0.09, 7.2, (x, y, 3.3), M_POLE, CP, 10); box('arm', (1.4, 0.1, 0.1), (x, y, 6.6), M_POLE, CP)
    for dx in (-0.55, -0.18, 0.18, 0.55): cyl('ins', 0.035, 0.12, (x + dx, y, 6.72), M_IRON, CP, 8); tops.append((k, dx, Vector((x + dx, y, 6.76))))
for dx in (-0.55, -0.18, 0.18, 0.55):
    pts = [p for (k, d, p) in tops if d == dx]
    cu = bpy.data.curves.new('wire', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.008
    for a, b in zip(pts, pts[1:]):
        sp = cu.splines.new('POLY'); sp.points.add(8)
        for i in range(9):
            t = i / 8; p = a.lerp(b, t); p.z -= 0.9 * 4 * t * (1 - t); sp.points[i].co = (p.x, p.y, p.z, 1)
    o = bpy.data.objects.new('wire', cu); cu.materials.append(M_WIRE); link(o, CP)

M_SHRUB = mat('shrub', lambda nt, out: principled(nt, out, color=hexc('#7d7a3c'), rough=0.9))
M_SHRUB2 = mat('shrub2', lambda nt, out: principled(nt, out, color=hexc('#a39a55'), rough=0.9))
shr = coll('shrubs')
for k in range(6):
    me = bpy.data.meshes.new('sh'); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    for v in bm.verts: v.co = Vector((v.co.x, v.co.y, max(v.co.z, -0.2) * 0.62)) * (1 + 0.28 * noise.noise(v.co * 4 + Vector((k * 3.1, 0, 0))))
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('sh%d' % k, me); me.materials.append(M_SHRUB if k % 2 else M_SHRUB2); shr.objects.link(o); o.location = (0, -60, -20)
    for p in me.polygons: p.use_smooth = True
for sx in (-1, 1): scatter('shrub_emit', (60.0, 300.0, 0.001), (sx * 34.0, 140.0, -0.3), 2600 / 18000.0, shr, 0.45, 0.7, 11 + sx, upright=True)
# far landmarks of the town: wooden water tower + station, left of the track
M_TANK = mat('tank', lambda nt, out: m_wood(nt, out, '#8a5a36', '#5a3820', '#b07a4a', 0.2))
M_ROOF = mat('roof', lambda nt, out: principled(nt, out, color=hexc('#7a2e22'), rough=0.8))
M_WALL = mat('wall', lambda nt, out: m_wood(nt, out, '#c9a36a', '#9a7448', '#e2c08a', 0.15))
CT2 = coll('town'); TX, TY = -9.0, 150.0
for dx in (-1.6, 1.6):
    for dy in (-1.6, 1.6): cyl('leg', 0.18, 9.0, (TX + dx, TY + dy, 4.2), M_POLE, CT2, 8)
cyl('tank', 2.6, 3.6, (TX, TY, 10.4), M_TANK, CT2, 32); bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=2.9, depth=1.6, location=(TX, TY, 13.0)); c = bpy.context.object; c.data.materials.append(M_ROOF)
exec(open(os.path.join(HERE, 'town.py')).read())

# ---------------------------------------------------------------- sky + sun
SUN_EL, SUN_AZ = math.radians(globals().get('SUN_EL_DEG', 32)), math.radians(-35)     # sun behind-right of the camera, front-lights the hero
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
sky = N(nt, 'ShaderNodeTexSky', sky_type='NISHITA'); sky.sun_elevation = SUN_EL; sky.sun_rotation = SUN_AZ + math.pi; sky.altitude = 1200; sky.air_density = 1.4; sky.dust_density = 0.6; sky.sun_disc = False
bg = N(nt, 'ShaderNodeBackground', Strength=0.55); wo = N(nt, 'ShaderNodeOutputWorld')
# push the sky toward the refs' saturated blue
hsv = N(nt, 'ShaderNodeHueSaturation', Saturation=1.6, Value=0.9, Hue=0.545); L(nt, sky.outputs[0], hsv.inputs['Color'])
L(nt, hsv.outputs[0], bg.inputs['Color']); L(nt, bg.outputs[0], wo.inputs['Surface'])
sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = 4.2; sd.angle = math.radians(2.5); sd.color = globals().get('SUN_COL', (1.0, 0.93, 0.82))
sun = bpy.data.objects.new('sun', sd); link(sun)
d = Vector((math.cos(SUN_EL) * math.sin(SUN_AZ), -math.cos(SUN_EL) * math.cos(SUN_AZ), math.sin(SUN_EL)))   # direction toward the sun
sun.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
# soft cumulus cards (procedural)
def m_cloud(nt, out):
    tc = N(nt, 'ShaderNodeTexCoord'); n = N(nt, 'ShaderNodeTexNoise', Scale=2.2, Detail=6.0, Roughness=0.55); L(nt, tc.outputs['Generated'], n.inputs['Vector'])
    gr = N(nt, 'ShaderNodeTexGradient', gradient_type='SPHERICAL'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Location'].default_value = (-0.5, -0.5, 0); mp.inputs['Scale'].default_value = (2, 2, 1)
    L(nt, tc.outputs['Generated'], mp.inputs['Vector']); L(nt, mp.outputs[0], gr.inputs['Vector'])
    m1 = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); L(nt, n.outputs['Fac'], m1.inputs[0]); L(nt, gr.outputs['Fac'], m1.inputs[1])
    a = ramp(nt, [(0.12, (0, 0, 0, 1)), (0.24, (1, 1, 1, 1))], m1.outputs[0])
    shade = ramp(nt, [(0.25, hexc('#b9c6e4')), (0.5, hexc('#ffffff'))], n.outputs['Fac'])
    e = N(nt, 'ShaderNodeEmission', Strength=0.95); L(nt, shade.outputs['Color'], e.inputs['Color'])
    tr = N(nt, 'ShaderNodeBsdfTransparent'); mx = N(nt, 'ShaderNodeMixShader'); L(nt, a.outputs['Color'], mx.inputs['Fac']); L(nt, tr.outputs[0], mx.inputs[1]); L(nt, e.outputs[0], mx.inputs[2])
    L(nt, mx.outputs[0], out.inputs['Surface'])
M_CLOUD = mat('cloud', m_cloud)
for (x, y, z, s) in [(-420, 1500, 520, 1000), (380, 1700, 650, 1100), (-60, 1900, 950, 1300), (-900, 1500, 380, 760), (820, 1400, 360, 700), (560, 2000, 1250, 1000), (-640, 2100, 1350, 1100)]:
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y, z)); c = bpy.context.object; c.scale = (s, s * 0.55, 1); c.rotation_euler = (math.radians(90), 0, 0)
    c.data.materials.append(M_CLOUD); c.visible_shadow = False

# ---------------------------------------------------------------- camera
cd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cd); link(cam); sc.camera = cam
cd.lens = 36; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 36; cd.clip_start = 0.02; cd.clip_end = 6000
def aim(pos, target, roll=0.0):
    cam.location = pos; q = (Vector(target) - Vector(pos)).to_track_quat('-Z', 'Y'); cam.rotation_euler = q.to_euler()
    cam.rotation_euler.rotate_axis('Z', math.radians(roll))

# ---------------------------------------------------------------- hero card
UNIT = 1.72 / 690; PX = 300; CW, CH = 640 + 2 * PX, 1100
def hero_card(feet, pose, name='hero'):
    """render our Canvas2D rig for `pose` (hands solved onto world grip points), put it on a camera-facing card at `feet`"""
    feet = Vector(feet); fwd = Vector((cam.location.x - feet.x, cam.location.y - feet.y, 0)).normalized()
    rotz = math.atan2(fwd.x, -fwd.y)     # card normal (+Y local after rotation x=90) faces the camera
    M = Matrix.Translation(feet) @ Matrix.Rotation(rotz, 4, 'Z')
    nrm = (M.to_3x3() @ Vector((0, -1, 0))).normalized()
    def to_design(w):
        o = cam.location; dvec = (Vector(w) - o).normalized(); t = (feet - o).dot(nrm) / dvec.dot(nrm); hit = o + dvec * t
        loc = M.inverted() @ hit; x, y = 320 + loc.x / UNIT, 1000 - loc.z / UNIT
        lean = pose.get('lean', 0.0); cx, cy = 320, 1000; c, s = math.cos(-lean), math.sin(-lean)   # undo the card lean
        return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]
    p = dict(pose); shL, shR = (320 - 69.4, 635.9), (320 + 69.4, 635.9)
    if 'gripLw' in p: q = to_design(p.pop('gripLw')); p['armL'] = [(q[0] - shL[0]) / 1.02, (q[1] - shL[1]) / 1.02]; p['gripL'] = True
    if 'gripRw' in p: q = to_design(p.pop('gripRw')); p['armR'] = [(q[0] - shR[0]) / 1.02, (q[1] - shR[1]) / 1.02]; p['gripR'] = True
    p['out'] = os.path.join(TMP, name + '.png'); p['ak'] = 3
    js = os.path.join(TMP, name + '.json'); json.dump([p], open(js, 'w'))
    subprocess.run(['node', os.path.join(CARD, 'render_card.mjs'), js], check=True, cwd=CARD)
    img = bpy.data.images.load(p['out'])
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); out = nt.nodes.new('ShaderNodeOutputMaterial')
    tx = N(nt, 'ShaderNodeTexImage'); tx.image = img; tx.interpolation = 'Cubic'
    pb = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=1.0); pb.inputs['Specular IOR Level'].default_value = 0.0
    L(nt, tx.outputs['Color'], pb.inputs['Base Color']); L(nt, tx.outputs['Color'], pb.inputs['Emission Color']); pb.inputs['Emission Strength'].default_value = 0.42
    L(nt, tx.outputs['Alpha'], pb.inputs['Alpha']); L(nt, pb.outputs[0], out.inputs['Surface'])
    m.surface_render_method = 'DITHERED'
    me = bpy.data.meshes.new(name); w, h = CW * UNIT, CH * UNIT; yb = -(1050 - 0) * UNIT    # design y 1050 (=1000+50 translate) at the feet
    top = (CH - 1050) * UNIT   # canvas bottom is at design y 1100 -> 50 units below the feet
    bm = bmesh.new(); vs = [bm.verts.new(v) for v in [(-w / 2, 0, -50 * UNIT), (w / 2, 0, -50 * UNIT), (w / 2, 0, (CH - 50) * UNIT), (-w / 2, 0, (CH - 50) * UNIT)]]
    f = bm.faces.new(vs); uv = bm.loops.layers.uv.new()
    for l, c in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): l[uv].uv = c
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    o = bpy.data.objects.new(name, me); o.matrix_world = M; link(o)
    # the lean pivots at the feet in the drawing already; card stays upright
    return o

