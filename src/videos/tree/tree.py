# Samulation #5 "The Tree Nobody Can Miss" - photoreal world (Blender Cycles, procedural; 2D character cards added per shot).
#   blender -b --python tree.py -- --shot 1A --from 0 --to 66 --res 360 --spp 64 --outdir out/1A
import bpy, bmesh, math, random, sys, os, time
import numpy as np
from mathutils import Vector, Matrix, noise

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return argv[argv.index(k) + 1] if k in argv else d
SHOT = arg('--shot', '1A'); F0, F1 = int(arg('--from', '0')), int(arg('--to', '1')); OUTDIR = arg('--outdir', '/tmp/tree'); os.makedirs(OUTDIR, exist_ok=True)
RESW = int(arg('--res', '360')); SPP = int(arg('--spp', '64')); FPS = 30
R = random.Random(5)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def link(o, c=None): (c or sc.collection).objects.link(o); return o

# ---------------------------------------------------------------- material helpers
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
def pb(nt, out, col=None, sock=None, rough=0.6, metal=0.0, spec=0.4):
    p = N(nt, 'ShaderNodeBsdfPrincipled'); p.inputs['Roughness'].default_value = rough; p.inputs['Metallic'].default_value = metal; p.inputs['Specular IOR Level'].default_value = spec
    if sock is not None: L(nt, sock, p.inputs['Base Color'])
    elif col: p.inputs['Base Color'].default_value = col
    L(nt, p.outputs[0], out.inputs['Surface']); return p
def ovec(nt, scale=(1, 1, 1), coord='Object'):
    tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Scale'].default_value = scale; L(nt, tc.outputs[coord], mp.inputs['Vector']); return mp.outputs[0]
def bump(nt, p, h, s=0.5, d=0.02):
    b = N(nt, 'ShaderNodeBump', Strength=s, Distance=d); L(nt, h, b.inputs['Height']); L(nt, b.outputs['Normal'], p.inputs['Normal'])
def mixc(nt, a, b, fac, blend='MIX'):
    m = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type=blend)
    if isinstance(fac, float): m.inputs['Factor'].default_value = fac
    else: L(nt, fac, m.inputs['Factor'])
    L(nt, a, m.inputs['A']); L(nt, b, m.inputs['B']); return m.outputs['Result']
WIND = []   # 4D noise nodes whose W follows time (wind gusts rolling over the wheat)

def m_wheat(nt, out):       # ripe wheat seen from above: harvester rows, colour drift, gust bands rolling with the wind
    v = ovec(nt); rows = N(nt, 'ShaderNodeTexWave', wave_type='BANDS', bands_direction='X', Scale=1.25, Distortion=0.3, Detail=1.0); L(nt, ovec(nt, (1, 1, 1)), rows.inputs['Vector'])
    big = N(nt, 'ShaderNodeTexNoise', Scale=0.006, Detail=6.0, Roughness=0.6); L(nt, v, big.inputs['Vector'])
    gust = N(nt, 'ShaderNodeTexNoise', noise_dimensions='4D', Scale=0.03, Detail=3.0, Roughness=0.5); L(nt, ovec(nt, (1.0, 0.45, 1.0)), gust.inputs['Vector']); WIND.append(gust)
    fine = N(nt, 'ShaderNodeTexNoise', Scale=2.5, Detail=8.0, Roughness=0.7); L(nt, v, fine.inputs['Vector'])
    base = ramp(nt, [(0.3, hexc('#7d6a1e')), (0.5, hexc('#a68c2c')), (0.7, hexc('#bca03c')), (0.85, hexc('#978a3a'))], big.outputs['Fac'])
    g = ramp(nt, [(0.35, (0.72, 0.68, 0.6, 1)), (0.65, (1.18, 1.12, 1.0, 1))], gust.outputs['Fac'])          # bent stalks catch more sky -> lighter
    r = ramp(nt, [(0.4, (0.86, 0.83, 0.78, 1)), (0.6, (1.04, 1.02, 1.0, 1))], rows.outputs['Fac'])
    f_ = ramp(nt, [(0.3, (0.8, 0.78, 0.74, 1)), (0.7, (1.08, 1.05, 1.0, 1))], fine.outputs['Fac'])
    c = mixc(nt, mixc(nt, mixc(nt, base.outputs['Color'], g.outputs['Color'], 1.0, 'MULTIPLY'), r.outputs['Color'], 1.0, 'MULTIPLY'), f_.outputs['Color'], 1.0, 'MULTIPLY')
    p = pb(nt, out, sock=c, rough=0.75, spec=0.35); p.inputs['Sheen Weight'].default_value = 0.25; p.inputs['Sheen Tint'].default_value = hexc('#fff0c0')
    h = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); h.inputs[1].default_value = 0.5; L(nt, fine.outputs['Fac'], h.inputs[0]); L(nt, rows.outputs['Fac'], h.inputs[2]); bump(nt, p, h.outputs[0], 0.8, 0.15)
