# Shot 2 (frames 25-45, 0.8-1.5 s, "bites you"): low camera behind the man's bare shoulder/upper arm,
# huge bumpy skin dome in the foreground, small fly on its far edge, blue T-shirt, bearded profile top right.
# usage: blender -b --python shot_man.py -- out_dir res_percent spp frame_start frame_end
# The man is "Bearded Man" by KaitlynAndrus (Sketchfab), CC BY 4.0; fly "Domestic Fly" by aramabdulrahim, CC BY 4.0.
import sys, os, time, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
import bmesh
from mathutils import Matrix
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if len(argv) > 0 else '/tmp/man'
RES = int(argv[1]) if len(argv) > 1 else 50
SPP = int(argv[2]) if len(argv) > 2 else 32
FS = int(argv[3]) if len(argv) > 3 else 37
FE = int(argv[4]) if len(argv) > 4 else FS
FAST = os.environ.get('FAST', '0') == '1'      # skip fur/strands for layout tests
MAN_GLB = os.path.join(ROOT, 'assets', 'bearded.glb')
EYE_OUT = 0.09
DOME_CELL = 3.2   # bumps per BU (laterally stretched)
DOME_DISP = 0.22
SHIRT_BLOBS = [((0, 0.3, -0.9), 6.6, (1.0, 0.62, 0.8)),          # torso
               ((-4.9, -0.3, 1.4), 3.2, (1.1, 1.05, 0.8)),        # near shoulder (his right)
               ((4.7, 0.1, 1.8), 3.1, (1.0, 1.0, 0.85)),          # far shoulder
               ((0, 0.45, 2.85), 4.4, (1.12, 0.74, 0.55))]        # trapezius / neck base
S = 5.5            # man scale: model units (≈3.3 cm) -> BU (fly 3.4 BU ≈ 2 cm)

