# Shot "it presses / six needle like tools" (global frames 57-114, 1.9-3.8 s).
# Extreme macro under the fly at skin level: huge glossy black jointed legs, dark belly above, long amber
# serrated mouthpart blades reaching down to the skin; one blade at a time pulses bright yellow.
# usage: blender -b --python shot_blades.py -- out_dir res_percent spp frame_start frame_end
import sys, os, math, time, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
import bmesh, mathutils
from mathutils import noise, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if len(argv) > 0 else '/tmp/blades'
RES = int(argv[1]) if len(argv) > 1 else 50
SPP = int(argv[2]) if len(argv) > 2 else 32
FS = int(argv[3]) if len(argv) > 3 else 79
FE = int(argv[4]) if len(argv) > 4 else FS

sc = reset()
rnd = random.Random(7)

def smootherstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * t * (t * (t * 6 - 15) + 10)

def link(o, parent=None):
    if o.name not in sc.collection.objects: sc.collection.objects.link(o)
    if parent: o.parent = parent
    return o

def mesh_obj(name, verts, faces, mat_=None, smooth=True, parent=None, attrs=None):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if smooth: me.shade_smooth()
    for an, vals in (attrs or {}).items():
        a = me.attributes.new(an, 'FLOAT', 'POINT'); a.data.foreach_set('value', vals)
    o = bpy.data.objects.new(name, me); link(o, parent)
    if mat_: me.materials.append(mat_)
    return o

def subsurf(o, lv=1):
    m = o.modifiers.new('ss', 'SUBSURF'); m.levels = lv; m.render_levels = lv; return m

# ───────────────────────────── materials ─────────────────────────────
def chitin_mat(name, base, light, rough=0.32, crinkle=1.0, scale=1.0):
    """Glossy black chitin like crumpled foil: ridged (abs) noise creases at two scales as bump, a sharp clear coat
    that picks up long streaky highlights, faint grey mottling in the creases."""
    m = mat(name, base, rough, **{'Coat Weight': 1.0, 'Coat Roughness': 0.05, 'Coat IOR': 1.55, 'Specular IOR Level': 0.6})
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord')
    def ridged(sc_, dist):
        nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = sc_; nz.inputs['Detail'].default_value = 3
        nz.inputs['Distortion'].default_value = dist; l.new(tc.outputs['Object'], nz.inputs['Vector'])
        m1 = n.new('ShaderNodeMath'); m1.operation = 'SUBTRACT'; m1.inputs[1].default_value = 0.5; l.new(nz.outputs['Fac'], m1.inputs[0])
        m2 = n.new('ShaderNodeMath'); m2.operation = 'ABSOLUTE'; l.new(m1.outputs[0], m2.inputs[0])
        m3 = n.new('ShaderNodeMath'); m3.operation = 'POWER'; m3.inputs[1].default_value = 0.6; l.new(m2.outputs[0], m3.inputs[0])
        return m3.outputs[0], nz
    r1, nz1 = ridged(6 * scale, 1.5); r2, _ = ridged(17 * scale, 1.0)
    fn = n.new('ShaderNodeTexNoise'); fn.inputs['Scale'].default_value = 140 * scale; fn.inputs['Detail'].default_value = 4
    l.new(tc.outputs['Object'], fn.inputs['Vector'])
    prev = None
    for src, st, dist in ((r1, 0.4 * crinkle, 0.03), (r2, 0.22 * crinkle, 0.012), (fn.outputs['Fac'], 0.06 * crinkle, 0.003)):
        bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = st; bp.inputs['Distance'].default_value = dist
        l.new(src, bp.inputs['Height'])
        if prev: l.new(prev.outputs['Normal'], bp.inputs['Normal'])
        prev = bp
    l.new(prev.outputs['Normal'], b.inputs['Normal']); l.new(prev.outputs['Normal'], b.inputs['Coat Normal'])
    cr = n.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = light; cr.color_ramp.elements[0].position = 0.0
    cr.color_ramp.elements[1].color = base; cr.color_ramp.elements[1].position = 0.12
    l.new(r2, cr.inputs['Fac']); l.new(cr.outputs['Color'], b.inputs['Base Color'])
    rr = n.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = rough * 0.7; rr.inputs['To Max'].default_value = rough * 1.4
    l.new(nz1.outputs['Fac'], rr.inputs['Value']); l.new(rr.outputs['Result'], b.inputs['Roughness'])
    return m