M_WHEAT = mat('wheat', m_wheat)
def m_asphalt(nt, out):     # aged asphalt: aggregate speckle, tyre-polished wheel tracks, tar-sealed cracks, painted lines (UV: u across, v along)
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], sep.inputs[0])
    ag = N(nt, 'ShaderNodeTexVoronoi', Scale=180.0); L(nt, tc.outputs['Object'], ag.inputs['Vector'])
    n = N(nt, 'ShaderNodeTexNoise', Scale=0.25, Detail=8.0); L(nt, tc.outputs['Object'], n.inputs['Vector'])
    base = ramp(nt, [(0.3, hexc('#58585a')), (0.55, hexc('#6a6a6b')), (0.8, hexc('#7a7876'))], n.outputs['Fac'])
    agc = ramp(nt, [(0.0, (0.75, 0.75, 0.75, 1)), (0.5, (1.0, 1.0, 1.0, 1)), (1.0, (1.25, 1.22, 1.18, 1))], ag.outputs['Distance'])
    # wheel tracks: lighter polished bands at |x| ~ 0.9 and 2.7
    ax = N(nt, 'ShaderNodeMath', operation='ABSOLUTE'); L(nt, sep.outputs['X'], ax.inputs[0])
    tr1 = ramp(nt, [(0.5, (1, 1, 1, 1)), (0.25, (1, 1, 1, 1))], ax.outputs[0])
    trk = N(nt, 'ShaderNodeMath', operation='PINGPONG'); trk.inputs[1].default_value = 0.9; L(nt, ax.outputs[0], trk.inputs[0])
    tk = ramp(nt, [(0.0, (1.12, 1.12, 1.12, 1)), (0.35, (1.0, 1.0, 1.0, 1))], trk.outputs[0])
    c = mixc(nt, mixc(nt, base.outputs['Color'], agc.outputs['Color'], 1.0, 'MULTIPLY'), tk.outputs['Color'], 1.0, 'MULTIPLY')
    # tar-seal cracks
    cr = N(nt, 'ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE', Scale=0.9, Randomness=1.0); L(nt, ovec(nt, (1, 0.25, 1)), cr.inputs['Vector'])
    crk = ramp(nt, [(0.0, (0.7, 0.7, 0.7, 1)), (0.004, (1, 1, 1, 1))], cr.outputs['Distance']); c = mixc(nt, c, crk.outputs['Color'], 1.0, 'MULTIPLY')
    # paint: double yellow centre (solid), white edge lines at |x| = 3.45
    yl = N(nt, 'ShaderNodeMath', operation='LESS_THAN'); yl.inputs[1].default_value = 0.22; L(nt, ax.outputs[0], yl.inputs[0])
    gap = N(nt, 'ShaderNodeMath', operation='GREATER_THAN'); gap.inputs[1].default_value = 0.06; L(nt, ax.outputs[0], gap.inputs[0])
    ym = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); L(nt, yl.outputs[0], ym.inputs[0]); L(nt, gap.outputs[0], ym.inputs[1])
    ed = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); ed.inputs[1].default_value = 3.45; L(nt, ax.outputs[0], ed.inputs[0]); ea = N(nt, 'ShaderNodeMath', operation='ABSOLUTE'); L(nt, ed.outputs[0], ea.inputs[0])
    wl = N(nt, 'ShaderNodeMath', operation='LESS_THAN'); wl.inputs[1].default_value = 0.075; L(nt, ea.outputs[0], wl.inputs[0])
    wear = N(nt, 'ShaderNodeTexNoise', Scale=3.0, Detail=6.0); L(nt, tc.outputs['Object'], wear.inputs['Vector']); wr = ramp(nt, [(0.35, (0.55, 0.55, 0.55, 1)), (0.6, (1, 1, 1, 1))], wear.outputs['Fac'])
    c = mixc(nt, c, mixc(nt, N(nt, 'ShaderNodeRGB').outputs[0], wr.outputs['Color'], 1.0, 'MULTIPLY'), ym.outputs[0])
    nt.nodes[-1] if False else None
    yel = [n_ for n_ in nt.nodes if n_.bl_idname == 'ShaderNodeRGB'][-1]; yel.outputs[0].default_value = hexc('#e8b21c')
    wht = N(nt, 'ShaderNodeRGB'); wht.outputs[0].default_value = hexc('#e9e6df')
    c = mixc(nt, c, mixc(nt, wht.outputs[0], wr.outputs['Color'], 1.0, 'MULTIPLY'), wl.outputs[0])
    rough = N(nt, 'ShaderNodeMapRange'); rough.inputs['To Min'].default_value = 0.75; rough.inputs['To Max'].default_value = 0.95; L(nt, n.outputs['Fac'], rough.inputs['Value'])
    p = pb(nt, out, sock=c, spec=0.4); L(nt, rough.outputs[0], p.inputs['Roughness']); bump(nt, p, ag.outputs['Distance'], 0.35, 0.004)
M_ROAD = mat('asphalt', m_asphalt)
def m_dirt(nt, out, a='#5e4e38', b='#857058'):
    n = N(nt, 'ShaderNodeTexNoise', Scale=1.4, Detail=10.0, Roughness=0.7); L(nt, ovec(nt), n.inputs['Vector']); g = N(nt, 'ShaderNodeTexVoronoi', Scale=40.0); L(nt, ovec(nt), g.inputs['Vector'])
    r = ramp(nt, [(0.3, hexc(a)), (0.7, hexc(b))], n.outputs['Fac']); p = pb(nt, out, sock=r.outputs['Color'], rough=0.95, spec=0.2); bump(nt, p, g.outputs['Distance'], 0.8, 0.02)
M_GRAVEL = mat('gravel', m_dirt)
def m_grass(nt, out):       # roadside verge: green-gold grass with dry patches
    n = N(nt, 'ShaderNodeTexNoise', Scale=0.4, Detail=8.0); L(nt, ovec(nt), n.inputs['Vector']); f = N(nt, 'ShaderNodeTexNoise', Scale=30.0, Detail=4.0); L(nt, ovec(nt), f.inputs['Vector'])
    r = ramp(nt, [(0.3, hexc('#1c2a0c')), (0.55, hexc('#2c3e12')), (0.75, hexc('#3e3a1c'))], n.outputs['Fac']); p = pb(nt, out, sock=r.outputs['Color'], rough=0.9, spec=0.25)
    p.inputs['Sheen Weight'].default_value = 0.4; bump(nt, p, f.outputs['Fac'], 1.0, 0.03)
