# Samulation #4 (train) shot renderer.
#   blender -b --python anim.py -- --shot hook --from 0 --to 57 --scale 0.6667 --spp 24 --outdir out/hook
# Pass 0: evaluate every frame (camera, props, physics), keyframe the camera/props (for motion blur) and collect card poses.
# Pass 1: render all character cards for the range (our Canvas2D rig, deduped).  Pass 2: render frames.
import bpy, sys, os, math, json, random, hashlib, subprocess, time
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return argv[argv.index(k) + 1] if k in argv else d
SHOT = arg('--shot', 'hook'); F0 = int(arg('--from', '0')); F1 = int(arg('--to', '10'))
HERE = os.path.dirname(os.path.abspath(__file__)); OUTDIR = os.path.abspath(arg('--outdir', os.path.join(HERE, '..', 'out', SHOT))); os.makedirs(OUTDIR, exist_ok=True)
FPS = 30
# word onsets (s) of the VO at 1.10x
T = {'fire': 0.26, 'gap': 1.62, 'every': 1.82, '39': 2.12, 'feet': 2.72, 'railroad': 3.18, 'This': 4.10, 'did': 4.50, 'but': 5.14, 'why': 6.0,
     'until': 6.76, 'cost': 7.56, 'train1': 8.22, 'You': 9.28, 'desert': 10.12, 'town': 10.44, 'first': 11.7, 'train2': 12.1, 'and': 12.84}
WF = {k: round(v * FPS) for k, v in T.items()}
SHOTS = {'hook': (0, 53), 'glide': (53, 121), 'town': (121, 152), 'smug': (152, 201), 'kink': (201, 276), 'aerial': (276, 386)}

# per-shot world options, then build the world
G = {'__file__': os.path.join(HERE, 'world.py')}
if SHOT == 'kink':
    def KINK(y):
        u = (y - 42.0) / 4.2; return 0.5 * math.exp(-u * u * 0.55) * math.sin(u * 1.35)
    G.update(WELD=True, KINK=KINK, SUN_EL_DEG=17, SUN_COL=(1.0, 0.78, 0.55))
sys.argv = [sys.argv[0], '--', '--tmp', arg('--tmp', '/tmp/train_tmp')]
exec(open(os.path.join(HERE, 'world.py')).read(), G)
exec(open(os.path.join(HERE, 'loco.py')).read(), G)
globals().update({k: v for k, v in G.items() if not k.startswith('__')})
TMPD = os.path.abspath(arg('--tmp', '/tmp/train_tmp')); os.makedirs(TMPD, exist_ok=True)

# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def sstep(x): x = clamp(x); return x * x * (3 - 2 * x)
def eio(x): x = clamp(x); return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2
def lerp(a, b, t): return a + (b - a) * t
def vlerp(a, b, t): return Vector(a).lerp(Vector(b), t)
def pchip(keys, x):
    """monotone cubic through (x, y) keys"""
    xs = [k[0] for k in keys]; ys = [k[1] for k in keys]; n = len(xs)
    if x <= xs[0]: return ys[0] + (ys[1] - ys[0]) / (xs[1] - xs[0]) * (x - xs[0])
    if x >= xs[-1]: return ys[-1] + (ys[-1] - ys[-2]) / (xs[-1] - xs[-2]) * (x - xs[-1])
    d = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(n - 1)]
    m = [d[0]] + [0 if d[i - 1] * d[i] <= 0 else 3 * (xs[i + 1] - xs[i - 1]) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]) for i in range(1, n - 1)] + [d[-1]]
    i = max(j for j in range(n - 1) if xs[j] <= x); h = xs[i + 1] - xs[i]; t = (x - xs[i]) / h
    return (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] + (t ** 3 - 2 * t ** 2 + t) * h * m[i] + (-2 * t ** 3 + 3 * t ** 2) * ys[i + 1] + (t ** 3 - t ** 2) * h * m[i + 1]