def smooth01(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

# ───────────────────────── shader helpers ─────────────────────────
def math_node(n, l, op, a, b=None, c=None):
    m = n.new('ShaderNodeMath'); m.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None: continue
        if isinstance(v, (int, float)): m.inputs[i].default_value = v
        else: l.new(v, m.inputs[i])
    return m.outputs[0]

def smoothstep_node(n, l, x, e0, e1):
    r = n.new('ShaderNodeMapRange'); r.interpolation_type = 'SMOOTHSTEP'; r.inputs['From Min'].default_value = e0
    r.inputs['From Max'].default_value = e1; l.new(x, r.inputs['Value']); return r.outputs['Result']

def unlink(m, name):
    b = m.node_tree.nodes['Principled BSDF']
    for lk in list(b.inputs[name].links): m.node_tree.links.remove(lk)

# ───────────────────────── the man ─────────────────────────
def import_man(sc):
    before = set(sc.objects); bpy.ops.import_scene.gltf(filepath=MAN_GLB)
    new = [o for o in sc.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    bpy.context.view_layer.update()
    for o in meshes:                                   # bake world transform -> mesh coords == model coords
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
        o.data.transform(mw); o.matrix_world = Matrix()
        for p in o.data.polygons: p.use_smooth = True
    for o in new:
        if o.type != 'MESH': bpy.data.objects.remove(o)
    return {o.name: o for o in meshes}

def keep_faces(o, keep):
    bm = bmesh.new(); bm.from_mesh(o.data)
    dead = [f for f in bm.faces if not keep(f.calc_center_median())]
    bmesh.ops.delete(bm, geom=dead, context='FACES'); bm.to_mesh(o.data); bm.free()

def head_material(m):
    n, l = nodes(m); b = n['Principled BSDF']
    unlink(m, 'Metallic'); b.inputs['Metallic'].default_value = 0
    unlink(m, 'Emission Color'); b.inputs['Emission Strength'].default_value = 0
    b.inputs['Subsurface Weight'].default_value = 0.12; b.inputs['Subsurface Radius'].default_value = (1, .4, .25)
    b.inputs['Subsurface Scale'].default_value = 0.35
    tex = b.inputs['Base Color'].links[0].from_socket
    # warm tint
    warm = n.new('ShaderNodeMix'); warm.data_type = 'RGBA'; warm.blend_type = 'MULTIPLY'; warm.inputs['Factor'].default_value = 1
    warm.inputs['B'].default_value = (1.18, 0.98, 0.86, 1); l.new(tex, warm.inputs['A'])
    br = n.new('ShaderNodeBrightContrast'); br.inputs['Bright'].default_value = 0.1; br.inputs['Contrast'].default_value = 0.08
    l.new(warm.outputs['Result'], br.inputs['Color']); skincol = br.outputs['Color']
    # haircut fade + stubble masks in model coordinates
    tc = n.new('ShaderNodeTexCoord'); sx = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sx.inputs[0])
    X, Y, Z = sx.outputs['X'], sx.outputs['Y'], sx.outputs['Z']
    back = smoothstep_node(n, l, Y, 0.0, 2.2)                       # 0 at ear, 1 at back of head
    zlo = math_node(n, l, 'MULTIPLY_ADD', back, -1.6, 8.55)         # fade starts above the ear, lower at the nape
    zrel = math_node(n, l, 'SUBTRACT', Z, zlo)
    fade = smoothstep_node(n, l, zrel, -0.2, 1.1)
    front = smoothstep_node(n, l, Y, -2.95, -2.35)                  # no hair on the forehead ...
    fhigh = smoothstep_node(n, l, Z, 10.0, 10.5)                    # ... except above the hairline
    fmask = math_node(n, l, 'MAXIMUM', front, fhigh)
    hairmask = math_node(n, l, 'MULTIPLY', fade, fmask)
    # stubble on cheeks / jaw / upper lip (below cheekbone, in front of the ear)
    cheek = smoothstep_node(n, l, Y, -0.7, -1.4)
    cz = math_node(n, l, 'MULTIPLY', smoothstep_node(n, l, Z, 7.75, 7.15), smoothstep_node(n, l, Z, 4.3, 5.0))
    stub = math_node(n, l, 'MULTIPLY', cheek, cz)
    stub = math_node(n, l, 'MULTIPLY', stub, 0.32)
    dens = math_node(n, l, 'MAXIMUM', hairmask, stub)
    no = n.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 90; no.inputs['Detail'].default_value = 2
    l.new(tc.outputs['Object'], no.inputs['Vector'])
    dots = smoothstep_node(n, l, no.outputs['Fac'], 0.42, 0.62)
    dd = math_node(n, l, 'MULTIPLY', dens, math_node(n, l, 'MULTIPLY_ADD', dots, 0.4, 0.4))
    # repaint the baked full-beard shadow on cheeks/jaw with clean warm skin
    jy = math_node(n, l, 'MULTIPLY', smoothstep_node(n, l, Y, -0.45, -1.15), smoothstep_node(n, l, Y, -4.6, -3.9))
    jz = math_node(n, l, 'MULTIPLY', smoothstep_node(n, l, Z, 7.75, 7.05), smoothstep_node(n, l, Z, 3.6, 4.3))
    jm = math_node(n, l, 'MULTIPLY', math_node(n, l, 'MULTIPLY', jy, jz), 0.85)
    sb = math_node(n, l, 'MULTIPLY', math_node(n, l, 'MULTIPLY', smoothstep_node(n, l, Y, -0.45, -0.9), smoothstep_node(n, l, Y, -2.4, -1.9)),
                   math_node(n, l, 'MULTIPLY', smoothstep_node(n, l, Z, 8.9, 8.4), smoothstep_node(n, l, Z, 6.9, 7.4)))
    jm = math_node(n, l, 'MAXIMUM', jm, math_node(n, l, 'MULTIPLY', sb, 0.9))
    rp = n.new('ShaderNodeMix'); rp.data_type = 'RGBA'; l.new(jm, rp.inputs['Factor']); l.new(skincol, rp.inputs['A'])
    rp.inputs['B'].default_value = lin(222, 150, 112); skincol = rp.outputs['Result']
    hm = n.new('ShaderNodeMix'); hm.data_type = 'RGBA'; l.new(dd, hm.inputs['Factor'])
    l.new(skincol, hm.inputs['A']); hm.inputs['B'].default_value = lin(112, 78, 52)
    l.new(hm.outputs['Result'], b.inputs['Base Color'])
    rr = math_node(n, l, 'MULTIPLY_ADD', dd, 0.25, 0.42); l.new(rr, b.inputs['Roughness'])

def hair_material():
    m = mat('scalp_hair', lin(90, 62, 40), 0.5, **{'Sheen Weight': 0.15, 'Sheen Tint': (1, .8, .6, 1)})
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord')
    mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (16, 0.5, 16); l.new(tc.outputs['Object'], mp.inputs['Vector'])
    no = n.new('ShaderNodeTexNoise'); no.inputs['Scale'].default_value = 4; no.inputs['Detail'].default_value = 10; no.inputs['Roughness'].default_value = 0.7
    l.new(mp.outputs['Vector'], no.inputs['Vector'])
    cr = n.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    e[0].position = 0.3; e[0].color = lin(110, 74, 46); e[1].position = 0.75; e[1].color = lin(196, 140, 94)
    l.new(no.outputs['Fac'], cr.inputs['Fac']); l.new(cr.outputs['Color'], b.inputs['Base Color'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.6; bp.inputs['Distance'].default_value = 0.05
    l.new(no.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    at = n.new('ShaderNodeAttribute'); at.attribute_name = 'edge'; tr = n.new('ShaderNodeBsdfTransparent'); mx = n.new('ShaderNodeMixShader')
    al = smoothstep_node(n, l, at.outputs['Fac'], 0.0, 0.8)
    sx = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sx.inputs[0])
    zth = math_node(n, l, 'MULTIPLY_ADD', smoothstep_node(n, l, sx.outputs['Y'], 0.3, 2.0), -0.5, 9.05)
    zf = smoothstep_node(n, l, math_node(n, l, 'SUBTRACT', sx.outputs['Z'], zth), 0.05, 0.4)
    fr = smoothstep_node(n, l, sx.outputs['Y'], -2.3, -2.6)          # keep the front hairline crisp
    al = math_node(n, l, 'MINIMUM', al, math_node(n, l, 'MAXIMUM', zf, fr))
    l.new(al, mx.inputs[0]); l.new(tr.outputs[0], mx.inputs[1]); l.new(b.outputs[0], mx.inputs[2])
    l.new(mx.outputs[0], n['Material Output'].inputs['Surface'])
    return m

def scalp_region(c):
    x, y, z = c
    if z < 8.95 - 0.5 * smooth01(0.3, 2.0, y): return False
    if y < -2.45 and z < 10.35: return False
    return True

def hair_thickness(c):
    x, y, z = c
    top = smooth01(9.05, 10.4, z)
    quiff = smooth01(1.5, -2.5, y)                    # more volume towards the front (combed up and back)
    return top * (0.22 + 0.45 * quiff)

def build_hair_cap(sc, head):
    me = head.data.copy(); cap = bpy.data.objects.new('hair_cap', me); sc.collection.objects.link(cap)
    keep_faces(cap, scalp_region)
    bm = bmesh.new(); bm.from_mesh(me); bm.normal_update()
    import heapq
    dist = {v: (0.0 if v.is_boundary else 1e9) for v in bm.verts}; pq = [(0.0, v.index, v) for v in bm.verts if v.is_boundary]
    heapq.heapify(pq)
    while pq:
        d, _, v = heapq.heappop(pq)
        if d > dist[v]: continue
        for e in v.link_edges:
            w = e.other_vert(v); nd = d + e.calc_length()
            if nd < dist[w]: dist[w] = nd; heapq.heappush(pq, (nd, w.index, w))
    off = {v: v.normal * (0.015 + hair_thickness(v.co) * smooth01(0.0, 0.7, dist[v])) for v in bm.verts}
    for v in bm.verts: v.co = v.co + off[v]
    edge_vals = [min(1.0, dist[v] / 0.3) for v in bm.verts]
    bm.to_mesh(me); bm.free()
    at = me.attributes.new('edge', 'FLOAT', 'POINT')
    at.data.foreach_set('value', edge_vals)
    for p in me.polygons: p.use_smooth = True
    me.materials.clear(); me.materials.append(hair_material())
    sub = cap.modifiers.new('s', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
    return cap

def hair_strands(sc, cap, n):
    """Fine strands on the cap surface, combed back and slightly up, for a soft silhouette."""
    hm = mat('strand', lin(96, 66, 44), 0.4)
    return fur(sc, [cap], n, 0.32 * S, 0.03, hm, sweep=(0, 1.6, 0.3), jitter=0.25, seed=7)

def build_eyes(sc, head):
    """Open eyes: eyeball (white sclera + light blue iris) poking out of the closed lid, plus an upper lid."""
    white = mat('sclera', lin(196, 186, 180), 0.12, **{'Subsurface Weight': 0.2, 'Coat Weight': 0.6, 'Coat Roughness': 0.03})
    n, l = nodes(white); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord')
    gr = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], gr.inputs[0])
    # iris: object-local -Y axis points forward; iris = disc around it
    r = math_node(n, l, 'ARCTAN2', math_node(n, l, 'SQRT', math_node(n, l, 'ADD', math_node(n, l, 'POWER', gr.outputs['X'], 2), math_node(n, l, 'POWER', gr.outputs['Z'], 2))), math_node(n, l, 'MULTIPLY', gr.outputs['Y'], -1))
    iris = smoothstep_node(n, l, r, 0.85, 0.75); pupil = smoothstep_node(n, l, r, 0.24, 0.18)
    m1 = n.new('ShaderNodeMix'); m1.data_type = 'RGBA'; l.new(iris, m1.inputs['Factor']); m1.inputs['A'].default_value = lin(196, 186, 180); m1.inputs['B'].default_value = lin(120, 160, 185)
    m2 = n.new('ShaderNodeMix'); m2.data_type = 'RGBA'; l.new(pupil, m2.inputs['Factor']); l.new(m1.outputs['Result'], m2.inputs['A']); m2.inputs['B'].default_value = lin(12, 12, 14)
    l.new(m2.outputs['Result'], b.inputs['Base Color'])
    eyes = []
    for sx in (-1, 1):
        ok, hit, nr, fi = head.ray_cast(V((sx * 0.80, -10, 8.36)), V((0, 1, 0)))
        r = 0.31; cy = hit.y + r - EYE_OUT; print('EYE surface y', round(hit.y, 3), flush=True)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=r, location=(sx * 0.80, cy, 8.36))
        e = bpy.context.object; e.name = f'eyeball{sx}'; e.rotation_euler = (0, 0, math.radians(-sx * 8))
        for p in e.data.polygons: p.use_smooth = True
        e.data.materials.append(white); eyes.append(e)
    return eyes

def build_shirt(sc, bust):
    """Blue T-shirt: shell copied from the bust below a crew collar line, plus torso and shoulder volumes."""
    cm = mat('shirt', lin(80, 178, 228), 0.85, **{'Sheen Weight': 0.6, 'Sheen Roughness': 0.4, 'Sheen Tint': (0.8, 0.95, 1, 1)})
    n, l = nodes(cm); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord')
    # soft folds: stretched noise -> bump; fine weave
    mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.35, 0.35, 0.09); l.new(tc.outputs['Object'], mp.inputs['Vector'])
    fo = n.new('ShaderNodeTexNoise'); fo.inputs['Scale'].default_value = 1.4; fo.inputs['Detail'].default_value = 3
    l.new(mp.outputs['Vector'], fo.inputs['Vector'])
    wv = n.new('ShaderNodeTexNoise'); wv.inputs['Scale'].default_value = 60; l.new(tc.outputs['Object'], wv.inputs['Vector'])
    b1 = n.new('ShaderNodeBump'); b1.inputs['Strength'].default_value = 0.5; b1.inputs['Distance'].default_value = 1.5; l.new(fo.outputs['Fac'], b1.inputs['Height'])
    b2 = n.new('ShaderNodeBump'); b2.inputs['Strength'].default_value = 0.08; b2.inputs['Distance'].default_value = 0.05; l.new(wv.outputs['Fac'], b2.inputs['Height'])
    l.new(b1.outputs['Normal'], b2.inputs['Normal']); l.new(b2.outputs['Normal'], b.inputs['Normal'])
    parts = []
    # one smooth metaball volume: torso, both shoulders/upper sleeves, trapezius around the neck base
    mb = bpy.data.metaballs.new('shirt_mb'); mb.resolution = 0.12; mb.render_resolution = 0.08; mb.threshold = 0.6
    for co, r, size in SHIRT_BLOBS:
        e = mb.elements.new(); e.type = 'ELLIPSOID'; e.co = co; e.radius = r; e.size_x, e.size_y, e.size_z = size; e.stiffness = 2.0
    mo = bpy.data.objects.new('shirt_mb', mb); sc.collection.objects.link(mo); bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(mo.evaluated_get(dg))
    bpy.data.objects.remove(mo); sh = bpy.data.objects.new('shirt', me); sc.collection.objects.link(sh)
    for p in me.polygons: p.use_smooth = True
    print('SHIRT bbox', [round(min(v.co[i] for v in me.vertices), 2) for i in range(3)], [round(max(v.co[i] for v in me.vertices), 2) for i in range(3)], flush=True)
    parts.append(sh)
    # fitted shell on the neck base (bust copy below the crew-neck line), flaring out at its bottom into the volume
    me2 = bust.data.copy(); sh2 = bpy.data.objects.new('shirt_shell', me2); sc.collection.objects.link(sh2)
    keep_faces(sh2, lambda c: 0.6 < c.z < 3.55 + 0.9 * smooth01(-2.2, 1.6, c.y))
    bm = bmesh.new(); bm.from_mesh(me2); bm.normal_update()
    off = {v: v.normal * (0.1 + 0.9 * smooth01(3.2, 1.0, v.co.z)) for v in bm.verts}
    for v in bm.verts: v.co = v.co + off[v]
    bm.to_mesh(me2); bm.free()
    for p in me2.polygons: p.use_smooth = True
    so = sh2.modifiers.new('solid', 'SOLIDIFY'); so.thickness = 0.1; so.offset = -1; so.use_rim = True
    parts.append(sh2)
    # collar rib
    bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.09, major_segments=96, minor_segments=12)
    col = bpy.context.object; col.name = 'collar'
    bm = bmesh.new(); bm.from_mesh(col.data)
    for v in bm.verts:
        a = math.atan2(v.co.y, v.co.x); y = v.co.y
        v.co.x *= 1.75; v.co.y = v.co.y * 1.75 + 0.15; v.co.z += 3.55 + 0.9 * smooth01(-2.2, 1.6, v.co.y) + 0.05
    bm.to_mesh(col.data); bm.free()
    for p in col.data.polygons: p.use_smooth = True
    parts.append(col)
    for o in parts: o.data.materials.clear(); o.data.materials.append(cm)
    return parts