M_GRASS = mat('verge', m_grass)
def m_bark(nt, out):        # oak bark: deep vertical furrows, lichen patches
    v = ovec(nt, (6, 6, 1.4)); vo = N(nt, 'ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE', Scale=1.0); L(nt, v, vo.inputs['Vector'])
    n = N(nt, 'ShaderNodeTexNoise', Scale=3.0, Detail=10.0); L(nt, ovec(nt), n.inputs['Vector']); li = N(nt, 'ShaderNodeTexNoise', Scale=1.2, Detail=6.0); L(nt, ovec(nt), li.inputs['Vector'])
    r = ramp(nt, [(0.0, hexc('#1d1712')), (0.08, hexc('#3d3229')), (0.3, hexc('#5d5044'))], vo.outputs['Distance'])
    lic = ramp(nt, [(0.6, (1, 1, 1, 1)), (0.7, hexc('#8d9a6a'))], li.outputs['Fac']); c = mixc(nt, r.outputs['Color'], lic.outputs['Color'], 0.5, 'MULTIPLY')
    p = pb(nt, out, sock=c, rough=0.92, spec=0.2); h = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); h.inputs[1].default_value = 0.3; L(nt, n.outputs['Fac'], h.inputs[0]); L(nt, vo.outputs['Distance'], h.inputs[2]); bump(nt, p, h.outputs[0], 1.0, 0.04)
M_BARK = mat('bark', m_bark)
def m_leaf(nt, out):        # leaf cards: ellipse alpha from UV, per-leaf colour (face attribute), translucency so the sun glows through
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['UV'], sep.inputs[0])
    dx = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); dx.inputs[1].default_value = 0.5; L(nt, sep.outputs['X'], dx.inputs[0]); dy = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); dy.inputs[1].default_value = 0.5; L(nt, sep.outputs['Y'], dy.inputs[0])
    sx = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); sx.inputs[1].default_value = 2.0; L(nt, dx.outputs[0], sx.inputs[0])
    cmb = N(nt, 'ShaderNodeCombineXYZ'); L(nt, sx.outputs[0], cmb.inputs['X']); L(nt, dy.outputs[0], cmb.inputs['Y']); ln = N(nt, 'ShaderNodeVectorMath', operation='LENGTH'); L(nt, cmb.outputs[0], ln.inputs[0])
    a = N(nt, 'ShaderNodeMath', operation='LESS_THAN'); a.inputs[1].default_value = 0.5; L(nt, ln.outputs['Value'], a.inputs[0])
    at = N(nt, 'ShaderNodeAttribute', attribute_name='lc', attribute_type='GEOMETRY')
    p = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.55); L(nt, at.outputs['Color'], p.inputs['Base Color']); p.inputs['Specular IOR Level'].default_value = 0.45
    tr = N(nt, 'ShaderNodeBsdfTranslucent'); L(nt, at.outputs['Color'], tr.inputs['Color']); mx = N(nt, 'ShaderNodeMixShader'); mx.inputs['Fac'].default_value = 0.3; L(nt, p.outputs[0], mx.inputs[1]); L(nt, tr.outputs[0], mx.inputs[2])
    tp = N(nt, 'ShaderNodeBsdfTransparent'); m2 = N(nt, 'ShaderNodeMixShader'); L(nt, a.outputs[0], m2.inputs['Fac']); L(nt, tp.outputs[0], m2.inputs[1]); L(nt, mx.outputs[0], m2.inputs[2]); L(nt, m2.outputs[0], out.inputs['Surface'])
M_LEAF = mat('leaf', m_leaf)
M_WOOD = mat('post', lambda nt, out: m_dirt(nt, out, '#4e3c2a', '#7a6248'))
M_WIRE = mat('wire', lambda nt, out: pb(nt, out, hexc('#2a2622'), rough=0.5, metal=0.6))
M_GALV = mat('galv', lambda nt, out: pb(nt, out, hexc('#a8acb0'), rough=0.35, metal=1.0))
def m_sign(nt, out):        # green highway sign face: retroreflective green, white text is separate geometry
    n = N(nt, 'ShaderNodeTexNoise', Scale=8.0, Detail=4.0); L(nt, ovec(nt), n.inputs['Vector']); r = ramp(nt, [(0.4, hexc('#0d5a33')), (0.6, hexc('#13693d'))], n.outputs['Fac']); pb(nt, out, sock=r.outputs['Color'], rough=0.3, spec=0.6)
M_SIGN = mat('signgreen', m_sign)
M_SIGNW = mat('signwhite', lambda nt, out: pb(nt, out, hexc('#f2f2ee'), rough=0.3, spec=0.6))
M_SILO = mat('silo', lambda nt, out: pb(nt, out, hexc('#b9bcbe'), rough=0.4, metal=0.8))
M_BARN = mat('barn', lambda nt, out: m_dirt(nt, out, '#7a2a20', '#9a3a2c'))
M_ROOFB = mat('roofb', lambda nt, out: pb(nt, out, hexc('#5a5d60'), rough=0.5, metal=0.6))

# ---------------------------------------------------------------- geometry helpers
def mesh_obj(name, verts, faces, m, uvs=None, smooth=False, c=None):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if uvs is not None:
        uvl = me.uv_layers.new(); k = 0
        for poly in me.polygons:
            for li in poly.loop_indices: uvl.data[li].uv = uvs[k]; k += 1
    if m: me.materials.append(m)
    for p in me.polygons: p.use_smooth = smooth
    return link(bpy.data.objects.new(name, me), c)
def box(name, size, loc, m=None, rot=(0, 0, 0), bevel=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect='EDGES')
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    return link(o)
def cyl(name, r, h, loc, m=None, verts=12, rot=(0, 0, 0), r2=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); o.location = loc; o.rotation_euler = rot
    if m: me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return link(o)