def blade_mat(name, base_lo, base_hi):
    m = mat(name, base_lo, 0.3, **{'Subsurface Weight': 0.6, 'Subsurface Radius': (1.0, 0.55, 0.2), 'Subsurface Scale': 0.02,
                                    'Transmission Weight': 0.12, 'Coat Weight': 0.8, 'Coat Roughness': 0.12,
                                    'Specular IOR Level': 0.45, 'Emission Color': (1.0, 0.92, 0.05, 1), 'Emission Strength': 0.0})
    n, l = nodes(m); b = n['Principled BSDF']
    au = n.new('ShaderNodeAttribute'); au.attribute_name = 'u'           # -1..1 across the width
    at = n.new('ShaderNodeAttribute'); at.attribute_name = 'tooth'       # 0..1 on the serration
    al = n.new('ShaderNodeAttribute'); al.attribute_name = 'v'           # 0 root .. 1 tip
    mr = n.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1; mr.inputs['From Max'].default_value = 1
    l.new(au.outputs['Fac'], mr.inputs['Value'])
    cr = n.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    e[0].position = 0.0; e[0].color = base_lo; e[1].position = 1.0; e[1].color = base_hi
    l.new(mr.outputs['Result'], cr.inputs['Fac'])
    # soft lengthwise mottling so the surface is not a flat plastic fill
    tc = n.new('ShaderNodeTexCoord'); nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9; nz.inputs['Detail'].default_value = 3
    l.new(tc.outputs['Object'], nz.inputs['Vector'])
    mo = n.new('ShaderNodeMix'); mo.data_type = 'RGBA'; mo.blend_type = 'OVERLAY'; mo.inputs['Factor'].default_value = 0.12
    l.new(cr.outputs['Color'], mo.inputs['A']); l.new(nz.outputs['Color'], mo.inputs['B'])
    tm = n.new('ShaderNodeMix'); tm.data_type = 'RGBA'; tm.inputs['B'].default_value = lin(255, 206, 120)
    tk = n.new('ShaderNodeMath'); tk.operation = 'MULTIPLY'; tk.inputs[1].default_value = 0.5; l.new(at.outputs['Fac'], tk.inputs[0]); l.new(tk.outputs[0], tm.inputs['Factor']); l.new(mo.outputs['Result'], tm.inputs['A'])
    # luminous edges (thin chitin lets light through) + darker core, brighter glowing tip
    ab = n.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; l.new(au.outputs['Fac'], ab.inputs[0])
    pw = n.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 4.0; l.new(ab.outputs[0], pw.inputs[0])
    core = n.new('ShaderNodeMix'); core.data_type = 'RGBA'; core.blend_type = 'MULTIPLY'; core.inputs['B'].default_value = (0.78, 0.66, 0.55, 1)
    om = n.new('ShaderNodeMath'); om.operation = 'SUBTRACT'; om.inputs[0].default_value = 1.0; l.new(ab.outputs[0], om.inputs[1])
    om2 = n.new('ShaderNodeMath'); om2.operation = 'MULTIPLY'; om2.inputs[1].default_value = 0.6; l.new(om.outputs[0], om2.inputs[0])
    l.new(om2.outputs[0], core.inputs['Factor']); l.new(tm.outputs['Result'], core.inputs['A'])
    rim = n.new('ShaderNodeMix'); rim.data_type = 'RGBA'; rim.inputs['B'].default_value = lin(255, 206, 120)
    l.new(pw.outputs[0], rim.inputs['Factor']); l.new(core.outputs['Result'], rim.inputs['A'])
    tp = n.new('ShaderNodeMapRange'); tp.inputs['From Min'].default_value = 0.86; tp.inputs['From Max'].default_value = 1.0
    tp.interpolation_type = 'SMOOTHSTEP'; l.new(al.outputs['Fac'], tp.inputs['Value'])
    tip = n.new('ShaderNodeMix'); tip.data_type = 'RGBA'; tip.inputs['B'].default_value = lin(255, 214, 130)
    tq = n.new('ShaderNodeMath'); tq.operation = 'MULTIPLY'; tq.inputs[1].default_value = 0.75; l.new(tp.outputs['Result'], tq.inputs[0])
    l.new(tq.outputs[0], tip.inputs['Factor']); l.new(rim.outputs['Result'], tip.inputs['A'])
    l.new(tip.outputs['Result'], b.inputs['Base Color'])
    # faint fine pits/bump
    nb = n.new('ShaderNodeTexNoise'); nb.inputs['Scale'].default_value = 60; nb.inputs['Detail'].default_value = 4
    l.new(tc.outputs['Object'], nb.inputs['Vector'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.08; bp.inputs['Distance'].default_value = 0.01
    l.new(nb.outputs['Fac'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    m['glow'] = 0.0
    return m

# ───────────────────────────── geometry ─────────────────────────────
def tube(name, pts, radii, mat_, nr=40, flat=1.0, lump=0.0, lump_scale=6.0, seed=0, parent=None, cap=True, twist_up=V((0, 0, 1))):
    """Tube along a dense polyline with a per-point radius; flattened cross-section and optional lumpy displacement."""
    verts, faces = [], []
    n = len(pts)
    for i in range(n):
        p = V(pts[i]); tng = (V(pts[min(i + 1, n - 1)]) - V(pts[max(i - 1, 0)])).normalized()
        side = tng.cross(twist_up).normalized(); up = side.cross(tng).normalized()
        for k in range(nr):
            a = 2 * math.pi * k / nr
            d = side * math.cos(a) + up * math.sin(a) * flat
            r = radii[i]
            if lump:
                q = (p + d * r) * lump_scale + V((seed * 3.1, seed * 1.7, 0))
                r *= 1 + lump * noise.noise(q)
            verts.append(tuple(p + d * r))
    for i in range(n - 1):
        for k in range(nr):
            a = i * nr + k; b = i * nr + (k + 1) % nr
            faces.append((a, b, b + nr, a + nr))
    if cap:
        verts.append(tuple(V(pts[0]))); verts.append(tuple(V(pts[-1]))); c0, c1 = len(verts) - 2, len(verts) - 1
        for k in range(nr):
            faces.append((c0, (k + 1) % nr, k)); faces.append((c1, (n - 1) * nr + k, (n - 1) * nr + (k + 1) % nr))
    return mesh_obj(name, verts, faces, mat_, parent=parent)

def bez(p0, p1, p2, n):
    return [V(p0) * (1 - t) ** 2 + V(p1) * 2 * t * (1 - t) + V(p2) * t * t for t in (i / (n - 1) for i in range(n))]

def blade(name, L, W, T, mat_, serr=0, teeth=80, tooth_h=0.012, t_serr=(0.25, 0.92), tip=0.28, bend=0.06, cup=0.05,
          tipround=0.8, nl=900, nr=28, parent=None):
    """Long flat leaf/dagger blade: spine from root (0,0,0) down to (0,0,-L), width on X, thickness on Y.
    `serr` = +1/-1 puts a row of fine rounded teeth on that edge."""
    verts, faces = [], []; U, TOO, VV = [], [], []
    for i in range(nl):
        t = i / (nl - 1)
        # width profile: slight swell, long parallel section, then a tapering point
        w = W * (0.82 + 0.18 * math.sin(math.pi * min(1, t / 0.6)))
        if t > 1 - tip:
            s = (1 - t) / tip; w *= s ** tipround
        th = T * max(w / W, 0.08) ** 0.6
        cx = bend * L * math.sin(math.pi * t * 0.9)          # gentle sideways curve
        z = -L * t
        for k in range(nr):
            a = 2 * math.pi * k / nr; ca, sa = math.cos(a), math.sin(a)
            x = 0.5 * w * math.copysign(abs(ca) ** 0.55, ca)
            un = x / (0.5 * W)
            tooth = 0.0
            if serr and t_serr[0] < t < t_serr[1] and ca * serr > 0.55:
                ph = (t - t_serr[0]) * teeth / (t_serr[1] - t_serr[0]) % 1.0
                g = math.sin(math.pi * min(1.0, ph / 0.8)) ** 0.8 if ph < 0.8 else 0.0   # rounded tooth + small gap
                fade = smootherstep(t_serr[0], t_serr[0] + 0.05, t) * (1 - smootherstep(t_serr[1] - 0.05, t_serr[1], t))
                wgt = (abs(ca) - 0.55) / 0.45
                tooth = g * fade * wgt
                x += serr * tooth_h * tooth * min(1, w / W * 2)
            y = 0.5 * th * sa + cup * W * (un ** 2)
            verts.append((x + cx, y, z)); U.append(un); TOO.append(tooth); VV.append(t)
    for i in range(nl - 1):
        for k in range(nr):
            a = i * nr + k; b = i * nr + (k + 1) % nr; faces.append((a, a + nr, b + nr, b))
    verts.append((0, 0, 0.0)); U.append(0); TOO.append(0); VV.append(0); c0 = len(verts) - 1
    for k in range(nr): faces.append((c0, k, (k + 1) % nr))
    o = mesh_obj(name, verts, faces, mat_, parent=parent, attrs={'u': U, 'tooth': TOO, 'v': VV})
    return o

def ellip(name, loc, scale, mat_, rot=(0, 0, 0), parent=None, seg=64, rings=40):
    return ellipsoid(sc, name, loc, scale, mat_, parent, rot=rot, seg=seg, rings=rings)

# ───────────────────────────── camera rig & screen-space placement ─────────────────────────────
# Everything is laid out from the reference frames: a point is given as (screen x, screen y, depth) under the
# camera of a key frame (x,y in 0..1 from top-left, depth along the view axis), or as (x, y) on the skin.
SKIN_R = 20.0; CAM_H = 0.13; LENS = 30.0
TW, TH = 18 / LENS * 1440 / 2560, 18 / LENS      # tan of half FOV (sensor fit = height for portrait)
def skz(x, y): return skin_z(x, y, SKIN_R)
CAM = {  # frame: (x, yaw deg, pitch deg)  camera trucks/yaws slowly; y fixed on the skin crest
    61: (0.10, 13.0, 9.5), 70: (0.05, 6.0, 9.5), 79: (0.0, 0.0, 9.5), 91: (0.05, 2.5, 9.5), 103: (0.12, -2.5, 9.0),
    114: (0.16, -4.5, 8.8)}
def cam_pose(f):
    ks = sorted(CAM); f = max(ks[0], min(ks[-1], f))
    for a, b in zip(ks, ks[1:]):
        if a <= f <= b: break
    s = (f - a) / (b - a) if b > a else 0; s = s * s * (3 - 2 * s) * 0.35 + s * 0.65
    x, yw, p = [CAM[a][i] + (CAM[b][i] - CAM[a][i]) * s for i in range(3)]
    y = -1.0 - 0.0 * s; loc = V((x, y, skz(x, y) + CAM_H))
    yw, p = math.radians(yw), math.radians(p)
    fwd = V((math.sin(yw) * math.cos(p), math.cos(yw) * math.cos(p), math.sin(p)))
    right = V((math.cos(yw), -math.sin(yw), 0)); up = right.cross(fwd)
    return loc, fwd, right, up
def W(key, sx, sy, depth=None):
    loc, fwd, right, up = cam_pose(key)
    d = fwd + right * (2 * sx - 1) * TW + up * (1 - 2 * sy) * TH
    if depth is not None: return loc + d * depth
    t = 0.05                                     # march to the skin
    while t < 60:
        p = loc + d * t
        if p.z <= skz(p.x, p.y): return p
        t += 0.01
    return loc + d * 60
def SW(key, frac, depth): return frac * 2 * TW * depth   # screen-width fraction -> world size at a depth

# ───────────────────────────── fly body & legs ─────────────────────────────
ROOT_ = bpy.data.objects.new('RIG', None); link(ROOT_)
leg_m = chitin_mat('leg', lin(16, 16, 17), lin(60, 60, 62), rough=0.3, crinkle=1.0, scale=1.0)
belly_m = chitin_mat('belly', lin(22, 20, 19), lin(96, 92, 88), rough=0.34, crinkle=1.0, scale=0.8)
hairm = mat('hair', lin(10, 10, 10), 0.35, **{'Coat Weight': 0.4})
K = 79
def leg(name, a, b, R, n=160, flat=0.72, shape='femur', seed=0):
    pts = bez(a, (a + b) / 2 + V((0, 0, 0.04)), b, n)
    if shape == 'femur':   # long almond: thick body, rounded ends
        rr = [R * (0.42 + 0.62 * math.sin(math.pi * min(1, 0.04 + 0.97 * i / (n - 1))) ** 0.5) * (1 - 0.28 * i / (n - 1)) for i in range(n)]
    else:
        rr = [R * (1 - 0.25 * i / (n - 1)) for i in range(n)]
    o = tube(name, pts, rr, leg_m, nr=64, flat=flat, lump=0.035, lump_scale=7, seed=seed, parent=ROOT_)
    subsurf(o, 1); return o
legs, thin = [], []
# near femur crossing the frame (body at left, knee at right) + a second femur behind/above it
F1a, F1b = W(K, -0.35, 0.37, 1.55), W(K, 0.84, 0.455, 1.95)
legs.append(leg('femur1', F1a, F1b, SW(K, 0.27, 1.7), seed=1))
F2a, F2b = W(K, 0.05, 0.23, 2.6), W(K, 0.66, 0.30, 2.75)
legs.append(leg('femur2', F2a, F2b, SW(K, 0.085, 2.7), seed=2))
F3a, F3b = W(K, 0.5, 0.27, 2.4), W(K, 1.02, 0.42, 2.2)
legs.append(leg('femur3', F3a, F3b, SW(K, 0.15, 2.25), seed=3))
# tibia + tarsus of the near leg standing on the skin
kn = W(K, 0.80, 0.5, 2.0); ft = W(K, 0.88, 0.0, 2.25); ft.z = skz(ft.x, ft.y) + 0.012
def tibia(name, kn, ft, r):
    tb = kn + (ft - kn) * 0.72
    t_ = tube(name, bez(kn, (kn + tb) / 2 + V((0.01, 0, 0.0)), tb, 80), [r * (1.1 - 0.2 * i / 79) for i in range(80)], leg_m, nr=24, parent=ROOT_)
    out = [t_]
    for s in range(5):   # tarsomeres
        a = tb + (ft - tb) * (s / 5); b = tb + (ft - tb) * ((s + 0.98) / 5); rs = r * (0.9 - 0.07 * s)
        out.append(tube(f'{name}_t{s}', bez(a, (a + b) / 2, b, 10), [rs * (0.85 + 0.15 * math.sin(math.pi * j / 9)) for j in range(10)], leg_m, nr=16, parent=ROOT_))
    for sg in (-1, 1):   # claws
        c0 = ft + V((0, 0, 0.004)); c1 = ft + V((sg * r * 1.6, -r * 1.2, -0.004))
        out.append(tube(f'{name}_c{sg}', bez(c0, (c0 + c1) / 2 + V((0, 0, r)), c1, 8), [r * 0.45 * (1 - j / 8) for j in range(8)], leg_m, nr=10, parent=ROOT_))
    return out
thin += tibia('tibia1', kn, ft, SW(K, 0.012, 2.1))
# far legs on the left/top
thin += tibia('tibia2', W(K, 0.1, 0.27, 3.0), W(K, -0.15, 0.0, 3.3) * 0 + (lambda p: V((p.x, p.y, skz(p.x, p.y) + 0.01)))(W(K, -0.2, 0, 3.3)), SW(K, 0.012, 3.0))
# belly: dark wrinkled mass upper right (thorax underside + coxae)
def blobs(name, elems, mat_, res=0.025, lump=0.04):
    """Merged organic mass from metaball ellipsoids -> mesh, with lumpy displacement."""
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res; mb.threshold = 0.6
    for c, r, rot in elems:
        e = mb.elements.new(); e.type = 'ELLIPSOID'; e.co = c; e.radius = 1.0
        e.size_x, e.size_y, e.size_z = r; e.rotation = mathutils.Euler(rot).to_quaternion()
    ob = bpy.data.objects.new(name + '_mb', mb); link(ob); bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(ob); o = bpy.data.objects.new(name, me); link(o, ROOT_); me.shade_smooth(); me.materials.append(mat_)
    tx = bpy.data.textures.new(name + 'tx', 'CLOUDS'); tx.noise_scale = 0.12; tx.noise_depth = 3
    d = o.modifiers.new('lump', 'DISPLACE'); d.texture = tx; d.strength = lump; d.mid_level = 0.5; d.texture_coords = 'GLOBAL'
    return o
belly = []
tx = bpy.data.textures.new('bellytx', 'CLOUDS'); tx.noise_scale = 0.35; tx.noise_depth = 2
for nm_, sx, sy, d, sz, rot in (('thx', 0.85, 0.0, 3.0, (0.95, 0.7, 0.5), (0, 0.3, 0.2)),
                                ('stern', 0.88, 0.17, 2.75, (0.7, 0.5, 0.26), (0.35, 0.1, 0.35)),
                                ('cox2', 1.0, 0.33, 2.45, (0.32, 0.2, 0.28), (0.6, 0.2, -0.3)),
                                ('abd', 0.35, -0.12, 3.8, (0.75, 0.85, 0.5), (0, 0, 0))):
    o = ellip(nm_, tuple(W(K, sx, sy, d)), sz, belly_m, rot=rot, parent=ROOT_)
    dm = o.modifiers.new('lump', 'DISPLACE'); dm.texture = tx; dm.strength = 0.2; dm.texture_coords = 'GLOBAL'
    belly.append(o)
legs += belly
# palps (silvery, spotted), only seen at the start (2.0-2.3 s) at the top of the frame
palp_m = mat('palp', lin(105, 105, 108), 0.22, **{'Coat Weight': 1.0, 'Coat Roughness': 0.05, 'Specular IOR Level': 0.7})
n_, l_ = nodes(palp_m); b_ = n_['Principled BSDF']; tc_ = n_.new('ShaderNodeTexCoord')
vr_ = n_.new('ShaderNodeTexVoronoi'); vr_.inputs['Scale'].default_value = 14; l_.new(tc_.outputs['Object'], vr_.inputs['Vector'])
nz_ = n_.new('ShaderNodeTexNoise'); nz_.inputs['Scale'].default_value = 60; nz_.inputs['Detail'].default_value = 8; l_.new(tc_.outputs['Object'], nz_.inputs['Vector'])
cr_ = n_.new('ShaderNodeValToRGB'); cr_.color_ramp.elements[0].position = 0.05; cr_.color_ramp.elements[0].color = lin(25, 25, 27)
cr_.color_ramp.elements[1].position = 0.09; cr_.color_ramp.elements[1].color = lin(160, 160, 162); l_.new(vr_.outputs['Distance'], cr_.inputs['Fac'])
mx_ = n_.new('ShaderNodeMix'); mx_.data_type = 'RGBA'; mx_.blend_type = 'MULTIPLY'; mx_.inputs['Factor'].default_value = 0.75
l_.new(cr_.outputs['Color'], mx_.inputs['A']); l_.new(nz_.outputs['Color'], mx_.inputs['B']); l_.new(mx_.outputs['Result'], b_.inputs['Base Color'])
P0, P1 = W(61, 0.66, -0.25, 1.6), W(61, 0.62, 0.32, 1.7)
pp = bez(P0, (P0 + P1) / 2 + V((0.12, -0.05, 0.05)), P1, 120)
pr = [SW(61, 0.2, 1.6) * (math.sin(math.pi * min(1, 0.3 + 0.75 * i / 119)) ** 0.9) * (1 - 0.15 * (i / 119)) + 0.004 for i in range(120)]
po = tube('palp', pp, pr, palp_m, nr=48, flat=0.7, lump=0.04, lump_scale=12, parent=ROOT_); subsurf(po, 1)
nb_ = n_.new('ShaderNodeTexNoise'); nb_.inputs['Scale'].default_value = 90; nb_.inputs['Detail'].default_value = 6; l_.new(tc_.outputs['Object'], nb_.inputs['Vector'])
bb_ = n_.new('ShaderNodeBump'); bb_.inputs['Strength'].default_value = 0.25; l_.new(nb_.outputs['Fac'], bb_.inputs['Height']); l_.new(bb_.outputs['Normal'], b_.inputs['Normal'])

# ───────────────────────────── blades ─────────────────────────────
# (name, W world, T, serr side, tip len, tipround, lo/hi colour, keys {frame: (root sx,sy,depth), (tip sx,sy[,depth])})
BL = [
    ('mand_L', 0.1, 0.013, -1, 0.2, 0.9, lin(222, 116, 40), lin(244, 160, 70),
     {61: ((0.97, -0.03, 1.5), (0.42, 0.63, 1.7)), 70: ((0.95, -0.03, 1.4), (0.29, 0.69, 1.6)),
      79: ((0.32, -0.05, 1.3), (-0.12, 0.62, 1.4)), 91: ((0.0, -0.05, 1.3), (-0.4, 0.6, 1.4))}),
    ('stylet', 0.072, 0.01, 0, 0.3, 1.0, lin(228, 130, 46), lin(248, 176, 84),
     {61: ((0.99, -0.03, 1.5), (0.83, 0.63, 1.6)), 70: ((0.99, -0.03, 1.4), (0.97, 0.7, 1.5)),
      79: ((0.66, -0.05, 1.35), (0.40, 0.745, 1.5)), 91: ((0.2, -0.05, 1.5), (-0.05, 0.3, 1.5)), 103: ((-0.1, -0.05, 1.5), (-0.3, 0.3, 1.5))}),
    ('labrum', 0.14, 0.02, 0, 0.11, 0.3, lin(206, 102, 38), lin(240, 160, 78),
     {61: ((1.08, -0.03, 1.2), (1.03, 0.75, 1.25)), 79: ((1.03, -0.05, 1.1), (0.985, 0.82)),
      91: ((0.62, -0.1, 0.6), (0.55, 0.91)), 103: ((0.05, -0.05, 1.0), (-0.2, 0.4, 1.0))}),
    ('max_L', 0.12, 0.014, 0, 0.22, 0.8, lin(232, 142, 58), lin(252, 196, 108),
     {61: ((1.3, -0.03, 1.2), (1.25, 0.8, 1.2)), 79: ((1.15, -0.05, 1.0), (1.2, 0.85)),
      91: ((0.42, -0.05, 1.0), (0.0, 0.87)), 103: ((0.12, -0.05, 0.9), (0.01, 0.9))}),
    ('hypo', 0.075, 0.011, 0, 0.3, 0.9, lin(232, 140, 52), lin(250, 186, 92),
     {61: ((1.3, -0.03, 1.5), (1.2, 0.8, 1.5)), 79: ((1.25, -0.05, 1.5), (1.15, 0.8, 1.5)),
      91: ((0.6, -0.05, 1.6), (0.65, 0.85)), 103: ((0.45, -0.05, 1.4), (0.52, 0.9))}),
    ('mand_R', 0.09, 0.012, -1, 0.2, 0.9, lin(220, 112, 38), lin(242, 156, 66),
     {61: ((1.4, -0.03, 1.3), (1.4, 0.6, 1.3)), 79: ((1.3, -0.05, 1.3), (1.35, 0.6, 1.3)),
      91: ((0.84, -0.05, 1.3), (1.05, 0.55, 1.5)), 103: ((0.9, -0.05, 1.0), (1.05, 0.3, 1.0))}),
]
def key_points(keys):
    out = {}
    for f, (r, t) in keys.items():
        out[f] = (W(f, *r), W(f, *t) if len(t) == 3 else W(f, t[0], t[1]) + V((0, 0, 0.01)))
    return out
def interp(kp, f):
    ks = sorted(kp)
    if f <= ks[0]: return kp[ks[0]]
    if f >= ks[-1]:  # keep drifting a little with the last velocity
        if len(ks) < 2: return kp[ks[-1]]
        a, b = ks[-2], ks[-1]; s = (f - b) / (b - a) * 0.5
        return tuple(kp[b][i] + (kp[b][i] - kp[a][i]) * s for i in range(2))
    i = max(j for j in range(len(ks)) if ks[j] <= f); a, b = ks[i], ks[min(i + 1, len(ks) - 1)]
    p0 = ks[max(i - 1, 0)]; p3 = ks[min(i + 2, len(ks) - 1)]; s = (f - a) / (b - a)
    def cr(P0, P1, P2, P3):   # Catmull-Rom
        return 0.5 * ((2 * P1) + (-P0 + P2) * s + (2 * P0 - 5 * P1 + 4 * P2 - P3) * s * s + (-P0 + 3 * P1 - 3 * P2 + P3) * s ** 3)
    return tuple(cr(kp[p0][k], kp[a][k], kp[b][k], kp[p3][k]) for k in range(2))
BLADES = []
for i, (nm, Wd, T, serr, tip, tr, clo, chi, keys) in enumerate(BL):
    kp = key_points(keys)
    L = max((t - r).length for r, t in kp.values()) + 1.2   # extra length hidden up in the head
    m = blade_mat(f'bl_{nm}', clo, chi)
    nt = int(0.58 * L / (Wd * 0.095)); nl = max(1000, int(nt * 9 / 0.6))
    o = blade(nm, L, Wd, T, m, serr=serr, tip=tip * 1.0, tipround=tr, teeth=nt, tooth_h=0.065 * Wd, nl=nl,
              t_serr=(0.35, 0.93), bend=0.0, parent=ROOT_)
    BLADES.append(dict(o=o, m=m, kp=kp, L=L, roll=rnd.uniform(-12, 12)))
def pose_blades(f):
    for b in BLADES:
        r, t = interp(b['kp'], f); d = (t - r); dist = d.length; d.normalize()
        root = t - d * b['L']                          # keep the tip where keyed; root goes up into the head
        zax = -d; loc, fwd, right, up = cam_pose(f)
        xax = (right - zax * zax.dot(right)).normalized()   # blade face toward the camera
        xax = Matrix.Rotation(math.radians(b['roll']), 3, zax) @ xax; yax = zax.cross(xax)
        b['o'].matrix_world = Matrix.Translation(root) @ Matrix((xax, yax, zax)).transposed().to_4x4()

# ───────────────────────────── 1.9 s opening: head-on close-up of the face (frames 57-59) + dive (60) ─────────────
# Built as a separate set at x = HX (out of view of the under-shot camera).
HX = 9.0
def build_head_set():
    FM = fly_materials()
    eye = FM['eye']; vr = [x for x in eye.node_tree.nodes if x.type == 'TEX_VORONOI'][0]; vr.inputs['Scale'].default_value = 34
    H = V((HX, 0.2, 2.05))
    hd = ellip('h_cap', tuple(H), (0.95, 0.55, 0.72), belly_m, parent=ROOT_); subsurf(hd, 1)
    for sg in (-1, 1):
        e = ellip(f'h_eye{sg}', tuple(H + V((sg * 0.66, -0.2, 0.18))), (0.6, 0.48, 0.78), eye, rot=(0, math.radians(sg * -12), math.radians(sg * 18)), parent=ROOT_)
    fc = ellip('h_face', tuple(H + V((0, -0.42, -0.2))), (0.38, 0.3, 0.55), leg_m, rot=(math.radians(-12), 0, 0), parent=ROOT_); subsurf(fc, 1)
    ellip('h_frons', tuple(H + V((0, -0.38, 0.45))), (0.22, 0.2, 0.32), leg_m, parent=ROOT_)
    ellip('h_mouth', tuple(H + V((0, -0.5, -0.62))), (0.3, 0.2, 0.16), leg_m, parent=ROOT_)
    for sg in (-1, 1):   # palps hanging either side of the bundle
        a = H + V((sg * 0.2, -0.62, -0.6)); b = H + V((sg * 0.17, -0.82, -1.35))
        pp = bez(a, (a + b) / 2 + V((sg * 0.06, -0.05, 0)), b, 70)
        pr = [0.11 * math.sin(math.pi * min(1, 0.25 + 0.8 * i / 69)) ** 0.8 + 0.006 for i in range(70)]
        o = tube(f'h_palp{sg}', pp, pr, palp_m, nr=36, flat=0.7, parent=ROOT_); subsurf(o, 1)
    for k, (dx, Wd, m) in enumerate(((-0.07, 0.07, BLADES[0]['m']), (-0.02, 0.06, BLADES[1]['m']), (0.025, 0.07, BLADES[4]['m']), (0.07, 0.065, BLADES[5]['m']), (0.0, 0.09, BLADES[2]['m']))):
        o = blade(f'h_bl{k}', 1.0, Wd, 0.01, m, serr=0, tip=0.25, tipround=0.7, nl=300, parent=ROOT_)
        o.location = H + V((dx, -0.66 + 0.02 * (k == 4), -0.45)); o.rotation_euler = (math.radians(-6), math.radians(dx * 40), 0)
    for sg, (k1, k2) in ((-1, (V((-1.9, -0.9, 1.1)), V((-1.6, -1.6, 0.0)))), (1, (V((1.9, -0.9, 1.1)), V((1.6, -1.6, 0.0))))):
        a = H + V((sg * 0.5, 0.2, -0.6)); kn = V((HX, 0, 0)) + k1; f_ = leg(f'h_fem{sg}', a, kn, 0.2, seed=20 + sg)
        ft = V((HX, 0, 0)) + k2; ft.z = skz(ft.x, ft.y) + 0.01
        thin.extend(tibia(f'h_tib{sg}', kn, ft, 0.035)); legs.append(f_)
    HC_ = bpy.data.collections.new('headset'); sc.collection.children.link(HC_)
    for o in sc.objects:
        if o.name.startswith('h_') and o.type == 'MESH': HC_.objects.link(o)
    for nm_, off, pw, sz, col in (('hkey', (-3, -5, 4), 900, 4, (1, .96, .9)), ('hrim', (3, 4, 3), 700, 3, (.8, .93, 1)), ('hfill', (0, -5, -0.5), 250, 5, (1, 1, 1))):
        lo_ = area(sc, nm_, H + V(off), H, pw, sz, col); lo_.light_linking.receiver_collection = HC_
    bpy.context.view_layer.update()
    fur(sc, [o for o in HC_.objects if o.name in ('h_cap', 'h_face', 'h_mouth') or o.name.startswith('h_fem')], 900, 0.14, 0.0028, hairm, sweep=(0, -0.2, -0.8), jitter=0.5, seed=31)
    return H
HEAD = build_head_set() if FS <= 60 else None
def head_cam(f):
    H = HEAD; s = (f - 57) / 3.0
    loc = H + V((0.0, -4.3 + 0.35 * s, -1.6 - 0.05 * s)); tgt = H + V((0, 0, -0.75 - 0.05 * s))
    return loc, (tgt - loc).normalized()

# ───────────────────────────── environment ─────────────────────────────
skin(sc, R=SKIN_R, size=30, hairs=0, seed=5)
for nd in bpy.data.materials['skin'].node_tree.nodes:   # smoother skin at this scale
    if nd.type == 'BUMP': nd.inputs['Strength'].default_value *= 0.15
    if nd.type == 'VALTORGB':
        nd.color_ramp.elements[0].color = lin(192, 104, 60); nd.color_ramp.elements[1].color = lin(218, 128, 78)
# a few big dark skin hairs in the foreground (reference: 2-3 tapered spikes)
hm = mat('skinhair', lin(28, 20, 16), 0.35, **{'Coat Weight': 0.3})
for sx, sy, h, lean in ((0.62, 0.95, 0.075, (-0.02, 0.03)), (0.86, 0.8, 0.07, (-0.01, 0.025))):
    p = W(79, sx, sy); p.z -= 0.005
    cu = bpy.data.curves.new('sh', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0042; cu.bevel_resolution = 3
    sp = cu.splines.new('NURBS'); sp.points.add(4); sp.order_u = 4; sp.use_endpoint_u = True
    for k in range(5):
        u = k / 4; q = p + V((lean[0] * u, lean[1] * u * u, h * u)); sp.points[k].co = (*q, 1); sp.points[k].radius = (1 - u) ** 0.9 + 0.02
    ob = bpy.data.objects.new('skinhair', cu); link(ob); cu.materials.append(hm)

loc0, fwd0, _, _ = cam_pose(79)
cam = camera(sc, loc0, loc0 + fwd0, lens=LENS)
sky(sc, loc0, loc0 + fwd0 * 5 + V((1.2, 0, -0.9)))
_e = [nd for nd in sc.world.node_tree.nodes if nd.type == 'VALTORGB'][0].color_ramp.elements   # smaller, more saturated glow
for _x in _e:
    if _x.position > 0.98 and _x.position < 0.999: _x.color = lin(70, 180, 226)
    if _x.position >= 0.999: _x.color = lin(140, 208, 236)
LT = W(79, 0.5, 0.4, 2.0)
lights(sc, LT, k=0.5)
area(sc, 'top', LT + V((-1.0, -1.5, 4.0)), LT, 140, 2.0, (1, 0.98, 0.95))       # sharp top-edge highlights on the legs
CHIT = bpy.data.collections.new('chitin'); sc.collection.children.link(CHIT)
for o in legs + thin: CHIT.objects.link(o)
for nm_ in ('top', 'under'): pass
area(sc, 'under', LT + V((0.3, 4.0, -0.2)), LT + V((0, 0, 0.3)), 45, 4.0, (0.85, 0.95, 1))  # pale rim on the undersides

for o in sc.objects:
    if o.type == 'LIGHT' and o.name in ('top', 'under'): o.light_linking.receiver_collection = CHIT
bpy.context.view_layer.update()
fur(sc, [l for l in legs if l.name.startswith('femur')], 450, 0.2, 0.0024, hairm, sweep=(0, 0.2, -1.0), jitter=0.5, seed=11)
fur(sc, [l for l in thin if l.name.startswith('tibia') and '_' not in l.name], 900, 0.05, 0.0012, hairm, sweep=(0, 0, -0.6), jitter=0.5, seed=12)
fur(sc, [l for l in thin if '_t' in l.name], 500, 0.025, 0.0008, hairm, sweep=(0, -0.3, -0.3), jitter=0.6, seed=15)
pose_blades(FS)
bhm = mat('bl_hair', lin(105, 52, 18), 0.4)
for bi, b in enumerate(BLADES):   # sparse tiny dark bristles lying along the blade faces
    fur(sc, [b['o']], int(260 * b['L']), 0.0045, 0.00055, bhm, sweep=(0, 0, -1.5), jitter=0.25, seed=40 + bi, parent=b['o'])
fur(sc, [l for l in legs if not l.name.startswith('femur')], 350, 0.16, 0.0024, hairm, sweep=(0, 0.3, -0.7), jitter=0.5, seed=13)

def glow_at(i, f):
    o = {5: 76, 0: 84, 1: 93, 4: 100, 3: 108, 2: 115}[i]   # ~one per 0.25 s; hypo is the yellow one at 3.4 s
    if f < o - 2 or f > o + 7: return 0.0
    if f < o: return (f - (o - 2)) / 2
    if f <= o + 5: return 1.0
    return 1 - (f - (o + 5)) / 2

os.makedirs(OUT, exist_ok=True)
sc.render.resolution_x, sc.render.resolution_y = 1440, 2560; sc.render.resolution_percentage = RES
sc.cycles.samples = SPP
for f in range(FS, FE + 1):
    path = os.path.join(OUT, f'f_{f:04d}.png')
    if os.path.exists(path) and os.path.getsize(path) > 0: continue
    sc.frame_set(f)
    sc.render.use_motion_blur = False
    if f <= 60 and HEAD is not None:
        if f == 60:   # whip: dive down under the head, motion-blurred
            sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 1.0; cam.animation_data_clear()
            for ff, dz, pitch in ((59.5, 0.0, 0.0), (60.0, -0.8, 0.35), (60.5, -1.3, 0.6)):
                l0, d0 = head_cam(59); l0 = l0 + V((0, 0.6 * (ff - 59.5), dz)); d0 = (d0 + V((0, 0, pitch))).normalized()
                cam.location = l0; cam.rotation_euler = d0.to_track_quat('-Z', 'Y').to_euler()
                cam.keyframe_insert('location', frame=ff); cam.keyframe_insert('rotation_euler', frame=ff)
            sc.frame_set(60)
        else:
            l0, d0 = head_cam(f); cam.location = l0; cam.rotation_euler = d0.to_track_quat('-Z', 'Y').to_euler()
    else:
        cam.animation_data_clear()
        loc, fwd, right, up = cam_pose(f); cam.location = loc
        cam.rotation_euler = fwd.to_track_quat('-Z', 'Y').to_euler()
    pose_blades(f)
    for i, b in enumerate(BLADES):
        g = glow_at(i, f); bs = b['m'].node_tree.nodes['Principled BSDF']
        bs.inputs['Emission Strength'].default_value = 2.5 * g
    sc.render.filepath = path; t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print('FRAME', f, 'TIME', round(time.time() - t0, 1), flush=True)