def build_man(sc, loc=(0, 0, 0)):
    ms = import_man(sc)
    head = ms['defaultMaterial.003']; beard = [ms[k] for k in ('defaultMaterial', 'defaultMaterial.001', 'defaultMaterial.002', 'defaultMaterial.004')]
    head_material(head.data.materials[0])
    for o in beard:  # goatee + moustache only (reference): drop cheek/jaw/sideburn beard
        keep_faces(o, lambda c: c.y < -2.85 and abs(c.x) < 1.25 and 4.72 < c.z < 7.4)
        for m in o.data.materials:
            unlink(m, 'Metallic'); m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0
            unlink(m, 'Emission Color'); m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0
            bb = m.node_tree.nodes['Principled BSDF']; src = bb.inputs['Base Color'].links[0].from_socket
            dk = m.node_tree.nodes.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.blend_type = 'MULTIPLY'; dk.inputs['Factor'].default_value = 1
            dk.inputs['B'].default_value = (0.55, 0.5, 0.48, 1); m.node_tree.links.new(src, dk.inputs['A']); m.node_tree.links.new(dk.outputs['Result'], bb.inputs['Base Color'])
    cap = build_hair_cap(sc, head); eyes = build_eyes(sc, head); shirt = build_shirt(sc, head)
    root = bpy.data.objects.new('MAN', None); sc.collection.objects.link(root)
    for o in [head, cap, *beard, *eyes, *shirt]: o.parent = root
    root.rotation_euler = (0, 0, math.radians(90)); root.scale = (S, S, S); root.location = V(loc) + V((0, 0, 3.2))
    bpy.context.view_layer.update()
    if not FAST: strands = hair_strands(sc, cap, 30000)
    return root, head