def plane(name, x0, x1, y0, y1, z, m, nx=1, ny=1, zf=None):
    vs = []; fs = []; uvs = []
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx; y = y0 + (y1 - y0) * j / ny; vs.append((x, y, z if zf is None else zf(x, y)))
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i; fs.append((a, a + 1, a + nx + 2, a + nx + 1))
    return mesh_obj(name, vs, fs, m, smooth=True)

# ---------------------------------------------------------------- the world: road along +Y, the tree at TREE
ROADW = 7.4; TREE = Vector((7.2, 0.0, 0.0)); YMIN, YMAX = -1500, 2500
def terr(x, y):   # dead flat plains with a whisper of undulation, ditch-dip beside the shoulders
    ax = abs(x); dip = -0.35 * math.exp(-((ax - 6.2) / 1.2) ** 2)
    return dip + 0.6 * noise.noise(Vector((x * 0.004, y * 0.004, 0.2))) * min(1.0, max(0.0, (ax - 10) / 40))
plane('road', -ROADW / 2, ROADW / 2, YMIN, YMAX, 0.02, M_ROAD, 1, 200)
for s in (-1, 1):
    plane('shoulder', s * ROADW / 2, s * (ROADW / 2 + 1.3), YMIN, YMAX, 0.01, M_GRAVEL, 1, 200)
    xs = [s * (ROADW / 2 + 1.3), s * 8.5, s * 10.5]
    plane('verge', xs[0], xs[2], YMIN, YMAX, 0, M_GRASS, 6, 400, terr)
    plane('wheat', s * 10.5, s * 2200, YMIN, YMAX, 0, M_WHEAT, 120, 200, terr)