def look(pos, tgt, roll=0.0):
    cam.location = Vector(pos); cam.rotation_euler = (Vector(tgt) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler(); cam.rotation_euler.rotate_axis('Z', math.radians(roll))
def shake(f, hits, amp=0.012, k=0.35):
    v = Vector((0, 0, 0))
    for h in hits:
        if f >= h: e = math.exp(-k * (f - h)) * amp; v += Vector((math.sin(f * 2.7 + h) * e, 0, math.cos(f * 3.1 + h) * e))
    return v

# ---------------------------------------------------------------- character cards
HERO_LOOK = {'body': '#2e7a5e', 'sh': '#0f3326'}
FOLKS = {
    'mayor': {'look': {'body': '#efe9dc', 'sh': '#8f8778', 'hair': 'none', 'shoe': '#2a2224'}, 'extras': ['tophat', 'mustache'], 'noChain': True},
    'cow': {'look': {'body': '#b5653a', 'sh': '#4a2412', 'hair': 'none', 'shoe': '#3b2b22'}, 'extras': ['cowboy', 'beard'], 'noChain': True},
    'lady': {'look': {'body': '#d8668a', 'sh': '#5a1a30', 'hair': 'none', 'shoe': '#3b2b22'}, 'extras': ['bonnet'], 'noChain': True},
    'kid': {'look': {'body': '#e8b33a', 'sh': '#6a4a08', 'hair': 'none', 'shoe': '#2e3a66'}, 'extras': ['cap'], 'noChain': True},
    'farmer': {'look': {'body': '#6f8fbf', 'sh': '#1e3050', 'hair': 'none', 'shoe': '#3b2b22'}, 'extras': ['straw'], 'noChain': True},
    'clerk': {'look': {'body': '#8a6fae', 'sh': '#2e1f45', 'hair': 'none', 'shoe': '#2a2224'}, 'extras': ['mustache'], 'noChain': True},
}
class Card:
    def __init__(self, name, base):
        self.name, self.base = name, base
        m = bpy.data.materials.new('card_' + name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); out = nt.nodes.new('ShaderNodeOutputMaterial')
        self.tx = N(nt, 'ShaderNodeTexImage'); self.tx.interpolation = 'Cubic'
        pb = N(nt, 'ShaderNodeBsdfPrincipled', Roughness=1.0); pb.inputs['Specular IOR Level'].default_value = 0.0
        L(nt, self.tx.outputs['Color'], pb.inputs['Base Color']); L(nt, self.tx.outputs['Color'], pb.inputs['Emission Color']); pb.inputs['Emission Strength'].default_value = 0.42
        L(nt, self.tx.outputs['Alpha'], pb.inputs['Alpha']); L(nt, pb.outputs[0], out.inputs['Surface']); m.surface_render_method = 'DITHERED'
        me = bpy.data.meshes.new(name); w = CW * UNIT; bm = bmesh.new()
        vs = [bm.verts.new(v) for v in [(-w / 2, 0, -50 * UNIT), (w / 2, 0, -50 * UNIT), (w / 2, 0, (CH - 50) * UNIT), (-w / 2, 0, (CH - 50) * UNIT)]]
        fc = bm.faces.new(vs); uv = bm.loops.layers.uv.new()
        for l, c in zip(fc.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): l[uv].uv = c
        bm.to_mesh(me); bm.free(); me.materials.append(m); self.obj = link(bpy.data.objects.new(name, me)); self.img = None
    def solve(self, feet, pose):
        """card matrix facing the camera + the pose with world grips converted to design-space arm offsets"""
        feet = Vector(feet); fwd = Vector((cam.location.x - feet.x, cam.location.y - feet.y, 0)).normalized()
        M = Matrix.Translation(feet) @ Matrix.Rotation(math.atan2(fwd.x, -fwd.y), 4, 'Z'); nrm = (M.to_3x3() @ Vector((0, -1, 0))).normalized(); Mi = M.inverted()
        lean = pose.get('lean', 0.0)
        def to_design(wp):
            o = cam.location; d = (Vector(wp) - o).normalized(); t = (feet - o).dot(nrm) / d.dot(nrm); loc = Mi @ (o + d * t)
            x, y = 320 + loc.x / UNIT, 1000 - loc.z / UNIT; c, s = math.cos(-lean), math.sin(-lean)
            return [320 + (x - 320) * c - (y - 1000) * s, 1000 + (x - 320) * s + (y - 1000) * c]
        p = dict(self.base); p.update(pose); shL, shR = (320 - 69.4, 635.9), (320 + 69.4, 635.9)
        if 'gripLw' in p: q = to_design(p.pop('gripLw')); p['armL'] = [round((q[0] - shL[0]) / 1.02, 1), round((q[1] - shL[1]) / 1.02, 1)]; p['gripL'] = True
        if 'gripRw' in p: q = to_design(p.pop('gripRw')); p['armR'] = [round((q[0] - shR[0]) / 1.02, 1), round((q[1] - shR[1]) / 1.02, 1)]; p['gripR'] = True
        p['ak'] = 2; key = hashlib.md5(json.dumps(p, sort_keys=True).encode()).hexdigest()[:14]; p['out'] = os.path.join(TMPD, f'{self.name}_{key}.png')
        return M, p
    def apply(self, M, path):
        self.obj.matrix_world = M
        old = self.img; self.img = bpy.data.images.load(path, check_existing=True); self.tx.image = self.img
        if old and old != self.img and old.users == 0: bpy.data.images.remove(old)

# ---------------------------------------------------------------- props
SPIKE = Vector((-RX + 0.085, 4.25, 0.05))
class Maul:
    def __init__(self):
        self.head = cyl('maulhead', 0.055, 0.46, (0, 0, 0), M_MAUL, None, 14); self.handle = cyl('handle', 0.022, 1.0, (0, 0, 0), M_HANDLE, None, 10)
    def set(self, hands, d, L0):
        d = d.normalized(); headc = hands + d * L0; perp = Vector((-d.z, 0, d.x)).normalized() if abs(d.y) < 0.9 else Vector((1, 0, 0))
        q = Matrix((perp, d.cross(perp), d)).transposed().to_4x4()   # columns: x = perp, y, z = handle dir
        self.head.matrix_world = Matrix.Translation(headc) @ q @ Matrix.Rotation(math.pi / 2, 4, 'Y')
        ln = L0 + 0.14; self.handle.matrix_world = Matrix.Translation(hands + d * (L0 / 2 - 0.07)) @ q @ Matrix.Diagonal((1, 1, ln, 1))
        return headc
class Sparks:
    """ballistic sparks: v0 3-6 m/s into the upper hemisphere, gravity, drawn as streaks along velocity (1/60 s shutter), ~0.3 s life"""
    def __init__(self, n=24, seed=5):
        rs = random.Random(seed); self.p = []
        for i in range(n):
            a = rs.uniform(0, math.tau); el = rs.uniform(0.15, 1.2); sp = rs.uniform(2.6, 5.8)
            v = Vector((math.cos(el) * math.cos(a), math.cos(el) * math.sin(a) * 0.7, math.sin(el))) * sp
            o = cyl('spark', 0.003, 1.0, (0, 0, 0), M_SPARK, None, 5); o.visible_shadow = False; self.p.append((o, v, rs.uniform(0.18, 0.42)))
    def set(self, f, hits, origin):
        live = [h for h in hits if f >= h]; h = live[-1] if live else None
        for (o, v, life) in self.p:
            t = (f - h) / FPS if h is not None else -1
            if h is None or t > life: o.hide_render = True; o.hide_viewport = True; continue
            o.hide_render = False; o.hide_viewport = False
            pos = origin + v * t + Vector((0, 0, -4.9 * t * t)); vel = v + Vector((0, 0, -9.8 * t)); ln = max(0.02, vel.length / 60 * 2.2) * (1 - t / life * 0.6)
            o.matrix_world = Matrix.Translation(pos - vel.normalized() * ln / 2) @ vel.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4() @ Matrix.Diagonal((1, 1, ln, 1))

def chalk_marks():
    M_CHALK = mat('chalk', lambda nt, out: principled(nt, out, color=hexc('#f2efe6'), rough=1.0))
    for k in range(0, 6):
        j = JOINT0 + k * RAIL_LEN
        text('39 FT', (RX + 0.0105, j + 0.62, 0.068), (math.pi / 2, 0, math.pi / 2), 0.042, M_CHALK, sc.collection, depth=0.0005)
        text('39 FT', (-RX - 0.0105, j + 0.62, 0.068), (math.pi / 2, 0, -math.pi / 2), 0.042, M_CHALK, sc.collection, depth=0.0005)

# ---------------------------------------------------------------- shots: frame(f) sets the scene and returns [(card, feet, pose)]
ANIM = [cam]; cards = {}; state = {}
def card(name, base):
    if name not in cards: cards[name] = Card(name, base)
    return cards[name]

def setup_hook():
    state['maul'] = Maul(); state['sparks'] = Sparks(26)
    state['spike'] = box('spikehead', (0.03, 0.022, 0.012), (SPIKE.x, SPIKE.y, 0.05), M_PLATE)
    ANIM.extend([state['maul'].head, state['maul'].handle])
    hl = Vector((-0.12, 4.12, 0.66)); d0 = (SPIKE + Vector((0, -0.02, 0.06))) - hl
    state.update(hl=hl, hh=Vector((0.24, 4.12, 1.2)), phi0=math.atan2(d0.z, d0.x), L0=d0.length)
def frame_hook(f):
    hits = [WF['fire'], WF['gap']]
    # swing angle: 0 = head on the spike, 195 deg = cocked behind the right shoulder
    if f < hits[0]: a = 195 * (1 - (f / hits[0]) ** 2)
    elif f < hits[0] + 4: a = 7 * math.sin((f - hits[0]) / 4 * math.pi)
    elif f < 40: a = 195 * eio((f - hits[0] - 4) / (40 - hits[0] - 4))
    elif f < 44: a = 195
    elif f < hits[1]: a = 195 * (1 - ((f - 44) / (hits[1] - 44)) ** 2)
    else: a = 6 * math.sin(clamp((f - hits[1]) / 4) * math.pi)
    u = a / 195.0; hands = state['hl'].lerp(state['hh'], sstep(u))
    phi = state['phi0'] - math.radians(a); d = Vector((math.cos(phi), 0.15 * (1 - u), math.sin(phi)))
    state['maul'].set(hands, d, state['L0'])
    sink = 0.004 * sum(1 for h in hits if f >= h); state['spike'].location.z = 0.05 - sink
    state['sparks'].set(f, hits, SPIKE + Vector((0, 0, 0.05)))
    p = vlerp((0.62, -0.25, 0.6), (0.46, 0.85, 0.66), sstep(f / 57)) + shake(f, hits); look(p, vlerp((-0.35, 6.0, 0.92), (-0.25, 6.0, 1.0), sstep(f / 57)))
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 4.0; cd.dof.focus_distance = (Vector((0.12, 4.0, 0.9)) - cam.location).length
    mid = d.normalized() * (state['L0'] * (0.28 * (1 - u) + 0.06))
    pose = {'gripLw': hands, 'gripRw': hands + mid, 'mood': 'focus', 'lookAt': [-1, 1], 'turn': -0.35, 'lean': lerp(-0.16, 0.06, sstep(u)),
            'armsFront': True, 'legSwing': 0.5, 'bendL': [-0.4, 1], 'bendR': [0.2, 1], 'look': HERO_LOOK}
    return [(card('hero', {}), (0.12, 4.0, 0.0), pose)]

GLIDE_KEYS = [(53, 4.6), (WF['39'], JOINT0 + RAIL_LEN - 3.0), (WF['feet'], JOINT0 + 2 * RAIL_LEN - 3.0), (WF['railroad'], JOINT0 + 3 * RAIL_LEN - 3.0), (126, JOINT0 + 3 * RAIL_LEN + 9.0)]
def setup_glide(): chalk_marks()
def frame_glide(f):
    y = pchip(GLIDE_KEYS, f); sway = 0.03 * math.sin(f * 0.21)
    look((RX + 0.34 + sway, y, 0.24 + 0.02 * math.sin(f * 0.17)), (RX - 0.2, y + 6.0, 0.02), roll=-3.0)
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8; cd.dof.focus_distance = 3.0
    return []

FOLK_Y = [-2.6, -1.3, 0.0, 1.3, 2.6, 3.9]
def setup_town(): pass
def frame_town(f):
    tt = sstep((f - 121) / 35.0)
    look(vlerp((-0.7, SY - 1.0, 1.25), (0.55, SY - 0.45, 1.3), tt), (PLAT_X + 0.9, SY + 0.2, 1.35))
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 3.2; cd.dof.focus_distance = (Vector((PLAT_X + 0.9, SY, 1.2)) - cam.location).length
    out = []; names = ['cow', 'lady', 'mayor', 'kid', 'farmer', 'clerk']
    jab = sstep((f - (WF['did'] - 3)) / 3.0); over = 1 + 0.25 * math.sin(clamp((f - WF['did']) / 5.0) * math.pi)
    for i, n in enumerate(names):
        pose = {'mood': 'angry', 'lean': 0.03 * math.sin(f * 0.1 + i), 'legSwing': 0.25, 'lookAt': [-0.6, 0.2]}
        if n == 'mayor': pose.update(armR=[lerp(55, 95, jab) * over, lerp(60, -55, jab)], armL=[-45, 70], turn=-0.1, lean=-0.06 * jab)
        else: pose.update(armL=[-38, 85], armR=[38, 85])
        out.append((card(n, FOLKS[n]), (PLAT_X + 0.9 + (0.25 if i % 2 else 0), SY + FOLK_Y[i] - 0.65, PLAT_TOP), pose))
    return out

def setup_smug():
    state['maul'] = Maul(); ANIM.extend([state['maul'].head, state['maul'].handle])
def frame_smug(f):
    hands = Vector((-0.33, 3.98, 0.93)); state['maul'].set(hands, Vector((0, 0, -1)), 0.86)
    tt = sstep((f - 152) / 53.0); look(vlerp((1.0, 0.75, 0.5), (0.72, 1.35, 0.56), tt), vlerp((0.05, 4.0, 0.95), (0.0, 4.0, 1.02), tt))
    # rack focus from the hero to the joint gap right after "why"
    rf = sstep((f - WF['why']) / 8.0); dh = (Vector((0.12, 4.0, 0.9)) - cam.location).length; dg = (Vector((RX, JOINT0, 0.15)) - cam.location).length
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.0; cd.dof.focus_distance = lerp(dh, dg, rf)
    glance = sstep((f - (WF['why'] - 2)) / 4.0)
    pose = {'gripLw': hands, 'gripRw': hands + Vector((0, 0, -0.1)), 'armsFront': True, 'mood': 'smug', 'turn': 0.15, 'lean': -0.05,
            'lookAt': [lerp(0.6, 1.0, glance), lerp(0.0, 1.0, glance)], 'headDx': lerp(0, 8, glance), 'legSwing': 0.35, 'look': HERO_LOOK}
    return [(card('hero', {}), (0.12, 4.0, 0.0), pose)]

def setup_kink():
    root, wheels, rods = build_loco('loco'); root.rotation_euler = (0, 0, math.pi); state.update(loco=root, wheels=wheels, rods=rods, puffs=smoke_puffs(34))
    ANIM.extend([root] + [w for (w, r) in wheels] + [r for (r, s) in rods])
    state['lamp'] = bpy.data.materials['lamp'].node_tree.nodes['Emission']
def loco_y(f): return pchip([(201, 205.0), (230, 120.0), (WF['train1'], 74.0), (280, 66.0)], f)
def frame_kink(f):
    # the gapless rails kick sideways at the start of the shot ("until"), then sit kinked and glowing
    k = sstep((f - 203) / 5.0) * (1 + 0.18 * math.sin(clamp((f - 208) / 8.0) * math.pi))
    for sk in KRAILS: sk.value = k
    for (o, x0, r0, dx, dr) in KTIES: o.location.x = x0 + dx * k; o.rotation_euler.z = r0 + dr * k
    bpy.data.materials['hotrail'].node_tree.nodes['heat'].inputs['Emission Strength'].default_value = 1.6 + 0.4 * math.sin(f * 0.5)
    y = loco_y(f); state['loco'].location = (0, y, 0); loco_update(state['loco'], state['wheels'], state['rods'], 205.0 - y)
    blaze = sstep((f - (WF['train1'] - 6)) / 8.0); state['lamp'].inputs['Strength'].default_value = 25 + 900 * blaze
    stack = Vector((0, y - 4.2, 5.2))
    for i, (o, ph, sx, sz) in enumerate(state['puffs']):
        born = 190 + i * 2.6; age = (f - born) / FPS
        if age < 0: o.hide_render = True; continue
        o.hide_render = False; ypos = loco_y(born); o.location = (sx * 0.4 * age, ypos - 4.2 + age * 2.0, 5.3 + age * 2.6 + sz * 0.3); s = 0.5 + age * 1.6; o.scale = (s, s, s * 0.85)
    tt = sstep((f - 201) / 78.0); p = vlerp((1.0, 30.2, 0.42), (0.55, 32.6, 0.5), tt) + shake(f, [203, 225, 240], 0.008, 0.15)
    look(p, vlerp((-0.2, 50.0, 0.8), (-0.1, 60.0, 1.5), tt), roll=lerp(-2.5, 1.5, tt))
    cd.dof.use_dof = True; cd.dof.aperture_fstop = 5.6; cd.dof.focus_distance = 11.0
    return []

def setup_aerial():
    root, wheels, rods = build_loco('loco', ribbon=True); root.location = (0, SY + 1.5, 0); state.update(loco=root, puffs=smoke_puffs(18, 9))
def frame_aerial(f):
    tt = eio((f - 276) / 112.0)
    p = Vector((pchip([(276, -42), (330, -22), (390, -8.5)], f), pchip([(276, 118), (330, 156), (390, 177.5)], f), pchip([(276, 46), (330, 20), (390, 6.2)], f)))
    look(p, vlerp((6.0, 192.0, 0.0), (2.2, 194.0, 2.4), tt))
    cd.dof.use_dof = False
    for i, (o, ph, sx, sz) in enumerate(state['puffs']):
        age = ((f - 260 + i * 4.0) / FPS) % 3.0; o.location = (sx * 0.3 * age, SY + 1.5 + 4.2 - age * 0.6, 5.3 + age * 1.9); s = 0.35 + age * 0.9; o.scale = (s, s, s * 0.85)
    out = []; names = ['cow', 'lady', 'mayor', 'kid', 'farmer', 'clerk']
    for i, n in enumerate(names):
        pose = {'mood': 'happy', 'legSwing': 0.25, 'armL': [-38, 85], 'armR': [lerp(38, 60, 0.5 + 0.5 * math.sin(f * 0.3 + i)), lerp(85, -60, 0.5 + 0.5 * math.sin(f * 0.3 + i))]}
        out.append((card(n, FOLKS[n]), (PLAT_X + 0.9 + (0.25 if i % 2 else 0), SY + FOLK_Y[i] - 0.65, PLAT_TOP), pose))
    return out

SETUP = {'hook': setup_hook, 'glide': setup_glide, 'town': setup_town, 'smug': setup_smug, 'kink': setup_kink, 'aerial': setup_aerial}
FRAME = {'hook': frame_hook, 'glide': frame_glide, 'town': frame_town, 'smug': frame_smug, 'kink': frame_kink, 'aerial': frame_aerial}
SETUP[SHOT]()

# ---------------------------------------------------------------- render settings (shared look)
sc.render.engine = 'BLENDER_EEVEE_NEXT'; ee = sc.eevee
ee.taa_render_samples = int(arg('--spp', '24')); ee.use_shadows = True; ee.shadow_ray_count = 2; ee.shadow_step_count = 8
ee.use_raytracing = True; ee.ray_tracing_options.resolution_scale = '2'
sc.render.resolution_x, sc.render.resolution_y = 2160, 3840; sc.render.resolution_percentage = int(round(100 * float(arg('--scale', '0.6667'))))
sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = -0.35
sc.render.use_motion_blur = False   # EEVEE Next re-renders shadow maps per blur step (~20x slower on CPU); vector blur in the compositor instead
vl0 = sc.view_layers[0]; vl0.use_pass_vector = True
vl = sc.view_layers[0]; vl.use_pass_mist = True; sc.world.mist_settings.start = 60; sc.world.mist_settings.depth = 1600; sc.world.mist_settings.falloff = 'QUADRATIC'
sc.use_nodes = True; ct = sc.node_tree; ct.nodes.clear()
rl = ct.nodes.new('CompositorNodeRLayers'); comp = ct.nodes.new('CompositorNodeComposite')
mix = ct.nodes.new('CompositorNodeMixRGB'); mix.inputs[2].default_value = (0.55, 0.68, 0.95, 1) if SHOT != 'kink' else (0.95, 0.72, 0.55, 1)
mf = ct.nodes.new('CompositorNodeMath'); mf.operation = 'MULTIPLY'; mf.inputs[1].default_value = 0.32
ct.links.new(rl.outputs['Mist'], mf.inputs[0]); ct.links.new(mf.outputs[0], mix.inputs[0]); ct.links.new(rl.outputs['Image'], mix.inputs[1])
gl = ct.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'MEDIUM'
for k, v in (('threshold', 1.6), ('size', 7)):
    try: setattr(gl, k, v)
    except Exception: pass
for k, v in (('Threshold', 1.6), ('Size', 0.5)):
    if k in gl.inputs: gl.inputs[k].default_value = v
ct.links.new(mix.outputs[0], gl.inputs['Image']); last = gl.outputs[0]
if SHOT in ('glide', 'aerial', 'kink'):   # camera-motion blur from the vector pass (camera + props are keyframed)
    vb = ct.nodes.new('CompositorNodeVecBlur'); vb.samples = 16; vb.factor = 0.6 if SHOT == 'glide' else 0.35
    ct.links.new(last, vb.inputs['Image']); ct.links.new(rl.outputs['Depth'], vb.inputs['Z']); ct.links.new(rl.outputs['Vector'], vb.inputs['Speed']); last = vb.outputs[0]
if SHOT == 'kink':   # flash-forward grade: warm, a touch of contrast
    cb = ct.nodes.new('CompositorNodeColorBalance'); cb.correction_method = 'LIFT_GAMMA_GAIN'; cb.gain = (1.12, 0.98, 0.82); cb.lift = (1.02, 0.98, 0.96)
    ct.links.new(last, cb.inputs['Image']); last = cb.outputs[0]
ct.links.new(last, comp.inputs['Image'])
sc.render.image_settings.file_format = 'PNG'

# ---------------------------------------------------------------- pass 0 + 1: evaluate, keyframe, collect + render cards
t0 = time.time(); plan = {}
for f in range(F0, F1):
    sc.frame_set(f); items = FRAME[SHOT](f); plan[f] = []
    for o in ANIM:
        o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)
        if o.type == 'EMPTY' or o.name.startswith(('maul', 'handle')): o.keyframe_insert('scale', frame=f)
    for (c, feet, pose) in items: M, p = c.solve(feet, pose); plan[f].append((c, M, p))
for o in ANIM:
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
todo = {p['out']: p for f in plan for (c, M, p) in plan[f] if not os.path.exists(p['out'])}
if todo:
    js = os.path.join(TMPD, f'cards_{SHOT}_{F0}.json'); json.dump(list(todo.values()), open(js, 'w'))
    subprocess.run(['node', os.path.join(CARD, 'render_card.mjs'), js], check=True, cwd=CARD, stdout=subprocess.DEVNULL)
print('PREP %.1fs, %d cards' % (time.time() - t0, len(todo)), flush=True)

# ---------------------------------------------------------------- pass 2: render
for f in range(F0, F1):
    out = os.path.join(OUTDIR, 'f%04d.png' % f)
    if os.path.exists(out): continue
    t1 = time.time(); sc.frame_set(f); FRAME[SHOT](f)      # non-keyframed state (cards, sparks, shape keys, materials)
    for (c, M, p) in plan[f]: c.apply(M, p['out'])
    sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    print('FRAME %d %.1fs' % (f, time.time() - t1), flush=True)
print('SHOT_DONE', SHOT, F0, F1)