def model_to_world(root, p): return root.matrix_world @ V(p)

# ───────────────────────── skin dome (bare upper arm) ─────────────────────────
def dome_material():
    m = mat('armskin', lin(224, 150, 110), 0.48, **{'Subsurface Weight': 0.3, 'Subsurface Radius': (1, .5, .35), 'Subsurface Scale': 0.6,
                                                     'Specular IOR Level': 0.4, 'Coat Weight': 0.0})
    n, l = nodes(m); b = n['Principled BSDF']; o = n['Material Output']; tc = n.new('ShaderNodeTexCoord')
    # elongated smooth bumps (laterally stretched cells) + wavy ridges, like the reference's rippled skin
    mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.22, 1.0, 1.0); l.new(tc.outputs['Object'], mp.inputs['Vector'])
    vo = n.new('ShaderNodeTexVoronoi'); vo.feature = 'SMOOTH_F1'; vo.inputs['Scale'].default_value = DOME_CELL; vo.inputs['Randomness'].default_value = 1
    vo.inputs['Smoothness'].default_value = 0.6; l.new(mp.outputs['Vector'], vo.inputs['Vector'])
    wv = n.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'; wv.inputs['Scale'].default_value = DOME_CELL * 0.08
    wv.inputs['Distortion'].default_value = 7; wv.inputs['Detail'].default_value = 2; wv.inputs['Detail Scale'].default_value = 1.5
    l.new(tc.outputs['Object'], wv.inputs['Vector'])
    pores = n.new('ShaderNodeTexVoronoi'); pores.inputs['Scale'].default_value = 22; l.new(tc.outputs['Object'], pores.inputs['Vector'])
    fine = n.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 9; fine.inputs['Detail'].default_value = 6; l.new(tc.outputs['Object'], fine.inputs['Vector'])
    h = math_node(n, l, 'MULTIPLY_ADD', vo.outputs['Distance'], 1.0, math_node(n, l, 'MULTIPLY', wv.outputs['Fac'], 0.35))
    disp = n.new('ShaderNodeDisplacement'); disp.inputs['Scale'].default_value = DOME_DISP; disp.inputs['Midlevel'].default_value = 0.5
    l.new(h, disp.inputs['Height']); l.new(disp.outputs['Displacement'], o.inputs['Displacement'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.07; bp.inputs['Distance'].default_value = 0.08
    l.new(pores.outputs['Distance'], bp.inputs['Height'])
    bp2 = n.new('ShaderNodeBump'); bp2.inputs['Strength'].default_value = 0.06; bp2.inputs['Distance'].default_value = 0.1
    l.new(fine.outputs['Fac'], bp2.inputs['Height']); l.new(bp.outputs['Normal'], bp2.inputs['Normal']); l.new(bp2.outputs['Normal'], b.inputs['Normal'])
    # mottle
    mo = n.new('ShaderNodeTexNoise'); mo.inputs['Scale'].default_value = 0.35; l.new(tc.outputs['Object'], mo.inputs['Vector'])
    cr = n.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = lin(172, 124, 106); cr.color_ramp.elements[1].color = lin(190, 140, 120)
    cr.color_ramp.elements[0].position = 0.35; cr.color_ramp.elements[1].position = 0.7
    l.new(mo.outputs['Fac'], cr.inputs['Fac']); l.new(cr.outputs['Color'], b.inputs['Base Color'])
    m.displacement_method = 'BOTH'
    return m

def build_dome(sc, F, nrm, R, half=(70, 70), res=160):
    """Patch of a sphere of radius R tangent at F with normal nrm, adaptive-subdivided + displaced."""
    nrm = V(nrm).normalized(); ctr = V(F) - nrm * R
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res, y_subdivisions=res, size=1); g = bpy.context.object; g.name = 'dome'
    q = nrm.to_track_quat('Z', 'Y')
    for v in g.data.vertices:
        u, w = v.co.x * 2 * half[0], v.co.y * 2 * half[1]
        d = (q @ V((u, w, 0))) + V(F) - ctr
        v.co = ctr + d.normalized() * R
    for p in g.data.polygons: p.use_smooth = True
    g.data.materials.append(dome_material())
    sub = g.modifiers.new('sub', 'SUBSURF'); sub.subdivision_type = 'SIMPLE'
    g.cycles.use_adaptive_subdivision = True
    return g

def dome_hairs(sc, dome, n):
    hm = mat('armhair', lin(120, 78, 50), 0.4)
    return fur(sc, [dome], n, 0.9, 0.012, hm, sweep=(0.9, 0.0, 0.0), jitter=0.3, seed=11)

# ───────────────────────── shot ─────────────────────────
CAM = V((9.3, -94.5, 9.5))
FLYP = V((9.3, -62.5, 10.65))

def cam_at(f):
    """camera position / aim for global frame f (slow drift 1.0->1.4 s, faster arrival before 1.0 s)."""
    t = (f - 1) / 30
    k = [(0.80, V((-6, 10, 3.5)), V((-3, 2, 1.5))), (0.90, V((-3, 5, 1.6)), V((-1.5, 1, 0.7))), (1.00, V((0, 0, 0)), V((0, 0, 0))),
         (1.50, V((1.2, -1.0, -0.4)), V((0.6, 0, 0)))]
    for (t0, p0, a0), (t1, p1, a1) in zip(k, k[1:]):
        if t <= t1 or (t1 == k[-1][0]):
            u = max(0, min(1, (t - t0) / (t1 - t0))); return p0.lerp(p1, u), a0.lerp(a1, u)

def sun(sc, name, frm, energy, color, angle=10):
    d = bpy.data.lights.new(name, 'SUN'); d.energy = energy; d.angle = math.radians(angle); d.color = color
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o)
    o.rotation_euler = (-V(frm)).to_track_quat('-Z', 'Y').to_euler(); return o