# barbed-wire fence on both sides (posts every 4 m near the camera path, sparser far)
for s in (-1, 1):
    ys = list(range(-400, 900, 4)) + list(range(900, YMAX, 12))
    pts = []
    for y in ys:
        x = s * 10.4; z0 = terr(x, y); h = 1.25 + R.uniform(-0.05, 0.05); cyl('fpost', 0.055, h, (x, y, z0 + h / 2 - 0.1), M_WOOD, 6, (R.uniform(-0.04, 0.04), R.uniform(-0.04, 0.04), 0)); pts.append((x, y, z0))
    for hz in (0.55, 0.85, 1.12):
        cu = bpy.data.curves.new('fw', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.006; sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for i, (x, y, z0) in enumerate(pts): sp.points[i].co = (x, y, z0 + hz, 1)
        o = bpy.data.objects.new('fw', cu); cu.materials.append(M_WIRE); link(o)
# telephone poles on the left, every 50 m, sagging wires
tops = []
for k in range(-6, 50):
    y = k * 50.0; x = -13.0; cyl('pole', 0.13, 9.5, (x, y, 4.6), M_WOOD, 8); box('xarm', (1.8, 0.12, 0.12), (x, y, 8.9), M_WOOD)
    tops.append(Vector((x, y, 9.0)))
for dx in (-0.75, 0.0, 0.75):
    cu = bpy.data.curves.new('pw', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.01
    for a, b in zip(tops, tops[1:]):
        sp = cu.splines.new('POLY'); sp.points.add(8)
        for i in range(9): t = i / 8; p = a.lerp(b, t) + Vector((dx, 0, -1.1 * 4 * t * (1 - t))); sp.points[i].co = (p.x, p.y, p.z, 1)
    o = bpy.data.objects.new('pw', cu); cu.materials.append(M_WIRE); link(o)
# a far farmstead: grain silos + barn (scale cues on the empty plains)
for k in range(3): cyl('silo', 4.2, 22, (-260 - k * 9.5, 1450, 11), M_SILO, 24); cyl('silocap', 4.4, 3, (-260 - k * 9.5, 1450, 23.5), M_SILO, 24, r2=0.6)
box('barn', (26, 16, 9), (-215, 1460, 4.5), M_BARN); box('barnroof', (27, 17.5, 0.4), (-215, 1460, 10.2), M_ROOFB, (math.radians(4), 0, 0))
# "NEXT TREE 20 MI" sign on the right shoulder, ahead of the camera
SIGN_Y = -60.0
for dx in (-1.8, 1.8): cyl('signpost', 0.1, 6.0, (ROADW / 2 + 2.4 + dx, SIGN_Y, 3.0), M_GALV, 10)
box('signface', (6.0, 0.1, 3.3), (ROADW / 2 + 2.4, SIGN_Y, 5.6), M_SIGN, bevel=0.08)
box('signrim', (5.75, 0.105, 3.05), (ROADW / 2 + 2.4, SIGN_Y - 0.003, 5.6), M_SIGNW, bevel=0.06); box('signface2', (5.5, 0.11, 2.8), (ROADW / 2 + 2.4, SIGN_Y - 0.006, 5.6), M_SIGN, bevel=0.05)
for (txt, z, size) in (('NEXT TREE', 6.25, 0.85), ('20 MI', 4.95, 1.05)):
    cu = bpy.data.curves.new('t', 'FONT'); cu.body = txt; cu.size = size; cu.extrude = 0.005; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    o = bpy.data.objects.new('t', cu); o.location = (ROADW / 2 + 2.4, SIGN_Y - 0.08, z); o.rotation_euler = (math.pi / 2, 0, 0); cu.materials.append(M_SIGNW); link(o)


# ---------------------------------------------------------------- real 3D vegetation near the camera path (photoreal close-ups)
M_STALK = mat('stalk', lambda nt, out: (lambda at: pb(nt, out, sock=ramp(nt, [(0.0, hexc('#8a7a2c')), (0.5, hexc('#b39a3e')), (1.0, hexc('#d1b55a'))], at.outputs['Random']).outputs['Color'], rough=0.55, spec=0.45))(N(nt, 'ShaderNodeObjectInfo')))
def wheat_stalk(k):
    rs = random.Random(100 + k); bm = bmesh.new(); h = rs.uniform(0.85, 1.05); lean = Vector((rs.uniform(-0.08, 0.08), rs.uniform(-0.08, 0.08), 0))
    # stem: 4-sided thin tube with a curve
    ring_prev = None
    for i in range(7):
        t = i / 6; c = Vector((0, 0, h * t)) + lean * (t * t) * h; r = 0.0045 * (1 - 0.4 * t)
        ring = [bm.verts.new(c + Vector((math.cos(a) * r, math.sin(a) * r, 0))) for a in (0, 1.57, 3.14, 4.71)]
        if ring_prev:
            for j in range(4): bm.faces.new([ring_prev[j], ring_prev[(j + 1) % 4], ring[(j + 1) % 4], ring[j]])
        ring_prev = ring
    top = Vector((0, 0, h)) + lean * h
    # ear: stacked kernel bumps along a 9 cm spindle + awns
    d = (Vector((0, 0, 1)) + lean * 1.6).normalized()
    for i in range(10):
        p = top + d * (0.01 + i * 0.0085)
        for sgn in (-1, 1):
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.0055, matrix=Matrix.Translation(p + Vector((sgn * 0.0045, 0, 0))) @ Matrix.Diagonal((0.8, 0.8, 1.4, 1)))
            a0 = bm.verts.new(p + Vector((sgn * 0.005, 0, 0.004))); a1 = bm.verts.new(p + Vector((sgn * 0.02, 0, 0.06))); a2 = bm.verts.new(p + Vector((sgn * 0.0055, 0.0015, 0.004)))
            bm.faces.new([a0, a1, a2])
    # two leaves
    for j in range(2):
        z = h * rs.uniform(0.3, 0.6); ang = rs.uniform(0, math.tau); dd = Vector((math.cos(ang), math.sin(ang), 0.4)).normalized(); side = Vector((-dd.y, dd.x, 0)) * 0.006
        b0 = Vector((0, 0, z)); m1 = b0 + dd * 0.12 + Vector((0, 0, 0.02)); tip = b0 + dd * 0.24 + Vector((0, 0, -0.04))
        v = [bm.verts.new(b0 - side), bm.verts.new(b0 + side), bm.verts.new(m1 + side), bm.verts.new(m1 - side), bm.verts.new(tip)]
        bm.faces.new([v[0], v[1], v[2], v[3]]); bm.faces.new([v[3], v[2], v[4]])
    me = bpy.data.meshes.new('stalk%d' % k); bm.to_mesh(me); bm.free(); me.materials.append(M_STALK)
    for p in me.polygons: p.use_smooth = True
    return me
WHEATC = bpy.data.collections.new('wheatstalks'); sc.collection.children.link(WHEATC)
for k in range(8):
    o = bpy.data.objects.new('stalk%d' % k, wheat_stalk(k)); WHEATC.objects.link(o); o.location = (0, 0, -50)
def scatter_particles(name, x0, x1, y0, y1, count, coll, size, size_rand, seed):
    """Geometry Nodes scatter: points on the ground patch -> random pick from coll, random yaw, random scale; instances stay upright"""
    em = plane(name, x0, x1, y0, y1, 0, None, 4, 40, terr); area = abs((x1 - x0) * (y1 - y0))
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree'); ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry'); ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    nd = ng.nodes; lk = ng.links.new; gi = nd.new('NodeGroupInput'); go = nd.new('NodeGroupOutput')
    dist = nd.new('GeometryNodeDistributePointsOnFaces'); dist.inputs['Density'].default_value = count / area; dist.inputs['Seed'].default_value = seed
    ci = nd.new('GeometryNodeCollectionInfo'); ci.inputs['Collection'].default_value = coll; ci.inputs['Separate Children'].default_value = True; ci.inputs['Reset Children'].default_value = True
    iop = nd.new('GeometryNodeInstanceOnPoints'); iop.inputs['Pick Instance'].default_value = True
    rot = nd.new('FunctionNodeRandomValue'); rot.data_type = 'FLOAT_VECTOR'; rot.inputs['Min'].default_value = (-0.06, -0.06, 0); rot.inputs['Max'].default_value = (0.06, 0.06, 6.283); rot.inputs['Seed'].default_value = seed + 1
    scl = nd.new('FunctionNodeRandomValue'); scl.data_type = 'FLOAT'; scl.inputs[2].default_value = size * (1 - size_rand); scl.inputs[3].default_value = size; scl.inputs['Seed'].default_value = seed + 2
    idx = nd.new('FunctionNodeRandomValue'); idx.data_type = 'INT'; idx.inputs[4].default_value = 0; idx.inputs[5].default_value = len(coll.objects) - 1; idx.inputs['Seed'].default_value = seed + 3
    lk(gi.outputs[0], dist.inputs['Mesh']); lk(dist.outputs['Points'], iop.inputs['Points']); lk(ci.outputs[0], iop.inputs['Instance'])
    lk(rot.outputs[0], iop.inputs['Rotation']); lk(scl.outputs[1], iop.inputs['Scale']); lk(idx.outputs[2], iop.inputs['Instance Index']); lk(iop.outputs[0], go.inputs[0])
    em.modifiers.new(name, 'NODES').node_group = ng; return em
WHEATC = bpy.data.collections.new('wheatstalks'); sc.collection.children.link(WHEATC)
for k in range(8):
    o = bpy.data.objects.new('stalk%d' % k, wheat_stalk(k)); WHEATC.objects.link(o); o.location = (0, 0, -50)
for s_ in (-1, 1):
    a, b = sorted((s_ * 10.6, s_ * 46.0)); scatter_particles('wheatnear', a, b, -170, 25, 520000, WHEATC, 1.0, 0.2, 3 + s_)
    a, b = sorted((s_ * 46.0, s_ * 120.0)); scatter_particles('wheatmid', a, b, -120, 60, 260000, WHEATC, 1.0, 0.2, 7 + s_)
def m_blade(nt, out):     # grass blade: dark green root -> lush mid -> sun-yellowed tip (UV v = along the blade), per-clump hue jitter, translucent
    tc = N(nt, 'ShaderNodeTexCoord'); sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['UV'], sep.inputs[0]); oi = N(nt, 'ShaderNodeObjectInfo')
    r = ramp(nt, [(0.0, hexc('#10280a')), (0.3, hexc('#26580e')), (0.7, hexc('#3f7d16')), (1.0, hexc('#86a830'))], sep.outputs['Y'])
    j = N(nt, 'ShaderNodeHueSaturation'); L(nt, r.outputs['Color'], j.inputs['Color']); hm = N(nt, 'ShaderNodeMapRange'); hm.inputs['To Min'].default_value = 0.47; hm.inputs['To Max'].default_value = 0.53
    L(nt, oi.outputs['Random'], hm.inputs['Value']); L(nt, hm.outputs[0], j.inputs['Hue'])
    p = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=0.62); p.inputs['Specular IOR Level'].default_value = 0.3; L(nt, j.outputs['Color'], p.inputs['Base Color'])
    tr = N(nt, 'ShaderNodeBsdfTranslucent'); L(nt, j.outputs['Color'], tr.inputs['Color']); mx = N(nt, 'ShaderNodeMixShader'); mx.inputs['Fac'].default_value = 0.25
    L(nt, p.outputs[0], mx.inputs[1]); L(nt, tr.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs['Surface'])
M_BLADE = mat('blade', m_blade)
M_FLOWER = mat('flower', lambda nt, out: pb(nt, out, hexc('#f2c418'), rough=0.6))
def grass_clump(k, flower=False):
    """a clump of 14-26 curved, tapered blades (2-sided quads with UV along the length)"""
    rs = random.Random(300 + k); V = []; F = []; UV = []
    nb = rs.randint(14, 26)
    for i in range(nb):
        a = rs.uniform(0, math.tau); base = Vector((math.cos(a), math.sin(a), 0)) * rs.uniform(0, 0.05); h = rs.uniform(0.12, 0.5) * (1.0 if rs.random() > 0.25 else 0.5)
        lean = Vector((math.cos(a), math.sin(a), 0)) * rs.uniform(0.02, 0.13); w = rs.uniform(0.008, 0.017); side = Vector((-math.sin(a), math.cos(a), 0)) * w
        segs = 5; b0 = len(V)
        for j in range(segs + 1):
            t = j / segs; c = base + Vector((0, 0, h * t)) + lean * h * t * t; ww = 1 - t ** 1.5
            V += [tuple(c - side * ww), tuple(c + side * ww)]; UV += [(0, t), (1, t)]
        for j in range(segs): F.append((b0 + 2 * j, b0 + 2 * j + 1, b0 + 2 * j + 3, b0 + 2 * j + 2))
    me = bpy.data.meshes.new('clump%d' % k); me.from_pydata(V, [], F); me.update(); uvl = me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices: uvl.data[li].uv = UV[me.loops[li].vertex_index]
    me.materials.append(M_BLADE)
    if flower:
        bm = bmesh.new(); bm.from_mesh(me); top = Vector((0.03, 0, rs.uniform(0.35, 0.5)))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.018, matrix=Matrix.Translation(top) @ Matrix.Diagonal((1, 1, 0.5, 1)))
        bm.to_mesh(me); bm.free(); me.materials.append(M_FLOWER)
        for p in me.polygons:
            if p.center.z > top.z - 0.02 and abs(p.center.x - 0.03) < 0.03: p.material_index = 1
    for p in me.polygons: p.use_smooth = True
    return me
GRASSC = bpy.data.collections.new('grassclumps'); sc.collection.children.link(GRASSC)
for k in range(10):
    o = bpy.data.objects.new('clump%d' % k, grass_clump(k, flower=False)); GRASSC.objects.link(o); o.location = (0, 0, -60)
for s_ in (-1, 1):   # verge: dense clumps near the camera path, sparser toward the far end
    a_, b_ = sorted((s_ * (ROADW / 2 + 1.3), s_ * 10.4)); scatter_particles('vergeA', a_, b_, -165, -40, 140000, GRASSC, 1.0, 0.5, 21 + s_)
    scatter_particles('vergeB', a_, b_, -40, 40, 70000, GRASSC, 1.0, 0.45, 31 + s_)

# ---------------------------------------------------------------- the oak: recursive branches (tubes) + leaf-card clusters
def tube_mesh(segs):
    """segs: list of (p0, p1, r0, r1) -> one mesh of tapered 8-sided tubes"""
    V = []; F = []
    for (p0, p1, r0, r1) in segs:
        d = (p1 - p0).normalized(); q = d.to_track_quat('Z', 'Y').to_matrix(); base = len(V)
        for k in range(8):
            a = k / 8 * math.tau; ofs = Vector((math.cos(a), math.sin(a), 0)); V.append(tuple(p0 + q @ (ofs * r0))); V.append(tuple(p1 + q @ (ofs * r1)))
        for k in range(8):
            a0, b0, a1, b1 = base + 2 * k, base + 2 * k + 1, base + 2 * ((k + 1) % 8), base + 2 * ((k + 1) % 8) + 1; F.append((a0, a1, b1, b0))
    return V, F