def main():
    sc = reset()
    sc.cycles.feature_set = 'EXPERIMENTAL'; sc.cycles.dicing_rate = 1.0 if not FAST else 3.0
    man, head = build_man(sc)
    nrm = V((0.19, -0.035, 0.98)).normalized()
    dome = build_dome(sc, FLYP - nrm * 0.12, nrm, 90)
    fly, parts, M = load_fly(sc)
    fwd = V((1, 0.25, 0)); fwd = (fwd - nrm * fwd.dot(nrm)).normalized()
    yax = -fwd; xax = yax.cross(nrm)
    fly.rotation_euler = Matrix((xax, yax, nrm)).transposed().to_euler(); fly.location = FLYP; fly.scale = (1.15,) * 3
    bpy.context.view_layer.update()
    if not FAST:
        fly_fur(sc, fly, M); dome_hairs(sc, dome, 1500)
    os.makedirs(OUT, exist_ok=True)
    sc.render.resolution_x = int(1440 * RES / 100); sc.render.resolution_y = int(2560 * RES / 100); sc.render.resolution_percentage = 100
    sc.cycles.samples = SPP
    sky(sc, CAM, CAM + V((9, 100, 16)), light_frac=0.3)
    ramp = [nd for nd in sc.world.node_tree.nodes if nd.type == 'VALTORGB'][0].color_ramp
    ramp.elements[0].color = lin(40, 158, 204)
    for e in ramp.elements:
        if abs(e.position - 0.955) < 1e-3: e.color = lin(48, 160, 204)
        if abs(e.position - 0.988) < 1e-3: e.color = lin(92, 172, 206)
        if e.position > 0.999: e.color = lin(158, 198, 216)
    sun(sc, 'key', (0.7, -0.9, 1.5), 5.0, (1, .9, .8), 12)        # warm, front-right, camera side: lights the face
    sun(sc, 'fill', (-1.0, -0.9, 0.35), 0.8, (1, .9, .8), 20)    # soft fill from camera-left: back of head / shirt
    sun(sc, 'rim', (-0.3, 1.0, 0.22), 4.0, (.85, .95, 1), 6)      # from behind: bright skin horizon, neck rim
    for f in range(FS, FE + 1):
        dp, da = cam_at(f)
        cl = CAM + dp; tgt = FLYP + V((0.6, 0, 0.75)) + da
        camera(sc, cl, tgt, lens=35, fstop=0.7, focus=(FLYP - cl).length)
        sc.frame_set(f)
        t0 = time.time(); sc.render.filepath = os.path.join(OUT, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True)
        print('FRAME', f, 'TIME', round(time.time() - t0, 1), flush=True)

from mathutils import Matrix
main()