def build_oak(root, seed=3):
    rs = random.Random(seed); segs = []; tips = []
    def grow(p, d, length, r, depth):
        n = 4; pts = [p]
        for i in range(n):
            d = (d + Vector((rs.uniform(-0.25, 0.25), rs.uniform(-0.25, 0.25), rs.uniform(-0.05, 0.12)))).normalized(); pts.append(pts[-1] + d * length / n)
        for i in range(n): segs.append((pts[i], pts[i + 1], r * (1 - 0.18 * i / n), r * (1 - 0.18 * (i + 1) / n)))
        end = pts[-1]
        if depth == 0 or r < 0.03: tips.append(end); return
        kids = 3 if depth > 1 else 4
        for k in range(kids):
            a = rs.uniform(0, math.tau); spread = rs.uniform(0.5, 0.95) if depth < 4 else rs.uniform(0.75, 1.1)
            nd = (d * math.cos(spread) + Vector((math.cos(a), math.sin(a), 0.25)).normalized() * math.sin(spread)).normalized()
            grow(end, nd, length * rs.uniform(0.62, 0.78), r * rs.uniform(0.52, 0.66), depth - 1)
        if depth <= 2: tips.append(end)
    # trunk (slight lean, flare) then 4 scaffold limbs
    grow(root, Vector((0.05, 0.02, 1)).normalized(), 3.6, 0.55, 0)
    top = segs[-1][1]; segs[-1] = (segs[-1][0], top, segs[-1][2], 0.48); tips.pop()
    for k in range(5):
        a = k / 5 * math.tau + rs.uniform(-0.3, 0.3); d = Vector((math.cos(a), math.sin(a), 1.7)).normalized()
        grow(top, d, 5.5, 0.34, 4)
    V, F = tube_mesh(segs); trunk = mesh_obj('oak_wood', V, F, M_BARK, smooth=True)
    # root flare
    cyl('flare', 0.95, 0.9, (root.x, root.y, root.z + 0.3), M_BARK, 12, r2=0.55)
    # leaves: clustered cards around each tip, denser outward = full round crown
    LV = []; LF = []; LUV = []; LC = []
    greens = [hexc(c) for c in ('#3a6a1c', '#467a22', '#548a28', '#62982e', '#71a636', '#4a7424')]
    for t in tips:
        for i in range(170):
            c = t + Vector((rs.gauss(0, 1.15), rs.gauss(0, 1.15), rs.gauss(0, 0.75)))
            n = Vector((rs.uniform(-1, 1), rs.uniform(-1, 1), rs.uniform(-0.2, 1))).normalized(); u = n.cross(Vector((0, 0, 1))).normalized() if abs(n.z) < 0.95 else Vector((1, 0, 0)); v = n.cross(u)
            s = rs.uniform(0.16, 0.28); b = len(LV)
            for (du, dv) in ((-1, -1), (1, -1), (1, 1), (-1, 1)): LV.append(tuple(c + u * du * s * 0.5 + v * dv * s))
            LF.append((b, b + 1, b + 2, b + 3)); LUV += [(0, 0), (1, 0), (1, 1), (0, 1)]; LC.append(rs.choice(greens))
    cc = root + Vector((0.4, 0.2, 9.8))
    for i in range(16000):
        d = Vector((rs.gauss(0, 1), rs.gauss(0, 1), rs.gauss(0, 1))).normalized(); rr = rs.uniform(0.55, 1.0) ** 0.5
        c = cc + Vector((d.x * 6.8, d.y * 6.8, d.z * 4.6)) * rr * (1 + 0.12 * noise.noise(d * 2.2 + Vector((seed, 0, 0))))
        if c.z < root.z + 4.8: continue
        n = Vector((rs.uniform(-1, 1), rs.uniform(-1, 1), rs.uniform(-0.2, 1))).normalized(); u = n.cross(Vector((0, 0, 1))).normalized() if abs(n.z) < 0.95 else Vector((1, 0, 0)); v = n.cross(u)
        s = rs.uniform(0.16, 0.28); b = len(LV)
        for (du, dv) in ((-1, -1), (1, -1), (1, 1), (-1, 1)): LV.append(tuple(c + u * du * s * 0.5 + v * dv * s))
        LF.append((b, b + 1, b + 2, b + 3)); LUV += [(0, 0), (1, 0), (1, 1), (0, 1)]; LC.append(rs.choice(greens) if d.z < 0.3 else rs.choice(greens[2:]))
    leaves = mesh_obj('oak_leaves', LV, LF, M_LEAF, LUV)
    at = leaves.data.attributes.new('lc', 'FLOAT_COLOR', 'FACE'); at.data.foreach_set('color', np.array(LC, dtype=np.float32).ravel())
    return trunk, leaves, len(LF)
oak_wood, oak_leaves, NLEAF = build_oak(TREE + Vector((0, 0, 0.0)))
print('leaves', NLEAF)
for o in (oak_wood, oak_leaves):     # pivot at the trunk base so the crown sways from the ground up
    o.data.transform(Matrix.Translation(-TREE)); o.location = TREE

# ---------------------------------------------------------------- sky, sun, clouds
HDRI = arg('--hdri', '/root/proj/tree/hdri/kloofendal_48d_partly_cloudy_puresky.hdr')   # CC0, Poly Haven
SUN_AZ = math.radians(float(arg('--sunaz', '-115')))   # desired sun azimuth (deg, 0 = +Y down the road, -90 = from the left)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
img = bpy.data.images.load(HDRI); W_, H_ = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(H_, W_, 4)
lum_ = px[..., 0] * 0.2126 + px[..., 1] * 0.7152 + px[..., 2] * 0.0722; vy, ux = np.unravel_index(np.argmax(lum_), lum_.shape)
u_, v_ = (ux + 0.5) / W_, (vy + 0.5) / H_; phi = (u_ - 0.5) * 2 * math.pi; th = (v_ - 0.5) * math.pi
hdir = Vector((-math.cos(th) * math.cos(phi), math.cos(th) * math.sin(phi), math.sin(th)))     # sun direction inside the HDRI
rotz = SUN_AZ - math.atan2(hdir.x, hdir.y)
tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, -rotz); L(nt, tc.outputs['Generated'], mp.inputs['Vector'])
env = N(nt, 'ShaderNodeTexEnvironment'); env.image = img; L(nt, mp.outputs[0], env.inputs['Vector'])
bg = N(nt, 'ShaderNodeBackground', Strength=1.0); wo = N(nt, 'ShaderNodeOutputWorld'); L(nt, env.outputs['Color'], bg.inputs['Color']); L(nt, bg.outputs[0], wo.inputs['Surface'])
sdir = Matrix.Rotation(rotz, 3, 'Z') @ hdir
print('HDRI sun elevation %.1f deg' % math.degrees(th))
sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = 3.5; sd.angle = math.radians(0.8); sd.color = (1.0, 0.96, 0.9); sun = link(bpy.data.objects.new('sun', sd))
sun.rotation_euler = sdir.to_track_quat('Z', 'Y').to_euler()
CLOUDS = []
# ---------------------------------------------------------------- camera per shot
cd = bpy.data.cameras.new('cam'); cam = link(bpy.data.objects.new('cam', cd)); sc.camera = cam; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24; cd.clip_end = 6000; cd.lens = 24
def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def lerpv(a, b, t): return Vector(a).lerp(Vector(b), t)
def shot_1A(f):
    """low glide through the verge grass toward the lone oak; NEXT TREE 20 MI sign passes overhead-left around f44"""
    t = f / 66.0; e = t * 0.75 + ease(t) * 0.25
    p = lerpv((9.4, -150.0, 1.2), (9.2, -72.0, 1.35), e) + Vector((0, 0, 0.015 * math.sin(f * 0.4)))
    tgt = lerpv((5.5, 0.0, 2.6), TREE + Vector((-0.5, 0, 5.0)), ease(t))
    cam.location = p; cam.rotation_euler = (tgt - p).to_track_quat('-Z', 'Y').to_euler(); cam.rotation_euler.rotate_axis('Z', math.radians(-1.0 + 1.0 * t))
    cd.lens = 28 + 14 * ease(t)
SHOTS = {'1A': shot_1A}

def world_time(f):
    t = f / FPS
    for g in WIND: g.inputs['W'].default_value = t * 0.35
    sway = math.radians(0.6 * math.sin(t * 1.3) + 0.3 * math.sin(t * 2.7 + 1))
    oak_leaves.rotation_euler = (sway * 0.5, sway, 0); oak_wood.rotation_euler = (sway * 0.15, sway * 0.3, 0)
    for (o, x) in CLOUDS: o.location.x = x + t * 6.0

# ---------------------------------------------------------------- render (Cycles path tracing, photoreal grade)
sc.render.engine = 'CYCLES'; cy = sc.cycles; cy.device = 'CPU'; cy.samples = SPP; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.03
cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'; cy.max_bounces = 6; cy.diffuse_bounces = 3; cy.glossy_bounces = 3; cy.transparent_max_bounces = 16; cy.transmission_bounces = 4
sc.render.use_persistent_data = True; cy.caustics_reflective = False; cy.caustics_refractive = False
sc.render.resolution_x, sc.render.resolution_y = RESW, int(RESW * 16 / 9); sc.render.resolution_percentage = 100; sc.render.fps = FPS
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0.5   # flat render; grade.py grades to the reference
vl = sc.view_layers[0]; vl.use_pass_mist = True; w.mist_settings.start = 300; w.mist_settings.depth = 3000; w.mist_settings.falloff = 'QUADRATIC'
sc.use_nodes = True; ct = sc.node_tree; ct.nodes.clear(); rl = ct.nodes.new('CompositorNodeRLayers'); comp = ct.nodes.new('CompositorNodeComposite')
def cn(t, **kw):
    n = ct.nodes.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n
mix = cn('CompositorNodeMixRGB'); mix.inputs[2].default_value = (0.7, 0.78, 0.9, 1); mf = cn('CompositorNodeMath', operation='MULTIPLY'); mf.inputs[1].default_value = 0.12
ct.links.new(rl.outputs['Mist'], mf.inputs[0]); ct.links.new(mf.outputs[0], mix.inputs[0]); ct.links.new(rl.outputs['Image'], mix.inputs[1]); last = mix.outputs[0]
bl = cn('CompositorNodeGlare', glare_type='BLOOM' if 'BLOOM' in [i.identifier for i in bpy.types.CompositorNodeGlare.bl_rna.properties['glare_type'].enum_items] else 'FOG_GLOW', quality='MEDIUM')
for k, v in (('Threshold', 0.9), ('Size', 0.6), ('Strength', 0.35), ('Mix', -0.7)):
    if k in bl.inputs: bl.inputs[k].default_value = v
ct.links.new(last, bl.inputs['Image']); last = bl.outputs[0]
ct.links.new(last, comp.inputs['Image'])
sc.render.image_settings.file_format = 'PNG'
for f in range(F0, F1):
    out = os.path.join(OUTDIR, 'f%04d.png' % f)
    if os.path.exists(out): continue
    t1 = time.time(); sc.frame_set(f); world_time(f); SHOTS[SHOT](f); sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    print('FRAME %d %.1fs' % (f, time.time() - t1), flush=True)
print('DONE')
